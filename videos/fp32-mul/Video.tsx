import React from 'react';
import {C} from '../../src/core/theme';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {RLine} from '../../src/core/rough';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {Formula} from '../../src/components/Formula';
import {textWidth} from '../../src/components/Label';
import {Opening} from './scenes/Opening';
import {Sign} from './scenes/Sign';
import {Exponent} from './scenes/Exponent';
import {Mantissa} from './scenes/Mantissa';
import {Special} from './scenes/Special';
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
  {beat: 'k02', until: 'p19', no: '02', title: '尾数积', question: '两个 24 位尾数怎样乘出 48 位的积'},
  {beat: 'k03', until: 'p33', no: '03', title: '特殊值与代码', question: '零、无穷和 NaN 怎样处理'},
];

// 顶部公式条：三路的式子常驻，讲到哪一路那一路亮起并加下划线，其余降到 45%
const BAR = [
  {x: 620, text: 's = sa ⊕ sb', color: C.greenInk, line: C.green, from: 'p07', to: 'p11'},
  {x: 1080, text: 'e₀ = ea + eb − 127', color: C.clayInk, line: C.clay, from: 'p11', to: 'k02'},
  {x: 1540, text: 'm = ma × mb', color: C.blueInk, line: C.blue, from: 'k02', to: 'p30'},
];
const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  const all = f >= s('p30');
  return (
    <g opacity={p('p01', 0, 18)}>
      {BAR.map((b) => {
        const on = all || (f >= s(b.from) && f < s(b.to)) ? 1 : 0;
        const w = textWidth(b.text, 30, true);
        return (
          <g key={b.text} opacity={0.45 + 0.55 * on}>
            <Formula x={b.x} y={88} size={30} terms={b.text} color={b.color} />
            {on > 0 && !all && <RLine x1={b.x - w / 2} y1={104} x2={b.x + w / 2} y2={104} stroke={b.line} sw={3} draw={p(b.from, 0, 16)} />}
          </g>
        );
      })}
      <RLine x1={96} y1={136} x2={1824} y2={136} stroke={C.rule} sw={1.6} />
    </g>
  );
};

const Body: React.FC = () => {
  const {f, s} = useT();
  if ((f >= s('k01') && f < s('p07')) || (f >= s('k02') && f < s('p19')) || (f >= s('k03') && f < s('p33'))) return null;
  return (
    <>
      <Opening />
      <Sign />
      <Exponent />
      <Mantissa />
      <Special />
      <Code />
    </>
  );
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
    {CARDS.map((c) => (
      <PartCard key={c.beat} {...c} />
    ))}
  </>
);

export default defineVideo('fp32-mul', manifest as Manifest, Scenes);
