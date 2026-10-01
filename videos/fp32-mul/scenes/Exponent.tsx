import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine} from '../../../src/core/rough';
import {Axis, AxisScale, Mark, Span, axisX} from '../../../src/components/Axis';
import {Column} from '../../../src/components/Column';
import {Formula} from '../../../src/components/Formula';
import {Bracket, Txt} from '../../../src/components/Prims';
import {bitX} from '../../../src/components/Bits';
import {Fp32, STRIP_A, STRIP_B, g32} from './Kit';

const A_Y = STRIP_A;
const B_Y = STRIP_B;

// p11–p12：阶码字段；阶码与指数是同一条数轴平移 127
const Bias: React.FC = () => {
  const {p, span} = useT();
  const o = span('p11', 'p13', 14);
  if (o <= 0) return null;
  const gB = g32(B_Y);
  const x1 = bitX(gB, 30);
  const x2 = bitX(gB, 23) + gB.cw;
  const E: AxisScale = {x1: 360, x2: 1560, v1: 0, v2: 255, y: 520};
  const X: AxisScale = {x1: 360, x2: 1560, v1: -127, v2: 128, y: 720};
  const pairs = [1, 127, 254];
  const ax = p('p12', 0, 20);
  return (
    <g opacity={o}>
      <Fp32 hex="3F800001" y={A_Y} draw={p('p11', 0, 24)} focus={['E']} />
      <Fp32 hex="3FC00000" y={B_Y} draw={p('p11', 6, 24)} focus={['E']} />
      <g opacity={p('p11', 20, 14)}>
        <Bracket x1={x1} x2={x2} y={368} stroke={C.clay} />
        <Formula x={(x1 + x2) / 2} y={414} size={30} color={C.clayInk} terms={[{t: 'ea = eb = 01111111'}, {t: '₂'}, {t: ' = 127'}]} />
      </g>
      <g opacity={ax}>
        <Txt x={300} y={E.y + 10} anchor="end" size={30} color={C.clayInk}>
          阶码
        </Txt>
        <Txt x={300} y={X.y + 10} anchor="end" size={30}>
          指数
        </Txt>
      </g>
      <Axis a={E} draw={ax} ticks={pairs.map((v) => ({v, label: String(v), color: C.clayInk}))} />
      <Axis a={X} draw={p('p12', 10, 20)} ticks={pairs.map((v) => ({v: v - 127, label: String(v - 127).replace('-', '−')}))} />
      {pairs.map((v, i) => (
        <RLine key={v} x1={axisX(E, v)} y1={E.y + 64} x2={axisX(E, v)} y2={X.y - 26} stroke={C.clay} sw={2} dash draw={p('p12', 24 + i * 6, 14)} />
      ))}
      <Txt x={axisX(E, 127) + 18} y={626} size={30} mono color={C.clayInk} opacity={p('p12', 40, 12)}>
        − 127
      </Txt>
    </g>
  );
};

// p13–p15：两个指数相加，再加回 127 存成阶码；代入例子用竖式算
const Sum: React.FC = () => {
  const {p, span} = useT();
  const o = span('p13', 'p16', 14);
  if (o <= 0) return null;
  const clay = C.clayInk;
  const back = p('p14', 0, 16);
  return (
    <g opacity={o}>
      <Txt x={960} y={220} anchor="middle" size={30} color={C.ink2} opacity={1 - back}>
        积的指数 = 两个指数相加
      </Txt>
      <Txt x={960} y={220} anchor="middle" size={30} color={C.ink2} opacity={back}>
        再加回一个 127，存成阶码
      </Txt>
      <Formula
        x={960}
        y={320}
        size={44}
        opacity={p('p13', 0, 16)}
        terms={[
          {t: 'e₀ = ', color: clay, o: back},
          {t: '('},
          {t: 'ea', color: clay},
          {t: ' − 127) + ('},
          {t: 'eb', color: clay},
          {t: ' − 127)'},
          {t: ' + 127', color: clay, o: back},
        ]}
      />
      <Formula
        x={960}
        y={410}
        size={44}
        opacity={p('p14', 24, 16)}
        terms={[{t: '= ', color: clay}, {t: 'ea', color: clay}, {t: ' + '}, {t: 'eb', color: clay}, {t: ' − 127'}]}
      />
      <Column
        right={1010}
        y={530}
        size={44}
        rows={[
          {text: '127', o: p('p15', 0, 12)},
          {text: '127', op: '+', o: p('p15', 8, 12)},
          {text: '254', o: p('p15', 24, 12)},
          {text: '127', op: '−', o: p('p15', 34, 12)},
          {text: '127', color: clay, o: p('p15', 50, 12)},
        ]}
        rules={[
          {after: 1, draw: p('p15', 16, 10)},
          {after: 3, draw: p('p15', 42, 10)},
        ]}
      />
      <Txt x={1080} y={768} size={34} mono color={clay} opacity={p('p15', 56, 12)}>
        = e₀
      </Txt>
    </g>
  );
};

// p16–p18：阶码和可能的范围落在数轴上，9 位带符号装不下，10 位装得下
const Range: React.FC = () => {
  const {p} = useT();
  const o = p('p16', 8, 14);
  if (o <= 0) return null;
  const a: AxisScale = {x1: 260, x2: 1660, v1: -540, v2: 540, y: 520};
  const nine = p('p18', 20, 20);
  const ten = p('p18', 70, 20);
  return (
    <g opacity={o}>
      <Axis
        a={a}
        draw={p('p16', 0, 22)}
        ticks={[
          {v: 0, label: '0'},
          {v: -256, label: '−256', o: nine},
          {v: 255, label: '255', o: nine},
          {v: -512, label: '−512', o: ten},
          {v: 511, label: '511', o: ten},
        ]}
      />
      <Span a={a} from={1} to={254} closedTo color={C.clay} ink={C.clayInk} label="规格化数的阶码 1 … 254" size={26} draw={p('p16', 20, 20)} />
      <g opacity={p('p17', 0, 14)}>
        <Formula x={axisX(a, -125)} y={380} size={34} terms="1 + 1 − 127 = −125" color={C.clayInk} />
        <Mark a={a} v={-125} color={C.clayInk} label="−125" below />
      </g>
      <g opacity={p('p17', 30, 14)}>
        <Formula x={axisX(a, 381)} y={380} size={34} terms="254 + 254 − 127 = 381" color={C.clayInk} />
        <Mark a={a} v={381} color={C.clayInk} label="381" below />
      </g>
      <Span a={a} from={-256} to={255} closedTo color={C.muted} ink={C.ink2} lift={-120} label="9 位带符号：−256 … 255，381 放不下" size={26} draw={nine} />
      <Span a={a} from={-512} to={511} closedTo color={C.clay} ink={C.clayInk} lift={-220} label="10 位带符号：−512 … 511" size={26} draw={ten} />
    </g>
  );
};

export const Exponent: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p11') || f >= s('k02')) return null;
  return (
    <g>
      <Bias />
      <Sum />
      <Range />
    </g>
  );
};
