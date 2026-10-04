import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {Table} from '../../../src/components/Table';
import {CodePanel, CodeSource, codeSnippet} from '../../../src/components/CodePanel';
import {BusMark, Circuit, Gate, Logic, ModuleBox, Reg, Unit, Val, Wire, gate, regPorts, unitPorts, wire} from '../../../src/components/Gates';
import codeJson from '../build/code.json';

// 06 写成代码 c01–c15：时钟块 → 第一级的有效信号 → 两级之间的寄存器 → 输出寄存器 → 输出的有效信号 → 收尾
// 版面：代码面板在上（左），电路在面板下方，说明文字在右侧一列；不与底部字幕区挤

const valid1 = codeSnippet(codeJson, 'valid1');
const stage1 = codeSnippet(codeJson, 'stage1');
const regs = codeSnippet(codeJson, 'regs');
const outreg = codeSnippet(codeJson, 'outreg');
const valid2 = codeSnippet(codeJson, 'valid2');

const PANEL_W = 940;
const DY = 30;

// 面板（左上）出现，按 beat 逐行
const Panel: React.FC<{code: CodeSource; at: string; until: string; lineEvery?: number; w?: number}> = ({code, at, until, lineEvery = 20, w = PANEL_W}) => {
  const {p, span} = useT();
  return (
    <g transform={`translate(0, ${DY})`}>
      <CodePanel
        code={code}
        w={w}
        vis={span(at, until, 14)}
        frameDraw={p(at, 0, 22)}
        lineIn={(i) => p(at, 6 + i * lineEvery, 12)}
        bands={[]}
        underlines={[]}
      />
    </g>
  );
};

// c01–c05：时钟块。电路在面板下方，对照与表格在右侧一列
const ClockBlock: React.FC = () => {
  const {p, span} = useT();
  const o = span('c01', 'c06', 14);
  if (o <= 0) return null;
  const rp = regPorts(700, 620, 120, 160);
  return (
    <g opacity={o}>
      <Panel code={valid1} at="c01" until="c06" />
      <Circuit opacity={1}>
        <Wire d={wire([{x: 470, y: 620}, rp.d])} stroke={C.blue} draw={p('c01', 20, 16)} />
        <Val x={440} y={620} v={1} o={p('c01', 24, 12)} color={C.blue} />
        <Reg cx={700} cy={620} w={120} h={160} draw={p('c01', 10, 20)} clockTo={780} />
        <Wire d={wire([rp.q, {x: 940, y: 620}])} stroke={C.clay} draw={p('c03', 30, 16)} />
        <Val x={970} y={620} v={1} o={p('c03', 30, 12)} color={C.clay} />
        <Txt x={440} y={585} anchor="end" size={24} color={C.blueInk}>
          输入
        </Txt>
        <Txt x={700} y={510} anchor="middle" size={26} color={C.clayInk} opacity={p('c03', 60, 12)}>
          上升沿把右边的值存进左边
        </Txt>
        <Txt x={700} y={840} anchor="middle" size={24} color={C.clayInk} opacity={p('c02', 30, 12)}>
          时钟的上升沿
        </Txt>
      </Circuit>
      <g opacity={span('c04', 'c05', 12)}>
        <Label cx={1520} cy={600} text="写在语句开头：存进寄存器" size={26} stroke={C.clay} color={C.clayInk} draw={p('c04', 10, 16)} />
        <Label cx={1520} cy={700} text="写在表达式里：比较大小" size={26} stroke={C.blue} color={C.blueInk} draw={p('c04', 30, 16)} />
      </g>
      <g opacity={span('c05', 'c06', 12)}>
        <Table
          cx={1520}
          y={580}
          colW={[180, 200, 200]}
          size={24}
          rowH={56}
          draw={p('c05', 0, 18)}
          header={['', '组合块', '时钟块']}
          headColors={[undefined, C.blueInk, C.clayInk]}
          rows={[
            {cells: ['输入一变', '重新算', '不动'], o: p('c05', 20, 14)},
            {cells: ['reg 变量', '组合逻辑', '寄存器'], o: p('c05', 40, 14)},
          ]}
        />
      </g>
    </g>
  );
};

// c06–c07：第一级的有效信号：或门、选择器、寄存器、时钟；说明在右侧一列
const Valid1: React.FC = () => {
  const {p, span} = useT();
  const o = span('c06', 'c08', 14);
  if (o <= 0) return null;
  const og = gate('or', 620, 560, 100, 120);
  const mx = gate('mux', 840, 560, 80, 120);
  const rp = regPorts(1040, 620, 100, 140);
  return (
    <g opacity={o}>
      <Panel code={valid1} at="c06" until="c08" />
      <Circuit opacity={1}>
        <Wire d={wire([{x: 500, y: og.in1.y}, og.in1])} stroke={C.ink2} draw={p('c06', 10, 14)} />
        <Wire d={wire([{x: 500, y: og.in2.y}, og.in2])} stroke={C.ink2} draw={p('c06', 16, 14)} />
        <Txt x={480} y={og.in1.y + 9} anchor="end" size={22} mono color={C.clayInk}>
          rst_n
        </Txt>
        <Txt x={480} y={og.in2.y + 9} anchor="end" size={22} mono color={C.clayInk}>
          flush
        </Txt>
        <circle cx={575} cy={og.in1.y} r={9} fill={C.paper} stroke={C.ink2} strokeWidth={2} opacity={p('c06', 20, 12)} />
        <Txt x={575} y={og.in1.y - 20} anchor="middle" size={22} mono color={C.ink2} opacity={p('c06', 20, 12)}>
          !
        </Txt>
        <Txt x={655} y={og.in2.y + 9} size={22} mono color={C.ink2} opacity={p('c06', 30, 12)}>
          ||
        </Txt>
        <Gate kind="or" x={620} y={560} w={100} h={120} draw={p('c06', 6, 18)} />
        <Wire
          d={wire([og.out, {x: 770, y: og.out.y}, {x: 770, y: mx.selTop.y}, mx.selTop])}
          stroke={C.ink2}
          draw={p('c06', 40, 14)}
        />
        <Wire d={wire([{x: 740, y: mx.in1.y}, {x: 840, y: mx.in1.y}])} stroke={C.clay} draw={p('c07', 10, 14)} />
        <Txt x={770} y={mx.in1.y - 12} anchor="middle" size={22} mono color={C.clayInk} opacity={p('c07', 14, 12)}>
          1'b0
        </Txt>
        <Wire d={wire([{x: 740, y: mx.in2.y}, {x: 840, y: mx.in2.y}])} stroke={C.green} draw={p('c07', 30, 14)} />
        <Txt x={770} y={mx.in2.y + 24} anchor="middle" size={22} mono color={C.greenInk} opacity={p('c07', 34, 12)}>
          in_valid
        </Txt>
        <Gate kind="mux" x={840} y={560} w={80} h={120} draw={p('c06', 30, 18)} />
        <Wire d={wire([mx.out, rp.d])} stroke={C.ink2} draw={p('c06', 60, 14)} />
        <Reg cx={1040} cy={620} w={100} h={140} draw={p('c06', 50, 18)} clockTo={760} />
        <Wire d={wire([rp.q, {x: 1200, y: 620}])} stroke={C.green} draw={p('c06', 80, 14)} />
        <Txt x={1215} y={629} mono size={24} color={C.greenInk} opacity={p('c06', 90, 12)}>
          v_s1
        </Txt>
      </Circuit>
      <g opacity={p('c07', 60, 14)}>
        <Txt x={1400} y={560} size={26} color={C.clayInk}>
          复位或作废：存 0；
        </Txt>
        <Txt x={1400} y={598} size={26} color={C.clayInk}>
          否则存进来的有效信号
        </Txt>
      </g>
      <Txt x={1400} y={660} size={26} color={C.greenInk} opacity={p('c07', 110, 14)}>
        晚一拍交给第一级
      </Txt>
    </g>
  );
};

// c08–c11：两级之间的寄存器。c08 组合逻辑（× 与 +），c09–c11 一排寄存器与汇流
const Regs1: React.FC = () => {
  const {p, span} = useT();
  const o = span('c08', 'c12', 14);
  if (o <= 0) return null;
  const mul = unitPorts(700, 560, 48);
  const add = unitPorts(700, 720, 48);
  const rp = regPorts(1400, 700, 100, 160);
  return (
    <g opacity={o}>
      <g opacity={span('c08', 'c09', 14)}>
        <Panel code={stage1} at="c08" until="c09" lineEvery={40} w={1390} />
        <Circuit opacity={1}>
          <Wire d={wire([{x: 560, y: mul.in1.y}, mul.in1])} stroke={C.blue} draw={p('c08', 20, 14)} />
          <Wire d={wire([{x: 560, y: mul.in2.y}, mul.in2])} stroke={C.blue} draw={p('c08', 26, 14)} />
          <Txt x={540} y={mul.in1.y + 9} anchor="end" size={22} mono color={C.blueInk}>
            a_mant
          </Txt>
          <Txt x={540} y={mul.in2.y + 9} anchor="end" size={22} mono color={C.blueInk}>
            b_mant
          </Txt>
          <Unit cx={700} cy={560} sym="×" r={48} draw={p('c08', 10, 18)} />
          <Wire d={wire([{x: 560, y: add.in1.y}, add.in1])} stroke={C.clay} draw={p('c08', 40, 14)} />
          <Wire d={wire([{x: 560, y: add.in2.y}, add.in2])} stroke={C.clay} draw={p('c08', 46, 14)} />
          <Txt x={540} y={add.in1.y + 9} anchor="end" size={22} mono color={C.clayInk}>
            a_exp
          </Txt>
          <Txt x={540} y={add.in2.y + 9} anchor="end" size={22} mono color={C.clayInk}>
            b_exp
          </Txt>
          <Unit cx={700} cy={720} sym="+" r={48} draw={p('c08', 30, 18)} />
          <Wire d={wire([mul.right, {x: 900, y: 560}])} stroke={C.blue} draw={p('c08', 50, 14)} />
          <Wire d={wire([add.right, {x: 900, y: 720}])} stroke={C.clay} draw={p('c08', 54, 14)} />
        </Circuit>
        <Txt x={1080} y={640} size={26} color={C.ink2} opacity={p('c08', 60, 12)}>
          两个尾数相乘，两个阶码相加
        </Txt>
      </g>
      <g opacity={span('c09', 'c12', 14)}>
        <Panel code={regs} at="c09" until="c12" lineEvery={10} />
        <Circuit opacity={1}>
          <Wire d={wire([{x: 1150, y: 640}, {x: 1300, y: 640}])} stroke={C.blue} sw={5} draw={p('c09', 20, 16)} />
          <BusMark x={1230} y={640} n={48} o={p('c09', 30, 12)} />
          <Txt x={1140} y={649} anchor="end" size={22} mono color={C.blueInk} opacity={p('c09', 30, 12)}>
            积
          </Txt>
          <Wire d={wire([{x: 1150, y: 700}, {x: 1300, y: 700}])} stroke={C.clay} sw={5} draw={p('c09', 50, 16)} />
          <BusMark x={1230} y={700} n={10} o={p('c09', 60, 12)} />
          <Txt x={1140} y={709} anchor="end" size={22} mono color={C.clayInk} opacity={p('c09', 60, 12)}>
            阶码和
          </Txt>
          <Wire d={wire([{x: 1150, y: 760}, {x: 1300, y: 760}])} stroke={C.blue} draw={p('c09', 80, 16)} />
          <BusMark x={1230} y={760} n={1} o={p('c09', 90, 12)} />
          <Txt x={1140} y={769} anchor="end" size={22} mono color={C.blueInk} opacity={p('c09', 90, 12)}>
            符号
          </Txt>
          <Wire d={wire([{x: 1300, y: 640}, {x: 1300, y: 760}])} stroke={C.ink2} draw={p('c09', 90, 14)} />
          <Wire d={wire([{x: 1300, y: 700}, rp.d])} stroke={C.ink2} draw={p('c09', 96, 12)} />
          <Reg cx={1400} cy={700} w={100} h={160} draw={p('c09', 10, 20)} clockTo={850} />
          <Wire d={wire([rp.q, {x: 1560, y: 700}])} stroke={C.ink2} draw={p('c11', 20, 14)} />
        </Circuit>
        <Label cx={1600} cy={600} text="两级之间的寄存器" size={28} stroke={C.clay} color={C.clayInk} draw={p('c11', 0, 16)} />
        <g opacity={p('c10', 20, 12) * (1 - p('c11', 0, 12))}>
          <Txt x={1470} y={720} size={24} color={C.ink2}>
            波浪号按位取反，三种特殊情况
          </Txt>
          <Txt x={1470} y={758} size={24} color={C.ink2}>
            相互排斥，只让一种成立
          </Txt>
        </g>
        <g opacity={p('c11', 40, 14)}>
          <Txt x={1470} y={720} size={24} color={C.clayInk}>
            八行在同一个时钟块里，
          </Txt>
          <Txt x={1470} y={758} size={24} color={C.clayInk}>
            同一个上升沿一起存下
          </Txt>
        </g>
      </g>
    </g>
  );
};

// c12–c13：输出寄存器：选择器在寄存器前面，寄存器落在模块边界上
const OutReg: React.FC = () => {
  const {p, span} = useT();
  const o = span('c12', 'c14', 14);
  if (o <= 0) return null;
  const mx = gate('mux', 700, 620, 90, 120);
  const rp = regPorts(1000, 680, 100, 140);
  return (
    <g opacity={o}>
      <Panel code={outreg} at="c12" until="c14" lineEvery={24} />
      <Circuit opacity={1}>
        <ModuleBox x={620} y={540} w={380} h={300} name="乘法器" draw={p('c12', 40, 18)} />
        <Wire d={wire([{x: 560, y: mx.in1.y}, mx.in1])} stroke={C.ink2} draw={p('c12', 10, 14)} />
        <Txt x={540} y={mx.in1.y + 9} anchor="end" size={22} mono color={C.clayInk}>
          spec_sel_r
        </Txt>
        <Wire d={wire([{x: 560, y: mx.in2.y}, mx.in2])} stroke={C.ink2} draw={p('c12', 16, 14)} />
        <Txt x={540} y={mx.in2.y + 9} anchor="end" size={22} mono color={C.blueInk}>
          normal_val
        </Txt>
        <Gate kind="mux" x={700} y={620} w={90} h={120} draw={p('c12', 4, 18)} />
        <Txt x={745} y={790} anchor="middle" size={24} color={C.ink2} opacity={p('c12', 30, 12)}>
          二选一
        </Txt>
        <Wire d={wire([mx.out, rp.d])} stroke={C.ink2} draw={p('c12', 30, 14)} />
        <Reg cx={1000} cy={680} w={100} h={140} draw={p('c12', 20, 18)} clockTo={810} />
        <Wire d={wire([rp.q, {x: 1150, y: 680}])} stroke={C.clay} draw={p('c12', 50, 14)} />
        <Txt x={1170} y={689} mono size={26} color={C.clayInk} opacity={p('c12', 60, 12)}>
          p
        </Txt>
      </Circuit>
      <Label cx={1600} cy={560} text="输出寄存器" size={30} stroke={C.clay} color={C.clayInk} draw={p('c13', 0, 16)} />
      <g opacity={p('c13', 30, 14)}>
        <Txt x={1400} y={640} size={24} color={C.ink2}>
          结果出模块之前先存一拍，
        </Txt>
        <Txt x={1400} y={678} size={24} color={C.ink2}>
          组合逻辑留在了乘法器里面
        </Txt>
      </g>
    </g>
  );
};

// c14：输出的有效信号：第一级的有效信号再存一拍
const Valid2: React.FC = () => {
  const {p, span} = useT();
  const o = span('c14', 'c15', 14);
  if (o <= 0) return null;
  const rp = regPorts(900, 660, 100, 140);
  return (
    <g opacity={o}>
      <Panel code={valid2} at="c14" until="c15" lineEvery={24} />
      <Circuit opacity={1}>
        <Wire d={wire([{x: 560, y: 660}, rp.d])} stroke={C.green} draw={p('c14', 10, 14)} />
        <Txt x={540} y={669} anchor="end" size={24} mono color={C.greenInk}>
          v_s1
        </Txt>
        <Reg cx={900} cy={660} w={100} h={140} draw={p('c14', 4, 18)} clockTo={800} />
        <Wire d={wire([rp.q, {x: 1100, y: 660}])} stroke={C.green} draw={p('c14', 30, 14)} />
        <Txt x={1120} y={669} mono size={24} color={C.greenInk} opacity={p('c14', 40, 12)}>
          out_valid
        </Txt>
      </Circuit>
      <Txt x={1400} y={560} size={26} color={C.greenInk} opacity={p('c14', 60, 14)}>
        第一级的有效信号再存一拍
      </Txt>
      <Txt x={1400} y={630} size={26} color={C.ink2} opacity={p('c14', 100, 14)}>
        四组数出来的那四拍，它都是一
      </Txt>
    </g>
  );
};

// c15：收尾：整条两级流水线，数据与有效信号两条链并行
const Finale: React.FC = () => {
  const {p} = useT();
  const o = p('c15', 0, 16);
  if (o <= 0) return null;
  const r1 = regPorts(900, 340);
  const r2 = regPorts(1420, 340);
  const rv1 = regPorts(900, 660);
  const rv2 = regPorts(1420, 660);
  return (
    <g opacity={o}>
      <Circuit opacity={1}>
        <Txt x={210} y={349} anchor="start" size={26} color={C.blueInk}>
          输入
        </Txt>
        <Wire d={wire([{x: 300, y: 340}, {x: 420, y: 340}])} stroke={C.blue} draw={p('c15', 10, 16)} />
        <Logic cx={560} cy={340} w={240} h={110} text="拆包 · 相乘" size={24} draw={p('c15', 16, 18)} />
        <Wire d={wire([{x: 680, y: 340}, r1.d])} stroke={C.blue} draw={p('c15', 26, 14)} />
        <Reg cx={900} cy={340} draw={p('c15', 30, 18)} clockTo={450} />
        <Wire d={wire([r1.q, {x: 1080, y: 340}])} stroke={C.blue} draw={p('c15', 36, 14)} />
        <Logic cx={1220} cy={340} w={240} h={110} text="规格化 · 舍入" size={24} draw={p('c15', 40, 18)} />
        <Wire d={wire([{x: 1340, y: 340}, r2.d])} stroke={C.blue} draw={p('c15', 46, 14)} />
        <Reg cx={1420} cy={340} draw={p('c15', 50, 18)} clockTo={450} />
        <Wire d={wire([r2.q, {x: 1560, y: 340}])} stroke={C.blue} draw={p('c15', 56, 14)} />
        <Txt x={1580} y={349} anchor="start" size={26} color={C.blueInk}>
          结果
        </Txt>
        <Txt x={210} y={669} anchor="start" size={26} color={C.greenInk}>
          in_valid
        </Txt>
        <Wire d={wire([{x: 360, y: 660}, rv1.d])} stroke={C.green} draw={p('c15', 66, 14)} />
        <Reg cx={900} cy={660} stroke={C.green} draw={p('c15', 70, 18)} clockTo={770} />
        <Wire d={wire([rv1.q, rv2.d])} stroke={C.green} draw={p('c15', 76, 14)} />
        <Reg cx={1420} cy={660} stroke={C.green} draw={p('c15', 80, 18)} clockTo={770} />
        <Wire d={wire([rv2.q, {x: 1560, y: 660}])} stroke={C.green} draw={p('c15', 86, 14)} />
        <Txt x={1580} y={669} anchor="start" size={26} color={C.greenInk}>
          out_valid
        </Txt>
        <RLine x1={900} y1={450} x2={1420} y2={450} stroke={C.clay} sw={2.4} draw={p('c15', 90, 16)} />
        <Txt x={1160} y={494} anchor="middle" size={24} color={C.clayInk} opacity={p('c15', 96, 12)}>
          同一个时钟，两级一起算
        </Txt>
      </Circuit>
      <Txt x={960} y={200} anchor="middle" size={30} opacity={p('c15', 110, 16)}>
        一次乘法切成流水线以后，每一拍都能交出一个结果
      </Txt>
    </g>
  );
};

export const CodePart: React.FC = () => {
  const {p} = useT();
  if (p('c01', 0, 1) <= 0) return null;
  return (
    <g>
      <ClockBlock />
      <Valid1 />
      <Regs1 />
      <OutReg />
      <Valid2 />
      <Finale />
    </g>
  );
};
