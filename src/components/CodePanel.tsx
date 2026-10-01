import React from 'react';
import {C, F} from '../core/theme';
import {RLine, RRect} from '../core/rough';
import {Txt} from './Prims';

// 代码面板：逐字显示源文件的一段代码（由 tools/extract_code.mjs 生成的 code.json 里的一个代码段）。
// 片段当作一段独立的代码呈现：右上角只标语言名，不显示文件名、源文件行号和折叠说明。
// 行的位置、当前行底色、记号下划线都由调用方按 beat 算好传进来，面板只负责画。
// 行仍按源文件行号 no 索引，只用于在调用方与 code.json 之间对位，不画出来

export type CodeSource = {lang: string; lines: {no: number; text: string}[]};
// code.json：每个代码段一个名字，名字与 script.json 的 code 数组一致
export type CodeFile = {snippets: Record<string, CodeSource>};

// 按名字取代码段：const unpack = codeSnippet(codeJson, 'unpack')
export const codeSnippet = (file: unknown, name: string): CodeSource => {
  const s = (file as CodeFile).snippets?.[name];
  if (!s) throw new Error(`code.json 里没有代码段 ${name}：检查 script.json 的 code 数组，然后运行 vt code`);
  return s;
};

export const CODE = {
  fs: 25, // 代码字号
  cw: 25 * 0.6, // JetBrains Mono 字宽 0.6em
  x0: 136, // 代码起始 x
  row0: 196, // 第一行基线
  lh: 38, // 行高
  top: 116, // 面板上沿
};

// 面板高度随行数变化：上边距 80（含语言名一行），下边距 62。7 行时下沿在 y=486，
// 每多一行下移 38；一段最多几行由 tools/limits.json 的 codeLines 限定，vt code 检查
export const panelHeight = (n: number) => 142 + CODE.lh * (n - 1);

// 只区分注释、关键字、数字、标识符、空白、标点六类，够讲解用
export const tokenize = (s: string) => {
  const re = /(\/\/.*$)|\b(wire|reg|assign|always|begin|end|if|else)\b|(\d+'[bdh][0-9a-fA-F_]+|\b\d+\b)|([A-Za-z_]\w*)|(\s+)|(.)/g;
  const out: {t: string; c: string}[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const c = m[1] ? C.muted : m[2] ? C.kw : m[3] ? C.num : m[4] ? C.ink : m[5] ? C.ink : C.ink2;
    out.push({t: m[0], c});
  }
  return out;
};

// 记号在某一行里的列号；nth 表示第几次出现（从 0 起）
export const codeCol = (code: CodeSource, no: number, s: string, nth = 0) => {
  const t = code.lines.find((l) => l.no === no)!.text;
  let i = -1;
  for (let k = 0; k <= nth; k++) i = t.indexOf(s, i + 1);
  if (i < 0) throw new Error(`token ${s} not in line ${no}`);
  return i;
};
export const tokX = (c: number) => CODE.x0 + c * CODE.cw;

// 按源文件行号排的默认基线
export const defaultRowY = (code: CodeSource) => (no: number) => CODE.row0 + (no - code.lines[0].no) * CODE.lh;

export type Band = {no: number; o: number};
export type Underline = {no: number; tok: string; nth?: number; color: string; draw: number; opacity?: number};

export const CodePanel: React.FC<{
  code: CodeSource;
  vis: number; // 整个面板的不透明度
  frameDraw: number; // 面板外框描线进度
  lineIn: (i: number) => number; // 第 i 行的出现进度
  rowY?: (no: number) => number; // 行基线，调换行序时由调用方给出
  bands: Band[]; // 当前讲解行的底色，按数组顺序绘制
  underlines: Underline[];
  w?: number; // 面板宽度，默认占满左右留白之间；结构图放在右侧时给窄一些
}> = ({code, vis, frameDraw, lineIn, rowY = defaultRowY(code), bands, underlines, w = 1728}) => {
  const band = (b: Band, key: number) =>
    b.o > 0 ? <rect key={key} x={112} y={rowY(b.no) - 28} width={w - 32} height={CODE.lh} rx={6} fill={C.band} opacity={b.o} /> : null;
  return (
    <g opacity={vis} data-shot="code">
      <RRect x={96} y={CODE.top} w={w} h={panelHeight(code.lines.length)} stroke={C.ink2} fill={C.paper} sw={2} draw={frameDraw} />
      <Txt x={96 + w - 24} y={156} anchor="end" size={20} mono color={C.muted}>
        {code.lang}
      </Txt>
      {bands.map(band)}

      {code.lines.map((l, i) => (
        <g key={l.no} opacity={lineIn(i)}>
          <text x={CODE.x0} y={rowY(l.no)} fontFamily={F.mono} fontSize={CODE.fs} xmlSpace="preserve" style={{whiteSpace: 'pre', fontVariantLigatures: 'none'}}>
            {tokenize(l.text).map((t, k) => (
              <tspan key={k} fill={t.c}>
                {t.t}
              </tspan>
            ))}
          </text>
        </g>
      ))}

      {underlines.map((u, k) => {
        const c = codeCol(code, u.no, u.tok, u.nth);
        const y = rowY(u.no);
        return (
          <RLine
            key={k}
            x1={tokX(c) - 2}
            y1={y + 9}
            x2={tokX(c + u.tok.length) + 2}
            y2={y + 9}
            stroke={u.color}
            sw={3}
            draw={u.draw}
            opacity={u.opacity ?? 1}
            roughness={0.6}
          />
        );
      })}
    </g>
  );
};
