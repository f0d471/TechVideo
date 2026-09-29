import React from 'react';
import {C} from '../../../src/core/theme';
import {useT} from '../../../src/core/timeline';
import {REllipse, RLine} from '../../../src/core/rough';
import {Bracket, Txt} from '../../../src/components/Prims';
import {Bits32, Box, CiteCard, Formula, MathText, Photo, termSpan} from './Kit';

// 03 特殊值 p62–p76：零、无穷与 NaN → 非规格数与逐渐下溢 → 逐渐下溢写进标准的来历

const BITS_Y = 170;

// p62–p65：公式写不出 0；编码表逐行出现，上方位串跟着换例子
const Codes: React.FC = () => {
  const {p, span} = useT();
  const o = span('p57', 'p61', 14);
  if (o <= 0) return null;
  const hex = p('p60') > 0 ? '7FC00000' : p('p59') > 0 ? '7F800000' : p('p58', 40) > 0 ? '80000000' : '00000000';
  const [fa, fb] = termSpan(960, 52, 'middle', 'F');
  const rows = [
    {at: 'p58', e: '全 0', f: '全 0', what: '+0 与 −0', ex: '00000000 · 80000000'},
    {at: 'p59', e: '全 1', f: '全 0', what: '+∞ 与 −∞', ex: '7F800000 · FF800000'},
    {at: 'p60', e: '全 1', f: '不是 0', what: 'NaN（例如 ∞ × 0）', ex: '7FC00000 等'},
  ];
  const col = [300, 560, 960, 1480];
  return (
    <g opacity={o}>
      <Bits32 hex={hex} y={BITS_Y} hot={['E', 'F']} draw={p('p57', 0, 20)} />
      <Txt x={1824} y={BITS_Y - 18} anchor="end" mono size={26} color={C.muted} opacity={p('p58', 0, 12)}>
        {hex}
      </Txt>
      <g opacity={span('p57', 'p58', 12)}>
        <Formula x={960} y={480} size={52} anchor="middle" lit={{S: 0, E: 0, F: 1}} under={{F: p('p57', 10, 16)}} />
        <MathText text="1.F ≥ 1" x={(fa + fb) / 2} y={600} size={48} anchor="middle" color={C.blueInk} opacity={p('p57', 20, 12)} />
        <Txt x={960} y={720} anchor="middle" size={40} opacity={p('p57', 40, 12)}>
          0 写不出来 → 留出几组编码
        </Txt>
      </g>
      <g opacity={p('p58', 0, 12)}>
        {['阶码 E', '小数位 F', '表示', '编码'].map((h, i) => (
          <Txt key={h} x={col[i]} y={380} anchor="middle" size={30} color={i === 0 ? C.clayInk : i === 1 ? C.blueInk : C.muted}>
            {h}
          </Txt>
        ))}
        <RLine x1={160} y1={404} x2={1760} y2={404} stroke={C.rule} sw={2} roughness={0.4} />
        {rows.map((r, i) => (
          <g key={r.at} opacity={p(r.at, 0, 12)}>
            <Txt x={col[0]} y={490 + i * 130} anchor="middle" size={38} color={C.clayInk}>
              {r.e}
            </Txt>
            <Txt x={col[1]} y={490 + i * 130} anchor="middle" size={38} color={C.blueInk}>
              {r.f}
            </Txt>
            <Txt x={col[2]} y={490 + i * 130} anchor="middle" size={40}>
              {r.what}
            </Txt>
            <Txt x={col[3]} y={490 + i * 130} anchor="middle" mono size={30} color={C.ink2}>
              {r.ex}
            </Txt>
          </g>
        ))}
      </g>
    </g>
  );
};

// p66–p70：从最小的规格化数往 0 走，非规格数 0.F × 2^(−126)
const Subnormal: React.FC = () => {
  const {p, span} = useT();
  const o = span('p61', 'p66', 14);
  if (o <= 0) return null;
  const hex = p('p64', 30) > 0 ? '00000001' : p('p62') > 0 ? '00400000' : '00800000';
  const axisY = 470;
  const x0 = 260; // 0
  const xMin = 1500; // 2^(−126)
  const subs = [0.5, 0.25, 0.125, 0.0625];
  return (
    <g opacity={o}>
      <Bits32 hex={hex} y={BITS_Y} hot={p('p62') > 0 ? ['E', 'F'] : undefined} draw={p('p61', 0, 20)} />
      <Txt x={1824} y={BITS_Y - 18} anchor="end" mono size={26} color={C.muted}>
        {hex}
      </Txt>
      <RLine x1={x0} y1={axisY} x2={1760} y2={axisY} stroke={C.ink2} sw={2.4} roughness={0.5} draw={p('p61', 6, 20)} />
      <RLine x1={x0} y1={axisY - 20} x2={x0} y2={axisY + 20} stroke={C.ink} sw={3} roughness={0.5} draw={p('p61', 10, 12)} />
      <Txt x={x0} y={axisY + 64} anchor="middle" mono size={32} opacity={p('p61', 10, 12)}>
        0
      </Txt>
      <RLine x1={xMin} y1={axisY - 26} x2={xMin} y2={axisY + 26} stroke={C.clay} sw={3.4} roughness={0.5} draw={p('p61', 16, 12)} />
      <MathText text="2^(−126) ≈ 10^(−38)" x={xMin} y={axisY + 70} size={34} anchor="middle" color={C.clayInk} opacity={p('p61', 20, 12)} />
      <Txt x={1640} y={axisY - 40} anchor="middle" size={28} color={C.ink2} opacity={p('p61', 24, 12)}>
        规格化数
      </Txt>
      <g opacity={p('p62', 0, 12)}>
        {subs.map((s, i) => (
          <RLine
            key={s}
            x1={x0 + (xMin - x0) * s}
            y1={axisY - 14}
            x2={x0 + (xMin - x0) * s}
            y2={axisY + 14}
            stroke={C.blue}
            sw={2.4}
            roughness={0.5}
            draw={p('p62', 4 + i * 5, 10)}
          />
        ))}
        <Bracket x1={x0 + 8} x2={xMin - 8} y={axisY - 44} dir="down" stroke={C.blue} draw={p('p62', 20, 16)} />
        <Txt x={(x0 + xMin) / 2} y={axisY - 66} anchor="middle" size={30} color={C.blueInk}>
          E 全 0 · F 不是 0
        </Txt>
      </g>
      <g opacity={p('p63', 0, 12)}>
        <MathText text="0.F × 2^(−126)" x={960} y={700} size={52} anchor="middle" color={C.blueInk} />
        <Txt x={960} y={780} anchor="middle" size={36} opacity={p('p63', 24, 12)}>
          非规格数 · 隐藏位当成 0
        </Txt>
      </g>
      <g opacity={p('p64', 0, 12)}>
        <MathText text="0.1000…0 → 0.0100…0 → … → 0.0000…1 = 2^(−149)" x={960} y={868} size={34} anchor="middle" color={C.blueInk} />
      </g>
      <g opacity={p('p65', 4, 14)}>
        <RLine x1={x0} y1={axisY + 4} x2={xMin} y2={axisY + 4} stroke={C.blue} sw={5} roughness={0.4} draw={p('p65', 4, 22)} />
        <Txt x={(x0 + xMin) / 2} y={axisY + 70} anchor="middle" size={34} color={C.blueInk}>
          逐渐下溢
        </Txt>
      </g>
    </g>
  );
};

// p71–p76：来历。左边 8087 裸片照片，右边时间线
const History: React.FC = () => {
  const {p, span} = useT();
  const o = span('p66', 'k04', 14);
  if (o <= 0) return null;
  const photo: Box = {x: 150, y: 190, w: 560, h: 432};
  // 一个 beat 一个事件；p68 一句话有两件事，分两个圆点先后出现
  const events = [
    {at: 'p66', d: 30, year: '1976', text: 'Intel 请 Kahan 为 8087 定运算规则'},
    {at: 'p67', d: 0, year: '1977 起', text: 'Kahan、Coonen、Stone 起草标准：有逐渐下溢'},
    {at: 'p68', d: 0, year: '', text: 'DEC 的 VAX：太小的数直接当成 0'},
    {at: 'p68', d: 40, year: '', text: 'DEC 工程师：照草案做，快不过 VAX'},
    {at: 'p69', d: 0, year: '1981', text: 'DEC 请来的专家：逐渐下溢是对的'},
  ];
  const tx = 860;
  return (
    <g opacity={o}>
      <Photo src="fp32-format/assets/intel-8087-die.jpg" b={photo} credit="Intel 8087 裸片 · Pauli Rautakorpi · CC BY 3.0" opacity={p('p66', 20, 14)} draw={p('p66', 20, 20)} />
      <Txt x={tx} y={210} size={34} opacity={p('p66', 0, 14)}>
        这段过渡是争出来的
      </Txt>
      <RLine x1={tx} y1={250} x2={tx} y2={790} stroke={C.rule} sw={3} roughness={0.4} draw={p('p66', 24, 20)} />
      {events.map((ev, i) => {
        const y = 300 + i * 100;
        return (
          <g key={i} opacity={p(ev.at, ev.d, 12)}>
            <REllipse cx={tx} cy={y - 10} w={18} h={18} stroke={C.clay} fill={C.clay} />
            {ev.year && (
              <Txt x={tx + 30} y={y - 30} size={24} mono color={C.clayInk}>
                {ev.year}
              </Txt>
            )}
            <Txt x={tx + 30} y={y + 10} size={30}>
              {ev.text}
            </Txt>
          </g>
        );
      })}
      <g opacity={p('p69', 40, 14)}>
        <REllipse cx={tx} cy={800} w={22} h={22} stroke={C.clay} fill={C.clay} />
        <Txt x={tx + 30} y={790} size={24} mono color={C.clayInk}>
          1985
        </Txt>
        <Txt x={tx + 30} y={830} size={32} color={C.clayInk}>
          写进 IEEE 754 标准
        </Txt>
      </g>
      <CiteCard
        b={{x: 150, y: 700, w: 620, h: 150}}
        year="1998"
        who="Severance"
        venue="IEEE Computer"
        title="Kahan 访谈：IEEE 754 的由来"
        draw={p('p67', 0, 20)}
      />
    </g>
  );
};

export const SpecialPart: React.FC = () => {
  const {p} = useT();
  if (p('p57', 0, 1) <= 0) return null;
  return (
    <g>
      <Codes />
      <Subnormal />
      <History />
    </g>
  );
};
