import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Txt} from '../../../src/components/Prims';
import {BusMark, Circuit, Gate, Unit, Val, Wire, gate, unitPorts, wire} from '../../../src/components/Gates';
import {Tag} from './Kit';
import codeJson from '../build/code.json';

const sign = codeSnippet(codeJson, 'sign');
const special = codeSnippet(codeJson, 'special');
const productExp = codeSnippet(codeJson, 'product-exp');

const Name: React.FC<{x: number; y: number; t: string; color?: string; o: number; anchor?: 'start' | 'end' | 'middle'}> = ({
  x,
  y,
  t,
  color = C.ink2,
  o,
  anchor = 'end',
}) => (
  <Txt x={x} y={y + 8} anchor={anchor} mono size={24} color={color} opacity={o}>
    {t}
  </Txt>
);

// c01–c02：一行代码就是一扇异或门，两个符号位进，积的符号出
const xg = gate('xor', 880, 440);
const SignCode: React.FC = () => {
  const {p} = useT();
  const o = p('c01', 10, 14);
  return (
    <g>
      <CodePanel
        code={sign}
        vis={p('c01', 0, 14)}
        frameDraw={p('c01', 0, 22)}
        lineIn={() => p('c01', 8, 14)}
        bands={[{no: 48, o: p('c01', 12, 12)}]}
        underlines={[{no: 48, tok: '^', color: C.green, draw: p('c02', 0, 18)}]}
      />
      <Circuit opacity={o}>
        <Name x={600} y={xg.in1.y} t="a_sign" color={C.greenInk} o={o} />
        <Name x={600} y={xg.in2.y} t="b_sign" color={C.greenInk} o={o} />
        <Wire d={wire([{x: 620, y: xg.in1.y}, xg.in1])} stroke={C.green} draw={p('c01', 16, 16)} />
        <Wire d={wire([{x: 620, y: xg.in2.y}, xg.in2])} stroke={C.green} draw={p('c01', 16, 16)} />
        <Gate kind="xor" x={880} y={440} label="异或" stroke={C.green} draw={p('c01', 26, 18)} />
        <Wire d={wire([xg.out, {x: 1300, y: xg.out.y}])} stroke={C.green} draw={p('c01', 40, 16)} />
        <Name x={1320} y={xg.out.y} t="result_sign" color={C.greenInk} anchor="start" o={p('c01', 46, 12)} />
        <Val x={740} y={xg.in1.y} v={0} o={p('c02', 20, 10)} />
        <Val x={740} y={xg.in2.y} v={0} o={p('c02', 20, 10)} />
        <Val x={1140} y={xg.out.y} v={0} o={p('c02', 34, 10)} />
      </Circuit>
    </g>
  );
};

// c03–c05：有无穷、有零各是一扇或门，两者再进与门得到冲突标志；最后和「输入是 NaN」相或
const and1 = gate('and', 1060, 470);
const or1 = gate('or', 760, 340);
const or2 = gate('or', 760, 600);
const or3 = gate('or', 1300, 560);
const IN = 540;
const SpecialCode: React.FC = () => {
  const {p} = useT();
  const o = p('c03', 10, 14);
  const ors = p('c04', 0, 18);
  const last = p('c05', 0, 18);
  const v = p('c05', 40, 12);
  const vIn = [1, 0, 0, 1];
  const inputs: [string, {x: number; y: number}][] = [
    ['a_is_inf', or1.in1],
    ['b_is_inf', or1.in2],
    ['a_is_zero', or2.in1],
    ['b_is_zero', or2.in2],
  ];
  return (
    <g>
      <CodePanel
        code={special}
        vis={p('c03', 0, 14)}
        frameDraw={p('c03', 0, 22)}
        lineIn={(i) => p('c03', 8 + i * 7, 14)}
        bands={[
          {no: 59, o: p('c03', 12, 12) * (1 - p('c05', 0, 10))},
          {no: 60, o: p('c05', 0, 12)},
        ]}
        underlines={[
          {no: 59, tok: '&&', color: C.ink, draw: p('c03', 20, 16)},
          {no: 59, tok: 'a_is_inf | b_is_inf', color: C.ink2, draw: p('c04', 0, 18)},
          {no: 59, tok: 'a_is_zero | b_is_zero', color: C.ink2, draw: p('c04', 12, 18)},
          {no: 60, tok: 'is_nan | inf_zero_conflict', color: C.ink2, draw: p('c05', 0, 18)},
        ]}
      />
      <Circuit opacity={o}>
        <Gate kind="and" x={1060} y={470} label="与" draw={p('c03', 16, 18)} />
        <Name x={1040} y={and1.in1.y - 22} t="有无穷" o={p('c03', 24, 12) * (1 - ors)} />
        <Name x={1040} y={and1.in2.y + 26} t="有零" o={p('c03', 24, 12) * (1 - ors)} />
        <Wire d={wire([{x: 960, y: and1.in1.y}, and1.in1])} stroke={C.ink2} draw={p('c03', 20, 12)} />
        <Wire d={wire([{x: 960, y: and1.in2.y}, and1.in2])} stroke={C.ink2} draw={p('c03', 20, 12)} />
        <Wire d={wire([and1.out, {x: 1200, y: and1.out.y}])} stroke={C.ink2} draw={p('c03', 30, 16)} />
        <Name x={1100} y={606} t="inf_zero_conflict" anchor="middle" o={p('c03', 36, 12)} />

        <g opacity={ors}>
          {inputs.map(([t, port]) => (
            <g key={t}>
              <Name x={IN - 16} y={port.y} t={t} o={1} />
              <Wire d={wire([{x: IN, y: port.y}, port])} stroke={C.ink2} draw={ors} />
            </g>
          ))}
          <Gate kind="or" x={760} y={340} label="或" draw={ors} />
          <Gate kind="or" x={760} y={600} label="或" draw={ors} />
          <Wire d={wire([or1.out, {x: 960, y: or1.out.y}, {x: 960, y: and1.in1.y}])} stroke={C.ink2} draw={ors} />
          <Wire d={wire([or2.out, {x: 960, y: or2.out.y}, {x: 960, y: and1.in2.y}])} stroke={C.ink2} draw={ors} />
        </g>

        <g opacity={last}>
          <Name x={IN - 16} y={800} t="is_nan" o={1} />
          <Wire d={wire([{x: IN, y: 800}, {x: 1260, y: 800}, {x: 1260, y: or3.in2.y}, or3.in2])} stroke={C.ink2} draw={last} />
          <Wire d={wire([{x: 1200, y: and1.out.y}, {x: 1220, y: and1.out.y}, {x: 1220, y: or3.in1.y}, or3.in1])} stroke={C.ink2} draw={last} />
          <Gate kind="or" x={1300} y={560} label="或" draw={last} />
          <Wire d={wire([or3.out, {x: 1700, y: or3.out.y}])} stroke={C.ink2} draw={last} />
          <Name x={1420} y={or3.out.y - 26} t="is_nan_full" anchor="start" o={1} />
        </g>

        {inputs.map(([t, port], i) => (
          <Val key={t} x={640} y={port.y} v={vIn[i] as 0 | 1} o={v} />
        ))}
        <Val x={640} y={800} v={0} o={v} />
        <Val x={905} y={or1.out.y} v={1} o={p('c05', 50, 10)} />
        <Val x={905} y={or2.out.y} v={1} o={p('c05', 50, 10)} />
        <Val x={1180} y={and1.out.y} v={1} o={p('c05', 58, 10)} />
        <Val x={1560} y={or3.out.y} v={1} o={p('c05', 66, 10)} />
        <Txt x={1560} y={720} anchor="middle" size={28} color={C.ink2} opacity={p('c05', 72, 12)}>
          +∞ × +0：结果选 NaN
        </Txt>
      </Circuit>
    </g>
  );
};

// c06–c08：尾数进乘法器；阶码补两个 0 成 10 位，相加再减 127
const mul = unitPorts(820, 450);
const EY = 680;
const add = unitPorts(820, EY);
const sub = unitPorts(1040, EY);
const X0 = 460;
const ProductCode: React.FC = () => {
  const {p} = useT();
  const m = p('c06', 10, 20);
  const e = p('c07', 0, 20);
  const vm = p('c06', 50, 14);
  const ve = p('c07', 60, 14);
  return (
    <g>
      <CodePanel
        code={productExp}
        vis={p('c06', 0, 14)}
        frameDraw={p('c06', 0, 22)}
        lineIn={(i) => p(i === 0 ? 'c06' : 'c07', 8 + (i === 2 ? 8 : 0), 14)}
        bands={[
          {no: 65, o: p('c06', 12, 12)},
          {no: 66, o: p('c07', 0, 12)},
          {no: 67, o: p('c07', 10, 12)},
        ]}
        underlines={[
          {no: 65, tok: '*', color: C.blue, draw: p('c06', 14, 18)},
          {no: 66, tok: "{2'b0, a_exp}", color: C.clay, draw: p('c07', 0, 18)},
          {no: 66, tok: '$signed', color: C.clay, draw: p('c07', 12, 18)},
          {no: 67, tok: "10'sd127", color: C.clay, draw: p('c07', 24, 18)},
        ]}
      />
      <Circuit opacity={m}>
        <Name x={X0 - 16} y={mul.in1.y} t="a_mant" color={C.blueInk} o={1} />
        <Name x={X0 - 16} y={mul.in2.y} t="b_mant" color={C.blueInk} o={1} />
        <Wire d={wire([{x: X0, y: mul.in1.y}, mul.in1])} stroke={C.blue} draw={m} />
        <Wire d={wire([{x: X0, y: mul.in2.y}, mul.in2])} stroke={C.blue} draw={m} />
        <BusMark x={700} y={mul.in1.y} n={24} color={C.blue} o={m} />
        <BusMark x={700} y={mul.in2.y} n={24} color={C.blue} o={m} />
        <Unit cx={820} cy={450} sym="×" stroke={C.blue} draw={m} />
        <Wire d={wire([mul.right, {x: 1500, y: 450}])} stroke={C.blue} draw={m} />
        <BusMark x={940} y={450} n={48} color={C.blue} o={m} />
        <Name x={1516} y={450} t="product_s0" color={C.blueInk} anchor="start" o={m} />
        <Tag x={560} y={mul.in1.y} text="800001" color={C.blue} o={vm} />
        <Tag x={560} y={mul.in2.y} text="C00000" color={C.blue} o={vm} />
        <Tag x={1220} y={450} text="600000C00000" color={C.blue} o={p('c06', 64, 14)} />
      </Circuit>
      <Circuit opacity={e}>
        <Name x={X0 - 16} y={add.in1.y} t="a_exp" color={C.clayInk} o={1} />
        <Name x={X0 - 16} y={add.in2.y} t="b_exp" color={C.clayInk} o={1} />
        <Wire d={wire([{x: X0, y: add.in1.y}, add.in1])} stroke={C.clay} draw={e} />
        <Wire d={wire([{x: X0, y: add.in2.y}, add.in2])} stroke={C.clay} draw={e} />
        <BusMark x={680} y={add.in1.y} n="8→10" color={C.clay} o={e} />
        <BusMark x={680} y={add.in2.y} n="8→10" color={C.clay} o={e} />
        <Unit cx={820} cy={EY} sym="+" stroke={C.clay} draw={e} />
        <Wire d={wire([add.right, sub.left])} stroke={C.clay} draw={e} />
        <Unit cx={1040} cy={EY} sym="−" stroke={C.clay} draw={e} />
        <Wire d={wire([{x: 1040, y: EY + 110}, sub.bottom])} stroke={C.clay} draw={e} />
        <Name x={1040} y={EY + 136} t="10'sd127" color={C.clayInk} anchor="middle" o={e} />
        <Wire d={wire([sub.right, {x: 1500, y: EY}])} stroke={C.clay} draw={e} />
        <BusMark x={1140} y={EY} n={10} color={C.clay} o={e} />
        <Name x={1516} y={EY} t="exp_sum_s0" color={C.clayInk} anchor="start" o={e} />
        <Tag x={560} y={add.in1.y} text="127" color={C.clay} o={ve} />
        <Tag x={560} y={add.in2.y} text="127" color={C.clay} o={ve} />
        <Tag x={930} y={EY} text="254" color={C.clay} o={p('c07', 70, 12)} />
        <Tag x={1300} y={EY} text="127" color={C.clay} o={p('c07', 80, 12)} />
      </Circuit>
      <Txt x={960} y={880} anchor="middle" size={28} color={C.ink2} opacity={p('c08', 20, 14)}>
        符号 0、阶码和 127、尾数积 600000C00000 → 下一集规格化
      </Txt>
    </g>
  );
};

export const Code: React.FC = () => {
  const {f, s} = useT();
  if (f < s('c01')) return null;
  if (f < s('c03')) return <SignCode />;
  if (f < s('c06')) return <SpecialCode />;
  return <ProductCode />;
};
