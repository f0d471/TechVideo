import React from 'react';
import {C} from '../../src/core/theme';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest, useT} from '../../src/core/timeline';
import {RLine} from '../../src/core/rough';
import {Part, PartCard, SectionTag, TitleCard} from '../../src/components/Frame';
import {Formula} from '../../src/components/Formula';
import {textWidth} from '../../src/components/Label';
import {Carry, OpeningScene} from './scenes/Carry';
import {Boundary} from './scenes/Boundary';
import {Select} from './scenes/Select';
import {Code} from './scenes/Code';
import manifest from './build/manifest.json';

const PARTS: Part[] = [
  {no: '00', title: '边界', from: 'p01'},
  {no: '01', title: '尾数进位', from: 'k01'},
  {no: '02', title: '上溢与下溢', from: 'k02'},
  {no: '03', title: '写回与代码', from: 'k03'},
];

const CARDS = [
  {beat: 'k01', until: 'p04', no: '01', title: '尾数进位', question: '尾数加一后满出来怎么办'},
  {beat: 'k02', until: 'p14', no: '02', title: '上溢与下溢', question: '阶码超出能存的范围怎么办'},
  {beat: 'k03', until: 'p23', no: '03', title: '写回与代码', question: '三种结果怎样拼成 32 位'},
];

// 顶部公式条：左尾数进位、右边界写法，随部分点亮，三种写法起全亮
const BAR = [
  {x: 700, text: '尾数进位：右移一位、阶码 + 1', color: C.blueInk, line: C.blue, from: 'p04'},
  {x: 1490, text: '≥ 255 → ±∞ ｜ ≤ 0 → ±0', color: C.clayInk, line: C.clay, from: 'p14'},
];

const Header: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p01')) return null;
  const all = f >= s('p23');
  return (
    <g opacity={p('p01', 0, 18)}>
      {BAR.map((b) => {
        const on = all || f >= s(b.from) ? 1 : 0;
        const w = textWidth(b.text, 30, false);
        return (
          <g key={b.text} opacity={0.45 + 0.55 * on}>
            <Formula x={b.x} y={88} size={30} terms={b.text} color={b.color} mono={false} />
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
  if ((f >= s('k01') && f < s('p04')) || (f >= s('k02') && f < s('p14')) || (f >= s('k03') && f < s('p23'))) return null;
  return (
    <>
      <OpeningScene />
      <Carry />
      <Boundary />
      <Select />
      <Code />
    </>
  );
};

const Scenes: React.FC = () => (
  <>
    <TitleCard
      eyebrow="FP32 是怎么计算的 · 第 5 集"
      title="舍入之后"
      subtitle="尾数进位、上溢与下溢"
      inBeat="t00"
      outBeat="p01"
      underline={[830, 600, 1090, 596]}
    />
    <Header />
    <SectionTag parts={PARTS} />
    <Body />
    {CARDS.map((c) => (
      <PartCard key={c.beat} {...c} />
    ))}
  </>
);

export default defineVideo('fp32-boundary', manifest as Manifest, Scenes);
