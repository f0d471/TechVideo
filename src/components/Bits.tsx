import React from 'react';
import {C, F} from '../core/theme';
import {RRect} from '../core/rough';

// 位串：任意位宽，高位在左。用来画一切二进制值，以及切段、按位高亮、移位、掉位（docs/standards/visual.md 第七节）。
// 位置由 bitsGeom 算出，括号、箭头、门的端点都从同一组坐标取

export type BitsGeom = {x0: number; y: number; n: number; pitch: number; cw: number; ch: number; fs: number};

// 默认 48 位铺满左右留白之间；位数少时按比例放大格子，但不超过 64 像素一格
export const bitsGeom = (n: number, y: number, opts: {x0?: number; pitch?: number} = {}): BitsGeom => {
  const pitch = opts.pitch ?? Math.min(64, Math.floor(1728 / n));
  const width = pitch * n;
  const x0 = opts.x0 ?? Math.round(960 - width / 2);
  const cw = Math.round(pitch * 0.89);
  return {x0, y, n, pitch, cw, ch: Math.round(Math.max(46, cw * 1.2)), fs: Math.round(Math.min(34, cw * 0.84))};
};
// 位号为 bit 的格子左边与中心
export const bitX = (g: BitsGeom, bit: number) => g.x0 + (g.n - 1 - bit) * g.pitch;
export const bitCX = (g: BitsGeom, bit: number) => bitX(g, bit) + g.cw / 2;

export type BitLook = {fill?: string; stroke?: string; text?: string; opacity?: number; textOpacity?: number};

export const Bits: React.FC<{
  g: BitsGeom;
  bits: string; // 高位在前，长度等于 g.n；空格表示这一格空着
  draw: number; // 0..1 从左往右描出
  look?: (bit: number) => BitLook;
  indices?: number[]; // 格子下方标出的位号
  indexOpacity?: number;
  shift?: number; // 数字整体右移几格（可以是小数，用于移位动画），格子不动
  opacity?: number;
}> = ({g, bits, draw, look, indices = [], indexOpacity = 1, shift = 0, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity} data-shot="bits">
      {Array.from({length: g.n}, (_, col) => {
        const bit = g.n - 1 - col;
        const lk = look?.(bit) ?? {};
        const local = Math.max(0, Math.min(1, draw * 1.6 - (col / g.n) * 0.6));
        const x = bitX(g, bit);
        const ch = bits[col] ?? ' ';
        return (
          <g key={bit} opacity={lk.opacity ?? 1}>
            <RRect x={x} y={g.y} w={g.cw} h={g.ch} stroke={lk.stroke ?? C.ink2} fill={lk.fill} sw={1.8} roughness={0.7} draw={local} />
            {ch !== ' ' && (
              <text
                x={x + g.cw / 2 + shift * g.pitch}
                y={g.y + g.ch / 2 + g.fs * 0.36}
                textAnchor="middle"
                fontFamily={F.mono}
                style={{fontVariantLigatures: 'none'}}
                fontSize={g.fs}
                fontWeight={500}
                fill={lk.text ?? C.ink}
                opacity={Math.max(0, local * 2 - 1) * (lk.textOpacity ?? 1)}
              >
                {ch}
              </text>
            )}
          </g>
        );
      })}
      {indices.map((bit) => (
        <text key={bit} x={bitCX(g, bit)} y={g.y + g.ch + 26} textAnchor="middle" fontFamily={F.mono} fontSize={18} fill={C.muted} opacity={indexOpacity}>
          {bit}
        </text>
      ))}
    </g>
  );
};

// 十六进制转成 n 位二进制串
export const hexBits = (hex: string, n: number) => BigInt('0x' + hex).toString(2).padStart(n, '0');
