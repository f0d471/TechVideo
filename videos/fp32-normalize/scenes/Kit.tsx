import React from 'react';
import {C} from '../../../src/core/theme';
import {RArrow, RRect} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';

export type Box = {x: number; y: number; w: number; h: number};
export const left = (b: Box) => ({x: b.x, y: b.y + b.h / 2});
export const right = (b: Box) => ({x: b.x + b.w, y: b.y + b.h / 2});
export const top = (b: Box) => ({x: b.x + b.w / 2, y: b.y});
export const bottom = (b: Box) => ({x: b.x + b.w / 2, y: b.y + b.h});

export const Arrow: React.FC<{
  from: {x: number; y: number};
  to: {x: number; y: number};
  color?: string;
  draw?: number;
  opacity?: number;
}> = ({from, to, color = C.ink2, draw = 1, opacity = 1}) => (
  <RArrow
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
    stroke={color}
    sw={3}
    roughness={0.6}
    draw={draw}
    opacity={opacity}
  />
);

export const Card: React.FC<{
  b: Box;
  title: string;
  value: string;
  color?: string;
  fill?: string;
  valueColor?: string;
  size?: number;
  opacity?: number;
  draw?: number;
}> = ({
  b, title, value, color = C.ink2, fill = C.paper,
  valueColor = C.ink, size = 38, opacity = 1, draw = 1,
}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <RRect
        x={b.x}
        y={b.y}
        w={b.w}
        h={b.h}
        stroke={color}
        fill={fill}
        sw={2.2}
        roughness={0.7}
        draw={draw}
      />
      <Txt x={b.x + 24} y={b.y + 38} size={22} color={color}>
        {title}
      </Txt>
      <Txt
        x={b.x + b.w / 2}
        y={b.y + b.h - 26}
        anchor="middle"
        mono
        size={size}
        color={valueColor}
      >
        {value}
      </Txt>
    </g>
  );
};

export const bits48 = (hex: string) => BigInt('0x' + hex).toString(2).padStart(48, '0');
