import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine} from '../../../src/core/rough';
import {Formula} from '../../../src/components/Formula';
import {Powers} from '../../../src/components/Powers';
import {Bracket, Txt} from '../../../src/components/Prims';
import {bitX} from '../../../src/components/Bits';
import {Fp32, Overview, g32} from './Kit';

// p01–p03：一格输出是一串乘积的和，只看其中一次相乘；两个输入各装着三样东西
const Cell: React.FC = () => {
  const {p, span} = useT();
  const o = span('p01', 'p04', 14);
  if (o <= 0) return null;
  const rest = 1 - 0.7 * p('p02', 0, 16);
  const terms: [number, string, number][] = [
    [400, 'c =', 0],
    [600, 'a₁ × b₁', 8],
    [760, '+', 16],
    [920, 'a₂ × b₂', 20],
    [1080, '+', 28],
    [1240, 'a₃ × b₃', 32],
    [1420, '+ …', 40],
  ];
  const gB = g32(690);
  const brackets: [number, number, string, string][] = [
    [bitX(gB, 31), bitX(gB, 31) + gB.cw, '正负', C.greenInk],
    [bitX(gB, 30), bitX(gB, 23) + gB.cw, '二的几次方', C.clayInk],
    [bitX(gB, 22), bitX(gB, 0) + gB.cw, '有效数字', C.blueInk],
  ];
  return (
    <g opacity={o}>
      <Txt x={960} y={220} anchor="middle" size={32} color={C.ink2} opacity={p('p01', 0, 14)}>
        矩阵乘法的一格：一串乘积加起来
      </Txt>
      {terms.map(([x, t, d], i) => (
        <Formula key={t + x} x={x} y={330} terms={t} size={48} opacity={p('p01', d, 14) * (i === 1 ? 1 : rest)} />
      ))}
      <RLine x1={500} y1={356} x2={700} y2={356} stroke={C.ink} sw={3} draw={p('p02', 0, 16)} />
      <Fp32 hex="3F800001" y={520} draw={p('p02', 12, 26)} plain={p('p03') === 0} />
      <Fp32 hex="3FC00000" y={690} draw={p('p02', 22, 26)} plain={p('p03') === 0} />
      <Powers parts={[['1 + 2', '−23']]} x={1824} y={504} size={30} anchor="end" color={C.ink2} opacity={p('p02', 30, 14)} />
      <Powers parts={[['1.5']]} x={1824} y={674} size={30} anchor="end" color={C.ink2} opacity={p('p02', 40, 14)} />
      {brackets.map(([x1, x2, t, c], i) => (
        <g key={t} opacity={p('p03', 10 + i * 12, 14)}>
          <Bracket x1={x1} x2={x2} y={768} stroke={c} />
          <Txt x={i === 0 ? 98 : (x1 + x2) / 2} y={814} anchor={i === 0 ? 'start' : 'middle'} size={30} color={c}>
            {t}
          </Txt>
        </g>
      ))}
    </g>
  );
};

// p04–p05：十进制科学计数法相乘，三样东西分三路算，再拼回一个数
const Decimal: React.FC = () => {
  const {p, span} = useT();
  const o = span('p04', 'p06', 14);
  if (o <= 0) return null;
  const lanes: [string, string, string, number][] = [
    ['正负', '(−) × (+) → −', C.greenInk, 0],
    ['有效数字', '3 × 2 = 6', C.blueInk, 14],
    ['指数', '2 + 3 = 5', C.clayInk, 28],
  ];
  return (
    <g opacity={o}>
      <Formula
        x={960}
        y={300}
        size={52}
        opacity={p('p04', 0, 16)}
        terms={[
          {t: '(', color: C.ink2},
          {t: '−', color: C.greenInk},
          {t: '3', color: C.blueInk},
          {t: ' × 10'},
          {t: '', sup: '2', color: C.clayInk},
          {t: ')  ×  (', color: C.ink2},
          {t: '2', color: C.blueInk},
          {t: ' × 10'},
          {t: '', sup: '3', color: C.clayInk},
          {t: ')', color: C.ink2},
        ]}
      />
      {lanes.map(([name, f, c, d], i) => (
        <g key={name} opacity={p('p05', d, 14)}>
          <Txt x={760} y={470 + i * 100} anchor="end" size={34} color={c}>
            {name}
          </Txt>
          <Formula x={800} y={470 + i * 100} anchor="start" size={44} terms={f} color={c} />
        </g>
      ))}
      <RLine x1={640} y1={718} x2={1280} y2={718} stroke={C.rule} sw={2} draw={p('p05', 40, 14)} />
      <Formula
        x={960}
        y={800}
        size={52}
        opacity={p('p05', 48, 16)}
        terms={[{t: '= '}, {t: '−', color: C.greenInk}, {t: '6', color: C.blueInk}, {t: ' × 10'}, {t: '', sup: '5', color: C.clayInk}]}
      />
    </g>
  );
};

// p06：浮点数相乘也分三路，三路同时存在
const Lanes: React.FC = () => {
  const {p, span} = useT();
  const o = span('p06', 'k01', 12);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Overview draw={p('p06', 6, 40)} />
    </g>
  );
};

export const Opening: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('k01')) return null;
  return (
    <g>
      <Cell />
      <Decimal />
      <Lanes />
    </g>
  );
};
