import React from 'react';
import {C, F} from '../core/theme';
import {RRect} from '../core/rough';

// 48 位积的位条。位号 47 在最左，位号 0 在最右。
export const STRIP = {x0: 98, y: 200, pitch: 36, cw: 32, ch: 46, n: 48};
export const cellX = (bit: number) => STRIP.x0 + (STRIP.n - 1 - bit) * STRIP.pitch;
export const cellCX = (bit: number) => cellX(bit) + STRIP.cw / 2;

export type CellLook = {fill?: string; stroke?: string; text?: string; opacity?: number};

export const BitStrip: React.FC<{
  bits: string; // 高位在前
  draw: number; // 0..1 整条描出来的进度
  look?: (bit: number) => CellLook;
  indices?: number[];
  indexOpacity?: number;
  opacity?: number;
  y?: number;
}> = ({bits, draw, look, indices = [], indexOpacity = 1, opacity = 1, y = STRIP.y}) => {
  const {cw, ch, n} = STRIP;
  return (
    <g opacity={opacity} data-shot="bits">
      {Array.from({length: n}, (_, col) => {
        const bit = n - 1 - col;
        const lk = look?.(bit) ?? {};
        // 从左往右依次描出
        const local = Math.max(0, Math.min(1, draw * 1.6 - (col / n) * 0.6));
        const x = cellX(bit);
        return (
          <g key={bit} opacity={lk.opacity ?? 1}>
            <RRect
              x={x}
              y={y}
              w={cw}
              h={ch}
              stroke={lk.stroke ?? C.ink2}
              fill={lk.fill}
              sw={1.8}
              roughness={0.7}
              draw={local}
            />
            <text
              x={x + cw / 2}
              y={y + ch / 2 + 10}
              textAnchor="middle"
              fontFamily={F.mono}
              style={{fontVariantLigatures: 'none'}}
              fontSize={27}
              fontWeight={500}
              fill={lk.text ?? C.ink}
              opacity={Math.max(0, local * 2 - 1)}
            >
              {bits[col]}
            </text>
          </g>
        );
      })}
      {indices.map((bit) => (
        <text
          key={bit}
          x={cellCX(bit)}
          y={y + ch + 28}
          textAnchor="middle"
          fontFamily={F.mono}
          fontSize={17}
          fill={C.muted}
          opacity={indexOpacity}
        >
          {bit}
        </text>
      ))}
    </g>
  );
};
