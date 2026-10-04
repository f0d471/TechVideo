import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RPath} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {Table} from '../../../src/components/Table';
import {Formula} from '../../../src/components/Formula';
import {CiteCard} from '../../../src/components/CiteCard';
import {Wave, waveGeom, waveX, waveTop, waveBot} from '../../../src/components/Wave';
import {Val} from '../../../src/components/Gates';

// 05 每拍一个结果 p61–p73：延迟 → 吞吐 → 启动间隔 → 有效信号。四组数的逐拍表格与有效信号的时序图

// 逐拍表格：列 = 第 1–6 拍，行 = 送进 / 第一级 / 第二级 / 出口。
// Table 只画框架与行名，组字母由这里逐拍叠加，才能一格一格出现
const COLW = [200, 160, 160, 160, 160, 160, 160];
const X0 = 300;
const T_Y = 280;
const ROW_H = 64;
const colCX = (i: number) => X0 + COLW.slice(0, i).reduce((a, b) => a + b, 0) + COLW[i] / 2;
const rowTxt = (k: number) => T_Y + 22 + k * ROW_H + 32 + 10.8;
const rowMid = (k: number) => rowTxt(k) - 10;

const Frame: React.FC<{draw: number}> = ({draw}) => (
  <Table
    cx={880}
    y={T_Y}
    colW={COLW}
    size={26}
    rowH={ROW_H}
    draw={draw}
    header={['', '第 1 拍', '第 2 拍', '第 3 拍', '第 4 拍', '第 5 拍', '第 6 拍']}
    rows={[
      {cells: ['送进', '', '', '', '', '', '']},
      {cells: ['第一级', '', '', '', '', '', '']},
      {cells: ['第二级', '', '', '', '', '', '']},
      {cells: ['出口', '', '', '', '', '', '']},
    ]}
  />
);

// 组字母：mono 一格一字；跨两格的放在两格中间
const Cell: React.FC<{x: number; k: number; t: string; o: number; color?: string}> = ({x, k, t, o, color = C.blue}) =>
  o > 0 ? (
    <Txt x={x} y={rowTxt(k)} anchor="middle" mono size={30} color={color} opacity={o}>
      {t}
    </Txt>
  ) : null;

// p61–p66：主表（启动间隔 1）
const Ledger: React.FC = () => {
  const {p} = useT();
  const o = p('p61', 0, 14) * (1 - p('p67', 0, 12));
  if (o <= 0) return null;
  const a = {x: colCX(1), y: rowMid(0)};
  const b = {x: colCX(2), y: rowMid(0)};
  const fill = p('p63', 0, 200); // p63 起四组连送，逐格出现
  const seg = (d0: number) => Math.min(1, Math.max(0, fill * 6 - d0));
  return (
    <g opacity={o}>
      <Frame draw={p('p61', 0, 22)} />
      {/* p61：第一组数沿对角线走两拍到出口（每一行都对齐到拍列） */}
      <Cell x={colCX(1)} k={0} t="A" o={p('p61', 20, 12)} />
      <Cell x={colCX(2)} k={1} t="A" o={p('p61', 50, 12)} />
      <Cell x={colCX(3)} k={2} t="A" o={p('p61', 70, 12)} />
      <Cell x={colCX(3)} k={3} t="A" o={p('p61', 100, 12)} color={C.clayInk} />
      <RPath
        d={`M${colCX(1)} ${rowMid(0)} L${colCX(2)} ${rowMid(1)} L${colCX(3)} ${rowMid(2)} L${colCX(3)} ${rowMid(3)}`}
        stroke={C.clay}
        sw={3}
        dash
        draw={p('p61', 90, 22)}
      />
      <Label cx={620} cy={548} text="延迟 2 拍" size={28} stroke={C.clay} color={C.clayInk} draw={p('p61', 130, 16)} />
      {/* p62：第二级处理前一组数的时候，第一级已经在算下一组 */}
      <g opacity={p('p62', 0, 14)}>
        <Cell x={colCX(3)} k={1} t="B" o={p('p62', 10, 12)} />
        <Cell x={colCX(4)} k={2} t="B" o={p('p62', 20, 12)} />
      </g>
      {/* p63：四组连送，逐格填满 */}
      <g opacity={p('p63', 0, 10)}>
        <Cell x={colCX(2)} k={0} t="B" o={seg(1)} />
        <Cell x={colCX(3)} k={0} t="C" o={seg(2)} />
        <Cell x={colCX(4)} k={0} t="D" o={seg(3)} />
        <Cell x={colCX(4)} k={1} t="C" o={seg(2.5)} />
        <Cell x={colCX(5)} k={1} t="D" o={seg(3.5)} />
        <Cell x={colCX(5)} k={2} t="C" o={seg(4)} />
        <Cell x={colCX(6)} k={2} t="D" o={seg(5)} />
      </g>
      {/* p65：出口从第三拍起每拍一个 */}
      <g opacity={p('p65', 0, 14)}>
        <Cell x={colCX(4)} k={3} t="B" o={p('p63', 0, 12)} color={C.clayInk} />
        <Cell x={colCX(5)} k={3} t="C" o={p('p63', 0, 12)} color={C.clayInk} />
        <Cell x={colCX(6)} k={3} t="D" o={p('p63', 0, 12)} color={C.clayInk} />
        <RPath
          d={`M${colCX(3)} ${rowMid(3) - 34} L${colCX(3)} ${rowMid(3) - 46} L${colCX(6)} ${rowMid(3) - 46} L${colCX(6)} ${rowMid(3) - 34}`}
          stroke={C.green}
          sw={2.4}
          draw={p('p65', 20, 18)}
        />
        <Txt x={(colCX(3) + colCX(6)) / 2} y={200} anchor="middle" size={28} color={C.greenInk} opacity={p('p65', 40, 14)}>
          从第三拍起，每一拍都有一个结果，这就是吞吐
        </Txt>
      </g>
      {/* p66：相邻两组之间隔 1 拍 */}
      <g opacity={p('p66', 0, 14)}>
        <RArrow x1={a.x + 22} y1={a.y - 18} x2={b.x - 22} y2={b.y - 18} lift={-14} stroke={C.green} sw={2.6} draw={p('p66', 10, 18)} />
        <Txt x={(a.x + b.x) / 2} y={258} anchor="middle" size={26} color={C.greenInk} opacity={p('p66', 30, 14)}>
          间隔 1 拍
        </Txt>
        <Formula
          x={1460}
          y={690}
          size={40}
          terms={[
            {t: '启动间隔 II = 1', color: C.greenInk, o: p('p66', 60, 30)},
          ]}
        />
      </g>
    </g>
  );
};

// p64：四组数与前几集的结果对上
const Legend: React.FC = () => {
  const {p} = useT();
  const o = p('p64', 0, 14) * (1 - p('p65', 0, 12));
  if (o <= 0) return null;
  const rows = [
    ['A', '3F800001 × 3FC00000', '3FC00002'],
    ['B', '3FC00000 × 3FC00000', '40100000'],
    ['C', '7F7FFFFE × 3F800001', '7F800000'],
    ['D', '00800000 × 3F000000', '00000000'],
  ];
  return (
    <g opacity={o}>
      {rows.map(([n, in2, out], i) => (
        <g key={n} opacity={p('p64', 10 + i * 24, 14)}>
          <Txt x={330} y={660 + i * 56} mono size={28} color={C.blueInk}>
            {n}
          </Txt>
          <Txt x={390} y={660 + i * 56} mono size={28}>
            {in2}
          </Txt>
          <Txt x={1030} y={660 + i * 56} mono size={28} color={C.ink2}>
            →
          </Txt>
          <Txt x={1090} y={660 + i * 56} mono size={28} color={C.clayInk}>
            {out}
          </Txt>
        </g>
      ))}
      <Txt x={330} y={610} size={26} color={C.ink2} opacity={p('p64', 0, 12)}>
        四组数都是前几集的例子，出口是那几集算出的结果
      </Txt>
    </g>
  );
};

// p67–p68：启动间隔为 2：隔一拍才收下一组，同一组占两拍
const Ledger2: React.FC = () => {
  const {p} = useT();
  const o = p('p67', 0, 14) * (1 - p('p69', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g opacity={1 - p('p68', 0, 12)}>
        <Frame draw={p('p67', 0, 22)} />
        <Cell x={colCX(1)} k={0} t="A" o={p('p67', 20, 12)} />
        <Cell x={colCX(3)} k={0} t="B" o={p('p67', 40, 12)} />
        <Cell x={colCX(5)} k={0} t="C" o={p('p67', 60, 12)} />
        <Cell x={colCX(2)} k={1} t="A" o={p('p67', 30, 12)} />
        <Cell x={colCX(4)} k={1} t="B" o={p('p67', 50, 12)} />
        <Cell x={colCX(6)} k={1} t="C" o={p('p67', 70, 12)} />
        <Cell x={colCX(3)} k={2} t="A" o={p('p67', 40, 12)} />
        <Cell x={colCX(5)} k={2} t="B" o={p('p67', 60, 12)} />
        <Cell x={colCX(6)} k={2} t="C" o={p('p67', 80, 12)} />
        <Cell x={colCX(3)} k={3} t="A" o={p('p67', 50, 12)} color={C.clayInk} />
        <Cell x={colCX(5)} k={3} t="B" o={p('p67', 70, 12)} color={C.clayInk} />
        <RArrow x1={colCX(1) + 22} y1={rowMid(0) - 18} x2={colCX(3) - 22} y2={rowMid(0) - 18} lift={-14} stroke={C.green} sw={2.6} draw={p('p67', 90, 18)} />
        <Txt x={(colCX(1) + colCX(3)) / 2} y={240} anchor="middle" size={26} color={C.greenInk} opacity={p('p67', 110, 14)}>
          隔 1 拍才收下一组
        </Txt>
        <Txt x={960} y={T_Y + 22 + 4 * ROW_H + 80} anchor="middle" size={28} color={C.ink2} opacity={p('p67', 130, 14)}>
          一组数分两拍用同一套电路
        </Txt>
      </g>
      <CiteCard
        b={{x: 380, y: 280, w: 1160, h: 250}}
        year="2020"
        who="AMD · Xilinx"
        venue="Floating-Point Operator 产品指南"
        title="隔一拍收一组，用的资源大约少一半"
        draw={p('p68', 0, 22)}
      />
    </g>
  );
};

// p69：推理芯片要每拍都交一个结果，所以启动间隔为一
const Recap: React.FC = () => {
  const {p} = useT();
  const o = p('p69', 0, 14) * (1 - p('p70', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Formula
        x={960}
        y={400}
        size={52}
        terms={[
          {t: '启动间隔 = 1', color: C.greenInk, o: p('p69', 10, 30)},
        ]}
      />
      <Txt x={960} y={540} anchor="middle" size={32} opacity={p('p69', 60, 16)}>
        推理芯片要每一拍都交出一个结果
      </Txt>
      <Txt x={960} y={620} anchor="middle" size={32} opacity={p('p69', 100, 16)}>
        所以乘法器做成流水线
      </Txt>
    </g>
  );
};

// p70–p73：有效信号跟着数据一级一级往下走；出口的有效信号是一，结果才算数
const VALID_G = {x0: 430, unit: 165, y0: 250, rowH: 128, amp: 44};
const ValidWave: React.FC = () => {
  const {p} = useT();
  const o = p('p70', 0, 14);
  if (o <= 0) return null;
  const g = waveGeom({x0: VALID_G.x0, t1: 8, unit: VALID_G.unit, y0: VALID_G.y0, rowH: VALID_G.rowH, amp: VALID_G.amp});
  const upTo = p('p70', 0, 30) * 3.2 + p('p71', 0, 30) * 2 + p('p72', 0, 30) * 1.4 + p('p73', 0, 30) * 1.4;
  return (
    <g opacity={o}>
      <Wave
        g={g}
        nameSize={24}
        rows={[
          {kind: 'clock', name: '时钟'},
          {kind: 'bit', name: '送进', v0: 0, edges: [{t: 1, v: 1}, {t: 5, v: 0}], color: C.green, ink: C.greenInk},
          {kind: 'bit', name: '第一级', v0: 0, edges: [{t: 2, v: 1}, {t: 6, v: 0}], color: C.green, ink: C.greenInk},
          {kind: 'bit', name: '出口', v0: 0, edges: [{t: 3, v: 1}, {t: 7, v: 0}], color: C.green, ink: C.greenInk},
          {
            kind: 'bus',
            name: '出口的值',
            segs: [{t: 0, v: ''}, {t: 3, v: '3FC00002'}, {t: 4, v: '40100000'}, {t: 5, v: '7F800000'}, {t: 6, v: '00000000'}, {t: 7, v: ''}],
            size: 20,
            color: C.blue,
            ink: C.blueInk,
          },
        ]}
        upTo={0.5 + upTo}
      />
      <Txt x={960} y={200} anchor="middle" size={28} color={C.ink2} opacity={p('p70', 30, 14) * (1 - p('p72', 0, 12))}>
        出口每一拍都有一个值，哪一拍是真的结果
      </Txt>
      <Txt x={960} y={200} anchor="middle" size={28} color={C.greenInk} opacity={p('p73', 30, 14)}>
        四组送完，零也跟着往下走，两拍以后出口落回零
      </Txt>
      <Txt x={960} y={240} anchor="middle" size={28} color={C.greenInk} opacity={p('p72', 40, 14) * (1 - p('p73', 0, 12))}>
        有效信号是一的这几拍，出口的结果才算数
      </Txt>
      <RPath
        d={`M${waveX(g, 3)} ${waveTop(g, 3) - 18} L${waveX(g, 3)} ${waveTop(g, 3) - 30} L${waveX(g, 7)} ${waveTop(g, 3) - 30} L${waveX(g, 7)} ${waveTop(g, 3) - 18}`}
        stroke={C.green}
        sw={2.4}
        draw={p('p72', 20, 18)}
      />
      <g opacity={p('p73', 0, 14)}>
        <Val x={waveX(g, 5.3)} y={waveBot(g, 1)} v={0} o={p('p73', 20, 12)} color={C.muted} />
        <Val x={waveX(g, 7.3)} y={waveBot(g, 3)} v={0} o={p('p73', 50, 12)} color={C.muted} />
      </g>
    </g>
  );
};

export const Flow: React.FC = () => {
  const {f, s} = useT();
  if (f < s('k05') || f >= s('k06')) return null;
  return (
    <g>
      <Ledger />
      <Legend />
      <Ledger2 />
      <Recap />
      <ValidWave />
    </g>
  );
};
