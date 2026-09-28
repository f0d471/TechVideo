import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RArrow, RLine, RPath, RRect } from '../../../src/core/rough';
import { Txt } from '../../../src/components/Prims';
import { CodePanel, codeSnippet } from '../../../src/components/CodePanel';
import { TransTable } from '../../../src/components/TransTable';
import { andPath } from '../../../src/components/Gates';
import { Card, Caption, MathText, ThreePaths } from './Elements';
import codeJson from '../build/code.json';

const code = codeSnippet(codeJson, 'classify');

// c23–c33：按当前讲到的分类行高亮代码，镜像行同一 beat 出现。
const Panel: React.FC = () => {
  const { p, span } = useT();
  return <CodePanel
    code={code}
    vis={p('c23', 8, 14)}
    frameDraw={p('c23', 8, 26)}
    lineIn={i => p('c23', 10 + i * 6, 12)}
    bands={[
      { no: 51, o: span('c23', 'c27') },
      { no: 52, o: span('c27', 'c28') },
      { no: 53, o: span('c28', 'c29') },
      { no: 54, o: span('c29', 'c30') },
      { no: 55, o: span('c30', 'c33') },
      { no: 56, o: span('c32', 'c33') },
    ]}
    underlines={[
      { no: 51, tok: 'a_is_nan', color: C.ink2, draw: p('c23', 8, 14), opacity: span('c23', 'c24') },
      { no: 51, tok: '==', color: C.clay, draw: p('c24', 8, 14), opacity: span('c24', 'c25') },
      { no: 51, tok: "8'hFF", color: C.clay, draw: p('c25', 8, 14), opacity: span('c25', 'c26') },
      { no: 51, tok: '!=', color: C.blue, draw: p('c26', 8, 14), opacity: span('c26', 'c27') },
      { no: 51, tok: '&&', color: C.ink2, draw: p('c27', 8, 14), opacity: span('c27', 'c28') },
      { no: 52, tok: 'b_is_nan', color: C.ink2, draw: p('c27', 8, 14), opacity: span('c27', 'c28') },
      { no: 53, tok: 'a_is_inf', color: C.ink2, draw: p('c28', 8, 14), opacity: span('c28', 'c29') },
      { no: 53, tok: 'a_frac == 0', color: C.blue, draw: p('c29', 8, 14), opacity: span('c29', 'c30') },
      { no: 54, tok: 'b_is_inf', color: C.ink2, draw: p('c29', 8, 14), opacity: span('c29', 'c30') },
      { no: 55, tok: 'a_is_zero', color: C.ink2, draw: p('c30', 8, 14), opacity: span('c30', 'c31') },
      { no: 55, tok: "8'd0", color: C.clay, draw: p('c31', 8, 14), opacity: span('c31', 'c32') },
      { no: 56, tok: 'b_is_zero', color: C.ink2, draw: p('c32', 8, 14), opacity: span('c32', 'c33') },
      { no: 55, tok: 'denormal', color: C.ink2, draw: p('c33', 8, 14), opacity: span('c33', 'c34') },
    ]}
  />;
};

// c23–c33：术语只按课程词汇表翻译，等号是连线。
const Translation: React.FC = () => {
  const { p, span } = useT();
  return <TransTable
    vis={p('c23', 8, 14) * (1 - p('c34', 0, 12))}
    title="逐词翻译　代码 → 英文 → 中文"
    sets={[
      { o: span('c23', 'c24'), rows: [{ code: 'is_nan', en: 'is not a number', zh: '是否为非数', a: p('c23', 8, 14) }] },
      {
        o: span('c24', 'c26'), rows: [
          { code: '==', en: 'equal', zh: '相等比较', a: p('c24', 8, 14) },
          { code: "8'hFF", en: 'hexadecimal FF', zh: '8 位全 1', color: C.clayInk, a: p('c25', 8, 14) },
        ]
      },
      {
        o: span('c26', 'c28'), rows: [
          { code: '!=', en: 'not equal', zh: '不等比较', a: p('c26', 8, 14) },
          { code: '&&', en: 'logical AND', zh: '两边都成立', a: p('c27', 8, 14) },
        ]
      },
      { o: span('c28', 'c30'), rows: [{ code: 'inf', en: 'infinity', zh: '无穷', a: p('c28', 8, 14) }] },
      {
        o: span('c30', 'c33'), rows: [
          { code: 'zero', en: 'zero', zh: '零路径', a: p('c30', 8, 14) },
          { code: "8'd0", en: 'decimal zero', zh: '8 位十进制零', color: C.clayInk, a: p('c31', 8, 14) },
        ]
      },
      { o: span('c33', 'c34'), rows: [{ code: 'denormal', en: 'denormal', zh: '非规格数', a: p('c33', 8, 14) }] },
    ]}
  />;
};

type Kind = 'nan' | 'inf' | 'zero';
const LogicRow: React.FC<{
  y: number; input: 'a' | 'b'; kind: Kind; show: number; exp: number; frac: number; gate: number; value: 0 | 1; valueShow: number;
}> = ({ y, input, kind, show, exp, frac, gate, value, valueShow }) => {
  const zero = kind === 'zero';
  const x = 980;
  return <g opacity={show}>
    <Txt x={x} y={y - 46} mono size={25}>{input}</Txt>
    <Txt x={x + 55} y={y - 35} mono size={24} color={C.clayInk}>E</Txt>
    <RRect x={x + 95} y={y - 63} w={175} h={54} stroke={C.clay} fill={C.paper} draw={exp} />
    <Txt x={x + 182} y={y - 27} anchor="middle" mono size={25} color={C.clayInk} opacity={exp}>
      {zero ? '== 0' : '== FF'}
    </Txt>
    {!zero && <g opacity={frac}>
      <Txt x={x + 55} y={y + 61} mono size={24} color={C.blueInk}>f</Txt>
      <RRect x={x + 95} y={y + 17} w={175} h={54} stroke={C.blue} fill={C.paper} draw={frac} />
      <Txt x={x + 182} y={y + 54} anchor="middle" mono size={25} color={C.blueInk}>
        {kind === 'nan' ? '!= 0' : '== 0'}
      </Txt>
    </g>}
    {!zero ? <g opacity={gate}>
      <RPath
        d={'M' + (x + 275) + ' ' + (y - 36) + ' L' + (x + 350) + ' ' + (y - 36) + ' L' + (x + 350) + ' ' + (y - 22)}
        stroke={C.clay}
        draw={gate}
      />
      <RPath
        d={'M' + (x + 275) + ' ' + (y + 44) + ' L' + (x + 350) + ' ' + (y + 44) + ' L' + (x + 350) + ' ' + (y + 22)}
        stroke={C.blue}
        draw={gate}
      />
      <RPath d={andPath(x + 350, y - 50)} stroke={C.ink2} fill={C.paper} roughness={0.6} draw={gate} />
      <Txt x={x + 383} y={y + 12} anchor="middle" size={34}>与</Txt>
      <RLine x1={x + 430} y1={y} x2={x + 478} y2={y} stroke={C.ink2} draw={gate} />
    </g> : <RPath
      d={'M' + (x + 275) + ' ' + (y - 36) + ' L' + (x + 385) + ' ' + (y - 36) + ' L' + (x + 385) + ' ' + y + ' L' + (x + 478) + ' ' + y}
      stroke={C.clay}
      draw={gate}
    />}
    <Txt x={x + 492} y={y + 8} mono size={23} opacity={gate}>{input + '_is_' + kind}</Txt>
    <g opacity={gate * valueShow}>
      <RRect x={x + 750} y={y - 38} w={64} h={76} stroke={C.ink2} fill={C.paper} />
      <Txt x={x + 782} y={y + 11} anchor="middle" mono size={30}>{value}</Txt>
    </g>
  </g>;
};

// c23–c35：右下只画当前一组 a/b 判定；门保持原尺寸。
const Circuit: React.FC = () => {
  const { p } = useT();
  const kind: Kind = p('c30') > 0 ? 'zero' : p('c28') > 0 ? 'inf' : 'nan';
  const first = kind === 'nan' ? 'c23' : kind === 'inf' ? 'c28' : 'c30';
  const second = kind === 'nan' ? 'c27' : kind === 'inf' ? 'c29' : 'c32';
  const exp = kind === 'nan' ? p('c24', 8, 18) : kind === 'inf' ? p('c29', 8, 18) : p('c31', 8, 18);
  const frac = kind === 'nan' ? p('c26', 8, 18) : kind === 'inf' ? p('c29', 8, 18) : 0;
  const gate = kind === 'nan' ? p('c27', 8, 18) : kind === 'inf' ? p('c29', 8, 18) : p('c31', 8, 18);
  const summary = p('c36', 8, 14);
  const normal = p('c38') > 0;
  return <g>
    <g opacity={1 - summary}>
      <LogicRow
        y={645}
        input="a"
        kind={kind}
        show={p(first, 8, 14)}
        exp={exp}
        frac={frac}
        gate={gate}
        value={kind === 'zero' && !normal ? 1 : 0}
        valueShow={p('c34', 8, 14)}
      />
      <LogicRow
        y={805}
        input="b"
        kind={kind}
        show={p(second, 8, 14)}
        exp={p(second, 8, 18)}
        frac={kind === 'zero' ? 0 : p(second, 8, 18)}
        gate={p(second, 14, 18)}
        value={0}
        valueShow={p('c34', 8, 14)}
      />
    </g>
    <g opacity={summary}>
      {(['nan', 'inf', 'zero'] as Kind[]).flatMap((k, row) => (['a', 'b'] as const).map((input, col) => {
        const x = 980 + col * 425;
        const y = 577 + row * 105;
        const value = k === 'zero' && input === 'a' && !normal ? 1 : 0;
        return <g key={input + k}>
          <RRect x={x} y={y} w={385} h={78} stroke={C.ink2} fill={C.paper} draw={summary} />
          <Txt x={x + 25} y={y + 49} mono size={25}>{input + '_is_' + k}</Txt>
          <Txt x={x + 337} y={y + 51} anchor="middle" mono size={31}>{value}</Txt>
        </g>;
      }))}
    </g>
  </g>;
};

// c25–c38：代码记号与真实输入输出的对照。
const Notes: React.FC = () => {
  const { p, span } = useT();
  const normal = p('c38') > 0;
  return <>
    <g opacity={span('c25', 'c26')}>
      <Txt x={112} y={753} mono size={29}>8 · h · FF</Txt>
      <Txt x={112} y={810} size={25}>位宽 · 十六进制 · 数值</Txt>
      <MathText text="FF_16 = 11111111_2 = 255" x={112} y={869} size={28} />
    </g>
    <g opacity={span('c27', 'c28')}>
      <Txt x={112} y={811} size={28}>两个条件都输出 1</Txt>
      <RArrow x1={490} y1={802} x2={600} y2={802} stroke={C.ink2} />
      <Txt x={655} y={811} mono size={32}>1</Txt>
    </g>
    <g opacity={span('c29', 'c30')}>
      <Txt x={112} y={747} mono size={30}>E = 255</Txt>
      <Txt x={112} y={807} mono size={30}>f = 0</Txt>
      <Txt x={400} y={807} size={30}>无穷</Txt>
    </g>
    <g opacity={span('c32', 'c34')}>
      <Txt x={112} y={760} mono size={32}>E = 0</Txt>
      <Txt x={112} y={826} size={28}>小数位为 0 → 零</Txt>
      <Txt x={112} y={882} size={28}>小数位非 0 → 也走零路径</Txt>
    </g>
    <g opacity={p('c34', 8, 14)}>
      <Txt x={112} y={545} size={28}>{normal ? '规格化数输入' : '输入位串仍在导线上'}</Txt>
      <Txt x={112} y={610} mono size={29}>{normal ? 'a = 3F800001' : 'a = 00000001'}</Txt>
      <Txt x={112} y={665} mono size={29}>{normal ? 'b = 3FC00000' : 'b = 3F800000'}</Txt>
      <g opacity={p('c35', 8, 14)}>
        <Card x={112} y={722} w={740} h={85} label={normal ? '六根特殊标志全 0' : '零标志 1 → 选择零结果'} />
        <Txt x={112} y={875} mono size={29} opacity={p('c37', 8, 14) * (1 - p('c38', 0, 12))}>
          00000001 × 3F800000 → 00000000
        </Txt>
      </g>
    </g>
  </>;
};

export const Classify: React.FC = () => {
  const { span } = useT();
  const o = span('c23', 'c39', 14);
  if (o <= 0) return null;
  return <g opacity={o}><Panel />
    <Translation />
    <Circuit />
    <Notes />
  </g>;
};

// c39：验证结束后独立交接下一集的三路计算。
export const Ending: React.FC = () => {
  const { p, span } = useT();
  const o = span('c39', undefined, 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <Txt x={98} y={163} size={30}>开头的两个输入</Txt>
    <Card x={300} y={270} w={590} h={120} label="3F800001" mono draw={p('c39', 8, 22)} />
    <Card x={1030} y={270} w={590} h={120} label="3FC00000" detail="1.5" mono draw={p('c39', 8, 22)} />
    <MathText text="1 + 2^(-23)" x={595} y={430} anchor="middle" size={31} />
    <ThreePaths draw={p('c39', 12, 22)} y={565} />
    {[
      { x: 260, label: '定正负', color: C.greenInk },
      { x: 800, label: '阶码相加', color: C.clayInk },
      { x: 1340, label: '尾数相乘', color: C.blueInk },
    ].map((item, i) => <Card
      key={item.label}
      x={item.x}
      y={730}
      w={300}
      h={110}
      label={item.label}
      color={item.color}
      draw={p('c39', 18 + i * 5, 22)}
    />)}
    <Caption text="下一集 · 三路分别计算" y={890} opacity={p('c39', 28, 14)} />
  </g>;
};
