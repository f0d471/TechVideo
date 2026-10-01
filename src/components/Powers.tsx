import React from 'react';
import {C, F} from '../core/theme';

// 带指数的一行式子，例如 −3 × 10² × 2 × 10³：parts 是 [前面的文字, 指数] 的列表，指数用小一号的字写在右上。
// 不用 Unicode 上标：等宽字体里只有其中几个字形，大小不一（docs/standards/visual.md 第二节）
export const Powers: React.FC<{
  parts: [string, string?][];
  x: number;
  y: number;
  size: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}> = ({parts, x, y, size, color = C.ink, anchor = 'middle', opacity = 1}) => {
  if (opacity <= 0) return null;
  const up = size * 0.4;
  return (
    <text data-shot="formula" x={x} y={y} textAnchor={anchor} fontFamily={F.text} fontSize={size} fill={color} opacity={opacity} xmlSpace="preserve">
      {parts.map(([base, exp], i) => (
        <React.Fragment key={i}>
          <tspan dy={i > 0 && parts[i - 1][1] ? up : 0}>{base}</tspan>
          {exp && (
            <tspan dy={-up} fontSize={size * 0.62}>
              {exp}
            </tspan>
          )}
        </React.Fragment>
      ))}
    </text>
  );
};
