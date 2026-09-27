// 视频工具的统一入口。用法：node tools/vt.mjs <命令> <视频 id> [参数]
// 每个命令对应 docs/sop.md 里的一步；命令表见 help
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {
  ROOT,
  PY_ASR,
  PY_TTS,
  buildDir,
  checkFrame,
  chromeVersion,
  loadManifest,
  loadScript,
  outDir,
  pageOf,
  readJson,
  regressionFrames,
  requireVideo,
  scriptFingerprint,
  sh,
  shOut,
  toShellPath,
  videoDir,
} from './common.mjs';

const [cmd, id, ...rest] = process.argv.slice(2);
const LIMITS = readJson(path.join(ROOT, 'tools/limits.json'));

const HELP = `node tools/vt.mjs <命令> <视频 id> [参数]

  new      <id> <标题>        从 videos/_template 建一集，并登记到 registry.ts 与 videos/README.md
  lint     <id>               检查脚本：禁用句式、say 里的数字与符号、多音字、句长、字幕换行、项目名
  table    <id>               生成脚本审阅表 build/script.md，并打印脚本指纹
  code     <id>               按 script.json 的 code 数组从素材源码的固定提交逐字抽代码到 build/code.json
  evidence <id>               在素材源码的固定提交上运行 evidence/run.sh，刷新原始日志
  tts      <id>               分句配音 + 时间轴 + 字幕；先核对 STATUS.md 里的审阅指纹，完成后检查语速与片长
  asr      <id>               回听校对，拼音层比对
  timing   <id>               静态检查画面代码：引用的 beat 都存在，每个动画在所在 beat 内结束
  check    <id>               lint + 画面代码检查 + timing + 课程登记检查，全部通过退出码为 0
  stills   <id> <比例> <beat|帧号>... | --all   抽帧到 out/<id>/check/，并拼四宫格
  page     <id> <页码>...     页码对应的 beat 与时间
  baseline <id>               记录回归基准：每个 beat 两帧的哈希
  regress  <id>               重新渲染回归帧，与基准比对
  render   <id>               整片渲染到 out/<id>/raw.mp4
  master   <id>               响度归一化到 -14 LUFS，出 out/<id>/<id>.mp4 与 .srt，并写 probe.txt
  curriculum                  检查 curriculum/ 的系列总表、概念表、词汇表与素材登记
`;

const run = (c) => execSync(c, {stdio: 'inherit', cwd: ROOT});
// 子检查的退出码不为 0 时不抛错，返回是否通过
const passes = (c) => {
  try {
    run(c);
    return true;
  } catch {
    return false;
  }
};

const timing = (vid) => {
  const m = loadManifest(vid);
  const frames = Object.fromEntries(m.beats.map((b) => [b.id, b.frames]));
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory() && !['audio', 'build', 'evidence'].includes(e.name)) walk(p);
      else if (/\.tsx?$/.test(e.name)) files.push(p);
    }
  };
  walk(videoDir(vid));
  const problems = new Set();
  // 只认字面量写法 p('beat', 延迟, 时长)、span('a', 'b')，这是本仓库画面代码的约定
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file);
    for (const x of src.matchAll(/\bp\('([\w-]+)'(?:,\s*(\d+))?(?:,\s*(\d+))?\)/g)) {
      const [, b, d = '0', l = '18'] = x;
      if (!(b in frames)) problems.add(`${rel}: 引用了不存在的 beat ${b}`);
      else if (+d + +l > frames[b]) problems.add(`${rel}: p('${b}', ${d}, ${l}) 在第 ${+d + +l} 帧结束，超出该 beat 的 ${frames[b]} 帧`);
    }
    for (const x of src.matchAll(/\b(?:span|s|end)\('([\w-]+)'(?:,\s*'([\w-]+)')?/g)) {
      for (const b of [x[1], x[2]].filter(Boolean)) if (!(b in frames)) problems.add(`${rel}: 引用了不存在的 beat ${b}`);
    }
  }
  for (const p of problems) console.log(p);
  console.log(`timing：${files.length} 个文件，${problems.size ? problems.size + ' 个问题' : '没有问题'}`);
  return problems.size === 0;
};

const commands = {
  async new() {
    const title = rest.join(' ');
    if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('id 只能用小写字母、数字和连字符，例如 fp32-normalize');
    if (!title) throw new Error('缺标题：node tools/vt.mjs new <id> <标题>');
    const dst = videoDir(id);
    if (fs.existsSync(dst)) throw new Error(`videos/${id} 已存在`);
    fs.cpSync(path.join(ROOT, 'videos/_template'), dst, {recursive: true});
    for (const f of ['script.json', 'STATUS.md', 'outline.md', 'Video.tsx']) {
      const p = path.join(dst, f);
      fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('__ID__', id).replaceAll('__TITLE__', title));
    }
    // 注册表：加 import 与数组项
    const reg = path.join(ROOT, 'videos/registry.ts');
    const ident = id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/^[0-9]/, (c) => `v${c}`);
    let r = fs.readFileSync(reg, 'utf8');
    r = r.replace(/\nexport const videos/, `import ${ident} from './${id}/Video';\n\nexport const videos`);
    r = r.replace(/\];\s*$/, `, ${ident}];\n`).replace('[, ', '[');
    fs.writeFileSync(reg, r);
    // 索引
    const idx = path.join(ROOT, 'videos/README.md');
    fs.appendFileSync(idx, `| ${id} | ${title} | S0 立项 | [STATUS](${id}/STATUS.md) |\n`);
    // 空时间轴，让 Remotion 在配音之前也能打开这一集
    fs.mkdirSync(path.join(dst, 'build'), {recursive: true});
    const beats = [{id: 't00', start: 0, frames: 66}, {id: 'p01', start: 66, frames: 90, sub: '（配音前的占位时间轴）'}];
    fs.writeFileSync(path.join(dst, 'build/manifest.json'), JSON.stringify({id, fps: 30, totalFrames: 156, beats}, null, 1) + '\n');
    console.log(`已建 videos/${id}，下一步按 curriculum/ 里这一集的条目写 outline.md（docs/sop.md S1）`);
  },

  async lint() {
    requireVideo(id);
    if (!passes(`node tools/lint_script.mjs ${id}`)) process.exit(1);
  },

  async table() {
    requireVideo(id);
    const s = loadScript(id);
    const pages = pageOf(s.beats);
    const esc = (t) => t.replace(/\|/g, '\\|').replace(/\n/g, ' / ');
    const rows = s.beats
      .filter((b) => b.say)
      .map((b) => `| ${pages[b.id]} | ${b.id} | ${esc(b.sub ?? b.say)} | ${b.sub ? esc(b.say) : '同左'} |`);
    const fp = scriptFingerprint(s);
    const md = `# ${s.title} 脚本审阅表\n\n脚本指纹 \`${fp}\`。配音参数：${s.voice}，速率 ${s.rate}。共 ${rows.length} 句，字幕里的 / 是换行位置。\n\n| 页 | beat | 字幕（sub） | 朗读（say） |\n|---|---|---|---|\n${rows.join('\n')}\n`;
    fs.mkdirSync(buildDir(id), {recursive: true});
    fs.writeFileSync(path.join(buildDir(id), 'script.md'), md);
    console.log(`videos/${id}/build/script.md，脚本指纹 ${fp}`);
  },

  async code() {
    requireVideo(id);
    run(`node tools/extract_code.mjs ${id}`);
  },

  async evidence() {
    requireVideo(id);
    const runSh = path.join(videoDir(id), 'evidence/run.sh');
    if (!fs.existsSync(runSh)) throw new Error(`videos/${id}/evidence/run.sh 不存在`);
    // 每个素材仓的固定提交解成快照目录，以 SRC_<名字大写> 传给 run.sh
    const {SOURCES, sourceSnapshot} = await import('./sources.mjs');
    const vars = Object.keys(SOURCES)
      .map((n) => `SRC_${n.toUpperCase().replace(/[^A-Z0-9]/g, '_')}='${toShellPath(sourceSnapshot(n))}'`)
      .join(' ');
    sh(`${vars} bash videos/${id}/evidence/run.sh`);
  },

  async tts() {
    requireVideo(id);
    const fp = scriptFingerprint(loadScript(id));
    const status = fs.readFileSync(path.join(videoDir(id), 'STATUS.md'), 'utf8');
    if (!status.includes(fp)) {
      throw new Error(`STATUS.md 的「脚本审阅」里没有当前脚本指纹 ${fp}。先 vt lint、vt table，审阅表审过后把指纹记进 STATUS.md 再配音`);
    }
    sh(`PYTHONPATH=${PY_TTS} python3 tools/build_audio.py ${id}`);
    const m = loadManifest(id);
    const spoken = m.beats.filter((b) => b.audioSec);
    const rate = spoken.reduce((a, b) => a + b.say.replace(/[，。：；、？！“”\s]/g, '').length / b.audioSec, 0) / spoken.length;
    const sec = m.totalFrames / m.fps;
    const {speechRate: r, duration: d} = LIMITS;
    const bad = [];
    if (rate < r.min || rate > r.max) bad.push(`语速 ${rate.toFixed(2)} 字/秒，规定 ${r.min}–${r.max}，调整 script.json 的 rate`);
    if (sec < d.min || sec > d.max) bad.push(`片长 ${sec.toFixed(1)} 秒，规定 ${d.min}–${d.max} 秒，考虑拆集或并集`);
    for (const b of bad) console.log(`超出区间：${b}`);
    if (bad.length) process.exit(1);
  },

  async asr() {
    requireVideo(id);
    sh(`PYTHONPATH=${PY_ASR} python3 tools/asr_check.py ${id} ${rest.join(' ')}`);
  },

  async timing() {
    requireVideo(id);
    if (!timing(id)) process.exit(1);
  },

  async check() {
    requireVideo(id);
    const results = [
      ['lint', passes(`node tools/lint_script.mjs ${id}`)],
      ['画面代码', passes(`node tools/lint_scenes.mjs ${id}`)],
      ['timing', timing(id)],
      ['课程登记', passes('node tools/check_curriculum.mjs')],
    ];
    console.log(results.map(([n, ok]) => `${n} ${ok ? '[x]' : '[ ]'}`).join('  '));
    if (results.some(([, ok]) => !ok)) process.exit(1);
  },

  async stills() {
    requireVideo(id);
    const [scale, ...targets] = rest;
    const m = loadManifest(id);
    const list = targets[0] === '--all' ? m.beats.map((b) => b.id) : targets;
    if (!scale || list.length === 0) throw new Error('用法：stills <id> <比例> <beat|帧号>... 或 --all');
    const frames = list.map((t) => ({frame: /^\d+$/.test(t) ? +t : checkFrame(m, t), name: t}));
    const dir = path.join(outDir(id), 'check');
    const {renderStills} = await import('./stills.mjs');
    await renderStills(id, +scale, frames, dir);
    // 四张一组拼成四宫格，便于一次看四帧
    const names = frames.map((x) => x.name);
    for (let i = 0; i < names.length; i += 4) {
      const g = names.slice(i, i + 4);
      while (g.length < 4) g.push(g[g.length - 1]);
      const inputs = g.map((n) => `-i ${n}.png`).join(' ');
      sh(
        `cd out/${id}/check && ffmpeg -y -loglevel error ${inputs} -filter_complex '[0][1][2][3]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0' sheet-${String(i / 4 + 1).padStart(2, '0')}.png`,
      );
    }
    console.log(`out/${id}/check/：${names.length} 帧，${Math.ceil(names.length / 4)} 张四宫格 sheet-*.png`);
  },

  async page() {
    requireVideo(id);
    const m = loadManifest(id);
    const pages = pageOf(m.beats);
    const byPage = Object.fromEntries(Object.entries(pages).map(([b, n]) => [n, b]));
    const t = (f) => `${Math.floor(f / m.fps / 60)}:${String(Math.floor(f / m.fps) % 60).padStart(2, '0')}`;
    for (const n of rest) {
      const b = m.beats.find((x) => x.id === byPage[n]);
      console.log(b ? `第 ${n} 页 = ${b.id}，${t(b.start)}–${t(b.start + b.frames)}：${b.sub}` : `第 ${n} 页不存在（共 ${Object.keys(pages).length} 页）`);
    }
  },

  async baseline() {
    requireVideo(id);
    const m = loadManifest(id);
    const frames = regressionFrames(m).map((f) => ({frame: f, name: String(f)}));
    const dir = path.join(outDir(id), 'baseline');
    fs.rmSync(dir, {recursive: true, force: true});
    const {renderStills} = await import('./stills.mjs');
    const hashes = await renderStills(id, 0.5, frames, dir);
    fs.writeFileSync(path.join(dir, 'hashes.json'), JSON.stringify({chrome: chromeVersion(), totalFrames: m.totalFrames, hashes}, null, 1));
    console.log(`基准：${frames.length} 帧，out/${id}/baseline/hashes.json`);
  },

  async regress() {
    requireVideo(id);
    const basePath = path.join(outDir(id), 'baseline/hashes.json');
    if (!fs.existsSync(basePath)) throw new Error('没有基准，先跑 baseline');
    const base = readJson(basePath);
    const m = loadManifest(id);
    if (m.totalFrames !== base.totalFrames) throw new Error(`时间轴变了（${base.totalFrames} → ${m.totalFrames} 帧），基准已失效，确认画面后重跑 baseline`);
    const cv = chromeVersion();
    if (base.chrome && base.chrome !== cv) console.log(`注意：基准用的 Chrome ${base.chrome}，现在是 ${cv}，差异可能来自浏览器升级`);
    const frames = Object.keys(base.hashes).map((n) => ({frame: +n, name: n}));
    const dir = path.join(outDir(id), 'regress');
    fs.rmSync(dir, {recursive: true, force: true});
    const {renderStills} = await import('./stills.mjs');
    const hashes = await renderStills(id, 0.5, frames, dir);
    // 哈希不同的帧再算 PSNR：Chrome 在同一浏览器里连续出图时有亚像素级抖动（实测 95–99 dB），
    // 60 dB 以上视为同一画面，低于 60 dB 才是画面真的变了
    const diff = Object.keys(base.hashes).filter((n) => base.hashes[n] !== hashes[n]);
    const changed = [];
    for (const n of diff) {
      const out = shOut(`cd out/${id} && ffmpeg -hide_banner -i baseline/${n}.png -i regress/${n}.png -lavfi psnr -f null - 2>&1 | grep -oE 'average:[a-z0-9.]+'`);
      const v = out.includes('inf') ? Infinity : parseFloat(out.split(':')[1]);
      if (!(v >= 60)) changed.push(`${n}(${v.toFixed(1)} dB)`);
    }
    const same = frames.length - diff.length;
    console.log(`${frames.length} 帧：${same} 帧逐字节相同，${diff.length - changed.length} 帧亚像素抖动（PSNR ≥ 60 dB）`);
    if (changed.length) {
      console.log(`画面变了的帧：${changed.join(' ')}（新图 out/${id}/regress/，旧图 out/${id}/baseline/）`);
      process.exit(1);
    }
  },

  async render() {
    requireVideo(id);
    fs.mkdirSync(outDir(id), {recursive: true});
    run(`npx remotion render ${id} out/${id}/raw.mp4 --crf=23`);
  },

  async master() {
    requireVideo(id);
    sh(`bash tools/master.sh ${id}`);
  },

  async curriculum() {
    if (!passes('node tools/check_curriculum.mjs')) process.exit(1);
  },
};

const main = async () => {
  if (!cmd || !commands[cmd]) {
    console.log(HELP);
    process.exit(cmd ? 1 : 0);
  }
  await commands[cmd]();
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
