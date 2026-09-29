// 版面检查：每个 beat 的检查帧在浏览器里量出文字与图片的外框，判断越界与重叠。
// 把 docs/standards/visual.md 第六节里「安全区」「遮挡」两条换成机器判断，只需要人看被标出的帧
// 用法：node tools/layout.mjs <视频 id> [beat...]；有问题时退出码为 1
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, checkFrame, loadManifest, outDir, pageOf, readJson, requireVideo} from './common.mjs';
import {renderStills} from './stills.mjs';

const [id, ...only] = process.argv.slice(2);
requireVideo(id);
const L = readJson(path.join(ROOT, 'tools/limits.json')).layout;
const m = loadManifest(id);
const pages = pageOf(m.beats);
const beats = only.length ? only : m.beats.map((b) => b.id);
const frames = beats.map((b) => ({frame: checkFrame(m, b), name: b}));

// 页面每帧打一行「[layout] {frame, items}」，同一帧可能先在第 0 帧挂载再跳到目标帧，按帧号取
const measured = new Map();
const onLog = (frame, text) => {
  if (!text.startsWith('[layout] ')) return;
  const r = JSON.parse(text.slice(9));
  if (r.frame === frame) measured.set(frame, r.items);
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
for (const {frame, name} of frames) {
  const items = measured.get(frame);
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
}

fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 1) + '\n');
const byBeat = Map.groupBy(report, (r) => r.beat);
for (const [b, rs] of byBeat) {
  console.log(`p${pages[b] ?? '-'} ${b}（out/${id}/layout/${b}.png）`);
  for (const r of rs) console.log(`  ${r.issue}`);
}
console.log(`版面：${frames.length} 帧，${byBeat.size ? byBeat.size + ' 帧有问题' : '没有问题'}`);
process.exit(byBeat.size ? 1 : 0);
