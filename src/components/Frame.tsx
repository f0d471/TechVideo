import React from 'react';
import {C} from '../core/theme';
import {useT} from '../core/timeline';
import {RLine} from '../core/rough';
import {Txt} from './Prims';

// 片头卡：在 inBeat 里依次出现，outBeat 开始时淡出
export const TitleCard: React.FC<{
  eyebrow: string;
  title: string;
  subtitle: string;
  inBeat: string;
  outBeat: string;
  underline?: [number, number, number, number]; // 标题下手绘线的两端坐标
}> = ({eyebrow, title, subtitle, inBeat, outBeat, underline = [850, 600, 1070, 596]}) => {
  const {p} = useT();
  const o = 1 - p(outBeat, 0, 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Txt x={960} y={420} anchor="middle" size={32} color={C.muted} opacity={p(inBeat, 0, 14)}>
        {eyebrow}
      </Txt>
      <Txt x={960} y={560} anchor="middle" size={132} opacity={p(inBeat, 6, 16)} rise={p(inBeat, 6, 16)}>
        {title}
      </Txt>
      <RLine x1={underline[0]} y1={underline[1]} x2={underline[2]} y2={underline[3]} stroke={C.clay} sw={4} draw={p(inBeat, 18, 22)} />
      <Txt x={960} y={680} anchor="middle" size={38} color={C.ink2} opacity={p(inBeat, 26, 16)}>
        {subtitle}
      </Txt>
    </g>
  );
};

// 左上角的段落标签，例如「原理 · 舍入」「代码 · 舍入」
export type Segment = {label: string; from: string; fromDelay?: number; to?: string};

export const SegmentLabel: React.FC<{segments: Segment[]}> = ({segments}) => {
  const {p} = useT();
  return (
    <g>
      {segments.map((s) => (
        <Txt
          key={s.label}
          x={98}
          y={86}
          size={26}
          color={C.muted}
          opacity={p(s.from, s.fromDelay ?? 0, 14) * (s.to ? 1 - p(s.to, 0, 12) : 1)}
        >
          {s.label}
        </Txt>
      ))}
    </g>
  );
};
