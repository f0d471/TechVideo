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
