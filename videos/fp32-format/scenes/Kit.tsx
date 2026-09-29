import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F} from '../../../src/core/theme';
import {RArrow, RLine, RRect} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';

// 这一集的画面小件：公式排版、顶部公式条、小节标签、部件卡、引用卡、照片框、按坐标算端点的箭头、32 位位串

// 角色色：符号 S 绿，阶码 E 陶土，小数位 F 与尾数蓝
export const ROLE = {S: C.green, E: C.clay, F: C.blue};
export const INK = {S: C.greenInk, E: C.clayInk, F: C.blueInk};
export const TINT = {S: C.greenTint, E: C.clayTint, F: C.blueTint};
export type Role = keyof typeof ROLE;

// 公式排版：一段一个 <tspan>，指数与下标缩小一档并上移或下移。JetBrains Mono 每个字形宽 0.6em，
// 所以每段的起点可以精确算出，下划线和箭头也按同一组数定位，不按估计的字宽手拼
export type Seg = {t: string; sup?: boolean; sub?: boolean; c?: string};
const SMALL = 0.62;
// JetBrains Mono 里有的字形宽 0.6em；它没有的（≈ → ∞ 与汉字）回退到霞鹜文楷，按 1em 算。
// 每个字符单独给 x，某个字形宽度估不准也不会把后面的字符挤歪
const charEm = (ch: string) => (/[ -~×−÷·…]/.test(ch) ? 0.6 : 1);
export const segWidth = (s: Seg, size: number) => [...s.t].reduce((w, ch) => w + charEm(ch), 0) * size * (s.sup || s.sub ? SMALL : 1);
// 一段里每个字符的起点
const charXs = (s: Seg, x0: number, size: number) => {
  const k = size * (s.sup || s.sub ? SMALL : 1);
  let cur = x0;
  return [...s.t].map((ch) => {
    const at = cur;
    cur += charEm(ch) * k;
    return {ch, at};
  });
};

// "2^(E−127)"、"1.1_2 × 2^1" 这类写法转成分段；^ 后跟括号或一串字符，_ 后跟一串字母数字
export const parseMath = (text: string, c?: string): Seg[] => {
  const out: Seg[] = [];
  const re = /\^\(([^)]+)\)|\^([\w+−-]+)|_(\w+)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push({t: text.slice(last, m.index), c});
    if (m[3]) out.push({t: m[3], sub: true, c});
    else out.push({t: m[1] ?? m[2], sup: true, c});
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({t: text.slice(last), c});
  return out;
};

// 每段的起点，anchor 按总宽换算
export const layoutMath = (segs: Seg[], x: number, size: number, anchor: 'start' | 'middle' | 'end' = 'start') => {
  const total = segs.reduce((w, s) => w + segWidth(s, size), 0);
  let cur = x - (anchor === 'middle' ? total / 2 : anchor === 'end' ? total : 0);
  const xs = segs.map((s) => {
    const at = cur;
    cur += segWidth(s, size);
    return at;
  });
  return {xs, total, left: x - (anchor === 'middle' ? total / 2 : anchor === 'end' ? total : 0)};
};

export const MathText: React.FC<{
  text?: string;
  segs?: Seg[];
  x: number;
  y: number;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}> = ({text, segs, x, y, size = 40, color = C.ink, anchor = 'start', opacity = 1}) => {
  if (opacity <= 0) return null;
  const parts = segs ?? parseMath(text ?? '');
  const {xs} = layoutMath(parts, x, size, anchor);
  return (
    <text fontFamily={F.mono} fontSize={size} opacity={opacity} style={{fontVariantLigatures: 'none'}} xmlSpace="preserve">
      {parts.flatMap((s, i) =>
        charXs(s, xs[i], size).map(({ch, at}, k) => (
          <tspan
            key={`${i}-${k}`}
            x={at}
            y={y + (s.sup ? -size * 0.4 : s.sub ? size * 0.22 : 0)}
            fontSize={s.sup || s.sub ? size * SMALL : size}
            fill={s.c ?? color}
          >
            {ch}
          </tspan>
        )),
      )}
    </text>
  );
};

// 核心公式 (−1)^S × 1.F × 2^(E−127)，按三项分色；term 标出每段属于哪一项
export const FORMULA: (Seg & {term?: Role})[] = [
  {t: '(−1)', c: C.greenInk, term: 'S'},
  {t: 'S', sup: true, c: C.greenInk, term: 'S'},
  {t: ' × '},
  {t: '1.F', c: C.blueInk, term: 'F'},
  {t: ' × '},
  {t: '2', c: C.clayInk, term: 'E'},
  {t: 'E−127', sup: true, c: C.clayInk, term: 'E'},
];

// 公式里某一项的左右端，供下划线和连线用
export const termSpan = (x: number, size: number, anchor: 'start' | 'middle' | 'end', term: Role) => {
  const {xs} = layoutMath(FORMULA, x, size, anchor);
  const idx = FORMULA.map((s, i) => (s.term === term ? i : -1)).filter((i) => i >= 0);
  const a = xs[idx[0]];
  const b = xs[idx[idx.length - 1]] + segWidth(FORMULA[idx[idx.length - 1]], size);
  return [a, b] as const;
};

// 公式本体：lit 给出每一项的亮度，under 给出每一项下划线的描线进度
export const Formula: React.FC<{
  x: number;
  y: number;
  size: number;
  anchor?: 'start' | 'middle' | 'end';
  lit?: Partial<Record<Role, number>>;
  under?: Partial<Record<Role, number>>;
  opacity?: number;
}> = ({x, y, size, anchor = 'start', lit = {}, under = {}, opacity = 1}) => {
  if (opacity <= 0) return null;
  const {xs} = layoutMath(FORMULA, x, size, anchor);
  return (
    <g opacity={opacity}>
      <text fontFamily={F.mono} fontSize={size} style={{fontVariantLigatures: 'none'}} xmlSpace="preserve">
        {FORMULA.flatMap((s, i) =>
          charXs(s, xs[i], size).map(({ch, at}, k) => (
            <tspan
              key={`${i}-${k}`}
              x={at}
              y={y + (s.sup ? -size * 0.4 : 0)}
              fontSize={s.sup ? size * SMALL : size}
              fill={s.c ?? C.ink2}
              opacity={s.term ? 0.35 + 0.65 * (lit[s.term] ?? 1) : 0.6 + 0.4 * Math.max(lit.S ?? 1, lit.E ?? 1, lit.F ?? 1)}
            >
              {ch}
            </tspan>
          )),
        )}
      </text>
      {(['S', 'E', 'F'] as Role[]).map((r) => {
        const d = under[r] ?? 0;
        if (d <= 0) return null;
        const [a, b] = termSpan(x, size, anchor, r);
        return <RLine key={r} x1={a} y1={y + size * 0.3} x2={b} y2={y + size * 0.3} stroke={ROLE[r]} sw={3} roughness={0.5} draw={d} />;
      })}
    </g>
  );
};

// 位域图：S、E、F 三段，宽度按 1、8、23 位取整后放大到能读的尺寸
export const FIELD_W = {S: 46, E: 150, F: 300};
export const Fields3: React.FC<{
  x: number;
  y: number;
  h?: number;
  lit?: Partial<Record<Role, number>>;
  counts?: boolean;
  opacity?: number;
}> = ({x, y, h = 46, lit = {}, counts = true, opacity = 1}) => {
  if (opacity <= 0) return null;
  let cx = x;
  return (
    <g opacity={opacity}>
      {(['S', 'E', 'F'] as Role[]).map((r) => {
        const w = FIELD_W[r];
        const at = cx;
        cx += w + 4;
        const o = 0.35 + 0.65 * (lit[r] ?? 1);
        return (
          <g key={r} opacity={o}>
            <RRect x={at} y={y} w={w} h={h} stroke={ROLE[r]} fill={TINT[r]} sw={2} roughness={0.6} />
            <Txt x={at + w / 2} y={y + h / 2 + 10} anchor="middle" mono size={28} color={INK[r]}>
              {r}
            </Txt>
            {counts && (
              <Txt x={at + w / 2} y={y + h + 24} anchor="middle" mono size={18} color={C.muted}>
                {{S: '1', E: '8', F: '23'}[r]}
              </Txt>
            )}
          </g>
        );
      })}
    </g>
  );
};

// 顶部公式条的位置：位域图在左，公式右对齐到安全边
export const BAR = {y: 38, formulaX: 1824, formulaY: 80, size: 36, fieldsX: 866, ruleY: 136};

export const FormulaBar: React.FC<{
  opacity: number;
  lit: Partial<Record<Role, number>>;
  under: Partial<Record<Role, number>>;
}> = ({opacity, lit, under}) => (
  <g opacity={opacity}>
    <Fields3 x={BAR.fieldsX} y={BAR.y} lit={lit} />
    <Formula x={BAR.formulaX} y={BAR.formulaY} size={BAR.size} anchor="end" lit={lit} under={under} />
  </g>
);

// 盒子与端点：箭头端点一律从盒子的坐标算，保证指到边上
export type Box = {x: number; y: number; w: number; h: number};
export const top = (b: Box) => ({x: b.x + b.w / 2, y: b.y});
export const bottom = (b: Box) => ({x: b.x + b.w / 2, y: b.y + b.h});
export const left = (b: Box) => ({x: b.x, y: b.y + b.h / 2});
export const right = (b: Box) => ({x: b.x + b.w, y: b.y + b.h / 2});
type Pt = {x: number; y: number};
// 从一点到另一点的箭头，两端各留 gap 像素，不压住文字和框线
export const Arrow: React.FC<{from: Pt; to: Pt; gap?: number; stroke?: string; draw: number; lift?: number; sw?: number}> = ({
  from,
  to,
  gap = 10,
  stroke = C.ink2,
  draw,
  lift = 0,
  sw = 2.4,
}) => {
  const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const ux = (to.x - from.x) / len;
  const uy = (to.y - from.y) / len;
  return (
    <RArrow
      x1={from.x + ux * gap}
      y1={from.y + uy * gap}
      x2={to.x - ux * gap}
      y2={to.y - uy * gap}
      stroke={stroke}
      draw={draw}
      lift={lift}
      sw={sw}
    />
  );
};

// 卡片：纸面手绘框，文字在框内居中；label 可多行
export const Card: React.FC<{
  b: Box;
  label?: string;
  sub?: string;
  size?: number;
  color?: string;
  stroke?: string;
  fill?: string;
  mono?: boolean;
  draw?: number;
  opacity?: number;
}> = ({b, label, sub, size = 34, color = C.ink, stroke = C.ink2, fill = C.paper, mono, draw = 1, opacity = 1}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const t = Math.max(0, draw * 2 - 1);
  const cy = b.y + b.h / 2 + size * 0.35 - (sub ? 18 : 0);
  return (
    <g opacity={opacity}>
      <RRect x={b.x} y={b.y} w={b.w} h={b.h} stroke={stroke} fill={fill} sw={2} roughness={0.8} draw={draw} />
      {label && (
        <Txt x={b.x + b.w / 2} y={cy} anchor="middle" size={size} color={color} mono={mono} opacity={t}>
          {label}
        </Txt>
      )}
      {sub && (
        <Txt x={b.x + b.w / 2} y={cy + 44} anchor="middle" size={24} color={C.muted} opacity={t}>
          {sub}
        </Txt>
      )}
    </g>
  );
};

// 引用卡：年份、作者、出处、题目；quote 是这篇文献的一句原文或结论
export const CiteCard: React.FC<{
  b: Box;
  year: string;
  who: string;
  venue: string;
  title: string;
  quote?: string;
  quoteZh?: string;
  draw: number;
  opacity?: number;
}> = ({b, year, who, venue, title, quote, quoteZh, draw, opacity = 1}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const t = Math.max(0, draw * 2 - 1);
  // 年份用等宽 30 号：ASCII 每字 18，汉字每字 30
  const yearW = [...year].reduce((w, ch) => w + (/[ -~]/.test(ch) ? 18 : 30), 0);
  return (
    <g opacity={opacity}>
      <RRect x={b.x} y={b.y} w={b.w} h={b.h} stroke={C.ink2} fill={C.paper} sw={2} roughness={0.7} draw={draw} />
      <g opacity={t}>
        <rect x={b.x + 24} y={b.y + 26} width={6} height={b.h - 52} rx={3} fill={C.clay} />
        <Txt x={b.x + 52} y={b.y + 62} mono size={30} color={C.clayInk}>
          {year}
        </Txt>
        <Txt x={b.x + 52 + yearW + 22} y={b.y + 62} size={26} color={C.ink2}>
          {`${who} · ${venue}`}
        </Txt>
        <Txt x={b.x + 52} y={b.y + 110} size={28} color={C.ink}>
          {title}
        </Txt>
        {quote && (
          <Txt x={b.x + 52} y={b.y + 164} size={24} color={C.ink2}>
            {quote}
          </Txt>
        )}
        {quoteZh && (
          <Txt x={b.x + 52} y={b.y + (quote ? 206 : 164)} size={28} color={C.ink}>
            {quoteZh}
          </Txt>
        )}
      </g>
    </g>
  );
};

// 照片或论文页面：放进手绘边框，按原样显示，下方写作者与许可
export const Photo: React.FC<{
  src: string;
  b: Box;
  credit: string;
  opacity: number;
  draw?: number;
}> = ({src, b, credit, opacity, draw = 1}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <foreignObject x={b.x} y={b.y} width={b.w} height={b.h}>
        <Img src={staticFile(src)} style={{width: b.w, height: b.h, objectFit: 'contain', display: 'block'}} />
      </foreignObject>
      <RRect x={b.x - 8} y={b.y - 8} w={b.w + 16} h={b.h + 16} stroke={C.ink2} sw={2} roughness={0.7} draw={draw} />
      <Txt x={b.x + b.w} y={b.y + b.h + 36} anchor="end" size={19} color={C.muted}>
        {credit}
      </Txt>
    </g>
  );
};

// 横向条形图：一组量，同一种颜色，强调的那一根换色；数值直接写在条尾，零点在左
export const Bars: React.FC<{
  x: number;
  y: number;
  w: number;
  rows: {label: string; value: number; text: string; hot?: boolean}[];
  max: number;
  rowH?: number;
  grow: (i: number) => number;
  opacity?: number;
}> = ({x, y, w, rows, max, rowH = 78, grow, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      <RLine x1={x} y1={y - 16} x2={x} y2={y + rows.length * rowH - 20} stroke={C.ink2} sw={2} roughness={0.5} draw={Math.min(1, grow(0) * 3)} />
      {rows.map((r, i) => {
        const g = grow(i);
        const len = Math.max(6, (r.value / max) * w) * g;
        const by = y + i * rowH;
        return (
          <g key={r.label} opacity={g > 0 ? 1 : 0}>
            <Txt x={x - 20} y={by + 30} anchor="end" size={30} color={C.ink}>
              {r.label}
            </Txt>
            <RRect x={x} y={by} w={len} h={42} stroke={r.hot ? C.clay : C.ink2} fill={r.hot ? C.clayTint : C.band} sw={2} roughness={0.6} />
            <Txt x={x + len + 18} y={by + 32} size={30} mono color={C.ink} opacity={Math.max(0, g * 2 - 1)}>
              {r.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// 32 位位串：第 31 位是 S，30–23 是 E，22–0 是 F；hot 让某一段亮、其余变暗
export const bits32 = (hex: string) => parseInt(hex, 16).toString(2).padStart(32, '0');
export const roleOf = (i: number): Role => (i === 0 ? 'S' : i < 9 ? 'E' : 'F');
export const CELL = {x0: 98, pitch: 54, w: 48};
export const cellX = (i: number) => CELL.x0 + i * CELL.pitch;
export const Bits32: React.FC<{
  hex?: string;
  y: number;
  draw?: number;
  opacity?: number;
  hot?: Role[];
  blank?: boolean;
  plain?: boolean;
  index?: boolean;
}> = ({hex = '00000000', y, draw = 1, opacity = 1, hot, blank, plain, index = true}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const b = bits32(hex);
  return (
    <g opacity={opacity}>
      {Array.from({length: 32}, (_, i) => {
        const r = roleOf(i);
        const on = !hot || hot.includes(r);
        return (
          <g key={i} opacity={on ? 1 : 0.3}>
            <RRect
              x={cellX(i)}
              y={y}
              w={CELL.w}
              h={CELL.w}
              stroke={plain ? C.ink2 : ROLE[r]}
              fill={plain ? C.paper : TINT[r]}
              sw={1.7}
              roughness={0.6}
              draw={draw}
            />
            {!blank && (
              <Txt x={cellX(i) + 24} y={y + 35} anchor="middle" mono size={28} color={plain ? C.ink : INK[r]} opacity={Math.max(0, draw * 2 - 1)}>
                {b[i]}
              </Txt>
            )}
          </g>
        );
      })}
      {index &&
        [0, 1, 8, 9, 31].map((i) => (
          <Txt key={i} x={cellX(i) + 24} y={y + 76} anchor="middle" size={18} mono color={C.muted}>
            {31 - i}
          </Txt>
        ))}
    </g>
  );
};
