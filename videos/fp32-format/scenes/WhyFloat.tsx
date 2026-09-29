import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RLine, RRect} from '../../../src/core/rough';
import {Bracket, Txt} from '../../../src/components/Prims';
import {Arrow, Bits32, Box, Card, MathText, cellX, layoutMath, parseMath, segWidth, top} from './Kit';

// 01 为什么是浮点 p23–p40：二进制小数 → 定点数的精度与范围 → 科学计数法 → 浮点数 → 三个数的比较

// p23–p25：1.101₂ 的位权，每向右一位减半
const Binary: React.FC = () => {
  const {p, span} = useT();
  const o = span('p20', 'p23', 14);
  if (o <= 0) return null;
  const digits = ['1', '1', '0', '1'];
  const weights = ['1', '1/2', '1/4', '1/8'];
  const box = (i: number): Box => ({x: 560 + i * 210 + (i > 0 ? 40 : 0), y: 360, w: 150, h: 130});
  return (
    <g opacity={o}>
      <Txt x={960} y={260} anchor="middle" size={36} opacity={p('p20', 6, 14)}>
        二进制小数
      </Txt>
      {digits.map((d, i) => {
        const b = box(i);
        return (
          <g key={i} opacity={p('p20', 10 + i * 4, 12)}>
            <RRect x={b.x} y={b.y} w={b.w} h={b.h} stroke={d === '1' ? C.ink2 : C.faint} fill={d === '1' ? C.band : C.paper} sw={2} roughness={0.7} />
            <Txt x={b.x + b.w / 2} y={b.y + 88} anchor="middle" mono size={52} color={d === '1' ? C.ink : C.muted}>
              {d}
            </Txt>
          </g>
        );
      })}
      {/* 小数点落在第一格与第二格之间的正中 */}
      <Txt x={(box(0).x + box(0).w + box(1).x) / 2} y={box(0).y + 92} anchor="middle" mono size={52} opacity={p('p20', 12, 12)}>
        .
      </Txt>
      {weights.map((w, i) => {
        const b = box(i);
        const when = i === 0 ? p('p20', 20, 12) : i === 1 ? p('p21', 4, 12) : i === 2 ? p('p21', 30, 12) : p('p22', 4, 12);
        return (
          <Txt key={w} x={b.x + b.w / 2} y={b.y + b.h + 64} anchor="middle" mono size={40} color={C.clayInk} opacity={when}>
            {w}
          </Txt>
        );
      })}
      {[1, 2].map((i) => (
        <Arrow
          key={i}
          from={{x: box(i - 1).x + box(i - 1).w / 2 + 40, y: box(i).y + box(i).h + 48}}
          to={{x: box(i).x + box(i).w / 2 - 40, y: box(i).y + box(i).h + 48}}
          stroke={C.clay}
          draw={p('p21', i === 1 ? 10 : 36, 14)}
        />
      ))}
      <Txt x={960} y={720} anchor="middle" size={30} color={C.ink2} opacity={p('p21', 44, 12) * (1 - p('p22', 0, 10))}>
        每往右一位，分量减半
      </Txt>
      <MathText text="1 + 1/2 + 1/8 = 1.625" x={960} y={740} size={48} anchor="middle" opacity={p('p22', 14, 14)} />
    </g>
  );
};

// 定点数的三个局部数轴：同一条等距刻度，放大到不同的位置看
const Ticks: React.FC<{y: number; xs: number[]; labels: string[]; draw: number}> = ({y, xs, labels, draw}) => (
  <g>
    <RLine x1={xs[0] - 120} y1={y} x2={xs[xs.length - 1] + 120} y2={y} stroke={C.ink2} sw={2.4} roughness={0.5} draw={draw} />
    {xs.map((x, i) => (
      <g key={i} opacity={draw}>
        <RLine x1={x} y1={y - 18} x2={x} y2={y + 18} stroke={C.ink2} sw={2.4} roughness={0.5} />
        <MathText text={labels[i]} x={x} y={y + 62} size={28} anchor="middle" color={C.ink2} />
      </g>
    ))}
  </g>
);

// p26–p32：16 + 16 的定点数，精度与范围
const Fixed: React.FC = () => {
  const {p, span} = useT();
  const o = span('p23', 'p30', 14);
  if (o <= 0) return null;
  const mid = (cellX(15) + 48 + cellX(16)) / 2;
  const lineY = 600;
  // p27–p29：0.001 附近，第 65、66、67 格
  const near = [700, 1000, 1300];
  const step = near[1] - near[0];
  const dotX = near[0] + step * 0.536;
  return (
    <g opacity={o}>
      <Bits32 y={180} plain blank draw={p('p23', 0, 22)} index={false} />
      <RLine x1={mid} y1={160} x2={mid} y2={250} stroke={C.clay} sw={4} roughness={0.5} draw={p('p23', 16, 14)} />
      <Bracket x1={cellX(0)} x2={cellX(15) + 48} y={270} draw={p('p23', 20, 16)} />
      <Bracket x1={cellX(16)} x2={cellX(31) + 48} y={270} draw={p('p23', 26, 16)} />
      <Txt x={(cellX(0) + cellX(15) + 48) / 2} y={316} anchor="middle" size={30} opacity={p('p23', 24, 12)}>
        整数 16 位
      </Txt>
      <Txt x={(cellX(16) + cellX(31) + 48) / 2} y={316} anchor="middle" size={30} opacity={p('p23', 30, 12)}>
        小数 16 位
      </Txt>
      <Txt x={mid} y={148} anchor="middle" size={24} color={C.clayInk} opacity={p('p23', 20, 12)}>
        小数点
      </Txt>

      {/* p27–p29：刻度间隔与 0.001 的落点 */}
      <g opacity={span('p24', 'p27', 12)}>
        <Txt x={960} y={420} anchor="middle" size={34} opacity={p('p24', 0, 12)}>
          定点数 · 相邻两个数的间隔固定
        </Txt>
        <Ticks y={lineY} xs={near} labels={['65 × 2^(−16)', '66 × 2^(−16)', '67 × 2^(−16)']} draw={p('p24', 6, 20)} />
        <Bracket x1={near[1]} x2={near[2]} y={lineY - 40} dir="down" draw={p('p24', 20, 14)} />
        <MathText text="2^(−16)" x={(near[1] + near[2]) / 2} y={lineY - 62} size={30} anchor="middle" opacity={p('p24', 24, 12)} />
        <g opacity={p('p25', 0, 12)}>
          <REllipse cx={dotX} cy={lineY} w={20} h={20} stroke={C.clay} fill={C.clay} />
          <Txt x={dotX} y={lineY - 40} anchor="middle" mono size={32} color={C.clayInk}>
            0.001
          </Txt>
          <Arrow from={{x: dotX, y: lineY + 6}} to={{x: near[1], y: lineY + 6}} lift={34} stroke={C.clay} draw={p('p25', 14, 18)} gap={12} />
          <Txt x={near[1]} y={lineY + 130} anchor="middle" mono size={34} opacity={p('p25', 30, 12)}>
            存成 0.001007080078125
          </Txt>
        </g>
        <g opacity={p('p26', 0, 12)}>
          <MathText text="|0.001007 − 0.001| ÷ 0.001 ≈ 0.71%" x={960} y={820} size={40} anchor="middle" color={C.clayInk} />
          <Txt x={960} y={876} anchor="middle" size={30} opacity={p('p26', 20, 12)}>
            相对误差
          </Txt>
        </g>
      </g>

      {/* p30：百万分之一连半格都不到，存成 0 */}
      <g opacity={span('p27', 'p28', 12)}>
        <Ticks y={lineY} xs={[700, 1300]} labels={['0', '2^(−16)']} draw={p('p27', 0, 18)} />
        <RLine x1={1000} y1={lineY - 30} x2={1000} y2={lineY + 30} stroke={C.muted} sw={2} roughness={0.5} dash />
        <Txt x={1000} y={lineY - 44} anchor="middle" size={24} color={C.muted}>
          半格
        </Txt>
        <REllipse cx={700 + 600 * 0.0655} cy={lineY} w={18} h={18} stroke={C.clay} fill={C.clay} draw={p('p27', 12, 10)} />
        <Txt x={760} y={lineY - 70} size={32} mono color={C.clayInk} opacity={p('p27', 14, 12)}>
          0.000001
        </Txt>
        <Txt x={700} y={lineY + 140} anchor="middle" size={36} color={C.clayInk} opacity={p('p27', 30, 12)}>
          → 存成 0
        </Txt>
      </g>

      {/* p31–p32：大的一头到 32768 就放不下 */}
      <g opacity={p('p28', 0, 12)}>
        <RLine x1={420} y1={lineY} x2={1180} y2={lineY} stroke={C.ink2} sw={2.4} roughness={0.5} draw={p('p28', 0, 18)} />
        <RLine x1={1180} y1={lineY - 60} x2={1180} y2={lineY + 60} stroke={C.ink} sw={4} roughness={0.5} draw={p('p28', 10, 14)} />
        <MathText text="32768 − 2^(−16)" x={1180} y={lineY + 110} size={30} anchor="middle" opacity={p('p28', 14, 12)} />
        <REllipse cx={1420} cy={lineY} w={20} h={20} stroke={C.clay} fill={C.clay} draw={p('p28', 22, 10)} />
        <Txt x={1420} y={lineY - 40} anchor="middle" mono size={34} color={C.clayInk} opacity={p('p28', 22, 12)}>
          32768
        </Txt>
        <Txt x={1420} y={lineY + 110} anchor="middle" size={36} color={C.clayInk} opacity={p('p28', 30, 12)}>
          放不下
        </Txt>
        <Txt x={960} y={420} anchor="middle" size={36} opacity={p('p29', 4, 14)}>
          模型里的数：有的很小，有的很大
        </Txt>
      </g>
    </g>
  );
};

// p33–p37：科学计数法与浮点数；括号和箭头的位置取自公式排版的坐标
const Sci: React.FC = () => {
  const {p, span} = useT();
  const o = span('p30', 'p34', 14);
  if (o <= 0) return null;
  const dec = parseMath('1024 = 1.024 × 10^3');
  const decL = layoutMath(dec, 960, 52, 'middle');
  // dec 的分段：[ '1024 = 1.024 × 10', '3' ]；有效数字是 '1.024'，量级是 '10^3'
  const digitsX = decL.xs[0] + '1024 = '.length * 0.6 * 52;
  const digitsW = '1.024'.length * 0.6 * 52;
  const powX = decL.xs[0] + '1024 = 1.024 × '.length * 0.6 * 52;
  const powW = '10'.length * 0.6 * 52 + segWidth(dec[1], 52);
  const bin = p('p32', 0, 14);
  const sig: Box = {x: 470, y: 640, w: 400, h: 110};
  const mag: Box = {x: 1050, y: 640, w: 400, h: 110};
  // 二进制那一行：'1.1' 有效数字，'2^1' 量级
  const b2 = parseMath('1.1_2 × 2^1 = 3');
  const b2L = layoutMath(b2, 960, 52, 'middle');
  // b2 的分段：['1.1', 下标 '2', ' × 2', 上标 '1', ' = 3']
  const b2SigMid = (b2L.xs[0] + b2L.xs[1] + segWidth(b2[1], 52)) / 2;
  const b2PowMid = (b2L.xs[2] + ' × '.length * 0.6 * 52 + b2L.xs[3] + segWidth(b2[3], 52)) / 2;
  return (
    <g opacity={o}>
      <Txt x={960} y={250} anchor="middle" size={36} opacity={p('p30', 10, 14)}>
        科学计数法
      </Txt>
      <g opacity={1 - bin}>
        <MathText segs={dec} x={960} y={420} size={52} anchor="middle" opacity={p('p31', 0, 14)} />
        <Bracket x1={digitsX} x2={digitsX + digitsW} y={456} draw={p('p31', 12, 16)} />
        <Bracket x1={powX} x2={powX + powW} y={456} stroke={C.clay} draw={p('p31', 24, 16)} />
        <Txt x={digitsX + digitsW / 2} y={506} anchor="middle" size={30} opacity={p('p31', 16, 12)}>
          有效数字
        </Txt>
        <Txt x={powX + powW / 2} y={506} anchor="middle" size={30} color={C.clayInk} opacity={p('p31', 28, 12)}>
          小数点挪几位
        </Txt>
      </g>
      <g opacity={bin}>
        <MathText text="1.1_2 × 2^0 = 1.5" x={960} y={400} size={52} anchor="middle" />
        <MathText segs={b2} x={960} y={500} size={52} anchor="middle" opacity={p('p32', 10, 14)} />
        <g opacity={p('p33', 0, 14)}>
          <Card b={sig} label="有效数字" size={36} draw={p('p33', 4, 18)} />
          <Card b={mag} label="2 的几次方" size={36} color={C.clayInk} stroke={C.clay} draw={p('p33', 10, 18)} />
          <Arrow from={{x: b2SigMid, y: 526}} to={top(sig)} draw={p('p33', 14, 16)} />
          <Arrow from={{x: b2PowMid, y: 526}} to={top(mag)} stroke={C.clay} draw={p('p33', 20, 16)} />
          <Txt x={960} y={710} anchor="middle" size={30} color={C.muted}>
            分开存
          </Txt>
        </g>
        <Txt x={960} y={850} anchor="middle" size={40} opacity={p('p33', 40, 14)}>
          小数点能浮动：浮点数
        </Txt>
      </g>
    </g>
  );
};

// p38–p40：三个数，定点与浮点各存一次
const Compare: React.FC = () => {
  const {p, span} = useT();
  const o = span('p34', 'k02', 12);
  if (o <= 0) return null;
  const col = [360, 960, 1540];
  const rowY = [420, 580, 740];
  const rows = [
    {n: '0.000001', fx: '0', fxNote: '变成 0', fl: '≈ 0.000001', flNote: '2.5 × 10^(−9)', d: 6},
    {n: '0.001', fx: '0.00100708', fxNote: '偏了 0.71%', fl: '≈ 0.001', flNote: '4.75 × 10^(−8)', d: 30},
    {n: '1000000', fx: '放不下', fxNote: '', fl: '1000000', flNote: '0', d: 54},
  ];
  return (
    <g opacity={o}>
      {['数', '定点数', '浮点数'].map((h, i) => (
        <Txt key={h} x={col[i]} y={300} anchor="middle" size={32} color={C.muted} opacity={p('p34', 0, 12)}>
          {h}
        </Txt>
      ))}
      <RLine x1={180} y1={330} x2={1740} y2={330} stroke={C.rule} sw={2} roughness={0.4} draw={p('p34', 0, 18)} />
      {rows.map((r, i) => (
        <g key={r.n} opacity={p('p34', r.d, 12)}>
          <Txt x={col[0]} y={rowY[i]} anchor="middle" mono size={40}>
            {r.n}
          </Txt>
          <Txt x={col[1]} y={rowY[i]} anchor="middle" mono={r.fx !== '放不下'} size={40} color={C.clayInk}>
            {r.fx}
          </Txt>
          {r.fxNote && (
            <Txt x={col[1]} y={rowY[i] + 46} anchor="middle" size={26} color={C.muted}>
              {r.fxNote}
            </Txt>
          )}
          <Txt x={col[2]} y={rowY[i]} anchor="middle" mono size={40} color={C.blueInk} opacity={p('p34', r.d + 10, 12)}>
            {r.fl}
          </Txt>
          <g opacity={p('p35', 4 + i * 8, 12)}>
            <Txt x={col[2] - 10} y={rowY[i] + 48} anchor="end" size={26} color={C.blueInk}>
              相对误差
            </Txt>
            <MathText text={r.flNote} x={col[2] + 4} y={rowY[i] + 48} size={28} color={C.blueInk} />
          </g>
          {i < 2 && <RLine x1={180} y1={rowY[i] + 82} x2={1740} y2={rowY[i] + 82} stroke={C.rule} sw={1.6} roughness={0.4} />}
        </g>
      ))}
      <Txt x={960} y={870} anchor="middle" size={36} opacity={p('p35', 34, 14)}>
        浮点：三个数的相对误差都不到千万分之一
      </Txt>
    </g>
  );
};

export const WhyFloat: React.FC = () => {
  const {p} = useT();
  if (p('p20', 0, 1) <= 0) return null;
  return (
    <g>
      <Binary />
      <Fixed />
      <Sci />
      <Compare />
    </g>
  );
};
