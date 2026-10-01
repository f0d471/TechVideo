import React from 'react';
import {C, F} from '../core/theme';
import {RRect} from '../core/rough';

// 标签框：给一个东西起名，或放一个值。框里只有一行字（可再加一行小字），字在框里上下左右居中，
// 框的大小由字算出，留白按字号固定，所以同一集里框和字的比例处处一样（docs/standards/visual.md 第七节）。
// 画面代码不直接画框：要框就用它，或元素表里的其他组件

// 字宽估计：等宽字体 0.6em；霞鹜文楷的汉字与全角符号 1em，其余按 0.56em。vt layout 会量真实外框核对
export const textWidth = (text: string, size: number, mono = false) => {
  let em = 0;
  for (const ch of text) {
    const wide = /[⺀-鿿豈-﫿＀-￯　-〿]/.test(ch);
    em += wide ? 1 : mono ? 0.6 : 0.56;
  }
  return em * size;
};

// 框的外形：左右各留 0.9 个字号，上下各留 0.55 个字号；有小字时下面多一行
export const labelBox = (text: string, size: number, mono = false, sub?: string, subSize = 22) => {
  const w = Math.max(textWidth(text, size, mono), sub ? textWidth(sub, subSize) : 0) + size * 1.8;
  const h = size * 2.1 + (sub ? subSize * 1.5 : 0);
  return {w, h};
};

export const Label: React.FC<{
  cx: number; // 框中心
  cy: number;
  text: string;
  size?: number;
  mono?: boolean;
  sub?: string; // 第二行小字，中性色
  minW?: number; // 并排的几个框要等宽时，给同一个最小宽度
  color?: string; // 字色
  stroke?: string;
  fill?: string;
  draw?: number; // 框的描线进度，字在描到一半后出现
  opacity?: number;
}> = ({cx, cy, text, size = 34, mono = false, sub, minW = 0, color = C.ink, stroke = C.ink2, fill = C.paper, draw = 1, opacity = 1}) => {
  if (opacity <= 0 || draw <= 0) return null;
  const subSize = 22;
  const box = labelBox(text, size, mono, sub, subSize);
  const w = Math.max(box.w, minW);
  const h = box.h;
  const t = Math.max(0, draw * 2 - 1);
  // 基线：一行字时字身中心对准框中心；有小字时两行作为一组居中
  const main = sub ? cy - (subSize * 1.5) / 2 + size * 0.35 : cy + size * 0.35;
  return (
    <g opacity={opacity} data-label="">
      <RRect x={cx - w / 2} y={cy - h / 2} w={w} h={h} stroke={stroke} fill={fill} sw={2} roughness={0.7} draw={draw} />
      <text
        x={cx}
        y={main}
        textAnchor="middle"
        fontFamily={mono ? F.mono : F.text}
        fontSize={size}
        fill={color}
        opacity={t}
        style={mono ? {fontVariantLigatures: 'none'} : undefined}
      >
        {text}
      </text>
      {sub && (
        <text x={cx} y={main + subSize * 1.5} textAnchor="middle" fontFamily={F.text} fontSize={subSize} fill={C.muted} opacity={t}>
          {sub}
        </text>
      )}
    </g>
  );
};

// 框的四边中点，箭头与导线的端点从这里取
export const labelEdges = (cx: number, cy: number, text: string, size = 34, mono = false, sub?: string, minW = 0) => {
  const box = labelBox(text, size, mono, sub);
  const w = Math.max(box.w, minW);
  return {
    left: {x: cx - w / 2, y: cy},
    right: {x: cx + w / 2, y: cy},
    top: {x: cx, y: cy - box.h / 2},
    bottom: {x: cx, y: cy + box.h / 2},
    w,
    h: box.h,
  };
};
