import React from 'react';
import {C} from '../core/theme';
import {RRect} from '../core/rough';
import {Txt} from './Prims';

// 引用卡：作者、年份、出处排在一张纸面卡片上，加一句原文与中文结论
// （docs/standards/visual.md 第七节；从第 1 集的 scenes/Kit.tsx 提取共享）
export type CiteBox = {x: number; y: number; w: number; h: number};

export const CiteCard: React.FC<{
  b: CiteBox;
  year: string;
  who: string;
  venue: string;
  title: string;
  quote?: string;
  quoteZh?: string;
  draw: number;
  opacity?: number;
}> = ({b, year, who, venue, title, quote, quoteZh, draw, opacity = 1}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const t = Math.max(0, draw * 2 - 1);
  // 年份用等宽 30 号：ASCII 每字 18，汉字每字 30
  const yearW = [...year].reduce((w, ch) => w + (/[ -~]/.test(ch) ? 18 : 30), 0);
  return (
    <g opacity={opacity} data-shot="cite">
      <RRect x={b.x} y={b.y} w={b.w} h={b.h} stroke={C.ink2} fill={C.paper} sw={2} roughness={0.7} draw={draw} />
      <g opacity={t}>
        <rect x={b.x + 24} y={b.y + 26} width={6} height={b.h - 52} rx={3} fill={C.clay} />
        <Txt x={b.x + 52} y={b.y + 62} mono size={30} color={C.clayInk}>
          {year}
        </Txt>
        <Txt x={b.x + 52 + yearW + 22} y={b.y + 62} size={26} color={C.ink2}>
          {`${who} · ${venue}`}
        </Txt>
        <Txt x={b.x + 52} y={b.y + 110} size={28} color={C.ink}>
          {title}
        </Txt>
        {quote && (
          <Txt x={b.x + 52} y={b.y + 164} size={24} color={C.ink2}>
            {quote}
          </Txt>
        )}
        {quoteZh && (
          <Txt x={b.x + 52} y={b.y + (quote ? 206 : 164)} size={28} color={C.ink}>
            {quoteZh}
          </Txt>
        )}
      </g>
    </g>
  );
};
