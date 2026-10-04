import React from 'react';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {BAR_ALL, BarLit, FormulaBar} from './scenes/Kit';
import {Opening} from './scenes/Opening';
import {Store} from './scenes/Store';
import {Speed} from './scenes/Speed';
import {Pipe} from './scenes/Pipe';
import {ModulesPart} from './scenes/Modules';
import {Flow} from './scenes/Flow';
import {CodePart} from './scenes/Code';
import manifest from './build/manifest.json';

// 部分与部件卡：部件卡是无旁白的 beat k01–k06
const PARTS: Part[] = [
  {no: '00', title: '每拍交一个结果', from: 'p01'},
  {no: '01', title: '存数', from: 'k01'},
  {no: '02', title: '时钟能多快', from: 'k02'},
  {no: '03', title: '流水线', from: 'k03'},
  {no: '04', title: '输出也存一拍', from: 'k04'},
  {no: '05', title: '每拍一个结果', from: 'k05'},
  {no: '06', title: '写成代码', from: 'k06'},
];
const CARDS = [
  {beat: 'k01', until: 'p04', no: '01', title: '存数', question: '数怎样在电路里存下来'},
  {beat: 'k02', until: 'p22', no: '02', title: '时钟能多快', question: '一拍最短能有多长'},
  {beat: 'k03', until: 'p36', no: '03', title: '流水线', question: '一条长路怎样切成几拍'},
  {beat: 'k04', until: 'p52', no: '04', title: '输出也存一拍', question: '结果交给别的模块时要注意什么'},
  {beat: 'k05', until: 'p61', no: '05', title: '每拍一个结果', question: '哪一拍的结果才算数'},
  {beat: 'k06', until: 'c01', no: '06', title: '写成代码', question: '存数的电路在代码里怎么写'},
];

// 公式条各阶段亮哪几项、哪几项画下划线；从这一行的 beat 起生效，12 帧内渐变
// （outline.md：开场整条 45%；组合逻辑延迟 p06、时钟周期 p11、建立时间 p22、时钟到输出延迟 p25；
// p29 整条亮起；p36–p43 讲组合逻辑延迟被切短，代码段整条亮不加下划线）
const STATES: {at: string; lit: BarLit; under: Partial<BarLit>}[] = [
  {at: 'p01', lit: {T: 0.45, Q: 0.45, D: 0.45, S: 0.45}, under: {}},
  {at: 'p06', lit: {T: 0.45, Q: 0.45, D: 1, S: 0.45}, under: {D: 1}},
  {at: 'p11', lit: {T: 1, Q: 0.45, D: 1, S: 0.45}, under: {D: 1, T: 1}},
  {at: 'p22', lit: {T: 1, Q: 0.45, D: 1, S: 1}, under: {D: 1, T: 1, S: 1}},
  {at: 'p25', lit: BAR_ALL, under: {D: 1, T: 1, S: 1, Q: 1}},
  {at: 'p29', lit: BAR_ALL, under: {}},
  {at: 'p36', lit: BAR_ALL, under: {D: 1}},
  {at: 'k06', lit: BAR_ALL, under: {}},
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
  const lit = {} as BarLit;
  for (const r of ['T', 'Q', 'D', 'S'] as const) lit[r] = prev.lit[r] * (1 - t) + cur.lit[r] * t;
  const under: Partial<BarLit> = {};
  for (const r of ['T', 'Q', 'D', 'S'] as const) {
    const pv = (prev.under[r] ?? 0) * (1 - t);
    const cv = (cur.under[r] ?? 0) * p(cur.at, 6, 18);
    under[r] = Math.max(pv, cv);
  }
  return <FormulaBar lit={lit} under={under} />;
};

// 部件卡期间藏起小节标签，免得卡上宣布下一部分、角上还挂着上一小节
const TagExceptCards: React.FC = () => {
  const {span} = useT();
  const cardO = Math.max(...CARDS.map((c) => span(c.beat, c.until, 8)));
  if (cardO >= 1) return null;
  return (
    <g opacity={1 - cardO}>
      <SectionTag parts={PARTS} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  const inCard =
    (f >= s('k01') && f < s('p04')) ||
    (f >= s('k02') && f < s('p22')) ||
    (f >= s('k03') && f < s('p36')) ||
    (f >= s('k04') && f < s('p52')) ||
    (f >= s('k05') && f < s('p61')) ||
    (f >= s('k06') && f < s('c01'));
  if (inCard) return null;
  return (
    <>
      <Opening />
      <Store />
      <Speed />
      <Pipe />
      <ModulesPart />
      <Flow />
      <CodePart />
    </>
  );
};

const Scenes: React.FC = () => (
  <>
    <TitleCard
      eyebrow="FP32 是怎么计算的 · 第 6 集"
      title="寄存器与流水线"
      subtitle="一条长路，怎样每一拍都交出一个结果"
      inBeat="t00"
      outBeat="p01"
      underline={[500, 608, 1420, 604]}
    />
    <Header />
    <TagExceptCards />
    <Body />
    {CARDS.map((c) => (
      <PartCard key={c.beat} {...c} />
    ))}
  </>
);

export default defineVideo('fp32-pipeline', manifest as Manifest, Scenes);
