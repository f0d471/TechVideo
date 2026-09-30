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

const PARTS: Part[] = [
  {no: '00', title: '一格里的乘法', from: 'p01'},
  {no: '01', title: '符号与阶码', from: 'k01'},
  {no: '02', title: '尾数积', from: 'k02'},
  {no: '03', title: '特殊值与代码', from: 'k03'},
];

const CARDS = [
  {beat: 'k01', until: 'p07', no: '01', title: '符号与阶码', question: '正负和二的几次方分别怎么得到'},
  {beat: 'k02', until: 'p19', no: '02', title: '尾数积', question: '两束 24 位尾数怎样形成完整的积'},
  {beat: 'k03', until: 'p32', no: '03', title: '特殊值与代码', question: '普通乘法之外还要选什么结果'},
];

const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  const cells = [
    {x: 650, w: 320, color: C.green, fill: C.greenTint, label: '符号  s = sa ⊕ sb', on: 'p07'},
    {x: 982, w: 440, color: C.clay, fill: C.clayTint, label: '阶码和  e₀ = ea + eb − 127', on: 'p11'},
    {x: 1434, w: 390, color: C.blue, fill: C.blueTint, label: '尾数积  m = ma × mb', on: 'p19'},
  ];
  return (
    <g opacity={p('p01', 0, 18)}>
      {cells.map((v) => (
        <g key={v.on} opacity={0.36 + 0.64 * p(v.on, 0, 14)}>
          <RRect x={v.x} y={42} w={v.w} h={58} stroke={v.color} fill={v.fill} sw={2} roughness={0.5} />
          <Txt x={v.x + v.w / 2} y={79} anchor="middle" size={23} color={C.ink}>
            {v.label}
          </Txt>
        </g>
      ))}
      <RLine x1={96} y1={136} x2={1824} y2={136} stroke={C.rule} sw={1.6} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  if ((f >= s('k01') && f < s('p07')) ||
      (f >= s('k02') && f < s('p19')) ||
      (f >= s('k03') && f < s('p32'))) return null;
  return <><Principle /><Code /></>;
};

const Scenes: React.FC = () => (
  <>
    <TitleCard
      eyebrow="FP32 是怎么计算的 · 第 2 集"
      title="两个浮点数相乘"
      subtitle="符号、阶码、尾数，分别怎样算"
      inBeat="t00"
      outBeat="p01"
      underline={[690, 600, 1230, 596]}
    />
    <Header />
    <SectionTag parts={PARTS} />
    <Body />
    {CARDS.map((c) => <PartCard key={c.beat} {...c} />)}
  </>
);

export default defineVideo('fp32-mul', manifest as Manifest, Scenes);
