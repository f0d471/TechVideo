import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RRect} from '../../../src/core/rough';
import {Bracket, Txt} from '../../../src/components/Prims';
import {Arrow, Bits32, Box, Card, Formula, INK, MathText, ROLE, Role, cellX, layoutMath, left, parseMath, right, termSpan} from './Kit';

// 02 三个字段 p41–p61：符号位 → 阶码与偏置 → 规格化形式、隐藏位、小数位、尾数 → 拼成公式 → 读两个例子

const BITS_Y = 170;
// 三段在位串上的左右端
const range = (r: Role) => (r === 'S' ? [cellX(0), cellX(0) + 48] : r === 'E' ? [cellX(1), cellX(8) + 48] : [cellX(9), cellX(31) + 48]);
const mid = (r: Role) => (range(r)[0] + range(r)[1]) / 2;

// 上方常驻的 32 位位串：随讲解换例子，当前讲的一段亮
const Strip: React.FC = () => {
  const {p} = useT();
  const hex =
    p('p55') > 0
      ? '3F800001'
      : p('p42', 60) > 0 && p('p43') === 0
        ? '3F400000'
        : p('p42', 30) > 0 && p('p43') === 0
          ? '40400000'
          : '3FC00000';
  const hot: Role[] | undefined =
    p('p50') > 0
      ? p('p52') > 0 && p('p53') === 0
        ? ['S']
        : p('p53') > 0 && p('p54') === 0
          ? ['E']
          : p('p54') > 0
            ? ['F']
            : undefined
      : p('p44') > 0
        ? ['F']
        : p('p39') > 0
          ? ['E']
          : p('p37') > 0
            ? ['S']
            : undefined;
  return (
    <g>
      <Bits32 hex={hex} y={BITS_Y} hot={hot} draw={p('p36', 0, 22)} />
      <Txt x={1824} y={BITS_Y - 18} anchor="end" mono size={26} color={C.muted} opacity={p('p52', 0, 12)}>
        {hex}
      </Txt>
    </g>
  );
};

// p41–p43：三样东西与符号位
const Sign: React.FC = () => {
  const {p, span} = useT();
  const o = span('p36', 'p39', 14);
  if (o <= 0) return null;
  const names: [Role, string][] = [
    ['S', '正负'],
    ['E', '2 的几次方'],
    ['F', '有效数字'],
  ];
  return (
    <g opacity={o}>
      {names.map(([r, n], i) => (
        <g key={r} opacity={span('p36', 'p37') * p('p36', 14 + i * 10, 12)}>
          <Bracket x1={range(r)[0]} x2={range(r)[1]} y={BITS_Y + 100} stroke={ROLE[r]} />
          <Txt x={mid(r) + (r === 'S' ? 30 : 0)} y={BITS_Y + 146} anchor={r === 'S' ? 'start' : 'middle'} size={32} color={INK[r]}>
            {n}
          </Txt>
        </g>
      ))}
      <g opacity={p('p37', 0, 14)}>
        <Arrow from={{x: mid('S'), y: BITS_Y + 60}} to={{x: 520, y: 430}} stroke={C.green} draw={p('p37', 4, 16)} />
        <Card b={{x: 420, y: 430, w: 400, h: 150}} label="0 → 正" size={48} color={C.greenInk} stroke={C.green} mono draw={p('p37', 10, 18)} />
        <Card b={{x: 1100, y: 430, w: 400, h: 150}} label="1 → 负" size={48} color={C.greenInk} stroke={C.green} mono draw={p('p37', 18, 18)} />
        <Txt x={960} y={660} anchor="middle" size={36} color={C.greenInk} opacity={p('p37', 36, 12)}>
          符号位 S
        </Txt>
      </g>
      <g opacity={p('p38', 0, 14)}>
        <MathText text="(−1)^0 = +1" x={620} y={790} size={52} anchor="middle" color={C.greenInk} />
        <MathText text="(−1)^1 = −1" x={1300} y={790} size={52} anchor="middle" color={C.greenInk} opacity={p('p38', 20, 12)} />
      </g>
    </g>
  );
};

// p44–p48：阶码、偏置、指数
const Exponent: React.FC = () => {
  const {p, span} = useT();
  const o = span('p39', 'p44', 14);
  if (o <= 0) return null;
  const e: Box = {x: 180, y: 420, w: 360, h: 130};
  const stored: Box = {x: 780, y: 420, w: 360, h: 130};
  const back: Box = {x: 1380, y: 420, w: 360, h: 130};
  const rows = [
    {E: '127', e: '0', d: 0},
    {E: '128', e: '1', d: 30},
    {E: '126', e: '−1', d: 60},
  ];
  return (
    <g opacity={o}>
      <g opacity={span('p39', 'p41', 12)}>
        <Arrow from={{x: mid('E'), y: BITS_Y + 60}} to={{x: mid('E'), y: 360}} stroke={C.clay} draw={p('p39', 4, 16)} />
        <Txt x={mid('E')} y={420} anchor="middle" size={36} color={C.clayInk} opacity={p('p39', 14, 12)}>
          阶码 E · 8 位
        </Txt>
        <g opacity={p('p40', 0, 14)}>
          <Card b={{x: 560, y: 520, w: 380, h: 130}} label="0 … 255" size={48} mono color={C.clayInk} stroke={C.clay} />
          <Card b={{x: 1000, y: 520, w: 380, h: 130}} label="有正有负" size={40} draw={p('p40', 16, 16)} />
          <Txt x={960} y={730} anchor="middle" size={32} color={C.ink2} opacity={p('p40', 30, 12)}>
            8 位里没有地方放负号
          </Txt>
        </g>
      </g>
      <g opacity={span('p41', 'p42', 12)}>
        <Card b={e} label="指数" size={40} draw={p('p41', 0, 16)} />
        <Card b={stored} label="阶码 E" size={40} color={C.clayInk} stroke={C.clay} draw={p('p41', 12, 16)} />
        <Card b={back} label="指数" size={40} draw={p('p41', 30, 16)} />
        <Arrow from={right(e)} to={left(stored)} stroke={C.clay} draw={p('p41', 8, 14)} />
        <Arrow from={right(stored)} to={left(back)} stroke={C.clay} draw={p('p41', 26, 14)} />
        <Txt x={(e.x + e.w + stored.x) / 2} y={e.y - 24} anchor="middle" mono size={34} color={C.clayInk} opacity={p('p41', 10, 12)}>
          + 127
        </Txt>
        <Txt x={(stored.x + stored.w + back.x) / 2} y={e.y - 24} anchor="middle" mono size={34} color={C.clayInk} opacity={p('p41', 28, 12)}>
          − 127
        </Txt>
        <Txt x={960} y={680} anchor="middle" size={36} color={C.clayInk} opacity={p('p41', 44, 12)}>
          偏置 127
        </Txt>
      </g>
      <g opacity={span('p42', 'p43', 12)}>
        <Txt x={760} y={380} anchor="middle" size={30} color={C.muted}>
          阶码 E
        </Txt>
        <Txt x={1160} y={380} anchor="middle" size={30} color={C.muted}>
          指数 = E − 127
        </Txt>
        {rows.map((r, i) => (
          <g key={r.E} opacity={p('p42', r.d, 12)}>
            <Txt x={760} y={480 + i * 110} anchor="middle" mono size={52} color={C.clayInk}>
              {r.E}
            </Txt>
            <Arrow from={{x: 850, y: 462 + i * 110}} to={{x: 1070, y: 462 + i * 110}} stroke={C.clay} draw={p('p42', r.d + 4, 14)} />
            <Txt x={1160} y={480 + i * 110} anchor="middle" mono size={52}>
              {r.e}
            </Txt>
          </g>
        ))}
      </g>
      <g opacity={p('p43', 0, 14)}>
        <MathText text="2^(E−127)" x={960} y={560} size={52} anchor="middle" color={C.clayInk} />
      </g>
    </g>
  );
};

// p49–p54：规格化形式、隐藏位、小数位、尾数
const Mantissa: React.FC = () => {
  const {p, span} = useT();
  const o = span('p44', 'p50', 14);
  if (o <= 0) return null;
  const store = p('p47', 0, 14);
  const full = p('p49', 0, 14);
  // 23 格小数位与框外的隐藏位；p54 时隐藏位移回框里，拼成 24 格
  const cw = 50;
  const x0 = 1920 / 2 - (24 * cw) / 2;
  const fbits = '10000000000000000000000';
  // 规格化写法里「1.1」开头那个 1 的中心：分段为 ['3 = 11', 下标, ' = 1.1', 下标, ' × 2', 上标]
  const norm = parseMath('3 = 11_2 = 1.1_2 × 2^1');
  const normL = layoutMath(norm, 960, 52, 'middle');
  const leadX = normL.xs[2] + ' = '.length * 0.6 * 52 + 0.3 * 52;
  return (
    <g opacity={o}>
      <Arrow from={{x: mid('F'), y: BITS_Y + 60}} to={{x: mid('F'), y: 330}} stroke={C.blue} draw={p('p44', 4, 16)} />
      <Txt x={mid('F')} y={380} anchor="middle" size={32} color={C.blueInk} opacity={p('p44', 12, 12) * (1 - p('p48', 0, 10))}>
        23 位 · 有效数字
      </Txt>
      <g opacity={span('p45', 'p47', 12)}>
        <MathText segs={norm} x={960} y={560} size={52} anchor="middle" />
        <Txt x={960} y={680} anchor="middle" size={32} color={C.ink2} opacity={p('p45', 30, 12)}>
          任何不是 0 的数：1.几 × 2 的几次方
        </Txt>
        <g opacity={p('p46', 0, 12)}>
          <REllipse cx={leadX} cy={538} w={60} h={84} stroke={C.blue} sw={3} draw={p('p46', 4, 18)} />
          <Txt x={960} y={780} anchor="middle" size={38} color={C.blueInk}>
            规格化形式：小数点前只有一个 1
          </Txt>
        </g>
      </g>
      <g opacity={store}>
        {Array.from({length: 24}, (_, i) => {
          const isHidden = i === 0;
          // 隐藏位在 p52–p53 移到框外左侧，p54 回到第 0 格
          // 补回隐藏位后，第 0 格与后面 23 格之间空出 14 像素放小数点
          const hx = isHidden ? x0 - 120 * (1 - full) : x0 + i * cw + 14 * full;
          const bit = isHidden ? '1' : fbits[i - 1];
          return (
            <g key={i}>
              <RRect
                x={hx}
                y={480}
                w={cw - 6}
                h={60}
                stroke={C.blue}
                fill={isHidden ? C.paper : C.blueTint}
                sw={isHidden ? 2.4 : 1.6}
                roughness={0.6}
                dash={isHidden && full < 1}
              />
              <Txt x={hx + (cw - 6) / 2} y={523} anchor="middle" mono size={30} color={C.blueInk}>
                {bit}
              </Txt>
            </g>
          );
        })}
        <Txt x={x0 + cw - 6 + 7} y={532} anchor="middle" mono size={36} color={C.blueInk} opacity={full}>
          .
        </Txt>
        <Txt x={x0 - 120 + (cw - 6) / 2} y={600} anchor="middle" size={30} color={C.blueInk} opacity={p('p47', 20, 12) * (1 - full)}>
          隐藏位 · 不存
        </Txt>
        <g opacity={p('p48', 0, 12) * (1 - full)}>
          <Bracket x1={x0 + cw} x2={x0 + 24 * cw - 6} y={570} stroke={C.blue} />
          <Txt x={x0 + 12.5 * cw} y={620} anchor="middle" size={34} color={C.blueInk}>
            小数位 F · 23 位
          </Txt>
        </g>
        <g opacity={full}>
          <Bracket x1={x0} x2={x0 + 24 * cw + 8} y={570} stroke={C.blue} />
          <Txt x={960} y={624} anchor="middle" size={38} color={C.blueInk}>
            尾数 1.F · 24 位
          </Txt>
          <Txt x={960} y={720} anchor="middle" size={30} color={C.ink2} opacity={p('p49', 30, 12)}>
            存 23 位，算的时候有 24 位
          </Txt>
        </g>
      </g>
    </g>
  );
};

// p55–p61：三段连到公式的三项；读 3FC00000 与 3F800001
const FORMULA_Y = 480;
const FORMULA_SIZE = 52;
const Assemble: React.FC = () => {
  const {p, span} = useT();
  const o = span('p50', 'k03', 14);
  if (o <= 0) return null;
  const links: Role[] = ['S', 'E', 'F'];
  const readS = p('p52', 0, 12);
  const readE = p('p53', 0, 12);
  const readF = p('p54', 0, 12);
  const second = p('p55', 0, 12);
  return (
    <g opacity={o}>
      <Formula x={960} y={FORMULA_Y} size={FORMULA_SIZE} anchor="middle" opacity={p('p50', 0, 16)} />
      {links.map((r, i) => {
        const [a, b] = termSpan(960, FORMULA_SIZE, 'middle', r);
        return (
          <Arrow
            key={r}
            from={{x: mid(r), y: BITS_Y + 56}}
            to={{x: (a + b) / 2, y: FORMULA_Y - FORMULA_SIZE * 0.95}}
            stroke={ROLE[r]}
            draw={p('p50', 10 + i * 8, 16) * (1 - p('p52', 0, 10))}
          />
        );
      })}
      <g opacity={span('p51', 'p52', 12)}>
        <Card b={{x: 300, y: 620, w: 280, h: 120}} label="E = 0" sub="另有用途" size={36} mono />
        <Card b={{x: 660, y: 620, w: 600, h: 120}} label="E = 1 … 254" sub="规格化数" size={40} mono color={C.clayInk} stroke={C.clay} />
        <Card b={{x: 1340, y: 620, w: 280, h: 120}} label="E = 255" sub="另有用途" size={36} mono />
      </g>
      {/* 读第一个例子：三项的值写在各自下面 */}
      <g opacity={(1 - second) * readS}>
        {/* 三张读数卡按公式里的左右顺序（S、F、E）排成三列，箭头从各项正下方指到卡的上沿 */}
        {(['S', 'F', 'E'] as Role[]).map((r, i) => {
          const [a, b] = termSpan(960, FORMULA_SIZE, 'middle', r);
          const shown = r === 'S' ? readS : r === 'E' ? readE : readF;
          const text = r === 'S' ? 'S = 0 → +' : r === 'E' ? 'E − 127 = 0' : '1.1_2 = 1.5';
          const card: Box = {x: 560 + i * 400 - 170, y: FORMULA_Y + 90, w: 340, h: 90};
          return (
            <g key={r} opacity={shown}>
              <Arrow from={{x: (a + b) / 2, y: FORMULA_Y + 16}} to={{x: card.x + card.w / 2, y: card.y}} stroke={ROLE[r]} draw={shown} />
              <Card b={card} stroke={ROLE[r]} />
              <MathText text={text} x={card.x + card.w / 2} y={card.y + 58} size={36} anchor="middle" color={INK[r]} />
            </g>
          );
        })}
        <MathText text="= 1 × 1.5 × 2^0 = 1.5" x={960} y={FORMULA_Y + 240} size={52} anchor="middle" opacity={p('p54', 24, 14)} />
      </g>
      {/* 第二个例子：末位 */}
      <g opacity={second}>
        <REllipse cx={cellX(31) + 24} cy={BITS_Y + 24} w={74} h={74} stroke={C.blue} sw={3} draw={p('p55', 10, 18)} />
        <Arrow from={{x: cellX(31) + 24, y: BITS_Y + 70}} to={{x: 1600, y: FORMULA_Y + 90}} stroke={C.blue} draw={p('p55', 20, 16)} />
        <Txt x={1600} y={FORMULA_Y + 150} anchor="middle" size={34} color={C.blueInk} opacity={p('p55', 30, 12)}>
          末位
        </Txt>
        <MathText text="2^(−23)" x={1600} y={FORMULA_Y + 210} size={40} anchor="middle" color={C.blueInk} opacity={p('p56', 0, 12)} />
        <MathText text="3F800001 = 1 + 2^(−23)" x={800} y={FORMULA_Y + 240} size={52} anchor="middle" opacity={p('p56', 20, 14)} />
      </g>
    </g>
  );
};

export const FieldsPart: React.FC = () => {
  const {p, span} = useT();
  const o = span('p36', 'k03', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Strip />
      <Sign />
      <Exponent />
      <Mantissa />
      <Assemble />
    </g>
  );
};
