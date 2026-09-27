import React from 'react';
import {C, F} from '../core/theme';
import {RPath, RRect} from '../core/rough';

export const Txt: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  mono?: boolean;
  weight?: number;
  opacity?: number;
  rise?: number; // 出现时从下方升起的进度，1 = 已到位
}> = ({x, y, children, size = 34, color = C.ink, anchor = 'start', mono, weight = 400, opacity = 1, rise = 1}) => {
  if (opacity <= 0) return null;
  return (
    <text
      x={x}
      y={y + (1 - rise) * 14}
      textAnchor={anchor}
      fontFamily={mono ? F.mono : F.text}
      fontSize={size}
      fontWeight={weight}
      fill={color}
      opacity={opacity}
      style={mono ? {fontVariantLigatures: 'none'} : undefined}
    >
      {children}
    </text>
  );
};

// 方括号：dir='up' 时开口朝上（画在对象下方），'down' 时开口朝下（画在对象上方）
export const Bracket: React.FC<{
  x1: number;
  x2: number;
  y: number;
  dir?: 'up' | 'down';
  stroke?: string;
  draw?: number;
  opacity?: number;
}> = ({x1, x2, y, dir = 'up', stroke = C.ink2, draw = 1, opacity = 1}) => {
  const t = dir === 'up' ? -10 : 10;
  return (
    <RPath
      d={`M${x1} ${y + t} L${x1} ${y} L${x2} ${y} L${x2} ${y + t}`}
      stroke={stroke}
      sw={2}
      roughness={0.6}
      draw={draw}
      opacity={opacity}
    />
  );
};

// 概念卡片：一个新概念第一次出现时给出的一句话定义
export const Chip: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  children: React.ReactNode;
  opacity?: number;
  draw?: number;
  stroke?: string;
  fill?: string;
}> = ({x, y, w, h = 64, children, opacity = 1, draw = 1, stroke = C.ink2, fill = C.paper}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <RRect x={x} y={y} w={w} h={h} stroke={stroke} fill={fill} sw={2} roughness={0.8} draw={draw} />
      <g opacity={Math.max(0, draw * 2 - 1)}>{children}</g>
    </g>
  );
};
