import React from 'react';
import {C, F} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RArrow, RLine, RRect} from '../../../src/core/rough';
import {BitStrip, STRIP, cellCX, cellX} from '../../../src/components/BitStrip';
import {Bracket, Chip, Txt} from '../../../src/components/Prims';

// 例子：0x3F800001 × 0x3FC00000 规格化后的 48 位积（RTL 仿真输出，高位在前）
export const PROD_N = '011000000000000000000000110000000000000000000000';

const Dot: React.FC<{x: number; y: number; r?: number; fill?: string; opacity?: number}> = ({
  x,
  y,
  r = 9,
  fill = C.ink,
  opacity = 1,
}) => (opacity > 0 ? <circle cx={x} cy={y} r={r} fill={fill} opacity={opacity} /> : null);

// 抽象数轴：相邻两格 A、B
const AX = {y: 640, a: 760, b: 1160, mid: 960};

const AbstractLine: React.FC = () => {
  const {p, span} = useT();
  const vis = span('p04', 'p10', 14);
  if (vis <= 0) return null;
  const axis = p('p04', 0, 24);
  const tick = (x: number, h: number, faint: boolean, d: number) => (
    <RLine
      x1={x}
      y1={AX.y - h / 2}
      x2={x}
      y2={AX.y + h / 2}
      stroke={faint ? C.faint : C.ink}
      sw={faint ? 2 : 3}
      draw={p('p04', d, 12)}
    />
  );
  // p04 真正的积
  const trueDot = p('p04', 36, 12) * (1 - p('p06', 0, 10));
  // p06/p07 截断
  const trunc = span('p06', 'p08', 10);
  // p08 就近
  const near = span('p08', 'p09', 10);
  // p09 平局
  const tie = p('p09', 0, 12);
  return (
    <g opacity={vis}>
      <RLine x1={260} y1={AX.y} x2={1660} y2={AX.y} stroke={C.ink2} sw={2.4} draw={axis} />
      {tick(360, 28, true, 10)}
      {tick(1560, 28, true, 10)}
      {tick(AX.a, 44, false, 16)}
      {tick(AX.b, 44, false, 20)}
      <Txt x={AX.a} y={712} anchor="middle" size={30} opacity={p('p05', 6, 12)} rise={p('p05', 6, 12)}>
        末位不动
      </Txt>
      <Txt x={AX.b} y={712} anchor="middle" size={30} opacity={p('p05', 14, 12)} rise={p('p05', 14, 12)}>
        末位加一
      </Txt>
      <Chip x={600} y={440} w={720} opacity={span('p05', 'p06', 10)} draw={p('p05', 20, 20)}>
        <Txt x={960} y={484} anchor="middle" size={32}>
          舍入：在相邻的两格里挑一个
        </Txt>
      </Chip>

      <Dot x={1060} y={AX.y} opacity={trueDot} fill={C.ink} />
      <Txt x={1060} y={604} anchor="middle" size={26} color={C.ink2} opacity={trueDot}>
        真正的积
      </Txt>

      <g opacity={trunc}>
        {[820, 940, 1100].map((x, i) => (
          <g key={x}>
            <Dot x={x} y={AX.y} r={8} fill={C.ink2} opacity={p('p06', 4 + i * 5, 8)} />
            <RArrow x1={x} y1={AX.y - 12} x2={AX.a + 4 + i * 5} y2={AX.y - 18 - i * 6} lift={-(x - AX.a) * 0.45 - 12} stroke={C.ink2} sw={2.2} draw={p('p06', 14 + i * 6, 18)} />
          </g>
        ))}
        <Txt x={960} y={496} anchor="middle" size={32} opacity={p('p06', 30, 12)}>
          截断：永远选左边
        </Txt>
        <Txt x={960} y={800} anchor="middle" size={34} mono color={C.clayInk} opacity={p('p07', 8, 14)} rise={p('p07', 8, 14)}>
          误差 = 截断结果 − 真值 &lt; 0
        </Txt>
      </g>

      <g opacity={near}>
        <RLine x1={AX.mid} y1={AX.y - 22} x2={AX.mid} y2={AX.y + 22} stroke={C.muted} sw={2} dash draw={p('p08', 0, 10)} />
        <Dot x={860} y={AX.y} r={8} opacity={p('p08', 8, 8)} />
        <RArrow x1={860} y1={AX.y - 12} x2={AX.a + 6} y2={AX.y - 16} lift={-50} stroke={C.ink} sw={2.2} draw={p('p08', 16, 16)} />
        <Dot x={1080} y={AX.y} r={8} opacity={p('p08', 24, 8)} />
        <RArrow x1={1080} y1={AX.y - 12} x2={AX.b - 6} y2={AX.y - 16} lift={-40} stroke={C.ink} sw={2.2} draw={p('p08', 32, 16)} />
        <Txt x={960} y={548} anchor="middle" size={32} opacity={p('p08', 20, 12)}>
          就近：挑离得近的那一格
        </Txt>
      </g>

      <g opacity={tie}>
        <RLine x1={AX.mid} y1={AX.y - 22} x2={AX.mid} y2={AX.y + 22} stroke={C.muted} sw={2} dash />
        <Dot x={AX.mid} y={AX.y} r={10} fill={C.clay} />
        <RArrow x1={AX.mid - 10} y1={AX.y - 14} x2={AX.a + 8} y2={AX.y - 16} lift={-60} stroke={C.clay} sw={2.2} dash draw={p('p09', 10, 16)} />
        <RArrow x1={AX.mid + 10} y1={AX.y - 14} x2={AX.b - 8} y2={AX.y - 16} lift={-60} stroke={C.clay} sw={2.2} dash draw={p('p09', 16, 16)} />
        <Txt x={AX.mid} y={560} anchor="middle" size={52} color={C.clayInk} opacity={p('p09', 26, 10)}>
          ?
        </Txt>
        <Txt x={AX.mid} y={800} anchor="middle" size={30} color={C.ink2} opacity={p('p09', 30, 12)}>
          正中间：两边一样近
        </Txt>
      </g>
    </g>
  );
};

// 十进制对照：两条数轴，一律往上 vs 就近偶数
const DX = (v: number) => 460 + 240 * v;
const DecLine: React.FC<{y: number; draw: number; label?: string; labelOpacity?: number}> = ({
  y,
  draw,
  label,
  labelOpacity = 0,
}) => (
  <g>
    <RLine x1={420} y1={y} x2={1460} y2={y} stroke={C.ink2} sw={2.2} draw={draw} />
    {[0, 1, 2, 3, 4].map((v) => (
      <g key={v} opacity={draw}>
        <RLine x1={DX(v)} y1={y - 12} x2={DX(v)} y2={y + 12} stroke={C.ink2} sw={2.2} />
        <Txt x={DX(v)} y={y + 44} anchor="middle" size={24} mono color={C.muted}>
          {v}
        </Txt>
      </g>
    ))}
    {[0.5, 1.5, 2.5, 3.5].map((v) => (
      <g key={v} opacity={draw}>
        <Dot x={DX(v)} y={y} r={8} />
        <Txt x={DX(v)} y={y + 44} anchor="middle" size={24} mono>
          {v}
        </Txt>
      </g>
    ))}
    {label ? (
      <Txt x={140} y={y + 10} size={32} opacity={labelOpacity}>
        {label}
      </Txt>
    ) : null}
  </g>
);

const Decimal: React.FC = () => {
  const {p, span} = useT();
  const vis = span('p10', 'p15', 14);
  if (vis <= 0) return null;
  const L1 = 560;
  const L2 = 760;
  const upTargets = [1, 2, 3, 4];
  const evenTargets = [0, 2, 2, 4];
  return (
    <g opacity={vis}>
      <Txt x={960} y={444} anchor="middle" size={34} mono opacity={p('p10', 40, 14)} rise={p('p10', 40, 14)}>
        0.5 + 1.5 + 2.5 + 3.5 = 8
      </Txt>
      <DecLine y={L1} draw={p('p10', 6, 24)} label="一律往上" labelOpacity={p('p11', 0, 12)} />
      {[0.5, 1.5, 2.5, 3.5].map((v, i) => (
        <RArrow
          key={v}
          x1={DX(v) + 4}
          y1={L1 - 12}
          x2={DX(upTargets[i]) - 4}
          y2={L1 - 14}
          lift={-56}
          stroke={C.clay}
          sw={2.4}
          draw={p('p11', 8 + i * 7, 14)}
        />
      ))}
      <Txt x={1540} y={L1 + 10} size={32} mono opacity={p('p11', 40, 12)}>
        1+2+3+4 = 10
      </Txt>
      <Txt x={1540} y={L1 + 52} size={28} color={C.clayInk} opacity={p('p11', 56, 12)}>
        多了 2
      </Txt>

      <DecLine y={L2} draw={p('p12', 0, 20)} label="就近偶数" labelOpacity={p('p12', 4, 12)} />
      {[0.5, 1.5, 2.5, 3.5].map((v, i) => (
        <RArrow
          key={v}
          x1={DX(v) + (evenTargets[i] > v ? 4 : -4)}
          y1={L2 - 12}
          x2={DX(evenTargets[i]) + (evenTargets[i] > v ? -4 : 4)}
          y2={L2 - 14}
          lift={-56}
          stroke={C.green}
          sw={2.4}
          draw={p('p12', 14 + i * 7, 14)}
        />
      ))}
      <Txt x={1540} y={L2 + 10} size={32} mono opacity={p('p12', 46, 12)}>
        0+2+2+4 = 8
      </Txt>
      <Txt x={1540} y={L2 + 52} size={28} color={C.greenInk} opacity={p('p12', 60, 12)}>
        正好
      </Txt>
      <Txt x={960} y={868} anchor="middle" size={30} color={C.ink2} opacity={span('p13', 'p14', 10) * p('p13', 10, 12)}>
        往下 2 次，往上 2 次
      </Txt>
      <Chip x={560} y={846} w={800} h={58} opacity={p('p14', 0, 10)} draw={p('p14', 0, 22)} stroke={C.ink}>
        <Txt x={960} y={885} anchor="middle" size={32}>
          就近舍入到偶数
          <tspan dx={22} fontFamily={F.mono} fontSize={25} fill={C.muted}>
            round half to even
          </tspan>
        </Txt>
      </Chip>
    </g>
  );
};

// 判定树
const Node: React.FC<{cx: number; w: number; text: React.ReactNode; draw: number; stroke?: string}> = ({
  cx,
  w,
  text,
  draw,
  stroke = C.ink2,
}) => (
  <g opacity={draw > 0 ? 1 : 0}>
    <RRect x={cx - w / 2} y={485} w={w} h={70} stroke={stroke} fill={C.paper} sw={2.2} draw={draw} />
    <Txt x={cx} y={531} anchor="middle" size={30} opacity={Math.max(0, draw * 2 - 1)}>
      {text}
    </Txt>
  </g>
);

const Edge: React.FC<{x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number; draw: number; hot?: number}> = ({
  x1,
  y1,
  x2,
  y2,
  label,
  lx,
  ly,
  draw,
  hot = 0,
}) => (
  <g>
    <RArrow x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink2} sw={2.2} draw={draw} />
    {hot > 0 ? <RArrow x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.clay} sw={5} draw={hot} /> : null}
    <Txt x={lx} y={ly} anchor="middle" size={26} mono color={hot > 0.5 ? C.clayInk : C.muted} opacity={Math.max(0, draw * 2 - 1)}>
      {label}
    </Txt>
  </g>
);

const Tree: React.FC = () => {
  const {p, span} = useT();
  const vis = span('p17', 'c01', 14);
  if (vis <= 0) return null;
  const leaf = (x: number, text: string, strong: boolean, o: number, y = 722, anchor: 'middle' | 'start' = 'middle') => (
    <Txt x={x} y={y} anchor={anchor} size={30} color={strong ? C.clayInk : C.muted} opacity={o} rise={o}>
      {text}
    </Txt>
  );
  const hot = (d: number) => p('p24', 20 + d, 14);
  const s2 = p('p20', 10, 10);
  return (
    <g opacity={vis}>
      <Node cx={330} w={240} draw={p('p17', 0, 18)} text={<>保护位 <tspan fill={C.clayInk}>G</tspan> = ?</>} />
      <Edge x1={330} y1={560} x2={330} y2={680} label="0" lx={352} ly={628} draw={p('p17', 16, 14)} />
      {leaf(330, '不到一半 → 舍去', false, p('p17', 28, 12))}

      <Edge x1={455} y1={520} x2={612} y2={520} label="1" lx={534} ly={506} draw={p('p18', 0, 14)} hot={hot(0)} />
      <g opacity={1 - s2}>
        <Node cx={770} w={300} draw={p('p18', 10, 18)} text="后面有 1 吗？" />
      </g>
      <g opacity={s2}>
        <Node cx={770} w={300} draw={s2} stroke={C.blue} text={<>粘滞位 <tspan fill={C.blueInk}>S</tspan> = ?</>} />
      </g>
      <Edge x1={770} y1={560} x2={770} y2={680} label="1" lx={792} ly={628} draw={p('p19', 0, 14)} />
      {leaf(770, '超过一半 → 加一', true, p('p19', 12, 12))}

      <Edge x1={925} y1={520} x2={1062} y2={520} label="0" lx={994} ly={506} draw={p('p21', 0, 14)} hot={hot(10)} />
      <Node cx={1222} w={310} draw={p('p21', 10, 18)} stroke={C.green} text={<>平局：末位 <tspan fill={C.greenInk}>L</tspan> = ?</>} />
      <Edge x1={1222} y1={560} x2={1222} y2={680} label="1" lx={1244} ly={628} draw={p('p22', 0, 14)} hot={hot(20)} />
      {leaf(1222, '奇数 → 加一', true, p('p22', 10, 12))}
      <Edge x1={1382} y1={520} x2={1520} y2={520} label="0" lx={1451} ly={506} draw={p('p22', 24, 14)} />
      {leaf(1536, '偶数 → 不动', false, p('p22', 34, 12), 531, 'start')}

      <Txt x={960} y={826} anchor="middle" size={40} opacity={p('p23', 30, 14)} rise={p('p23', 30, 14)}>
        末位加一 ={' '}
        <tspan fontFamily={F.mono} fill={C.clayInk}>G</tspan> 与 ({' '}
        <tspan fontFamily={F.mono} fill={C.blueInk}>S</tspan> 或{' '}
        <tspan fontFamily={F.mono} fill={C.greenInk}>L</tspan> )
      </Txt>
      <Txt x={960} y={884} anchor="middle" size={36} opacity={p('p24', 50, 14)} rise={p('p24', 50, 14)}>
        ={' '}
        <tspan fontFamily={F.mono} fill={C.clayInk}>1</tspan> 与 ({' '}
        <tspan fontFamily={F.mono} fill={C.blueInk}>0</tspan> 或{' '}
        <tspan fontFamily={F.mono} fill={C.greenInk}>1</tspan> ) ={' '}
        <tspan fontFamily={F.mono} fill={C.clayInk} fontWeight={700}>1</tspan>
      </Txt>
      <Txt x={1824} y={444} anchor="end" size={22} mono color={C.muted} opacity={p('p24', 64, 14)}>
        仿真：3F800001 × 3FC00000 → 3FC00002
      </Txt>
    </g>
  );
};

export const Principle: React.FC = () => {
  const {p, span} = useT();
  const out = 1 - p('c01', 0, 16);
  if (out <= 0) return null;

  // 位条在中段讲解时变暗
  const dim = p('p04', 0, 15) * (1 - p('p15', 0, 15));
  const stripOpacity = 1 - 0.7 * dim;
  const dropped = p('p03', 0, 18);
  const gOn = p('p15', 0, 16);
  const sOn = p('p18', 10, 16);
  const lOn = p('p16', 10, 16);

  const look = (bit: number) => {
    if (bit === 47) return {opacity: 1 - 0.65 * p('p02', 0, 14)};
    if (bit === 22) return {opacity: 1 - 0.65 * dropped * (1 - gOn)};
    if (bit <= 21) return {opacity: 1 - 0.65 * dropped * (1 - sOn)};
    return {};
  };

  const brackets = span('p02', 'p04', 12);
  const tint = (bit: number, color: string, o: number) =>
    o > 0 ? (
      <rect x={cellX(bit) - 1} y={STRIP.y - 1} width={STRIP.cw + 2} height={STRIP.ch + 2} rx={4} fill={color} opacity={o} />
    ) : null;

  return (
    <g opacity={out}>
      <Txt x={98} y={160} size={30} color={C.ink2} opacity={p('p01', 10, 16) * stripOpacity}>
        尾数的积（48 位）
      </Txt>

      <g opacity={stripOpacity}>
        {tint(22, C.clayTint, gOn)}
        {tint(23, C.greenTint, lOn)}
        {Array.from({length: 22}, (_, i) => (
          <React.Fragment key={i}>{tint(i, C.blueTint, sOn)}</React.Fragment>
        ))}
      </g>
      <BitStrip
        bits={PROD_N}
        draw={p('p01', 0, 44)}
        look={look}
        indices={[47, 46, 23, 22, 21, 0]}
        indexOpacity={p('p01', 34, 14)}
        opacity={stripOpacity}
      />

      <g opacity={brackets}>
        <Bracket x1={cellX(46)} x2={cellX(23) + STRIP.cw} y={300} draw={p('p02', 4, 18)} />
        <Txt x={(cellX(46) + cellX(23) + STRIP.cw) / 2} y={338} anchor="middle" size={30} opacity={p('p02', 16, 12)}>
          留下 24 位
        </Txt>
        <Bracket x1={cellX(22)} x2={cellX(0) + STRIP.cw} y={300} stroke={C.muted} draw={p('p02', 30, 18)} />
        <Txt x={(cellX(22) + cellX(0) + STRIP.cw) / 2} y={338} anchor="middle" size={30} color={C.muted} opacity={p('p02', 40, 12)}>
          放不下 23 位
        </Txt>
        <Txt x={98} y={384} size={22} color={C.muted} opacity={p('p02', 54, 12)}>
          （最高位 47 在规格化后恒为 0，不占格子）
        </Txt>
      </g>

      {/* 保护位 G */}
      <REllipse cx={cellCX(22)} cy={STRIP.y + STRIP.ch / 2} w={58} h={64} stroke={C.clay} sw={2.6} draw={p('p15', 20, 18)} opacity={1 - p('p17', 0, 12)} />
      <RLine x1={cellCX(22) + 6} y1={STRIP.y + STRIP.ch + 34} x2={1040} y2={318} stroke={C.clay} sw={2} draw={p('p15', 30, 10)} opacity={p('p15', 30, 1)} />
      <Txt x={1048} y={350} size={28} color={C.clayInk} opacity={p('p15', 34, 12) * (1 - p('p16', 0, 10))}>
        被扔掉的第一位
      </Txt>
      <Txt x={1048} y={350} size={28} color={C.clayInk} opacity={p('p16', 6, 12)}>
        保护位 G：分量是末位的一半
      </Txt>

      {/* 分量 */}
      <g opacity={p('p16', 16, 14)}>
        <Txt x={cellCX(23)} y={176} anchor="middle" size={26} mono color={C.greenInk}>
          1
        </Txt>
        <Txt x={cellCX(22)} y={176} anchor="middle" size={26} mono color={C.clayInk}>
          ½
        </Txt>
        <Txt x={950} y={176} anchor="end" size={22} color={C.muted}>
          分量（以末位为 1）
        </Txt>
      </g>

      {/* 末位 L */}
      <RLine x1={cellCX(23) - 6} y1={STRIP.y + STRIP.ch + 34} x2={952} y2={318} stroke={C.green} sw={2} draw={p('p16', 10, 10)} opacity={p('p16', 10, 1)} />
      <Txt x={944} y={350} anchor="end" size={28} color={C.greenInk} opacity={p('p16', 14, 12)}>
        末位 L
      </Txt>

      {/* 粘滞位 S */}
      <Bracket x1={cellX(21)} x2={cellX(0) + STRIP.cw} y={188} dir="down" stroke={C.blue} draw={p('p18', 6, 18)} />
      <Txt x={(cellX(21) + cellX(0) + STRIP.cw) / 2} y={166} anchor="middle" size={28} color={C.blueInk} opacity={p('p18', 16, 12) * (1 - p('p20', 0, 10))}>
        后面 22 位
      </Txt>
      <Txt x={(cellX(21) + cellX(0) + STRIP.cw) / 2} y={166} anchor="middle" size={28} color={C.blueInk} opacity={p('p20', 6, 12)}>
        粘滞位 S：只要有一个 1，就是 1
      </Txt>

      <AbstractLine />
      <Decimal />
      <Tree />
    </g>
  );
};
