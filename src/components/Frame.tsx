import React, {useContext} from 'react';
import {C} from '../core/theme';
import {ManifestCtx, useT} from '../core/timeline';
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

// 一部分内随 section 字段切换的小节标签
export type Part = {no: string; title: string; from: string};

export const SectionTag: React.FC<{parts: Part[]; until?: string}> = ({parts, until}) => {
  const M = useContext(ManifestCtx)!;
  const {f, p} = useT();
  const cur = [...M.beats].reverse().find((b) => b.section && f >= b.start);
  if (!cur) return null;
  const stop = until ? 1 - p(until, 0, 12) : 1;
  const part = [...parts].reverse().find((pt) => M.beats.find((b) => b.id === pt.from)!.start <= cur.start);
  const inO = p(cur.id, 0, 12);
  return (
    <g opacity={stop}>
      {part && (
        <Txt x={98} y={62} size={22} color={C.muted}>
          {`${part.no} · ${part.title}`}
        </Txt>
      )}
      <Txt x={98} y={104} size={32} color={C.ink} opacity={inO}>
        {cur.section}
      </Txt>
      <RLine x1={98} y1={118} x2={162} y2={118} stroke={C.clay} sw={4} roughness={0.5} draw={p(cur.id, 4, 18)} />
    </g>
  );
};

// 无旁白的部分卡；下一句开始后淡出
export const PartCard: React.FC<{beat: string; until: string; no: string; title: string; question: string}> = ({beat, until, no, title, question}) => {
  const {span, p} = useT();
  const o = span(beat, until, 8);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={0} y={130} width={1920} height={790} fill={C.ground} />
      <Txt x={960} y={430} anchor="middle" mono size={52} color={C.clayInk}>
        {no}
      </Txt>
      <Txt x={960} y={530} anchor="middle" size={52}>
        {title}
      </Txt>
      <RLine x1={800} y1={562} x2={1120} y2={562} stroke={C.clay} sw={3} roughness={0.6} draw={p(beat, 4, 16)} />
      <Txt x={960} y={630} anchor="middle" size={32} color={C.ink2}>
        {question}
      </Txt>
    </g>
  );
};
