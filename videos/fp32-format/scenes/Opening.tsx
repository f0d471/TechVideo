import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RRect} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Arrow, BAR, Bars, Bits32, Box, Card, CiteCard, FIELD_W, FORMULA, Fields3, Formula, MathText, Photo, ROLE, Role, TINT, bottom, layoutMath, left, right, top} from './Kit';

// 开场 p01–p19：推理与乘加 → 数要存成 0 和 1 → 这一集的问题 → 运算量 → 推理芯片 → 数值格式与能耗
// → 为什么拿 FP32 举例 → 核心公式

// p01–p03：对话框逐词写出，旁边一个乘加；数字变成 32 个 0 和 1；这一集的问题
const Intro: React.FC = () => {
  const {p, span} = useT();
  const o = span('p01', 'p04', 14);
  if (o <= 0) return null;
  const words = ['天空', '看起来', '是', '蓝色', '的'];
  // 每个字宽 40（霞鹜文楷 40 号），词间空 14
  const wordX = words.map((_, i) => words.slice(0, i).reduce((w, s) => w + s.length * 40 + 14, 0));
  const bubble: Box = {x: 150, y: 250, w: 700, h: 300};
  const a: Box = {x: 1000, y: 250, w: 150, h: 90};
  const b: Box = {x: 1000, y: 420, w: 150, h: 90};
  const mul: Box = {x: 1260, y: 335, w: 120, h: 90};
  const add: Box = {x: 1490, y: 335, w: 120, h: 90};
  const sum: Box = {x: 1490, y: 560, w: 120, h: 90};
  const mac = span('p01', 'p02', 12);
  return (
    <g opacity={o}>
      <g opacity={span('p01', 'p02', 12)}>
        <Card b={bubble} draw={p('p01', 0, 20)} />
        <Txt x={bubble.x + 40} y={bubble.y + 70} size={30} color={C.muted} opacity={p('p01', 8, 12)}>
          问：天空为什么是蓝的
        </Txt>
        {words.map((w, i) => (
          <Txt key={w} x={bubble.x + 40 + wordX[i]} y={bubble.y + 160} size={40} opacity={p('p01', 14 + i * 8, 10)}>
            {w}
          </Txt>
        ))}
        <Txt x={bubble.x + 40} y={bubble.y + 240} size={26} color={C.muted} opacity={p('p01', 40, 12)}>
          推理：用训练好的模型回答问题
        </Txt>
      </g>
      <g opacity={mac}>
        <Card b={a} label="a" mono size={40} draw={p('p01', 60, 16)} />
        <Card b={b} label="b" mono size={40} draw={p('p01', 60, 16)} />
        <Card b={mul} label="×" mono size={44} draw={p('p01', 70, 16)} />
        <Card b={add} label="+" mono size={44} draw={p('p01', 80, 16)} />
        <Card b={sum} label="总和" size={30} draw={p('p01', 80, 16)} />
        <Arrow from={right(a)} to={left(mul)} draw={p('p01', 70, 12)} />
        <Arrow from={right(b)} to={left(mul)} draw={p('p01', 70, 12)} />
        <Arrow from={right(mul)} to={left(add)} draw={p('p01', 80, 12)} />
        <Arrow from={bottom(add)} to={top(sum)} draw={p('p01', 88, 12)} />
        <Txt x={1310} y={770} anchor="middle" size={44} opacity={p('p01', 90, 14)}>
          乘加
        </Txt>
      </g>
      {/* p02：一个数在芯片里是一串 0 和 1 */}
      <g opacity={span('p02', 'p03', 12)}>
        <Txt x={960} y={330} anchor="middle" mono size={52} opacity={p('p02', 4, 12)}>
          1.5
        </Txt>
        <Arrow from={{x: 960, y: 350}} to={{x: 960, y: 440}} draw={p('p02', 12, 14)} />
        <Bits32 hex="3FC00000" y={460} plain index={false} draw={p('p02', 18, 22)} />
        <Txt x={960} y={640} anchor="middle" size={36} opacity={p('p02', 50, 14)}>
          怎么存 → 每次运算的代价
        </Txt>
      </g>
      {/* p03：这一集的问题 */}
      <g opacity={p('p03', 0, 12)}>
        <Bits32 y={460} plain blank index={false} />
        <Txt x={960} y={340} anchor="middle" size={44} opacity={p('p03', 10, 14)}>
          一个小数，怎样装进 32 个 0 和 1
        </Txt>
        <Txt x={960} y={640} anchor="middle" size={36} color={C.clayInk} opacity={p('p03', 40, 14)}>
          还要大数小数都存得准
        </Txt>
      </g>
    </g>
  );
};

// p04–p06：参数、运算量的论文、每个词约 70 亿次乘加
const Scale: React.FC = () => {
  const {p, span} = useT();
  const o = span('p04', 'p07', 14);
  if (o <= 0) return null;
  const model: Box = {x: 150, y: 220, w: 620, h: 420};
  const vals = ['0.12', '−0.83', '1.07', '0.44', '−0.29', '0.91', '−1.35', '0.06', '0.58', '−0.72', '0.33', '1.21'];
  return (
    <g opacity={o}>
      <Card b={model} draw={p('p04', 0, 20)} />
      <Txt x={model.x + model.w / 2} y={model.y + 60} anchor="middle" size={32} opacity={p('p04', 6, 12)}>
        模型
      </Txt>
      {vals.map((v, i) => (
        <Txt key={i} x={model.x + 90 + (i % 4) * 150} y={model.y + 150 + Math.floor(i / 4) * 80} anchor="middle" mono size={28} color={C.ink2} opacity={p('p04', 10 + i * 2, 10)}>
          {v}
        </Txt>
      ))}
      <Txt x={model.x + model.w / 2} y={model.y + model.h + 60} anchor="middle" size={32} opacity={p('p04', 36, 14)}>
        参数：几十亿个
      </Txt>
      <CiteCard
        b={{x: 870, y: 220, w: 920, h: 250}}
        year="2020"
        who="Kaplan 等"
        venue="OpenAI"
        title="Scaling Laws for Neural Language Models"
        quoteZh="每写一个词：运算次数 ≈ 2 × 参数个数"
        draw={p('p05', 0, 22)}
      />
      <g opacity={p('p06', 0, 14)}>
        <Txt x={1330} y={590} anchor="middle" size={34} color={C.ink2}>
          70 亿参数的模型，每写一个词
        </Txt>
        <MathText text="≈ 7 × 10^9" x={1310} y={700} size={52} anchor="end" color={C.clayInk} />
        <Txt x={1330} y={700} size={44} color={C.clayInk}>
          次乘加
        </Txt>
      </g>
    </g>
  );
};

// p07–p08：推理芯片的照片与它的乘法阵列
const Chip: React.FC = () => {
  const {p, span} = useT();
  const o = span('p07', 'p09', 14);
  if (o <= 0) return null;
  const photo: Box = {x: 150, y: 190, w: 740, h: 611};
  return (
    <g opacity={o}>
      <Photo src="fp32-format/assets/tpu-v4.jpg" b={photo} credit="TPU v4 · Jouppi 等 2023 · CC BY 4.0" opacity={p('p07', 0, 16)} draw={p('p07', 0, 22)} />
      <Txt x={1360} y={240} anchor="middle" size={34} opacity={p('p07', 16, 14)}>
        TPU v4 · 一颗芯片里
      </Txt>
      {Array.from({length: 8}, (_, i) => {
        const x = 1030 + (i % 4) * 172;
        const y = 290 + Math.floor(i / 4) * 172;
        return (
          <g key={i} opacity={p('p07', 24 + i * 4, 12)}>
            <RRect x={x} y={y} w={150} h={150} stroke={C.ink2} fill={C.paper} sw={1.8} roughness={0.6} />
            {/* 阵列的网格底纹用细直线，不手绘 */}
            {[1, 2, 3, 4, 5].map((k) => (
              <g key={k}>
                <line x1={x + k * 25} y1={y + 8} x2={x + k * 25} y2={y + 142} stroke={C.rule} strokeWidth={1.2} />
                <line x1={x + 8} y1={y + k * 25} x2={x + 142} y2={y + k * 25} stroke={C.rule} strokeWidth={1.2} />
              </g>
            ))}
          </g>
        );
      })}
      <MathText text="8 × (128 × 128)" x={1360} y={680} size={40} anchor="middle" opacity={p('p07', 60, 14)} />
      <Txt x={1360} y={730} anchor="middle" size={28} color={C.muted} opacity={p('p07', 64, 14)}>
        矩阵乘法单元
      </Txt>
      {['小', '快', '省电'].map((w, i) => (
        <Card key={w} b={{x: 1080 + i * 200, y: 770, w: 160, h: 80}} label={w} size={36} color={C.clayInk} stroke={C.clay} draw={p('p08', 8 + i * 8, 16)} />
      ))}
    </g>
  );
};

// 格式条：每一位一个小格；浮点格式按 S、E、F 上色
type Fmt = {name: string; bits: number; fields?: [number, number, number]};
const Ladder: React.FC<{
  formats: Fmt[];
  x: number;
  y: number;
  pitch: number;
  colored: number;
  appear: (row: number) => number;
  hot?: number;
  rowH?: number;
  cell?: number;
}> = ({formats, x, y, pitch, colored, appear, hot = 0, rowH = 74, cell}) => {
  const cw = cell ?? pitch - 4;
  return (
    <g>
      {formats.map((fm, r) => {
        const ry = y + r * rowH;
        const dim = hot > 0 && fm.name !== 'FP32' ? 1 - 0.65 * hot : 1;
        return (
          <g key={fm.name} opacity={appear(r) * dim}>
            <Txt x={x - 24} y={ry + cw * 0.75} anchor="end" mono size={30}>
              {fm.name}
            </Txt>
            {Array.from({length: fm.bits}, (_, i) => {
              const role: Role | null = fm.fields ? (i < fm.fields[0] ? 'S' : i < fm.fields[0] + fm.fields[1] ? 'E' : 'F') : null;
              const on = role !== null && colored > 0;
              return (
                <rect
                  key={i}
                  x={x + i * pitch}
                  y={ry}
                  width={cw}
                  height={cw}
                  rx={3}
                  fill={on ? TINT[role!] : C.paper}
                  stroke={on ? ROLE[role!] : C.ink2}
                  strokeWidth={1.6}
                />
              );
            })}
            <Txt x={x + fm.bits * pitch + 18} y={ry + cw * 0.75} size={24} color={C.muted}>
              {fm.fields ? fm.fields.join(' · ') : `${fm.bits} 位整数`}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};
const A100: Fmt[] = [
  {name: 'INT4', bits: 4},
  {name: 'INT8', bits: 8},
  {name: 'FP16', bits: 16, fields: [1, 5, 10]},
  {name: 'BF16', bits: 16, fields: [1, 8, 7]},
  {name: 'FP32', bits: 32, fields: [1, 8, 23]},
];
const FAMILY: Fmt[] = [
  {name: 'FP32', bits: 32, fields: [1, 8, 23]},
  {name: 'BF16', bits: 16, fields: [1, 8, 7]},
  {name: 'FP16', bits: 16, fields: [1, 5, 10]},
  {name: 'E5M2', bits: 8, fields: [1, 5, 2]},
  {name: 'E4M3', bits: 8, fields: [1, 4, 3]},
];

// p09–p13：数值格式、能耗、「最贵的 FP32」
const Formats: React.FC = () => {
  const {p, span} = useT();
  const o = span('p09', 'p14', 14);
  if (o <= 0) return null;
  const ladder = span('p09', 'p11', 12);
  const bars = p('p11', 0, 14);
  return (
    <g opacity={o}>
      <g opacity={ladder}>
        <Txt x={960} y={220} anchor="middle" size={36} opacity={p('p09', 6, 14)}>
          数值格式：一个数用几位来存
        </Txt>
        <Ladder formats={A100} x={420} y={300} pitch={34} colored={0} appear={(r) => p('p09', 20 + r * 6, 12)} />
        <Txt x={960} y={720} anchor="middle" size={30} color={C.muted} opacity={p('p10', 10, 14)}>
          英伟达 A100 规格表上列出的几种
        </Txt>
      </g>
      <g opacity={bars}>
        <CiteCard
          b={{x: 150, y: 190, w: 1000, h: 200}}
          year="2014"
          who="Mark Horowitz · 斯坦福"
          venue="ISSCC"
          title="Computing's Energy Problem (and what we can do about it)"
          draw={p('p11', 10, 22)}
        />
        <Txt x={1240} y={270} size={34} opacity={p('p11', 0, 14)}>
          位数越少越省电
        </Txt>
        <Txt x={1240} y={320} size={26} color={C.muted} opacity={p('p11', 20, 14)}>
          45 nm 工艺，做一次乘法
        </Txt>
        <Bars
          x={560}
          y={480}
          w={900}
          max={3.7}
          rows={[
            {label: '32 位浮点', value: 3.7, text: '3.7 皮焦', hot: true},
            {label: '16 位浮点', value: 1.1, text: '1.1 皮焦'},
            {label: '8 位整数', value: 0.2, text: '0.2 皮焦'},
          ]}
          grow={(i) => p('p12', 6 + i * 16, 18)}
        />
        <Txt x={960} y={790} anchor="middle" size={34} opacity={p('p13', 0, 14)}>
          推理 → 改用位数少的格式
        </Txt>
        <g opacity={p('p13', 40, 14)}>
          <Txt x={690} y={860} anchor="middle" size={32} color={C.clayInk}>
            理由 ①：基准
          </Txt>
          <Txt x={1230} y={860} anchor="middle" size={32} color={C.clayInk}>
            理由 ②：同一种结构
          </Txt>
        </g>
      </g>
    </g>
  );
};

// p14–p15：混合精度训练：16 位乘，FP32 累加并留住参数本身，效果拿 FP32 比
const Mixed: React.FC = () => {
  const {p, span} = useT();
  const o = span('p14', 'p16', 14);
  if (o <= 0) return null;
  const mul: Box = {x: 240, y: 470, w: 420, h: 130};
  const acc: Box = {x: 840, y: 470, w: 420, h: 130};
  const master: Box = {x: 1400, y: 470, w: 380, h: 130};
  const cmpA: Box = {x: 420, y: 700, w: 380, h: 110};
  const cmpB: Box = {x: 1120, y: 700, w: 380, h: 110};
  return (
    <g opacity={o}>
      <Txt x={150} y={210} size={30} color={C.clayInk} opacity={p('p14', 0, 12)}>
        理由 ①：基准
      </Txt>
      <CiteCard
        b={{x: 150, y: 240, w: 1000, h: 170}}
        year="2018"
        who="Micikevicius 等 · 英伟达与百度"
        venue="ICLR"
        title="Mixed Precision Training"
        draw={p('p14', 6, 22)}
      />
      <Card b={mul} label="乘法：16 位浮点" size={34} draw={p('p15', 0, 18)} />
      <Card b={acc} label="累加：FP32" size={36} color={C.clayInk} stroke={C.clay} draw={p('p15', 12, 18)} />
      <Card b={master} label="参数本身：FP32" size={34} color={C.clayInk} stroke={C.clay} draw={p('p15', 24, 18)} />
      <Arrow from={right(mul)} to={left(acc)} draw={p('p15', 12, 16)} />
      <g opacity={p('p15', 50, 14)}>
        <Card b={cmpA} label="混合精度的效果" size={30} />
        <Card b={cmpB} label="FP32 训练的效果" size={30} color={C.clayInk} stroke={C.clay} />
        <Arrow from={right(cmpA)} to={left(cmpB)} draw={p('p15', 56, 16)} />
        <Txt x={(cmpA.x + cmpA.w + cmpB.x) / 2} y={cmpA.y + 40} anchor="middle" size={24} color={C.muted}>
          对照
        </Txt>
      </g>
    </g>
  );
};

// p16–p17：FP8 论文首页与五种浮点格式的位域
const Family: React.FC = () => {
  const {p, span} = useT();
  const o = span('p16', 'p18', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Txt x={150} y={210} size={30} color={C.clayInk}>
        理由 ②：同一种结构
      </Txt>
      <Photo
        src="fp32-format/assets/paper-fp8.jpg"
        b={{x: 150, y: 250, w: 540, h: 480}}
        credit="Micikevicius 等 2022 · arXiv · CC BY 4.0"
        opacity={p('p16', 30, 14)}
        draw={p('p16', 30, 20)}
      />
      <Ladder formats={FAMILY} x={900} y={260} pitch={24} colored={1} hot={p('p17', 0, 14)} rowH={86} cell={20} appear={(r) => p('p16', 4 + r * 6, 12)} />
      <Txt x={1300} y={820} anchor="middle" size={34} opacity={p('p17', 8, 14)}>
        弄懂 FP32，别的格式只换位数
      </Txt>
    </g>
  );
};

// p18–p19：核心公式放大出现 → 飞到顶部；下方是这一集的两个问题
const Question: React.FC = () => {
  const {p, span} = useT();
  const o = span('p18', 'k01', 12);
  if (o <= 0) return null;
  const fly = p('p19', 0, 24);
  // 中央的公式：字号 52，居中在 y=560；飞行时字号与左端插值到顶部公式条
  const bigSize = 52;
  const big = layoutMath(FORMULA, 960, bigSize, 'middle');
  const small = layoutMath(FORMULA, BAR.formulaX, BAR.size, 'end');
  const size = interpolate(fly, [0, 1], [bigSize, BAR.size]);
  const lx = interpolate(fly, [0, 1], [big.left, small.left]);
  const ly = interpolate(fly, [0, 1], [560, BAR.formulaY]);
  const fieldsW = FIELD_W.S + FIELD_W.E + FIELD_W.F + 8;
  const fx = interpolate(fly, [0, 1], [960 - fieldsW / 2, BAR.fieldsX]);
  const fy = interpolate(fly, [0, 1], [400, BAR.y]);
  const shown = p('p18', 0, 18) * (1 - p('p19', 22, 4));
  return (
    <g opacity={o}>
      <g opacity={shown}>
        <Fields3 x={fx} y={fy} counts={fly < 0.5} />
        <Formula x={lx} y={ly} size={size} anchor="start" />
        <Txt x={960} y={680} anchor="middle" size={32} color={C.muted} opacity={p('p18', 30, 14) * (1 - fly)}>
          出自浮点标准 IEEE 754
        </Txt>
      </g>
      <g opacity={p('p19', 20, 14)}>
        <Card b={{x: 260, y: 470, w: 640, h: 150}} label="① 一个小数怎样装进 32 位" size={34} draw={p('p19', 20, 18)} />
        <Card b={{x: 1020, y: 470, w: 640, h: 150}} label="② 特别小的数为什么当成 0" size={34} draw={p('p19', 30, 18)} />
      </g>
    </g>
  );
};

export const Opening: React.FC = () => {
  const {p} = useT();
  if (p('p01', 0, 1) <= 0) return null;
  return (
    <g>
      <Intro />
      <Scale />
      <Chip />
      <Formats />
      <Mixed />
      <Family />
      <Question />
    </g>
  );
};
