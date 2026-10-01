import React from 'react';
import {C, F} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow} from '../../../src/core/rough';
import {BitLook, Bits, bitCX, bitsGeom, hexBits} from '../../../src/components/Bits';
import {Circuit, Gate, Val, Wire, gate, wire} from '../../../src/components/Gates';
import {Table} from '../../../src/components/Table';
import {Txt} from '../../../src/components/Prims';
import {DROP, G48, LEAD, MANT, Note} from './Kit';

// 右移时其余数字向右挪一格，最右一格的数字从位串里落下去
const Falling: React.FC<{g: ReturnType<typeof G48>; digit: string; t: number; color: string; o?: number}> = ({g, digit, t, color, o = 1}) => {
  if (t <= 0 || o <= 0) return null;
  const x = bitCX(g, 0);
  const y = g.y + g.ch / 2 + g.fs * 0.36 + t * 110;
  return (
    <text x={x} y={y} textAnchor="middle" fontFamily={F.mono} fontSize={g.fs + 4} fontWeight={600} fill={color} opacity={o}>
      {digit}
    </text>
  );
};

// p20–p24：右移时最右边那一位被推出去；换一组末位为 1 的数，被推出的是 1，新末位来自原来的 bit 1
const Push: React.FC = () => {
  const {p, span} = useT();
  const o = span('p20', 'p25', 14);
  if (o <= 0) return null;
  const g1 = G48(260);
  const g2 = G48(620);
  const s1 = p('p20', 20, 40);
  const s2 = p('p23', 10, 40);
  const lookShift = (sh: number) => (bit: number): BitLook =>
    bit === 0 ? {...DROP, textOpacity: sh > 0 ? 0 : 1} : bit === 47 ? LEAD : MANT;
  return (
    <g opacity={o}>
      <Note x={96} y={244} t={s1 >= 1 ? '1.5 × 1.5 的积右移后' : '1.5 × 1.5 的积 900000000000'} color={C.ink} o={p('p20', 0, 14)} />
      <Bits
        g={g1}
        bits={s1 >= 1 ? hexBits('480000000000', 48) : hexBits('900000000000', 48)}
        draw={p('p20', 0, 24)}
        shift={s1 >= 1 ? 0 : s1}
        look={s1 >= 1 ? (bit) => (bit === 46 ? LEAD : MANT) : lookShift(s1)}
        indices={[47, 1, 0]}
        indexOpacity={p('p20', 10, 14)}
      />
      <Falling g={g1} digit="0" t={s1} color={C.greenInk} />
      <Note x={1760} y={440} t="被推出去的位" anchor="end" color={C.greenInk} o={p('p20', 50, 14)} />
      <Note x={1760} y={484} t="可能是 0，也可能是 1；丢掉就查不回来" anchor="end" o={p('p21', 0, 14)} />

      <g opacity={p('p22', 0, 14)}>
        <Note x={96} y={604} t={s2 >= 1 ? '只做右移后' : '两个尾数末位都改成 1：C00001 × C00001 = 900001800001'} color={C.ink} o={1} />
        <Bits
          g={g2}
          bits={s2 >= 1 ? hexBits('480000C00000', 48) : hexBits('900001800001', 48)}
          draw={p('p22', 0, 24)}
          shift={s2 >= 1 ? 0 : s2}
          look={s2 >= 1 ? (bit) => (bit === 0 ? LEAD : bit === 46 ? LEAD : MANT) : lookShift(s2)}
          indices={[47, 1, 0]}
        />
        <Falling g={g2} digit="1" t={s2} color={C.greenInk} />
        <Note x={1760} y={800} t="被推出去的 1" anchor="end" color={C.greenInk} o={p('p23', 50, 14)} />
        <Note x={96} y={800} t="新的最后一位 = 原来的 bit 1 = 0" o={p('p23', 56, 14)} />
        <Note x={96} y={860} t="舍入要知道：丢掉的部分里有没有 1" color={C.greenInk} o={p('p24', 0, 14)} />
      </g>
    </g>
  );
};

// p25–p29：原来最后两位送进或门，结果写到新的最后一位。只画最低 8 位，左边的位不变
const L8 = (y: number) => bitsGeom(8, y, {x0: 260});
const TOP = L8(260);
const LOW = L8(640);
const og = gate('or', 900, 420);
const Keep: React.FC = () => {
  const {p} = useT();
  const o = p('p25', 0, 14);
  if (o <= 0) return null;
  // p28 前半段换成 1.5 × 1.5，后半段回到末位为 1 的那组
  const ex1 = p('p28', 0, 12) * (1 - p('p28', 80, 12));
  const b0 = ex1 > 0.5 ? 0 : 1;
  const b0x = bitCX(TOP, 0);
  const b1x = bitCX(TOP, 1);
  const bottom = TOP.y + TOP.ch;
  const orDraw = p('p26', 0, 20);
  const vals = p('p26', 24, 12);
  const out = p('p26', 36, 12);
  const topLook = (bit: number): BitLook => (bit === 0 ? DROP : bit === 1 ? LEAD : MANT);
  const lowLook = (bit: number): BitLook => (bit === 0 ? {...DROP, textOpacity: out} : MANT);
  return (
    <g opacity={o * (1 - p('k02', 0, 10))}>
      <Txt x={230} y={TOP.y + 46} anchor="end" mono size={32} color={C.muted}>
        …
      </Txt>
      <Txt x={230} y={LOW.y + 46} anchor="end" mono size={32} color={C.muted}>
        …
      </Txt>
      <Note x={260} y={TOP.y - 16} t="原来的积，最低 8 位" color={C.ink} o={1} />
      <Note x={260} y={LOW.y - 16} t="右移后，最低 8 位" color={C.ink} o={1} />
      <Bits g={TOP} bits={b0 ? '00000001' : '00000000'} draw={p('p25', 0, 20)} look={topLook} indices={[1, 0]} />
      <Bits g={LOW} bits={`0000000${out > 0 ? b0 : ' '}`} draw={p('p25', 10, 20)} look={lowLook} indices={[0]} />
      <Circuit opacity={orDraw}>
        <Wire d={wire([{x: b0x, y: bottom}, {x: b0x, y: og.in1.y}, og.in1])} stroke={C.green} draw={orDraw} />
        <Wire d={wire([{x: b1x, y: bottom}, {x: b1x, y: og.in2.y}, og.in2])} stroke={C.ink2} draw={orDraw} />
        <Gate kind="or" x={900} y={420} label="或" draw={orDraw} stroke={C.green} />
        <Wire d={wire([og.out, {x: 1040, y: og.out.y}, {x: 1040, y: 580}, {x: bitCX(LOW, 0), y: 580}, {x: bitCX(LOW, 0), y: LOW.y}])} stroke={C.green} draw={p('p26', 20, 20)} />
        <Val x={b0x} y={390} v={b0 as 0 | 1} o={vals} />
        <Val x={b1x} y={440} v={0} o={vals} />
        <Val x={1040} y={520} v={b0 as 0 | 1} o={out} />
      </Circuit>
      <g opacity={p('p27', 0, 14)}>
        <RArrow x1={1120} y1={300} x2={b0x + 40} y2={296} stroke={C.green} sw={2.6} draw={p('p27', 0, 18)} />
        <Txt x={1136} y={306} size={32} color={C.greenInk}>
          掉出的位
        </Txt>
      </g>
      <Table
        cx={1450}
        y={560}
        colW={[240, 140, 140, 140]}
        header={['', '原 bit 1', '原 bit 0', '新 bit 0']}
        mono={[false, true, true, true]}
        draw={p('p28', 0, 16)}
        opacity={p('p28', 0, 14)}
        rows={[
          {cells: ['1.5 × 1.5', '0', '0', '0'], o: p('p28', 10, 12), hot: ex1},
          {cells: ['末位改成 1', '0', '1', '1'], o: p('p28', 80, 12), hot: p('p28', 80, 12)},
        ]}
      />
      <Txt x={960} y={860} anchor="middle" size={30} color={C.ink2} opacity={p('p29', 10, 14)}>
        1 开头的积 + 调整后的阶码 + 低位有没有 1 → 下一集舍入
      </Txt>
    </g>
  );
};

export const Dropped: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p20') || f >= s('k02') + 12) return null;
  return (
    <g>
      <Push />
      <Keep />
    </g>
  );
};
