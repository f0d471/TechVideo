import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RLine, RArrow, RRect, REllipse } from '../../../src/core/rough';
import { Txt, Bracket, Chip } from '../../../src/components/Prims';
import { Bits32, Card, Caption, MathText, MathCaption } from './Elements';

// p52–p53：阶码全零、尾数全零对应零。
const Zero: React.FC = () => {
  const { p, span } = useT();
  const o = span('p52', 'p54', 14);
  if (o <= 0) return null;
  const pair = p('p53', 0, 14);
  return <g opacity={o}>
    <Caption text="E = 0       f = 0" y={432} mono opacity={p('p52', 8, 14)} />
    <g opacity={1 - pair}>
      <RRect x={480} y={490} w={960} h={290} fill={C.paper} stroke={C.ink2} draw={p('p52', 8, 22)} />
      <Txt x={960} y={606} anchor="middle" mono size={52}>00000000</Txt>
      <Txt x={960} y={704} anchor="middle" mono size={52}>+0</Txt>
    </g>
    <g opacity={pair}>
      <Card x={250} y={505} w={620} h={245} label="00000000" labelSize={44} mono draw={p('p53', 8, 22)} />
      <Card x={1050} y={505} w={620} h={245} label="80000000" labelSize={44} mono draw={p('p53', 8, 22)} />
      <Txt x={560} y={710} anchor="middle" mono size={44}>+0</Txt>
      <Txt x={1360} y={710} anchor="middle" mono size={44}>−0</Txt>
    </g>
    <Caption text="只有符号位不同：正零与负零" y={825} opacity={p('p53', 8, 14)} />
  </g>
};
// p54–p59：非规格数与规格化边界。
const Subnormal: React.FC = () => {
  const { p, span } = useT(); const o = span('p54', 'p60', 14); if (o <= 0) return null; const edge = p('p57', 0, 14); return <g opacity={o}>
    <g opacity={1 - edge}>
      <Caption text="E = 0       f ≠ 0" y={427} mono opacity={p('p54', 8, 14)} />
      <Txt x={655} y={560} mono size={52} color={C.blueInk} opacity={p('p54', 8, 14)}>0.f</Txt>
      <MathText text="× 2^(-126)" x={945} y={560} size={52} color={C.clayInk} opacity={p('p55', 8, 14)} />
      <REllipse cx={672} cy={542} w={67} h={82} stroke={C.blue} draw={p('p54', 8, 22)} />
      <Txt x={590} y={661} size={28} color={C.blueInk}>隐含首位为 0</Txt>
      <Txt x={1030} y={661} size={28} color={C.clayInk} opacity={p('p55', 8, 14)}>幂固定用 −126</Txt>
      <Chip x={650} y={760} w={620} opacity={p('p56', 8, 14)} draw={p('p56', 8, 22)}><Txt x={960} y={803} anchor="middle" size={32}>非规格数</Txt>
      </Chip>
    </g>
    <g opacity={edge}>
      <g opacity={1 - p('p58', 0, 12)}>
        <RRect x={330} y={430} w={1260} h={370} fill={C.paper} stroke={C.ink2} draw={p('p57', 8, 22)} />
        <Txt x={960} y={520} anchor="middle" size={44}>最小的正规格化数</Txt>
        <Txt x={600} y={670} anchor="middle" mono size={46}>00800000</Txt>
        <MathText text="1.0_2 × 2^(-126)" x={1270} y={670} anchor="middle" size={44} />
      </g>
      <g opacity={p('p58', 0, 12)}>
        <Txt x={220} y={415} size={28} color={C.muted}>越过规格化数的下边界</Txt>
        {[
          ['最小的正规格化数', '00800000', '1.0_2 × 2^(-126)', '2^(-126)', p('p57', 8, 14)],
          ['再小一半', '00400000', '0.1_2 × 2^(-126)', '2^(-127)', p('p58', 8, 14)],
          ['只剩末位的 1', '00000001', '2^(-23) × 2^(-126)', '2^(-149)', p('p59', 8, 14)],
        ].map(([label, hex, form, value, alpha], i) => <g key={i} opacity={Number(alpha)}>
          <Txt x={220} y={500 + i * 125} size={28}>{label}</Txt>
          <Txt x={660} y={500 + i * 125} mono size={30}>{hex}</Txt>
          <MathText text={String(form)} x={1060} y={500 + i * 125} size={28} />
          <MathText text={String(value)} x={1630} y={500 + i * 125} size={36} anchor="middle" />
          <RLine x1={200} y1={534 + i * 125} x2={1760} y2={534 + i * 125} stroke={C.rule} sw={1.6} />
        </g>)}
      </g>
    </g>
  </g>
};

// p60–p64：无穷、NaN 及无穷乘零。
const NonFinite: React.FC = () => {
  const { p, span } = useT(); const o = span('p60', 'p65', 14); if (o <= 0) return null; const nan = p('p62', 0, 14); return <g opacity={o}>
    <Caption text="E = 255（8 位全 1）" y={424} mono opacity={p('p61', 8, 14) * (1 - nan) + p('p63', 8, 14) * nan} />
    <g opacity={1 - nan}><Caption text="f = 0" y={508} mono opacity={p('p61', 8, 14)} />
      <g opacity={p('p60', 8, 14) * (1 - p('p61', 0, 12))}>
        <RRect x={430} y={555} w={1060} h={225} fill={C.paper} stroke={C.ink2} draw={p('p60', 8, 22)} />
        <Txt x={960} y={652} anchor="middle" mono size={52}>E = 255 · f = 0</Txt>
        <Txt x={960} y={730} anchor="middle" size={34}>有限数以外的编码</Txt>
      </g>
      <g opacity={p('p61', 8, 14)}>
        <RRect x={270} y={560} w={620} h={255} fill={C.paper} stroke={C.ink2} draw={p('p61', 8, 22)} />
        <RRect x={1030} y={560} w={620} h={255} fill={C.paper} stroke={C.ink2} draw={p('p61', 8, 22)} />
        <Txt x={580} y={662} anchor="middle" mono size={52}>+∞</Txt>
        <Txt x={1340} y={662} anchor="middle" mono size={52}>−∞</Txt>
        <Txt x={580} y={748} anchor="middle" mono size={34}>7F800000</Txt>
        <Txt x={1340} y={748} anchor="middle" mono size={34}>FF800000</Txt>
      </g>
    </g>
    <g opacity={nan}><Caption text="f ≠ 0" y={505} mono opacity={p('p63', 8, 14)} />
      <g opacity={1 - p('p63', 0, 12)}>
        <RRect x={420} y={535} w={1080} h={280} fill={C.paper} stroke={C.ink2} draw={p('p62', 8, 22)} />
        <Txt x={960} y={620} anchor="middle" mono size={44}>E = 255 · f ≠ 0</Txt>
        <Txt x={960} y={700} anchor="middle" mono size={48}>∞ × 0 → ?</Txt>
        <Txt x={960} y={770} anchor="middle" size={30}>留给无意义的数值结果</Txt>
      </g>
      <g opacity={p('p63', 8, 14)}>
        <RRect x={400} y={550} w={1120} h={260} fill={C.paper} stroke={C.ink2} draw={p('p63', 8, 22)} />
        <Txt x={960} y={647} anchor="middle" size={52}>NaN · 非数</Txt>
        <Txt x={960} y={710} anchor="middle" mono size={36}>Not a Number</Txt>
        <Txt x={960} y={772} anchor="middle" size={27}>7FC00000 是其中一种编码</Txt>
      </g>
      <Caption text="满足 E = 255 且 f ≠ 0 的多种编码" y={857} opacity={p('p64', 8, 14)} />
    </g>
  </g>
};

// p65–p67：非规格数填补靠近零的间隙。
export const Gradual: React.FC = () => {
  const { p, span } = useT(); const o = span('p65', 'p68', 14); if (o <= 0) return null; return <g opacity={o}>
    <Txt x={98} y={161} size={30}>从最小规格化数，向 0 延伸</Txt>
    <RLine x1={290} y1={350} x2={825} y2={350} stroke={C.ink2} draw={p('p65', 8, 24)} />
    <RLine x1={1185} y1={350} x2={1670} y2={350} stroke={C.ink2} draw={p('p65', 8, 24)} />
    <Txt x={1005} y={362} mono size={38} anchor="middle">…</Txt>
    {[340, 485, 630, 775, 1355, 1500].map((x, i) => <RLine key={i} x1={x} y1={335} x2={x} y2={365} stroke={C.ink2} draw={p('p65', 8, 22)} />)}
    <Txt x={340} y={414} mono size={28} anchor="middle">0</Txt>
    <MathText text="2^(-149)" x={485} y={462} size={28} anchor="middle" />
    <MathText text="2^(-148)" x={630} y={414} size={28} anchor="middle" />
    <MathText text="2^(-126)" x={1500} y={414} size={28} anchor="middle" />
    <Txt x={1190} y={460} size={24} color={C.muted}>非规格数</Txt>
    <Bracket x1={340} x2={485} y={497} draw={p('p65', 8, 22)} />
    <MathText text="2^(-149)" x={412} y={541} size={24} anchor="middle" />
    <g opacity={p('p66', 8, 14)}>
      <Txt x={400} y={644} mono size={36} color={C.blueInk}>0.10000000000000000000000</Txt>
      <Txt x={400} y={721} mono size={36} color={C.blueInk}><tspan fill={C.faint}>0.0000000000000000000000</tspan>1</Txt>
      <Txt x={1540} y={644} size={28}>可用 23 位</Txt>
      <Txt x={1540} y={721} size={28}>只剩 1 位</Txt>
    </g>
    <Caption text="逐渐下溢 · 可用的有效位逐渐减少" y={817} opacity={p('p67', 8, 14)} />
    <Txt x={960} y={870} anchor="middle" size={24} color={C.muted} opacity={p('p67', 16, 14)}>贴 0 太近的数，仍可能存成 0</Txt>
  </g>
};

// p52–p67：特殊编码和逐渐下溢。
export const Special: React.FC = () => {
  const { p, span } = useT();
  const o = span('p52', 'p65', 14);
  if (o <= 0) return null;
  const hex = p('p62') > 0 ? '7FC00000'
    : p('p60') > 0 ? '7F800000'
      : p('p59') > 0 ? '00000001'
        : p('p58') > 0 ? '00400000'
          : p('p57') > 0 ? '00800000'
            : p('p54') > 0 ? '00400000'
              : p('p53') > 0 ? '80000000' : '00000000';
  return <g opacity={o}>
    <Txt x={98} y={156} size={30}>特殊编码 · 先看阶码</Txt>
    <Txt x={1820} y={156} mono anchor="end" size={28} color={C.muted}>{hex}</Txt>
    <Bits32 hex={hex} labels={false} draw={p('p52', 8, 24)} />
    <Txt x={98} y={337} size={27} color={C.greenInk}>符号位 s</Txt>
    <Txt x={365} y={337} size={27} anchor="middle" color={C.clayInk}>阶码 E</Txt>
    <Txt x={1230} y={337} size={27} anchor="middle" color={C.blueInk}>小数位 f</Txt>
    <Zero />
    <Subnormal />
    <NonFinite />
  </g>
};
