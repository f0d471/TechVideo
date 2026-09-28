import React from 'react';
import { C } from '../../../src/core/theme';
import { useT } from '../../../src/core/timeline';
import { RLine, RArrow, RRect, REllipse } from '../../../src/core/rough';
import { Txt, Bracket, Chip } from '../../../src/components/Prims';
import { Bits32, Card, Caption, MathText, MathCaption, Mantissa, INK } from './Elements';

// p26–p28：32 位字段总览和符号位。
const Sign: React.FC = () => {
  const { p, span } = useT(); const o = span('p26', 'p29', 14); if (o <= 0) return null; return <g opacity={o}>
    <g opacity={p('p26', 8, 14)}><Caption text="1 + 8 + 23 = 32" mono y={515} />
      <Caption text="IEEE 754 · 单精度" y={604} />
    </g>
    <g opacity={p('p27', 8, 14)}><RRect x={440} y={415} w={1040} h={285} fill={C.ground} stroke={C.ground} />
      <Card x={540} y={466} w={350} h={145} label="0 → 正" color={C.greenInk} mono />
      <Card x={1030} y={466} w={350} h={145} label="1 → 负" color={C.greenInk} mono />
    </g>
    <Chip x={620} y={756} w={680} stroke={C.green} opacity={p('p28', 8, 14)} draw={p('p28', 8, 22)}>
      <Txt x={960} y={798} anchor="middle" size={32} color={C.greenInk}>符号位 · 决定正负</Txt>
    </Chip>
  </g>
};

// p29–p35：阶码的八位编码、偏置和实际指数。
const Exponent: React.FC = () => {
  const { p, span } = useT();
  const o = span('p29', 'p36', 14);
  if (o <= 0) return null;
  const decode = p('p31', 0, 14);
  const e = p('p34') > 0 ? 126 : p('p33') > 0 ? 128 : 127;
  const exp = e - 127;
  return <g opacity={o}>
    <g opacity={1 - decode}>
      <RArrow x1={365} y1={322} x2={650} y2={430} stroke={C.clay} draw={p('p29', 8, 22)} />
      <RRect x={490} y={440} w={940} h={190} fill={C.paper} stroke={C.clay} draw={p('p29', 12, 22)} />
      <MathText text="01111111_2 = 127" x={960} y={552} size={52}
        anchor="middle" color={C.clayInk} opacity={p('p29', 14, 14)} />
      <Caption text="阶码 E · 存储量级的 8 位字段" y={750} opacity={p('p30', 8, 14)} />
    </g>
    <g opacity={decode}>
      <Txt x={470} y={533} mono size={52} color={C.clayInk}>{e}</Txt>
      <Txt x={720} y={533} mono size={52}>−</Txt>
      <Txt x={865} y={533} mono size={52}>127</Txt>
      <Txt x={1120} y={533} mono size={52}>=</Txt>
      <Txt x={1290} y={533} mono size={52} color={C.clayInk}>{exp}</Txt>
      <Txt x={520} y={607} anchor="middle" size={28} color={C.clayInk}>存下来的阶码</Txt>
      <Txt x={915} y={607} anchor="middle" size={28} opacity={p('p32', 8, 14)}>偏置</Txt>
      <Txt x={1330} y={607} anchor="middle" size={28} opacity={p('p35', 8, 14)} color={C.clayInk}>指数 e</Txt>
      <RArrow x1={1330} y1={650} x2={1330} y2={719} stroke={C.clay} draw={p('p31', 16, 22)} />
      <MathText text={`2^(${exp})`} x={1330} y={783} anchor="middle" size={48} color={C.clayInk} />
      <Txt x={405} y={790} size={30} opacity={p('p35', 8, 14)}>阶码 = 指数 + 偏置</Txt>
    </g>
  </g>
};

// p36–p43：规格化写法、隐藏位与计算用的 24 位尾数。
const Hidden: React.FC = () => {
  const { p, span } = useT();
  const o = span('p36', 'p44', 14);
  if (o <= 0) return null;
  const normalized = p('p37', 0, 14);
  const store = p('p39', 0, 14);
  const restored = p('p42', 0, 14);
  return <g opacity={o}>
    <g opacity={1 - store}>
      <g opacity={1 - normalized}><g opacity={p('p36', 8, 14)}><MathText text="1.1_2" x={580} y={536} size={48} />
        <Txt x={785} y={536} mono size={48}>=</Txt>
        <Txt x={920} y={536} mono size={48}>1</Txt>
        <Txt x={1030} y={536} mono size={48}>+</Txt>
        <Txt x={1160} y={536} mono size={48}>1/2</Txt>
        <Bracket x1={919} x2={950} y={570} />
        <Bracket x1={1158} x2={1248} y={570} />
        <Txt x={934} y={637} anchor="middle" size={30}>整数部分</Txt>
        <Txt x={1203} y={637} anchor="middle" size={30}>小数部分</Txt>
      </g>
      </g>
      <g opacity={normalized}><MathText text="11.0_2" x={650} y={530} size={48} />
        <Txt x={850} y={530} mono size={48}>=</Txt>
        <MathText text="1.10_2 × 2^1" x={950} y={530} size={48} />
        <REllipse cx={964} cy={512} w={50} h={72} stroke={C.blue} draw={p('p37', 8, 22)} />
        <Caption text="小数点前，恰好一个 1" y={642} />
        <Caption text="规格化形式" y={775} opacity={p('p38', 8, 14)} />
      </g>
    </g>
    <g opacity={store * (1 - restored)}>
      <Txt x={330} y={550} size={52} mono color={C.blueInk}>1.</Txt>
      <RRect x={492} y={470} w={1095} h={146} stroke={C.blue} fill={C.paper} draw={p('p39', 8, 22)} />
      <Txt x={1040} y={558} mono anchor="middle" size={34} color={C.blueInk}>10000000000000000000000</Txt>
      <Txt x={355} y={661} anchor="middle" size={28} color={C.blueInk} opacity={p('p40', 8, 14)}>隐藏位</Txt>
      <Txt x={355} y={708} anchor="middle" size={24} color={C.muted}>总是 1，可以不存</Txt>
      <Txt x={1040} y={661} anchor="middle" size={28} opacity={p('p41', 8, 14)} color={C.blueInk}>小数位 f · 存 23 位</Txt>
      <Caption text="框内的位写入存储，首位留在框外" y={816} />
    </g>
    <g opacity={restored}><Mantissa y={495} label={p('p43') > 0 ? '24 位尾数' : '24 位'} draw={p('p42', 8, 22)} />
      <Caption text="1 + 23 = 24" mono y={729} />
      <Caption text="尾数 · 计算时补齐" y={827} opacity={p('p43', 8, 14)} />
    </g>
  </g>
};

// p44–p45：规格化数的统一公式与阶码适用区间。
const Formula: React.FC = () => {
  const { p, span } = useT(); const o = span('p44', 'p46', 14); if (o <= 0) return null; return <g opacity={o}>
    <g opacity={p('p44', 8, 14)}>
      <MathText text="(−1)^s" x={575} y={500} size={52} color={C.greenInk} />
      <Txt x={855} y={500} mono size={52}>×</Txt>
      <Txt x={950} y={500} mono size={52} color={C.blueInk}>1.f</Txt>
      <Txt x={1115} y={500} mono size={52}>×</Txt>
      <MathText text="2^(E−127)" x={1220} y={500} size={52} color={C.clayInk} />
    </g>
    <Txt x={710} y={594} anchor="middle" size={30} color={C.greenInk}>符号</Txt>
    <Txt x={995} y={594} anchor="middle" size={30} color={C.blueInk}>尾数</Txt>
    <Txt x={1460} y={594} anchor="middle" size={30} color={C.clayInk}>指数决定量级</Txt>
    <g opacity={p('p45', 8, 14)}><Card x={280} y={720} w={220} label="E = 0" detail="另有用途" mono />
      <Card x={590} y={720} w={740} label="E = 1…254" detail="规格化数：按上面的公式解读" color={C.clayInk} mono />
      <Card x={1420} y={720} w={220} label="E = 255" detail="另有用途" mono />
    </g>
  </g>
};

// p46–p51：贯穿用例 1.5 与只改动尾数末位的数。
const Examples: React.FC = () => {
  const { p, span } = useT(); const o = span('p46', 'p52', 14); if (o <= 0) return null; const second = p('p49', 0, 14); return <g opacity={o}>
    <g opacity={p('p46', 8, 14) * (1 - p('p47', 0, 12))}>
      <RRect x={470} y={390} w={980} h={270} fill={C.paper} stroke={C.greenInk} draw={p('p46', 8, 22)} />
      <Txt x={960} y={505} anchor="middle" mono size={52} color={C.greenInk}>s = 0</Txt>
      <Txt x={960} y={605} anchor="middle" size={36} color={C.greenInk}>符号位为零 · 正数</Txt>
    </g>
    <g opacity={p('p47', 0, 12)}>
      <RRect x={300} y={390} w={500} h={150} fill={C.paper} stroke={C.greenInk} draw={p('p46', 8, 22)} />
      <Txt x={550} y={460} anchor="middle" mono size={50} color={C.greenInk}>s = 0</Txt>
      <Txt x={550} y={516} anchor="middle" size={30} color={C.greenInk}>正数</Txt>
    </g>
    <g opacity={p('p47', 8, 14)}>
      <RRect x={900} y={390} w={700} h={150} fill={C.paper} stroke={C.clayInk} draw={p('p47', 8, 22)} />
      <Txt x={1250} y={460} anchor="middle" mono size={44} color={C.clayInk}>E = 127 → e = 0</Txt>
      <Txt x={1250} y={516} anchor="middle" mono size={28} color={C.clayInk}>127 − 127 = 0</Txt>
    </g>
    <g opacity={p('p48', 8, 14)}><Mantissa y={552} bits={second > 0 ? '00000000000000000000001' : '10000000000000000000000'} last={second > 0} />
    </g>
    <g opacity={p('p48', 8, 14) * (1 - second)}><MathCaption text="1.1_2 × 2^0 = 1.5" y={827} />
    </g>
    <g opacity={p('p50', 8, 14)}><RArrow x1={1482} y1={628} x2={1640} y2={703} stroke={C.blue} draw={p('p50', 8, 22)} />
      <MathText text="2^(-23)" x={1640} y={753} size={34} anchor="middle" color={C.blueInk} />
      <Txt x={1640} y={795} size={28} anchor="middle">末位的分量</Txt>
    </g>
    <MathCaption text="1 + 2^(-23)" y={837} opacity={p('p51', 8, 14)} />
  </g>
};

// p26–p51：全程保留 32 位字段图，叠加当前字段的解释。
export const Fields: React.FC = () => {
  const { p, span } = useT();
  const o = span('p26', 'p52', 14);
  if (o <= 0) return null;
  const hex = p('p49') > 0 ? '3F800001'
    : p('p34') > 0 && p('p36') === 0 ? '3F400000'
      : p('p33') > 0 && p('p34') === 0 ? '40400000' : '3FC00000';
  const dim = 0.3 + 0.7 * Math.max(span('p26', 'p36'), span('p41', 'p44'), span('p46', 'p52'));
  const hot = p('p46') > 0 && p('p47') === 0 ? 0
    : p('p47') > 0 && p('p48') === 0 ? 1
      : p('p48') > 0 ? 2
        : p('p29') > 0 && p('p36') === 0 ? 1
          : p('p27') > 0 && p('p29') === 0 ? 0 : -1;
  return <g opacity={o}>
    <Txt x={98} y={156} size={30}>单精度 · 32 位</Txt>
    <Txt x={1820} y={156} size={28} mono anchor="end" color={C.muted}>{hex}</Txt>
    <Bits32 hex={hex} draw={p('p26', 8, 24)} opacity={dim} labels={false} hot={hot} />
    <Txt x={98} y={341} size={27} color={C.greenInk} opacity={p('p28', 8, 14)}>符号位 s</Txt>
    <Txt x={365} y={341} anchor="middle" size={27} color={C.clayInk} opacity={p('p30', 8, 14)}>阶码 E</Txt>
    <Txt x={1230} y={341} anchor="middle" size={27} color={C.blueInk} opacity={p('p41', 8, 14)}>小数位 f</Txt>
    <Sign />
    <Exponent />
    <Hidden />
    <Formula />
    <Examples />
  </g>
};
