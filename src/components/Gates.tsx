import React from 'react';
import {C, F} from '../core/theme';
import {RPath, RRect} from '../core/rough';
import {Txt} from './Prims';

// 逻辑门与电路小件。门的形状是路径字符串，交给 RPath 画成手绘线

// 与门：左边直、右边半圆，宽 80 高 100
export const andPath = (x: number, y: number) => `M${x} ${y} L${x + 30} ${y} A50 50 0 0 1 ${x + 30} ${y + 100} L${x} ${y + 100} Z`;

// 或门：盾形，宽 w 高 h
export const orPath = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y} Q${x + w * 0.6} ${y} ${x + w} ${y + h / 2} Q${x + w * 0.6} ${y + h} ${x} ${y + h} Q${x + w * 0.28} ${y + h / 2} ${x} ${y} Z`;

// 导线：手绘折线
export const Wire: React.FC<{d: string; stroke: string; draw: number; sw?: number}> = ({d, stroke, draw, sw = 2.6}) => (
  <RPath d={d} stroke={stroke} sw={sw} roughness={0.5} draw={draw} />
);

// 信号值：导线上的 0/1 圆标，1 用强调色
export const Val: React.FC<{x: number; y: number; v: 0 | 1; o: number}> = ({x, y, v, o}) =>
  o > 0 ? (
    <g opacity={o}>
      <circle cx={x} cy={y} r={17} fill={v ? C.clay : C.paper} stroke={v ? C.clay : C.muted} strokeWidth={2} />
      <text x={x} y={y + 8} textAnchor="middle" fontFamily={F.mono} fontSize={22} fontWeight={700} fill={v ? C.paper : C.muted}>
        {v}
      </text>
    </g>
  ) : null;

// 信号源：一个带标签的小格子，例如 [22]
export const Src: React.FC<{x?: number; y: number; w: number; label: string; fill: string; stroke: string; draw: number}> = ({
  x = 960,
  y,
  w,
  label,
  fill,
  stroke,
  draw,
}) => (
  <g>
    <RRect x={x} y={y - 20} w={w} h={40} stroke={stroke} fill={fill} sw={2} draw={draw} />
    <Txt x={x + w / 2} y={y + 7} anchor="middle" size={19} mono opacity={Math.max(0, draw * 2 - 1)}>
      {label}
    </Txt>
  </g>
);

// 电路：一张结构图外面套一层 Circuit，vt layout 据此认出画面上有电路（docs/standards/visual.md 第七节）
export const Circuit: React.FC<{children: React.ReactNode; opacity?: number}> = ({children, opacity = 1}) =>
  opacity > 0 ? (
    <g opacity={opacity} data-shot="circuit">
      {children}
    </g>
  ) : null;

// 异或门：或门前面再加一道弧线，宽 w 高 h
export const xorPath = (x: number, y: number, w: number, h: number) =>
  `${orPath(x + 14, y, w - 14, h)} M${x} ${y} Q${x + (w - 14) * 0.28} ${y + h / 2} ${x} ${y + h}`;

// 二选一选择器：左边高、右边矮的梯形，宽 w 高 h
export const muxPath = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y} L${x + w} ${y + h * 0.2} L${x + w} ${y + h * 0.8} L${x} ${y + h} Z`;

// 门的外形与端口。导线的端点取这里的坐标，不另估
export type GateKind = 'and' | 'or' | 'xor' | 'mux';
export const gate = (kind: GateKind, x: number, y: number, w = kind === 'and' ? 80 : 90, h = 100) => {
  const d = kind === 'and' ? andPath(x, y) : kind === 'or' ? orPath(x, y, w, h) : kind === 'xor' ? xorPath(x, y, w, h) : muxPath(x, y, w, h);
  // 或门、异或门的后沿是弧线，输入端落在弧线上
  const back = kind === 'or' ? w * 0.12 : kind === 'xor' ? (w - 14) * 0.12 : 0;
  return {
    d,
    in1: {x: x + back, y: y + h * 0.3},
    in2: {x: x + back, y: y + h * 0.7},
    out: {x: x + w, y: y + h / 2},
    sel: {x: x + w / 2, y: y + h * 0.9},
    // 选择器的选择端也可以从上沿接入
    selTop: {x: x + w / 2, y: y + h * 0.1},
    cx: x + w / 2,
    cy: y + h / 2,
  };
};

// 画一个门：外形加中间的名字（与、或、异或）
export const Gate: React.FC<{kind: GateKind; x: number; y: number; w?: number; h?: number; label?: string; draw: number; stroke?: string}> = ({
  kind,
  x,
  y,
  w,
  h,
  label,
  draw,
  stroke = C.ink,
}) => {
  const g = gate(kind, x, y, w, h);
  return (
    <g>
      <RPath d={g.d} stroke={stroke} fill={C.paper} sw={2.4} roughness={0.6} draw={draw} />
      {label && (
        <Txt x={g.cx + (kind === 'and' ? -4 : 4)} y={g.cy + 9} anchor="middle" size={24} opacity={Math.max(0, draw * 2 - 1)}>
          {label}
        </Txt>
      )}
    </g>
  );
};

// 运算单元：圆圈里一个运算符（加法器 +、乘法器 ×、减法 −、右移 >>）
export const Unit: React.FC<{cx: number; cy: number; sym: string; r?: number; stroke?: string; draw: number}> = ({cx, cy, sym, r = 46, stroke = C.ink, draw}) => (
  <g>
    <RPath
      d={`M${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} Z`}
      stroke={stroke}
      fill={C.paper}
      sw={2.4}
      roughness={0.6}
      draw={draw}
    />
    <Txt x={cx} y={cy + r * 0.38} anchor="middle" size={Math.round(r * 1.05)} mono opacity={Math.max(0, draw * 2 - 1)}>
      {sym}
    </Txt>
  </g>
);
export const unitPorts = (cx: number, cy: number, r = 46) => ({
  left: {x: cx - r, y: cy},
  right: {x: cx + r, y: cy},
  top: {x: cx, y: cy - r},
  bottom: {x: cx, y: cy + r},
  in1: {x: cx - r * 0.8, y: cy - r * 0.6},
  in2: {x: cx - r * 0.8, y: cy + r * 0.6},
});

// 折线导线的路径：wire([p1, p2, …])
export const wire = (pts: {x: number; y: number}[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

// 总线标记：导线上一道斜杠，旁边写位数
export const BusMark: React.FC<{x: number; y: number; n: number | string; color?: string; o: number}> = ({x, y, n, color = C.ink2, o}) =>
  o > 0 ? (
    <g opacity={o}>
      <RPath d={`M${x - 8} ${y + 14} L${x + 8} ${y - 14}`} stroke={color} sw={2.2} roughness={0.4} />
      <Txt x={x} y={y - 22} anchor="middle" size={18} mono color={color}>
        {String(n)}
      </Txt>
    </g>
  ) : null;
