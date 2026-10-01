import React from 'react';
import {C, F} from '../../../src/core/theme';
import {Label} from '../../../src/components/Label';
import {BitLook, bitsGeom} from '../../../src/components/Bits';
import {Txt} from '../../../src/components/Prims';

// 这一集共用的画法：48 位积的格子、按角色着色、导线上的值、小数点移动

export const G48 = (y: number) => bitsGeom(48, y);
export const MANT: BitLook = {fill: C.blueTint, stroke: C.blue, text: C.blueInk};
export const LEAD: BitLook = {fill: C.band, stroke: C.ink, text: C.ink};
export const DROP: BitLook = {fill: C.greenTint, stroke: C.green, text: C.greenInk};

// 导线上的一个多位值
export const Tag: React.FC<{x: number; y: number; text: string; color?: string; o: number}> = ({x, y, text, color = C.ink2, o}) => (
  <Label cx={x} cy={y} text={text} size={22} mono stroke={color} opacity={o} />
);

// 小数点移动：一串数字位置不动，小数点从第 from 位后移到第 to 位后；后面跟底数与指数，指数从 e1 换成 e2。
// 画在一个公式元素里（data-shot="formula"）
export const PointShift: React.FC<{
  x: number; // 第一个数字的中心
  y: number;
  digits: string;
  from: number;
  to: number;
  t: number; // 小数点移动的进度
  base: string; // 例如「× 10」
  e1: string;
  e2: string;
  sub?: string; // 数字后的下标，例如「₂」
  color?: string;
  size?: number;
  opacity?: number;
}> = ({x, y, digits, from, to, t, base, e1, e2, sub, color = C.ink, size = 52, opacity = 1}) => {
  if (opacity <= 0) return null;
  // 数字间只留一道窄缝，小数点落在缝里，数字看起来仍是连着写的
  const dx = size * 0.78;
  const k = from + (to - from) * t;
  const px = x + (k - 0.5) * dx;
  const end = x + (digits.length - 0.5) * dx;
  const tail = end + (sub ? size * 0.45 : 0) + size * 0.3;
  const ex = tail + (base.length * 0.6 + 0.1) * size;
  return (
    <g opacity={opacity} data-shot="formula">
      {[...digits].map((d, i) => (
        <text key={i} x={x + i * dx} y={y} textAnchor="middle" fontFamily={F.mono} fontSize={size} fill={color} style={{fontVariantLigatures: 'none'}}>
          {d}
        </text>
      ))}
      <circle cx={px} cy={y - size * 0.04} r={size * 0.075} fill={color} />
      {sub && (
        <text x={end + size * 0.05} y={y + size * 0.12} fontFamily={F.mono} fontSize={size * 0.55} fill={color}>
          {sub}
        </text>
      )}
      <text x={tail} y={y} fontFamily={F.mono} fontSize={size} fill={C.ink} xmlSpace="preserve" style={{fontVariantLigatures: 'none'}}>
        {base}
      </text>
      <text x={ex} y={y - size * 0.4} fontFamily={F.mono} fontSize={size * 0.62} fill={C.clayInk} opacity={1 - t}>
        {e1}
      </text>
      <text x={ex} y={y - size * 0.4} fontFamily={F.mono} fontSize={size * 0.62} fill={C.clayInk} opacity={t}>
        {e2}
      </text>
    </g>
  );
};

// 位串旁的一行说明
export const Note: React.FC<{x: number; y: number; t: string; color?: string; o: number; anchor?: 'start' | 'middle' | 'end'}> = ({
  x,
  y,
  t,
  color = C.ink2,
  o,
  anchor = 'start',
}) => (
  <Txt x={x} y={y} size={28} color={color} opacity={o} anchor={anchor}>
    {t}
  </Txt>
);
