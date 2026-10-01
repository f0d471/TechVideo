import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Txt} from '../../../src/components/Prims';
import {Label, labelEdges} from '../../../src/components/Label';
import {Table, TableRow} from '../../../src/components/Table';
import {BusMark, Circuit, Gate, Unit, Wire, gate, unitPorts, wire} from '../../../src/components/Gates';
import {Tag} from './Kit';
import codeJson from '../build/code.json';

const rnd = codeSnippet(codeJson, 'rnd');
const select = codeSnippet(codeJson, 'select');
const special = codeSnippet(codeJson, 'special');

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

// c01–c04：加法器得 25 位和；最高位是进位，问号冒号选阶码加一；两个比较器划界；进位时小数位选全零
const add1 = unitPorts(640, 640);
const expAdd = unitPorts(1360, 610);
const selMux = gate('mux', 1120, 560);
const fracMux = gate('mux', 880, 740);
const RndCode: React.FC = () => {
  const {p} = useT();
  const o = p('c01', 10, 14);
  const carry = p('c02', 0, 18);
  const bounds = p('c03', 0, 18);
  const frac = p('c04', 0, 18);
  const lineBeat = (i: number) => (i === 0 ? 'c01' : i <= 3 ? 'c02' : i <= 5 ? 'c03' : 'c04');
  const lineDelay = (i: number) => (i === 0 ? 8 : i <= 3 ? 8 + (i - 1) * 10 : i <= 5 ? 8 + (i - 4) * 12 : 8);
  return (
    <g>
      <CodePanel
        code={rnd}
        vis={p('c01', 0, 14)}
        frameDraw={p('c01', 0, 22)}
        lineIn={(i) => p(lineBeat(i), lineDelay(i), 14)}
        bands={[
          {no: 137, o: p('c01', 12, 12) * (1 - p('c02', 0, 10))},
          {no: 138, o: p('c02', 0, 12)},
          {no: 139, o: p('c02', 10, 12) * (1 - p('c03', 0, 10))},
          {no: 140, o: p('c02', 20, 12) * (1 - p('c03', 0, 10))},
          {no: 141, o: p('c03', 0, 12)},
          {no: 142, o: p('c03', 12, 12)},
          {no: 143, o: p('c04', 0, 12)},
        ]}
        underlines={[
          {no: 137, tok: "{1'b0, prod_n[46:23]}", color: C.blue, draw: p('c01', 16, 16)},
          {no: 137, tok: "{24'd0, round_up}", color: C.ink2, draw: p('c01', 28, 16)},
          {no: 138, tok: 'mant_rnd[24]', color: C.blue, draw: p('c02', 0, 16)},
          {no: 140, tok: "?", color: C.clay, draw: p('c02', 14, 16)},
          {no: 139, tok: 'exp_final_s', color: C.clay, draw: p('c02', 24, 16)},
          {no: 141, tok: '<=', color: C.clay, draw: p('c03', 4, 16)},
          {no: 142, tok: '>=', color: C.clay, draw: p('c03', 20, 16)},
          {no: 143, tok: "23'd0", color: C.blue, draw: p('c04', 6, 16)},
        ]}
      />
      <Circuit opacity={o}>
        <Name x={480} y={add1.in1.y} t="prod_n[46:23]" color={C.blueInk} o={o} />
        <Name x={480} y={add1.in2.y} t="round_up" o={o} />
        <BusMark x={524} y={add1.in1.y} n={24} color={C.blue} o={o} />
        <BusMark x={524} y={add1.in2.y} n={1} color={C.ink2} o={o} />
        <Wire d={wire([{x: 500, y: add1.in1.y}, add1.in1])} stroke={C.blue} draw={p('c01', 14, 14)} />
        <Wire d={wire([{x: 500, y: add1.in2.y}, add1.in2])} stroke={C.ink2} draw={p('c01', 14, 14)} />
        <Unit cx={640} cy={640} sym="+" stroke={C.blue} draw={p('c01', 22, 16)} />
        <Wire d={wire([add1.right, {x: 900, y: 640}])} stroke={C.blue} draw={p('c01', 34, 16)} />
        <BusMark x={760} y={640} n={25} color={C.blue} o={p('c01', 40, 12)} />
        <Name x={930} y={640} t="mant_rnd" color={C.blueInk} anchor="start" o={p('c01', 44, 12)} />

        <g opacity={carry}>
          <Wire d={wire([{x: 890, y: 640}, {x: 890, y: 540}, {x: 1160, y: 540}])} stroke={C.blue} draw={p('c02', 0, 14)} />
          <Name x={890} y={512} t="mant_ovf" color={C.blueInk} anchor="middle" o={p('c02', 8, 12)} />
          <Tag x={1070} y={selMux.in1.y} text="1" color={C.clay} o={p('c02', 14, 12)} />
          <Tag x={1070} y={selMux.in2.y} text="0" color={C.ink2} o={p('c02', 14, 12)} />
          <Wire d={wire([{x: 1092, y: selMux.in1.y}, selMux.in1])} stroke={C.clay} draw={p('c02', 16, 12)} />
          <Wire d={wire([{x: 1092, y: selMux.in2.y}, selMux.in2])} stroke={C.ink2} draw={p('c02', 16, 12)} />
          <Gate kind="mux" x={1120} y={560} draw={p('c02', 20, 16)} stroke={C.clay} />
          <Wire d={wire([{x: 1165, y: 540}, {x: 1165, y: selMux.selTop.y}])} stroke={C.blue} draw={p('c02', 22, 12)} />
          <Name x={1323} y={544} t="exp_n_s" color={C.clayInk} anchor="middle" o={p('c02', 26, 12)} />
          <Wire d={wire([{x: 1323, y: 560}, {x: 1323, y: expAdd.in1.y}])} stroke={C.clay} draw={p('c02', 28, 12)} />
          <Wire d={wire([selMux.out, {x: 1262, y: selMux.out.y}, {x: 1262, y: expAdd.in2.y}, expAdd.in2])} stroke={C.clay} draw={p('c02', 34, 14)} />
          <Unit cx={1360} cy={610} sym="+" stroke={C.clay} draw={p('c02', 40, 16)} />
          <Wire d={wire([expAdd.right, {x: 1560, y: 610}])} stroke={C.clay} draw={p('c02', 52, 14)} />
          <BusMark x={1470} y={610} n={10} color={C.clay} o={p('c02', 58, 12)} />
          <Name x={1580} y={610} t="exp_final_s" color={C.clayInk} anchor="start" o={p('c02', 62, 12)} />
        </g>

        <g opacity={bounds}>
          <Wire d={wire([{x: 1480, y: 610}, {x: 1480, y: 700}, {x: 1240, y: 700}, {x: 1240, y: 727}])} stroke={C.clay} draw={p('c03', 0, 14)} />
          <Wire d={wire([{x: 1480, y: 700}, {x: 1560, y: 700}, {x: 1560, y: 727}])} stroke={C.clay} draw={p('c03', 6, 14)} />
          <Unit cx={1240} cy={773} sym="≤" stroke={C.clay} draw={p('c03', 10, 16)} />
          <Unit cx={1560} cy={773} sym="≥" stroke={C.clay} draw={p('c03', 20, 16)} />
          <Tag x={1240} y={860} text="0" color={C.clay} o={p('c03', 24, 12)} />
          <Tag x={1560} y={860} text="255" color={C.clay} o={p('c03', 30, 12)} />
          <Wire d={wire([{x: 1286, y: 773}, {x: 1350, y: 773}])} stroke={C.clay} draw={p('c03', 30, 12)} />
          <Wire d={wire([{x: 1606, y: 773}, {x: 1660, y: 773}])} stroke={C.clay} draw={p('c03', 38, 12)} />
          <Name x={1370} y={773} t="ftz_out" color={C.clayInk} anchor="start" o={p('c03', 36, 12)} />
          <Name x={1680} y={773} t="overflow" color={C.clayInk} anchor="start" o={p('c03', 44, 12)} />
        </g>

        <g opacity={frac}>
          <Tag x={760} y={fracMux.in1.y} text="23'd0" color={C.blue} o={p('c04', 8, 12)} />
          <Wire d={wire([{x: 812, y: fracMux.in1.y}, fracMux.in1])} stroke={C.blue} draw={p('c04', 10, 12)} />
          <Wire d={wire([{x: 870, y: 640}, {x: 870, y: fracMux.in2.y}, fracMux.in2])} stroke={C.blue} draw={p('c04', 14, 14)} />
          <Gate kind="mux" x={880} y={740} draw={p('c04', 18, 16)} stroke={C.blue} />
          <Wire d={wire([{x: 1105, y: 540}, {x: 1105, y: 700}, {x: 925, y: 700}, {x: 925, y: fracMux.selTop.y}])} stroke={C.blue} draw={p('c04', 22, 12)} />
          <Wire d={wire([fracMux.out, {x: 1120, y: fracMux.out.y}])} stroke={C.blue} draw={p('c04', 28, 14)} />
          <Name x={990} y={752} t="frac_final" color={C.blueInk} anchor="start" o={p('c04', 34, 12)} />
        </g>
      </Circuit>
    </g>
  );
};

// c05–c06：两层二选一挑常规结果；输出按符号、阶码、小数位三段拼接
const muxOvf = gate('mux', 940, 460);
const muxFtz = gate('mux', 1280, 460);
const SelectCode: React.FC = () => {
  const {p} = useT();
  const o = p('c05', 10, 14);
  const join = p('c06', 0, 18);
  return (
    <g>
      <CodePanel
        code={select}
        vis={p('c05', 0, 14)}
        frameDraw={p('c05', 0, 22)}
        lineIn={(i) => p('c05', 8 + i * 10, 14)}
        bands={[
          {no: 148, o: p('c05', 12, 12) * (1 - p('c06', 0, 10) * 0.5)},
          {no: 149, o: p('c06', 0, 12) * 0.5},
          {no: 150, o: p('c06', 0, 12)},
        ]}
        underlines={[
          {no: 148, tok: 'assign', color: C.ink, draw: p('c05', 14, 16)},
          {no: 148, tok: 'ftz_out', color: C.clay, draw: p('c05', 24, 16)},
          {no: 149, tok: 'overflow', color: C.clay, draw: p('c05', 34, 16)},
          {no: 150, tok: "{sign_r, exp_final_s[7:0], frac_final}", color: C.ink2, draw: p('c06', 6, 18)},
        ]}
      />
      <Circuit opacity={o}>
        <Tag x={400} y={400} text="±0" o={o} />
        <Wire d={wire([{x: 430, y: 400}, {x: 1240, y: 400}, {x: 1240, y: muxFtz.in1.y}, muxFtz.in1])} stroke={C.ink2} draw={p('c05', 12, 16)} />
        <Tag x={400} y={muxOvf.in1.y} text="±∞" o={o} />
        <Wire d={wire([{x: 430, y: muxOvf.in1.y}, muxOvf.in1])} stroke={C.ink2} draw={p('c05', 18, 14)} />
        <Tag x={400} y={620} text="正常" o={o} />
        <Wire d={wire([{x: 440, y: 620}, {x: 860, y: 620}, {x: 860, y: muxOvf.in2.y}, muxOvf.in2])} stroke={C.ink2} draw={p('c05', 24, 16)} />
        <Gate kind="mux" x={940} y={460} draw={p('c05', 30, 16)} stroke={C.ink} />
        <Gate kind="mux" x={1280} y={460} draw={p('c05', 38, 16)} stroke={C.ink} />
        <Name x={985} y={414} t="overflow" color={C.clayInk} anchor="middle" o={p('c05', 44, 12)} />
        <Wire d={wire([{x: 985, y: 436}, {x: 985, y: muxOvf.selTop.y}])} stroke={C.clay} draw={p('c05', 46, 12)} />
        <Name x={1325} y={414} t="ftz_out" color={C.clayInk} anchor="middle" o={p('c05', 50, 12)} />
        <Wire d={wire([{x: 1325, y: 436}, {x: 1325, y: muxFtz.selTop.y}])} stroke={C.clay} draw={p('c05', 52, 12)} />
        <Wire d={wire([muxOvf.out, {x: 1120, y: muxOvf.out.y}, {x: 1120, y: muxFtz.in2.y}, muxFtz.in2])} stroke={C.ink2} draw={p('c05', 56, 16)} />
        <Wire d={wire([muxFtz.out, {x: 1780, y: muxFtz.out.y}])} stroke={C.ink} draw={p('c05', 62, 16)} />
        <BusMark x={1450} y={muxFtz.out.y} n={32} color={C.ink} o={p('c05', 68, 12)} />
        <Name x={1600} y={468} t="normal_val" color={C.ink} anchor="middle" o={p('c05', 72, 12)} />

        <g opacity={join}>
          <Wire d={wire([{x: 1380, y: 510}, {x: 1380, y: 620}])} stroke={C.green} sw={1.8} draw={p('c06', 6, 12)} />
          <Wire d={wire([{x: 1560, y: 510}, {x: 1560, y: 620}])} stroke={C.clay} sw={1.8} draw={p('c06', 10, 12)} />
          <Wire d={wire([{x: 1740, y: 510}, {x: 1740, y: 620}])} stroke={C.blue} sw={1.8} draw={p('c06', 14, 12)} />
          <Name x={1380} y={656} t="符号 1 位" color={C.greenInk} anchor="middle" o={p('c06', 18, 12)} />
          <Name x={1560} y={656} t="阶码 8 位" color={C.clayInk} anchor="middle" o={p('c06', 22, 12)} />
          <Name x={1740} y={656} t="小数位 23 位" color={C.blueInk} anchor="middle" o={p('c06', 26, 12)} />
          <Name x={1380} y={712} t="sign_r" color={C.greenInk} anchor="middle" o={p('c06', 30, 12)} />
          <Name x={1560} y={712} t="exp_final_s" color={C.clayInk} anchor="middle" o={p('c06', 34, 12)} />
          <Name x={1740} y={712} t="frac_final" color={C.blueInk} anchor="middle" o={p('c06', 38, 12)} />
        </g>
      </Circuit>
    </g>
  );
};

// c07–c09：特殊值结果备好；三组例子各走一条路；收尾交给下一集
const muxSp = gate('mux', 980, 460);
const CASES: TableRow[] = [
  {cells: ['3FFFFFFE × 3F800001', '40000000（2.0）'], colors: [C.ink, C.ink]},
  {cells: ['7F7FFFFE × 3F800001', '7F800000（+∞）'], colors: [C.ink, C.clayInk]},
  {cells: ['00800000 × 3F000000', '00000000（冲零）'], colors: [C.ink, C.blueInk]},
];
const SpecialCode: React.FC = () => {
  const {p} = useT();
  const o = p('c07', 10, 14);
  const dim = 1 - 0.6 * p('c08', 0, 14);
  return (
    <g>
      <g opacity={dim}>
        <CodePanel
          code={special}
          vis={p('c07', 0, 14)}
          frameDraw={p('c07', 0, 22)}
          lineIn={(i) => p('c07', 8 + i * 8, 14)}
          bands={[{no: 152, o: p('c07', 12, 12)}]}
          underlines={[
            {no: 152, tok: "32'h7FC00000", color: C.clay, draw: p('c07', 14, 16)},
            {no: 153, tok: "8'hFF", color: C.ink2, draw: p('c07', 24, 16)},
            {no: 155, tok: "32'd0", color: C.ink2, draw: p('c07', 34, 16)},
          ]}
        />
        <Circuit opacity={o}>
          <Tag x={680} y={muxSp.in1.y} text="7FC00000" color={C.ink} o={o} />
          <Wire d={wire([{x: 780, y: muxSp.in1.y}, muxSp.in1])} stroke={C.ink2} draw={p('c07', 12, 14)} />
          <Tag x={660} y={muxSp.in2.y} text="±∞ / ±0" color={C.ink} o={o} />
          <Wire d={wire([{x: 760, y: muxSp.in2.y}, muxSp.in2])} stroke={C.ink2} draw={p('c07', 18, 14)} />
          <Gate kind="mux" x={980} y={460} draw={p('c07', 24, 16)} stroke={C.ink} />
          <Label cx={1025} cy={408} text="第 2 集的判断" size={24} draw={p('c07', 28, 14)} />
          <Wire d={wire([{x: 1025, y: 436}, {x: 1025, y: muxSp.selTop.y}])} stroke={C.ink2} draw={p('c07', 34, 12)} />
          <Wire d={wire([muxSp.out, {x: 1240, y: muxSp.out.y}])} stroke={C.ink} draw={p('c07', 38, 14)} />
          <Name x={1260} y={muxSp.out.y} t="spec_res" color={C.ink} anchor="start" o={p('c07', 44, 12)} />
        </Circuit>
      </g>
      <Table
        cx={960}
        y={680}
        colW={[560, 420]}
        header={['输入', '写回']}
        rows={CASES.map((r, i) => ({...r, o: p('c08', 10 + i * 14, 14)}))}
        size={28}
        rowH={64}
        mono={[true, false]}
        draw={p('c08', 0, 16)}
        opacity={p('c08', 0, 14) * (1 - p('c09', 0, 14))}
      />
      <Chain />
    </g>
  );
};

// c09：一次乘法从相乘到写回的整条路，下一集切成两拍
const Chain: React.FC = () => {
  const {p} = useT();
  const o = p('c09', 0, 16);
  if (o <= 0) return null;
  const steps = ['相乘', '规格化', '舍入', '进位与边界', '写回'];
  const xs = [300, 640, 980, 1330, 1650];
  const Y = 700;
  const edges = steps.map((t, i) => labelEdges(xs[i], Y, t, 28));
  return (
    <Circuit opacity={o}>
      {steps.map((t, i) => (
        <g key={t}>
          <Label cx={xs[i]} cy={Y} text={t} size={28} draw={p('c09', 6 + i * 8, 14)} />
          {i > 0 && (
            <Wire
              d={wire([{x: edges[i - 1].right.x + 8, y: Y}, {x: edges[i].left.x - 8, y: Y}])}
              stroke={C.ink2}
              draw={p('c09', 10 + i * 8, 12)}
            />
          )}
        </g>
      ))}
      <Txt x={960} y={820} anchor="middle" size={30} color={C.ink2} opacity={p('c09', 50, 14)}>
        下一集：把这条长路切成两拍
      </Txt>
    </Circuit>
  );
};

export const Code: React.FC = () => {
  const {f, s} = useT();
  if (f < s('c01')) return null;
  if (f < s('c05')) return <RndCode />;
  if (f < s('c07')) return <SelectCode />;
  return <SpecialCode />;
};
