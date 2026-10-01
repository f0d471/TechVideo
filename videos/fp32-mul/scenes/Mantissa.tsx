import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RLine} from '../../../src/core/rough';
import {Axis, AxisScale, Mark, Span} from '../../../src/components/Axis';
import {BitLook, Bits, bitX, bitsGeom, hexBits} from '../../../src/components/Bits';
import {Column} from '../../../src/components/Column';
import {Formula} from '../../../src/components/Formula';
import {Bracket, Txt} from '../../../src/components/Prims';
import {Fp32, STRIP_A, STRIP_B, g32} from './Kit';

const blank = (s: string, lo: number, hi: number) =>
  [...s].map((c, col) => {
    const bit = s.length - 1 - col;
    return bit >= lo && bit <= hi ? c : ' ';
  }).join('');
const onlyIn = (lo: number, hi: number, inside: BitLook) => (bit: number): BitLook => (bit >= lo && bit <= hi ? inside : {opacity: 0});
const MANT: BitLook = {fill: C.blueTint, stroke: C.blue, text: C.blueInk};
// 乘数里的 1 与它对应那一行的最低位用同一种底色
const HOT: BitLook = {fill: C.band, stroke: C.ink, text: C.ink};

// p19–p20：小数位前补回隐藏位，成为 24 位尾数
const Hidden: React.FC = () => {
  const {p, span} = useT();
  const o = span('p19', 'p21', 14);
  if (o <= 0) return null;
  const gB = g32(STRIP_B);
  const g24a = bitsGeom(24, 470);
  const g24b = bitsGeom(24, 640);
  const hid = p('p20', 36, 14);
  const look = (bit: number): BitLook => (bit === 23 ? {...MANT, fill: C.band, stroke: C.ink, textOpacity: hid, opacity: 0.3 + 0.7 * hid} : MANT);
  return (
    <g opacity={o}>
      <g opacity={1 - p('p20', 0, 14)}>
        <Fp32 hex="3F800001" y={STRIP_A} draw={p('p19', 0, 24)} focus={['F']} />
        <Fp32 hex="3FC00000" y={STRIP_B} draw={p('p19', 6, 24)} focus={['F']} />
        <g opacity={p('p19', 24, 14)}>
          <Bracket x1={bitX(gB, 22)} x2={bitX(gB, 0) + gB.cw} y={368} stroke={C.blue} />
          <Txt x={(bitX(gB, 22) + bitX(gB, 0) + gB.cw) / 2} y={414} anchor="middle" size={30} color={C.blueInk}>
            小数位 23 位
          </Txt>
        </g>
      </g>
      <g opacity={p('p20', 10, 14)}>
        <Txt x={176} y={470 + 46} anchor="end" mono size={32} color={C.blueInk}>
          ma
        </Txt>
        <Txt x={176} y={640 + 46} anchor="end" mono size={32} color={C.blueInk}>
          mb
        </Txt>
        <Bits g={g24a} bits={hexBits('800001', 24)} draw={p('p20', 10, 26)} look={look} />
        <Bits g={g24b} bits={hexBits('C00000', 24)} draw={p('p20', 16, 26)} look={look} />
        <Txt x={bitX(g24a, 0) + g24a.cw} y={454} anchor="end" mono size={28} color={C.ink2}>
          800001
        </Txt>
        <Txt x={bitX(g24b, 0) + g24b.cw} y={624} anchor="end" mono size={28} color={C.ink2}>
          C00000
        </Txt>
      </g>
      <g opacity={hid}>
        <Bracket x1={bitX(g24b, 23)} x2={bitX(g24b, 23) + g24b.cw} y={640 + g24b.ch + 16} stroke={C.ink} />
        <Txt x={bitX(g24b, 23)} y={640 + g24b.ch + 62} size={28}>
          补回的隐藏位 1
        </Txt>
        <Bracket x1={bitX(g24b, 22)} x2={bitX(g24b, 0) + g24b.cw} y={640 + g24b.ch + 16} stroke={C.blue} />
        <Txt x={(bitX(g24b, 22) + bitX(g24b, 0) + g24b.cw) / 2} y={640 + g24b.ch + 62} anchor="middle" size={28} color={C.blueInk}>
          23 位小数位，合起来 24 位尾数
        </Txt>
      </g>
    </g>
  );
};

// p21：十进制竖式，两位乘两位最多四位
const Decimal: React.FC = () => {
  const {p, span} = useT();
  const o = span('p21', 'p22', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Column
        right={760}
        y={330}
        size={52}
        rows={[
          {text: '99', o: p('p21', 0, 12)},
          {text: '99', op: '×', o: p('p21', 8, 12)},
          {text: '891', o: p('p21', 24, 12)},
          {text: '891', op: '+', shift: 1, o: p('p21', 36, 12)},
          {text: '9801', o: p('p21', 56, 12)},
        ]}
        rules={[
          {after: 1, draw: p('p21', 16, 10)},
          {after: 3, draw: p('p21', 48, 10)},
        ]}
      />
      <Formula x={1280} y={440} size={40} mono={false} terms="两位 × 两位 → 最多四位" opacity={p('p21', 60, 14)} />
      <Formula x={1280} y={560} size={40} mono={false} terms="24 位 × 24 位 → 最多 48 位" color={C.blueInk} opacity={p('p21', 110, 14)} />
    </g>
  );
};

// p22–p23：二进制竖式。乘数 C00000 只有第 23、22 位是 1，被乘数挪到这两位各抄一行，两行相加得 48 位的积
const G48 = (y: number) => bitsGeom(48, y);
const MA = '100000000000000000000001';
const Binary: React.FC = () => {
  const {p, span} = useT();
  const o = span('p22', 'p24', 14);
  if (o <= 0) return null;
  const rows = {ma: 180, mb: 250, r1: 340, r2: 410, sum: 490};
  const full = (s: string) => s.padStart(48, '0');
  const sh1 = p('p22', 40, 36);
  const sh2 = p('p22', 90, 36);
  const mbLook = (bit: number): BitLook => (bit > 23 ? {opacity: 0} : (bit === 22 && sh1 > 0) || (bit === 23 && sh2 > 0) ? HOT : MANT);
  const rowLook = (lo: number, hi: number, low: number) => (bit: number): BitLook =>
    bit < lo || bit > hi ? {opacity: 0} : bit === low ? {fill: C.band, stroke: C.ink} : {stroke: C.ink2};
  const g = G48(0);
  const x23 = bitX(g, 23);
  return (
    <g opacity={o}>
      <Txt x={x23 - 60} y={rows.ma + 33} anchor="end" mono size={28} color={C.blueInk} opacity={p('p22', 0, 14)}>
        800001
      </Txt>
      <Txt x={x23 - 60} y={rows.mb + 33} anchor="end" mono size={28} color={C.blueInk} opacity={p('p22', 6, 14)}>
        C00000
      </Txt>
      <Txt x={x23 - 22} y={rows.mb + 33} anchor="middle" mono size={32} color={C.ink2} opacity={p('p22', 6, 14)}>
        ×
      </Txt>
      <Bits g={G48(rows.ma)} bits={blank(full(MA), 0, 23)} draw={p('p22', 0, 20)} look={onlyIn(0, 23, MANT)} />
      <Bits g={G48(rows.mb)} bits={blank(hexBits('C00000', 48), 0, 23)} draw={p('p22', 6, 20)} look={mbLook} />
      <RLine x1={x23 - 40} y1={rows.mb + 64} x2={bitX(g, 0) + g.cw} y2={rows.mb + 64} stroke={C.ink2} sw={2.4} draw={p('p22', 20, 14)} />
      <Bits g={G48(rows.r1)} bits={blank(full(MA + '0'.repeat(22)), 22, 45)} draw={sh1} shift={22 * (1 - sh1)} look={rowLook(22, 45, 22)} />
      <Txt x={bitX(g, 21)} y={rows.r1 + 33} size={26} color={C.ink2} opacity={p('p22', 60, 14)}>
        乘数第 22 位的 1 → 挪 22 位
      </Txt>
      <Bits g={G48(rows.r2)} bits={blank(full(MA + '0'.repeat(23)), 23, 46)} draw={sh2} shift={23 * (1 - sh2)} look={rowLook(23, 46, 23)} />
      <Txt x={bitX(g, 21)} y={rows.r2 + 33} size={26} color={C.ink2} opacity={p('p22', 110, 14)}>
        乘数第 23 位的 1 → 挪 23 位
      </Txt>
      <RLine x1={bitX(g, 47) - 8} y1={rows.r2 + 64} x2={bitX(g, 0) + g.cw} y2={rows.r2 + 64} stroke={C.ink2} sw={2.4} draw={p('p23', 14, 16)} />
      <Bits
        g={G48(rows.sum)}
        bits={hexBits('600000C00000', 48)}
        draw={p('p23', 24, 30)}
        look={() => MANT}
        indices={[47, 46, 23, 0]}
        indexOpacity={p('p23', 40, 12)}
      />
      <Formula x={960} y={660} size={40} terms="800001 × C00000 = 600000C00000" color={C.blueInk} opacity={p('p23', 50, 14)} />
      <Txt x={960} y={730} anchor="middle" size={30} color={C.ink2} opacity={p('p23', 64, 14)}>
        48 位，一位也不丢
      </Txt>
    </g>
  );
};

// p24–p29：两个 [1, 2) 的数相乘落在 [1, 4)；小数点前两位，只看最高位就知道在哪一半
const TopBit: React.FC = () => {
  const {p} = useT();
  const o = p('p24', 8, 14) * (1 - p('p30', 0, 12));
  if (o <= 0) return null;
  const a: AxisScale = {x1: 360, x2: 1560, v1: 0, v2: 4, y: 430};
  const lead = 1 - 0.6 * p('p26', 0, 14);
  const topLook = (bit: number): BitLook =>
    bit === 47 ? {fill: C.band, stroke: C.ink, text: C.ink} : bit >= 44 ? MANT : {...MANT, opacity: 0.45};
  const hl = p('p29', 0, 18);
  return (
    <g opacity={o}>
      <Formula x={960} y={230} size={40} terms="1 ≤ ma, mb < 2   →   1 ≤ ma × mb < 4" color={C.blueInk} opacity={p('p24', 8, 14)} />
      <Axis a={a} draw={p('p24', 14, 20)} ticks={[0, 1, 2, 3, 4].map((v) => ({v, label: String(v)}))} />
      <Span a={a} from={1} to={2} color={C.blue} ink={C.blueInk} label="ma、mb" size={26} draw={p('p24', 30, 18)} />
      <Span a={a} from={1} to={4} color={C.blue} ink={C.blueInk} lift={110} label="ma × mb" size={26} draw={p('p24', 60, 18)} />
      <g opacity={p('p25', 0, 14)}>
        <Formula x={660} y={562} size={36} terms={[{t: '0'}, {t: '1.xxx', o: lead}, {t: '₂', o: lead}]} color={C.blueInk} />
        <Formula x={1260} y={562} size={36} terms={[{t: '1'}, {t: '0.xxx', o: lead}, {t: '₂', o: lead}, {t: ' 或 ', o: lead}, {t: '1'}, {t: '1.xxx₂', o: lead}]} />
      </g>
      <g opacity={p('p26', 10, 14)}>
        <Txt x={660} y={610} anchor="middle" size={28} color={C.blueInk}>
          最高位 0
        </Txt>
        <Txt x={1260} y={610} anchor="middle" size={28}>
          最高位 1
        </Txt>
      </g>
      <g opacity={p('p27', 0, 14)}>
        <Bits g={G48(670)} bits={hexBits('600000C00000', 48)} draw={p('p27', 0, 24)} look={topLook} />
        <Txt x={98} y={646} size={28} color={C.blueInk} opacity={p('p27', 20, 14)}>
          6 = 0110₂，最高位 0，积约 1.5
        </Txt>
        <Mark a={a} v={1.5} color={C.blueInk} r={12} />
      </g>
      <g opacity={p('p28', 0, 14)}>
        <Bits g={G48(800)} bits={hexBits('900000000000', 48)} draw={p('p28', 0, 24)} look={topLook} />
        <Txt x={98} y={776} size={28} opacity={p('p28', 20, 14)}>
          1.5 × 1.5 = 2.25：9 = 1001₂，最高位 1
        </Txt>
        <Mark a={a} v={2.25} color={C.ink} r={12} />
      </g>
      <g opacity={hl}>
        <REllipse cx={bitX(G48(0), 47) + 16} cy={758} w={76} h={200} stroke={C.ink} sw={2.6} draw={hl} />
        <Txt x={1824} y={646} anchor="end" size={28} color={C.ink2}>
          下一集：看这一位，把积调回 1.x
        </Txt>
      </g>
    </g>
  );
};

export const Mantissa: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p19') || f >= s('p30') + 20) return null;
  return (
    <g>
      <Hidden />
      <Decimal />
      <Binary />
      <TopBit />
    </g>
  );
};
