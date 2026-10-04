import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Unit, Val, Wire, wire, unitPorts, Circuit} from '../../../src/components/Gates';
import {Wave, waveGeom} from '../../../src/components/Wave';
import {StepChain} from './Kit';

// 开场 p01–p03：一排乘法器跟着时钟每拍交一个结果 → 前五集的一次乘法是一条连线和门的长路 → 问题

// p01：推理芯片里塞满乘法器，跟着同一个时钟，每拍收一组新数、交出一个结果
const Many: React.FC = () => {
  const {p} = useT();
  const o = p('p01', 0, 16) * (1 - p('p02', 0, 14));
  if (o <= 0) return null;
  const ys = [560, 730];
  const xs = [600, 960, 1320];
  const g = waveGeom({x0: 250, t1: 6, unit: 250, y0: 250});
  return (
    <g opacity={o}>
      <Wave g={g} rows={[{kind: 'clock', name: '时钟'}]} upTo={1.2 + p('p01', 6, 200) * 4.8} />
      <Circuit opacity={1}>
        {ys.map((y, r) =>
          xs.map((x, cI) => {
            const k = r * 3 + cI;
            const o1 = p('p01', 16 + k * 5, 12);
            const u = unitPorts(x, y, 40);
            return (
              <g key={`${r}-${cI}`}>
                <Wire d={wire([{x: x - 130, y}, u.left])} stroke={C.ink2} draw={o1} />
                <Wire d={wire([u.right, {x: x + 130, y}])} stroke={C.ink2} draw={o1} />
                <Unit cx={x} cy={y} sym="×" r={40} draw={o1} />
                <Val x={x + 162} y={y} v={1} o={o1 * p('p01', 70, 50)} color={C.blue} />
              </g>
            );
          }),
        )}
      </Circuit>
      <Txt x={960} y={215} anchor="middle" size={28} color={C.ink2} opacity={p('p01', 60, 14)}>
        每一个乘法器，每一拍，都要交出一个结果
      </Txt>
    </g>
  );
};

// p02–p03：前五集的一次乘法是一条连线和门的长路；路很长，一拍很短
const LongRoad: React.FC = () => {
  const {p} = useT();
  const o = p('p02', 0, 16);
  if (o <= 0) return null;
  const ask = p('p03', 0, 14);
  return (
    <g opacity={o}>
      <StepChain draw={p('p02', 0, 30)} />
      <Txt x={960} y={620} anchor="middle" size={28} color={C.ink2} opacity={p('p02', 20, 14) * (1 - p('p03', 0, 12))}>
        数一送进来，就一路算到出口
      </Txt>
      <g opacity={ask}>
        <RArrow x1={170} y1={560} x2={1750} y2={560} lift={-70} stroke={C.clay} sw={3.4} draw={p('p03', 6, 20)} />
        <Txt x={960} y={230} anchor="middle" size={30} color={C.clayInk} opacity={p('p03', 20, 14)}>
          这条路很长，一拍的时间却很短
        </Txt>
        <Txt x={960} y={300} anchor="middle" size={38} opacity={p('p03', 40, 16)}>
          一次乘法怎样每一拍都交出一个结果
        </Txt>
      </g>
    </g>
  );
};

export const Opening: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p01') || f >= s('k01')) return null;
  return (
    <g>
      <Many />
      <LongRoad />
    </g>
  );
};
