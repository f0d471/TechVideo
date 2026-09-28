import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RArrow, RRect } from '../../../src/core/rough';
import { Txt } from '../../../src/components/Prims';
import { Bits32, Card, Caption, MathCaption, ThreePaths } from './Elements';

const Outcome: React.FC<{ y: number; name: string; result: string; bits: string; draw: number }> =
  ({ y, name, result, bits, draw }) => <g opacity={draw}>
    <Txt x={300} y={y + 46} size={30}>{name}</Txt>
    <RArrow x1={620} y1={y + 35} x2={975} y2={y + 35} stroke={C.ink2} draw={draw} />
    <Card x={1010} y={y - 10} w={570} h={115} label={result} detail={bits} mono draw={draw} />
  </g>;

// p68–p72：同一个极小输入分别走标准与乘法器，再给选择命名。
const Experiments: React.FC = () => {
  const { p, span } = useT();
  const o = span('p68', 'p73', 14);
  if (o <= 0) return null;
  const result = p('p70') > 0 && p('p72') === 0;
  const negative = p('p72') > 0;
  const hex = result ? '00800000' : negative ? '80000001' : '00000001';
  return <g opacity={o}>
    <Txt x={98} y={156} size={30}>{result ? '两个规格化数，得到极小结果' : '非规格输入乘 1'}</Txt>
    <Txt x={1820} y={156} size={27} anchor="end" mono>{hex}</Txt>
    <Bits32 hex={hex} labels={false} draw={p('p68', 8, 24)} opacity={0.55} />
    <MathCaption text={result ? '2^(-126) × 0.5' : negative ? '−2^(-149) × 1' : '2^(-149) × 1'} y={398} />
    <Outcome
      y={460}
      name="标准保留"
      result={result ? '极小值' : negative ? '负极小值' : '极小值'}
      bits={result ? '00400000' : negative ? '80000001' : '00000001'}
      draw={p('p68', 8, 22)}
    />
    <Outcome
      y={651}
      name="这个乘法器"
      result={negative ? '−0' : '0'}
      bits={negative ? '80000000' : '00000000'}
      draw={p('p69', 8, 22)}
    />
    <Caption text="FTZ · flush to zero · 冲零" y={842} opacity={p('p71', 8, 14)} />
  </g>;
};

// p73–p75：取舍理由放回 AI 加速器情景。
const Tradeoff: React.FC = () => {
  const { p, span } = useT();
  const o = span('p73', 'p76', 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <Txt x={960} y={240} anchor="middle" size={48} opacity={p('p73', 8, 14)}>AI 计算 · 极少用到非规格数</Txt>
    <RRect x={250} y={325} w={1420} h={230} fill={C.paper} stroke={C.ink2} draw={p('p73', 8, 22)} />
    <Txt x={960} y={430} anchor="middle" size={42} opacity={p('p73', 12, 14)}>处理极小数，需要专门电路</Txt>
    <g opacity={p('p74', 8, 14)}>
      <Card x={355} y={615} w={520} h={135} label="占空间" draw={p('p74', 8, 22)} />
      <Card x={1045} y={615} w={520} h={135} label="拖慢路径" draw={p('p74', 14, 22)} />
    </g>
    <g opacity={p('p75', 8, 14)}>
      <RRect x={250} y={325} w={1420} h={470} fill={C.ground} stroke={C.ground} />
      {[355, 800, 1245].map((x, i) => <Card
        key={x}
        x={x}
        y={500}
        w={320}
        h={180}
        label={'乘法器 ' + (i + 1)}
        labelSize={44}
        draw={p('p75', 8 + i * 6, 22)}
      />)}
      <Txt x={960} y={415} anchor="middle" size={48}>省下电路，放更多乘法器</Txt>
    </g>
  </g>;
};

// p76–p78：硬件模式，不放型号、编译开关和文档名。
const Industry: React.FC = () => {
  const { p, span } = useT();
  const o = span('p76', 'p79', 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <g opacity={span('p76', 'p77', 12)}>
      <RRect x={340} y={340} w={1240} h={400} fill={C.paper} stroke={C.ink2} draw={p('p76', 8, 22)} />
      <Txt x={960} y={485} anchor="middle" mono size={52}>GPU</Txt>
      <Txt x={960} y={615} anchor="middle" size={52}>冲零模式</Txt>
    </g>
    <g opacity={span('p77', 'p78', 12)}>
      <RRect x={340} y={340} w={1240} h={400} fill={C.paper} stroke={C.ink2} draw={p('p77', 8, 22)} />
      <Txt x={960} y={455} anchor="middle" mono size={52}>Arm</Txt>
      <Txt x={960} y={570} anchor="middle" mono size={52}>FZ</Txt>
      <Txt x={960} y={670} anchor="middle" size={34}>非规格数冲零</Txt>
    </g>
    <g opacity={p('p78', 8, 14)}>
      <Txt x={960} y={310} anchor="middle" size={52} mono>x86</Txt>
      <Card x={260} y={420} w={610} h={280} label="DAZ" labelSize={52} draw={p('p78', 8, 22)} />
      <Card x={1050} y={420} w={610} h={280} label="FTZ" labelSize={52} draw={p('p78', 14, 22)} />
      <Txt x={565} y={630} anchor="middle" size={32}>输入冲零</Txt>
      <Txt x={1355} y={630} anchor="middle" size={32}>结果冲零</Txt>
    </g>
  </g>;
};

// p79：拆字段、判类别，接到代码段。
export const Bridge: React.FC = () => {
  const { p, span } = useT();
  const o = span('p79', 'c01', 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <Txt x={98} y={156} size={30}>一串位，先拆字段，再判类别</Txt>
    <Bits32 hex="3FC00000" labels={false} draw={p('p79', 8, 24)} />
    <ThreePaths draw={p('p79', 8, 22)} y={485} />
    <RArrow x1={930} y1={612} x2={1060} y2={706} stroke={C.clay} draw={p('p79', 16, 22)} />
    <RArrow x1={1470} y1={612} x2={1290} y2={706} stroke={C.blue} draw={p('p79', 16, 22)} />
    <Card x={925} y={738} w={490} h={95} label="按阶码与小数位分类" />
  </g>;
};

export const Ftz: React.FC = () => <><Experiments />
  <Tradeoff />
  <Industry />
  <Bridge />
</>;
