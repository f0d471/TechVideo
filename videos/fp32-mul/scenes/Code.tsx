import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine, RRect} from '../../../src/core/rough';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Txt} from '../../../src/components/Prims';
import codeJson from '../build/code.json';

const sign = codeSnippet(codeJson, 'sign');
const special = codeSnippet(codeJson, 'special');
const productExp = codeSnippet(codeJson, 'product-exp');

const Box: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  value?: string;
  color?: string;
  fill?: string;
  o?: number;
}> = ({x, y, w, h = 96, label, value, color = C.ink2, fill = C.paper, o = 1}) => (
  <g opacity={o}>
    <RRect x={x} y={y} w={w} h={h} stroke={color} fill={fill} sw={2.2} roughness={0.6} />
    <Txt x={x + w / 2} y={y + (value ? 37 : h / 2 + 11)} anchor="middle" mono size={value ? 27 : 31} color={color}>
      {label}
    </Txt>
    {value && <Txt x={x + w / 2} y={y + h - 19} anchor="middle" mono size={30}>{value}</Txt>}
  </g>
);

const SignCode: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <CodePanel
        code={sign}
        vis={p('c01', 0, 14)}
        frameDraw={p('c01', 0, 22)}
        lineIn={() => p('c01', 8, 14)}
        bands={[{no: 48, o: p('c01', 12, 12)}]}
        underlines={[
          {no: 48, tok: '^', color: C.green, draw: p('c02', 0, 18)},
        ]}
      />
      <Txt x={960} y={354} anchor="middle" size={30} color={C.ink2} opacity={p('c01', 0, 14)}>
        一行代码，对应一扇异或门和三根信号线
      </Txt>
      <Box x={170} y={462} w={350} label="a_sign" value="0" color={C.green} fill={C.greenTint} o={p('c01', 16, 14)} />
      <Box x={170} y={675} w={350} label="b_sign" value="0" color={C.green} fill={C.greenTint} o={p('c01', 24, 14)} />
      <RArrow x1={520} y1={510} x2={815} y2={615} stroke={C.green} sw={3} draw={p('c01', 28, 18)} />
      <RArrow x1={520} y1={723} x2={815} y2={645} stroke={C.green} sw={3} draw={p('c01', 34, 18)} />
      <Box x={820} y={556} w={280} h={148} label="^" value="异或" color={C.green} fill={C.greenTint} o={p('c02', 0, 14)} />
      <RArrow x1={1100} y1={630} x2={1350} y2={630} stroke={C.green} sw={3} draw={p('c02', 10, 20)} />
      <Box x={1350} y={568} w={400} h={124} label="result_sign" value="0" color={C.green} fill={C.paper} o={p('c02', 20, 16)} />
      <Txt x={960} y={845} anchor="middle" size={31} color={C.greenInk} opacity={p('c02', 28, 14)}>
        例子：0 ^ 0 = 0
      </Txt>
    </g>
  );
};

const SpecialCode: React.FC = () => {
  const {p} = useT();
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
          {no: 59, tok: 'a_is_inf | b_is_inf', color: C.clay, draw: p('c04', 0, 18)},
          {no: 59, tok: 'a_is_zero | b_is_zero', color: C.blue, draw: p('c04', 12, 18)},
          {no: 60, tok: 'is_nan | inf_zero_conflict', color: C.ink2, draw: p('c05', 0, 18)},
        ]}
      />
      <Box x={130} y={395} w={720} h={124} label="a_is_inf | b_is_inf" value="任一输入是无穷" color={C.clay} fill={C.clayTint} o={p('c04', 0, 14)} />
      <Box x={1070} y={395} w={720} h={124} label="a_is_zero | b_is_zero" value="任一输入是零" color={C.blue} fill={C.blueTint} o={p('c04', 12, 14)} />
      <RArrow x1={490} y1={522} x2={850} y2={610} stroke={C.clay} sw={3} draw={p('c03', 24, 18)} />
      <RArrow x1={1430} y1={522} x2={1070} y2={610} stroke={C.blue} sw={3} draw={p('c03', 32, 18)} />
      <Box x={785} y={600} w={350} h={110} label="&&" value="无穷乘零" color={C.ink2} o={p('c03', 40, 16)} />
      <RArrow x1={960} y1={715} x2={960} y2={755} stroke={C.ink2} sw={3} draw={p('c05', 0, 16)} />
      <Box x={520} y={770} w={880} h={114} label="is_nan | inf_zero_conflict" value="特殊值选择标志" color={C.ink2} fill={C.paper} o={p('c05', 12, 16)} />
    </g>
  );
};

const ProductCode: React.FC = () => {
  const {p} = useT();
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
          {no: 65, tok: 'a_mant * b_mant', color: C.blue, draw: p('c06', 14, 18)},
          {no: 66, tok: '$signed({2\'b0, a_exp})', color: C.clay, draw: p('c07', 0, 18)},
          {no: 67, tok: "10'sd127", color: C.clay, draw: p('c07', 16, 18)},
        ]}
      />
      <Box x={150} y={410} w={650} h={120} label="a_mant * b_mant" value="24 位 × 24 位" color={C.blue} fill={C.blueTint} o={p('c06', 18, 14)} />
      <RArrow x1={800} y1={470} x2={1100} y2={470} stroke={C.blue} sw={3} draw={p('c06', 24, 18)} />
      <Box x={1100} y={410} w={670} h={120} label="product_s0" value="600000C00000" color={C.blue} fill={C.paper} o={p('c06', 32, 14)} />
      <Box x={150} y={615} w={650} h={132} label="a_exp + b_exp − 127" value="零扩展 → 带符号运算" color={C.clay} fill={C.clayTint} o={p('c07', 12, 14)} />
      <RArrow x1={800} y1={680} x2={1100} y2={680} stroke={C.clay} sw={3} draw={p('c07', 20, 18)} />
      <Box x={1100} y={615} w={670} h={132} label="exp_sum_s0" value="127 · 暂存 10 位" color={C.clay} fill={C.paper} o={p('c07', 28, 14)} />
      <RLine x1={330} y1={795} x2={1590} y2={795} stroke={C.rule} sw={2} draw={p('c08', 0, 16)} />
      <Txt x={960} y={861} anchor="middle" size={30} color={C.ink2} opacity={p('c08', 12, 14)}>
        符号 0 · 阶码和 127 · 尾数积 600000C00000 → 下一集规格化
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
