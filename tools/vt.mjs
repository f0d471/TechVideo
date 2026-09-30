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
  table    <id>               生成脚本通读表 build/script.md（可选），并打印脚本指纹
  code     <id>               按 script.json 的 code 数组从素材源码的固定提交逐字抽代码到 build/code.json
  evidence <id>               在素材源码的固定提交上运行 evidence/run.sh，刷新原始日志
  tts      <id>               分句配音 + 时间轴 + 字幕；lint 有错误不配音，完成后检查语速与片长
  asr      <id> [--review]    回听校对；--review 用技术词提示复核首轮低分句
  timing   <id>               静态检查画面代码：引用的 beat 都存在，每个动画在所在 beat 内结束
  check    <id>               lint + 画面代码检查 + timing + 课程登记 + 系列大纲对照，全部通过退出码为 0
  stills   <id> <比例> <beat|帧号>... | --all   抽帧到 out/<id>/check/，并拼四宫格
  page     <id> <页码>...     页码对应的 beat 与时间
  baseline <id>               记录回归基准：每个 beat 两帧的哈希
  regress  <id>               重新渲染回归帧，与基准比对
  layout   <id> [beat...]     版面检查：量出每个 beat 检查帧里文字与图片的外框，报越界与重叠
  render   <id>               整片渲染到 out/<id>/raw.mp4
  master   <id>               响度归一化到 -14 LUFS，出 out/<id>/<id>.mp4 与 .srt，并写 probe.txt
  make     <id> [--from 步骤] 出片一条龙：tts、typecheck、check、layout、render、master、成片检查，写交片说明
  accept   <id>               审片通过：记指纹、登记多音字读音、重做回归基准、阶段改为待发布
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

const today = () => new Date().toLocaleDateString('sv-SE');
const statusPath = (vid) => path.join(videoDir(vid), 'STATUS.md');

// 未登记读音的多音字：{字: {上下文: [beat]}}
const polyphones = (vid) => JSON.parse(execSync(`node tools/lint_script.mjs ${vid} --poly-json`, {cwd: ROOT}).toString());

// STATUS.md 的阶段勾选：把「- [ ] S4」这样的行勾上
const tick = (vid, ...stages) => {
  let s = fs.readFileSync(statusPath(vid), 'utf8');
  for (const st of stages) s = s.replace(new RegExp(`^- \\[ \\] ${st}\\b`, 'm'), `- [x] ${st}`);
  fs.writeFileSync(statusPath(vid), s);
};

// 替换 STATUS.md 里「## 标题」一节的正文（到下一个「## 」为止）
const setSection = (vid, title, body) => {
  const s = fs.readFileSync(statusPath(vid), 'utf8');
  const re = new RegExp(`(^## ${title}\\n)[\\s\\S]*?(?=^## |(?![\\s\\S]))`, 'm');
  if (!re.test(s)) throw new Error(`STATUS.md 里没有「## ${title}」一节`);
  fs.writeFileSync(statusPath(vid), s.replace(re, `$1\n${body.trim()}\n\n`));
};

// 在 STATUS.md 的「## 标题」一节末尾追加一行（表格就追加在表格后面）
const appendToSection = (vid, title, line) => {
  const lines = fs.readFileSync(statusPath(vid), 'utf8').split('\n');
  const start = lines.findIndex((l) => l === `## ${title}`);
  if (start < 0) throw new Error(`STATUS.md 里没有「## ${title}」一节`);
  let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  if (end < 0) end = lines.length;
  while (end > start + 1 && lines[end - 1].trim() === '') end--;
  lines.splice(end, 0, line);
  fs.writeFileSync(statusPath(vid), lines.join('\n'));
};

// 阶段同步到 videos/README.md 的「阶段」列与系列总表的「状态」列
const setStage = (vid, stage) => {
  const idx = path.join(ROOT, 'videos/README.md');
  fs.writeFileSync(
    idx,
    fs.readFileSync(idx, 'utf8').replace(new RegExp(`^(\\| ${vid} \\|[^|]*\\|)[^|]*\\|`, 'm'), `$1 ${stage} |`),
  );
  const cur = path.join(ROOT, 'curriculum');
  for (const f of fs.readdirSync(cur).filter((n) => /^\d+-.*\.md$/.test(n))) {
    const p = path.join(cur, f);
    const s = fs.readFileSync(p, 'utf8');
    const t = s.replace(new RegExp(`^(\\|[^\\n]*\\| \`${vid}\` \\|[^\\n]*\\|)[^|\\n]*\\|$`, 'm'), `$1 ${stage} |`);
    if (t !== s) fs.writeFileSync(p, t);
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
    // 小节第一句前插一行小节名，通读时能看出结构（principle.md 第三节之二）
    const rows = s.beats.flatMap((b) => {
      const head = b.section ? [`|  |  | **【小节】${esc(b.section)}** |  |`] : [];
      if (!b.say) return head;
      return [...head, `| ${pages[b.id]} | ${b.id} | ${esc(b.sub ?? b.say)} | ${b.sub ? esc(b.say) : '同左'} |`];
    });
    const fp = scriptFingerprint(s);
    const md = `# ${s.title} 脚本审阅表\n\n脚本指纹 \`${fp}\`。配音参数：${s.voice}，速率 ${s.rate}。共 ${s.beats.filter((b) => b.say).length} 句，字幕里的 / 是换行位置。\n\n| 页 | beat | 字幕（sub） | 朗读（say） |\n|---|---|---|---|\n${rows.join('\n')}\n`;
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
    // 脚本有错误就不配音；提醒不拦（多音字等审片时听）
    if (!passes(`node tools/lint_script.mjs ${id}`)) throw new Error('vt lint 有错误，改完再配音');
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
    if (rest.length === 1 && rest[0] === '--review') {
      sh(`PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=${PY_ASR} python3 tools/review_audio.py ${id}`);
    } else {
      sh(`PYTHONPATH=${PY_ASR} python3 tools/asr_check.py ${id} ${rest.join(' ')}`);
    }
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
      ['大纲对照', passes(`node tools/check_outline.mjs ${id}`)],
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

  async layout() {
    requireVideo(id);
    if (!passes(`node tools/layout.mjs ${id} ${rest.join(' ')}`)) process.exit(1);
  },

  // 出片一条龙：脚本检查 → 配音（按文本缓存，没改的句子不重合成）→ 类型检查与五项检查 → 版面检查
  // → 渲染 → 母版 → 成片检查 → 交片说明。每步的完整输出进 out/<id>/make.log，终端一步一行
  async make() {
    requireVideo(id);
    fs.mkdirSync(outDir(id), {recursive: true});
    const log = path.join(outDir(id), 'make.log');
    fs.writeFileSync(log, '');
    const step = (name, c) => {
      const t0 = Date.now();
      fs.appendFileSync(log, `\n===== ${name}：${c}\n`);
      const from = fs.statSync(log).size;
      const fd = fs.openSync(log, 'a');
      try {
        execSync(c, {cwd: ROOT, stdio: ['ignore', fd, fd]});
      } catch {
        fs.closeSync(fd);
        // 只打印失败这一步自己的输出末尾
        const tail = fs.readFileSync(log).subarray(from).toString().split('\n').slice(-30).join('\n');
        console.log(`[ ] ${name}\n${tail}\n完整输出：out/${id}/make.log`);
        process.exit(1);
      }
      fs.closeSync(fd);
      console.log(`[x] ${name}（${Math.round((Date.now() - t0) / 1000)} 秒）`);
    };
    // --from <步骤> 从中间接着跑，例如渲染完母版失败时 --from master，不重新渲染
    const steps = [
      ['tts', '配音与时间轴', `node tools/vt.mjs tts ${id}`],
      ['typecheck', '类型检查', 'npm run typecheck'],
      ['check', '五项检查', `node tools/vt.mjs check ${id}`],
      ['layout', '版面检查', `node tools/layout.mjs ${id}`],
      ['render', '渲染', `node tools/vt.mjs render ${id}`],
      ['master', '母版', `node tools/vt.mjs master ${id}`],
    ];
    const from = rest[0] === '--from' ? steps.findIndex(([k]) => k === rest[1]) : 0;
    if (from < 0) throw new Error(`--from 后面写步骤名：${steps.map(([k]) => k).join('、')}`);
    for (const [, name, c] of steps.slice(from)) step(name, c);

    // 成片检查：帧数与时间轴一致、响度 −14 ± 1 LUFS、峰值不高于 −1 dBFS
    const probe = fs.readFileSync(path.join(outDir(id), 'probe.txt'), 'utf8');
    const lufs = parseFloat(probe.match(/I:\s*(-?[\d.]+)\s*LUFS/)?.[1]);
    const peak = parseFloat(probe.match(/Peak:\s*(-?[\d.]+)\s*dBFS/)?.[1]);
    const sha = probe.match(/sha256\s+(\w+)/)?.[1] ?? '';
    const bad = [];
    if (!/时间轴 \d+ 帧，一致/.test(probe)) bad.push('画面帧数与时间轴不一致');
    if (!(Math.abs(lufs + 14) <= 1)) bad.push(`响度 ${lufs} LUFS，不在 −14 ± 1`);
    if (!(peak <= -1)) bad.push(`峰值 ${peak} dBFS，高于 −1`);
    if (bad.length) {
      console.log(`[ ] 成片检查：${bad.join('；')}（out/${id}/probe.txt）`);
      process.exit(1);
    }
    console.log('[x] 成片检查');

    // 交片说明：片长、偏离系列大纲的条目、没登记读音的多音字
    const m = loadManifest(id);
    const sec = m.totalFrames / m.fps;
    const len = `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
    const outline = fs.readFileSync(path.join(videoDir(id), 'outline.md'), 'utf8');
    const dev = (outline.match(/^## 偏离系列大纲\n([\s\S]*?)(?=^## )/m)?.[1] ?? '')
      .split('\n')
      .filter((l) => l.startsWith('- ') && !/^- (无|其余)/.test(l))
      .map((l) => `  ${l.split(/[：。]/)[0]}`);
    const pages = pageOf(m.beats);
    const script = loadScript(id);
    const spoken = m.beats.filter((b) => b.audioSec);
    const cps = spoken.reduce((a, b) => a + b.say.replace(/[，。：；、？！“”\s]/g, '').length / b.audioSec, 0) / spoken.length;
    const poly = Object.entries(polyphones(id)).map(([ch, byCtx]) => {
      const ps = [...new Set(Object.values(byCtx).flat().map((b) => pages[b]))].sort((a, b) => a - b);
      return `${ch}（第 ${ps.slice(0, 6).join('、')}${ps.length > 6 ? ` 等 ${ps.length}` : ''} 页）`;
    });
    setSection(
      id,
      '交片说明',
      [
        `- 片长 ${len}（${m.totalFrames} 帧），${Object.keys(pages).length} 句旁白。`,
        `- 配音：${script.voice}，速率 ${script.rate}，平均 ${cps.toFixed(2)} 字/秒。`,
        dev.length ? `- 偏离系列大纲（详见 outline.md）：\n${dev.join('\n')}` : '- 偏离系列大纲：无。',
        poly.length ? `- 没登记读音的多音字，审片时顺带听：${poly.join('、')}。` : '- 多音字都已登记读音。',
      ].join('\n'),
    );
    appendToSection(id, '验收记录', `- ${today()} vt make：${m.totalFrames} 帧、${sec.toFixed(1)} 秒，${lufs} LUFS、峰值 ${peak} dBFS，成片 sha256 ${sha.slice(0, 8)}…${sha.slice(-4)}。`);
    tick(id, 'S3', 'S4', 'S5', 'S6');
    setStage(id, 'S7 待审片');
    console.log(`成片 out/${id}/${id}.mp4，片长 ${len}；交片说明已写进 videos/${id}/STATUS.md`);
  },

  // 审片通过：记下脚本指纹，把这一集提醒过的多音字登记为已确认读音，重做回归基准，阶段改为待发布
  async accept() {
    requireVideo(id);
    const fp = scriptFingerprint(loadScript(id));
    const status = fs.readFileSync(statusPath(id), 'utf8');
    if (!status.split('\n').some((l) => l.startsWith('|') && l.includes(fp) && l.includes('审片通过'))) {
      appendToSection(id, '审片通过', `| ${today()} | ${fp} | 审片通过 |`);
    }
    const lexPath = path.join(ROOT, 'tools/lexicon.json');
    const lex = readJson(lexPath);
    const have = new Set(lex.confirmed.map((c) => c.phrase));
    const add = [...new Set(Object.values(polyphones(id)).flatMap((byCtx) => Object.keys(byCtx)))].filter((p) => !have.has(p));
    for (const phrase of add) lex.confirmed.push({phrase, basis: `${id} 审片通过，${today()}`});
    // confirmed 一条一行，几十条词语也好翻
    const rows = lex.confirmed.map((c) => `    ${JSON.stringify(c)}`).join(',\n');
    fs.writeFileSync(lexPath, JSON.stringify({...lex, confirmed: '@'}, null, 2).replace('"@"', `[\n${rows}\n  ]`) + '\n');
    tick(id, 'S7');
    setStage(id, 'S8 发布（待上传）');
    console.log(`审片通过：指纹 ${fp}；多音字登记 ${add.length} 个词语；正在重做回归基准`);
    await commands.baseline();
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
