import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {Table} from '../../../src/components/Table';
import {Txt} from '../../../src/components/Prims';
import {Circuit, Gate, Val, Wire, gate, wire} from '../../../src/components/Gates';
import {Fp32, Overview, Tag} from './Kit';

// p30–p32：例子的值流过三路，三个中间结果；零、无穷、NaN 另走一行
const Merge: React.FC = () => {
  const {p, span} = useT();
  const o = span('p30', 'k03', 12);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Overview draw={p('p30', 0, 30)} inVals={p('p30', 20, 14)} outVals={p('p30', 50, 14)} special={p('p32', 20, 24)} />
      <Txt x={1100} y={210} anchor="middle" size={30} color={C.ink2} opacity={p('p31', 0, 14)}>
        三个都是中间结果：还没规格化，也没舍入
      </Txt>
    </g>
  );
};

// p33–p35：特殊编码不能当成 1.x 去乘；两种情况的结果都是 NaN，编码 7FC00000
const Cases: React.FC = () => {
  const {p, span} = useT();
  const o = span('p33', 'p36', 14);
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <Table
        cx={540}
        y={260}
        colW={[160, 190, 220]}
        header={['', '阶码 E', '小数位 F']}
        headColors={[undefined, C.clayInk, C.blueInk]}
        draw={p('p33', 0, 16)}
        rows={[
          {cells: ['零', '全 0', '全 0'], o: p('p33', 10, 12)},
          {cells: ['无穷', '全 1', '全 0'], o: p('p33', 20, 12), hot: span('p34', 'p35', 12)},
          {cells: ['NaN', '全 1', '不全 0'], o: p('p33', 30, 12), hot: p('p35', 0, 12)},
        ]}
      />
      <Table
        cx={1370}
        y={260}
        colW={[330, 200]}
        header={['输入', '结果']}
        mono={[true, false]}
        draw={p('p34', 0, 16)}
        rows={[
          {cells: ['+∞ × +0', 'NaN'], o: p('p34', 10, 14)},
          {cells: ['NaN × 1.5', 'NaN'], o: p('p35', 0, 14)},
        ]}
      />
      <Fp32 hex="7FC00000" y={640} draw={p('p35', 50, 26)} label="两种情况都输出 7FC00000" />
    </g>
  );
};

// p36：选择器按「是不是特殊值」挑出写回的结果
const mx = gate('mux', 880, 380, 110, 240);
const Choose: React.FC = () => {
  const {p, span} = useT();
  const o = span('p36', 'p37', 14);
  if (o <= 0) return null;
  const v = p('p36', 50, 14);
  return (
    <Circuit opacity={o}>
      <Wire d={wire([{x: 420, y: mx.in1.y}, mx.in1])} stroke={C.ink2} draw={p('p36', 0, 16)} />
      <Txt x={420} y={mx.in1.y - 16} size={28} color={C.ink2} opacity={p('p36', 6, 12)}>
        三路算出的结果
      </Txt>
      <Wire d={wire([{x: 420, y: mx.in2.y}, mx.in2])} stroke={C.ink} draw={p('p36', 8, 16)} sw={2.6 + 1.6 * v} />
      <Txt x={420} y={mx.in2.y - 16} mono size={28} opacity={p('p36', 14, 12)}>
        7FC00000
      </Txt>
      <Gate kind="mux" x={880} y={380} w={110} h={240} draw={p('p36', 10, 18)} />
      <Txt x={900} y={mx.in1.y + 9} mono size={24} color={C.muted} opacity={p('p36', 24, 12)}>
        0
      </Txt>
      <Txt x={900} y={mx.in2.y + 9} mono size={24} color={C.muted} opacity={p('p36', 24, 12)}>
        1
      </Txt>
      <Wire d={wire([{x: mx.sel.x, y: 780}, mx.sel])} stroke={C.ink2} draw={p('p36', 20, 16)} />
      <Txt x={mx.sel.x} y={820} anchor="middle" size={28} color={C.ink2} opacity={p('p36', 26, 12)}>
        是不是特殊值
      </Txt>
      <Wire d={wire([mx.out, {x: 1440, y: mx.out.y}])} stroke={C.ink} draw={p('p36', 30, 16)} />
      <Txt x={1460} y={mx.out.y + 9} size={28} opacity={p('p36', 36, 12)}>
        写回的结果
      </Txt>
      <Val x={mx.sel.x} y={710} v={1} o={v} />
      <Tag x={1200} y={mx.out.y} text="7FC00000" o={p('p36', 64, 14)} />
    </Circuit>
  );
};

// p37–p38：整张结构图；按代码段的顺序依次点亮：符号异或、特殊值、尾数与阶码
const Bridge: React.FC = () => {
  const {p} = useT();
  const o = p('p37', 0, 14) * (1 - p('c01', 0, 12));
  if (o <= 0) return null;
  const step = (d: number) => p('p38', d, 12);
  const dim = (on: number) => 0.3 + 0.7 * on;
  const seq = p('p38', 0, 1);
  const s1 = seq > 0 ? step(0) * (1 - step(50)) : 1;
  const s2 = seq > 0 ? step(50) * (1 - step(100)) : 1;
  const s3 = seq > 0 ? step(100) : 1;
  return (
    <g opacity={o}>
      <Overview draw={p('p37', 0, 30)} special={p('p37', 10, 20)} rows={{S: dim(s1), X: dim(s2), E: dim(s3), M: dim(s3)}} />
    </g>
  );
};

export const Special: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p30') || f >= s('c01') + 14) return null;
  return (
    <g>
      <Merge />
      <Cases />
      <Choose />
      <Bridge />
    </g>
  );
};
