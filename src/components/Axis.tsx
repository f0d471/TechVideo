import React from 'react';
import {C} from '../core/theme';
import {RArrow, RLine} from '../core/rough';
import {Txt} from './Prims';

// 数轴：范围、区间、一个值落在哪、往哪边舍（docs/standards/visual.md 第七节）。
// 所有位置由 axisX 从同一组参数算出，区间、点、跳转箭头都对得上刻度

export type AxisScale = {x1: number; x2: number; v1: number; v2: number; y: number};
export const axisX = (a: AxisScale, v: number) => a.x1 + ((v - a.v1) / (a.v2 - a.v1)) * (a.x2 - a.x1);

export type Tick = {v: number; label?: string; major?: boolean; color?: string; o?: number};

export const Axis: React.FC<{
  a: AxisScale;
  ticks: Tick[];
  draw: number;
  size?: number; // 刻度数字的字号
  opacity?: number;
}> = ({a, ticks, draw, size = 26, opacity = 1}) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity} data-shot="axis">
      <RLine x1={a.x1 - 30} y1={a.y} x2={a.x2 + 30} y2={a.y} stroke={C.ink2} sw={2.4} draw={draw} />
      {ticks.map((t) => {
        const x = axisX(a, t.v);
        const h = t.major === false ? 12 : 20;
        const o = (t.o ?? 1) * Math.max(0, draw * 2 - 1);
        return (
          <g key={t.v} opacity={o}>
            <RLine x1={x} y1={a.y - h} x2={x} y2={a.y + h} stroke={t.color ?? C.ink2} sw={t.major === false ? 2 : 2.6} />
            {t.label !== undefined && (
              <Txt x={x} y={a.y + h + size + 6} anchor="middle" size={size} mono color={t.color ?? C.ink2}>
                {t.label}
              </Txt>
            )}
          </g>
        );
      })}
    </g>
  );
};

// 区间：数轴上方一段粗线，两端实心点表示包含，空心点表示不包含，上方可写名字
export const Span: React.FC<{
  a: AxisScale;
  from: number;
  to: number;
  color: string;
  ink?: string;
  label?: string;
  lift?: number; // 离数轴多高，负数画在数轴下方（名字也写在下方）
  closedTo?: boolean;
  size?: number;
  draw: number;
  opacity?: number;
}> = ({a, from, to, color, ink, label, lift = 34, closedTo = false, size = 28, draw, opacity = 1}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const x1 = axisX(a, from);
  const x2 = axisX(a, to);
  const y = a.y - lift;
  const t = Math.max(0, draw * 2 - 1);
  return (
    <g opacity={opacity}>
      <RLine x1={x1} y1={y} x2={x2} y2={y} stroke={color} sw={6} roughness={0.5} draw={draw} />
      <circle cx={x1} cy={y} r={8} fill={color} opacity={t} />
      <circle cx={x2} cy={y} r={8} fill={closedTo ? color : C.paper} stroke={color} strokeWidth={3} opacity={t} />
      {label && (
        <Txt x={(x1 + x2) / 2} y={lift < 0 ? y + size + 14 : y - 18} anchor="middle" size={size} color={ink ?? color} opacity={t}>
          {label}
        </Txt>
      )}
    </g>
  );
};

// 数轴上的一个值：圆点加上方或下方的标注
export const Mark: React.FC<{
  a: AxisScale;
  v: number;
  color?: string;
  label?: string;
  below?: boolean;
  size?: number;
  r?: number;
  opacity?: number;
}> = ({a, v, color = C.ink, label, below = false, size = 26, r = 10, opacity = 1}) => {
  if (opacity <= 0) return null;
  const x = axisX(a, v);
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={a.y} r={r} fill={color} />
      {label && (
        <Txt x={x} y={below ? a.y + r + size + 34 : a.y - r - 16} anchor="middle" size={size} mono color={color}>
          {label}
        </Txt>
      )}
    </g>
  );
};

// 从一个值跳到另一个值的弧形箭头（舍入、移位后的新位置）
export const Hop: React.FC<{a: AxisScale; from: number; to: number; color?: string; lift?: number; draw: number}> = ({
  a,
  from,
  to,
  color = C.ink2,
  lift = -60,
  draw,
}) => <RArrow x1={axisX(a, from)} y1={a.y - 14} x2={axisX(a, to)} y2={a.y - 16} lift={lift} stroke={color} sw={2.6} draw={draw} />;
