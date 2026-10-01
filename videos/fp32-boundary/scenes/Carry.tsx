import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RLine} from '../../../src/core/rough';
import {Axis, AxisScale, Mark, axisX} from '../../../src/components/Axis';
import {Bracket, Txt} from '../../../src/components/Prims';
import {Formula} from '../../../src/components/Formula';
import {Label} from '../../../src/components/Label';
import {BitLook, Bits, bitCX, bitX, hexBits} from '../../../src/components/Bits';
import {Fp32, Tag, g25, g32, g48} from './Kit';

// p01–p03：训练里的数跨度非常大；上一集把末位定了下来；两种写不下的时候
const Opening: React.FC = () => {
  const {p} = useT();
  const o = p('p01', 0, 16);
  if (o <= 0) return null;
  const a: AxisScale = {x1: 360, x2: 1560, v1: 0, v2: 10, y: 540};
  const g = g32(300);
  return (
    <g opacity={o * (1 - p('k01', 0, 8))}>
      <Axis a={a} ticks={[]} draw={p('p01', 0, 20)} />
      <Mark a={a} v={0.6} color={C.blue} r={11} opacity={p('p01', 14, 14)} />
      <Mark a={a} v={9.4} color={C.clay} r={11} opacity={p('p01', 22, 14)} />
      <Formula x={axisX(a, 0.6)} y={640} size={34} terms={[{t: '2'}, {t: '', sup: '−126'}]} color={C.blueInk} opacity={p('p01', 20, 14)} />
      <Txt x={axisX(a, 0.6)} y={692} anchor="middle" size={24} color={C.ink2} opacity={p('p01', 26, 12)}>
        非常小
      </Txt>
      <Formula x={axisX(a, 9.4)} y={640} size={34} terms={[{t: '≈ 10'}, {t: '', sup: '38'}]} color={C.clayInk} opacity={p('p01', 28, 14)} />
      <Txt x={axisX(a, 9.4)} y={692} anchor="middle" size={24} color={C.ink2} opacity={p('p01', 34, 12)}>
        突然很大
      </Txt>
      <g opacity={p('p02', 0, 14)}>
        <Fp32 hex="3F800001" y={300} draw={p('p02', 0, 22)} focus={['F']} />
        <REllipse cx={bitCX(g, 0)} cy={g.y + g.ch / 2} w={58} h={66} stroke={C.clay} sw={3} draw={p('p02', 16, 14)} />
        <Tag x={1640} y={g.y + g.ch + 40} text="末位加一（第 4 集）" color={C.clay} o={p('p02', 22, 12)} />
      </g>
      <g opacity={p('p03', 0, 14)}>
        <Label cx={620} cy={810} text="尾数加一满出来" size={32} stroke={C.blue} color={C.blueInk} draw={p('p03', 0, 14)} />
        <Label cx={1300} cy={810} text="阶码超出范围" size={32} stroke={C.clay} color={C.clayInk} draw={p('p03', 10, 14)} />
      </g>
    </g>
  );
};

// p04–p13：尾数进位。全一的 24 位尾数加一满出来，右移一位、阶码加一；
// 例子 3FFFFFFE × 3F800001 的 48 位积保留位全一，加一进位，写回 40000000（2.0）
const ONES24 = '1'.repeat(24);
const PRE = '0' + ONES24;
const POST = '1' + '0'.repeat(24);

const plainZero = (bit: number): BitLook => ({stroke: C.ink2, text: C.muted});
const postLook = (bit: number): BitLook =>
  bit === 24 ? {fill: C.blueTint, stroke: C.blue, text: C.blueInk} : plainZero(bit);

const Concept: React.FC = () => {
  const {p} = useT();
  const o = p('p04', 0, 16) * (1 - p('p11', 0, 12));
  if (o <= 0) return null;
  const g = g25(250);
  const flip = p('p06', 0, 14);
  const sh = p('p06', 14, 18);
  const ones = p('p05', 0, 14);
  const plus1 = p('p05', 40, 14);
  const sep = p('p06', 18, 14);
  const named = p('p10', 0, 16);
  return (
    <g opacity={o}>
      <Txt x={350} y={218} size={26} color={C.ink2} opacity={ones}>
        二十四位全是一
      </Txt>
      <Tag x={1690} y={215} text="+ 1" color={C.clay} o={plus1} />
      <g opacity={1 - flip}>
        <Bits g={g} bits={PRE} draw={p('p04', 0, 26)} look={(bit) => (bit === 24 ? {opacity: 0.3} : {})} indices={[24, 23, 0]} />
      </g>
      <g opacity={flip}>
        <Bits g={g} bits={POST} draw={Math.max(flip, sh)} look={postLook} indices={[24, 23, 0]} />
      </g>
      <RLine x1={bitX(g, 23)} y1={242} x2={bitX(g, 23)} y2={326} stroke={C.ink2} sw={1.6} dash draw={sep} />
      <Bracket x1={bitX(g, 23)} x2={bitX(g, 0) + g.cw} y={g.y + g.ch + 16} dir="up" stroke={C.blue} draw={p('p04', 20, 16)} />
      <Txt x={(bitX(g, 23) + bitX(g, 0) + g.cw) / 2} y={g.y + g.ch + 64} anchor="middle" size={26} color={C.blueInk} opacity={p('p04', 26, 14)}>
        保留 24 位
      </Txt>
      <Label cx={bitCX(g, 24)} cy={g.y + g.ch + 134} text="尾数进位" size={28} stroke={C.blue} color={C.blueInk} draw={named} opacity={named} />
      <Formula
        x={960}
        y={560}
        size={36}
        terms={[
          {t: '末位加一 = '},
          {t: 'G ∧ (S ∨ L)', color: C.clayInk},
        ]}
        opacity={p('p04', 30, 16)}
      />
    </g>
  );
};

const Decimal: React.FC = () => {
  const {p} = useT();
  const o = p('p07', 0, 14) * (1 - p('p11', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Formula x={640} y={640} size={44} terms="9.99 + 0.01 = 10.00" opacity={p('p07', 0, 16)} />
      <Formula
        x={1330}
        y={640}
        size={44}
        terms={[
          {t: '1.000 × 10'},
          {t: '', sup: '1'},
        ]}
        opacity={p('p08', 0, 16)}
      />
      <Txt x={1330} y={700} anchor="middle" size={26} color={C.ink2} opacity={p('p08', 16, 14)}>
        数值不变
      </Txt>
      <Formula
        x={960}
        y={780}
        size={34}
        mono={false}
        terms={[
          {t: '二进制照做：右移一位，', color: C.ink},
          {t: '阶码 + 1', color: C.clayInk},
        ]}
        opacity={p('p08', 50, 16)}
      />
      <Txt x={960} y={860} anchor="middle" size={28} color={C.ink2} opacity={p('p09', 0, 14)}>
        第 3 集规格化：同一个动作
      </Txt>
    </g>
  );
};

const midLook = (bit: number): BitLook => (bit === 47 ? {fill: C.clayTint, stroke: C.clay, text: C.clayInk} : {stroke: C.ink2, text: C.muted});
const shiftedLook = (bit: number): BitLook =>
  bit === 46 ? {fill: C.blueTint, stroke: C.blue, text: C.blueInk} : {stroke: C.ink2, text: C.muted};

const Example: React.FC = () => {
  const {p} = useT();
  const o = p('p11', 0, 14);
  if (o <= 0) return null;
  const g = g48(440);
  const flip = p('p13', 0, 20);
  const sh = p('p13', 26, 44);
  const done = sh >= 1;
  const pre = 1 - p('p13', 0, 10);
  return (
    <g opacity={o}>
      <g opacity={1 - p('p12', 0, 12)}>
        <Fp32 hex="3FFFFFFE" y={190} draw={p('p11', 0, 24)} focus={['E', 'F']} />
        <Fp32 hex="3F800001" y={282} draw={p('p11', 8, 24)} focus={['E', 'F']} />
      </g>
      <g opacity={p('p12', 0, 14)}>
        <Txt x={96} y={414} mono size={26} color={C.ink2} opacity={p('p12', 10, 12)}>
          尾数积 · 48 位
        </Txt>
        <g opacity={1 - flip}>
          <Bits g={g} bits={hexBits('7FFFFFFFFFFE', 48)} draw={p('p12', 6, 24)} indices={[47, 46, 23, 22, 0]} look={(bit) => {
            if (bit === 23) return {fill: C.greenTint, stroke: C.green, text: C.greenInk};
            if (bit === 22) return {fill: C.clayTint, stroke: C.clay, text: C.clayInk};
            if (bit >= 23) return {fill: C.blueTint, stroke: C.blue, text: C.blueInk};
            return {fill: C.band, stroke: C.ink2, text: C.ink2};
          }} />
        </g>
        <g opacity={flip}>
          <Bits
            g={g}
            bits={done ? hexBits('400000000000', 48) : hexBits('800000000000', 48)}
            draw={1}
            shift={done ? 0 : sh}
            look={done ? shiftedLook : midLook}
            indices={[47, 46, 0]}
          />
        </g>
        <g opacity={pre}>
          <Bracket x1={bitX(g, 23)} x2={bitX(g, 46) + g.cw} y={g.y + g.ch + 14} dir="up" stroke={C.blue} draw={p('p12', 20, 14)} />
          <Txt x={918} y={g.y + g.ch + 58} anchor="middle" size={24} color={C.blueInk} opacity={p('p12', 26, 12)}>
            保留 24 位全一
          </Txt>
          <Label cx={bitCX(g, 22)} cy={620} text="G=1" size={24} mono stroke={C.clay} color={C.clayInk} draw={p('p12', 34, 12)} />
          <Label cx={bitCX(g, 23)} cy={676} text="L=1" size={24} mono stroke={C.green} color={C.greenInk} draw={p('p12', 42, 12)} />
          <Label cx={bitCX(g, 10)} cy={620} text="S=1" size={24} mono stroke={C.blue} color={C.blueInk} draw={p('p12', 50, 12)} />
          <Txt x={1650} y={628} anchor="middle" size={26} color={C.clayInk} opacity={p('p12', 58, 12)}>
            末位加一
          </Txt>
        </g>
        <Label cx={620} cy={790} text="40000000（2.0）" size={30} mono draw={p('p13', 74, 14)} opacity={p('p13', 74, 14)} />
        <Formula
          x={1280}
          y={800}
          size={34}
          terms={[
            {t: '阶码 ', color: C.ink},
            {t: '127 → 128', color: C.clayInk},
          ]}
          opacity={p('p13', 88, 14)}
        />
      </g>
    </g>
  );
};

export const Carry: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p04') || f >= s('k02')) return null;
  return (
    <g>
      <Concept />
      <Decimal />
      <Example />
    </g>
  );
};

// 开场三句的画面（p01–p03），与原理段分开导出，由 Video.tsx 直接挂
export const OpeningScene: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('k01')) return null;
  return <Opening />;
};
