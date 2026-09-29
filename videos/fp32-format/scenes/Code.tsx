import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RLine, RPath, RRect} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Val, andPath} from '../../../src/components/Gates';
import {Arrow, Box, Card, INK, ROLE, Role, left, right} from './Kit';
import codeJson from '../build/code.json';

// 05 用结构描述出来 c01–c19：硬件描述语言的定位 → 拆字段（快讲）→ 判类别（零判断细讲）→ 交给下一集

const unpack = codeSnippet(codeJson, 'unpack');
const classify = codeSnippet(codeJson, 'classify');
// 代码面板在左，宽 940；整体下移 30，让出顶部的公式条
const PANEL_W = 940;
const DY = 30;

// c01–c03：像在 Simulink 里搭框图
const Framing: React.FC = () => {
  const {p, span} = useT();
  const o = span('c01', 'c04', 14);
  if (o <= 0) return null;
  // c01：规则 → 电路
  const rules: Box[] = [
    {x: 240, y: 300, w: 420, h: 110},
    {x: 240, y: 460, w: 420, h: 110},
  ];
  const circuit: Box = {x: 1180, y: 380, w: 420, h: 110};
  // c02–c03：Simulink 框图与 Verilog 并排
  const blocks: Box[] = [
    {x: 180, y: 470, w: 150, h: 100},
    {x: 420, y: 470, w: 150, h: 100},
    {x: 660, y: 470, w: 150, h: 100},
  ];
  const labels = ['输入', '×', '+'];
  const first = span('c01', 'c02', 12);
  return (
    <g opacity={o}>
      <g opacity={first}>
        <Card b={rules[0]} label="拆开字段" size={36} draw={p('c01', 0, 16)} />
        <Card b={rules[1]} label="认出零和非规格数" size={34} draw={p('c01', 10, 16)} />
        <Card b={circuit} label="画成电路" size={40} color={C.clayInk} stroke={C.clay} draw={p('c01', 40, 18)} />
        <Arrow from={right(rules[0])} to={left(circuit)} draw={p('c01', 30, 14)} />
        <Arrow from={right(rules[1])} to={left(circuit)} draw={p('c01', 30, 14)} />
      </g>
      <g opacity={p('c02', 0, 14)}>
        <Card b={{x: 560, y: 190, w: 800, h: 130}} label="硬件描述语言 · Verilog" size={44} draw={p('c02', 0, 20)} />
        <RRect x={150} y={400} w={700} h={260} stroke={C.ink2} fill={C.paper} sw={2} roughness={0.7} draw={p('c02', 30, 20)} />
        <Txt x={500} y={380} anchor="middle" size={28} color={C.muted} opacity={p('c02', 30, 12)}>
          MATLAB 的 Simulink：放方块，再连线
        </Txt>
        {blocks.map((b, i) => (
          <Card key={i} b={b} label={labels[i]} size={40} mono={i > 0} draw={p('c02', 38 + i * 8, 16)} />
        ))}
        <Arrow from={right(blocks[0])} to={left(blocks[1])} draw={p('c02', 54, 12)} />
        <Arrow from={right(blocks[1])} to={left(blocks[2])} draw={p('c02', 60, 12)} />
        <Txt x={960} y={548} anchor="middle" size={52} color={C.ink2} opacity={p('c02', 64, 12)}>
          ≈
        </Txt>
        <RRect x={1070} y={400} w={700} h={260} stroke={C.ink2} fill={C.paper} sw={2} roughness={0.7} draw={p('c02', 64, 20)} />
        <Txt x={1420} y={380} anchor="middle" size={28} color={C.muted} opacity={p('c02', 64, 12)}>
          Verilog
        </Txt>
      </g>
      <g opacity={p('c03', 0, 14)}>
        <Txt x={1420} y={480} anchor="middle" size={34}>
          写下有哪些部件
        </Txt>
        <Txt x={1420} y={540} anchor="middle" size={34} opacity={p('c03', 10, 12)}>
          再用线连起来
        </Txt>
        <Txt x={1420} y={600} anchor="middle" size={30} color={C.muted} opacity={p('c03', 20, 12)}>
          这些部件同时存在
        </Txt>
        <Txt x={960} y={790} anchor="middle" size={40} opacity={p('c03', 36, 14)}>
          读代码 = 看它画出的结构
        </Txt>
      </g>
    </g>
  );
};

// 名字表：信号名 → 中文，按角色色
const Names: React.FC<{rows: {code: string; zh: string; role?: Role; a: number}[]; y: number; o: number}> = ({rows, y, o}) =>
  o > 0 ? (
    <g opacity={o}>
      {rows.map((r, i) => (
        <g key={r.code} opacity={r.a}>
          <Txt x={130} y={y + i * 58} mono size={30} color={r.role ? INK[r.role] : C.ink}>
            {r.code}
          </Txt>
          <Txt x={420} y={y + i * 58} size={30} color={C.muted}>
            →
          </Txt>
          <Txt x={470} y={y + i * 58} size={30} color={r.role ? INK[r.role] : C.ink}>
            {r.zh}
          </Txt>
        </g>
      ))}
    </g>
  ) : null;

// 总线：粗线加斜杠与位数
const Bus: React.FC<{x1: number; y1: number; x2: number; y2: number; n: number; color: string; draw: number; at?: number}> = ({x1, y1, x2, y2, n, color, draw, at = 0.5}) => {
  // 斜杠与位数画在线上 at 比例处；线上还要写数值时放在前段，数值写在后段
  const mx = x1 + (x2 - x1) * at;
  const my = y1 + (y2 - y1) * at;
  return (
    <g>
      <RLine x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} sw={n > 1 ? 5 : 2.6} roughness={0.5} draw={draw} />
      {n > 1 && (
        <g opacity={draw}>
          <RLine x1={mx - 8} y1={my + 12} x2={mx + 8} y2={my - 12} stroke={color} sw={2} roughness={0.5} />
          <Txt x={mx + 14} y={my - 14} mono size={20} color={color}>
            {String(n)}
          </Txt>
        </g>
      )}
    </g>
  );
};

// c04–c09：拆字段。右侧 32 根线分成三束，小数位前接一根恒为 1 的线
const inBox: Box = {x: 1080, y: 300, w: 100, h: 80};
const TRUNK = 1250;
const BR = {S: 230, E: 360, F: 490};
const BR_END = 1520;
const cat: Box = {x: 1480, y: 600, w: 120, h: 120};
const one: Box = {x: 1290, y: 700, w: 80, h: 56};
const Unpack: React.FC = () => {
  const {p, span} = useT();
  const o = span('c04', 'c10', 14);
  if (o <= 0) return null;
  const second = p('c09', 0, 16);
  const vals = second > 0.5
    ? {S: '0', E: '127', F: '000…001', M: '1.000…001', in: '3F800001'}
    : {S: '0', E: '127', F: '100…000', M: '1.100…000', in: '3FC00000'};
  const show = p('c08', 0, 12);
  const flash = second > 0 ? Math.abs(Math.sin(second * Math.PI)) : 0;
  const branches: Role[] = ['S', 'E', 'F'];
  const names: Record<Role, string> = {S: 'a_sign', E: 'a_exp', F: 'a_frac'};
  const widths: Record<Role, number> = {S: 1, E: 8, F: 23};
  return (
    <g opacity={o}>
      <g transform={`translate(0, ${DY})`}>
        <CodePanel
          code={unpack}
          w={PANEL_W}
          vis={p('c04', 0, 14)}
          frameDraw={p('c04', 0, 22)}
          lineIn={(i) => p('c04', 4 + i * 2, 10)}
          bands={[
            {no: 39, o: span('c05', 'c07', 10)},
            {no: 40, o: span('c05', 'c07', 10)},
            {no: 41, o: span('c05', 'c07', 10)},
            {no: 42, o: span('c05', 'c07', 10) * 0.6},
            {no: 43, o: span('c05', 'c07', 10) * 0.6},
            {no: 44, o: span('c05', 'c07', 10) * 0.6},
            {no: 46, o: span('c07', 'c10', 10)},
            {no: 47, o: span('c07', 'c10', 10) * 0.6},
          ]}
          underlines={[
            {no: 39, tok: 'wire', color: C.kw, draw: p('c04', 20, 12), opacity: span('c04', 'c05')},
            {no: 39, tok: '=', color: C.kw, draw: p('c04', 44, 12), opacity: span('c04', 'c05')},
            {no: 39, tok: '[31]', color: C.green, draw: p('c05', 20, 12), opacity: span('c05', 'c07')},
            {no: 40, tok: '[30:23]', color: C.clay, draw: p('c05', 40, 12), opacity: span('c05', 'c07')},
            {no: 41, tok: '[22:0]', nth: 1, color: C.blue, draw: p('c05', 60, 12), opacity: span('c05', 'c07')},
            {no: 40, tok: '[7:0]', color: C.ink2, draw: p('c06', 30, 12), opacity: span('c06', 'c07')},
            {no: 46, tok: "{1'b1, a_frac}", color: C.blue, draw: p('c07', 10, 16), opacity: span('c07', 'c08')},
          ]}
        />
      </g>
      <Names
        y={DY + 640}
        o={p('c05', 0, 12)}
        rows={[
          {code: 'a_sign', zh: '符号位 S', role: 'S', a: p('c05', 20, 10)},
          {code: 'a_exp', zh: '阶码 E', role: 'E', a: p('c05', 40, 10)},
          {code: 'a_frac', zh: '小数位 F', role: 'F', a: p('c05', 60, 10)},
          {code: 'a_mant', zh: '尾数 1.F', role: 'F', a: p('c07', 30, 10)},
        ]}
      />
      {/* 输入 a 与总线 */}
      <Card b={inBox} label="a" size={40} mono draw={p('c04', 20, 16)} />
      <Txt x={inBox.x + inBox.w / 2} y={inBox.y - 20} anchor="middle" mono size={24} color={C.clayInk} opacity={show}>
        {vals.in}
      </Txt>
      <Bus x1={inBox.x + inBox.w} y1={inBox.y + inBox.h / 2} x2={TRUNK} y2={inBox.y + inBox.h / 2} n={32} color={C.ink2} draw={p('c04', 30, 14)} at={0.35} />
      <RLine x1={TRUNK} y1={BR.S} x2={TRUNK} y2={BR.F} stroke={C.ink2} sw={5} roughness={0.5} draw={p('c05', 6, 16)} />
      {branches.map((r, i) => (
        <g key={r}>
          <Bus x1={TRUNK} y1={BR[r]} x2={BR_END} y2={BR[r]} n={widths[r]} color={ROLE[r]} draw={p('c05', 20 + i * 20, 16)} at={0.18} />
          <Txt x={BR_END + 16} y={BR[r] + 9} mono size={26} color={INK[r]} opacity={p('c05', 26 + i * 20, 10)}>
            {names[r]}
          </Txt>
          <Txt x={BR_END - 12} y={BR[r] - 16} anchor="end" mono size={24} color={INK[r]} opacity={show * (1 - (r === 'F' ? flash : 0))}>
            {vals[r]}
          </Txt>
        </g>
      ))}
      <Txt x={1080} y={560} size={26} color={C.muted} opacity={p('c05', 70, 12)}>
        b 也一样分成三束
      </Txt>
      {/* 拼接：小数位往下接进拼接块，前面补一根恒为 1 的线 */}
      <g opacity={p('c07', 0, 12)}>
        <RPath d={`M1420 ${BR.F} L1420 630 L${cat.x} 630`} stroke={C.blue} sw={5} roughness={0.5} draw={p('c07', 6, 16)} />
        <Card b={one} label="1" size={32} mono color={C.blueInk} stroke={C.blue} draw={p('c07', 10, 14)} />
        <RLine x1={one.x + one.w} y1={one.y + one.h / 2} x2={cat.x} y2={one.y + one.h / 2} stroke={C.blue} sw={2.6} roughness={0.5} draw={p('c07', 16, 12)} />
        <Card b={cat} label="拼" size={36} color={C.blueInk} stroke={C.blue} draw={p('c07', 20, 16)} />
        <Bus x1={cat.x + cat.w} y1={cat.y + cat.h / 2} x2={1810} y2={cat.y + cat.h / 2} n={24} color={C.blue} draw={p('c07', 30, 14)} at={0.2} />
        <Txt x={1810} y={cat.y + cat.h / 2 - 18} anchor="end" mono size={26} color={C.blueInk} opacity={p('c07', 36, 10)}>
          a_mant
        </Txt>
        <Txt x={1810} y={cat.y + cat.h / 2 + 40} anchor="end" mono size={22} color={C.blueInk} opacity={show * (1 - flash)}>
          {vals.M}
        </Txt>
      </g>
      <Txt x={1450} y={880} anchor="middle" size={30} color={C.ink2} opacity={p('c09', 20, 12)}>
        输入一变，每一束线立刻跟着变
      </Txt>
    </g>
  );
};

// 比较器：圆角框里写比较符号，左进右出
const Cmp: React.FC<{b: Box; op: string; draw: number; opacity?: number}> = ({b, op, draw, opacity = 1}) =>
  draw > 0 ? (
    <g opacity={opacity}>
      <RRect x={b.x} y={b.y} w={b.w} h={b.h} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={draw} />
      <Txt x={b.x + b.w / 2} y={b.y + b.h / 2 + 11} anchor="middle" mono size={30} opacity={Math.max(0, draw * 2 - 1)}>
        {op}
      </Txt>
    </g>
  ) : null;

// c10–c19：判类别。NaN 与无穷一组在上，零判断在下
const cmpE: Box = {x: 1290, y: 250, w: 170, h: 80};
const cmpF: Box = {x: 1290, y: 400, w: 170, h: 80};
const GATE = {x: 1560, y: 315};
const cmpZ: Box = {x: 1290, y: 650, w: 170, h: 80};
const Classify: React.FC = () => {
  const {p, span} = useT();
  const o = span('c10', 'c19', 14);
  if (o <= 0) return null;
  const inf = p('c14', 0, 14);
  const upper = span('c13', 'c18', 12) * (1 - 0.7 * p('c15', 0, 12));
  const zero = span('c15', 'c18', 12);
  const v = p('c17', 10, 12);
  const gy1 = GATE.y + 25;
  const gy2 = GATE.y + 75;
  return (
    <g opacity={o}>
      <g transform={`translate(0, ${DY})`}>
        <CodePanel
          code={classify}
          w={PANEL_W}
          vis={p('c10', 0, 14)}
          frameDraw={p('c10', 0, 22)}
          lineIn={(i) => p('c10', 4 + i * 2, 10)}
          bands={[
            {no: 51, o: span('c13', 'c14', 10)},
            {no: 52, o: span('c13', 'c14', 10) * 0.6},
            {no: 53, o: span('c14', 'c15', 10)},
            {no: 54, o: span('c14', 'c15', 10) * 0.6},
            {no: 55, o: span('c15', 'c18', 10)},
            {no: 56, o: span('c15', 'c18', 10) * 0.6},
          ]}
          underlines={[
            {no: 51, tok: '==', color: C.ink, draw: p('c11', 6, 10), opacity: span('c11', 'c13')},
            {no: 51, tok: '!=', color: C.ink, draw: p('c11', 40, 10), opacity: span('c11', 'c13')},
            {no: 51, tok: '&&', color: C.ink, draw: p('c12', 4, 10), opacity: span('c12', 'c13')},
            {no: 53, tok: '== 0', color: C.blue, draw: p('c14', 10, 12), opacity: span('c14', 'c15')},
            {no: 55, tok: "(a_exp == 8'd0)", color: C.clay, draw: p('c15', 10, 16), opacity: span('c15', 'c18')},
          ]}
        />
      </g>
      <Names
        y={DY + 560}
        o={span('c10', 'c13', 12)}
        rows={[
          {code: 'a_is_nan', zh: '是不是 NaN', a: p('c10', 20, 10)},
          {code: 'a_is_inf', zh: '是不是无穷', a: p('c10', 28, 10)},
          {code: 'a_is_zero', zh: '是不是零', a: p('c10', 36, 10)},
        ]}
      />
      <Txt x={130} y={DY + 780} size={30} color={C.ink2} opacity={span('c10', 'c13', 12) * p('c10', 44, 12)}>
        每一行输出一根线，是 1 就属于这一类
      </Txt>
      {/* c11–c12：部件本身 */}
      <g opacity={span('c11', 'c13', 12)}>
        <Cmp b={{x: 1200, y: 260, w: 170, h: 80}} op="==" draw={p('c11', 6, 16)} />
        <Txt x={1470} y={310} size={30} opacity={p('c11', 14, 12)}>
          相等输出 1
        </Txt>
        <Cmp b={{x: 1200, y: 400, w: 170, h: 80}} op="!=" draw={p('c11', 36, 16)} />
        <Txt x={1470} y={450} size={30} opacity={p('c11', 44, 12)}>
          不相等输出 1
        </Txt>
        <RPath d={andPath(1245, 560)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c12', 6, 18)} />
        <Txt x={1470} y={620} size={30} opacity={p('c12', 16, 12)}>
          与门：两边都是 1 才输出 1
        </Txt>
      </g>
      {/* c13–c14：NaN 与无穷 */}
      <g opacity={upper}>
        <Txt x={1090} y={cmpE.y + cmpE.h / 2 + 9} mono size={26} color={C.clayInk}>
          a_exp
        </Txt>
        <Bus x1={1180} y1={cmpE.y + cmpE.h / 2} x2={cmpE.x} y2={cmpE.y + cmpE.h / 2} n={8} color={C.clay} draw={p('c13', 4, 12)} />
        <Cmp b={cmpE} op="== FF" draw={p('c13', 10, 16)} />
        <Txt x={1090} y={cmpF.y + cmpF.h / 2 + 9} mono size={26} color={C.blueInk}>
          a_frac
        </Txt>
        <Bus x1={1190} y1={cmpF.y + cmpF.h / 2} x2={cmpF.x} y2={cmpF.y + cmpF.h / 2} n={23} color={C.blue} draw={p('c13', 20, 12)} />
        <Cmp b={cmpF} op="!= 0" draw={p('c13', 26, 16) * (1 - inf)} />
        <Cmp b={cmpF} op="== 0" draw={inf} />
        <RPath
          d={`M${cmpE.x + cmpE.w} ${cmpE.y + cmpE.h / 2} L1520 ${cmpE.y + cmpE.h / 2} L1520 ${gy1} L${GATE.x} ${gy1}`}
          stroke={C.ink2}
          sw={2.6}
          roughness={0.5}
          draw={p('c13', 34, 14)}
        />
        <RPath
          d={`M${cmpF.x + cmpF.w} ${cmpF.y + cmpF.h / 2} L1520 ${cmpF.y + cmpF.h / 2} L1520 ${gy2} L${GATE.x} ${gy2}`}
          stroke={C.ink2}
          sw={2.6}
          roughness={0.5}
          draw={p('c13', 34, 14)}
        />
        <RPath d={andPath(GATE.x, GATE.y)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c13', 42, 16)} />
        <Arrow from={{x: GATE.x + 80, y: GATE.y + 50}} to={{x: 1790, y: GATE.y + 50}} gap={0} draw={p('c13', 52, 12)} />
        <Txt x={1735} y={GATE.y + 30} anchor="middle" mono size={24} opacity={p('c13', 56, 10) * (1 - inf)}>
          a_is_nan
        </Txt>
        <Txt x={1735} y={GATE.y + 30} anchor="middle" mono size={24} opacity={inf}>
          a_is_inf
        </Txt>
      </g>
      {/* c15–c17：零判断只接阶码，小数位不接 */}
      <g opacity={zero}>
        <Txt x={1090} y={cmpZ.y + cmpZ.h / 2 + 9} mono size={26} color={C.clayInk}>
          a_exp
        </Txt>
        <Bus x1={1180} y1={cmpZ.y + cmpZ.h / 2} x2={cmpZ.x} y2={cmpZ.y + cmpZ.h / 2} n={8} color={C.clay} draw={p('c15', 8, 12)} />
        <Cmp b={cmpZ} op="== 0" draw={p('c15', 14, 16)} />
        <Arrow from={{x: cmpZ.x + cmpZ.w, y: cmpZ.y + cmpZ.h / 2}} to={{x: 1700, y: cmpZ.y + cmpZ.h / 2}} gap={0} draw={p('c15', 24, 12)} />
        <Txt x={1710} y={cmpZ.y + cmpZ.h / 2 + 9} mono size={24} opacity={p('c15', 30, 10)}>
          a_is_zero
        </Txt>
        <Txt x={1090} y={830} mono size={26} color={C.blueInk} opacity={p('c15', 36, 10) * 0.6}>
          a_frac
        </Txt>
        <RLine x1={1190} y1={821} x2={1260} y2={821} stroke={C.blue} sw={5} roughness={0.5} dash draw={p('c15', 40, 12)} />
        <Txt x={1290} y={830} size={28} color={C.muted} opacity={p('c15', 46, 10)}>
          不看小数位
        </Txt>
        <Txt x={1090} y={590} size={30} color={C.clayInk} opacity={p('c16', 10, 12)}>
          非规格数：E 全 0 → 也判成零（输入端冲零）
        </Txt>
        <Txt x={1100} y={cmpZ.y - 10} mono size={24} color={C.clayInk} opacity={v}>
          00000000
        </Txt>
        <Val x={1560} y={cmpZ.y + cmpZ.h / 2} v={1} o={p('c17', 20, 10)} />
        <Txt x={1540} y={890} size={30} color={C.clayInk} opacity={p('c17', 34, 12)}>
          结果：00000000
        </Txt>
        <Txt x={1090} y={890} mono size={26} color={C.muted} opacity={v}>
          a = 00000001
        </Txt>
      </g>
      {/* c18：开头的两个输入，六根标志全是 0 */}
      <g opacity={span('c18', 'c19', 12)}>
        <Txt x={1100} y={250} mono size={28} color={C.ink2}>
          a = 3F800001 · b = 3FC00000
        </Txt>
        {['a_is_nan', 'a_is_inf', 'a_is_zero', 'b_is_nan', 'b_is_inf', 'b_is_zero'].map((n, i) => (
          <g key={n} opacity={p('c18', 6 + i * 4, 10)}>
            <Txt x={1160} y={340 + i * 80} mono size={30}>
              {n}
            </Txt>
            <Val x={1500} y={330 + i * 80} v={0} o={1} />
          </g>
        ))}
        <Txt x={1100} y={860} size={30} color={C.ink2} opacity={p('c18', 40, 12)}>
          走正常的计算路径
        </Txt>
      </g>
    </g>
  );
};

// c19：交给下一集，三路分开算
const Next: React.FC = () => {
  const {p} = useT();
  const o = p('c19', 0, 14);
  if (o <= 0) return null;
  const boxes: [Role, string][] = [
    ['S', '符号'],
    ['E', '阶码'],
    ['F', '尾数'],
  ];
  return (
    <g opacity={o}>
      <Txt x={960} y={300} anchor="middle" size={40}>
        下一集：两个数相乘
      </Txt>
      {boxes.map(([r, t], i) => (
        <Card key={r} b={{x: 330 + i * 460, y: 420, w: 340, h: 150}} label={t} size={44} color={INK[r]} stroke={ROLE[r]} draw={p('c19', 10 + i * 8, 16)} />
      ))}
      <Txt x={960} y={700} anchor="middle" size={36} color={C.ink2} opacity={p('c19', 40, 12)}>
        三路分开算
      </Txt>
    </g>
  );
};

export const CodePart: React.FC = () => {
  const {p} = useT();
  if (p('c01', 0, 1) <= 0) return null;
  return (
    <g>
      <Framing />
      <Unpack />
      <Classify />
      <Next />
    </g>
  );
};
