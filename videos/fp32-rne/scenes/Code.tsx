import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine, RPath} from '../../../src/core/rough';
import {Chip, Txt} from '../../../src/components/Prims';
import {CODE, CodePanel, CodeSource} from '../../../src/components/CodePanel';
import {TransTable} from '../../../src/components/TransTable';
import {Src, Val, Wire, andPath, orPath} from '../../../src/components/Gates';
import codeJson from '../build/code.json';

const code = codeJson as CodeSource;

// 代码面板：源文件第 131–137 行（按 code.json 的行号对位，画面上不显示），逐行讲解 132–135
const Panel: React.FC = () => {
  const {p, span} = useT();
  // c12 调换 132..135 的顺序，c13 换回
  const swap = p('c12', 6, 24) * (1 - p('c13', 0, 20));
  const order: Record<number, number> = {132: 2, 133: 0, 134: 3, 135: 1};
  const rowY = (no: number) => {
    const base = CODE.row0 + (no - 131) * CODE.lh;
    if (!(no in order)) return base;
    return interpolate(swap, [0, 1], [base, CODE.row0 + (order[no] + 1) * CODE.lh]);
  };
  const many = span('c11', 'c13', 10);
  return (
    <CodePanel
      code={code}
      vis={p('c01', 6, 18)}
      frameDraw={p('c01', 0, 26)}
      lineIn={(i) => p('c01', 10 + i * 3, 12)}
      rowY={rowY}
      bands={[
        {no: 132, o: span('c02', 'c06', 10)},
        {no: 133, o: span('c06', 'c09', 10)},
        {no: 134, o: span('c09', 'c10', 10)},
        {no: 135, o: span('c10', 'c11', 10) + span('c13', 'c14', 10)},
        {no: 132, o: many},
        {no: 133, o: many},
        {no: 134, o: many},
        {no: 135, o: many},
        {no: 137, o: p('c14', 0, 10)},
      ]}
      underlines={[
        {no: 132, tok: 'guard_bit', color: C.clay, draw: p('c02', 30, 12), opacity: span('c02', 'c06')},
        {no: 132, tok: 'prod_n', color: C.ink2, draw: p('c03', 0, 12), opacity: span('c03', 'c04')},
        {no: 132, tok: '[22]', color: C.clay, draw: p('c03', 40, 12), opacity: span('c03', 'c06')},
        {no: 133, tok: '[21:0]', color: C.blue, draw: p('c06', 10, 12), opacity: span('c06', 'c07')},
        {no: 133, tok: '|', color: C.blue, draw: p('c07', 4, 10), opacity: span('c07', 'c09')},
        {no: 133, tok: 'sticky_bit', color: C.blue, draw: p('c08', 20, 12), opacity: span('c08', 'c09')},
        {no: 134, tok: 'mant_lsb', color: C.green, draw: p('c09', 4, 12), opacity: span('c09', 'c10')},
        {no: 134, tok: '[23]', color: C.green, draw: p('c09', 70, 12), opacity: span('c09', 'c10')},
        {no: 135, tok: '|', color: C.ink, draw: p('c10', 8, 10), opacity: span('c10', 'c11')},
        {no: 135, tok: '&', color: C.ink, draw: p('c10', 40, 10), opacity: span('c10', 'c11')},
        {no: 137, tok: 'round_up', color: C.clay, draw: p('c14', 10, 14)},
      ]}
    />
  );
};

// 逐词翻译：每讲一行换一组
const Translation: React.FC = () => {
  const {p, span} = useT();
  return (
    <TransTable
      vis={p('c02', 0, 14) * (1 - p('c14', 0, 12))}
      title="逐词翻译　代码 → 英文 → 中文"
      sets={[
        {
          o: span('c02', 'c06', 10),
          rows: [
            {code: 'wire', en: 'wire', zh: '导线', a: p('c02', 8, 12)},
            {code: 'guard_bit', en: 'guard bit', zh: '保护位', color: C.clayInk, a: p('c02', 34, 12)},
            {code: 'prod_n', en: 'product, normalized', zh: '规格化后的积', a: p('c03', 0, 12)},
            {code: '[22]', en: 'index 22', zh: '第 22 位', a: p('c03', 36, 12)},
          ],
        },
        {
          o: span('c06', 'c09', 10),
          rows: [
            {code: '[21:0]', en: 'bits 21 down to 0', zh: '第 21 到第 0 位', a: p('c06', 8, 12)},
            {code: '| 写在最前', en: 'reduction OR', zh: '一排线全部“或”', color: C.blueInk, a: p('c06', 6, 12)},
            {code: 'sticky_bit', en: 'sticky bit', zh: '粘滞位', color: C.blueInk, a: p('c06', 30, 12)},
          ],
        },
        {
          o: span('c09', 'c10', 10),
          rows: [
            {code: 'mant', en: 'mantissa', zh: '尾数', a: p('c09', 4, 12)},
            {code: 'lsb', en: 'least significant bit', zh: '最低位（末位）', color: C.greenInk, a: p('c09', 26, 12)},
          ],
        },
        {
          o: span('c10', 'c14', 10),
          rows: [
            {code: 'round_up', en: 'round up', zh: '向上舍：末位加一', color: C.clayInk, a: p('c10', 0, 12)},
            {code: '| 写在中间', en: 'OR', zh: '或', a: p('c10', 8, 12)},
            {code: '&', en: 'AND', zh: '与', a: p('c10', 40, 12)},
          ],
        },
      ]}
    />
  );
};

// 语法形状：wire 名字 = 来源 ;
const Shape: React.FC = () => {
  const {p, span} = useT();
  const o = span('c04', 'c06', 12);
  if (o <= 0) return null;
  const parts = [
    {t: 'wire', l: '导线', x: 150},
    {t: 'guard_bit', l: '名字', x: 290},
    {t: '=', l: '等号', x: 430},
    {t: 'prod_n[22]', l: '来源', x: 570},
    {t: ';', l: '分号', x: 720},
  ];
  return (
    <g opacity={o}>
      <RLine x1={112} y1={790} x2={860} y2={790} stroke={C.rule} sw={1.6} draw={p('c04', 0, 14)} />
      {parts.map((pt, i) => {
        const a = p('c04', 12 + i * 14, 12);
        return (
          <g key={i} opacity={a}>
            <Txt x={pt.x} y={836} anchor="middle" size={30} mono color={C.kw}>
              {pt.t}
            </Txt>
            <Txt x={pt.x} y={878} anchor="middle" size={24} color={C.muted}>
              {pt.l}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// 同形记号：| 写在最前与写在中间
const Trap: React.FC = () => {
  const {p, span} = useT();
  const o = span('c10', 'c14', 12) * p('c10', 60, 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <RLine x1={112} y1={790} x2={860} y2={790} stroke={C.rule} sw={1.6} />
      <Txt x={112} y={836} size={26} mono>
        |prod_n[21:0]
      </Txt>
      <Txt x={420} y={836} size={26} color={C.ink2}>
        写在最前：一排线全部“或”
      </Txt>
      <Txt x={112} y={880} size={26} mono>
        sticky_bit | mant_lsb
      </Txt>
      <Txt x={460} y={880} size={26} color={C.ink2}>
        写在中间：两根线“或”
      </Txt>
    </g>
  );
};

// 电路：随代码逐行长出来
const Circuit: React.FC = () => {
  const {p} = useT();
  const vis = p('c05', 0, 10);
  if (vis <= 0) return null;
  const v = (d: number) => p('c13', 30 + d, 10);
  return (
    <g opacity={vis}>
      {/* 保护位：第 22 位接出一根线 */}
      <Src y={580} w={64} label="[22]" fill={C.clayTint} stroke={C.clay} draw={p('c05', 0, 16)} />
      <Wire d="M1024 580 L1300 580" stroke={C.clay} draw={p('c05', 14, 18)} />
      <Txt x={1040} y={566} size={21} mono color={C.clayInk} opacity={p('c05', 26, 12)}>
        guard_bit
      </Txt>

      {/* 粘滞位：22 根线的总线进一个或门 */}
      <Src y={700} w={96} label="[21:0]" fill={C.blueTint} stroke={C.blue} draw={p('c06', 16, 16)} />
      <Wire d="M1056 700 L1164 700" stroke={C.blue} draw={p('c06', 30, 14)} sw={6} />
      <RLine x1={1098} y1={714} x2={1114} y2={686} stroke={C.blue} sw={2.2} draw={p('c06', 40, 8)} />
      <Txt x={1106} y={678} anchor="middle" size={18} mono color={C.blueInk} opacity={p('c06', 44, 10)}>
        22
      </Txt>
      <RPath d={orPath(1160, 660, 84, 80)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c07', 10, 20)} />
      <Txt x={1196} y={709} anchor="middle" size={24} opacity={p('c07', 26, 10)}>
        或
      </Txt>
      <Wire d="M1244 700 L1330 700" stroke={C.blue} draw={p('c08', 10, 14)} />
      <Txt x={1250} y={686} size={21} mono color={C.blueInk} opacity={p('c08', 20, 12)}>
        sticky_bit
      </Txt>

      {/* 末位：第 23 位接出一根线 */}
      <Src y={820} w={64} label="[23]" fill={C.greenTint} stroke={C.green} draw={p('c09', 60, 16)} />
      <Wire d="M1024 820 L1300 820" stroke={C.green} draw={p('c09', 72, 18)} />
      <Txt x={1040} y={806} size={21} mono color={C.greenInk} opacity={p('c09', 84, 12)}>
        mant_lsb
      </Txt>

      {/* 第四行：先或，再与 */}
      <Wire d="M1330 700 L1365 700 L1365 735 L1406 735" stroke={C.blue} draw={p('c10', 20, 12)} />
      <Wire d="M1300 820 L1380 820 L1380 785 L1406 785" stroke={C.green} draw={p('c10', 20, 12)} />
      <RPath d={orPath(1400, 710, 84, 100)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c10', 30, 18)} />
      <Txt x={1436} y={769} anchor="middle" size={24} opacity={p('c10', 44, 10)}>
        或
      </Txt>
      <Wire d="M1300 580 L1566 580 L1566 625 L1600 625" stroke={C.clay} draw={p('c10', 48, 16)} />
      <Wire d="M1484 760 L1540 760 L1540 675 L1600 675" stroke={C.ink2} draw={p('c10', 48, 16)} />
      <RPath d={andPath(1600, 600)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c10', 60, 18)} />
      <Txt x={1636} y={659} anchor="middle" size={24} opacity={p('c10', 74, 10)}>
        与
      </Txt>
      <RArrow x1={1680} y1={650} x2={1800} y2={650} stroke={C.ink} sw={2.6} draw={p('c10', 78, 14)} />
      <Txt x={1700} y={690} size={21} mono color={C.clayInk} opacity={p('c10', 86, 12)}>
        round_up
      </Txt>

      {/* 顺序调换，电路不变 */}
      <Txt x={1380} y={884} anchor="middle" size={28} color={C.ink2} opacity={p('c12', 40, 14) * (1 - p('c13', 0, 10))}>
        代码顺序变了，电路没变
      </Txt>

      {/* 例子的三个值流过电路 */}
      <Val x={1210} y={580} v={1} o={v(0)} />
      <Val x={1365} y={718} v={0} o={v(8)} />
      <Val x={1210} y={820} v={1} o={v(16)} />
      <Val x={1512} y={760} v={1} o={v(40)} />
      <Val x={1760} y={650} v={1} o={v(56)} />
    </g>
  );
};

export const Code: React.FC = () => {
  const {p} = useT();
  if (p('c01', 0, 1) <= 0) return null;
  return (
    <g>
      <Panel />
      <Translation />
      <Shape />
      <Trap />
      <Circuit />
      <Chip x={112} y={580} w={700} h={60} opacity={p('c14', 30, 12)} draw={p('c14', 30, 18)}>
        <Txt x={462} y={620} anchor="middle" size={28}>
          下一行：round_up 加到留下的 24 位上
        </Txt>
      </Chip>
    </g>
  );
};
