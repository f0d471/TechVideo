import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {RArrow} from '../../../src/core/rough';
import {Txt} from '../../../src/components/Prims';
import {Label} from '../../../src/components/Label';
import {Axis, Span, axisX} from '../../../src/components/Axis';
import {Table} from '../../../src/components/Table';
import {Formula} from '../../../src/components/Formula';
import {CiteCard} from '../../../src/components/CiteCard';
import {StepChain} from './Kit';

// 03 流水线 p36–p51：插入一排寄存器 → 切口的位置 → 级数与频率 → 级数是设计自由度 → 业界的做法 → 演示用的两级

// p36–p37：在长路中间插一排寄存器，一条路切成两段；切之前一条长区间，切之后两条短区间
const StageCut: React.FC = () => {
  const {p} = useT();
  const o = p('p36', 0, 14) * (1 - p('p38', 0, 12));
  if (o <= 0) return null;
  const a = {x1: 190, x2: 1730, v1: 0, v2: 1, y: 660};
  const cut = p('p36', 40, 40);
  return (
    <g opacity={o}>
      <StepChain draw={p('p36', 0, 20)} cut={cut} />
      <g opacity={p('p37', 0, 14)}>
        <Label cx={486} cy={240} text="第一级" size={30} stroke={C.blue} color={C.blueInk} draw={p('p37', 6, 16)} />
        <Label cx={1276} cy={240} text="第二级" size={30} stroke={C.blue} color={C.blueInk} draw={p('p37', 14, 16)} />
      </g>
      <Axis a={a} ticks={[{v: 0}, {v: 1}]} draw={p('p36', 30, 18)} />
      <Span a={a} from={0} to={1} color={C.blue} ink={C.blueInk} label="切之前：一条长路" lift={44} size={26} draw={p('p36', 40, 22)} opacity={1 - p('p37', 0, 12)} />
      <Span a={a} from={0} to={0.5} color={C.blue} ink={C.blueInk} label="第一级" lift={44} size={26} draw={p('p37', 20, 20)} />
      <Span a={a} from={0.5} to={1} color={C.blue} ink={C.blueInk} label="第二级" lift={44} size={26} draw={p('p37', 34, 20)} />
      <Txt x={960} y={310} anchor="middle" size={30} opacity={p('p37', 60, 16)}>
        每一段夹在两排寄存器之间，一拍走完
      </Txt>
    </g>
  );
};

// p38–p40：切口要让各级差不多长，周期被最长的一级拖住；p40 厂商手册引用
const WhereToCut: React.FC = () => {
  const {p} = useT();
  const o = p('p38', 0, 14) * (1 - p('p41', 0, 12));
  if (o <= 0) return null;
  const flat = {x1: 220, x2: 1240, v1: 0, v2: 1, y: 400};
  const bias = {x1: 220, x2: 1240, v1: 0, v2: 1, y: 660};
  const dim = 1 - 0.7 * p('p40', 0, 14);
  return (
    <g opacity={o}>
      <g opacity={dim}>
        <Txt x={100} y={flat.y + 10} size={28} color={C.ink2} opacity={p('p38', 10, 14)}>
          切得平
        </Txt>
        <Axis a={flat} ticks={[{v: 0}, {v: 1}]} draw={p('p38', 6, 18)} />
        <Span a={flat} from={0} to={0.48} color={C.blue} lift={40} size={24} draw={p('p38', 14, 20)} />
        <Span a={flat} from={0.48} to={1} color={C.blue} lift={40} size={24} draw={p('p38', 24, 20)} />
        <Txt x={100} y={bias.y + 10} size={28} color={C.ink2} opacity={p('p38', 50, 14)}>
          切偏了
        </Txt>
        <Axis a={bias} ticks={[{v: 0}, {v: 1}]} draw={p('p38', 44, 18)} />
        <Span a={bias} from={0} to={0.28} color={C.blue} lift={40} size={24} draw={p('p38', 56, 20)} />
        <Span a={bias} from={0.28} to={1} color={C.clay} ink={C.clayInk} label="最慢的一级" lift={40} size={24} draw={p('p39', 0, 20)} />
        <RArrow x1={axisX(bias, 0)} y1={bias.y + 70} x2={axisX(bias, 1)} y2={bias.y + 70} lift={-30} stroke={C.clay} sw={2.6} draw={p('p39', 30, 20)} />
        <Txt x={960} y={240} anchor="middle" size={28} color={C.clayInk} opacity={p('p39', 50, 14)}>
          周期还是被长的那一级拖住
        </Txt>
        <Txt x={1300} y={flat.y - 40} size={28} color={C.ink2} opacity={p('p38', 40, 14)}>
          两级差不多长
        </Txt>
        <Txt x={1300} y={flat.y + 20} size={28} color={C.ink2} opacity={p('p38', 48, 14)}>
          周期最短
        </Txt>
        <Txt x={1300} y={bias.y - 130} size={28} color={C.ink2} opacity={p('p39', 80, 14)}>
          短的一级只能空等
        </Txt>
      </g>
      <CiteCard
        b={{x: 380, y: 260, w: 1160, h: 250}}
        year="2020"
        who="AMD · Xilinx"
        venue="Floating-Point Operator 产品指南"
        title="各级逻辑差不多时，少一排寄存器的代价"
        quoteZh="少一排寄存器，就有一级的逻辑接近翻倍，频率明显下降"
        draw={p('p40', 0, 22)}
      />
    </g>
  );
};

// p41–p43：级数越多周期越短，但寄存器的开销每级都要付，延迟拍数也变多
const FREQ_ROWS = [
  {name: '一级', y: 380, stages: 1, lat: '延迟 1 拍', cut: 0},
  {name: '两级', y: 560, stages: 2, lat: '延迟 2 拍', cut: 0},
  {name: '四级', y: 740, stages: 4, lat: '延迟 4 拍', cut: 0},
];
const axisN = (y: number) => ({x1: 300, x2: 1560, v1: 0, v2: 1, y});
const StagesFreq: React.FC = () => {
  const {p} = useT();
  const o = p('p41', 0, 14) * (1 - p('p44', 0, 12));
  if (o <= 0) return null;
  const draws = [p('p41', 0, 24), p('p41', 40, 24), p('p43', 0, 24)];
  return (
    <g opacity={o}>
      {FREQ_ROWS.map((r, i) => {
        const a = axisN(r.y);
        const seg = 1 / r.stages;
        const sp: React.ReactNode[] = [];
        for (let k = 0; k < r.stages; k++) {
          const late = i === 2 && k > 0 ? p('p43', 40, 14) : 1;
          sp.push(
            <Span key={k} a={a} from={k * seg} to={k * seg + seg * 0.1} color={C.clay} lift={40} size={22} draw={draws[i]} opacity={late} />,
          );
          sp.push(
            <Span key={`b${k}`} a={a} from={k * seg + seg * 0.1} to={(k + 1) * seg} color={C.blue} lift={40} size={22} draw={draws[i]} opacity={late} />,
          );
        }
        return (
          <g key={r.name}>
            <Txt x={180} y={r.y + 10} size={28} color={C.ink2} opacity={draws[i]}>
              {r.name}
            </Txt>
            <Axis a={a} ticks={[{v: 0}, {v: 1}]} draw={draws[i]} />
            {sp}
            <Txt x={1640} y={r.y + 10} size={26} color={C.ink2} opacity={draws[i]}>
              {r.lat}
            </Txt>
          </g>
        );
      })}
      <Txt x={960} y={240} anchor="middle" size={28} color={C.blueInk} opacity={p('p41', 60, 14)}>
        每级只剩大约一半的组合逻辑，周期可以缩短
      </Txt>
      <Txt x={960} y={310} anchor="middle" size={28} color={C.clayInk} opacity={p('p42', 0, 16) * (1 - p('p43', 0, 12))}>
        那两小段是寄存器的开销，每一级都要付一次，不会跟着切小
      </Txt>
      <Txt x={1400} y={310} size={26} color={C.ink2} opacity={p('p43', 60, 14)}>
        级数越多，等的拍数越多
      </Txt>
    </g>
  );
};

// p44–p46：级数是设计自由度；FloPoCo 的三行数据
const DesignFreedom: React.FC = () => {
  const {p} = useT();
  const o = p('p44', 0, 14) * (1 - p('p47', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g opacity={1 - p('p45', 0, 12)}>
        <Table
          cx={960}
          y={300}
          colW={[340, 340, 400]}
          size={30}
          draw={p('p44', 0, 20)}
          header={['', '标准规定', '设计的人决定']}
          headColors={[undefined, C.clayInk, C.blueInk]}
          rows={[
            {cells: ['结果的数值', '规定', ''], o: p('p44', 20, 16)},
            {cells: ['舍入方式', '规定', ''], o: p('p44', 36, 16)},
            {cells: ['切几级流水', '不管', '自己定'], o: p('p44', 52, 16), hot: 0.5},
          ]}
        />
        <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p44', 80, 16)}>
          浮点标准只规定数值和舍入，不管用几拍算完
        </Txt>
      </g>
      <g opacity={p('p45', 0, 14) * (1 - p('p46', 0, 12))}>
        <CiteCard
          b={{x: 380, y: 280, w: 1160, h: 250}}
          year="2011"
          who="de Dinechin · Pasca"
          venue="IEEE Design & Test of Computers"
          title="Designing Custom Arithmetic Data Paths with FloPoCo"
          quoteZh="同一个电路，按不同的目标频率来切"
          draw={p('p45', 0, 22)}
        />
      </g>
      <g opacity={p('p46', 0, 14)}>
        <Table
          cx={960}
          y={300}
          colW={[320, 320, 380]}
          size={30}
          mono={[false, true, true]}
          draw={p('p46', 0, 20)}
          header={['目标频率', '延迟拍数', '做出来的频率']}
          headColors={[C.blueInk, C.clayInk, C.ink2]}
          rows={[
            {cells: ['50 兆赫', '0 拍', '51 兆赫'], o: p('p46', 30, 16)},
            {cells: ['100 兆赫', '2 拍', '109 兆赫'], o: p('p46', 60, 16)},
            {cells: ['200 兆赫', '6 拍', '203 兆赫'], o: p('p46', 90, 16)},
          ]}
        />
        <Txt x={960} y={240} anchor="middle" size={30} opacity={p('p46', 130, 16)}>
          目标定得越高，切得越多，做出来的电路都达到了目标
        </Txt>
      </g>
    </g>
  );
};

// p47–p49：业界先定频率再定级数；厂商手册的举例；处理器浮点单元的例子
const Industry: React.FC = () => {
  const {p} = useT();
  const o = p('p47', 0, 14) * (1 - p('p50', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g opacity={1 - p('p48', 0, 12)}>
        <Formula
          x={960}
          y={430}
          size={44}
          mono={false}
          terms={[
            {t: '先定时钟要跑多快', color: C.clayInk, o: p('p47', 10, 30)},
            {t: '  →  ', color: C.ink2, o: p('p47', 40, 30)},
            {t: '再决定切几级', color: C.blueInk, o: p('p47', 70, 30)},
          ]}
        />
        <Txt x={960} y={600} anchor="middle" size={30} color={C.ink2} opacity={p('p47', 100, 16)}>
          厂商的浮点运算器也是这样配的
        </Txt>
      </g>
      <g opacity={p('p48', 0, 14) * (1 - p('p49', 0, 12))}>
        <Table
          cx={960}
          y={320}
          colW={[420, 420]}
          size={32}
          mono={[true, true]}
          draw={p('p48', 0, 20)}
          header={['系统时钟', '延迟拍数']}
          headColors={[C.blueInk, C.clayInk]}
          rows={[
            {cells: ['400 兆赫', '12 拍'], o: p('p48', 20, 16)},
            {cells: ['70 兆赫', '6 拍'], o: p('p48', 50, 16)},
          ]}
        />
        <Txt x={960} y={640} anchor="middle" size={30} color={C.ink2} opacity={p('p48', 90, 16)}>
          它的手册举例：时钟不高时，级数可以减下来
        </Txt>
      </g>
      <g opacity={p('p49', 0, 14)}>
        <CiteCard
          b={{x: 380, y: 280, w: 1160, h: 250}}
          year="2004"
          who="Catovic"
          venue="DASIA 2004"
          title="GRFPU：处理器里的浮点单元"
          quoteZh="乘法延迟 3 拍，每一拍都能开始一次新的乘法"
          draw={p('p49', 0, 22)}
        />
      </g>
    </g>
  );
};

// p50–p51：拿最简单的两级来演示，在相乘后面插一排寄存器
const TwoStage: React.FC = () => {
  const {p} = useT();
  const o = p('p50', 0, 14) * (1 - p('k04', 0, 12));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <g transform={'translate(0, 120)'}>
        <StepChain draw={p('p50', 0, 20)} cut={p('p50', 30, 30)} subs={p('p51', 0, 14) > 0 ? ['判断特殊值', '阶码相加', '', '', ''] : []} />
      </g>
      <g opacity={p('p50', 60, 14)}>
        <Label cx={486} cy={240} text="第一级" size={30} stroke={C.blue} color={C.blueInk} draw={p('p50', 64, 16)} />
        <Label cx={1276} cy={240} text="第二级" size={30} stroke={C.blue} color={C.blueInk} draw={p('p50', 72, 16)} />
      </g>
      <Txt x={960} y={320} anchor="middle" size={30} opacity={p('p51', 40, 16)}>
        第一级拆包、判断特殊值、相乘、阶码相加；第二级规格化、舍入、写回
      </Txt>
    </g>
  );
};

export const Pipe: React.FC = () => {
  const {f, s} = useT();
  if (f < s('p36') || f >= s('k04')) return null;
  return (
    <g>
      <StageCut />
      <WhereToCut />
      <StagesFreq />
      <DesignFreedom />
      <Industry />
      <TwoStage />
    </g>
  );
};
