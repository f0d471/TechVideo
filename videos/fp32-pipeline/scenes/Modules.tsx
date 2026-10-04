import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {CiteCard} from '../../../src/components/CiteCard';
import {BusMark, Circuit, Logic, ModuleBox, Reg, Wire, logicPorts, regPorts, wire} from '../../../src/components/Gates';
import {StepChain} from './Kit';

// 04 输出也存一拍 p52–p60：模块 → 跨过边界的路 → 输出寄存器 → 两条设计准则 → 回到两级流水线

const MOD = {
  y: 480,
  mul: {x: 180, y: 300, w: 780, h: 420},
  add: {x: 1160, y: 300, w: 640, h: 420},
  regL: 320,
  logicL: {cx: 660, w: 280},
  logicR: {cx: 1380, w: 240},
  regR: 1650,
  outReg: 960,
};

// p52–p57：乘法器、加法器两个模块，之间的总线；p54 陶土路径跨过边界，p56 出口插上输出寄存器
const Modules: React.FC = () => {
  const {p} = useT();
  const o = p('p52', 0, 14) * (1 - p('p58', 0, 12));
  if (o <= 0) return null;
  const lp1 = logicPorts(MOD.logicL.cx, MOD.y, MOD.logicL.w, 130);
  const lp2 = logicPorts(MOD.logicR.cx, MOD.y, MOD.logicR.w, 130);
  const rl = regPorts(MOD.regL, MOD.y);
  const rr = regPorts(MOD.regR, MOD.y);
  const hasOut = p('p56', 30, 30) > 0;
  const crit = p('p54', 0, 26);
  const breakX1 = MOD.outReg - 38;
  const breakX2 = MOD.outReg + 38;
  return (
    <g opacity={o}>
      <Circuit opacity={1}>
        <ModuleBox x={MOD.mul.x} y={MOD.mul.y} w={MOD.mul.w} h={MOD.mul.h} name="乘法器" draw={p('p52', 0, 22)} />
        <ModuleBox x={MOD.add.x} y={MOD.add.y} w={MOD.add.w} h={MOD.add.h} name="加法器" draw={p('p52', 10, 22)} />
        <Reg cx={MOD.regL} cy={MOD.y} name="寄存器" draw={p('p52', 20, 18)} clockTo={MOD.y + 130} />
        <Logic cx={MOD.logicL.cx} cy={MOD.y} w={MOD.logicL.w} h={130} text="组合逻辑" sub="相乘 · 规格化 · 舍入" size={26} draw={p('p52', 26, 18)} />
        <Wire d={wire([rl.q, lp1.left])} stroke={C.blue} draw={p('p52', 32, 14)} />
        <Wire d={wire([lp1.right, {x: MOD.add.x, y: MOD.y}])} stroke={C.blue} draw={p('p52', 38, 14)} />
        <Wire d={wire([{x: MOD.add.x, y: MOD.y}, lp2.left])} stroke={C.blue} draw={p('p52', 42, 14)} />
        <Wire d={wire([lp2.right, rr.d])} stroke={C.blue} draw={p('p52', 46, 14)} />
        <BusMark x={990} y={MOD.y} n={48} o={p('p52', 50, 14)} />
        <Logic cx={MOD.logicR.cx} cy={MOD.y} w={MOD.logicR.w} h={130} text="组合逻辑" sub="与总和相加" size={26} draw={p('p52', 54, 18)} />
        <Reg cx={MOD.regR} cy={MOD.y} name="寄存器" draw={p('p52', 58, 18)} clockTo={MOD.y + 130} />
        <Wire
          d={wire([
            regPorts(MOD.regR, MOD.y).q,
            {x: MOD.regR + 60, y: MOD.y},
            {x: MOD.regR + 60, y: MOD.y + 200},
            {x: MOD.logicR.cx, y: MOD.y + 200},
            {x: MOD.logicR.cx, y: MOD.y + 65},
          ])}
          stroke={C.blue}
          draw={p('p53', 0, 22)}
        />
        <Txt x={MOD.logicR.cx + 190} y={MOD.y + 270} size={24} color={C.ink2} opacity={p('p53', 20, 14)}>
          前面的总和
        </Txt>
      </Circuit>
      {/* p54–p55：从乘法器里的寄存器一路穿到加法器里的寄存器 */}
      <g opacity={p('p54', 0, 14) * (1 - 0.85 * p('p56', 0, 12))}>
        <Circuit opacity={1}>
          <Wire d={wire([rl.q, lp1.left])} stroke={C.clay} sw={4.4} draw={crit} />
          <Wire d={wire([lp1.right, hasOut ? {x: breakX1, y: MOD.y} : {x: MOD.add.x, y: MOD.y}])} stroke={C.clay} sw={4.4} draw={crit} />
          {hasOut && <Wire d={wire([{x: breakX2, y: MOD.y}, lp2.left])} stroke={C.clay} sw={4.4} draw={crit} />}
          <Wire d={wire([lp2.right, rr.d])} stroke={C.clay} sw={4.4} draw={crit} />
        </Circuit>
        <Txt x={960} y={MOD.y + 120} anchor="middle" size={28} color={C.clayInk} opacity={p('p54', 40, 14) * (1 - p('p56', 0, 12))}>
          一条路从乘法器里的寄存器，一直穿到加法器里的寄存器
        </Txt>
        <Txt x={960} y={240} anchor="middle" size={28} color={C.ink2} opacity={p('p55', 0, 14) * (1 - p('p56', 0, 12))}>
          两个模块分开设计，这条路要两边一起查、一起改
        </Txt>
      </g>
      {/* p56–p57：出口放一排寄存器，路断成两段，各在一个模块里 */}
      <Circuit opacity={1}>
        {p('p56', 30, 30) > 0 && <Reg cx={MOD.outReg} cy={MOD.y} w={70} h={110} draw={p('p56', 30, 26)} clockTo={MOD.y + 130} />}
      </Circuit>
      <g opacity={p('p57', 0, 14)}>
        <Label cx={MOD.outReg} cy={650} text="输出寄存器" size={32} stroke={C.clay} color={C.clayInk} draw={p('p57', 4, 18)} />
        <RArrow x1={MOD.outReg} y1={612} x2={MOD.outReg} y2={488} lift={0} stroke={C.clay} sw={2.4} draw={p('p57', 14, 14)} />
        <Txt x={MOD.outReg} y={240} anchor="middle" size={28} color={C.ink2} opacity={p('p57', 30, 14)}>
          每条路都在一个模块里头
        </Txt>
      </g>
    </g>
  );
};

// p58–p59：两条准则的引用卡
const Rules: React.FC = () => {
  const {p} = useT();
  const o = p('p58', 0, 14) * (1 - p('p60', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g opacity={1 - p('p59', 0, 12)}>
        <CiteCard
          b={{x: 380, y: 280, w: 1160, h: 250}}
          year="2002"
          who="Keating · Bricaud"
          venue="Reuse Methodology Manual，Kluwer"
          title="每个子模块的输出都要存一拍"
          draw={p('p58', 0, 22)}
        />
      </g>
      <g opacity={p('p59', 0, 14)}>
        <CiteCard
          b={{x: 380, y: 280, w: 1160, h: 250}}
          year="2022"
          who="AMD · Xilinx"
          venue="UltraFast 设计方法指南"
          title="在逻辑边界上存数据路径"
          quoteZh="关键路径关在一个模块之内，查起来、改起来都容易"
          draw={p('p59', 0, 22)}
        />
      </g>
    </g>
  );
};

// p60：两级流水线的第二排寄存器就在出口，它就是输出寄存器
const BackToTwo: React.FC = () => {
  const {p} = useT();
  const o = p('p60', 0, 14) * (1 - p('k05', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <StepChain draw={p('p60', 0, 24)} cut={1} />
      <Label cx={802} cy={560} text="输出寄存器" size={30} stroke={C.clay} color={C.clayInk} draw={p('p60', 40, 16)} />
      <RArrow x1={802} y1={518} x2={802} y2={450} lift={0} stroke={C.clay} sw={2.4} draw={p('p60', 50, 14)} />
      <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p60', 70, 16)}>
        第二排寄存器就在出口，它就是输出寄存器
      </Txt>
      <Txt x={960} y={310} anchor="middle" size={28} color={C.ink2} opacity={p('p60', 100, 14)}>
        输入那头接的，是上游模块存过的输出
      </Txt>
    </g>
  );
};

export const ModulesPart: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p52') || f >= s('k05')) return null;
  return (
    <g>
      <Modules />
      <Rules />
      <BackToTwo />
    </g>
  );
};
