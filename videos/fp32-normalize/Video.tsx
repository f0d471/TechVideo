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
  {no: '00', title: '写回前的一步', from: 'p01'},
  {no: '01', title: '把积调回一开头', from: 'k01'},
  {no: '02', title: '组合电路', from: 'k02'},
];

const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  return (
    <g opacity={p('p01', 0, 16)}>
      <RRect x={650} y={42} w={520} h={58} stroke={C.blue} fill={C.blueTint} sw={2} roughness={0.5} />
      <Txt x={910} y={79} anchor="middle" size={23}>尾数积 → 首位判断 → 1.F</Txt>
      <RRect x={1182} y={42} w={642} h={58} stroke={C.clay} fill={C.clayTint} sw={2} roughness={0.5} />
      <Txt x={1503} y={79} anchor="middle" size={23}>阶码和 → +0 / +1 → 调整后阶码</Txt>
      <RLine x1={96} y1={136} x2={1824} y2={136} stroke={C.rule} sw={1.6} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  if ((f >= s('k01') && f < s('p05')) || (f >= s('k02') && f < s('c01'))) return null;
  return <><Principle /><Code /></>;
};

const Scenes: React.FC = () => (
  <>
    <TitleCard
      eyebrow="FP32 是怎么计算的 · 第 3 集"
      title="规格化"
      subtitle="尾数积怎样回到 1 开头，又怎样留住掉出的位"
      inBeat="t00"
      outBeat="p01"
      underline={[800, 600, 1120, 596]}
    />
    <Header />
    <SectionTag parts={PARTS} />
    <Body />
    <PartCard beat="k01" until="p05" no="01" title="把积调回一开头" question="两条路径怎样保持数值不变" />
    <PartCard beat="k02" until="c01" no="02" title="组合电路" question="右移、阶码和最低位怎样连成两路" />
  </>
);

export default defineVideo('fp32-normalize', manifest as Manifest, Scenes);
