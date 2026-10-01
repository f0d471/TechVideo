import React from 'react';
import {C} from '../../../src/core/theme';
import {Label, labelEdges} from '../../../src/components/Label';
import {BitLook, Bits, bitsGeom, hexBits} from '../../../src/components/Bits';
import {BusMark, Circuit, Gate, Unit, Val, Wire, gate, unitPorts, wire} from '../../../src/components/Gates';
import {Txt} from '../../../src/components/Prims';

// 这一集共用的画法：FP32 位串按字段着色，三路结构图

export type Field = 'S' | 'E' | 'F';
export const field = (bit: number): Field => (bit === 31 ? 'S' : bit >= 23 ? 'E' : 'F');
export const ROLE = {S: C.green, E: C.clay, F: C.blue};
export const TINT = {S: C.greenTint, E: C.clayTint, F: C.blueTint};
export const INK = {S: C.greenInk, E: C.clayInk, F: C.blueInk};

// 32 位位串：focus 里的字段着色，其余字段淡下去；focus 为空时三段都着色
export const fp32Look = (focus: Field[] = [], dim = 0.28) => (bit: number): BitLook => {
  const r = field(bit);
  const on = focus.length === 0 || focus.includes(r);
  return {fill: TINT[r], stroke: ROLE[r], text: INK[r], opacity: on ? 1 : dim};
};

export const g32 = (y: number) => bitsGeom(32, y);
// 两个输入的位串在上方并排两行时的位置
export const STRIP_A = 180;
export const STRIP_B = 290;

// 一个 FP32 数：位串加上方左侧的十六进制
export const Fp32: React.FC<{hex: string; y: number; draw: number; focus?: Field[]; plain?: boolean; label?: string; opacity?: number}> = ({
  hex,
  y,
  draw,
  focus,
  plain = false,
  label,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    <Bits g={g32(y)} bits={hexBits(hex, 32)} draw={draw} look={plain ? undefined : fp32Look(focus)} />
    <Txt x={96} y={y - 16} mono size={26} color={C.ink2} opacity={Math.max(0, draw * 2 - 1)}>
      {label ?? hex}
    </Txt>
  </g>
);

// 导线上的一个多位值
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; o: number}> = ({x, y, text, color = C.ink2, o}) => (
  <Label cx={x} cy={y} text={text} size={22} mono stroke={color} color={C.ink} opacity={o} />
);

// 三路结构图：符号异或、阶码相加再减 127、尾数相乘；特殊值判断在下面单独一行
export const ROW = {S: 300, E: 470, M: 640, X: 800};
const IN_X = 320;
const OUT_X = 1400;
const sg = gate('xor', 760, ROW.S - 50);
const add = unitPorts(805, ROW.E);
const sub = unitPorts(1010, ROW.E);
const mul = unitPorts(805, ROW.M);
const judge = labelEdges(805, ROW.X, '特殊值判断', 28);

export type OverviewProps = {
  draw: number; // 结构描出来的进度
  rows?: {S?: number; E?: number; M?: number; X?: number}; // 各行的亮度
  inVals?: number; // 输入值出现的进度
  outVals?: number; // 输出值出现的进度
  special?: number; // 特殊值一行的出现进度
};

export const Overview: React.FC<OverviewProps> = ({draw, rows = {}, inVals = 0, outVals = 0, special = 0}) => {
  const d = (k: number) => Math.max(0, Math.min(1, draw * 1.6 - k * 0.2));
  const lab = (x: number, y: number, t: string, color: string, anchor: 'start' | 'end' = 'end') => (
    <Txt x={x} y={y + 9} anchor={anchor} mono size={28} color={color} opacity={d(0)}>
      {t}
    </Txt>
  );
  return (
    <Circuit>
      <g opacity={rows.S ?? 1}>
        {lab(IN_X - 16, ROW.S - 20, 'sa', C.greenInk)}
        {lab(IN_X - 16, ROW.S + 20, 'sb', C.greenInk)}
        <Wire d={wire([{x: IN_X, y: sg.in1.y}, sg.in1])} stroke={C.green} draw={d(0)} />
        <Wire d={wire([{x: IN_X, y: sg.in2.y}, sg.in2])} stroke={C.green} draw={d(0)} />
        <Gate kind="xor" x={760} y={ROW.S - 50} label="异或" draw={d(1)} stroke={C.green} />
        <Wire d={wire([sg.out, {x: OUT_X, y: ROW.S}])} stroke={C.green} draw={d(2)} />
        {lab(OUT_X + 20, ROW.S, 's', C.greenInk, 'start')}
        <Val x={440} y={sg.in1.y} v={0} o={inVals} />
        <Val x={440} y={sg.in2.y} v={0} o={inVals} />
        <Val x={1240} y={ROW.S} v={0} o={outVals} />
      </g>
      <g opacity={rows.E ?? 1}>
        {lab(IN_X - 16, add.in1.y, 'ea', C.clayInk)}
        {lab(IN_X - 16, add.in2.y, 'eb', C.clayInk)}
        <Wire d={wire([{x: IN_X, y: add.in1.y}, add.in1])} stroke={C.clay} draw={d(0)} />
        <Wire d={wire([{x: IN_X, y: add.in2.y}, add.in2])} stroke={C.clay} draw={d(0)} />
        <BusMark x={600} y={add.in1.y} n={8} color={C.clay} o={d(1)} />
        <Unit cx={805} cy={ROW.E} sym="+" stroke={C.clay} draw={d(1)} />
        <Wire d={wire([add.right, sub.left])} stroke={C.clay} draw={d(2)} />
        <Unit cx={1010} cy={ROW.E} sym="−" stroke={C.clay} draw={d(2)} />
        <Wire d={wire([{x: 1010, y: ROW.E + 110}, sub.bottom])} stroke={C.clay} draw={d(2)} />
        <Txt x={1010} y={ROW.E + 140} anchor="middle" mono size={26} color={C.clayInk} opacity={d(2)}>
          127
        </Txt>
        <Wire d={wire([sub.right, {x: OUT_X, y: ROW.E}])} stroke={C.clay} draw={d(3)} />
        <BusMark x={1110} y={ROW.E} n={10} color={C.clay} o={d(3)} />
        {lab(OUT_X + 20, ROW.E, 'e₀', C.clayInk, 'start')}
        <Tag x={440} y={add.in1.y} text="127" color={C.clay} o={inVals} />
        <Tag x={440} y={add.in2.y} text="127" color={C.clay} o={inVals} />
        <Tag x={1270} y={ROW.E} text="127" color={C.clay} o={outVals} />
      </g>
      <g opacity={rows.M ?? 1}>
        {lab(IN_X - 16, mul.in1.y, 'ma', C.blueInk)}
        {lab(IN_X - 16, mul.in2.y, 'mb', C.blueInk)}
        <Wire d={wire([{x: IN_X, y: mul.in1.y}, mul.in1])} stroke={C.blue} draw={d(0)} />
        <Wire d={wire([{x: IN_X, y: mul.in2.y}, mul.in2])} stroke={C.blue} draw={d(0)} />
        <BusMark x={600} y={mul.in1.y} n={24} color={C.blue} o={d(1)} />
        <Unit cx={805} cy={ROW.M} sym="×" stroke={C.blue} draw={d(1)} />
        <Wire d={wire([mul.right, {x: OUT_X, y: ROW.M}])} stroke={C.blue} draw={d(2)} />
        <BusMark x={940} y={ROW.M} n={48} color={C.blue} o={d(3)} />
        {lab(OUT_X + 20, ROW.M, 'm', C.blueInk, 'start')}
        <Tag x={450} y={mul.in1.y} text="800001" color={C.blue} o={inVals} />
        <Tag x={450} y={mul.in2.y} text="C00000" color={C.blue} o={inVals} />
        <Tag x={1210} y={ROW.M} text="600000C00000" color={C.blue} o={outVals} />
      </g>
      {special > 0 && (
        <g opacity={(rows.X ?? 1) * special}>
          {lab(IN_X - 16, ROW.X, 'A、B', C.ink2)}
          <Wire d={wire([{x: IN_X, y: ROW.X}, judge.left])} stroke={C.ink2} draw={special} />
          <Label cx={805} cy={ROW.X} text="特殊值判断" size={28} draw={special} />
          <Wire d={wire([judge.right, {x: OUT_X, y: ROW.X}])} stroke={C.ink2} draw={special} />
          <Txt x={OUT_X + 20} y={ROW.X + 9} size={26} color={C.ink2} opacity={special}>
            是不是特殊值
          </Txt>
        </g>
      )}
    </Circuit>
  );
};
