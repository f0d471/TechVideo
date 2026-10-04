import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {Axis, Span} from '../../../src/components/Axis';
import {Circuit, Gate, Logic, Reg, Val, Wire, gate, logicPorts, regPorts, wire} from '../../../src/components/Gates';
import {Wave, waveGeom, waveX} from '../../../src/components/Wave';
import {Dot, along, NumFormula} from './Kit';

// 01 存数 p04–p21：组合逻辑 → 组合逻辑延迟 → 时钟 → 时钟频率 → 寄存器 → 时序逻辑

// p04：输出只由此刻的输入决定，中间不存任何数（后半：b 翻成 1，输出立刻跟着变）
const CombIntro: React.FC = () => {
  const {p} = useT();
  const o = p('p04', 0, 14) * (1 - p('p05', 0, 12));
  if (o <= 0) return null;
  const g = gate('xor', 900, 480, 150, 160);
  const flip = p('p04', 100, 24);
  const oA = 1 - flip;
  const oB = flip;
  return (
    <g opacity={o}>
      <Circuit opacity={1}>
        <Wire d={wire([{x: 560, y: g.in1.y}, g.in1])} stroke={C.blue} draw={p('p04', 10, 14)} />
        <Wire d={wire([{x: 560, y: g.in2.y}, g.in2])} stroke={C.blue} draw={p('p04', 16, 14)} />
        <Wire d={wire([g.out, {x: 1330, y: g.out.y}])} stroke={C.blue} draw={p('p04', 22, 14)} />
        <Gate kind="xor" x={900} y={480} w={150} h={160} draw={p('p04', 4, 18)} />
        <Txt x={960} y={240} anchor="middle" size={26} color={C.ink2} opacity={p('p04', 30, 12)}>
          中间只有门，不存任何数
        </Txt>
        <Txt x={540} y={g.in1.y + 9} anchor="end" size={26} color={C.blueInk}>
          输入 a
        </Txt>
        <Txt x={540} y={g.in2.y + 9} anchor="end" size={26} color={C.blueInk}>
          输入 b
        </Txt>
        <g opacity={oA}>
          <Val x={590} y={g.in1.y} v={1} o={1} color={C.blue} />
          <Val x={590} y={g.in2.y} v={0} o={1} color={C.blue} />
          <Val x={1380} y={g.out.y} v={1} o={1} color={C.blue} />
        </g>
        <g opacity={oB}>
          <Val x={590} y={g.in1.y} v={1} o={1} color={C.blue} />
          <Val x={590} y={g.in2.y} v={1} o={1} color={C.blue} />
          <Val x={1380} y={g.out.y} v={0} o={1} color={C.blue} />
        </g>
        <Txt x={1440} y={g.out.y + 9} size={26} color={C.blueInk} opacity={p('p04', 40, 12)}>
          输出
        </Txt>
      </Circuit>
      <Txt x={960} y={310} anchor="middle" size={32} opacity={p('p04', 110, 16)}>
        输入一变，输出立刻跟着变
      </Txt>
    </g>
  );
};

// p05：这样的电路叫组合逻辑；时序图上输出与输入同时变
const CombWave: React.FC = () => {
  const {p} = useT();
  const o = p('p05', 0, 14) * (1 - p('p06', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 410, t1: 4, unit: 300, y0: 330, rowH: 150, amp: 54});
  return (
    <g opacity={o}>
      <Wave
        g={g}
        rows={[
          {kind: 'bit', name: '输入 a', v0: 0, edges: [{t: 1.5, v: 1}], color: C.blue, ink: C.blueInk},
          {kind: 'bit', name: '输入 b', v0: 0, edges: [{t: 2.5, v: 1}], color: C.blue, ink: C.blueInk},
          {kind: 'bit', name: '输出', v0: 0, edges: [{t: 1.5, v: 1}, {t: 2.5, v: 0}], color: C.ink},
        ]}
        upTo={0.6 + p('p05', 0, 210) * 3.4}
      />
      {[1.5, 2.5].map((t, i) => (
        <RLine
          key={t}
          x1={waveX(g, t)}
          y1={300}
          x2={waveX(g, t)}
          y2={800}
          stroke={C.faint}
          sw={2}
          draw={p('p05', 40 + i * 60, 14)}
        />
      ))}
      <Label cx={960} cy={240} text="组合逻辑" size={40} stroke={C.blue} color={C.blueInk} draw={p('p05', 120, 18)} />
    </g>
  );
};

// p06：信号穿过一串门，各个门的延迟加在一起（圆标一站一站往后走）
const DelayChain: React.FC = () => {
  const {p} = useT();
  const o = p('p06', 0, 14) * (1 - p('p07', 0, 12));
  if (o <= 0) return null;
  const t = p('p06', 30, 170);
  const walk = {x: 430 + 1290 * t, y: 560};
  return (
    <g opacity={o}>
      <Circuit opacity={1}>
        {[0, 1, 2, 3, 4].map((i) => {
          const gx = 340 + i * 280;
          const px = i === 0 ? 300 : 340 + (i - 1) * 280 + 95;
          const gd = p('p06', 6 + i * 4, 14);
          const gd2 = gate(i % 2 ? 'or' : 'and', gx, 510, 95, 100);
          return (
            <g key={i}>
              <Wire d={wire([{x: px, y: 560}, {x: gx, y: 560}])} stroke={C.blue} draw={p('p06', 10 + i * 4, 12)} />
              <Gate kind={i % 2 ? 'or' : 'and'} x={gx} y={510} w={95} h={100} draw={gd} />
              <RLine x1={gd2.cx} y1={625} x2={gd2.cx} y2={650} stroke={C.muted} sw={2} draw={gd} />
            </g>
          );
        })}
        <Wire d={wire([{x: 340 + 4 * 280 + 95, y: 560}, {x: 1650, y: 560}])} stroke={C.blue} draw={p('p06', 28, 12)} />
        <Val x={300} y={560} v={1} o={p('p06', 14, 12)} color={C.blue} />
        <Dot p={walk} o={p('p06', 30, 12) * (1 - p('p06', 186, 14))} />
        <Txt x={960} y={310} anchor="middle" size={26} color={C.ink2} opacity={p('p06', 60, 14)}>
          每穿过一个门，都要花一小段时间
        </Txt>
      </Circuit>
      <Txt x={960} y={240} anchor="middle" size={34} color={C.blueInk} opacity={p('p06', 80, 16)}>
        各个门的延迟，一段一段加在一起
      </Txt>
    </g>
  );
};

// p07：走完之前输出还在变，读出来的数不能用（多位的值画成灰段）
const Settling: React.FC = () => {
  const {p} = useT();
  const o = p('p07', 0, 14) * (1 - p('p08', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 400, t1: 4, unit: 300, y0: 330, rowH: 260, amp: 110});
  return (
    <g opacity={o}>
      <Wave
        g={g}
        rows={[
          {kind: 'bus', name: '输入', segs: [{t: 0, v: '01'}, {t: 1, v: '10'}, {t: 2, v: '11'}, {t: 3, v: '00'}], color: C.blue, ink: C.blueInk},
          {
            kind: 'bus',
            name: '输出',
            segs: [{t: 0, v: '01'}, {t: 1, v: '?'}, {t: 1.4, v: '10'}, {t: 2, v: '?'}, {t: 2.4, v: '11'}, {t: 3, v: '?'}, {t: 3.4, v: '00'}],
          },
        ]}
        upTo={0.6 + p('p07', 0, 200) * 3.4}
      />
      <Txt x={waveX(g, 1.2)} y={300} anchor="middle" size={26} color={C.ink2} opacity={p('p07', 60, 14)}>
        还在变
      </Txt>
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p07', 120, 16)}>
        稳下来之前读到的数，不能用
      </Txt>
    </g>
  );
};

// p08：一次乘法的每一步都是一串门，延迟一段接一段地加上去（数轴接龙）
const StepsDelay: React.FC = () => {
  const {p} = useT();
  const o = p('p08', 0, 14) * (1 - p('p09', 0, 12));
  if (o <= 0) return null;
  const a = {x1: 190, x2: 1730, v1: 0, v2: 10, y: 640};
  const ends = [1.6, 4.2, 6.4, 8.6, 10];
  const names = ['拆包', '相乘', '规格化', '舍入', '写回'];
  return (
    <g opacity={o}>
      <Axis a={a} ticks={[]} draw={p('p08', 6, 20)} />
      {ends.map((e, i) => (
        <Span
          key={names[i]}
          a={a}
          from={i ? ends[i - 1] : 0}
          to={e}
          color={C.blue}
          label={names[i]}
          lift={56}
          size={26}
          draw={p('p08', 20 + i * 36, 26)}
        />
      ))}
      <RArrow x1={190} y1={460} x2={1730} y2={460} lift={-50} stroke={C.clay} sw={3} draw={p('p08', 180, 22)} />
      <Txt x={960} y={370} anchor="middle" size={30} color={C.clayInk} opacity={p('p08', 190, 16)}>
        总延迟 = 各步相加
      </Txt>
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p08', 210, 14)}>
        一次乘法的五步，每一步都是一串门
      </Txt>
    </g>
  );
};

// p09：芯片里的部件很多，要有统一的节拍（时钟分发给各个部件）
const ClockFan: React.FC = () => {
  const {p} = useT();
  const o = p('p09', 0, 14) * (1 - p('p10', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 300, t1: 5, unit: 170, y0: 280});
  const parts = [330, 810, 1290, 1700];
  return (
    <g opacity={o}>
      <Wave g={g} rows={[{kind: 'clock', name: '时钟'}]} upTo={0.6 + p('p09', 6, 150) * 4.4} />
      <Circuit opacity={1}>
        {parts.map((x, i) => (
          <g key={x}>
            <RLine x1={x} y1={430} x2={x} y2={560} stroke={C.clay} sw={2.4} draw={p('p09', 30 + i * 8, 14)} />
            <Label cx={x} cy={640} text={['乘法器', '加法器', '乘法器', '寄存器排'][i]} size={26} stroke={C.ink2} draw={p('p09', 34 + i * 8, 16)} />
          </g>
        ))}
        <RLine x1={330} y1={430} x2={1700} y2={430} stroke={C.clay} sw={2.6} draw={p('p09', 24, 18)} />
      </Circuit>
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p09', 90, 16)}>
        同一个节拍，告诉大家什么时候取结果
      </Txt>
    </g>
  );
};

// p10–p11：时钟信号在零和一之间翻转；上升沿与一个来回的时间
const ClockWave: React.FC = () => {
  const {p} = useT();
  const o = p('p10', 0, 14) * (1 - p('p12', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 277, t1: 4, unit: 360, y0: 400, rowH: 200, amp: 90});
  const e1 = waveX(g, 1);
  const e2 = waveX(g, 2);
  const up = p('p10', 0, 200);
  return (
    <g opacity={o}>
      <Wave g={g} rows={[{kind: 'clock', name: '时钟'}]} upTo={0.5 + up * 3.5} />
      <Txt x={waveX(g, 0.25)} y={360} anchor="middle" size={26} color={C.clayInk} opacity={p('p10', 40, 12)}>
        1
      </Txt>
      <Txt x={waveX(g, 0.75)} y={530} anchor="middle" size={26} color={C.clayInk} opacity={p('p10', 50, 12)}>
        0
      </Txt>
      <Txt x={960} y={240} anchor="middle" size={28} color={C.ink2} opacity={p('p10', 70, 14) * (1 - p('p11', 0, 12))}>
        在 0 和 1 之间来回翻转
      </Txt>
      <g opacity={p('p11', 0, 14)}>
        <RArrow x1={e1} y1={250} x2={e1} y2={370} lift={0} stroke={C.clay} sw={3} draw={p('p11', 6, 16)} />
        <RArrow x1={e2} y1={250} x2={e2} y2={370} lift={0} stroke={C.clay} sw={3} draw={p('p11', 20, 16)} />
        <Txt x={e1} y={210} anchor="middle" size={26} color={C.clayInk} opacity={p('p11', 12, 12)}>
          上升沿
        </Txt>
        <Txt x={e2} y={210} anchor="middle" size={26} color={C.clayInk} opacity={p('p11', 26, 12)}>
          上升沿
        </Txt>
        <RArrow x1={e1} y1={700} x2={e2} y2={700} lift={-44} stroke={C.ink} sw={2.6} draw={p('p11', 50, 20)} />
        <Txt x={(e1 + e2) / 2} y={620} anchor="middle" size={30} opacity={p('p11', 70, 14)}>
          一个来回 = 一拍 = 时钟周期
        </Txt>
      </g>
    </g>
  );
};

// p12–p15：时钟频率是周期的倒数；10 纳秒 → 100 兆赫；5 纳秒 → 200 兆赫
const Freq: React.FC = () => {
  const {p} = useT();
  const o = p('p12', 0, 14) * (1 - p('p16', 0, 12));
  if (o <= 0) return null;
  const g10 = waveGeom({x0: 300, t1: 2, unit: 560, y0: 480, rowH: 150, amp: 110});
  const g5 = waveGeom({x0: 300, t1: 2, unit: 280, y0: 720, rowH: 0, amp: 75});
  const ex = p('p13', 0, 14);
  const fill = 0.6 + p('p15', 0, 30) * 1.4;
  return (
    <g opacity={o}>
      <NumFormula
        x={960}
        y={430}
        draw={p('p12', 0, 60)}
        opacity={1 - p('p15', 0, 12)}
        terms={[
          {t: '时钟频率', color: C.clayInk},
          {t: ' = ', color: C.ink2},
          {t: '1', color: C.ink},
          {t: ' ÷ ', color: C.ink2},
          {t: '时钟周期', color: C.clayInk},
        ]}
      />
      <g opacity={ex * (1 - p('p15', 0, 12))}>
        <NumFormula
          x={960}
          y={560}
          draw={p('p13', 60, 80)}
          terms={[
            {t: '1 ÷ 10 纳秒', color: C.ink},
            {t: ' = ', color: C.ink2},
            {t: '一亿 个 / 秒', color: C.ink},
          ]}
        />
        <NumFormula
          x={960}
          y={690}
          draw={p('p14', 60, 80)}
          terms={[
            {t: '一亿 个 / 秒', color: C.ink},
            {t: ' = ', color: C.ink2},
            {t: '100 兆赫', color: C.clayInk},
          ]}
        />
        <Txt x={240} y={438} size={24} color={C.ink2} opacity={p('p13', 6, 12)}>
          1 纳秒 = 十亿分之一秒
        </Txt>
        <Txt x={240} y={698} size={24} color={C.ink2} opacity={p('p14', 6, 12)}>
          1 兆赫 = 每秒 100 万个周期
        </Txt>
      </g>
      <g opacity={p('p15', 0, 14)}>
        <Wave g={g10} rows={[{kind: 'clock', name: '周期 10 纳秒'}]} upTo={fill} />
        <Wave g={g5} rows={[{kind: 'clock', name: '周期 5 纳秒'}]} upTo={fill} />
        <RArrow x1={waveX(g10, 1)} y1={396} x2={waveX(g10, 2)} y2={396} lift={-36} stroke={C.clay} sw={2.6} draw={p('p15', 40, 18)} />
        <Txt x={(waveX(g10, 1) + waveX(g10, 2)) / 2} y={348} anchor="middle" size={24} color={C.clayInk} opacity={p('p15', 46, 12)}>
          10 纳秒
        </Txt>
        <RArrow x1={waveX(g5, 1)} y1={640} x2={waveX(g5, 2)} y2={640} lift={-36} stroke={C.clay} sw={2.6} draw={p('p15', 50, 18)} />
        <Txt x={(waveX(g5, 1) + waveX(g5, 2)) / 2} y={660} anchor="middle" size={24} color={C.clayInk} opacity={p('p15', 56, 12)}>
          5 纳秒
        </Txt>
        <Txt x={960} y={240} anchor="middle" size={30} color={C.clayInk} opacity={p('p15', 90, 16)}>
          周期减半，频率翻倍：五纳秒对应二百兆赫
        </Txt>
      </g>
    </g>
  );
};

// p16–p18：寄存器：上升沿看一眼输入记下来，之后保持。p16 电路，p17 换时序图，p18 起名字
const RegIntro: React.FC = () => {
  const {p} = useT();
  const o = p('p16', 0, 14) * (1 - p('p19', 0, 12));
  if (o <= 0) return null;
  const reg = {cx: 960, cy: 560, w: 110, h: 150};
  const rp = regPorts(reg.cx, reg.cy, reg.w, reg.h);
  const store = p('p16', 60, 24);
  const circ = 1 - p('p17', 0, 14);
  const g = waveGeom({x0: 416, t1: 4, unit: 290, y0: 400, rowH: 140, amp: 48});
  return (
    <g opacity={o}>
      <Circuit opacity={circ}>
        <Wire d={wire([{x: 400, y: 560}, rp.d])} stroke={C.blue} draw={p('p16', 10, 14)} />
        <Val x={440} y={560} v={1} o={p('p16', 8, 12)} color={C.blue} />
        <Reg {...reg} draw={p('p16', 4, 22)} clockTo={720} />
        <Wire d={wire([rp.q, {x: 1480, y: 560}])} stroke={C.clay} draw={store} />
        <Val x={1480} y={560} v={1} o={store} color={C.clay} />
        <Txt x={440} y={525} anchor="middle" size={26} color={C.blueInk}>
          输入
        </Txt>
        <Txt x={1480} y={525} anchor="middle" size={26} color={C.clayInk} opacity={store}>
          记下的值
        </Txt>
        <Txt x={960} y={240} anchor="middle" size={26} color={C.clayInk} opacity={p('p16', 30, 12)}>
          只在上升沿看一眼输入
        </Txt>
      </Circuit>
      <g opacity={p('p17', 0, 14)}>
        <Wave
          g={g}
          rows={[
            {kind: 'clock', name: '时钟'},
            {kind: 'bus', name: '输入', segs: [{t: 0, v: 'B'}, {t: 1, v: 'C'}, {t: 2, v: 'B'}, {t: 3, v: 'A'}], color: C.blue, ink: C.blueInk},
            {kind: 'bus', name: '输出', segs: [{t: 0, v: 'A'}, {t: 1, v: 'B'}, {t: 2, v: 'C'}, {t: 3, v: 'B'}], color: C.clay, ink: C.clayInk},
          ]}
          upTo={0.6 + p('p17', 0, 160) * 3.4}
        />
        <Txt x={960} y={240} anchor="middle" size={30} opacity={1 - p('p18', 0, 12)}>
          输出只在上升沿换成当时输入的值
        </Txt>
      </g>
      <g opacity={p('p18', 0, 14)}>
        <Label cx={500} cy={240} text="寄存器" sub="存数的部件" size={48} stroke={C.clay} color={C.clayInk} draw={p('p18', 4, 20)} />
        <Txt x={1120} y={235} size={28} color={C.blueInk} opacity={p('p18', 30, 14)}>
          组合逻辑：输出随时跟着变
        </Txt>
        <Txt x={1120} y={300} size={28} color={C.clayInk} opacity={p('p18', 48, 14)}>
          寄存器：输出只在上升沿变
        </Txt>
      </g>
    </g>
  );
};

// p19–p21：时序逻辑：组合逻辑夹在两排寄存器之间，一拍算一段
const SEQ = {y: 470, lx: 420, rx: 1500, mx: 960};
const SeqLogic: React.FC = () => {
  const {p} = useT();
  const o = p('p19', 0, 14) * (1 - p('k03', 0, 12));
  if (o <= 0) return null;
  const lp = logicPorts(SEQ.mx, SEQ.y, 520, 150);
  const l = regPorts(SEQ.lx, SEQ.y, 90, 130);
  const r = regPorts(SEQ.rx, SEQ.y, 90, 130);
  const path = [l.q, lp.left, lp.right, r.d];
  const walk = p('p20', 20, 190);
  const clkY = SEQ.y + 130;
  return (
    <g opacity={o}>
      <Circuit opacity={1}>
        <Reg cx={SEQ.lx} cy={SEQ.y} w={90} h={130} name="寄存器排" draw={p('p19', 4, 20)} clockTo={clkY} />
        <Reg cx={SEQ.rx} cy={SEQ.y} w={90} h={130} name="寄存器排" draw={p('p19', 12, 20)} clockTo={clkY} />
        <Logic cx={SEQ.mx} cy={SEQ.y} w={520} h={150} text="组合逻辑" sub="相乘 · 规格化 · 舍入" size={30} draw={p('p19', 26, 20)} />
        <Wire d={wire([l.q, lp.left])} stroke={C.blue} draw={p('p19', 20, 16)} />
        <Wire d={wire([lp.right, r.d])} stroke={C.blue} draw={p('p19', 30, 16)} />
        <RLine x1={SEQ.lx} y1={clkY} x2={SEQ.rx} y2={clkY} stroke={C.clay} sw={2.4} draw={p('p19', 50, 18)} />
        <Txt x={(SEQ.lx + SEQ.rx) / 2} y={clkY + 44} anchor="middle" size={24} color={C.clayInk} opacity={p('p19', 56, 12)}>
          同一个时钟
        </Txt>
        <Txt x={960} y={310} anchor="middle" size={28} color={C.clayInk} opacity={p('p20', 0, 12) * (1 - p('p21', 0, 12))}>
          这个上升沿放出新值
        </Txt>
        <Txt x={SEQ.rx} y={310} anchor="middle" size={28} color={C.clayInk} opacity={p('p20', 100, 12) * (1 - p('p21', 0, 12))}>
          下一个上升沿存下
        </Txt>
        <Dot p={along(path, walk)} o={p('p20', 10, 12) * (1 - p('p20', 208, 14))} />
      </Circuit>
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p19', 44, 14) * (1 - p('p21', 0, 12))}>
        一拍算一段，结果一拍一拍地更新
      </Txt>
      <Label cx={960} cy={240} text="时序逻辑" size={44} stroke={C.clay} color={C.clayInk} draw={p('p21', 6, 20)} opacity={p('p21', 0, 14)} />
    </g>
  );
};

export const Store: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p04') || f >= s('k02')) return null;
  return (
    <g>
      <CombIntro />
      <CombWave />
      <DelayChain />
      <Settling />
      <StepsDelay />
      <ClockFan />
      <ClockWave />
      <Freq />
      <RegIntro />
      <SeqLogic />
    </g>
  );
};
