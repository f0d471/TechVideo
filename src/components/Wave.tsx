import React from 'react';
import {C, F} from '../core/theme';
import {RPath} from '../core/rough';
import {Txt} from './Prims';

// 时序图：几条信号随时间怎样变，时间从左往右，单位是拍（docs/standards/visual.md 第七节）。
// 时钟的上升沿落在整数时刻，前半拍为 1、后半拍为 0；一位的信号画成高低电平，多位的信号画成
// 一段一段的六边形，段里写值，值为 '?' 的段是还在变、读出来不能用的时候。
// 每条信号按整拍切成小段各画一笔，upTo 之前的段依次描出来，几何不随进度变，所以不会抖

export type WaveGeom = {x0: number; t0: number; t1: number; unit: number; y0: number; rowH: number; amp: number};

// x0 是时刻 t0 的横坐标；第 i 条信号的高电平在 y0 + i * rowH，低电平再往下 amp
export const waveGeom = (o: {x0: number; t0?: number; t1: number; unit: number; y0: number; rowH?: number; amp?: number}): WaveGeom => ({
  x0: o.x0,
  t0: o.t0 ?? 0,
  t1: o.t1,
  unit: o.unit,
  y0: o.y0,
  rowH: o.rowH ?? 110,
  amp: o.amp ?? 50,
});
export const waveX = (g: WaveGeom, t: number) => g.x0 + (t - g.t0) * g.unit;
export const waveTop = (g: WaveGeom, row: number) => g.y0 + row * g.rowH;
export const waveMid = (g: WaveGeom, row: number) => waveTop(g, row) + g.amp / 2;
export const waveBot = (g: WaveGeom, row: number) => waveTop(g, row) + g.amp;

export type WaveRow =
  | {kind: 'clock'; name: string; color?: string; ink?: string; o?: number}
  | {kind: 'bit'; name: string; v0: 0 | 1; edges?: {t: number; v: 0 | 1}[]; color?: string; ink?: string; o?: number}
  | {kind: 'bus'; name: string; segs: {t: number; v: string}[]; color?: string; ink?: string; o?: number; size?: number};

const SLOPE = 0.07; // 电平翻转、段与段交叉占的时间（拍）

const clamp = (v: number) => Math.max(0, Math.min(1, v));

// 一位信号在 [a, b) 里的电平路径；时钟按半拍翻转
const levelAt = (row: WaveRow, t: number): 0 | 1 => {
  if (row.kind === 'clock') return t - Math.floor(t) < 0.5 ? 1 : 0;
  if (row.kind === 'bit') {
    let v = row.v0;
    for (const e of row.edges ?? []) if (e.t <= t) v = e.v;
    return v;
  }
  return 0;
};
const flips = (row: WaveRow, a: number, b: number): number[] => {
  const out: number[] = [];
  if (row.kind === 'clock') {
    for (let k = Math.ceil(a * 2); k / 2 < b; k++) if (k / 2 > a) out.push(k / 2);
  } else if (row.kind === 'bit') {
    for (const e of row.edges ?? []) if (e.t > a && e.t < b) out.push(e.t);
  }
  return out;
};

const levelPiece = (g: WaveGeom, row: WaveRow, i: number, a: number, b: number, vIn: 0 | 1) => {
  const yOf = (v: 0 | 1) => (v ? waveTop(g, i) : waveBot(g, i));
  let v = levelAt(row, a);
  const pts: string[] = [`M${waveX(g, a)} ${yOf(vIn)}`, `L${waveX(g, a)} ${yOf(v)}`];
  for (const t of flips(row, a, b)) {
    const nv = levelAt(row, t);
    if (nv === v) continue;
    pts.push(`L${waveX(g, t)} ${yOf(v)}`, `L${waveX(g, t)} ${yOf(nv)}`);
    v = nv;
  }
  pts.push(`L${waveX(g, b)} ${yOf(v)}`);
  return pts.join(' ');
};

// 多位信号的一段：两头是交叉的尖角
const busPiece = (g: WaveGeom, i: number, a: number, b: number, openL: boolean, openR: boolean) => {
  const s = SLOPE * g.unit;
  const x1 = waveX(g, a);
  const x2 = waveX(g, b);
  const top = waveTop(g, i);
  const bot = waveBot(g, i);
  const mid = waveMid(g, i);
  const l = openL ? `M${x1} ${top} L${x2 - (openR ? 0 : s)} ${top}` : `M${x1} ${mid} L${x1 + s} ${top} L${x2 - (openR ? 0 : s)} ${top}`;
  const r = openR ? `L${x2} ${top} M${x2} ${bot}` : `L${x2} ${mid} L${x2 - s} ${bot}`;
  const back = openL ? `L${x1} ${bot}` : `L${x1 + s} ${bot} L${x1} ${mid}`;
  return `${l} ${r} ${back}`;
};

export const Wave: React.FC<{
  g: WaveGeom;
  rows: WaveRow[];
  upTo?: number; // 描到哪个时刻，缺省画满
  nameSize?: number;
  opacity?: number;
}> = ({g, rows, upTo = Infinity, nameSize = 26, opacity = 1}) => {
  if (opacity <= 0) return null;
  const shown = Math.min(upTo, g.t1);
  if (shown <= g.t0) return null;
  return (
    <g opacity={opacity} data-shot="wave">
      {rows.map((row, i) => {
        const color = row.color ?? (row.kind === 'clock' ? C.clay : C.ink2);
        const ink = row.ink ?? (row.kind === 'clock' ? C.clayInk : C.ink);
        const ro = row.o ?? 1;
        if (ro <= 0) return null;
        const name = (
          <Txt key="n" x={g.x0 - 22} y={waveMid(g, i) + nameSize * 0.36} anchor="end" size={nameSize} color={ink} opacity={clamp((shown - g.t0) * 3)}>
            {row.name}
          </Txt>
        );
        if (row.kind === 'bus') {
          const segs = row.segs.filter((s) => s.t < g.t1);
          return (
            <g key={i} opacity={ro}>
              {name}
              {segs.map((s, k) => {
                const a = Math.max(g.t0, s.t);
                const b = Math.min(g.t1, k + 1 < segs.length ? segs[k + 1].t : g.t1);
                if (b <= a) return null;
                const d = clamp((shown - a) / Math.max(0.3, b - a));
                if (d <= 0) return null;
                const unknown = s.v === '?';
                const path = busPiece(g, i, a, b, s.t <= g.t0, b >= g.t1);
                return (
                  <g key={k}>
                    {unknown && (
                      <path
                        d={`${busPiece(g, i, a, b, s.t <= g.t0, b >= g.t1)} Z`}
                        fill={C.band}
                        opacity={Math.min(1, d * 1.4)}
                      />
                    )}
                    <RPath d={path} stroke={color} sw={2.6} roughness={0.45} draw={d} />
                    {!unknown && s.v !== '' && (
                      <text
                        x={(waveX(g, a) + waveX(g, b)) / 2}
                        y={waveMid(g, i) + (row.size ?? 24) * 0.36}
                        textAnchor="middle"
                        fontFamily={F.mono}
                        fontSize={row.size ?? 24}
                        fill={ink}
                        style={{fontVariantLigatures: 'none'}}
                        opacity={clamp(d * 2 - 1)}
                      >
                        {s.v}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        }
        // 时钟与一位信号：每半拍一小段
        const pieces: [number, number][] = [];
        for (let a = g.t0; a < g.t1 - 1e-9; ) {
          const b = Math.min(g.t1, Math.floor(a * 2 + 1e-9) / 2 + 0.5);
          pieces.push([a, b]);
          a = b;
        }
        return (
          <g key={i} opacity={ro}>
            {name}
            {pieces.map(([a, b], k) => {
              const d = clamp((shown - a) / (b - a));
              if (d <= 0) return null;
              const vIn = k > 0 ? levelAt(row, a - 1e-6) : levelAt(row, a);
              return <RPath key={a} d={levelPiece(g, row, i, a, b, vIn)} stroke={color} sw={row.kind === 'clock' ? 2.8 : 2.6} roughness={0.45} draw={d} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

// 时序图上的一段时间窗：从 t1 到 t2 竖着铺一条淡色底，盖住 rowFrom 到 rowTo 几条信号，上方写名字。
// 建立时间、保持时间、延迟都用它标
export const WaveWindow: React.FC<{
  g: WaveGeom;
  t1: number;
  t2: number;
  rowFrom: number;
  rowTo: number;
  fill?: string;
  label?: string;
  ink?: string;
  size?: number;
  below?: boolean; // 名字写在下方
  opacity?: number;
}> = ({g, t1, t2, rowFrom, rowTo, fill = C.clayTint, label, ink = C.clayInk, size = 24, below = false, opacity = 1}) => {
  if (opacity <= 0) return null;
  const x1 = waveX(g, t1);
  const x2 = waveX(g, t2);
  const y1 = waveTop(g, rowFrom) - 14;
  const y2 = waveBot(g, rowTo) + 14;
  return (
    <g opacity={opacity}>
      <rect x={Math.min(x1, x2)} y={y1} width={Math.abs(x2 - x1)} height={y2 - y1} rx={4} fill={fill} opacity={0.75} />
      {label && (
        <Txt x={(x1 + x2) / 2} y={below ? y2 + size + 8 : y1 - 12} anchor="middle" size={size} color={ink}>
          {label}
        </Txt>
      )}
    </g>
  );
};
