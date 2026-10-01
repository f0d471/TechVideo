import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse} from '../../../src/core/rough';
import {Table, TableRow} from '../../../src/components/Table';
import {BitLook, Bits, bitCX, bitsGeom} from '../../../src/components/Bits';
import {Label} from '../../../src/components/Label';
import {Txt} from '../../../src/components/Prims';

// p23–p28：三种写法汇成一张表，符号位一路跟到底；结尾淡出，准备进代码段
const G = bitsGeom(32, 690, {pitch: 40});

const letterLook = (bit: number): BitLook => {
  if (bit === 31) return {fill: C.greenTint, stroke: C.green, text: C.greenInk};
  if (bit >= 23) return {fill: C.clayTint, stroke: C.clay, text: C.clayInk};
  return {fill: C.blueTint, stroke: C.blue, text: C.blueInk};
};
const infLook = (bit: number): BitLook => {
  if (bit === 31) return {fill: C.greenTint, stroke: C.green, text: C.greenInk};
  if (bit >= 23) return {fill: C.clayTint, stroke: C.clay, text: C.clayInk};
  return {stroke: C.ink2, text: C.muted};
};
const zeroLook = (bit: number): BitLook =>
  bit === 31 ? {fill: C.greenTint, stroke: C.green, text: C.greenInk} : {stroke: C.ink2, text: C.muted};

export const Select: React.FC = () => {
  const {f, s, p} = useT();
  if (f < s('p23') || f >= s('c01')) return null;
  const dim = 1 - 0.65 * p('p28', 0, 14);
  const chips = p('p23', 0, 14) * (1 - p('p24', 0, 12));
  const lettersO = p('p24', 0, 12) * (1 - p('p25', 0, 10));
  const infO = p('p25', 0, 12) * (1 - p('p26', 0, 10));
  const zeroO = p('p26', 0, 12);
  const hot1 = p('p24', 8, 14) * (1 - p('p25', 0, 10));
  const hot2 = p('p25', 8, 14) * (1 - p('p26', 0, 10));
  const hot3 = p('p26', 8, 14);
  const rows: TableRow[] = [
    {cells: ['1…254', '正常写回', 'S、E、F 各归各位'], o: p('p24', 8, 14), hot: hot1, colors: [C.clayInk, C.ink, C.ink2]},
    {cells: ['≥ 255', '±∞', '阶码全 1，小数位全 0'], o: p('p25', 8, 14), hot: hot2, colors: [C.clayInk, C.ink, C.ink2]},
    {cells: ['≤ 0', '±0（冲零）', '只有符号位'], o: p('p26', 8, 14), hot: hot3, colors: [C.clayInk, C.ink, C.ink2]},
  ];
  return (
    <g>
      <g opacity={chips}>
        <Label cx={610} cy={250} text="正常" size={34} draw={p('p23', 0, 14)} />
        <Label cx={960} cy={250} text="±∞" size={34} draw={p('p23', 8, 14)} />
        <Label cx={1310} cy={250} text="±0" size={34} draw={p('p23', 16, 14)} />
      </g>
      <g opacity={dim}>
        <Table cx={960} y={400} colW={[260, 300, 460]} header={['阶码', '写法', '编码']} rows={rows} size={30} rowH={68} draw={p('p24', 0, 16)} mono={[true, false, false]} />
        <g opacity={lettersO}>
          <Bits g={G} bits={'S' + 'E'.repeat(8) + 'F'.repeat(23)} draw={p('p24', 10, 20)} look={letterLook} />
          <Txt x={960} y={800} anchor="middle" size={26} color={C.ink2} opacity={p('p24', 26, 12)}>
            符号、阶码、小数位各归各位
          </Txt>
        </g>
        <g opacity={infO}>
          <Bits g={G} bits={'S' + '1'.repeat(8) + '0'.repeat(23)} draw={1} look={infLook} />
          <Txt x={960} y={800} anchor="middle" size={26} color={C.ink2} opacity={p('p25', 16, 12)}>
            阶码全 1，小数位全 0
          </Txt>
        </g>
        <g opacity={zeroO}>
          <Bits g={G} bits={'S' + '0'.repeat(8) + '0'.repeat(23)} draw={1} look={zeroLook} />
          <Txt x={960} y={800} anchor="middle" size={26} color={C.ink2} opacity={p('p26', 16, 12)}>
            只剩符号位
          </Txt>
        </g>
        <REllipse cx={bitCX(G, 31)} cy={G.y + G.ch / 2} w={64} h={72} stroke={C.green} sw={3} draw={p('p27', 0, 18)} opacity={p('p27', 0, 18) * dim} />
      </g>
      <Txt x={960} y={860} anchor="middle" size={34} opacity={p('p28', 0, 16)}>
        写成硬件描述语言
      </Txt>
    </g>
  );
};
