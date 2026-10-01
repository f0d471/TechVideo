import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine} from '../../../src/core/rough';
import {Axis, AxisScale, Hop, Mark, Span, axisX} from '../../../src/components/Axis';
import {BitLook, Bits, bitCX, bitX, bitsGeom, hexBits} from '../../../src/components/Bits';
import {Formula} from '../../../src/components/Formula';
import {Txt} from '../../../src/components/Prims';
import {G48, LEAD, MANT, Note, PointShift} from './Kit';

const FP32: Record<string, BitLook> = {
  S: {fill: C.greenTint, stroke: C.green, text: C.greenInk},
  E: {fill: C.clayTint, stroke: C.clay, text: C.clayInk},
  F: {fill: C.blueTint, stroke: C.blue, text: C.blueInk},
};
const fp32Look = (bit: number) => (bit === 31 ? FP32.S : bit >= 23 ? FP32.E : FP32.F);
// 最高的 1 所在的格子加深，其余是尾数的蓝
const leadAt = (lead: number) => (bit: number): BitLook => (bit === lead ? LEAD : bit > lead ? {...MANT, opacity: 0.5} : MANT);

// p01–p04：48 位的积要写回 32 位；积有时小数点前一位、有时两位；要把两位的调回一开头
const Opening: React.FC = () => {
  const {p, span} = useT();
  const o = span('p01', 'k01', 14);
  if (o <= 0) return null;
  const strips = 1 - p('p02', 0, 14);
  const a: AxisScale = {x1: 360, x2: 1560, v1: 0.5, v2: 4.2, y: 520};
  const ax = p('p02', 6, 20);
  return (
    <g opacity={o}>
      <g opacity={strips}>
        <Txt x={96} y={224} mono size={26} color={C.ink2} opacity={p('p01', 0, 14)}>
          尾数积 · 48 位
        </Txt>
        <Bits g={G48(240)} bits={hexBits('600000C00000', 48)} draw={p('p01', 0, 26)} look={() => MANT} />
        <RArrow x1={960} y1={310} x2={960} y2={440} stroke={C.ink2} sw={3} draw={p('p01', 24, 18)} />
        <Txt x={990} y={386} size={30} color={C.ink2} opacity={p('p01', 30, 12)}>
          写回
        </Txt>
        <Txt x={96} y={484} mono size={26} color={C.ink2} opacity={p('p01', 40, 14)}>
          FP32 · 32 位
        </Txt>
        <Bits g={bitsGeom(32, 500)} bits={hexBits('3FC00000', 32)} draw={p('p01', 40, 26)} look={fp32Look} />
      </g>
      <Axis a={a} draw={ax} ticks={[1, 2, 3, 4].map((v) => ({v, label: String(v)}))} />
      <Span a={a} from={1} to={2} color={C.blue} draw={p('p02', 20, 18)} />
      <Span a={a} from={2} to={4} color={C.ink2} draw={p('p02', 40, 18)} />
      <Formula x={axisX(a, 1.5)} y={650} size={36} terms="1.xxx₂" color={C.blueInk} opacity={p('p02', 30, 14)} />
      <Txt x={axisX(a, 1.5)} y={700} anchor="middle" size={28} color={C.blueInk} opacity={p('p02', 30, 14)}>
        小数点前 1 位
      </Txt>
      <Formula x={axisX(a, 3)} y={650} size={36} terms="10.xxx₂ 或 11.xxx₂" opacity={p('p02', 50, 14)} />
      <Txt x={axisX(a, 3)} y={700} anchor="middle" size={28} opacity={p('p02', 50, 14)}>
        小数点前 2 位
      </Txt>
      <Hop a={a} from={3.4} to={1.1} lift={-230} color={C.ink} draw={p('p03', 0, 26)} />
      <Txt x={axisX(a, 2.25)} y={352} anchor="middle" size={30} opacity={p('p03', 20, 14)}>
        调回 1 开头
      </Txt>
      <g opacity={p('p04', 0, 14)}>
        <Mark a={a} v={2.25} color={C.ink} r={12} />
        <Formula x={axisX(a, 2.25)} y={790} size={40} terms="1.5 × 1.5 = 2.25" />
      </g>
    </g>
  );
};

// p05–p08：规格化形式小数点前恰好一个 1；积在 [1, 4)；小于 2 的已经是规格化形式
const Form: React.FC = () => {
  const {p, span} = useT();
  const o = span('p05', 'p09', 14);
  if (o <= 0) return null;
  const a: AxisScale = {x1: 360, x2: 1560, v1: 0, v2: 4, y: 500};
  // 等宽字体每字 0.6 个字号，指数小一号：算出公式最左边，给「1」下划线定位
  const formLeft = 960 - (7 * 0.6 * 52 + 9 * 0.6 * 52 * 0.62) / 2;
  return (
    <g opacity={o}>
      <Formula
        x={960}
        y={240}
        size={52}
        opacity={p('p05', 0, 16)}
        terms={[{t: '1', color: C.ink}, {t: '.F × 2', color: C.blueInk}, {t: '', sup: '(E − 127)', color: C.clayInk}]}
      />
      <RLine x1={formLeft} y1={262} x2={formLeft + 31} y2={262} stroke={C.ink} sw={3.5} draw={p('p05', 16, 14)} />
      <Txt x={960} y={310} anchor="middle" size={30} color={C.ink2} opacity={p('p05', 20, 14)}>
        小数点前恰好一个 1
      </Txt>
      <Axis a={a} draw={p('p06', 0, 20)} ticks={[0, 1, 2, 3, 4].map((v) => ({v, label: String(v)}))} />
      <Span a={a} from={1} to={2} color={C.blue} ink={C.blueInk} label="每个尾数" size={26} draw={p('p06', 16, 18)} />
      <Span a={a} from={1} to={4} color={C.blue} ink={C.blueInk} lift={110} label="两个尾数的积" size={26} draw={p('p06', 44, 18)} />
      <Formula x={axisX(a, 1.5)} y={612} size={36} terms="1.xxx₂" color={C.blueInk} opacity={p('p07', 0, 14)} />
      <Txt x={axisX(a, 1.5)} y={660} anchor="middle" size={28} color={C.blueInk} opacity={p('p07', 12, 14)}>
        已经是规格化形式
      </Txt>
      <g opacity={p('p08', 0, 14)}>
        <Mark a={a} v={1.5} color={C.blueInk} r={12} />
        <Note x={96} y={744} t="上一集那组数：600000C00000，最高的 1 已在第 46 位" color={C.blueInk} o={1} />
        <Bits g={G48(760)} bits={hexBits('600000C00000', 48)} draw={p('p08', 0, 24)} look={leadAt(46)} indices={[47, 46, 0]} />
        <Note x={1824} y={744} t="积和阶码和都不动" anchor="end" o={p('p08', 30, 14)} />
      </g>
    </g>
  );
};

// p09–p11：积达到 2，小数点前两位：2.25 = 10.01₂
const TwoDigits: React.FC = () => {
  const {p, span} = useT();
  const o = span('p09', 'p12', 14);
  if (o <= 0) return null;
  const a: AxisScale = {x1: 360, x2: 1560, v1: 0, v2: 4, y: 330};
  // 公式共 26 个等宽字符，「10」是第 20、21 个
  const cw = 0.6 * 52;
  const left = 960 - (26 * cw) / 2;
  return (
    <g opacity={o}>
      <Axis a={a} draw={p('p09', 0, 20)} ticks={[0, 1, 2, 3, 4].map((v) => ({v, label: String(v)}))} />
      <Span a={a} from={2} to={4} color={C.ink2} ink={C.ink} label="10.xxx₂ 或 11.xxx₂：比规格化形式多出一位" size={26} draw={p('p09', 16, 20)} />
      <Mark a={a} v={2.25} color={C.ink} r={12} opacity={p('p10', 0, 12)} />
      <Formula
        x={960}
        y={560}
        size={52}
        opacity={p('p10', 10, 16)}
        terms={[{t: '1.5 × 1.5 = 2.25 = '}, {t: '10', color: C.ink}, {t: '.01'}, {t: '₂'}]}
      />
      <RLine x1={cw * 19 + left} y1={580} x2={cw * 21 + left} y2={580} stroke={C.ink} sw={3.5} draw={p('p11', 0, 16)} />
      <Txt x={cw * 20 + left} y={650} anchor="middle" size={30} opacity={p('p11', 10, 14)}>
        小数点前两位，不能直接写回
      </Txt>
    </g>
  );
};

// p12–p15：十进制先做一遍，小数点左移一位、指数加一；二进制照做，底数是 2
const MovePoint: React.FC = () => {
  const {p, span} = useT();
  const o = span('p12', 'p16', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Txt x={300} y={330} anchor="end" size={30} color={C.ink2} opacity={p('p12', 0, 14)}>
        十进制
      </Txt>
      <PointShift x={420} y={330} digits="225" from={2} to={1} t={p('p13', 0, 30)} base="× 10" e1="3" e2="4" opacity={p('p12', 0, 16)} />
      <Formula x={1320} y={330} size={36} terms="÷ 10，指数 + 1" color={C.ink2} opacity={p('p13', 20, 14)} />
      <Txt x={300} y={560} anchor="end" size={30} color={C.ink2} opacity={p('p14', 0, 14)}>
        二进制
      </Txt>
      <PointShift x={420} y={560} digits="1001" from={2} to={1} t={p('p14', 20, 30)} base="× 2" e1="e" e2="e + 1" sub="₂" color={C.blueInk} opacity={p('p14', 0, 16)} />
      <Formula x={1320} y={560} size={36} terms="÷ 2，指数 + 1" color={C.ink2} opacity={p('p14', 40, 14)} />
      <Formula x={960} y={760} size={40} terms="1.001₂ × 2 = 10.01₂ = 2.25" opacity={p('p15', 10, 16)} />
      <Txt x={960} y={830} anchor="middle" size={30} color={C.ink2} opacity={p('p15', 24, 14)}>
        数值不变
      </Txt>
    </g>
  );
};

// p16–p19：在 48 位的积上，除以 2 就是整体右移一格；阶码和加一；两路的首位都落在第 46 位；最多右移一次
const SHIFTED = hexBits('480000000000', 48);
const Shift: React.FC = () => {
  const {p} = useT();
  const o = p('p16', 0, 14) * (1 - p('p20', 0, 12));
  if (o <= 0) return null;
  const sh = p('p16', 30, 40);
  const done = sh >= 1;
  const g = G48(0);
  const a: AxisScale = {x1: 560, x2: 1360, v1: 0.5, v2: 4.2, y: 820};
  const both = p('p18', 0, 16);
  return (
    <g opacity={o}>
      <Note x={bitX(g, 45)} y={434} t={done ? '右移一格后 480000000000' : '原来的积 900000000000'} color={C.ink} o={1} />
      <Bits
        g={G48(450)}
        bits={done ? SHIFTED : hexBits('900000000000', 48)}
        draw={p('p16', 0, 24)}
        shift={done ? 0 : sh}
        look={done ? leadAt(46) : (bit) => (bit === 0 ? {...MANT, textOpacity: 1 - sh} : bit === 47 ? LEAD : MANT)}
        indices={[47, 46, 0]}
        indexOpacity={p('p16', 10, 14)}
      />
      <Formula
        x={1824}
        y={434}
        anchor="end"
        size={32}
        terms={[{t: '阶码和 '}, {t: '127', color: C.clayInk}, {t: ' → 128', color: C.clayInk, o: p('p17', 10, 14)}]}
        mono={false}
        opacity={p('p16', 20, 14)}
      />
      <g opacity={both}>
        <Note x={bitX(g, 45)} y={304} t="直通的积 600000C00000" color={C.blueInk} o={1} />
        <Bits g={G48(320)} bits={hexBits('600000C00000', 48)} draw={both} look={leadAt(46)} />
        <RLine x1={bitCX(g, 46)} y1={312} x2={bitCX(g, 46)} y2={502} stroke={C.ink} sw={2} dash draw={p('p18', 16, 16)} />
        <Note x={bitX(g, 45)} y={580} t="两种积的首位都在第 46 位" o={p('p18', 24, 14)} />
      </g>
      <g opacity={p('p19', 0, 14)}>
        <Axis a={a} draw={p('p19', 0, 18)} ticks={[1, 2, 4].map((v) => ({v, label: String(v)}))} />
        <Hop a={a} from={3} to={1.5} lift={-70} color={C.ink} draw={p('p19', 14, 20)} />
        <Txt x={axisX(a, 2.25)} y={710} anchor="middle" size={28} opacity={p('p19', 24, 12)}>
          ÷ 2 一次就回到 [1, 2)
        </Txt>
        <Note x={1400} y={830} t="积不小于 1，不用左移" o={p('p19', 34, 12)} />
      </g>
    </g>
  );
};

export const Principle: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('p20') + 14) return null;
  return (
    <g>
      <Opening />
      <Form />
      <TwoDigits />
      <MovePoint />
      <Shift />
    </g>
  );
};
