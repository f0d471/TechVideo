import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine, RRect} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Arrow, Bars, Box, Card, CiteCard, MathText, bottom, left, right, top} from './Kit';

// 04 推理芯片的取舍 p70–p82：非规格数多一步 → 实测有多慢 → 推理芯片冲零 → 两路结果 → 业界的选择

// p70：规格化数直接乘；非规格数先把前面的 0 挪掉，凑回 1.F 才能算
const Cost: React.FC = () => {
  const {p, span} = useT();
  const o = span('p70', 'p71', 14);
  if (o <= 0) return null;
  const n1: Box = {x: 300, y: 300, w: 360, h: 110};
  const m1: Box = {x: 1260, y: 300, w: 360, h: 110};
  const n2: Box = {x: 300, y: 560, w: 360, h: 110};
  const s2: Box = {x: 780, y: 560, w: 360, h: 110};
  const m2: Box = {x: 1260, y: 560, w: 360, h: 110};
  return (
    <g opacity={o}>
      <Card b={n1} label="规格化数" size={34} draw={p('p70', 0, 16)} />
      <Card b={m1} label="相乘" size={34} draw={p('p70', 6, 16)} />
      <Arrow from={right(n1)} to={left(m1)} draw={p('p70', 6, 14)} />
      <Card b={n2} label="非规格数" size={34} color={C.blueInk} stroke={C.blue} draw={p('p70', 24, 16)} />
      <Card b={s2} label="挪掉前面的 0" size={32} color={C.clayInk} stroke={C.clay} draw={p('p70', 36, 16)} />
      <Card b={m2} label="相乘" size={34} draw={p('p70', 44, 16)} />
      <Arrow from={right(n2)} to={left(s2)} draw={p('p70', 32, 12)} />
      <Arrow from={right(s2)} to={left(m2)} draw={p('p70', 42, 12)} />
      <Txt x={960} y={790} anchor="middle" size={34} color={C.clayInk} opacity={p('p70', 56, 12)}>
        多出来的一步，要多一套电路
      </Txt>
    </g>
  );
};

// p71–p73：2015 年的测量，先长出 4 拍，再长出 200 多拍
const Slow: React.FC = () => {
  const {p, span} = useT();
  const o = span('p71', 'p74', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <CiteCard
        b={{x: 150, y: 190, w: 1100, h: 200}}
        year="2015"
        who="Andrysco 等"
        venue="IEEE S&P"
        title="On Subnormal Floating Point and Abnormal Timing"
        draw={p('p71', 0, 22)}
      />
      <Txt x={150} y={470} size={30} color={C.muted} opacity={p('p72', 0, 12)}>
        电脑常用的 x86 处理器，做一次乘法要几拍
      </Txt>
      <Bars
        x={560}
        y={530}
        w={1100}
        max={200}
        rowH={110}
        rows={[
          {label: '两个规格化数', value: 4, text: '4 拍'},
          {label: '输入非规格数', value: 200, text: '200 多拍', hot: true},
        ]}
        grow={(i) => (i === 0 ? p('p72', 20, 20) : p('p73', 4, 30))}
      />
    </g>
  );
};

// p74–p76：模型里的数够大 → 专门的电路不划算 → 当成 0，这叫 FTZ
const Choice: React.FC = () => {
  const {p, span} = useT();
  const o = span('p74', 'p77', 14);
  if (o <= 0) return null;
  const inBox: Box = {x: 260, y: 470, w: 460, h: 110};
  const outBox: Box = {x: 1200, y: 470, w: 460, h: 110};
  const zin: Box = {x: inBox.x + 80, y: 660, w: 300, h: 100};
  const zout: Box = {x: outBox.x + 80, y: 660, w: 300, h: 100};
  const early = span('p74', 'p76', 12);
  return (
    <g opacity={o}>
      <g opacity={early}>
        <g opacity={p('p74', 4, 14)}>
          <Txt x={1000} y={330} anchor="end" size={48}>
            模型里的数，远大于
          </Txt>
          <MathText text="10^(−38)" x={1024} y={330} size={52} color={C.clayInk} />
        </g>
        <g opacity={p('p75', 0, 12)}>
          <Card b={{x: 560, y: 450, w: 800, h: 130}} label="专门处理非规格数的电路：又大又慢" size={34} color={C.clayInk} stroke={C.clay} />
          <RLine x1={580} y1={600} x2={1340} y2={430} stroke={C.clay} sw={4} roughness={0.6} draw={p('p75', 14, 16)} />
          <Txt x={960} y={660} anchor="middle" size={36} opacity={p('p75', 22, 12)}>
            不划算
          </Txt>
          <Txt x={960} y={790} anchor="middle" size={40} color={C.clayInk} opacity={p('p75', 50, 14)}>
            推理芯片：非规格数一律当成 0
          </Txt>
        </g>
      </g>
      <g opacity={p('p76', 0, 12)}>
        <Card b={inBox} label="输入是非规格数" size={32} color={C.blueInk} stroke={C.blue} draw={p('p76', 4, 16)} />
        <Card b={outBox} label="结果落进这个范围" size={32} color={C.blueInk} stroke={C.blue} draw={p('p76', 24, 16)} />
        <Card b={zin} label="当 0" size={40} color={C.clayInk} stroke={C.clay} draw={p('p76', 14, 16)} />
        <Card b={zout} label="写成 0" size={40} color={C.clayInk} stroke={C.clay} draw={p('p76', 34, 16)} />
        <Arrow from={bottom(inBox)} to={top(zin)} stroke={C.clay} draw={p('p76', 10, 12)} />
        <Arrow from={bottom(outBox)} to={top(zout)} stroke={C.clay} draw={p('p76', 30, 12)} />
        <RRect x={560} y={260} w={800} h={100} stroke={C.ink2} fill={C.paper} sw={2} roughness={0.7} draw={p('p76', 50, 18)} />
        <Txt x={960} y={326} anchor="middle" size={44} opacity={p('p76', 56, 12)}>
          FTZ · flush to zero · 冲成 0
        </Txt>
      </g>
    </g>
  );
};

// p77–p79：同样的乘法，按标准与冲零以后；最后讲代价与换来的东西
const Results: React.FC = () => {
  const {p, span} = useT();
  const o = span('p77', 'p80', 14);
  if (o <= 0) return null;
  const col = [440, 1020, 1480];
  const rows = [
    {ab: '00000001 × 3F800000', std: '00000001', ftz: '00000000', at: 'p77', d: 0},
    {ab: '00800000 × 3F000000', std: '00400000', ftz: '00000000', at: 'p78', d: 0},
    {ab: '80000001 × 3F800000', std: '80000001', ftz: '80000000（−0）', at: 'p78', d: 50},
  ];
  return (
    <g opacity={o}>
      <g opacity={1 - p('p79', 0, 12) * 0.75}>
        {['a × b', '按标准', '冲零以后'].map((h, i) => (
          <Txt key={h} x={col[i]} y={260} anchor="middle" size={32} color={i === 2 ? C.clayInk : C.muted}>
            {h}
          </Txt>
        ))}
        <RLine x1={160} y1={286} x2={1760} y2={286} stroke={C.rule} sw={2} roughness={0.4} />
        {rows.map((r, i) => (
          <g key={r.ab} opacity={p(r.at, r.d, 12)}>
            <Txt x={col[0]} y={370 + i * 110} anchor="middle" mono size={34}>
              {r.ab}
            </Txt>
            <Txt x={col[1]} y={370 + i * 110} anchor="middle" mono size={34} color={C.blueInk}>
              {r.std}
            </Txt>
            <Txt x={col[2]} y={370 + i * 110} anchor="middle" mono size={34} color={C.clayInk} opacity={p(r.at, r.d + 16, 12)}>
              {r.ftz}
            </Txt>
          </g>
        ))}
      </g>
      <g opacity={p('p79', 0, 14)}>
        <Card b={{x: 220, y: 680, w: 620, h: 140}} label="丢掉：几乎碰不到的极小数" size={32} />
        <Card b={{x: 1080, y: 680, w: 620, h: 140}} label="换来：更小更快的乘加单元" size={32} color={C.clayInk} stroke={C.clay} draw={p('p79', 20, 16)} />
      </g>
    </g>
  );
};

// p80–p82：业界的选择与 VAX 的呼应
const Industry: React.FC = () => {
  const {p, span} = useT();
  const o = span('p80', 'k05', 14);
  if (o <= 0) return null;
  const vax: Box = {x: 360, y: 680, w: 440, h: 130};
  const now: Box = {x: 1120, y: 680, w: 440, h: 130};
  return (
    <g opacity={o}>
      <CiteCard
        b={{x: 150, y: 190, w: 1620, h: 250}}
        year="文档"
        who="Google Cloud"
        venue="Cloud TPU · bfloat16"
        title="the bfloat16 on Cloud TPU does not support subnormals,"
        quote="so all subnormals are flushed to zero during the conversion."
        quoteZh="Cloud TPU：转换成 BF16 时不支持非规格数，一律冲成 0"
        draw={p('p80', 0, 22)}
      />
      <Card b={{x: 150, y: 490, w: 500, h: 120}} label="英伟达 GPU：冲零模式" size={32} draw={p('p81', 0, 16)} />
      <Card b={{x: 710, y: 490, w: 500, h: 120}} label="Arm：FZ 位" size={32} draw={p('p81', 20, 16)} />
      <Card b={{x: 1270, y: 490, w: 500, h: 120}} label="x86：DAZ 管输入 · FTZ 管结果" size={30} draw={p('p81', 44, 16)} />
      <g opacity={p('p82', 0, 14)}>
        <Card b={vax} label="当年的 VAX" sub="太小的数当成 0" size={36} />
        <Card b={now} label="今天的推理芯片" sub="非规格数冲成 0" size={36} color={C.clayInk} stroke={C.clay} />
        <Arrow from={right(vax)} to={left(now)} stroke={C.clay} draw={p('p82', 10, 16)} />
      </g>
    </g>
  );
};

export const FtzPart: React.FC = () => {
  const {p} = useT();
  if (p('p70', 0, 1) <= 0) return null;
  return (
    <g>
      <Cost />
      <Slow />
      <Choice />
      <Results />
      <Industry />
    </g>
  );
};
