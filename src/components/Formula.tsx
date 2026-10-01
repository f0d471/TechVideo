import React from 'react';
import {C, F} from '../core/theme';

// 公式：一行式子，按项分色、逐项出现，指数小一号写在右上（docs/standards/visual.md 第二节、第七节）。
// 一个式子变成下一个式子时，用两个 Formula 交叉淡入淡出，各项的颜色保持一致

export type Term = {t: string; color?: string; o?: number; sup?: string};

export const Formula: React.FC<{
  x: number;
  y: number;
  terms: Term[] | string;
  size?: number;
  mono?: boolean;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}> = ({x, y, terms, size = 48, mono = true, color = C.ink, anchor = 'middle', opacity = 1}) => {
  if (opacity <= 0) return null;
  const list: Term[] = typeof terms === 'string' ? [{t: terms}] : terms;
  const up = size * 0.4;
  return (
    <g opacity={opacity} data-shot="formula">
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fontFamily={mono ? F.mono : F.text}
        fontSize={size}
        fill={color}
        xmlSpace="preserve"
        style={mono ? {fontVariantLigatures: 'none'} : undefined}
      >
        {list.map((m, i) => (
          <React.Fragment key={i}>
            <tspan dy={i > 0 && list[i - 1].sup ? up : 0} fill={m.color ?? color} fillOpacity={m.o ?? 1}>
              {m.t}
            </tspan>
            {m.sup && (
              <tspan dy={-up} fontSize={size * 0.62} fill={m.color ?? color} fillOpacity={m.o ?? 1}>
                {m.sup}
              </tspan>
            )}
          </React.Fragment>
        ))}
      </text>
    </g>
  );
};
