import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine, RRect} from '../../../src/core/rough';
import {BitStrip} from '../../../src/components/BitStrip';
import {Txt} from '../../../src/components/Prims';
import {Powers} from '../../../src/components/Powers';

const MAIN_BITS = '011000000000000000000000110000000000000000000000';

const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  value: string;
  color?: string;
  fill?: string;
  opacity?: number;
  valueSize?: number;
}> = ({x, y, w, h, title, value, color = C.ink2, fill = C.paper, opacity = 1, valueSize = 36}) => (
  <g opacity={opacity}>
    <RRect x={x} y={y} w={w} h={h} stroke={color} fill={fill} sw={2.2} roughness={0.7} />
    <Txt x={x + 28} y={y + 40} size={23} color={color}>{title}</Txt>
    <Txt x={x + w / 2} y={y + h - 28} anchor="middle" mono size={valueSize} color={C.ink}>{value}</Txt>
  </g>
);

// p04–p05：十进制科学计数法相乘，三件事分开算，颜色与顶部三路对应
const Decimal: React.FC = () => {
  const {p, span} = useT();
  return (
    <g opacity={span('p04', 'p06', 14)}>
      <Txt x={960} y={255} anchor="middle" size={34} color={C.ink2}>先拿十进制试一试</Txt>
      <Powers parts={[['−3 × 10', '2'], ['   ×   2 × 10', '3']]} x={960} y={370} size={52} opacity={p('p04', 0, 16)} />
      <Card x={160} y={450} w={480} h={170} title="正负单独看" value="− × + → −" color={C.green} fill={C.greenTint} opacity={p('p05', 0, 16)} valueSize={40} />
      <Card x={720} y={450} w={480} h={170} title="指数相加" value="2 + 3 = 5" color={C.clay} fill={C.clayTint} opacity={p('p05', 12, 16)} valueSize={40} />
      <Card x={1280} y={450} w={480} h={170} title="有效数字相乘" value="3 × 2 = 6" color={C.blue} fill={C.blueTint} opacity={p('p05', 24, 16)} valueSize={40} />
      <Powers parts={[['= −6 × 10', '5']]} x={960} y={735} size={50} opacity={p('p05', 36, 16)} />
    </g>
  );
};

const Intro: React.FC = () => {
  const {p, span} = useT();
  return (
    <g>
      <Decimal />
      <g opacity={span('p01', 'p02', 14)}>
        <Txt x={960} y={265} anchor="middle" size={34} color={C.ink2}>一格输出 = 一串乘积的和</Txt>
        <Card x={160} y={390} w={420} h={160} title="第一对" value="A₁ × B₁" opacity={p('p01', 8, 18)} />
        <Txt x={670} y={488} anchor="middle" size={52} color={C.muted}>+</Txt>
        <Card x={750} y={390} w={420} h={160} title="第二对" value="A₂ × B₂" opacity={p('p01', 24, 18)} />
        <Txt x={1260} y={488} anchor="middle" size={52} color={C.muted}>+</Txt>
        <Card x={1340} y={390} w={420} h={160} title="更多乘积" value="…" opacity={p('p01', 40, 18)} />
        <Txt x={960} y={690} anchor="middle" size={30} color={C.ink2}>这一集只追踪其中一次相乘</Txt>
      </g>
      <g opacity={span('p02', 'p04', 14)}>
        <Txt x={960} y={255} anchor="middle" size={34} color={C.ink2}>上一集读过的两个 FP32 输入</Txt>
        <Card x={210} y={365} w={620} h={184} title="输入 A · 比 1 大一小格" value="3F800001" color={C.blue} fill={C.blueTint} opacity={p('p02', 0, 18)} valueSize={48} />
        <Txt x={960} y={475} anchor="middle" size={52} color={C.ink2}>×</Txt>
        <Card x={1090} y={365} w={620} h={184} title="输入 B · 一点五" value="3FC00000" color={C.blue} fill={C.blueTint} opacity={p('p02', 18, 18)} valueSize={48} />
        <Txt x={960} y={690} anchor="middle" size={32} opacity={p('p03', 0, 16)}>正负？二的几次方？有效数字？</Txt>
      </g>
      <g opacity={p('p06', 0, 16)}>
        <Txt x={960} y={238} anchor="middle" size={31} color={C.ink2}>两个输入拆开后，三条线路同时工作</Txt>
        <Card x={160} y={345} w={480} h={188} title="符号线" value="sa ⊕ sb" color={C.green} fill={C.greenTint} valueSize={46} />
        <Card x={720} y={345} w={480} h={188} title="阶码线" value="ea + eb − 127" color={C.clay} fill={C.clayTint} valueSize={39} />
        <Card x={1280} y={345} w={480} h={188} title="尾数线" value="ma × mb" color={C.blue} fill={C.blueTint} valueSize={46} />
        <RLine x1={400} y1={573} x2={1520} y2={573} stroke={C.rule} sw={2} />
        <Txt x={960} y={660} anchor="middle" size={30} color={C.ink2}>三路输出先保留为中间信号</Txt>
      </g>
    </g>
  );
};

const Inputs: React.FC<{o: number}> = ({o}) => (
  <g opacity={o}>
    <Card x={120} y={218} w={750} h={146} title="输入 A" value="3F800001" color={C.blue} fill={C.paper} valueSize={39} />
    <Card x={1050} y={218} w={750} h={146} title="输入 B" value="3FC00000" color={C.blue} fill={C.paper} valueSize={39} />
  </g>
);

const Sign: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Inputs o={p('p07', 0, 14)} />
      <Card x={205} y={445} w={280} h={130} title="A 的符号" value="0" color={C.green} fill={C.greenTint} opacity={p('p07', 18, 14)} valueSize={45} />
      <Card x={1435} y={445} w={280} h={130} title="B 的符号" value="0" color={C.green} fill={C.greenTint} opacity={p('p07', 28, 14)} valueSize={45} />
      <RArrow x1={500} y1={510} x2={806} y2={510} stroke={C.green} sw={3} draw={p('p08', 0, 20)} />
      <RArrow x1={1420} y1={510} x2={1114} y2={510} stroke={C.green} sw={3} draw={p('p08', 0, 20)} />
      <Card x={820} y={435} w={280} h={150} title="同号 0 · 异号 1" value="⊕" color={C.green} fill={C.greenTint} opacity={p('p08', 8, 18)} valueSize={48} />
      <g opacity={p('p09', 0, 14)}>
        {['0⊕0=0', '1⊕1=0', '0⊕1=1', '1⊕0=1'].map((v, i) => (
          <Card key={v} x={170 + 405 * i} y={658} w={365} h={128} title={i < 2 ? '同号' : '异号'} value={v} color={C.green} fill={C.paper} valueSize={34} />
        ))}
      </g>
      <Txt x={960} y={866} anchor="middle" size={32} color={C.greenInk} opacity={p('p10', 10, 14)}>
        例子：0 ⊕ 0 = 0，积是正的
      </Txt>
    </g>
  );
};

const Exponent: React.FC = () => {
  const {p, span} = useT();
  return (
    <g>
      <g opacity={span('p11', 'p16', 12)}>
        <Card x={150} y={260} w={550} h={152} title="A 的阶码" value="ea = 127" color={C.clay} fill={C.clayTint} opacity={p('p11', 4, 16)} />
        <Card x={1220} y={260} w={550} h={152} title="B 的阶码" value="eb = 127" color={C.clay} fill={C.clayTint} opacity={p('p11', 16, 16)} />
        <Txt x={960} y={382} anchor="middle" size={35} color={C.clayInk} opacity={p('p12', 0, 16)}>指数 = 阶码 − 127</Txt>
        <Txt x={1170} y={528} anchor="end" mono size={39} opacity={p('p13', 0, 18)}>(ea − 127) + (eb − 127)</Txt>
        <Txt x={1194} y={528} mono size={39} color={C.clayInk} opacity={p('p14', 0, 16)}>+ 127</Txt>
        <RArrow x1={960} y1={555} x2={960} y2={622} stroke={C.clay} sw={3} draw={p('p14', 0, 18)} />
        <Card x={490} y={650} w={940} h={136} title="阶码和" value="e₀ = ea + eb − 127" color={C.clay} fill={C.clayTint} opacity={p('p14', 10, 16)} valueSize={41} />
        <Txt x={960} y={865} anchor="middle" size={33} color={C.clayInk} opacity={p('p15', 0, 14)}>例子：127 + 127 − 127 = 127</Txt>
      </g>
      <g opacity={p('p16', 0, 14)}>
        <Txt x={960} y={285} anchor="middle" size={34}>两个规格化输入的阶码，各在 1…254</Txt>
        <Card x={165} y={398} w={730} h={172} title="两边都最小" value="1 + 1 − 127 = −125" color={C.clay} fill={C.paper} opacity={p('p17', 0, 15)} valueSize={37} />
        <Card x={1025} y={398} w={730} h={172} title="两边都最大" value="254 + 254 − 127 = 381" color={C.clay} fill={C.paper} opacity={p('p17', 16, 15)} valueSize={37} />
        <RLine x1={960} y1={385} x2={960} y2={580} stroke={C.rule} sw={2} />
        <Txt x={960} y={690} anchor="middle" mono size={33} color={C.muted} opacity={p('p18', 0, 14)}>有符号 9 位：−256 … 255</Txt>
        <Card x={535} y={730} w={850} h={132} title="阶码和" value="有符号 10 位：−512 … 511" color={C.clay} fill={C.clayTint} opacity={p('p18', 12, 16)} valueSize={34} />
      </g>
    </g>
  );
};

const Product: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Card x={150} y={226} w={640} h={144} title="A：隐藏位 + 23 位小数" value="800001" color={C.blue} fill={C.blueTint} opacity={p('p20', 0, 16)} valueSize={42} />
      <Card x={1130} y={226} w={640} h={144} title="B：隐藏位 + 23 位小数" value="C00000" color={C.blue} fill={C.blueTint} opacity={p('p20', 14, 16)} valueSize={42} />
      <RArrow x1={500} y1={375} x2={850} y2={466} stroke={C.blue} sw={3} draw={p('p21', 0, 22)} />
      <RArrow x1={1420} y1={375} x2={1070} y2={466} stroke={C.blue} sw={3} draw={p('p21', 0, 22)} />
      <Card x={800} y={425} w={320} h={118} title="整数乘法器" value="24 × 24" color={C.blue} fill={C.paper} opacity={p('p21', 10, 18)} valueSize={36} />
      <Txt x={1500} y={512} anchor="middle" mono size={28} color={C.muted} opacity={p('p21', 0, 14)}>99 × 99 = 9801</Txt>
      <Txt x={98} y={612} size={28} color={C.blueInk} opacity={p('p22', 0, 14)}>完整乘积 · 48 位</Txt>
      <BitStrip bits={MAIN_BITS} y={628} draw={p('p22', 0, 38)} indices={[47, 46, 23, 0]} indexOpacity={p('p22', 28, 12)} />
      <Txt x={960} y={778} anchor="middle" mono size={38} color={C.blueInk} opacity={p('p22', 24, 16)}>800001 × C00000 = 600000C00000</Txt>
      <Txt x={960} y={856} anchor="middle" size={33} color={C.ink2} opacity={p('p23', 0, 14)}>1 ≤ ma, mb &lt; 2　→　1 ≤ ma × mb &lt; 4</Txt>
    </g>
  );
};

const HighBit: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Txt x={960} y={236} anchor="middle" size={34}>积小于 4，小数点前有两位</Txt>
      <RLine x1={240} y1={346} x2={1680} y2={346} stroke={C.ink2} sw={3} draw={p('p24', 0, 20)} />
      {[240, 960, 1680].map((x, i) => (
        <g key={x} opacity={p('p24', 8 + i * 5, 12)}>
          <RLine x1={x} y1={328} x2={x} y2={364} stroke={C.ink2} sw={3} />
          <Txt x={x} y={404} anchor="middle" mono size={30}>{[1, 2, 4][i]}</Txt>
        </g>
      ))}
      <Txt x={600} y={312} anchor="middle" mono size={30} color={C.blueInk} opacity={p('p24', 24, 14)}>01.xxx₂</Txt>
      <Txt x={1320} y={312} anchor="middle" mono size={30} color={C.clayInk} opacity={p('p24', 32, 14)}>10.xxx₂ 或 11.xxx₂</Txt>
      <Txt x={600} y={458} anchor="middle" size={31} color={C.blueInk} opacity={p('p25', 0, 14)}>最高位 0</Txt>
      <Txt x={1320} y={458} anchor="middle" size={31} color={C.clayInk} opacity={p('p25', 10, 14)}>最高位 1</Txt>
      <Card x={280} y={500} w={640} h={190} title="例子 · 积约 1.5" value="600000C00000" color={C.blue} fill={C.blueTint} opacity={p('p26', 0, 18)} valueSize={36} />
      <Card x={1000} y={500} w={640} h={190} title="1.5 × 1.5 = 2.25" value="900000000000" color={C.clay} fill={C.clayTint} opacity={p('p27', 0, 18)} valueSize={36} />
      <Txt x={600} y={752} anchor="middle" mono size={30} color={C.blueInk} opacity={p('p26', 22, 14)}>6 = 0110₂</Txt>
      <Txt x={1320} y={752} anchor="middle" mono size={30} color={C.clayInk} opacity={p('p27', 22, 14)}>9 = 1001₂</Txt>
      <Txt x={960} y={862} anchor="middle" size={30} opacity={p('p28', 0, 14)}>下一集：看最高位，把积调回 1.x</Txt>
    </g>
  );
};

const Merge: React.FC = () => {
  const {p} = useT();
  return (
    <g>
      <Txt x={960} y={250} anchor="middle" size={32}>3F800001 × 3FC00000</Txt>
      <Card x={145} y={345} w={480} h={218} title="符号" value="s = 0" color={C.green} fill={C.greenTint} opacity={p('p29', 0, 14)} valueSize={48} />
      <Card x={720} y={345} w={480} h={218} title="阶码和" value="e₀ = 127" color={C.clay} fill={C.clayTint} opacity={p('p29', 10, 14)} valueSize={45} />
      <Card x={1295} y={345} w={480} h={218} title="尾数积" value="600000C00000" color={C.blue} fill={C.blueTint} opacity={p('p29', 20, 14)} valueSize={32} />
      <Txt x={960} y={680} anchor="middle" size={33} color={C.ink2} opacity={p('p30', 0, 14)}>还只是中间结果：没规格化、没舍入，越界留到第 5 集</Txt>
      <RArrow x1={960} y1={714} x2={960} y2={780} stroke={C.ink2} sw={2.8} draw={p('p31', 0, 18)} />
      <Txt x={960} y={844} anchor="middle" size={32} opacity={p('p31', 14, 14)}>零、无穷和 NaN 另走一条路</Txt>
    </g>
  );
};

const Special: React.FC = () => {
  const {p, span} = useT();
  return (
    <g>
      <g opacity={span('p32', 'p35', 12)}>
        <Txt x={960} y={275} anchor="middle" size={33}>零、无穷和 NaN 不能当成 1.x 去乘，要单独判断</Txt>
        <Card x={185} y={375} w={720} h={240} title="无穷乘零 · 没有意义" value="+∞ × +0 → NaN" color={C.clay} fill={C.clayTint} opacity={p('p33', 0, 18)} valueSize={31} />
        <Card x={1015} y={375} w={720} h={240} title="输入已有 NaN" value="NaN × 1.5 → NaN" color={C.blue} fill={C.blueTint} opacity={p('p34', 0, 18)} valueSize={32} />
        <Txt x={960} y={760} anchor="middle" size={31} color={C.ink2} opacity={p('p34', 28, 14)}>两种情况都输出同一个编码 7FC00000</Txt>
      </g>
      <g opacity={p('p35', 0, 14)}>
        <Card x={140} y={324} w={670} h={285} title="规格化数" value="符号 · 阶码和 · 尾数积" color={C.blue} fill={C.paper} valueSize={29} />
        <Card x={1110} y={324} w={670} h={285} title="零、无穷、NaN" value="特殊值判断" color={C.clay} fill={C.paper} valueSize={38} />
        <RArrow x1={810} y1={468} x2={975} y2={468} stroke={C.blue} sw={3} draw={p('p36', 0, 18)} />
        <RArrow x1={1110} y1={490} x2={975} y2={490} stroke={C.clay} sw={3} draw={p('p36', 0, 18)} />
        <Txt x={960} y={705} anchor="middle" size={35} opacity={p('p36', 14, 14)}>硬件描述语言把这些部件与连线固定下来</Txt>
        <Txt x={960} y={814} anchor="middle" size={30} color={C.ink2} opacity={p('p37', 0, 14)}>符号异或 → 特殊值标志 → 尾数与阶码</Txt>
      </g>
    </g>
  );
};

export const Principle: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('c01')) return null;
  if (f < s('p07')) return <Intro />;
  if (f < s('p11')) return <Sign />;
  if (f < s('p19')) return <Exponent />;
  if (f < s('p24')) return <Product />;
  if (f < s('p29')) return <HighBit />;
  if (f < s('p32')) return <Merge />;
  return <Special />;
};
