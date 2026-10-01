import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine} from '../../../src/core/rough';
import {Axis, AxisScale, Hop, Mark, Span} from '../../../src/components/Axis';
import {Formula} from '../../../src/components/Formula';
import {Label, labelEdges} from '../../../src/components/Label';
import {Txt} from '../../../src/components/Prims';
import {Circuit} from '../../../src/components/Gates';

// p14–p22：阶码的两端。上溢：阶码进位到 255，写成 ±∞；下溢：阶码为 0，冲零写回。
// 数轴是示意间距：0、1 挨在一起，254 与 255 挨在一起，中间的 127 只作参照
const A: AxisScale = {x1: 340, x2: 1580, v1: -0.6, v2: 8.6, y: 470};
const TICKS = [
  {v: 0, label: '0'},
  {v: 0.7, label: '1'},
  {v: 4, label: '127'},
  {v: 7.3, label: '254'},
  {v: 8, label: '255'},
];

const AxisView: React.FC = () => {
  const {p} = useT();
  const dim = 1 - 0.6 * p('p22', 0, 14);
  // 上溢小节的标记随下溢小节开始淡出，数轴上只留下两端的记号
  const ovf = 1 - p('p19', 0, 12);
  return (
    <g opacity={dim}>
      <Axis a={A} ticks={TICKS} draw={p('p14', 0, 22)} />
      <Span a={A} from={0.7} to={7.3} color={C.clay} ink={C.clayInk} label="规格化数" lift={48} draw={p('p14', 16, 18)} />
      <Mark a={A} v={0} color={C.ink2} r={9} opacity={p('p15', 0, 12)} />
      <Mark a={A} v={8} color={C.ink2} r={9} opacity={p('p15', 6, 12)} />
      <Txt x={1560} y={398} anchor="middle" size={26} color={C.ink2} opacity={p('p15', 10, 12)}>
        无穷 / NaN
      </Txt>
      <Txt x={420} y={398} anchor="middle" size={26} color={C.ink2} opacity={p('p15', 16, 12)}>
        零 / 非规格数
      </Txt>
      <g opacity={ovf}>
        <Mark a={A} v={7.3} color={C.clay} r={9} opacity={p('p16', 0, 12)} />
        <Hop a={A} from={7.3} to={8} color={C.clay} lift={-60} draw={p('p17', 0, 24)} />
        <Mark a={A} v={8} color={C.clay} r={10} opacity={p('p17', 20, 12)} />
        <Label cx={1600} cy={590} text="±∞（7F800000）" size={26} draw={p('p17', 32, 14)} opacity={p('p17', 32, 14)} />
        <Label cx={1240} cy={320} text="上溢" size={40} stroke={C.clay} color={C.clayInk} draw={p('p18', 0, 16)} opacity={p('p18', 0, 16)} />
        <Txt x={1240} y={402} anchor="middle" size={26} color={C.ink2} opacity={p('p18', 14, 12)}>
          符号保留
        </Txt>
      </g>
      <Mark a={A} v={0} color={C.clay} r={10} opacity={p('p19', 0, 12)} />
      <Label cx={560} cy={590} text="标准 → 00400000" size={26} draw={p('p20', 0, 14)} opacity={p('p20', 0, 14)} />
      <Txt x={560} y={648} anchor="middle" size={22} color={C.ink2} opacity={p('p20', 12, 12)}>
        非规格数（逐渐下溢）
      </Txt>
      <Label cx={1240} cy={590} text="冲零 → 00000000" size={26} stroke={C.clay} draw={p('p21', 0, 14)} opacity={p('p21', 0, 14)} />
      <Txt x={1240} y={648} anchor="middle" size={22} color={C.ink2} opacity={p('p21', 12, 12)}>
        带符号的零
      </Txt>
    </g>
  );
};

const Chips: React.FC = () => {
  const {p} = useT();
  const first = p('p16', 0, 14) * (1 - p('p19', 0, 12));
  const second = p('p19', 0, 14);
  return (
    <g>
      <g opacity={first}>
        <Label cx={620} cy={215} text="7F7FFFFE" size={30} mono draw={p('p16', 0, 16)} />
        <Txt x={800} y={226} anchor="middle" size={30} opacity={p('p16', 10, 12)}>
          ×
        </Txt>
        <Label cx={1100} cy={215} text="3F800001" size={30} mono draw={p('p16', 8, 16)} />
        <Txt x={860} y={290} anchor="middle" size={26} color={C.ink2} opacity={p('p16', 20, 12)}>
          尾数一样，阶码和 254
        </Txt>
      </g>
      <g opacity={second}>
        <Label cx={620} cy={215} text="00800000" size={30} mono draw={p('p19', 0, 16)} />
        <Txt x={800} y={226} anchor="middle" size={30} opacity={p('p19', 10, 12)}>
          ×
        </Txt>
        <Label cx={1100} cy={215} text="3F000000" size={30} mono draw={p('p19', 8, 16)} />
        <Formula x={860} y={296} size={28} terms={[{t: '积 = 2'}, {t: '', sup: '−127'}]} opacity={p('p19', 20, 12)} />
      </g>
    </g>
  );
};

const Link: React.FC<{from: {x: number; y: number}; to: {x: number; y: number}; draw: number}> = ({from, to, draw}) => (
  <RLine x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={C.ink2} sw={2.4} draw={draw} />
);

// p22：输入端与输出端同一条取舍
const Both: React.FC = () => {
  const {p} = useT();
  const o = p('p22', 0, 14);
  if (o <= 0) return null;
  const l = labelEdges(560, 790, '输入端 → ±0', 28);
  const r = labelEdges(1360, 790, '输出端 → ±0', 28);
  return (
    <Circuit opacity={o}>
      <Label cx={560} cy={790} text="输入端 → ±0" size={28} draw={p('p22', 0, 14)} />
      <Label cx={960} cy={790} text="FTZ" size={30} mono stroke={C.clay} color={C.clayInk} draw={p('p22', 10, 14)} />
      <Label cx={1360} cy={790} text="输出端 → ±0" size={28} draw={p('p22', 20, 14)} />
      <Link from={l.right} to={{x: 960 - 60, y: 790}} draw={p('p22', 14, 12)} />
      <Link from={{x: 960 + 60, y: 790}} to={r.left} draw={p('p22', 24, 12)} />
    </Circuit>
  );
};

export const Boundary: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p14') || f >= s('k03')) return null;
  return (
    <g>
      <AxisView />
      <Chips />
      <Both />
    </g>
  );
};
