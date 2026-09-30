import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Txt} from '../../../src/components/Prims';
import {Arrow, Card} from './Kit';
import codeJson from '../build/code.json';

const head = codeSnippet(codeJson, 'normalize-head');
const branch = codeSnippet(codeJson, 'normalize-switch');

const Head: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <CodePanel code={head} vis={p('c01')} frameDraw={p('c01', 0, 22)}
        lineIn={(i) => p('c01', 4 + i * 4, 12)}
        bands={[{no: 117, o: p('c01', 10, 12)}, {no: 118, o: p('c01', 14, 12)}]}
        underlines={[
          {no: 117, tok: 'exp_n_s', color: C.clay, draw: p('c01', 12)},
          {no: 118, tok: 'prod_n', color: C.blue, draw: p('c01', 18)},
          {no: 120, tok: 'always @(*)', color: C.ink2, draw: p('c02')},
        ]} />
      <Card b={{x: 210, y: 485, w: 650, h: 154}} title="exp_n_s" value="调整后的阶码" color={C.clay} opacity={p('c01', 12)} />
      <Card b={{x: 1060, y: 485, w: 650, h: 154}} title="prod_n" value="调整后的尾数积" color={C.blue} opacity={p('c01', 18)} />
      <Txt x={960} y={752} anchor="middle" size={37} color={C.ink2} opacity={p('c02')}>
        组合块：输入变化，就重新计算这两路输出
      </Txt>
      <Txt x={960} y={827} anchor="middle" size={27} color={C.muted} opacity={p('c02', 8)}>
        reg：这两个名字的值，由下面的组合块算出
      </Txt>
    </g>
  );
};

const HighDiagram: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Card b={{x: 140, y: 630, w: 470, h: 124}} title="product_r[47]" value="1 → 右移路" color={C.clay} opacity={p('c03')} />
      <Arrow from={{x: 610, y: 692}} to={{x: 755, y: 692}} color={C.clay} draw={p('c04')} opacity={p('c04')} />
      <Card b={{x: 770, y: 630, w: 435, h: 124}} title="阶码" value="127 + 1 = 128" color={C.clay} opacity={p('c04')} />
      <Card b={{x: 1280, y: 630, w: 510, h: 124}} title="尾数积 >> 1" value="9000… → 4800…" color={C.blue} opacity={p('c04', 8)} />
      <Txt x={960} y={840} anchor="middle" size={33} color={C.greenInk} opacity={p('c05')}>
        新末位 = 原 bit 1 | 原 bit 0
      </Txt>
      <Txt x={960} y={893} anchor="middle" size={24} color={C.ink2} opacity={p('c06')}>
        组合块里的等号，把计算结果送到对应输出
      </Txt>
    </g>
  );
};

const MuxDiagram: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Card b={{x: 138, y: 601, w: 620, h: 113}} title="最高位 = 1" value="右移 · 阶码 +1 · 低位并回" color={C.clay} opacity={p('c08')} size={28} />
      <Card b={{x: 138, y: 751, w: 620, h: 113}} title="最高位 = 0" value="尾数积与阶码原样直通" color={C.blue} opacity={p('c07')} size={28} />
      <Arrow from={{x: 758, y: 657}} to={{x: 882, y: 715}} color={C.clay} draw={p('c08')} opacity={p('c08')} />
      <Arrow from={{x: 758, y: 807}} to={{x: 882, y: 753}} color={C.blue} draw={p('c08')} opacity={p('c08')} />
      <Card b={{x: 895, y: 669, w: 330, h: 132}} title="product_r[47]" value="2 选 1" color={C.ink2} opacity={p('c08')} size={33} />
      <Arrow from={{x: 1225, y: 735}} to={{x: 1370, y: 735}} draw={p('c08', 8)} opacity={p('c08', 8)} />
      <Card b={{x: 1380, y: 669, w: 405, h: 132}} title="共同输出" value="prod_n · exp_n_s" color={C.green} opacity={p('c08', 8)} size={29} />
      <Txt x={960} y={899} anchor="middle" size={26} color={C.ink2} opacity={p('c09') * (1 - p('c11'))}>
        2.25 走右移路；上一集那组数走直通路
      </Txt>
      <Txt x={960} y={899} anchor="middle" size={26} color={C.greenInk} opacity={p('c11')}>
        低位有没有 1 留在末位，交给下一集舍入
      </Txt>
    </g>
  );
};

const Switch: React.FC = () => {
  const {f, s, p} = useT();
  const high = f < s('c07');
  const active = f < s('c04') ? [121] : f < s('c05') ? [122, 123] :
    f < s('c07') ? [124] : f < s('c08') ? [125, 126, 127] : [121, 122, 123, 124, 125, 126, 127];
  return (
    <g>
      <CodePanel code={branch} vis={p('c03')} frameDraw={p('c03', 0, 22)}
        lineIn={(i) => p('c03', 4 + i * 3, 13)}
        bands={active.map((no) => ({no, o: p('c03', 10, 12)}))}
        underlines={[
          {no: 121, tok: 'product_r[47]', color: C.clay, draw: p('c03')},
          {no: 122, tok: "exp_r + 10'sd1", color: C.clay, draw: p('c04')},
          {no: 123, tok: 'product_r >> 1', color: C.blue, draw: p('c04', 8)},
          {no: 124, tok: 'product_r[1] | product_r[0]', color: C.green, draw: p('c05')},
          {no: 124, tok: '=', color: C.ink2, draw: p('c06')},
          {no: 126, tok: 'exp_r', color: C.clay, draw: p('c07'), opacity: p('c07')},
          {no: 127, tok: 'product_r', color: C.blue, draw: p('c07'), opacity: p('c07')},
        ]} />
      {high ? <HighDiagram /> : <MuxDiagram />}
    </g>
  );
};

export const Code: React.FC = () => {
  const {f, s} = useT();
  if (f < s('c01')) return null;
  if (f < s('c03')) return <Head />;
  return <Switch />;
};
