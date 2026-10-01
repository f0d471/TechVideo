import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Label, labelEdges} from '../../../src/components/Label';
import {BusMark, Circuit, Gate, Src, Unit, Val, Wire, gate, unitPorts, wire} from '../../../src/components/Gates';
import {Txt} from '../../../src/components/Prims';
import {Tag} from './Kit';
import codeJson from '../build/code.json';

const head = codeSnippet(codeJson, 'normalize-head');
const branch = codeSnippet(codeJson, 'normalize-switch');

const Name: React.FC<{x: number; y: number; t: string; color?: string; o?: number; anchor?: 'start' | 'end' | 'middle'}> = ({
  x,
  y,
  t,
  color = C.ink2,
  o = 1,
  anchor = 'start',
}) => (
  <Txt x={x} y={y + 8} anchor={anchor} mono size={24} color={color} opacity={o}>
    {t}
  </Txt>
);

// c01–c02：两个输出由一个组合块算出；组合块的输入一变，输出马上跟着变
const BLOCK = labelEdges(860, 620, '组合块', 40);
const Head: React.FC = () => {
  const {p} = useT();
  const outs = p('c01', 16, 18);
  const blk = p('c02', 0, 18);
  return (
    <g>
      <CodePanel
        code={head}
        vis={p('c01')}
        frameDraw={p('c01', 0, 22)}
        lineIn={(i) => p('c01', 4 + i * 4, 12)}
        bands={[
          {no: 117, o: p('c01', 10, 12)},
          {no: 118, o: p('c01', 14, 12)},
          {no: 120, o: p('c02', 0, 12)},
        ]}
        underlines={[
          {no: 117, tok: 'exp_n_s', color: C.clay, draw: p('c01', 12)},
          {no: 118, tok: 'prod_n', color: C.blue, draw: p('c01', 18)},
          {no: 117, tok: 'reg', color: C.ink2, draw: p('c02', 0)},
          {no: 120, tok: 'always @(*)', color: C.ink2, draw: p('c02', 10)},
        ]}
      />
      <Circuit opacity={outs}>
        <Wire d={wire([{x: BLOCK.right.x, y: 600}, {x: 1400, y: 600}])} stroke={C.clay} draw={outs} />
        <Wire d={wire([{x: BLOCK.right.x, y: 640}, {x: 1400, y: 640}])} stroke={C.blue} draw={outs} />
        <Name x={1416} y={600} t="exp_n_s" color={C.clayInk} />
        <Name x={1416} y={640} t="prod_n" color={C.blueInk} />
        <Label cx={860} cy={620} text="组合块" size={40} draw={blk} />
        <g opacity={blk}>
          <Wire d={wire([{x: 440, y: 600}, {x: BLOCK.left.x, y: 600}])} stroke={C.clay} draw={blk} />
          <Wire d={wire([{x: 440, y: 640}, {x: BLOCK.left.x, y: 640}])} stroke={C.blue} draw={blk} />
          <Name x={424} y={600} t="exp_r" color={C.clayInk} anchor="end" />
          <Name x={424} y={640} t="product_r" color={C.blueInk} anchor="end" />
        </g>
        <Txt x={860} y={760} anchor="middle" size={30} color={C.ink2} opacity={p('c02', 30, 14)}>
          输入一变，输出马上跟着变
        </Txt>
      </Circuit>
    </g>
  );
};

// c03–c07：面板在上，下方逐路画出。if 这一路：右移器、阶码加一、最低位的或门；else 这一路：两根直通的线
const og = gate('or', 1100, 570);
const shr = unitPorts(640, 730, 40);
const inc = unitPorts(640, 850, 40);
const Lanes: React.FC = () => {
  const {p} = useT();
  const cond = p('c03', 10, 16);
  const pe = p('c04', 0, 20);
  const orL = p('c05', 0, 20);
  const eq = p('c06', 0, 16);
  const other = p('c07', 0, 16);
  const hi = 1 - other;
  const pulse = (base: number) => base * (0.55 + 0.45 * eq);
  return (
    <g>
      <Circuit opacity={cond}>
        <Src x={200} y={620} w={200} label="product_r[47]" fill={C.paper} stroke={C.ink2} draw={cond} />
        <Wire d={wire([{x: 400, y: 620}, {x: 600, y: 620}])} stroke={C.ink2} draw={cond} />
        <Val x={500} y={620} v={1} o={cond * hi} />
        <Val x={500} y={620} v={0} o={other} />
        <Txt x={620} y={630} size={28} opacity={cond * hi}>
          是 1：走右移路
        </Txt>
        <Txt x={620} y={630} size={28} opacity={other}>
          是 0：走直通路
        </Txt>
      </Circuit>
      <Circuit opacity={pe * hi}>
        <Src x={200} y={730} w={160} label="product_r" fill={C.blueTint} stroke={C.blue} draw={pe} />
        <Wire d={wire([{x: 360, y: 730}, shr.left])} stroke={C.blue} draw={pe} />
        <BusMark x={480} y={730} n={48} color={C.blue} o={pe} />
        <Unit cx={640} cy={730} r={40} sym=">>" stroke={C.blue} draw={pe} />
        <Wire d={wire([shr.right, {x: 1480, y: 730}])} stroke={C.blue} draw={pe} />
        <Name x={1496} y={730} t="prod_n" color={C.blueInk} o={pulse(pe)} />
        <Tag x={1000} y={730} text="900000000000 → 480000000000" color={C.blue} o={p('c04', 30, 14)} />
        <Src x={200} y={826} w={110} label="exp_r" fill={C.clayTint} stroke={C.clay} draw={pe} />
        <Wire d={wire([{x: 310, y: 826}, inc.in1])} stroke={C.clay} draw={pe} />
        <Txt x={556} y={882} anchor="end" mono size={26} color={C.clayInk} opacity={pe}>
          1
        </Txt>
        <Wire d={wire([{x: 566, y: inc.in2.y}, inc.in2])} stroke={C.clay} draw={pe} />
        <Unit cx={640} cy={850} r={40} sym="+" stroke={C.clay} draw={pe} />
        <Wire d={wire([inc.right, {x: 1480, y: 850}])} stroke={C.clay} draw={pe} />
        <Name x={1496} y={850} t="exp_n_s" color={C.clayInk} o={pulse(pe)} />
        <Tag x={1000} y={850} text="127 → 128" color={C.clay} o={p('c04', 40, 14)} />
      </Circuit>
      <Circuit opacity={orL * hi}>
        <Src x={1000} y={og.in1.y} w={60} label="[1]" fill={C.paper} stroke={C.ink2} draw={orL} />
        <Src x={1000} y={og.in2.y} w={60} label="[0]" fill={C.greenTint} stroke={C.green} draw={orL} />
        <Wire d={wire([{x: 1060, y: og.in1.y}, og.in1])} stroke={C.ink2} draw={orL} />
        <Wire d={wire([{x: 1060, y: og.in2.y}, og.in2])} stroke={C.green} draw={orL} />
        <Gate kind="or" x={1100} y={570} label="或" stroke={C.green} draw={orL} />
        <Wire d={wire([og.out, {x: 1480, y: og.out.y}])} stroke={C.green} draw={orL} />
        <Name x={1496} y={og.out.y} t="prod_n[0]" color={C.greenInk} o={pulse(orL)} />
      </Circuit>
      <Circuit opacity={other}>
        <Src x={200} y={730} w={160} label="product_r" fill={C.blueTint} stroke={C.blue} draw={other} />
        <Wire d={wire([{x: 360, y: 730}, {x: 1480, y: 730}])} stroke={C.blue} draw={other} />
        <Name x={1496} y={730} t="prod_n" color={C.blueInk} />
        <Src x={200} y={850} w={110} label="exp_r" fill={C.clayTint} stroke={C.clay} draw={other} />
        <Wire d={wire([{x: 310, y: 850}, {x: 1480, y: 850}])} stroke={C.clay} draw={other} />
        <Name x={1496} y={850} t="exp_n_s" color={C.clayInk} />
        <Txt x={900} y={800} anchor="middle" size={28} color={C.ink2} opacity={p('c07', 20, 14)}>
          原样送出
        </Txt>
      </Circuit>
    </g>
  );
};

const Switch: React.FC = () => {
  const {f, s, p} = useT();
  const active =
    f < s('c04') ? [121] : f < s('c05') ? [122, 123] : f < s('c06') ? [124] : f < s('c07') ? [122, 123, 124] : [125, 126, 127];
  const vis = p('c03') * (1 - p('c08', 0, 14));
  return (
    <g>
      <CodePanel
        code={branch}
        vis={vis}
        frameDraw={p('c03', 0, 22)}
        lineIn={(i) => p('c03', 4 + i * 3, 13)}
        bands={active.map((no) => ({no, o: p('c03', 10, 12)}))}
        underlines={[
          {no: 121, tok: 'product_r[47]', color: C.ink, draw: p('c03')},
          {no: 122, tok: "exp_r + 10'sd1", color: C.clay, draw: p('c04')},
          {no: 123, tok: 'product_r >> 1', color: C.blue, draw: p('c04', 8)},
          {no: 124, tok: 'product_r[1] | product_r[0]', color: C.green, draw: p('c05')},
          {no: 122, tok: '=', color: C.ink, draw: p('c06'), opacity: p('c06') * (1 - p('c07'))},
          {no: 123, tok: '=', color: C.ink, draw: p('c06'), opacity: p('c06') * (1 - p('c07'))},
          {no: 124, tok: '=', color: C.ink, draw: p('c06'), opacity: p('c06') * (1 - p('c07'))},
          {no: 126, tok: 'exp_r', color: C.clay, draw: p('c07'), opacity: p('c07')},
          {no: 127, tok: 'product_r', color: C.blue, draw: p('c07'), opacity: p('c07')},
        ]}
      />
      <g opacity={1 - p('c08', 0, 14)}>
        <Lanes />
      </g>
    </g>
  );
};

// c08–c11：两路汇进二选一选择器，最高位决定用哪一路；两个例子各走一次
const m1 = gate('mux', 1120, 240, 100, 300);
const m2 = gate('mux', 1120, 640, 100, 220);
const shr2 = unitPorts(480, 300, 40);
const inc2 = unitPorts(500, 690, 40);
const og2 = gate('or', 720, 350);
const Dot: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => <circle cx={x} cy={y} r={6} fill={color} />;
const Mux: React.FC = () => {
  const {p} = useT();
  const d = p('c08', 10, 30);
  if (d <= 0) return null;
  const ex1 = p('c09', 0, 14) * (1 - p('c10', 0, 12));
  const ex2 = p('c10', 0, 14);
  const low = p('c11', 0, 14);
  // 例子走哪一路，哪一路亮，另一路暗下去；最后一页只亮或门那一路
  const upper = (1 - 0.7 * ex2) * (1 - 0.6 * low);
  const lower = (1 - 0.7 * ex1) * (1 - 0.6 * low);
  return (
    <Circuit>
      <Src x={780} y={586} w={210} label="product_r[47]" fill={C.paper} stroke={C.ink2} draw={d} />
      <Wire d={wire([{x: 990, y: 586}, {x: 1170, y: 586}])} stroke={C.ink2} draw={d} />
      <Wire d={wire([{x: 1170, y: 586}, m1.sel])} stroke={C.ink2} draw={d} />
      <Wire d={wire([{x: 1170, y: 586}, m2.selTop])} stroke={C.ink2} draw={d} />
      <Dot x={1170} y={586} color={C.ink2} />

      <Src x={120} y={390} w={160} label="product_r" fill={C.blueTint} stroke={C.blue} draw={d} />
      <Src x={120} y={750} w={110} label="exp_r" fill={C.clayTint} stroke={C.clay} draw={d} />
      <Wire d={wire([{x: 280, y: 390}, {x: 340, y: 390}])} stroke={C.blue} draw={d} />
      <Wire d={wire([{x: 230, y: 750}, {x: 340, y: 750}])} stroke={C.clay} draw={d} />

      <g opacity={upper}>
        <Wire d={wire([{x: 340, y: 390}, {x: 340, y: 300}, shr2.left])} stroke={C.blue} draw={d} />
        <Unit cx={480} cy={300} r={40} sym=">>" stroke={C.blue} draw={d} />
        <Wire d={wire([shr2.right, {x: 1000, y: 300}, {x: 1000, y: m1.in1.y}, m1.in1])} stroke={C.blue} draw={d} />
        <Wire d={wire([{x: 340, y: 750}, {x: 340, y: inc2.in1.y}, inc2.in1])} stroke={C.clay} draw={d} />
        <Txt x={420} y={inc2.in2.y + 8} anchor="end" mono size={26} color={C.clayInk} opacity={d}>
          1
        </Txt>
        <Wire d={wire([{x: 428, y: inc2.in2.y}, inc2.in2])} stroke={C.clay} draw={d} />
        <Unit cx={500} cy={690} r={40} sym="+" stroke={C.clay} draw={d} />
        <Wire d={wire([inc2.right, {x: 1000, y: 690}, {x: 1000, y: m2.in1.y}, m2.in1])} stroke={C.clay} draw={d} />
      </g>
      <g opacity={upper * (1 - 0.6 * low) + low}>
        <Src x={600} y={og2.in1.y} w={60} label="[1]" fill={C.paper} stroke={C.ink2} draw={d} />
        <Src x={600} y={og2.in2.y} w={60} label="[0]" fill={C.greenTint} stroke={C.green} draw={d} />
        <Wire d={wire([{x: 660, y: og2.in1.y}, og2.in1])} stroke={C.ink2} draw={d} />
        <Wire d={wire([{x: 660, y: og2.in2.y}, og2.in2])} stroke={C.green} draw={d} />
        <Gate kind="or" x={720} y={350} label="或" stroke={C.green} draw={d} />
        <Wire d={wire([og2.out, {x: 900, y: og2.out.y}, {x: 900, y: 300}])} stroke={C.green} draw={d} />
        <Dot x={900} y={300} color={C.green} />
        <Txt x={916} y={360} size={24} color={C.greenInk} opacity={d}>
          并进最低位
        </Txt>
      </g>
      <g opacity={lower}>
        <Wire d={wire([{x: 340, y: 390}, {x: 340, y: m1.in2.y}, m1.in2])} stroke={C.blue} draw={d} />
        <Wire d={wire([{x: 340, y: 750}, {x: 340, y: m2.in2.y}, m2.in2])} stroke={C.clay} draw={d} />
      </g>
      <Dot x={340} y={390} color={C.blue} />
      <Dot x={340} y={750} color={C.clay} />

      <Gate kind="mux" x={1120} y={240} w={100} h={300} draw={d} />
      <Gate kind="mux" x={1120} y={640} w={100} h={220} draw={d} />
      {[m1, m2].map((m, i) => (
        <g key={i} opacity={d}>
          <Txt x={1136} y={m.in1.y + 8} size={22} mono color={C.muted}>
            1
          </Txt>
          <Txt x={1136} y={m.in2.y + 8} size={22} mono color={C.muted}>
            0
          </Txt>
        </g>
      ))}
      <Wire d={wire([m1.out, {x: 1520, y: m1.out.y}])} stroke={C.blue} draw={d} />
      <Wire d={wire([m2.out, {x: 1520, y: m2.out.y}])} stroke={C.clay} draw={d} />
      <Name x={1536} y={m1.out.y} t="prod_n" color={C.blueInk} o={d} />
      <Name x={1536} y={m2.out.y} t="exp_n_s" color={C.clayInk} o={d} />
      <BusMark x={1280} y={m1.out.y} n={48} color={C.blue} o={d} />
      <BusMark x={1280} y={m2.out.y} n={10} color={C.clay} o={d} />

      <g opacity={ex1}>
        <Tag x={200} y={446} text="900000000000" color={C.blue} o={1} />
        <Tag x={175} y={806} text="127" color={C.clay} o={1} />
        <Val x={1080} y={586} v={1} o={1} />
        <Tag x={700} y={300} text="480000000000" color={C.blue} o={1} />
        <Val x={690} y={og2.in1.y} v={0} o={1} />
        <Val x={690} y={og2.in2.y} v={0} o={1} />
        <Val x={855} y={og2.out.y} v={0} o={1} />
        <Tag x={760} y={690} text="128" color={C.clay} o={1} />
        <Tag x={1400} y={m1.out.y} text="480000000000" color={C.blue} o={p('c09', 20, 12)} />
        <Tag x={1400} y={m2.out.y} text="128" color={C.clay} o={p('c09', 20, 12)} />
      </g>
      <g opacity={ex2}>
        <Tag x={200} y={446} text="600000C00000" color={C.blue} o={1} />
        <Tag x={175} y={806} text="127" color={C.clay} o={1} />
        <Val x={1080} y={586} v={0} o={1} />
        <Tag x={1400} y={m1.out.y} text="600000C00000" color={C.blue} o={p('c10', 20, 12)} />
        <Tag x={1400} y={m2.out.y} text="127" color={C.clay} o={p('c10', 20, 12)} />
      </g>
      <Txt x={960} y={892} anchor="middle" size={30} color={C.greenInk} opacity={low}>
        低位有没有 1，留在了积的末位上 → 下一集舍入
      </Txt>
    </Circuit>
  );
};

export const Code: React.FC = () => {
  const {f, s} = useT();
  if (f < s('c01')) return null;
  if (f < s('c03')) return <Head />;
  return (
    <g>
      <Switch />
      <Mux />
    </g>
  );
};
