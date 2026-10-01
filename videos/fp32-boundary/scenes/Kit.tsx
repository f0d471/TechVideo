import React from 'react';
import {C} from '../../../src/core/theme';
import {Txt} from '../../../src/components/Prims';
import {BitLook, Bits, bitsGeom, hexBits} from '../../../src/components/Bits';
import {Label} from '../../../src/components/Label';

// 这一集共用的画法：FP32 位串按字段着色，结果位串、导线上的值
export type Field = 'S' | 'E' | 'F';
export const field = (bit: number): Field => (bit === 31 ? 'S' : bit >= 23 ? 'E' : 'F');
export const ROLE = {S: C.green, E: C.clay, F: C.blue};
export const TINT = {S: C.greenTint, E: C.clayTint, F: C.blueTint};
export const INK = {S: C.greenInk, E: C.clayInk, F: C.blueInk};

// 32 位位串：focus 里的字段着色，其余字段淡下去；focus 为空时三段都着色
export const fp32Look =
  (focus: Field[] = [], dim = 0.28) =>
  (bit: number): BitLook => {
    const r = field(bit);
    const on = focus.length === 0 || focus.includes(r);
    return {fill: TINT[r], stroke: ROLE[r], text: INK[r], opacity: on ? 1 : dim};
  };

export const g32 = (y: number) => bitsGeom(32, y);
export const g48 = (y: number) => bitsGeom(48, y);
export const g25 = (y: number) => bitsGeom(25, y);

// 一个 FP32 数：位串加上方左侧的十六进制
export const Fp32: React.FC<{
  hex: string;
  y: number;
  draw: number;
  focus?: Field[];
  label?: string;
  opacity?: number;
}> = ({hex, y, draw, focus, label, opacity = 1}) => (
  <g opacity={opacity}>
    <Bits g={g32(y)} bits={hexBits(hex, 32)} draw={draw} look={fp32Look(focus)} />
    <Txt x={96} y={y - 16} mono size={26} color={C.ink2} opacity={Math.max(0, draw * 2 - 1)}>
      {label ?? hex}
    </Txt>
  </g>
);

// 导线上的一个多位值
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; o: number}> = ({x, y, text, color = C.ink2, o}) => (
  <Label cx={x} cy={y} text={text} size={22} mono stroke={color} color={C.ink} opacity={o} />
);
