import React from 'react';
import {C} from '../../src/core/theme';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {RLine} from '../../src/core/rough';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {Formula} from '../../src/components/Formula';
import {Principle} from './scenes/Principle';
import {Dropped} from './scenes/Dropped';
import {Code} from './scenes/Code';
import manifest from './build/manifest.json';

const PARTS: Part[] = [
  {no: '00', title: '写回前的一步', from: 'p01'},
  {no: '01', title: '把积调回一开头', from: 'k01'},
  {no: '02', title: '组合电路', from: 'k02'},
];

// 顶部公式条：左边是右移时数值不变的原因，右边是掉出的位怎样留下；讲到哪一条哪一条亮起
const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  const left = f >= s('p09') ? 1 : 0;
  const right = f >= s('p25') ? 1 : 0;
  return (
    <g opacity={p('p01', 0, 16)}>
      <g opacity={0.45 + 0.55 * left}>
        <Formula
          x={880}
          y={88}
          size={30}
          terms={[
            {t: 'm', color: C.blueInk},
            {t: ' × 2'},
            {t: '', sup: 'e', color: C.clayInk},
            {t: ' = ('},
            {t: 'm ÷ 2', color: C.blueInk},
            {t: ') × 2'},
            {t: '', sup: 'e + 1', color: C.clayInk},
          ]}
        />
      </g>
      <g opacity={0.45 + 0.55 * right}>
        <Formula x={1500} y={88} size={30} mono={false} terms="新末位 = 原 bit 1 | 原 bit 0" color={C.greenInk} />
      </g>
      <RLine x1={96} y1={136} x2={1824} y2={136} stroke={C.rule} sw={1.6} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  if ((f >= s('k01') && f < s('p05')) || (f >= s('k02') && f < s('c01'))) return null;
  return (
    <>
      <Principle />
      <Dropped />
      <Code />
    </>
  );
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
    <PartCard beat="k02" until="c01" no="02" title="组合电路" question="右移、阶码加一和最低位怎样连成两路" />
  </>
);

export default defineVideo('fp32-normalize', manifest as Manifest, Scenes);
