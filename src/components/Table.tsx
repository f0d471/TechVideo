import React from 'react';
import {C, F} from '../core/theme';
import {RLine} from '../core/rough';

// 表格：枚举几种情况并排比较，例如真值表、特殊值编码表（docs/standards/visual.md 第七节）。
// 每列等宽居中，表头下一条横线；一行一行出现，当前讲的行加底色

export type TableRow = {cells: string[]; o?: number; hot?: number; colors?: (string | undefined)[]};

export const Table: React.FC<{
  cx: number; // 表的水平中心
  y: number; // 表头基线
  colW: number[];
  header: string[];
  rows: TableRow[];
  size?: number;
  rowH?: number;
  mono?: boolean[]; // 各列是否用等宽字体
  headColors?: (string | undefined)[];
  draw?: number; // 表头横线的描线进度，表头随它出现
  opacity?: number;
}> = ({cx, y, colW, header, rows, size = 34, rowH = 70, mono = [], headColors = [], draw = 1, opacity = 1}) => {
  if (opacity <= 0) return null;
  const total = colW.reduce((s, w) => s + w, 0);
  const x0 = cx - total / 2;
  const colCX = colW.map((w, i) => x0 + colW.slice(0, i).reduce((s, v) => s + v, 0) + w / 2);
  const cell = (s: string, i: number, fill: string, key: string, yy: number, sz: number) => (
    <text
      key={key}
      x={colCX[i]}
      y={yy}
      textAnchor="middle"
      fontFamily={mono[i] ? F.mono : F.text}
      fontSize={sz}
      fill={fill}
      style={mono[i] ? {fontVariantLigatures: 'none'} : undefined}
    >
      {s}
    </text>
  );
  return (
    <g opacity={opacity} data-shot="table">
      <g opacity={Math.max(0, draw * 2 - 1)}>{header.map((h, i) => cell(h, i, headColors[i] ?? C.muted, `h${i}`, y, size * 0.8))}</g>
      <RLine x1={x0} y1={y + 22} x2={x0 + total} y2={y + 22} stroke={C.rule} sw={2} draw={draw} />
      {rows.map((r, k) => {
        const by = y + 22 + k * rowH;
        return (
          <g key={k} opacity={r.o ?? 1}>
            {(r.hot ?? 0) > 0 && <rect x={x0} y={by + 6} width={total} height={rowH - 12} rx={8} fill={C.band} opacity={r.hot} />}
            {r.cells.map((c, i) => cell(c, i, r.colors?.[i] ?? C.ink, `c${i}`, by + rowH / 2 + size * 0.36, size))}
          </g>
        );
      })}
    </g>
  );
};
