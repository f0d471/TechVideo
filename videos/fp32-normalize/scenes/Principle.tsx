import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {BitStrip, cellCX} from '../../../src/components/BitStrip';
import {Txt} from '../../../src/components/Prims';
import {Powers} from '../../../src/components/Powers';
import {RLine} from '../../../src/core/rough';
import {Arrow, Card, bits48} from './Kit';

const Opening: React.FC = () => {
  const {p, span} = useT();
  const o = span('p01', 'k01');
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Txt x={960} y={250} anchor="middle" size={38} color={C.ink2}>尾数积还要写回 FP32，才能继续参加乘加</Txt>
      <Card b={{x: 190, y: 355, w: 670, h: 170}} title="积小于 2" value="1.xxxx₂" color={C.blue} fill={C.blueTint} opacity={p('p02')} />
      <Card b={{x: 1060, y: 355, w: 670, h: 170}} title="积达到 2" value="10.xxxx₂" color={C.clay} fill={C.clayTint} opacity={p('p02', 10)} />
      <Txt x={960} y={642} anchor="middle" size={36} color={C.ink2} opacity={p('p03')}>目标：小数点前恰好一个 1</Txt>
      <Card b={{x: 550, y: 700, w: 820, h: 134}} title="贯穿这一集的例子" value="1.5 × 1.5 = 2.25" color={C.clay} opacity={p('p04')} />
    </g>
  );
};

const Form: React.FC = () => {
  const {p, span} = useT();
  const o = span('p05', 'p09');
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Powers parts={[['1.F × 2', '(E − 127)']]} x={960} y={255} size={52} color={C.blueInk} />
      <Txt x={960} y={348} anchor="middle" size={32} color={C.ink2} opacity={p('p05', 8)}>小数点前恰好一个 1</Txt>
      <Card b={{x: 220, y: 408, w: 620, h: 146}} title="每个输入尾数" value="[1, 2)" color={C.blue} opacity={p('p06')} />
      <Arrow from={{x: 860, y: 482}} to={{x: 1060, y: 482}} draw={p('p06', 8)} opacity={p('p06', 8)} />
      <Card b={{x: 1080, y: 408, w: 620, h: 146}} title="两数相乘后" value="[1, 4)" color={C.clay} opacity={p('p06', 10)} />
      <Txt x={98} y={640} size={29} color={C.blueInk} opacity={p('p07')}>上一集那组数：积小于 2，已经是规格化形式</Txt>
      <BitStrip bits={bits48('600000C00000')} y={685} draw={p('p07', 8, 28)} indexOpacity={p('p07', 8, 28)}
        look={(bit) => bit === 46 ? {fill: C.blueTint, stroke: C.blue, text: C.blueInk} : {}} indices={[47, 46, 0]} />
      <Txt x={960} y={844} anchor="middle" size={31} color={C.blueInk} opacity={p('p08')}>600000C00000 · 阶码 127 → 原样直通</Txt>
    </g>
  );
};

const Paths: React.FC = () => {
  const {p, span} = useT();
  const o = span('p09', 'p20');
  if (o <= 0) return null;
  const decimal = span('p12', 'p16');
  return (
    <g opacity={o}>
      <Txt x={960} y={226} anchor="middle" size={35} color={C.ink2}>积达到 2，小数点前多出一位</Txt>
      <Card b={{x: 165, y: 285, w: 660, h: 140}} title="1.5 × 1.5" value="10.01₂ = 2.25" color={C.clay} opacity={p('p10')} />
      <Arrow from={{x: 840, y: 355}} to={{x: 1070, y: 355}} color={C.clay} draw={p('p14')} opacity={p('p14')} />
      <Card b={{x: 1090, y: 285, w: 660, h: 140}} title="有效数字 ÷ 2，指数 + 1" value="1.001₂" color={C.blue} opacity={p('p14')} />
      <Txt x={960} y={478} anchor="middle" size={30} color={C.ink2} opacity={p('p15')}>1.001₂ = 1.125，1.125 × 2 = 2.25，数值不变</Txt>
      <g opacity={decimal}>
        <Card b={{x: 355, y: 550, w: 1210, h: 138}} title="十进制里也一样" value="" color={C.ink2} opacity={p('p12')} />
        <Powers parts={[['22.5 × 10', '3']]} x={700} y={662} size={38} opacity={p('p12', 6)} />
        <Powers parts={[['=  2.25 × 10', '4']]} x={1090} y={662} size={38} color={C.blueInk} opacity={p('p13')} />
        <Txt x={960} y={746} anchor="middle" size={31} color={C.ink2} opacity={p('p13', 10)}>有效数字除以底数，指数加一，数值不变</Txt>
      </g>
      <g opacity={span('p16', 'p20')}>
        <Txt x={98} y={565} size={26} mono color={C.clayInk}>原始积  900000000000</Txt>
        <BitStrip bits={bits48('900000000000')} y={592} draw={p('p16', 0, 24)} indexOpacity={p('p16', 0, 24)}
          look={(bit) => bit === 47 ? {fill: C.clayTint, stroke: C.clay, text: C.clayInk} : {}} indices={[47, 46, 0]} />
        <Txt x={960} y={720} anchor="middle" size={31} color={C.clayInk} opacity={p('p16')}>右移 1 位 · 阶码 127 → 128</Txt>
        <BitStrip bits={bits48('480000000000')} y={765} draw={p('p17', 0, 24)} indexOpacity={p('p17', 0, 24)}
          look={(bit) => bit === 46 ? {fill: C.blueTint, stroke: C.blue, text: C.blueInk} : {}} indices={[47, 46, 0]} />
      </g>
      <Txt x={960} y={883} anchor="middle" size={27} color={C.ink2} opacity={p('p19')}>
        两个输入都在 [1, 2)，所以这里只需直通或右移一次
      </Txt>
    </g>
  );
};

const Dropped: React.FC = () => {
  const {p, span} = useT();
  const o = span('p20', 'p25');
  if (o <= 0) return null;
  const tail = (bit: number) => bit === 0 ? {fill: C.greenTint, stroke: C.green, text: C.greenInk} : {};
  return (
    <g opacity={o}>
      <Txt x={960} y={228} anchor="middle" size={36} color={C.ink2}>右移的另一端：原来的 bit 0 会掉出去</Txt>
      <Txt x={98} y={318} size={27} mono color={C.blueInk} opacity={p('p22')}>末位都为 1 的两束尾数相乘</Txt>
      <BitStrip bits={bits48('900001800001')} y={350} draw={p('p22', 8, 24)} indexOpacity={p('p22', 8, 24)} look={tail} indices={[47, 1, 0]} />
      <Arrow from={{x: cellCX(0), y: 430}} to={{x: cellCX(0), y: 492}} color={C.green} draw={p('p21')} opacity={p('p21')} />
      <Txt x={cellCX(0)} y={532} anchor="end" size={24} color={C.greenInk} opacity={p('p21')}>掉出的 1</Txt>
      <RLine x1={96} y1={564} x2={1824} y2={564} stroke={C.rule} sw={2} draw={p('p23')} />
      <Txt x={98} y={624} size={27} color={C.ink2} opacity={p('p23')}>只做右移：</Txt>
      <BitStrip bits={bits48('480000C00000')} y={650} draw={p('p23', 4, 24)} indexOpacity={p('p23', 4, 24)}
        look={(bit) => bit === 0 ? {fill: C.clayTint, stroke: C.clay, text: C.clayInk} : {}} indices={[47, 1, 0]} />
      <Txt x={960} y={828} anchor="middle" size={31} color={C.clayInk} opacity={p('p24')}>
        新末位是原来的 bit 1；原 bit 0 的信息已经丢了
      </Txt>
    </g>
  );
};

const Retain: React.FC = () => {
  const {p, span} = useT();
  const o = span('p25', 'k02');
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Txt x={960} y={226} anchor="middle" size={37} color={C.ink2}>为下一步判断，只保留“低位有没有 1”</Txt>
      <Card b={{x: 230, y: 323, w: 420, h: 142}} title="原 bit 1" value="0" color={C.blue} opacity={p('p26')} />
      <Card b={{x: 230, y: 544, w: 420, h: 142}} title="原 bit 0 · 掉出的位" value="1" color={C.green} opacity={p('p26', 7)} />
      <Arrow from={{x: 650, y: 394}} to={{x: 805, y: 503}} color={C.blue} draw={p('p26', 10)} opacity={p('p26', 10)} />
      <Arrow from={{x: 650, y: 615}} to={{x: 805, y: 535}} color={C.green} draw={p('p26', 14)} opacity={p('p26', 14)} />
      <Card b={{x: 815, y: 466, w: 250, h: 130}} title="或门" value="|" color={C.ink2} opacity={p('p26', 12)} />
      <Arrow from={{x: 1065, y: 531}} to={{x: 1230, y: 531}} color={C.green} draw={p('p27')} opacity={p('p27')} />
      <Card b={{x: 1240, y: 466, w: 450, h: 130}} title="新 bit 0" value="0 | 1 = 1" color={C.green} opacity={p('p27')} />
      <Txt x={960} y={761} anchor="middle" size={29} color={C.blueInk} opacity={p('p28')}>
        1.5 × 1.5：0 | 0 = 0　　末位改成 1 的那组：0 | 1 = 1
      </Txt>
      <Txt x={960} y={848} anchor="middle" size={30} color={C.ink2} opacity={p('p29')}>
        1 开头的积 + 调整后的阶码 + 低位有没有 1 → 下一集舍入
      </Txt>
    </g>
  );
};

export const Principle: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('k02')) return null;
  if (f < s('k01')) return <Opening />;
  if (f < s('p09')) return <Form />;
  if (f < s('p20')) return <Paths />;
  if (f < s('p25')) return <Dropped />;
  return <Retain />;
};
