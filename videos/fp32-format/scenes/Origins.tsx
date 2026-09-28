import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RRect, RLine, RArrow, REllipse } from '../../../src/core/rough';
import { Txt, Bracket, Chip } from '../../../src/components/Prims';
import { Bits32, Card, Caption, MathText, MathCaption } from './Elements';

// p01–p03：宽范围需求、同一条 32 位存储、极小值的处理分叉。
// p01–p03：情景、32 位限制与 FTZ 问题。
const Intro: React.FC = () => {
  const { p, span } = useT();
  const o = span('p01', 'p04', 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <Txt x={960} y={420} anchor="middle" size={48} opacity={p('p01', 8, 14)}>神经网络里的数，大小相差很远</Txt>
    <RLine x1={290} y1={565} x2={1630} y2={565} stroke={C.ink2} draw={p('p01', 12, 24)} />
    <REllipse cx={340} cy={565} w={22} h={22} stroke={C.ink2} fill={C.paper} draw={p('p01', 12, 20)} />
    <REllipse cx={1580} cy={565} w={22} h={22} stroke={C.ink2} fill={C.paper} draw={p('p01', 20, 20)} />
    <Txt x={340} y={655} anchor="middle" mono size={42} opacity={p('p01', 14, 14)}>0.000001</Txt>
    <Txt x={1580} y={655} anchor="middle" mono size={42} opacity={p('p01', 22, 14)}>1000000</Txt>
    <g opacity={p('p02', 8, 14) * (1 - p('p03', 0, 12))}>
      <RArrow x1={500} y1={660} x2={770} y2={745} stroke={C.ink2} draw={p('p02', 8, 22)} />
      <RArrow x1={1420} y1={660} x2={1150} y2={745} stroke={C.ink2} draw={p('p02', 8, 22)} />
      <Card x={790} y={715} w={340} h={120} label="同样 32 位" draw={p('p02', 12, 22)} />
    </g>
    <g opacity={p('p03', 8, 14)}>
      <Card x={360} y={738} w={500} h={112} label="极小值 · 保留" draw={p('p03', 8, 22)} />
      <Card x={1060} y={738} w={500} h={112} label="极小值 · 当作 0" draw={p('p03', 14, 22)} />
    </g>
  </g>;
};

// p04–p07：位权与二进制小数。
const Binary: React.FC = () => {
  const { p, span } = useT(); const o = span('p04', 'p08', 14); if (o <= 0) return null; const xs = [560, 770, 980, 1190]; return <g opacity={o}>
    {['1', '1', '0', '1'].map((b, i) => <g key={i}><RRect
      x={xs[i]}
      y={444}
      w={130}
      h={108}
      stroke={b === '1' ? C.ink2 : C.faint}
      fill={b === '1' ? C.rule : C.paper}
      draw={p('p04', 8, 22)}
    />
      <Txt x={xs[i] + 65} y={518} anchor="middle" mono size={52} opacity={p('p04', 10, 14)}>{b}</Txt>
    </g>)}
    <Txt x={726} y={520} anchor="middle" size={52} mono opacity={p('p04', 10, 14)}>.</Txt>
    <Txt x={1380} y={522} mono size={28} opacity={p('p04', 10, 14)}>₂</Txt>
    <Txt x={625} y={613} mono anchor="middle" size={32} opacity={p('p04', 10, 14)}>1</Txt>
    <Txt x={835} y={613} mono anchor="middle" size={32} opacity={p('p04', 10, 14)}>1/2</Txt>
    <Txt x={1045} y={613} mono anchor="middle" size={32} opacity={p('p05', 8, 14)}>1/4</Txt>
    <Txt x={1255} y={613} mono anchor="middle" size={32} opacity={p('p06', 8, 14)}>1/8</Txt>
    <RArrow x1={896} y1={602} x2={986} y2={602} lift={-35} stroke={C.ink2} draw={p('p05', 8, 18)} />
    <Caption text="1 + 1/2 + 0/4 + 1/8 = 1.625" mono y={718} opacity={p('p06', 16, 14)} />
    <Chip x={560} y={775} w={800} opacity={p('p07', 8, 14)} draw={p('p07', 8, 22)}><Txt x={960} y={818} anchor="middle" size={32}>二进制小数 · 每向右一位，分量减半</Txt>
    </Chip>
  </g>
};

// p08–p15：16.16 定点的精度与范围。
const Fixed: React.FC = () => {
  const { p, span } = useT();
  const o = span('p08', 'p16', 14);
  if (o <= 0) return null;
  const late = p('p14', 0, 14);
  const ratio = span('p12', 'p14');
  const split = span('p08', 'p10');
  return <g opacity={o}>
    <g opacity={p('p08', 8, 14)}><Bracket x1={98} x2={954} y={310} />
      <Bracket x1={962} x2={1820} y={310} />
      <Txt x={526} y={356} anchor="middle" size={28}>整数部分 16 位（含符号）</Txt>
      <Txt x={1390} y={356} anchor="middle" size={28}>小数部分 16 位</Txt>
    </g>
    <Caption text="定点数 · 小数点固定" y={425} opacity={p('p09', 8, 14) * (1 - late)} />
    <g opacity={split}>
      <Card x={230} y={492} w={610} h={192} label="整数部分 · 16 位" labelSize={48} draw={p('p08', 8, 22)} />
      <Card x={1080} y={492} w={610} h={192} label="小数部分 · 16 位" labelSize={48} draw={p('p08', 14, 22)} />
      <RLine x1={960} y1={468} x2={960} y2={740} stroke={C.ink2} draw={p('p09', 8, 22)} />
      <Txt x={960} y={817} anchor="middle" size={36} opacity={p('p09', 10, 14)}>小数点始终在两组之间</Txt>
    </g>
    <g opacity={p('p10', 8, 14) * (1 - late)}>
      <RLine x1={320} y1={590} x2={1600} y2={590} stroke={C.ink2} draw={p('p10', 8, 24)} />
      {[420, 780, 1140, 1500].map(x => <RLine key={x} x1={x} y1={577} x2={x} y2={603} stroke={C.ink2} draw={p('p10', 12, 18)} />)}
      <Bracket x1={780} x2={1140} y={658} draw={p('p10', 12, 18)} />
      <MathText text="2^(-16)" x={960} y={705} anchor="middle" size={30} />
      <g opacity={p('p11', 8, 14)}><REllipse cx={973} cy={590} w={17} h={17} fill={C.ink} stroke={C.ink} />
        <Txt x={973} y={520} mono size={30} anchor="middle">0.001</Txt>
        <RArrow x1={987} y1={565} x2={1132} y2={566} lift={-42} stroke={C.ink} draw={p('p11', 16, 22)} />
        <Txt x={1140} y={765} mono size={26} anchor="middle">0.001007080078125</Txt>
        <Txt x={1140} y={808} size={24} anchor="middle">存进最近的一格</Txt>
      </g>
    </g>
    <g opacity={ratio}>
      <RRect x={280} y={445} w={1360} h={392} fill={C.ground} stroke={C.rule} draw={p('p12', 0, 18)} />
      <Txt x={420} y={525} size={28}>原来的真值</Txt>
      <Txt x={420} y={601} mono size={46}>0.001</Txt>
      <RArrow x1={760} y1={575} x2={1080} y2={575} stroke={C.ink2} draw={p('p12', 8, 22)} />
      <Txt x={1110} y={525} size={28}>存回的值</Txt>
      <Txt x={1110} y={601} mono size={40}>0.001007080078125</Txt>
      <RLine x1={390} y1={653} x2={1530} y2={653} stroke={C.rule} />
      <Caption text="|存回值 − 真值| ÷ |真值|" y={736} />
      <Txt x={960} y={818} anchor="middle" mono size={52} opacity={p('p13', 8, 14)}>≈ 0.708%</Txt>
    </g>
    <g opacity={late}><Caption text="32 位有符号定点 · 16 位小数" y={451} />
      <RLine x1={240} y1={575} x2={1640} y2={575} stroke={C.ink2} draw={p('p14', 8, 24)} />
      <RLine x1={1350} y1={551} x2={1350} y2={599} stroke={C.ink} draw={p('p14', 8, 18)} />
      <MathText text="32768 − 2^(-16)" x={1350} y={654} size={30} anchor="middle" />
      <Txt x={1550} y={518} mono size={30} anchor="middle">32768</Txt>
      <REllipse cx={1550} cy={575} w={16} h={16} stroke={C.ink} fill={C.paper} />
      <Caption text="超出可表示范围" y={748} opacity={span('p14', 'p15')} />
      <g opacity={p('p15', 8, 14)}><RArrow x1={1130} y1={746} x2={790} y2={746} stroke={C.ink2} draw={p('p15', 8, 22)} />
        <Txt x={1190} y={756} size={30}>小数位更多</Txt>
        <Txt x={730} y={756} anchor="end" size={30}>范围更窄</Txt>
        <Caption text="位数总量不变，精度和范围要一起分配" y={838} />
      </g>
    </g>
  </g>
};

// p16–p20：科学计数法过渡到浮点。
const Scientific: React.FC = () => {
  const { p, span } = useT(); const o = span('p16', 'p21', 14); if (o <= 0) return null; const binary = p('p18', 0, 14); return <g opacity={o}>
    <g opacity={1 - binary}><Txt x={410} y={495} mono size={48} opacity={p('p16', 8, 14)}>1024</Txt>
      <Txt x={730} y={495} size={48} opacity={p('p16', 8, 14)}>=</Txt>
      <MathText text="1.024 × 10^3" x={860} y={495} size={48} opacity={p('p16', 8, 14)} />
      <Bracket x1={860} x2={1015} y={532} draw={p('p16', 8, 22)} />
      <Bracket x1={1130} x2={1238} y={532} stroke={C.clay} draw={p('p16', 16, 22)} />
      <Txt x={940} y={580} anchor="middle" size={28}>有效数</Txt>
      <Txt x={1180} y={580} anchor="middle" size={28} color={C.clayInk}>量级</Txt>
      <Caption text="科学计数法" y={727} opacity={p('p17', 8, 14)} />
    </g>
    <g opacity={binary}><MathText text="1.1_2 × 2^0 = 1.5" x={410} y={472} size={44} />
      <MathText text="1.1_2 × 2^1 = 3" x={410} y={552} size={44} opacity={p('p18', 8, 14)} />
      <Caption text="同一个数 × 不同的 2 的幂" y={640} opacity={span('p18', 'p19')} />
      <g opacity={p('p19', 8, 14)}><Card x={530} y={690} w={380} label="有效位" />
        <Card x={1010} y={690} w={380} label="量级" color={C.clayInk} />
        <RArrow x1={830} y1={596} x2={720} y2={668} stroke={C.ink2} draw={p('p19', 8, 22)} />
        <RArrow x1={1070} y1={596} x2={1200} y2={668} stroke={C.clay} draw={p('p19', 16, 22)} />
      </g>
      <Caption text="浮点数 · 小数点的位置跟着量级走" y={862} opacity={p('p20', 8, 14)} />
    </g>
  </g>
};

// p21–p25：直接看出定点在小端归零、大端溢出，浮点保住两端。
// p21–p25：三种输入比较定点与浮点。
const Compare: React.FC = () => {
  const { p, span } = useT();
  const o = span('p21', 'p26', 14);
  if (o <= 0) return null;
  return <g opacity={o}>
    <Txt x={220} y={398} size={30}>输入值</Txt>
    <Txt x={795} y={398} anchor="middle" size={30}>16.16 定点</Txt>
    <Txt x={1460} y={398} anchor="middle" size={30}>32 位浮点</Txt>
    <RLine x1={190} y1={430} x2={1740} y2={430} stroke={C.rule} draw={p('p21', 8, 22)} />
    {[555, 680, 805].map(y => <RLine key={y} x1={190} y1={y} x2={1740} y2={y} stroke={C.rule} />)}
    <Txt x={220} y={502} mono size={38} opacity={p('p21', 8, 14)}>0.000001</Txt>
    <Txt x={795} y={502} anchor="middle" mono size={38} opacity={p('p21', 8, 14)}>0</Txt>
    <Txt x={795} y={542} anchor="middle" size={27} color={C.muted} opacity={p('p21', 12, 14)}>误差 100%</Txt>
    <Txt x={1460} y={502} anchor="middle" mono size={36} opacity={p('p22', 8, 14)}>≈ 0.000001</Txt>
    <MathText text="误差 ≈ 2.52 × 10^(-7)%" x={1460} y={542} anchor="middle" size={27} opacity={p('p22', 12, 14)} />
    <Txt x={220} y={626} mono size={38} opacity={p('p23', 8, 14)}>0.001</Txt>
    <Txt x={795} y={626} anchor="middle" mono size={34} opacity={p('p23', 8, 14)}>0.00100708</Txt>
    <Txt x={795} y={665} anchor="middle" size={27} color={C.muted} opacity={p('p23', 12, 14)}>误差 ≈ 0.708%</Txt>
    <Txt x={1460} y={626} anchor="middle" mono size={36} opacity={p('p23', 8, 14)}>≈ 0.001</Txt>
    <MathText text="误差 ≈ 4.75 × 10^(-6)%" x={1460} y={665} anchor="middle" size={27} opacity={p('p23', 12, 14)} />
    <Txt x={220} y={750} mono size={38} opacity={p('p24', 8, 14)}>1000000</Txt>
    <Txt x={795} y={750} anchor="middle" size={36} opacity={p('p24', 8, 14)}>放不下</Txt>
    <Txt x={1460} y={750} anchor="middle" mono size={36} opacity={p('p25', 8, 14)}>1000000</Txt>
    <Txt x={1460} y={788} anchor="middle" size={27} color={C.muted} opacity={p('p25', 12, 14)}>误差 0%</Txt>
    <Caption text="从极小的小数，到很大的数" y={865} opacity={p('p25', 16, 14)} />
  </g>;
};

// p01–p25：表示法起点及范围问题。
export const Origins: React.FC = () => {
  const { p, span } = useT();
  const o = span('p01', 'p26', 14);
  if (o <= 0) return null;
  const mid = span('p04', 'p08') + span('p16', 'p26');
  const q = p('p11') > 0 && p('p16') === 0;
  return <g opacity={o}>
    <g opacity={p('p02', 8, 14) * (1 - 0.7 * Math.min(1, mid))}>
      <Txt x={98} y={159} size={30} color={C.ink2}>一个输入 · 32 位</Txt>
      <Bits32
        hex={q ? '00000042' : '3FC00000'}
        blank={p('p11') === 0}
        labels={false}
        colored={false}
        draw={p('p02', 8, 24)}
      />
    </g>
    <Intro />
    <Binary />
    <Fixed />
    <Scientific />
    <Compare />
  </g>
};
