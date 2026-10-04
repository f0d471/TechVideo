import React from 'react';
import {C} from '../../../src/core/theme';
import {Txt} from '../../../src/components/Prims';
import {RLine} from '../../../src/core/rough';
import {Label, textWidth} from '../../../src/components/Label';
import {Circuit, Logic, Reg, Wire, logicPorts, regPorts, wire} from '../../../src/components/Gates';
import {Formula} from '../../../src/components/Formula';

// 这一集共用的画法：角色色、导线上的名字与值、沿折线走的圆点、五步链、顶部公式条

// 角色色：寄存器与时钟陶土，数据与组合逻辑蓝，有效信号绿
export const ROLE = {reg: C.clay, regInk: C.clayInk, data: C.blue, dataInk: C.blueInk, valid: C.green, validInk: C.greenInk};

export type Pt = {x: number; y: number};

// 折线上按长度比例 t（0–1）取一点
export const along = (pts: Pt[], t: number): Pt => {
  const seg = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  const total = seg.reduce((s, v) => s + v, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const r = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return {x: pts[i].x + (pts[i + 1].x - pts[i].x) * r, y: pts[i].y + (pts[i + 1].y - pts[i].y) * r};
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

// 导线上的一组数据：实心圆点
export const Dot: React.FC<{p: Pt; o: number; color?: string; r?: number}> = ({p, o, color = C.blue, r = 13}) =>
  o > 0 ? <circle cx={p.x} cy={p.y} r={r} fill={color} opacity={o} /> : null;

// 导线旁的信号名
export const Name: React.FC<{x: number; y: number; t: string; color?: string; o: number; anchor?: 'start' | 'end' | 'middle'; size?: number}> = ({
  x,
  y,
  t,
  color = C.ink2,
  o,
  anchor = 'end',
  size = 24,
}) => (
  <Txt x={x} y={y + 8} anchor={anchor} mono size={size} color={color} opacity={o}>
    {t}
  </Txt>
);

// 导线上的一个多位值
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; o: number; mono?: boolean}> = ({x, y, text, color = C.ink2, o, mono = true}) => (
  <Label cx={x} cy={y} text={text} size={22} mono={mono} stroke={color} color={C.ink} opacity={o} />
);

// 五步链：两端寄存器之间一串组合逻辑块；cut 给出插在第几块之后的寄存器
export const STEPS = ['拆包', '相乘', '规格化', '舍入', '写回'];
export const CHAIN = {y: 400, regL: 170, regR: 1750, xs: [330, 645, 960, 1275, 1590], w: 180, cutX: 802};

export const chainWires = (cut: boolean): Pt[][] => {
  const {y, regL, regR, xs, w} = CHAIN;
  const pts: number[] = [regPorts(regL, y).q.x, ...xs.flatMap((x) => [x - w / 2, x + w / 2]), regPorts(regR, y).d.x];
  const segs: Pt[][] = [];
  for (let i = 0; i < pts.length; i += 2) {
    const a = pts[i];
    const b = pts[i + 1];
    if (cut && i === 4) {
      segs.push([{x: a, y}, {x: regPorts(CHAIN.cutX, y).d.x, y}]);
      segs.push([{x: regPorts(CHAIN.cutX, y).q.x, y}, {x: b, y}]);
    } else segs.push([{x: a, y}, {x: b, y}]);
  }
  return segs;
};

export const StepChain: React.FC<{
  draw: number;
  cut?: number; // 中间寄存器的描线进度
  subs?: string[];
  path?: string;
  regDraw?: number;
}> = ({draw, cut = 0, subs = [], path = C.ink2, regDraw}) => {
  const {y, regL, regR, xs, w} = CHAIN;
  const rd = regDraw ?? draw;
  return (
    <Circuit opacity={1}>
      <Reg cx={regL} cy={y} draw={rd} clockTo={y + 96} />
      <Reg cx={regR} cy={y} draw={rd} clockTo={y + 96} />
      {xs.map((x, i) => (
        <Logic key={x} cx={x} cy={y} w={w} h={110} text={STEPS[i]} sub={subs[i]} size={28} draw={Math.min(1, draw * 1.2 - i * 0.05)} />
      ))}
      {chainWires(cut > 0).map((s, i) => (
        <Wire key={i} d={wire(s)} stroke={path} draw={draw} />
      ))}
      {cut > 0 && <Reg cx={CHAIN.cutX} cy={y} draw={cut} clockTo={y + 96} />}
      {cut > 0 && <Wire d={wire([{x: regL, y: y + 96}, {x: regR, y: y + 96}])} stroke={C.clay} draw={cut} />}
      {cut <= 0 && <Wire d={wire([{x: regL, y: y + 96}, {x: regR, y: y + 96}])} stroke={C.clay} draw={rd} />}
    </Circuit>
  );
};

export const chainEdge = (i: number) => logicPorts(CHAIN.xs[i], CHAIN.y, CHAIN.w, 110);

// 顶部公式条：时钟周期 ≥ 时钟到输出延迟 + 组合逻辑延迟 + 建立时间。
// 时钟周期、时钟到输出延迟、建立时间用陶土（寄存器与时钟），组合逻辑延迟用蓝
export const BAR = {y: 92, ruleY: 122, size: 32};
export type BarRole = 'T' | 'Q' | 'D' | 'S';
export type BarLit = Record<BarRole, number>;
export const BAR_ALL: BarLit = {T: 1, Q: 1, D: 1, S: 1};
export const BAR_NONE: BarLit = {T: 0.45, Q: 0.45, D: 0.45, S: 0.45};

const BAR_TERMS: {role: BarRole; t: string; color: string}[] = [
  {role: 'T', t: '时钟周期', color: C.clayInk},
  {role: 'Q', t: '时钟到输出延迟', color: C.clayInk},
  {role: 'D', t: '组合逻辑延迟', color: C.blueInk},
  {role: 'S', t: '建立时间', color: C.clayInk},
];

// 各项与运算符的水平位置，由字宽算出，整体居中
const barLayout = () => {
  const ops = ['≥', '+', '+'];
  const gap = 20;
  const widths = BAR_TERMS.map((m) => textWidth(m.t, BAR.size));
  const opW = ops.map((s) => textWidth(s, BAR.size));
  const total = widths.reduce((s, v) => s + v, 0) + opW.reduce((s, v) => s + v, 0) + gap * 6;
  let x = 960 - total / 2;
  const xs: {x: number; w: number}[] = [];
  for (let i = 0; i < BAR_TERMS.length; i++) {
    xs.push({x, w: widths[i]});
    x += widths[i] + gap;
    if (i < ops.length) x += opW[i] + gap;
  }
  return {xs, ops, opPos: BAR_TERMS.slice(1).map((_, i) => xs[i].x + xs[i].w + gap + opW[i] / 2), total};
};

export const FormulaBar: React.FC<{lit: BarLit; under: Partial<BarLit>}> = ({lit, under}) => {
  const L = barLayout();
  return (
    <g>
      {BAR_TERMS.map((m, i) => (
        <g key={m.role}>
          <Txt x={L.xs[i].x} y={BAR.y} anchor="start" size={BAR.size} color={m.color} opacity={lit[m.role]}>
            {m.t}
          </Txt>
          <RLine
            x1={L.xs[i].x}
            y1={BAR.y + 10}
            x2={L.xs[i].x + L.xs[i].w}
            y2={BAR.y + 10}
            stroke={m.color}
            sw={3}
            draw={under[m.role] ?? 0}
          />
        </g>
      ))}
      {L.ops.map((s, i) => (
        <Txt key={i} x={L.opPos[i]} y={BAR.y} anchor="middle" size={BAR.size} color={C.ink2}>
          {s}
        </Txt>
      ))}
      <RLine x1={96} y1={BAR.ruleY} x2={1824} y2={BAR.ruleY} stroke={C.rule} sw={1.6} />
    </g>
  );
};

// 一行带名字的公式（周期与频率几页用），逐项出现
export const NumFormula: React.FC<{x: number; y: number; terms: {t: string; color?: string; sup?: string}[]; draw: number; size?: number; opacity?: number}> = ({
  x,
  y,
  terms,
  draw,
  size = 44,
  opacity = 1,
}) => (
  <Formula
    x={x}
    y={y}
    size={size}
    terms={terms.map((m, i) => ({...m, o: Math.max(0, Math.min(1, draw * terms.length - i))}))}
    opacity={opacity}
  />
);
