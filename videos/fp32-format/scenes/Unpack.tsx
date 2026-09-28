import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RRect, RLine, RArrow, RPath } from '../../../src/core/rough';
import { Txt } from '../../../src/components/Prims';
import { CodePanel, codeSnippet } from '../../../src/components/CodePanel';
import { TransTable } from '../../../src/components/TransTable';
import { Bus, Card, INK, ROLE, TINT } from './Elements';
import codeJson from '../build/code.json';
const code = codeSnippet(codeJson, 'unpack');

// c01–c18：逐行高亮两输入的拆字段及尾数接线。
const Panel: React.FC = () => {
  const { p, span } = useT(); return <CodePanel
    code={code}
    vis={p('c01', 8, 14)}
    frameDraw={p('c01', 8, 26)}
    lineIn={i => p('c01', 10 + i * 6, 12)}
    bands={[
      { no: 39, o: span('c03', 'c08') },
      { no: 40, o: span('c08', 'c11') },
      { no: 41, o: span('c11', 'c13') },
      { no: 42, o: span('c13', 'c14') },
      { no: 43, o: span('c13', 'c14') },
      { no: 44, o: span('c13', 'c14') },
      { no: 46, o: span('c14', 'c19') },
      { no: 47, o: span('c16', 'c17') },
    ]}
    underlines={[
      { no: 39, tok: 'wire', color: C.ink2, draw: p('c03', 8, 14), opacity: span('c03', 'c04') },
      { no: 39, tok: '=', color: C.ink2, draw: p('c04', 8, 14), opacity: span('c04', 'c05') },
      { no: 39, tok: 'a[31]', color: C.green, draw: p('c05', 8, 14), opacity: span('c05', 'c06') },
      { no: 39, tok: 'a_sign', color: C.green, draw: p('c06', 8, 14), opacity: span('c06', 'c07') },
      { no: 39, tok: '// a 符号位', color: C.ink2, draw: p('c07', 8, 14), opacity: span('c07', 'c08') },
      { no: 40, tok: 'a[30:23]', color: C.clay, draw: p('c08', 8, 14), opacity: span('c08', 'c09') },
      { no: 40, tok: '[7:0]', color: C.clay, draw: p('c09', 8, 14), opacity: span('c09', 'c10') },
      { no: 40, tok: 'a_exp', color: C.clay, draw: p('c10', 8, 14), opacity: span('c10', 'c11') },
      { no: 41, tok: 'a_frac', color: C.blue, draw: p('c11', 8, 14), opacity: span('c11', 'c12') },
      { no: 42, tok: 'b_sign', color: C.green, draw: p('c13', 8, 14), opacity: span('c13', 'c14') },
      { no: 43, tok: 'b_exp', color: C.clay, draw: p('c13', 8, 14), opacity: span('c13', 'c14') },
      { no: 44, tok: 'b_frac', color: C.blue, draw: p('c13', 8, 14), opacity: span('c13', 'c14') },
      { no: 46, tok: "{1'b1, a_frac}", color: C.blue, draw: p('c14', 8, 14), opacity: span('c14', 'c15') },
      { no: 46, tok: "1'b1", color: C.blue, draw: p('c15', 8, 14), opacity: span('c15', 'c16') },
      { no: 46, tok: 'a_frac', color: C.blue, draw: p('c16', 8, 14), opacity: span('c16', 'c17') },
      { no: 46, tok: 'a_mant', color: C.blue, draw: p('c17', 8, 14), opacity: span('c17', 'c18') },
      { no: 46, tok: '[23:0]', color: C.blue, draw: p('c18', 8, 14), opacity: span('c18', 'c19') },
      { no: 47, tok: 'b_mant', color: C.blue, draw: p('c16', 8, 14), opacity: span('c16', 'c17') },
    ]}
  />
};
// c02–c18：按词汇表逐词翻译 RTL。
const Translation: React.FC = () => {
  const { p, span } = useT(); return <g transform="translate(0 76)"><TransTable
    vis={p('c02', 8, 14) * (1 - p('c19', 0, 12)) * (1 - span('c13', 'c14'))}
    title="逐词翻译　代码 → 英文 → 中文"
    sets={[
      {
        o: span('c02', 'c03'), rows: [
          { code: 'a / b', en: 'operands', zh: '两个输入', a: p('c02', 8, 14) }]
      },
      {
        o: span('c03', 'c06'), rows: [
          { code: 'wire', en: 'wire', zh: '导线', a: p('c03', 8, 14) },
          { code: '=', en: 'connection', zh: '连线', a: p('c04', 8, 14) },
          { code: '[31]', en: 'bit 31', zh: '取第 31 位', color: C.greenInk, a: p('c05', 8, 14) }]
      },
      {
        o: span('c06', 'c07'), rows: [
          { code: 'sign', en: 'sign', zh: '符号', color: C.greenInk, a: p('c06', 8, 14) }]
      },
      {
        o: span('c07', 'c08'), rows: [
          { code: '//', en: 'comment', zh: '供人阅读的注释', a: p('c07', 8, 14) }]
      },
      {
        o: span('c08', 'c11'), rows: [
          { code: '[30:23]', en: 'bits 30 to 23', zh: '取出 8 位', color: C.clayInk, a: p('c08', 8, 14) },
          { code: '[7:0]', en: '8-bit width', zh: '声明 8 位宽', color: C.clayInk, a: p('c09', 8, 14) },
          { code: 'exp', en: 'exponent', zh: '这里指阶码', color: C.clayInk, a: p('c10', 8, 14) }]
      },
      {
        o: span('c11', 'c13'), rows: [
          { code: 'frac', en: 'fraction', zh: '小数部分', color: C.blueInk, a: p('c11', 8, 14) },
          { code: '[22:0]', en: '23 bits', zh: '小数位 23 位', color: C.blueInk, a: p('c11', 16, 14) }]
      },
      {
        o: span('c14', 'c17'), rows: [
          { code: '{ , }', en: 'concatenation', zh: '按顺序拼接', color: C.blueInk, a: p('c14', 8, 14) },
          { code: "1'b1", en: 'binary one', zh: '1 位常数 1', color: C.blueInk, a: p('c15', 8, 14) }]
      },
      {
        o: span('c17', 'c19'), rows: [
          { code: 'mant', en: 'mantissa', zh: '尾数', color: C.blueInk, a: p('c17', 8, 14) },
          { code: '[23:0]', en: '24-bit width', zh: '声明 24 位宽', color: C.blueInk, a: p('c18', 8, 14) }]
      },
    ]}
  />
  </g>
};

// c04–c22：符号、宽度与数值的局部注释。
const Notes: React.FC = () => {
  const { p, span } = useT(); return <>
    <g opacity={span('c04', 'c06')}><RLine x1={112} y1={818} x2={870} y2={818} stroke={C.rule} />{[{ x: 165, t: 'wire', l: '导线' },
    { x: 325, t: '名字', l: '输出名' },
    { x: 473, t: '=', l: '连线' },
    { x: 616, t: '来源', l: '输入位' },
    { x: 774, t: ';', l: '句末' }].map((v, i) => <g key={i} opacity={p('c04', 8 + i * 6, 12)}><Txt x={v.x} y={858} mono size={27} anchor="middle">{v.t}</Txt>
      <Txt x={v.x} y={898} size={22} color={C.muted} anchor="middle">{v.l}</Txt>
    </g>)}</g>
    <g opacity={span('c09', 'c11')}><Txt x={112} y={843} mono size={25}>wire [7:0] a_exp = a[30:23];</Txt>
      <Txt x={112} y={893} size={25}>名字前声明宽度，来源后选取位</Txt>
    </g>
    <g opacity={span('c12', 'c13')}><Txt x={112} y={841} mono size={32}>1 + 8 + 23 = 32</Txt>
      <Txt x={112} y={893} size={25}>只接线，数值没有被计算</Txt>
    </g>
    <g opacity={span('c13', 'c14')}><Txt x={112} y={645} size={28}>同样拆出第二个输入</Txt>
      <Txt x={160} y={729} mono size={32}>b</Txt>
      <RArrow x1={224} y1={718} x2={340} y2={718} stroke={C.ink2} />
      <Txt x={390} y={663} size={28} color={C.greenInk} opacity={p('c13', 8, 14)}>符号位</Txt>
      <Txt x={390} y={729} size={28} color={C.clayInk} opacity={p('c13', 8, 14)}>阶码</Txt>
      <Txt x={390} y={795} size={28} color={C.blueInk} opacity={p('c13', 8, 14)}>小数位</Txt>
    </g>
    <g opacity={span('c15', 'c17')}><Txt x={170} y={851} mono size={30}>1</Txt>
      <Txt x={397} y={851} mono size={30}>b</Txt>
      <Txt x={647} y={851} mono size={30}>1</Txt>
      <Txt x={160} y={891} size={23}>位数</Txt>
      <Txt x={353} y={891} size={23}>二进制</Txt>
      <Txt x={620} y={891} size={23}>数值</Txt>
    </g>
    <g opacity={span('c18', 'c19')}><Txt x={112} y={842} mono size={30}>23 − 0 + 1 = 24</Txt>
      <Txt x={112} y={893} size={25}>隐藏的 1 + 存下来的 23 位</Txt>
    </g>
    <g opacity={span('c19', 'c20')}><Card x={112} y={627} w={750} h={98} label="补 1 的尾数 → 规格化数路径" color={C.blueInk} />
      <Card x={112} y={776} w={750} h={98} label="特殊输入 → 另外分类" />
    </g>
    <g opacity={span('c20', 'c23')}><Txt x={112} y={636} size={28}>把贯穿的例子送进来</Txt>
      <Txt x={112} y={709} mono size={28}>a = 3F800001</Txt>
      <Txt x={112} y={770} mono size={28} opacity={p('c21', 8, 14)}>b = 3FC00000</Txt>
      <Txt x={112} y={866} size={29} opacity={p('c22', 8, 14)}>这些导线同时存在</Txt>
    </g>
  </>
};

// c01–c22：先保留 a/b 输入总线，再逐步拆字段、补隐藏位。
const Wiring: React.FC = () => {
  const { p } = useT();
  const ap = [p('c05', 8, 20), p('c08', 8, 20), p('c11', 8, 20)];
  const bp = [p('c13', 8, 20), p('c13', 8, 20), p('c13', 8, 20)];
  const introA = p('c01', 8, 14) * (1 - p('c05', 0, 12));
  const introB = p('c01', 8, 14) * (1 - p('c13', 0, 12));
  const data = [
    {
      name: 'a', x: 960, progress: ap, m: p('c16', 8, 22),
      actual: p('c20', 8, 14), mant: '800001', frac: '000001'
    },
    { name: 'b', x: 1390, progress: bp, m: p('c16', 8, 22), actual: p('c21', 8, 14), mant: 'C00000', frac: '400000' }]; return <g>
      {([
        { name: 'a', x: 960, opacity: introA },
        { name: 'b', x: 1390, opacity: introB },
      ] as const).map(input => <g key={input.name} opacity={input.opacity}>
        <Txt x={input.x + 160} y={634} anchor="middle" size={29}>输入 {input.name} · 32 位</Txt>
        <RRect x={input.x} y={691} w={60} h={58} stroke={C.ink2} fill={C.paper} draw={input.opacity} />
        <Txt x={input.x + 30} y={730} size={30} mono anchor="middle">{input.name}</Txt>
        <Bus x1={input.x + 63} y1={720} x2={input.x + 305} y2={720} bits={32} draw={input.opacity} />
      </g>)}
      {data.map(d => <g key={d.name}>
        <Txt x={d.x + 180} y={611} anchor="middle" size={24} opacity={Math.max(...d.progress)}>输入 {d.name} 的接线</Txt>
        <g opacity={Math.max(...d.progress)}><RRect x={d.x} y={691} w={60} h={58} stroke={C.ink2} fill={C.paper} />
          <Txt x={d.x + 30} y={730} size={30} mono anchor="middle">{d.name}</Txt>
          <Bus x1={d.x + 63} y1={720} x2={d.x + 112} y2={720} bits={32} />
        </g>
        {d.progress.map((a, i) => {
          const y = 652 + i * 70; const name = d.name + ['_sign', '_exp', '_frac'][i]; return <g key={i} opacity={a}>
            <RPath
              d={'M' + (d.x + 112) + ' 720 L' + (d.x + 112) + ' ' + y + ' L' + (d.x + 148) + ' ' + y}
              stroke={ROLE[i]}
              sw={i === 0 ? 2.4 : 4.5}
              roughness={0.5}
              draw={a}
            />
            <Bus x1={d.x + 148} y1={y} x2={d.x + 229} y2={y} bits={[1, 8, 23][i]} color={ROLE[i]} draw={a} />
            <Txt x={d.x + 240} y={y + 8} mono size={21} color={INK[i]}>{name}</Txt>
            <Txt x={d.x + 240} y={y + 34} mono size={20} color={INK[i]} opacity={d.actual}>{i === 0 ? '0' : i === 1 ? '127' : d.frac}</Txt>
          </g>
        })}
        <g opacity={d.m}><RArrow x1={d.x + 162} y1={812} x2={d.x + 234} y2={850} stroke={C.blue} draw={d.m} />
          <Txt x={d.x + 120} y={875} mono size={26} color={C.blueInk}>1</Txt>
          <RLine x1={d.x + 145} y1={865} x2={d.x + 234} y2={865} stroke={C.blue} draw={d.m} />
          <RRect x={d.x + 240} y={833} w={165} h={70} stroke={C.blue} fill={C.blueTint} draw={d.m} />
          <Txt x={d.x + 322} y={861} mono size={21} anchor="middle" color={C.blueInk}>{d.name + '_mant'}</Txt>
          <Txt x={d.x + 322} y={889} mono size={21} anchor="middle" color={C.blueInk}>{d.actual > 0 ? d.mant : '1 | f'}</Txt>
        </g>
      </g>)}
    </g>
};
// c01–c22：从规则到拆字段电路。
export const Unpack: React.FC = () => {
  const { span } = useT(); const o = span('c01', 'c23', 14); if (o <= 0) return null; return <g opacity={o}><Panel />
    <Translation />
    <Notes />
    <Wiring />
  </g>
};
