import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {Formula} from '../../../src/components/Formula';
import {Table} from '../../../src/components/Table';
import {Txt} from '../../../src/components/Prims';
import {bitCX} from '../../../src/components/Bits';
import {Circuit, Gate, Val, Wire, gate, wire} from '../../../src/components/Gates';
import {Fp32, STRIP_A, STRIP_B, g32} from './Kit';

// p07–p10：两个符号位从位串里取出来送进一扇门；正负规则写成表，再换成 0 和 1，这张表就是异或
const A_Y = STRIP_A;
const B_Y = STRIP_B;
const xg = gate('xor', 560, 520);
const IN_X = 300;

const Gate1: React.FC = () => {
  const {p} = useT();
  const fly = p('p07', 24, 30);
  const from = (y: number) => ({x: bitCX(g32(y), 31), y: y + g32(y).ch / 2});
  const at = (a: {x: number; y: number}, b: {x: number; y: number}) => ({x: a.x + (b.x - a.x) * fly, y: a.y + (b.y - a.y) * fly});
  const va = at(from(A_Y), {x: 390, y: xg.in1.y});
  const vb = at(from(B_Y), {x: 390, y: xg.in2.y});
  const named = p('p10', 0, 18);
  return (
    <Circuit opacity={p('p07', 10, 14)}>
      <Txt x={IN_X - 16} y={xg.in1.y + 9} anchor="end" mono size={28} color={C.greenInk}>
        sa
      </Txt>
      <Txt x={IN_X - 16} y={xg.in2.y + 9} anchor="end" mono size={28} color={C.greenInk}>
        sb
      </Txt>
      <Wire d={wire([{x: IN_X, y: xg.in1.y}, xg.in1])} stroke={C.green} draw={p('p07', 10, 16)} />
      <Wire d={wire([{x: IN_X, y: xg.in2.y}, xg.in2])} stroke={C.green} draw={p('p07', 10, 16)} />
      <Wire d={wire([xg.out, {x: 820, y: xg.out.y}])} stroke={C.green} draw={p('p07', 20, 16)} />
      <Txt x={836} y={xg.out.y + 9} mono size={28} color={C.greenInk} opacity={p('p07', 26, 12)}>
        s
      </Txt>
      <Txt x={xg.cx} y={xg.cy + 16} anchor="middle" size={44} color={C.muted} opacity={p('p07', 20, 12) * (1 - named)}>
        ?
      </Txt>
      <Gate kind="xor" x={560} y={520} label="异或" draw={named} stroke={C.green} />
      <Val x={va.x} y={va.y} v={0} o={p('p07', 20, 8)} />
      <Val x={vb.x} y={vb.y} v={0} o={p('p07', 20, 8)} />
      <Val x={740} y={xg.out.y} v={0} o={p('p10', 30, 12)} />
      <Formula x={xg.cx} y={730} size={44} terms="0 ⊕ 0 = 0" color={C.greenInk} opacity={p('p10', 40, 14)} />
    </Circuit>
  );
};

const Truth: React.FC = () => {
  const {p} = useT();
  const words = 1 - p('p09', 0, 14);
  const bits = p('p09', 0, 14);
  const same = p('p09', 0, 12) * (1 - p('p09', 70, 12));
  const diff = p('p09', 70, 12) * (1 - p('p10', 0, 12));
  const ex = p('p10', 30, 12);
  const hot = [Math.max(same, ex), same, diff, diff];
  const rowsOf = (cells: string[][]) => cells.map((c, i) => ({cells: c, o: p('p08', 10 + i * 10, 12), hot: hot[i]}));
  return (
    <g>
      <Table
        cx={1330}
        y={430}
        colW={[170, 170, 200]}
        header={['A', 'B', '积']}
        rows={rowsOf([['正', '正', '正'], ['负', '负', '正'], ['正', '负', '负'], ['负', '正', '负']])}
        draw={p('p08', 0, 16)}
        opacity={words}
      />
      <Table
        cx={1330}
        y={430}
        colW={[170, 170, 200]}
        header={['sa', 'sb', 's']}
        headColors={[C.greenInk, C.greenInk, C.greenInk]}
        mono={[true, true, true]}
        rows={rowsOf([['0', '0', '0'], ['1', '1', '0'], ['0', '1', '1'], ['1', '0', '1']])}
        opacity={bits}
      />
      <Txt x={1640} y={534} size={28} color={C.ink2} opacity={p('p09', 20, 12)}>
        相同 → 0
      </Txt>
      <Txt x={1640} y={678} size={28} color={C.ink2} opacity={p('p09', 80, 12)}>
        不同 → 1
      </Txt>
    </g>
  );
};

export const Sign: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p07') || f >= s('p11')) return null;
  return (
    <g opacity={1 - p('p11', 0, 12)}>
      <Fp32 hex="3F800001" y={A_Y} draw={p('p07', 0, 24)} focus={['S']} />
      <Fp32 hex="3FC00000" y={B_Y} draw={p('p07', 6, 24)} focus={['S']} />
      <Gate1 />
      <Truth />
    </g>
  );
};
