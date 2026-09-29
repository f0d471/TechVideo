import React from 'react';
import {C} from '../../src/core/theme';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {RLine} from '../../src/core/rough';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {BAR, FormulaBar, Role} from './scenes/Kit';
import {Opening} from './scenes/Opening';
import {WhyFloat} from './scenes/WhyFloat';
import {FieldsPart} from './scenes/Fields';
import {SpecialPart} from './scenes/Special';
import {FtzPart} from './scenes/Ftz';
import {CodePart} from './scenes/Code';
import manifest from './build/manifest.json';

// 部分与部件卡：部件卡是无旁白的 beat k01–k05
const PARTS: Part[] = [
  {no: '00', title: '开场', from: 'p01'},
  {no: '01', title: '为什么是浮点', from: 'k01'},
  {no: '02', title: '三个字段', from: 'k02'},
  {no: '03', title: '特殊值', from: 'k03'},
  {no: '04', title: '推理芯片的取舍', from: 'k04'},
  {no: '05', title: '用结构描述出来', from: 'k05'},
];
const CARDS = [
  {beat: 'k01', until: 'p20', no: '01', title: '为什么是浮点', question: '定点数为什么不够用'},
  {beat: 'k02', until: 'p36', no: '02', title: '三个字段', question: '32 位怎样分成三段'},
  {beat: 'k03', until: 'p57', no: '03', title: '特殊值', question: '零、无穷，和特别小的数'},
  {beat: 'k04', until: 'p70', no: '04', title: '推理芯片的取舍', question: '特别小的数，为什么当成 0'},
  {beat: 'k05', until: 'c01', no: '05', title: '用结构描述出来', question: '这些规则在芯片设计里怎么写'},
];

// 公式条每个阶段亮哪几项、哪几项画下划线；从表里这一行的 beat 起生效，12 帧内渐变
type Lit = Record<Role, number>;
const ALL: Lit = {S: 1, E: 1, F: 1};
const NONE: Lit = {S: 0, E: 0, F: 0};
const STATES: {at: string; lit: Lit; under?: Role[]}[] = [
  {at: 'p01', lit: ALL},
  {at: 'p20', lit: NONE},
  {at: 'p33', lit: {S: 0, E: 1, F: 1}, under: ['E', 'F']},
  {at: 'k02', lit: ALL},
  {at: 'p37', lit: {S: 1, E: 0, F: 0}},
  {at: 'p38', lit: {S: 1, E: 0, F: 0}, under: ['S']},
  {at: 'p39', lit: {S: 0, E: 1, F: 0}},
  {at: 'p43', lit: {S: 0, E: 1, F: 0}, under: ['E']},
  {at: 'p44', lit: {S: 0, E: 0, F: 1}},
  {at: 'p49', lit: {S: 0, E: 0, F: 1}, under: ['F']},
  {at: 'p50', lit: ALL},
  {at: 'k03', lit: {S: 0, E: 1, F: 1}},
  {at: 'k04', lit: {S: 0, E: 1, F: 0}},
  {at: 'k05', lit: ALL},
  {at: 'c10', lit: {S: 0, E: 1, F: 1}},
];

const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  let k = 0;
  STATES.forEach((st, i) => {
    if (f >= s(st.at)) k = i;
  });
  const cur = STATES[k];
  const prev = STATES[Math.max(0, k - 1)];
  const t = k === 0 ? 1 : p(cur.at, 0, 12);
  const lit = {} as Lit;
  for (const r of ['S', 'E', 'F'] as Role[]) lit[r] = prev.lit[r] * (1 - t) + cur.lit[r] * t;
  const under: Partial<Lit> = {};
  for (const r of cur.under ?? []) under[r] = p(cur.at, 6, 18);
  // 开场整条 45%；p18 公式在中央放大，顶部让出来；p19 飞回顶部后全亮
  const intro = f < s('p18') ? 0.45 : f < s('p19') ? 0.45 * (1 - p('p18', 0, 10)) : p('p19', 22, 4);
  const opacity = f < s('k01') ? intro : 1;
  return (
    <g>
      <FormulaBar opacity={opacity} lit={lit} under={under} />
      <RLine x1={96} y1={BAR.ruleY} x2={1824} y2={BAR.ruleY} stroke={C.rule} sw={1.6} roughness={0.3} draw={p('p01', 0, 20)} />
    </g>
  );
};

const Scenes: React.FC = () => (
  <>
    <TitleCard eyebrow="FP32 是怎么计算的 · 第 1 集" title="IEEE 754 与 FTZ" subtitle="一个小数，怎样放进 32 位" inBeat="t00" outBeat="p01" underline={[592, 605, 1324, 601]} />
    <Header />
    <SectionTag parts={PARTS} />
    <Opening />
    <WhyFloat />
    <FieldsPart />
    <SpecialPart />
    <FtzPart />
    <CodePart />
    {CARDS.map((c) => (
      <PartCard key={c.beat} {...c} />
    ))}
  </>
);

export default defineVideo('fp32-format', manifest as Manifest, Scenes);
