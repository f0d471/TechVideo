import React, {useMemo} from 'react';
import rough from 'roughjs';
import {C} from './theme';

// 手绘图元。随机种子由几何参数决定，同一图元在每一帧都长得一样，不会抖。
const gen = rough.generator();

type Common = {
  stroke?: string;
  sw?: number;
  fill?: string;
  roughness?: number;
  draw?: number; // 描线进度 0..1
  opacity?: number;
  seed?: number;
  dash?: boolean;
};

const seedOf = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (Math.abs(h) % 2 ** 30) + 1;
};

type PathInfo = {d: string; stroke: string; strokeWidth: number; fill?: string};

const Paths: React.FC<{paths: PathInfo[]; draw: number; opacity: number; dash?: boolean}> = ({
  paths,
  draw,
  opacity,
  dash,
}) => {
  if (draw <= 0 || opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {paths.map((p, i) => {
        const isFill = p.fill && p.fill !== 'none';
        if (isFill) {
          return <path key={i} d={p.d} fill={p.fill} stroke="none" opacity={Math.min(1, draw * 1.4)} />;
        }
        const partial = draw < 1;
        return (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={p.stroke}
            strokeWidth={p.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={partial ? 1 : undefined}
            strokeDasharray={partial ? `${draw} 1` : dash ? '10 9' : undefined}
          />
        );
      })}
    </g>
  );
};

const opts = (c: Common, key: string) => ({
  stroke: c.stroke ?? C.ink,
  strokeWidth: c.sw ?? 2.4,
  roughness: c.roughness ?? 0.9,
  bowing: 0.8,
  seed: c.seed ?? seedOf(key),
  fill: c.fill,
  fillStyle: 'solid' as const,
  preserveVertices: true,
});

export const RRect: React.FC<Common & {x: number; y: number; w: number; h: number}> = (c) => {
  const key = `r${c.x},${c.y},${c.w},${c.h},${c.stroke},${c.fill},${c.sw},${c.roughness}`;
  const paths = useMemo(
    () => gen.toPaths(gen.rectangle(c.x, c.y, c.w, c.h, opts(c, key))) as PathInfo[],
    [key],
  );
  return <Paths paths={paths} draw={c.draw ?? 1} opacity={c.opacity ?? 1} dash={c.dash} />;
};

export const RLine: React.FC<Common & {x1: number; y1: number; x2: number; y2: number}> = (c) => {
  const key = `l${c.x1},${c.y1},${c.x2},${c.y2},${c.stroke},${c.sw},${c.roughness}`;
  const paths = useMemo(
    () => gen.toPaths(gen.line(c.x1, c.y1, c.x2, c.y2, opts(c, key))) as PathInfo[],
    [key],
  );
  return <Paths paths={paths} draw={c.draw ?? 1} opacity={c.opacity ?? 1} dash={c.dash} />;
};

export const RPath: React.FC<Common & {d: string}> = (c) => {
  const key = `p${c.d},${c.stroke},${c.fill},${c.sw},${c.roughness}`;
  const paths = useMemo(() => gen.toPaths(gen.path(c.d, opts(c, key))) as PathInfo[], [key]);
  return <Paths paths={paths} draw={c.draw ?? 1} opacity={c.opacity ?? 1} dash={c.dash} />;
};

export const REllipse: React.FC<Common & {cx: number; cy: number; w: number; h: number}> = (c) => {
  const key = `e${c.cx},${c.cy},${c.w},${c.h},${c.stroke},${c.fill},${c.sw}`;
  const paths = useMemo(
    () => gen.toPaths(gen.ellipse(c.cx, c.cy, c.w, c.h, opts(c, key))) as PathInfo[],
    [key],
  );
  return <Paths paths={paths} draw={c.draw ?? 1} opacity={c.opacity ?? 1} dash={c.dash} />;
};

// 带箭头的弧线：从 (x1,y1) 到 (x2,y2)，lift 为弧高（负数向上拱）
export const RArrow: React.FC<
  Common & {x1: number; y1: number; x2: number; y2: number; lift?: number; head?: number}
> = (c) => {
  const lift = c.lift ?? 0;
  const mx = (c.x1 + c.x2) / 2;
  const my = (c.y1 + c.y2) / 2 + lift;
  const d = lift === 0 ? `M${c.x1} ${c.y1} L${c.x2} ${c.y2}` : `M${c.x1} ${c.y1} Q${mx} ${my} ${c.x2} ${c.y2}`;
  // 箭头方向取终点切线
  const tx = lift === 0 ? c.x2 - c.x1 : c.x2 - mx;
  const ty = lift === 0 ? c.y2 - c.y1 : c.y2 - my;
  const len = Math.hypot(tx, ty) || 1;
  const ux = tx / len;
  const uy = ty / len;
  const hl = c.head ?? 16;
  const hx1 = c.x2 - hl * (ux * 0.87 - uy * 0.5);
  const hy1 = c.y2 - hl * (uy * 0.87 + ux * 0.5);
  const hx2 = c.x2 - hl * (ux * 0.87 + uy * 0.5);
  const hy2 = c.y2 - hl * (uy * 0.87 - ux * 0.5);
  const draw = c.draw ?? 1;
  const headDraw = Math.max(0, (draw - 0.75) / 0.25);
  return (
    <g>
      <RPath {...c} d={d} draw={Math.min(1, draw / 0.8)} />
      <RPath {...c} dash={false} d={`M${hx1} ${hy1} L${c.x2} ${c.y2} L${hx2} ${hy2}`} draw={headDraw} />
    </g>
  );
};
