import React from 'react';
import {C, F} from '../core/theme';
import {RLine} from '../core/rough';

// 竖式：加、减、乘的过程，一行一行出现（docs/standards/visual.md 第七节）。
// 数字右对齐，等宽字体每位 0.6 个字号；shift 让一行整体左移几位（乘法的部分积）

export type ColumnRow = {
  text: string;
  op?: string; // 写在最左边的运算符
  shift?: number;
  color?: string;
  o?: number; // 这一行的出现进度
};

export const Column: React.FC<{
  right: number; // 个位右边缘的 x
  y: number; // 第一行基线
  rows: ColumnRow[];
  rules?: {after: number; draw: number}[]; // 第 after 行下面画横线
  size?: number;
  lh?: number; // 行高
  opacity?: number;
}> = ({right, y, rows, rules = [], size = 44, lh, opacity = 1}) => {
  if (opacity <= 0) return null;
  const cw = size * 0.6;
  const step = lh ?? size * 1.35;
  const widest = Math.max(...rows.map((r) => r.text.length + (r.shift ?? 0)));
  const opX = right - (widest + 1.2) * cw;
  return (
    <g opacity={opacity} data-shot="column">
      {rows.map((r, i) => (
        <g key={i} opacity={r.o ?? 1}>
          {r.op && (
            <text x={opX} y={y + i * step} textAnchor="middle" fontFamily={F.mono} fontSize={size} fill={C.ink2} style={{fontVariantLigatures: 'none'}}>
              {r.op}
            </text>
          )}
          <text
            x={right - (r.shift ?? 0) * cw}
            y={y + i * step}
            textAnchor="end"
            fontFamily={F.mono}
            fontSize={size}
            fill={r.color ?? C.ink}
            xmlSpace="preserve"
            style={{fontVariantLigatures: 'none'}}
          >
            {r.text}
          </text>
        </g>
      ))}
      {rules.map((u) => (
        <RLine
          key={u.after}
          x1={opX - cw * 0.8}
          y1={y + u.after * step + size * 0.42}
          x2={right + cw * 0.2}
          y2={y + u.after * step + size * 0.42}
          stroke={C.ink2}
          sw={2.4}
          roughness={0.5}
          draw={u.draw}
        />
      ))}
    </g>
  );
};

// 竖式第 i 行的基线与第 k 位（从右数，个位是 0）的中心，给箭头和标注定位
export const columnAt = (right: number, y: number, size = 44, lh?: number) => ({
  rowY: (i: number) => y + i * (lh ?? size * 1.35),
  digitCX: (k: number) => right - (k + 0.5) * size * 0.6,
});
