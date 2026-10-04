import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {Axis, Span, axisX} from '../../../src/components/Axis';
import {Table} from '../../../src/components/Table';
import {CiteCard} from '../../../src/components/CiteCard';
import {Circuit, Gate, Logic, Reg, Wire, gate, logicPorts, regPorts, wire} from '../../../src/components/Gates';
import {Wave, WaveWindow, waveGeom, waveX} from '../../../src/components/Wave';
import {NumFormula} from './Kit';

// 02 时钟能多快 p22–p35：建立与保持时间 → 时钟到输出延迟 → 周期的下限 → 保持时间检查 → 关键路径

// p22–p24：寄存器看一眼输入也要时间。p23 标出建立与保持两段时间窗；p24 换成窗里还在变的坏情形
const SetupHold: React.FC = () => {
  const {p} = useT();
  const o = p('p22', 0, 14) * (1 - p('p25', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 440, t1: 3.4, unit: 360, y0: 280, rowH: 150, amp: 52});
  const good = p('p24', 0, 12) < 1;
  return (
    <g opacity={o}>
      <g opacity={1 - p('p24', 0, 12)}>
        <Wave
          g={g}
          rows={[
            {kind: 'clock', name: '时钟'},
            {kind: 'bus', name: '输入', segs: [{t: 0, v: 'A'}, {t: 1, v: 'B'}, {t: 2, v: 'C'}], color: C.blue, ink: C.blueInk},
            {kind: 'bus', name: '输出', segs: [{t: 0, v: '?'}, {t: 0.5, v: 'A'}, {t: 1.5, v: 'B'}], color: C.clay, ink: C.clayInk},
          ]}
          upTo={0.5 + p('p22', 0, 160) * 2.9}
        />
        <WaveWindow g={g} t1={0.78} t2={1} rowFrom={1} rowTo={2} label="建立时间" opacity={p('p23', 0, 14)} />
        <WaveWindow g={g} t1={1} t2={1.14} rowFrom={1} rowTo={2} label="保持时间" below opacity={p('p23', 14, 14)} />
        <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p22', 100, 16)}>
          沿之前要稳住，沿之后还要再稳一会
        </Txt>
      </g>
      <g opacity={p('p24', 0, 12)}>
        <Wave
          g={g}
          rows={[
            {kind: 'clock', name: '时钟'},
            {kind: 'bus', name: '输入', segs: [{t: 0, v: 'A'}, {t: 0.9, v: '?'}, {t: 1.4, v: 'B'}], color: C.blue, ink: C.blueInk},
            {kind: 'bus', name: '输出', segs: [{t: 0, v: 'A'}, {t: 1, v: '?'}, {t: 2.4, v: 'B'}], color: C.clay, ink: C.clayInk},
          ]}
          upTo={0.5 + p('p24', 0, 160) * 2.9}
        />
        <WaveWindow g={g} t1={0.78} t2={1.14} rowFrom={1} rowTo={2} opacity={p('p24', 10, 14)} />
        <Txt x={960} y={240} anchor="middle" size={30} color={C.clayInk} opacity={p('p24', 100, 16)}>
          输入在窗里还在变，存下的值就不可靠
        </Txt>
      </g>
    </g>
  );
};

// p25：上升沿以后，输出要过一小段时间才换成新值
const ClkToQ: React.FC = () => {
  const {p} = useT();
  const o = p('p25', 0, 14) * (1 - p('p26', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 460, t1: 3, unit: 400, y0: 380, rowH: 170, amp: 60});
  return (
    <g opacity={o}>
      <Wave
        g={g}
        rows={[
          {kind: 'clock', name: '时钟'},
          {kind: 'bit', name: '输出', v0: 0, edges: [{t: 1.22, v: 1}], color: C.clay, ink: C.clayInk},
        ]}
        upTo={0.5 + p('p25', 0, 200) * 2.5}
      />
      <WaveWindow g={g} t1={1} t2={1.22} rowFrom={0} rowTo={1} label="时钟到输出延迟" opacity={p('p25', 60, 16)} />
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p25', 120, 16)}>
        寄存器自己也有延迟
      </Txt>
    </g>
  );
};

// p26–p30：一拍的下限。上方电路，下方数轴三段区间依次长出，p29 公式整条亮起，p30 引用卡
const LOWER = {y: 360, lx: 480, rx: 1440, mx: 960};
const axisLower = {x1: 480, x2: 1440, v1: 0, v2: 1, y: 680};
const PeriodLower: React.FC = () => {
  const {p} = useT();
  const o = p('p26', 0, 14) * (1 - p('p31', 0, 14));
  if (o <= 0) return null;
  const lp = logicPorts(LOWER.mx, LOWER.y, 440, 140);
  const l = regPorts(LOWER.lx, LOWER.y);
  const r = regPorts(LOWER.rx, LOWER.y);
  const dim = 1 - 0.75 * p('p30', 0, 14);
  const s1 = p('p26', 60, 26);
  const s2 = p('p27', 20, 26);
  const s3 = p('p28', 20, 26);
  return (
    <g opacity={o}>
      <g opacity={dim}>
        <Circuit opacity={1}>
          <Reg cx={LOWER.lx} cy={LOWER.y} draw={p('p26', 4, 20)} />
          <Reg cx={LOWER.rx} cy={LOWER.y} draw={p('p26', 10, 20)} />
          <Wire d={wire([l.q, lp.left])} stroke={C.blue} draw={p('p26', 16, 14)} />
          <Wire d={wire([lp.right, r.d])} stroke={C.blue} draw={p('p26', 20, 14)} />
          <Logic cx={LOWER.mx} cy={LOWER.y} w={440} h={140} size={28} draw={p('p26', 12, 20)} />
        </Circuit>
        <Axis a={axisLower} ticks={[{v: 0}, {v: 1}]} draw={p('p26', 30, 18)} />
        <Txt x={axisX(axisLower, 0)} y={790} anchor="middle" size={26} color={C.clayInk} opacity={s1}>
          这个上升沿
        </Txt>
        <Txt x={axisX(axisLower, 1)} y={790} anchor="middle" size={26} color={C.clayInk} opacity={s1}>
          下一个上升沿
        </Txt>
        <Span a={axisLower} from={0} to={0.22} color={C.clay} ink={C.clayInk} label="时钟到输出延迟" lift={50} size={24} draw={s1} />
        <Span a={axisLower} from={0.22} to={0.78} color={C.blue} ink={C.blueInk} label="组合逻辑延迟" lift={50} size={24} draw={s2} />
        <Span a={axisLower} from={0.78} to={0.94} color={C.clay} ink={C.clayInk} label="建立时间" lift={50} size={24} draw={s3} />
      </g>
      <NumFormula
        x={960}
        y={520}
        size={42}
        draw={p('p29', 0, 30)}
        opacity={1 - p('p30', 0, 14)}
        terms={[
          {t: '时钟周期', color: C.clayInk},
          {t: ' ≥ ', color: C.ink2},
          {t: '时钟到输出延迟', color: C.clayInk},
          {t: ' + ', color: C.ink2},
          {t: '组合逻辑延迟', color: C.blueInk},
          {t: ' + ', color: C.ink2},
          {t: '建立时间', color: C.clayInk},
        ]}
      />
      <Txt x={960} y={280} anchor="middle" size={30} color={C.ink2} opacity={p('p26', 30, 14) * (1 - p('p29', 0, 12))}>
        三段加起来，不能超过一个周期
      </Txt>
      <CiteCard
        b={{x: 410, y: 300, w: 1100, h: 250}}
        year="2009"
        who="Bhasker · Chadha"
        venue="Springer"
        title="Static Timing Analysis for Nanometer Designs"
        quoteZh="两排寄存器之间的每一条路，都要满足建立时间检查"
        draw={p('p30', 0, 22)}
        opacity={1 - p('p31', 0, 12)}
      />
    </g>
  );
};

// p31–p32：保持时间查最短的路，和周期无关。p31 时序图，p32 对比表
const HoldCheck: React.FC = () => {
  const {p} = useT();
  const o = p('p31', 0, 14) * (1 - p('p33', 0, 12));
  if (o <= 0) return null;
  const g = waveGeom({x0: 460, t1: 2.6, unit: 460, y0: 390, rowH: 140, amp: 50});
  const table = p('p32', 0, 14);
  return (
    <g opacity={o}>
      <g opacity={1 - table}>
        <Wave
          g={g}
          rows={[
            {kind: 'clock', name: '时钟'},
            {kind: 'bit', name: '前排放出', v0: 0, edges: [{t: 1.05, v: 1}], color: C.clay, ink: C.clayInk},
            {kind: 'bit', name: '后一排看到', v0: 0, edges: [{t: 1.22, v: 1}], color: C.blue, ink: C.blueInk},
          ]}
          upTo={0.5 + p('p31', 0, 200) * 2.1}
        />
        <WaveWindow g={g} t1={1} t2={1.12} rowFrom={1} rowTo={2} label="保持时间" below opacity={p('p31', 60, 16)} />
        <Txt x={960} y={240} anchor="middle" size={28} color={C.ink2} opacity={p('p31', 120, 14)}>
          最短的那条路，也要在保持时间结束之后才到
        </Txt>
        <NumFormula
          x={960}
          y={310}
          size={38}
          draw={p('p31', 130, 30)}
          terms={[
            {t: '时钟到输出延迟 + 最短路径延迟', color: C.clayInk},
            {t: ' ≥ ', color: C.ink2},
            {t: '保持时间', color: C.clayInk},
          ]}
        />
      </g>
      <g opacity={table}>
        <Table
          cx={960}
          y={330}
          colW={[320, 440, 440]}
          size={30}
          draw={p('p32', 0, 20)}
          header={['', '建立时间', '保持时间']}
          headColors={[undefined, C.clayInk, C.clayInk]}
          rows={[
            {cells: ['比哪条路', '最长的一条', '最短的一条'], o: p('p32', 20, 16)},
            {cells: ['跟周期的关系', '定下周期的下限', '和周期无关'], o: p('p32', 40, 16)},
          ]}
        />
        <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p32', 60, 16)}>
          所以我们给时钟定快慢，只看建立时间那条
        </Txt>
      </g>
    </g>
  );
};

// p33–p35：关键路径。两排寄存器之间三条长短不同的门链，最长的一条标成陶土；p35 换成五步长路
const CHAIN3 = {y: 480, lx: 280, rx: 1640, rows: [360, 480, 600]};
const CritPath: React.FC = () => {
  const {p} = useT();
  const o = p('p33', 0, 14) * (1 - p('k03', 0, 12));
  if (o <= 0) return null;
  const l = regPorts(CHAIN3.lx, CHAIN3.y, 80, 112);
  const r = regPorts(CHAIN3.rx, CHAIN3.y, 80, 112);
  const three = 1 - p('p35', 0, 16);
  const hi = p('p34', 0, 18);
  const trunkL = 420;
  const trunkR = 1500;
  // 三条链各自要画的线；最长的第三条用陶土描
  const link = (i: number) => {
    const cy = CHAIN3.rows[i];
    const gates = [640, 860, 1080].slice(0, i + 1);
    const stroke = i === 2 ? C.clay : C.ink2;
    const last = gates[gates.length - 1] + 80;
    const segs: string[] = [
      wire([l.q, {x: trunkL, y: CHAIN3.y}, {x: trunkL, y: cy}, {x: gates[0], y: cy}]),
      ...gates.slice(1).map((gx, k) => wire([{x: gates[k] + 80, y: cy}, {x: gx, y: cy}])),
      wire([{x: last, y: cy}, {x: trunkR, y: cy}, {x: trunkR, y: CHAIN3.y}, r.d]),
    ];
    return {gates, stroke, segs};
  };
  const d3 = p('p33', 30, 24);
  return (
    <g opacity={o}>
      <g opacity={three}>
        <Circuit opacity={1}>
          <Reg cx={CHAIN3.lx} cy={CHAIN3.y} w={80} h={112} draw={p('p33', 4, 20)} />
          <Reg cx={CHAIN3.rx} cy={CHAIN3.y} w={80} h={112} draw={p('p33', 8, 20)} />
          {[0, 1, 2].map((i) => {
            const {gates, stroke, segs} = link(i);
            const dd = i === 2 ? d3 : p('p33', 20 + i * 6, 20);
            return (
              <g key={i}>
                {segs.map((d2, k) => (
                  <Wire key={k} d={d2} stroke={stroke} draw={dd} />
                ))}
                {gates.map((gx, k) => (
                  <Gate key={gx} kind={k % 2 ? 'or' : 'and'} x={gx} y={CHAIN3.rows[i] - 50} draw={Math.max(0, dd * 2 - 1)} stroke={stroke} />
                ))}
              </g>
            );
          })}
        </Circuit>
        <Txt x={960} y={230} anchor="middle" size={30} color={C.ink2} opacity={p('p33', 40, 14)}>
          两排寄存器之间，往往有很多条路
        </Txt>
        <Label cx={1340} cy={540} text="关键路径" size={28} stroke={C.clay} color={C.clayInk} draw={hi} opacity={hi} />
      </g>
      <g opacity={p('p35', 0, 16)}>
        <StepChainLike draw={p('p35', 10, 30)} />
        <Txt x={960} y={240} anchor="middle" size={30} color={C.clayInk} opacity={p('p35', 60, 16)}>
          一次乘法全放在两排之间，关键路径从拆包一路走到写回
        </Txt>
        <Txt x={960} y={305} anchor="middle" size={30} opacity={p('p35', 90, 16)}>
          周期只能跟着拉长
        </Txt>
      </g>
    </g>
  );
};

// p35 复用五步链（两端寄存器、五个组合块）
const StepChainLike: React.FC<{draw: number}> = ({draw}) => {
  const y = 400;
  const xs = [330, 645, 960, 1275, 1590];
  const w = 180;
  const l = regPorts(170, y);
  const r = regPorts(1750, y);
  return (
    <Circuit opacity={1}>
      <Reg cx={170} cy={y} draw={draw} />
      <Reg cx={1750} cy={y} draw={draw} />
      {xs.map((x, i) => (
        <Logic key={x} cx={x} cy={y} w={w} h={110} text={['拆包', '相乘', '规格化', '舍入', '写回'][i]} size={28} draw={Math.max(0, draw * 1.3 - i * 0.06)} />
      ))}
      <Wire d={wire([l.q, {x: xs[0] - w / 2, y}])} stroke={C.ink2} draw={draw} />
      {xs.slice(1).map((x, i) => (
        <Wire key={x} d={wire([{x: xs[i] + w / 2, y}, {x: x - w / 2, y}])} stroke={C.ink2} draw={draw} />
      ))}
      <Wire d={wire([{x: xs[4] + w / 2, y}, r.d])} stroke={C.ink2} draw={draw} />
    </Circuit>
  );
};

export const Speed: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p22') || f >= s('k03')) return null;
  return (
    <g>
      <SetupHold />
      <ClkToQ />
      <PeriodLower />
      <HoldCheck />
      <CritPath />
    </g>
  );
};
