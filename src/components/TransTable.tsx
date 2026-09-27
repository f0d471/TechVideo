import React from 'react';
import {C} from '../core/theme';
import {Txt} from './Prims';

// 逐词翻译表：代码 → 英文 → 中文。每组行由调用方按 beat 给出整组不透明度 o 与每行出现进度 a
export type TransRow = {code: string; en: string; zh: string; color?: string; a: number};
export type TransSet = {o: number; rows: TransRow[]};

export const TransTable: React.FC<{vis: number; title: string; sets: TransSet[]}> = ({vis, title, sets}) => {
  if (vis <= 0) return null;
  return (
    <g opacity={vis}>
      <Txt x={112} y={540} size={24} color={C.muted}>
        {title}
      </Txt>
      {sets.map((set, si) => {
        if (set.o <= 0) return null;
        return (
          <g key={si} opacity={set.o}>
            {set.rows.map((r, i) => {
              const a = r.a;
              const y = 596 + i * 52;
              return (
                <g key={i} opacity={a}>
                  <Txt x={112} y={y + (1 - a) * 10} size={27} mono color={C.ink}>
                    {r.code}
                  </Txt>
                  <Txt x={318} y={y + (1 - a) * 10} size={25} color={C.muted}>
                    →
                  </Txt>
                  <Txt x={352} y={y + (1 - a) * 10} size={26} color={C.ink2}>
                    {r.en}
                  </Txt>
                  <Txt x={624} y={y + (1 - a) * 10} size={25} color={C.muted}>
                    →
                  </Txt>
                  <Txt x={658} y={y + (1 - a) * 10} size={28} color={r.color ?? C.ink}>
                    {r.zh}
                  </Txt>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};
