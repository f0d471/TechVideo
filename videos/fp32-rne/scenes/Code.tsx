import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow, RLine, RPath} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {CodePanel, codeSnippet} from '../../../src/components/CodePanel';
import {Src, Val, Wire, andPath, orPath} from '../../../src/components/Gates';
import codeJson from '../build/code.json';

const code = codeSnippet(codeJson, 'rne');

// c01–c08：逐字代码在上；三根输入线与两级门占满下方结构区
const Panel: React.FC = () => {
  const {p, span} = useT();
  return (
    <CodePanel
      code={code}
      vis={p('c01', 6, 18)}
      frameDraw={p('c01', 0, 26)}
      lineIn={(i) => p('c01', 10 + i * 3, 12)}
      bands={[
        {no: 132, o: span('c02', 'c03', 10)},
        {no: 134, o: span('c02', 'c03', 10)},
        {no: 133, o: span('c03', 'c04', 10)},
        {no: 135, o: span('c04', 'c07', 10)},
        {no: 137, o: p('c07', 0, 12)},
      ]}
      underlines={[
        {no: 132, tok: 'prod_n[22]', color: C.clay, draw: p('c02', 8, 14), opacity: span('c02', 'c03')},
        {no: 134, tok: 'prod_n[23]', color: C.green, draw: p('c02', 20, 14), opacity: span('c02', 'c03')},
        {no: 133, tok: '|prod_n[21:0]', color: C.blue, draw: p('c03', 10, 16), opacity: span('c03', 'c04')},
        {no: 135, tok: 'sticky_bit | mant_lsb', color: C.blue, draw: p('c04', 0, 16), opacity: span('c04', 'c07')},
        {no: 135, tok: 'guard_bit &', color: C.clay, draw: p('c04', 24, 16), opacity: span('c04', 'c07')},
        {no: 137, tok: 'round_up', color: C.clay, draw: p('c07', 10, 16)},
      ]}
    />
  );
};

// 信号从左到右；先接出 G、L，再把低位合并为 S，最后经过或门、与门
const Circuit: React.FC = () => {
  const {p, span} = useT();
  const o = p('c02', 0, 12);
  if (o <= 0) return null;
  const first = (d: number) => p('c05', 16 + d, 10) * (1 - p('c06', 0, 12));
  const second = (d: number) => p('c06', 16 + d, 10);
  return (
    <g opacity={o}>
      <Src y={580} w={64} label="[22]" fill={C.clayTint} stroke={C.clay} draw={p('c02', 0, 16)} />
      <Wire d="M1024 580 L1300 580" stroke={C.clay} draw={p('c02', 12, 18)} />
      <Txt x={1040} y={566} size={21} mono color={C.clayInk} opacity={p('c02', 24, 12)}>
        guard_bit
      </Txt>

      <Src y={820} w={64} label="[23]" fill={C.greenTint} stroke={C.green} draw={p('c02', 18, 16)} />
      <Wire d="M1024 820 L1300 820" stroke={C.green} draw={p('c02', 30, 18)} />
      <Txt x={1040} y={806} size={21} mono color={C.greenInk} opacity={p('c02', 38, 12)}>
        mant_lsb
      </Txt>

      <Src y={700} w={96} label="[21:0]" fill={C.blueTint} stroke={C.blue} draw={p('c03', 0, 16)} />
      <Wire d="M1056 700 L1164 700" stroke={C.blue} draw={p('c03', 12, 14)} sw={6} />
      <RLine x1={1098} y1={714} x2={1114} y2={686} stroke={C.blue} sw={2.2} draw={p('c03', 20, 8)} />
      <Txt x={1106} y={678} anchor="middle" size={18} mono color={C.blueInk} opacity={p('c03', 26, 10)}>
        22
      </Txt>
      <RPath d={orPath(1160, 660, 84, 80)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c03', 20, 20)} />
      <Txt x={1196} y={709} anchor="middle" size={24} opacity={p('c03', 34, 10)}>
        或
      </Txt>
      <Wire d="M1244 700 L1330 700" stroke={C.blue} draw={p('c03', 32, 14)} />
      <Txt x={1250} y={686} size={21} mono color={C.blueInk} opacity={p('c03', 40, 12)}>
        sticky_bit
      </Txt>

      <Wire d="M1330 700 L1365 700 L1365 735 L1406 735" stroke={C.blue} draw={p('c04', 0, 12)} />
      <Wire d="M1300 820 L1380 820 L1380 785 L1406 785" stroke={C.green} draw={p('c04', 0, 12)} />
      <RPath d={orPath(1400, 710, 84, 100)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c04', 8, 18)} />
      <Txt x={1436} y={769} anchor="middle" size={24} opacity={p('c04', 22, 10)}>
        或
      </Txt>
      <Wire d="M1300 580 L1566 580 L1566 625 L1600 625" stroke={C.clay} draw={p('c04', 22, 16)} />
      <Wire d="M1484 760 L1540 760 L1540 675 L1600 675" stroke={C.ink2} draw={p('c04', 22, 16)} />
      <RPath d={andPath(1600, 600)} stroke={C.ink} fill={C.paper} sw={2.4} roughness={0.6} draw={p('c04', 34, 18)} />
      <Txt x={1636} y={659} anchor="middle" size={24} opacity={p('c04', 48, 10)}>
        与
      </Txt>
      <RArrow x1={1680} y1={650} x2={1800} y2={650} stroke={C.ink} sw={2.6} draw={p('c04', 52, 14)} />
      <Txt x={1700} y={690} size={21} mono color={C.clayInk} opacity={p('c04', 60, 12)}>
        round_up
      </Txt>

      <Val x={1210} y={580} v={1} o={p('c05', 12, 10)} />
      <Val x={1365} y={718} v={0} o={p('c05', 18, 10)} />
      <Val x={1210} y={820} v={1} o={first(8)} />
      <Val x={1512} y={760} v={1} o={first(18)} />
      <Val x={1760} y={650} v={1} o={first(28)} />
      <Val x={1210} y={820} v={0} o={second(8)} />
      <Val x={1512} y={760} v={0} o={second(18)} />
      <Val x={1760} y={650} v={0} o={second(28)} />

      <g opacity={span('c07', 'c08', 10)}>
        <RLine x1={420} y1={856} x2={1500} y2={856} stroke={C.rule} sw={1.6} draw={p('c07', 0, 14)} />
        <Txt x={960} y={898} anchor="middle" size={30} color={C.ink2}>
          保留的 24 位 ＋ round_up → 舍入后的尾数
        </Txt>
      </g>
      <Txt x={960} y={898} anchor="middle" size={30} color={C.ink2} opacity={p('c08', 0, 12)}>
        下一步：尾数进位、上溢、下溢
      </Txt>
    </g>
  );
};

export const Code: React.FC = () => {
  const {p} = useT();
  if (p('c01', 0, 1) <= 0) return null;
  return (
    <g>
      <Panel />
      <Circuit />
    </g>
  );
};
