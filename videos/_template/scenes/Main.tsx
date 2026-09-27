import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {Txt} from '../../../src/components/Prims';

// 画面进度一律由 beat 驱动：p(beat, 延迟, 时长) 返回 0→1，span(from, to) 返回淡入淡出的不透明度
export const Main: React.FC = () => {
  const {p} = useT();
  return (
    <Txt x={960} y={540} anchor="middle" size={40} color={C.ink} opacity={p('p01', 0, 14)} rise={p('p01', 0, 14)}>
      第一句旁白对应的画面
    </Txt>
  );
};
