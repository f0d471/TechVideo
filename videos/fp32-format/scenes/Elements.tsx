import React from 'react';
import { C } from '../../../src/core/theme';
import { RRect, RLine, RArrow } from '../../../src/core/rough';
import { Txt, Bracket } from '../../../src/components/Prims';

export const ROLE = [C.green, C.clay, C.blue];
export const INK = [C.greenInk, C.clayInk, C.blueInk];
export const TINT = [C.greenTint, C.clayTint, C.blueTint];
export const bitString = (hex: string) => parseInt(hex, 16).toString(2).padStart(32, '0');

type Bits32Props = {
  hex?: string;
  y?: number;
  opacity?: number;
  draw?: number;
  colored?: boolean;
  labels?: boolean;
  hot?: number;
  blank?: boolean;
};

export const Bits32: React.FC<Bits32Props> = ({
  hex = '3FC00000', y = 200, opacity = 1, draw = 1,
  colored = true, labels = true, hot = -1, blank = false,
}) => {
  const bits = bitString(hex);
  return <g opacity={opacity}>
    {Array.from({ length: 32 }, (_, i) => {
      const r = i === 0 ? 0 : i < 9 ? 1 : 2; const on = hot < 0 || hot === r; const x = 98 + i * 54;
      return <g key={i} opacity={on ? 1 : 0.3}>
        <RRect
          x={x}
          y={y}
          w={48}
          h={48}
          stroke={colored ? ROLE[r] : C.ink2}
          fill={colored ? TINT[r] : C.paper}
          roughness={0.65}
          sw={1.7}
          draw={draw}
        />
        <Txt
          x={x + 24}
          y={y + 34}
          anchor="middle"
          mono
          size={28}
          color={colored ? INK[r] : C.ink}
          opacity={Math.max(0, draw * 2 - 1)}
        >{blank ? '' : bits[i]}</Txt>
      </g>;
    })}
    {[0, 1, 8, 9, 31].map(i => <Txt key={i} x={122 + i * 54} y={y + 76} anchor="middle" size={18} mono color={C.muted} opacity={draw}>{31 - i}</Txt>)}
    {labels && <g opacity={draw}>
      <Txt x={122} y={y - 25} size={26} mono anchor="middle" color={C.greenInk}>s</Txt>
      <Txt x={365} y={y - 25} size={26} mono anchor="middle" color={C.clayInk}>E · 8</Txt>
      <Txt x={1230} y={y - 25} size={26} mono anchor="middle" color={C.blueInk}>f · 23</Txt>
    </g>}
  </g>;
};

type CardProps = {
  x: number; y: number; w: number; h?: number; label: string;
  detail?: string; draw?: number; color?: string; mono?: boolean;
  labelSize?: number;
};

export const Card: React.FC<CardProps> = ({
  x, y, w, h = 100, label, detail, draw = 1, color = C.ink2, mono = false, labelSize = 30,
}) => <g opacity={draw > 0 ? 1 : 0}>
    <RRect x={x} y={y} w={w} h={h} fill={C.paper} stroke={color} roughness={0.8} sw={2} draw={draw} />
    <Txt
      x={x + w / 2}
      y={y + (detail ? 40 : h / 2 + 11)}
      anchor="middle"
      size={labelSize}
      mono={mono}
      color={color}
      opacity={Math.max(0, draw * 2 - 1)}
    >{label}</Txt>
    {detail && <Txt x={x + w / 2} y={y + 77} anchor="middle" size={22} color={C.muted} opacity={Math.max(0, draw * 2 - 1)}>{detail}</Txt>}
  </g>;

export const Caption: React.FC<{
  text: string; y?: number; opacity?: number; mono?: boolean; color?: string;
}> = ({ text, y = 860, opacity = 1, mono = false, color = C.ink2 }) =>
    <Txt x={960} y={y} anchor="middle" size={32} mono={mono} color={color} opacity={opacity}>{text}</Txt>;

// 数学式的上下标由正文与小号字符分别排版，避免等宽字体回退 Unicode 上标字形。
export const MathText: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}> = ({ text, x, y, size = 36, color = C.ink, anchor = 'start', opacity = 1 }) => {
  const parts: { text: string; kind: 'plain' | 'sup' | 'sub'; width: number }[] = [];
  const marker = /\^\(([^)]+)\)|\^([\w+−-]+)|_([\w]+)/g;
  const width = (value: string, scale: number) => [...value].reduce(
    (sum, char) => sum + (/[\x00-\x7f]/.test(char) ? 0.61 : 0.9) * size * scale,
    0,
  );
  let previous = 0;
  for (const match of text.matchAll(marker)) {
    const plain = text.slice(previous, match.index);
    if (plain) parts.push({ text: plain, kind: 'plain', width: width(plain, 1) });
    const script = match[1] ?? match[2] ?? match[3];
    const kind = match[3] ? 'sub' : 'sup';
    parts.push({ text: script, kind, width: width(script, 0.62) });
    previous = (match.index ?? 0) + match[0].length;
  }
  const tail = text.slice(previous);
  if (tail) parts.push({ text: tail, kind: 'plain', width: width(tail, 1) });
  const total = parts.reduce((sum, part) => sum + part.width, 0);
  let cursor = x - (anchor === 'middle' ? total / 2 : anchor === 'end' ? total : 0);
  return <g opacity={opacity}>
    {parts.map((part, i) => {
      const at = cursor;
      cursor += part.width;
      return <Txt
        key={i}
        x={at}
        y={y + (part.kind === 'sup' ? -size * 0.42 : part.kind === 'sub' ? size * 0.20 : 0)}
        size={part.kind === 'plain' ? size : size * 0.62}
        color={color}
        mono
      >{part.text}</Txt>;
    })}
  </g>;
};

export const MathCaption: React.FC<{ text: string; y?: number; size?: number; opacity?: number; color?: string }> =
  ({ text, y = 860, size = 36, opacity = 1, color = C.ink2 }) =>
    <MathText text={text} x={960} y={y} size={size} anchor="middle" color={color} opacity={opacity} />;

type BusProps = {
  x1: number; y1: number; x2: number; y2: number;
  bits?: number; color?: string; draw?: number;
};

export const Bus: React.FC<BusProps> = ({ x1, y1, x2, y2, bits, color = C.ink2, draw = 1 }) => <g>
  <RLine
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    sw={bits && bits > 1 ? 5 : 2.4}
    roughness={0.5}
    draw={draw}
  />
  {bits && bits > 1 && <g opacity={draw}><RLine
    x1={(x1 + x2) / 2 - 7}
    y1={(y1 + y2) / 2 + 10}
    x2={(x1 + x2) / 2 + 7}
    y2={(y1 + y2) / 2 - 10}
    stroke={color}
    roughness={0.5}
    sw={2}
  />
    <Txt x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 17} mono anchor="middle" size={17} color={color}>{bits}</Txt>
  </g>}
</g>;

type MantissaProps = {
  bits?: string; y?: number; draw?: number;
  hidden?: 0 | 1; last?: boolean; label?: string;
};

export const Mantissa: React.FC<MantissaProps> = ({
  bits = '10000000000000000000000', y = 520, draw = 1,
  hidden = 1, last = false, label = '24 位尾数',
}) => <g opacity={draw}>
    {[String(hidden), ...bits].map((b, i) => <g key={i}>
      <RRect
        x={432 + i * 44 + (i > 0 ? 20 : 0)}
        y={y}
        w={38}
        h={44}
        stroke={C.blue}
        fill={i === 0 ? C.paper : C.blueTint}
        roughness={0.6}
        sw={i === 23 && last ? 3 : 1.6}
        draw={draw}
      />
      <Txt x={451 + i * 44 + (i > 0 ? 20 : 0)} y={y + 31} anchor="middle" mono size={26} color={C.blueInk}>{b}</Txt>
    </g>)}
    <Txt x={483} y={y + 35} anchor="middle" mono size={30}>.</Txt>
    <Bracket x1={432} x2={1502} y={y + 65} stroke={C.blue} draw={draw} />
    <Txt x={960} y={y + 107} anchor="middle" size={28} color={C.blueInk}>{label}</Txt>
  </g>;

export const ThreePaths: React.FC<{ draw: number; values?: boolean; y?: number }> = ({ draw, values = false, y = 510 }) => <g>
  {[{ label: '符号', value: '0', x: 260 }, { label: '阶码', value: '127', x: 800 }, { label: '尾数', value: '1.f', x: 1340 }].map((v, i) => <g key={v.label}>
    <RArrow x1={v.x + 130} y1={y - 125} x2={v.x + 130} y2={y - 20} stroke={ROLE[i]} draw={draw} />
    <Card
      x={v.x}
      y={y}
      w={260}
      h={100}
      label={values ? v.value : v.label}
      detail={values ? v.label : undefined}
      color={INK[i]}
      draw={draw}
      mono={values}
    />
  </g>)}
</g>;
