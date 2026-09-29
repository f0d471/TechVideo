import React from 'react';
import {C} from '../../src/core/theme';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {RLine, RRect} from '../../src/core/rough';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {Txt} from '../../src/components/Prims';
import {Principle} from './scenes/Principle';
import {Code} from './scenes/Code';
import manifest from './build/manifest.json';

// 三部分：选择哪一格、三个位与规则、把规则画成电路
const PARTS: Part[] = [
  {no: '00', title: '选择哪一格', from: 'p01'},
  {no: '01', title: '三个位与规则', from: 'k01'},
  {no: '02', title: '把规则画成电路', from: 'k02'},
];

const CARDS = [
  {beat: 'k01', until: 'p15', no: '01', title: '三个位与规则', question: '哪三个位决定末位加不加一'},
  {beat: 'k02', until: 'c01', no: '02', title: '把规则画成电路', question: '几行代码对应哪些连线和门'},
];

// 顶部保留结构与舍入判定；各字母在原理段第一次定义时点亮
const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  const g = 0.35 + 0.65 * p('p15', 0, 12);
  const sticky = 0.35 + 0.65 * p('p18', 0, 12);
  const l = 0.35 + 0.65 * p('p21', 0, 12);
  const all = 0.35 + 0.65 * p('p23', 0, 12);
  return (
    <g>
      <g opacity={p('p01', 0, 20)}>
        <RRect x={805} y={38} w={300} h={50} stroke={C.ink2} fill={C.paper} sw={1.8} roughness={0.5} />
        <Txt x={955} y={72} anchor="middle" size={24}>保留 24 位，末位 <tspan fill={C.greenInk}>L</tspan></Txt>
        <RRect x={1115} y={38} w={85} h={50} stroke={C.clay} fill={C.clayTint} sw={1.8} roughness={0.5} />
        <Txt x={1158} y={72} anchor="middle" mono size={28} color={C.clayInk} opacity={g}>G</Txt>
        <RRect x={1210} y={38} w={210} h={50} stroke={C.blue} fill={C.blueTint} sw={1.8} roughness={0.5} />
        <Txt x={1315} y={72} anchor="middle" size={24} color={C.blueInk} opacity={sticky}>其余低位 → S</Txt>
        <Txt x={805} y={120} size={31} color={C.ink2} opacity={all}>末位加一 =</Txt>
        <Txt x={1035} y={120} size={34} mono color={C.clayInk} opacity={g}>G</Txt>
        <Txt x={1072} y={120} size={31} color={C.ink2} opacity={all}>与（</Txt>
        <Txt x={1180} y={120} size={34} mono color={C.blueInk} opacity={sticky}>S</Txt>
        <Txt x={1220} y={120} size={31} color={C.ink2} opacity={all}>或</Txt>
        <Txt x={1278} y={120} size={34} mono color={C.greenInk} opacity={l}>L</Txt>
        <Txt x={1318} y={120} size={31} color={C.ink2} opacity={all}>）</Txt>
        <RLine x1={1035} y1={128} x2={1060} y2={128} stroke={C.clay} sw={3} draw={p('p15', 0, 18)} />
        <RLine x1={1180} y1={128} x2={1205} y2={128} stroke={C.blue} sw={3} draw={p('p18', 0, 18)} />
        <RLine x1={1278} y1={128} x2={1303} y2={128} stroke={C.green} sw={3} draw={p('p21', 0, 18)} />
      </g>
      <RLine x1={96} y1={136} x2={1824} y2={136} stroke={C.rule} sw={1.6} roughness={0.3} draw={p('p01', 0, 20)} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  if ((f >= s('k01') && f < s('p15')) || (f >= s('k02') && f < s('c01'))) return null;
  return <><Principle /><Code /></>;
};

const Scenes: React.FC = () => (
  <>
    <TitleCard eyebrow="FP32 是怎么计算的 · 第 4 集" title="舍入" subtitle="多出的低位，末位该不该加一" inBeat="t00" outBeat="p01" />
    <Header />
    <SectionTag parts={PARTS} />
    <Body />
    {CARDS.map((c) => <PartCard key={c.beat} {...c} />)}
  </>
);

export default defineVideo('fp32-rne', manifest as Manifest, Scenes);
