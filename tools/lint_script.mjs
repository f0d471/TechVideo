// 脚本检查：把 docs/standards/narration.md 里能机器判断的规则落成检查项，数值界限取自 tools/limits.json
// 用法：node tools/lint_script.mjs <视频 id> [--poly-json]；有「错误」时退出码为 1，「提醒」需要逐条看过。
// --poly-json 只输出未登记的多音字 {字: {上下文: [beat]}}，供 vt make 写交片说明、vt accept 登记读音
import path from 'node:path';
import {ROOT, loadScript, readJson, requireVideo} from './common.mjs';

const id = process.argv[2];
const polyJson = process.argv.includes('--poly-json');
requireVideo(id);
const script = loadScript(id);
const lex = readJson(path.join(ROOT, 'tools/lexicon.json'));
const LIMITS = readJson(path.join(ROOT, 'tools/limits.json'));
const SOURCES = readJson(path.join(ROOT, 'curriculum/sources.json'));

// 视频讲通用知识，不讲某个项目：素材仓名与源文件名不进旁白和字幕
const projectNames = [...Object.keys(SOURCES)];
for (const c of [script.code ?? []].flat()) projectNames.push(path.basename(c.path), path.basename(c.path).replace(/\.[^.]+$/, ''));
// 各集叫法统一：概念表里登记的别名给提醒
const ALIASES = readJson(path.join(ROOT, 'curriculum/concepts.json')).flatMap((c) => (c.avoid ?? []).map((a) => [a, c.name]));

// 字幕宽度估计：汉字与全角标点 1 em，其余可见字符 0.6 em，空格 0.35 em；字宽按偏大的算
const {caption: CAP} = LIMITS;
const capWidth = (line) =>
  [...line].reduce((w, ch) => w + (ch === ' ' ? CAP.em.space : /[!-~]/.test(ch) ? CAP.em.ascii : CAP.em.cjk), 0) * CAP.fontPx;
const BREAK_AFTER = /[，。；：、？！,.;:]$/;

// 审片时判为「AI 腔」的句式，字幕和朗读都不许出现
const BANNED = [
  [/不是[^。]*?而是/, '「不是……而是」对比句'],
  [/并不是|并非/, '「并不是」先否定再立论'],
  [/而是/, '「而是」'],
  [/正是|恰恰/, '「正是/恰恰」强调'],
  [/这就是|这便是/, '「这就是」总结句'],
  [/其实|事实上|实际上/, '「其实/事实上」'],
  [/本质上|说白了|换句话说|简单来说|简单地说|一句话说/, '换说法的套话'],
  [/值得注意|需要注意|要注意的是|^注意/, '「值得注意」提示语'],
  [/关键在于|核心在于|秘密在于|奥秘/, '「关键在于」拔高'],
  [/让我们|我们来看|你会发现|不难发现|没错|答案是/, '口播套话'],
  [/——|！/, '破折号或感叹号'],
  // 衔接靠需求本身，说破了就不算衔接（principle.md 第三节之二）
  [/第一性原理|为什么要学|接下来我们(来)?学|下面我们来学/, '说破衔接的字样'],
];

// 制作视角的用语：观众不知道素材仓、仿真和「实现」，也不知道「这个乘法器」是哪一个。
// 做法的主语用情景里的推理芯片、AI 加速器（principle.md 第十一节）。
// 这一集把其中某个词当概念讲时，先登记进 concepts.json，这里就不再报
const CONCEPT_NAMES = readJson(path.join(ROOT, 'curriculum/concepts.json')).map((c) => c.name);
const MAKING = [/RTL/i, /本实现|这个实现|该实现/, /实跑|跑出来/, /仿真/, /素材/, /本课|本集/, /这个乘法器|该乘法器|本乘法器/].filter(
  (re) => !CONCEPT_NAMES.some((n) => re.test(n)),
);

// 防御性限定：为了不说错而加的限定语，会把结论讲成「看情况」。准确性的边界写在 outline.md 的
// 「论断边界」里约束措辞，不进旁白；真正重要的代价单独讲成一个 beat
const HEDGES = /一般来说|一般而言|通常来说|未必|不一定|反倒|反而|是否合算|要用[^，。]{0,8}验证|因情况而异/;

const errors = [];
const warns = [];
const seen = new Set();
const poly = new Map(); // 多音字所在的词 → 出现的 beat

const polyRules = lex.replace.map((r) => [new RegExp(r.pattern, 'g'), r.to]);
const applyLex = (s) => polyRules.reduce((t, [re, to]) => t.replace(re, to), s);
const confirmed = lex.confirmed.map((c) => c.phrase);

for (const b of script.beats) {
  const at = `${b.id}`;
  if (seen.has(b.id)) errors.push(`${at} beat id 重复`);
  seen.add(b.id);
  // id 是段落字母加两位序号：t 片头、p 原理、c 代码
  if (!/^[a-z][0-9]{2}$/.test(b.id)) errors.push(`${at} beat id 要写成一个小写字母加两位序号，例如 p07`);
  if (b.hold !== undefined && (b.hold < LIMITS.hold.min || b.hold > LIMITS.hold.max)) {
    warns.push(`${at} hold ${b.hold} 秒，规定 ${LIMITS.hold.min}–${LIMITS.hold.max} 秒`);
  }
  if (b.silent !== undefined) continue;
  if (!b.say) {
    errors.push(`${at} 没有 say`);
    continue;
  }
  for (const [field, text] of [['say', b.say], ['sub', b.sub]]) {
    if (!text) continue;
    for (const [re, why] of BANNED) if (re.test(text)) errors.push(`${at} ${field} 有${why}：${text}`);
  }
  for (const [field, text] of [['say', b.say], ['sub', b.sub]]) {
    if (!text) continue;
    for (const n of projectNames) if (text.toLowerCase().includes(n.toLowerCase())) errors.push(`${at} ${field} 提到了素材项目或文件名 ${n}`);
    for (const [a, name] of ALIASES) if (text.includes(a)) warns.push(`${at} ${field} 用了「${a}」，标准叫法是「${name}」（curriculum/concepts.json）`);
    for (const re of MAKING) {
      const m = text.match(re);
      if (m) errors.push(`${at} ${field} 有制作视角的用语「${m[0]}」，改成观众看得见的东西，主语用情景里的推理芯片或做法本身：${text}`);
    }
    const h = text.match(HEDGES);
    if (h) warns.push(`${at} ${field} 有防御性限定「${h[0]}」，确认它是这一集要讲的代价而不是免责（narration.md 第三节）：${text}`);
  }
  // 字幕：换行只能由脚本用 \n 写明，而且只放在标点后；每行不超宽，不超过两行
  const cap = b.sub ?? b.say;
  const lines = cap.split('\n');
  if (b.say.includes('\n')) errors.push(`${at} say 里有换行，换行只写在 sub 里`);
  if (lines.length > CAP.maxLines) errors.push(`${at} 字幕 ${lines.length} 行，最多 ${CAP.maxLines} 行，拆成两个 beat`);
  lines.slice(0, -1).forEach((l) => {
    if (!BREAK_AFTER.test(l)) errors.push(`${at} 字幕在「${l.slice(-4)}」后换行，换行只放在标点后`);
  });
  lines.forEach((l, i) => {
    const w = Math.round(capWidth(l));
    if (w > CAP.widthPx) {
      const hint = b.sub ? '在 sub 的标点后加 \\n 换行' : '补一个 sub，在标点后加 \\n 换行';
      errors.push(`${at} 字幕第 ${i + 1} 行估计 ${w} 像素宽，超过 ${CAP.widthPx}，${hint}：${l}`);
    }
  });
  // 朗读文本不许有阿拉伯数字和代码符号，TTS 会乱读
  if (/[0-9]/.test(b.say)) errors.push(`${at} say 里有阿拉伯数字，改成汉字读法：${b.say}`);
  const sym = b.say.match(/[\[\]{}|&<>=_;^~*/\\#$%@+]/g);
  if (sym) errors.push(`${at} say 里有符号 ${[...new Set(sym)].join(' ')}，写成读法：${b.say}`);
  if (/？/.test(b.say)) warns.push(`${at} 设问句，确认不是自问自答的套路：${b.say}`);
  const len = b.say.replace(/[，。：；、？！“”\s]/g, '').length;
  if (len > LIMITS.sentenceChars.max) warns.push(`${at} 一句 ${len} 字，超过 ${LIMITS.sentenceChars.max} 字，考虑拆成两个 beat`);
  // 多音字：替换规则处理过的不算；落在已确认词语里的不算
  const tts = applyLex(b.say);
  const covered = new Array(tts.length).fill(false);
  for (const ph of confirmed) {
    for (let i = tts.indexOf(ph); i >= 0; i = tts.indexOf(ph, i + 1)) for (let k = 0; k < ph.length; k++) covered[i + k] = true;
  }
  [...tts].forEach((ch, i) => {
    if (!lex.polyphones.includes(ch) || covered[i]) return;
    // 按多音字归并，记下它所在的上下文（前后各一字）和 beat
    const ctx = tts.slice(Math.max(0, i - 1), i + 2).replace(/[，。：；、？！“”\s]/g, '');
    if (!poly.has(ch)) poly.set(ch, new Map());
    const byCtx = poly.get(ch);
    if (!byCtx.has(ctx)) byCtx.set(ctx, []);
    byCtx.get(ctx).push(b.id);
  });
}

// 小节之间要有停顿：小节第一句（带 section 字段）的前一句加 hold，让观众听出换了一段
script.beats.forEach((b, i) => {
  if (!b.section || i === 0) return;
  const prev = script.beats[i - 1];
  if (prev.silent !== undefined) return;
  if ((prev.hold ?? 0) < LIMITS.sectionHold.min) {
    warns.push(`${b.id} 是小节「${b.section}」的第一句，前一句 ${prev.id} 的 hold 不到 ${LIMITS.sectionHold.min} 秒，小节之间要停顿（principle.md 第三节之二）`);
  }
});

// 代码段的节奏：简单的行合成一两句讲，平均每行代码不超过 codeBeatsPerLine 个 beat
const codeLines = [script.code ?? []].flat().reduce((n, c) => n + (c.to - c.from + 1), 0);
const codeBeats = script.beats.filter((b) => b.say && b.id.startsWith('c')).length;
if (codeLines && codeBeats / codeLines > LIMITS.codeBeatsPerLine.max) {
  warns.push(`代码段 ${codeBeats} 个 beat 讲 ${codeLines} 行代码，每行 ${(codeBeats / codeLines).toFixed(2)} 个，超过 ${LIMITS.codeBeatsPerLine.max}：简单的行合成一两句（code.md 第一、二节）`);
}

if (polyJson) {
  console.log(JSON.stringify(Object.fromEntries([...poly].map(([ch, byCtx]) => [ch, Object.fromEntries(byCtx)]))));
  process.exit(0);
}

// 多音字提醒按字归并：几十条逐句提醒会被当成噪声整体跳过，归并后一个字一条，逐个上下文听过再登记
// 上下文只列前 6 种，全部列表由 vt make 写进交片说明，审片通过后 vt accept 统一登记
for (const [ch, byCtx] of poly) {
  const list = [...byCtx].slice(0, 6).map(([ctx, ids]) => `${ctx}(${ids.join(' ')})`).join('、');
  const more = byCtx.size > 6 ? ` 等 ${byCtx.size} 种` : '';
  warns.push(`多音字「${ch}」未登记：${list}${more}。不用处理，审片时听`);
}

for (const e of errors) console.log(`错误 ${e}`);
for (const w of warns) console.log(`提醒 ${w}`);
console.log(`${script.beats.length} 个 beat：${errors.length} 个错误，${warns.length} 个提醒`);
process.exit(errors.length ? 1 : 0);
