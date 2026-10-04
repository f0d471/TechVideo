import React, {useContext, useEffect, useState} from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, getInputProps, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import 'lxgw-wenkai-webfont/lxgwwenkai-regular.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {C, F, H, W} from './theme';
import {Manifest, ManifestCtx} from './timeline';

// 渲染前把两套字体的全部子集都加载好，否则个别字形会落到后备字体
const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const loads: Promise<FontFace>[] = [];
    document.fonts.forEach((face) => {
      if (/WenKai|JetBrains/.test(face.family)) loads.push(face.load());
    });
    Promise.all(loads)
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle));
  }, [handle]);
  return <>{children}</>;
};

// 字幕：只在该句语音播放期间出现，文本取 manifest 里的 sub。换行位置由脚本用 \n 写明，
// 浏览器不自动折行，避免把一个词断在两行（宽度由 vt lint 按 tools/limits.json 检查）。
// 字幕一次只展示一行：按各行的显示宽度把整句语音等比切分，第 i 行随它对应的那段语音出现，
// 后一行出现时前一行退场（narration.md 第二节）
const Captions: React.FC = () => {
  const M = useContext(ManifestCtx)!;
  const f = useCurrentFrame();
  const b = M.beats.find((x) => x.audio && f >= x.start + (x.audioFrom ?? 0) - 2 && f < x.start + (x.audioFrom ?? 0) + (x.audioFrames ?? 0) + 6);
  if (!b) return null;
  const a0 = b.start + (b.audioFrom ?? 0);
  const o = Math.min(1, (f - a0 + 3) / 4, (a0 + (b.audioFrames ?? 0) + 6 - f) / 4);
  const lines = (b.sub ?? '').split('\n');
  const width = (line: string) => [...line].reduce((n, ch) => n + (/[ -~]/.test(ch) ? 0.6 : 1), 0);
  const total = lines.reduce((n, l) => n + width(l), 0) || 1;
  let acc = 0;
  let idx = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (f < a0 + ((b.audioFrames ?? 0) * (acc + width(lines[i]))) / total) {
      idx = i;
      break;
    }
    acc += width(lines[i]);
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 210,
        right: 210,
        bottom: 46,
        textAlign: 'center',
        fontFamily: F.text,
        fontSize: 40,
        lineHeight: 1.45,
        color: C.ink,
        opacity: Math.max(0, o),
      }}
    >
      <div style={{whiteSpace: 'nowrap'}}>{lines[idx]}</div>
    </div>
  );
};

// 页码：左下角的小号数字，有旁白的 beat 按出现顺序从 1 编号（与 vt table、vt page 一致），
// 审片时用它定位；片头这类无旁白的 beat 不显示
const PageNumber: React.FC = () => {
  const M = useContext(ManifestCtx)!;
  const f = useCurrentFrame();
  let n = 0;
  for (const b of M.beats) {
    if (b.audio) n++;
    if (f >= b.start && f < b.start + b.frames) {
      return b.audio ? (
        <text data-shell x={96} y={1040} fontFamily={F.mono} fontSize={20} fill={C.muted} style={{fontVariantLigatures: 'none'}}>
          {n}
        </text>
      ) : null;
    }
  }
  return null;
};

// 版面探针：只在 vt layout 渲染时挂载（inputProps.layoutProbe），正常渲染不挂载，画面不变。
// 字体就绪后量出画布里每个可见的文字与图片的外框，用 console.log 交给 tools/layout.mjs 判断越界与重叠
const LayoutProbe: React.FC = () => {
  const f = useCurrentFrame();
  useEffect(() => {
    const handle = delayRender(`layout ${f}`);
    document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        const root = document.querySelector('svg[data-canvas]');
        const items: {kind: string; text: string; x: number; y: number; w: number; h: number; opacity: number}[] = [];
        // 不透明度沿祖先相乘，淡出到几乎看不见的不算
        const opacityOf = (el: Element) => {
          let opacity = 1;
          for (let e: Element | null = el; e && e !== root; e = e.parentElement) {
            const cs = getComputedStyle(e);
            opacity = cs.display === 'none' || cs.visibility === 'hidden' ? 0 : opacity * parseFloat(cs.opacity);
          }
          return opacity;
        };
        root?.querySelectorAll('text, foreignObject').forEach((el) => {
          if (el.closest('[data-shell]')) return;
          const opacity = opacityOf(el);
          const r = el.getBoundingClientRect();
          if (opacity < 0.05 || r.width < 1 || r.height < 1) return;
          const text = (el.textContent ?? '').trim().slice(0, 40);
          items.push({kind: el.tagName === 'text' ? 'text' : 'image', text, x: r.x, y: r.y, w: r.width, h: r.height, opacity});
        });
        // 画面元素（位串、数轴、电路……）：组件根节点上的 data-shot
        const shots: {shot: string; opacity: number}[] = [];
        root?.querySelectorAll('[data-shot]').forEach((el) => {
          const opacity = opacityOf(el);
          const r = el.getBoundingClientRect();
          // 顶部公式条（y < 140）每页都在，不算这一页讲解用的元素
          if (r.bottom < 140) return;
          if (opacity >= 0.05 && r.width >= 1 && r.height >= 1) shots.push({shot: el.getAttribute('data-shot') ?? '', opacity});
        });
        // 标签框：框与字的外框，判断字是否居中、框字比例是否一致
        const labels: {text: string; box: number[]; txt: number[]; size: number; opacity: number}[] = [];
        root?.querySelectorAll('[data-label]').forEach((el) => {
          const opacity = opacityOf(el);
          const frame = el.firstElementChild;
          const t = el.querySelector('text');
          if (!frame || !t || opacity < 0.3) return;
          const b = frame.getBoundingClientRect();
          const r = t.getBoundingClientRect();
          const size = parseFloat(t.getAttribute('font-size') ?? '0');
          labels.push({text: (t.textContent ?? '').slice(0, 40), box: [b.x, b.y, b.width, b.height], txt: [r.x, r.y, r.width, r.height], size, opacity});
        });
        console.log(`[layout] ${JSON.stringify({frame: f, items, shots, labels})}`);
        continueRender(handle);
      }),
    );
  }, [f]);
  return null;
};

// 一集视频的外壳：计时上下文、字体、底色、1920×1080 画布、页码、字幕与分句配音
export const VideoShell: React.FC<{manifest: Manifest; children: React.ReactNode}> = ({manifest, children}) => (
  <ManifestCtx.Provider value={manifest}>
    <FontGate>
      <AbsoluteFill style={{backgroundColor: C.ground}}>
        <svg data-canvas width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {children}
          <PageNumber />
        </svg>
        <Captions />
        {getInputProps().layoutProbe ? <LayoutProbe /> : null}
        {manifest.beats
          .filter((b) => b.audio)
          .map((b) => (
            <Sequence key={b.id} from={b.start + (b.audioFrom ?? 0)} durationInFrames={(b.audioFrames ?? 1) + 3} layout="none">
              <Audio src={staticFile(b.audio!)} />
            </Sequence>
          ))}
      </AbsoluteFill>
    </FontGate>
  </ManifestCtx.Provider>
);

export type VideoDef = {id: string; manifest: Manifest; Component: React.FC};

// 每集的 Video.tsx 用它导出自己，videos/registry.ts 收集后由 Root 注册成 Composition
export const defineVideo = (id: string, manifest: Manifest, Scenes: React.FC): VideoDef => ({
  id,
  manifest,
  Component: () => (
    <VideoShell manifest={manifest}>
      <Scenes />
    </VideoShell>
  ),
});
