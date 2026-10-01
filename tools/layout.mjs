// 版面检查：每个 beat 的检查帧在浏览器里量出文字与图片的外框，判断越界与重叠。
// 把 docs/standards/visual.md 第六节里「安全区」「遮挡」两条换成机器判断，只需要人看被标出的帧
// 用法：node tools/layout.mjs <视频 id> [beat...]；有问题时退出码为 1
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, checkFrame, legacyVisual, loadManifest, outDir, pageOf, readJson, requireVideo} from './common.mjs';
import {renderStills} from './stills.mjs';

const [id, ...only] = process.argv.slice(2);
requireVideo(id);
const LIMITS = readJson(path.join(ROOT, 'tools/limits.json'));
const L = LIMITS.layout;
const S = LIMITS.shots;
// 画面元素的三条规则只对 shots.since 之后审片的集生效
const shotRules = !legacyVisual(id);
const m = loadManifest(id);
const pages = pageOf(m.beats);
const beats = only.length ? only : m.beats.map((b) => b.id);
const frames = beats.map((b) => ({frame: checkFrame(m, b), name: b}));

// 页面每帧打一行「[layout] {frame, items}」，同一帧可能先在第 0 帧挂载再跳到目标帧，按帧号取
const measured = new Map();
const onLog = (frame, text) => {
  if (!text.startsWith('[layout] ')) return;
  const r = JSON.parse(text.slice(9));
  if (r.frame === frame) measured.set(frame, r);
};
const dir = path.join(outDir(id), 'layout');
// Remotion 会把页面日志原样转打到终端，一帧一大段 JSON；渲染期间滤掉
const write = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...a) => (String(chunk).includes('[layout] ') ? true : write(chunk, ...a));
await renderStills(id, 0.5, frames, dir, {inputProps: {layoutProbe: true}, onLog});
process.stdout.write = write;

const W = 1920;
const t = L.tolerancePx;
const area = (a) => a.w * a.h;
const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const q = (a) => `「${a.text || '图片'}」`;

const report = [];
const textOnly = [];
const spoken = new Set(m.beats.filter((b) => b.audio).map((b) => b.id));
for (const {frame, name} of frames) {
  const got = measured.get(frame);
  const items = got?.items;
  if (!items) {
    report.push({beat: name, issue: '没有收到版面数据（探针没有运行）'});
    continue;
  }
  for (const a of items) {
    if (a.x < L.side - t) report.push({beat: name, issue: `${q(a)}左边在 x=${Math.round(a.x)}，越过左边距 ${L.side}`});
    if (a.x + a.w > W - L.side + t) report.push({beat: name, issue: `${q(a)}右边在 x=${Math.round(a.x + a.w)}，越过右边距 ${W - L.side}`});
    if (a.y + a.h > L.captionTop + t) report.push({beat: name, issue: `${q(a)}下沿在 y=${Math.round(a.y + a.h)}，进入字幕区（y > ${L.captionTop}）`});
    if (a.y < -t) report.push({beat: name, issue: `${q(a)}越过画面上沿`});
  }
  // 重叠：两段都清楚可见的文字，或文字压在图片上
  const vis = items.filter((a) => a.opacity >= L.minOpacity);
  for (let i = 0; i < vis.length; i++) {
    for (let k = i + 1; k < vis.length; k++) {
      const [a, b] = [vis[i], vis[k]];
      if (a.kind === 'image' && b.kind === 'image') continue;
      const base = a.kind === 'image' ? area(b) : b.kind === 'image' ? area(a) : Math.min(area(a), area(b));
      const r = inter(a, b) / base;
      if (r > L.overlap) report.push({beat: name, issue: `${q(a)}与${q(b)}重叠 ${Math.round(r * 100)}%`});
    }
  }
  if (!shotRules) continue;
  // 标签框：字在框里上下左右居中（visual.md 第七节）
  for (const lb of got.labels ?? []) {
    const [bx, by, bw, bh] = lb.box;
    const [tx, ty, tw, th] = lb.txt;
    const tol = S.labelCenterEm * lb.size;
    if (Math.abs(tx + tw / 2 - (bx + bw / 2)) > tol) report.push({beat: name, issue: `标签框「${lb.text}」的字左右不居中`});
    if (tx < bx || tx + tw > bx + bw) report.push({beat: name, issue: `标签框「${lb.text}」的字超出了框`});
  }
  // 画面元素：有旁白的页至少有一种结构元素；代码面板旁边要有电路
  const kinds = new Set((got.shots ?? []).filter((x) => x.opacity >= L.minOpacity).map((x) => x.shot));
  if (spoken.has(name) && !S.structural.some((k) => kinds.has(k))) textOnly.push(name);
  if (kinds.has('code') && !kinds.has('circuit')) report.push({beat: name, issue: '代码面板旁边没有电路：代码段每一页都要画出这段代码对应的电路（code.md 第六节）'});
}
const nSpoken = frames.filter((x) => spoken.has(x.name)).length;
if (shotRules && nSpoken && textOnly.length / nSpoken > S.textOnlyMax) {
  for (const b of textOnly) report.push({beat: b, issue: `只有散字和标签框，没有位串、数轴、竖式、表格、公式、电路这类结构元素（这类页 ${textOnly.length}/${nSpoken}，上限 ${Math.round(S.textOnlyMax * 100)}%）`});
} else if (textOnly.length) {
  console.log(`提醒 只有散字和标签框的页：${textOnly.map((b) => 'p' + (pages[b] ?? '-')).join('、')}（${textOnly.length}/${nSpoken}，上限 ${Math.round(S.textOnlyMax * 100)}%）`);
}

fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 1) + '\n');
const byBeat = Map.groupBy(report, (r) => r.beat);
for (const [b, rs] of byBeat) {
  console.log(`p${pages[b] ?? '-'} ${b}（out/${id}/layout/${b}.png）`);
  for (const r of rs) console.log(`  ${r.issue}`);
}
console.log(`版面：${frames.length} 帧，${byBeat.size ? byBeat.size + ' 帧有问题' : '没有问题'}`);
process.exit(byBeat.size ? 1 : 0);
