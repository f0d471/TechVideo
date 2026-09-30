// 大纲对照：系列大纲里这一集的概念链（和类比）逐环对到脚本的 beat；没做的一环写成偏离，出片时进交片说明
// 用法：node tools/check_outline.mjs <视频 id> [--items]；有错误时退出码为 1；--items 打印对照表的第一列
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, loadScript, requireVideo, videoDir} from './common.mjs';

const id = process.argv[2];
requireVideo(id);
const errors = [];
const squash = (s) => s.replace(/\s+/g, '').replace(/。$/, '');

// 系列大纲里这一集的条目：「## N `id` 标题」到下一个「## 」
const cur = path.join(ROOT, 'curriculum');
const entry = fs
  .readdirSync(cur)
  .filter((f) => /^\d+-.+\.md$/.test(f))
  .map((f) => fs.readFileSync(path.join(cur, f), 'utf8'))
  .map((t) => t.split(new RegExp(`^## \\d+ \`${id}\`.*$`, 'm'))[1]?.split(/^## /m)[0])
  .find(Boolean);
if (!entry) {
  console.log(`大纲对照：系列大纲里没有 ${id} 的条目`);
  process.exit(1);
}

// 概念链一行，或「概念链，分几部分：」加缩进的子项（子项开头的「思路：」这类小标题去掉）；各环用 → 分开
const items = [];
const lines = entry.split('\n');
const at = lines.findIndex((l) => /^- 概念链[^：]*：/.test(l));
if (at >= 0) {
  const parts = [lines[at].replace(/^- 概念链[^：]*：/, '')];
  for (let i = at + 1; i < lines.length && /^\s+- /.test(lines[i]); i++) parts.push(lines[i].replace(/^\s+- ([^：→]{1,8}：)?/, ''));
  for (const p of parts) for (const x of p.split('→')) if (squash(x)) items.push(x.trim().replace(/。$/, ''));
}
const analogy = lines.find((l) => l.startsWith('- 类比：'));
if (analogy) items.push(analogy.replace(/^- /, '').split('。')[0]);
if (!items.length) {
  console.log('大纲对照：系列大纲的这一集没有概念链，不需要对照');
  process.exit(0);
}
// --items 打印各环原文，写对照表时照抄
if (process.argv.includes('--items')) {
  console.log(items.map((x) => `| ${x} |  |`).join('\n'));
  process.exit(0);
}

const outline = fs.readFileSync(path.join(videoDir(id), 'outline.md'), 'utf8');
const section = (title) => outline.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))?.[1];
const table = section('系列大纲对照');
if (table === undefined) {
  // 规则加上之前已经审片通过的旧稿，不追补对照表
  const status = fs.readFileSync(path.join(videoDir(id), 'STATUS.md'), 'utf8');
  if (/^\|[^\n]*审片通过/m.test(status.split(/^## 审片通过/m)[1] ?? '')) {
    console.log('大纲对照：这一集在规则加上之前已审片通过，没有对照表，跳过');
    process.exit(0);
  }
  errors.push('outline.md 缺「## 系列大纲对照」一节：系列大纲的每一环写一行，第二列写落在哪几个 beat，没做的写「偏离：原因」');
}

const deviation = section('偏离系列大纲') ?? '';
const beats = new Set(loadScript(id).beats.filter((b) => b.say).map((b) => b.id));
const rows = (table ?? '')
  .split('\n')
  .filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l))
  .slice(1)
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const listed = new Set();
for (const [item = '', where = ''] of rows) {
  if (!items.some((x) => squash(x) === squash(item))) {
    errors.push(`对照表第一列「${item}」不是系列大纲概念链里的原文，照抄系列大纲的那一环`);
    continue;
  }
  listed.add(squash(item));
  if (where.startsWith('偏离')) {
    if (!squash(deviation).includes(squash(item))) errors.push(`「${item}」写了偏离，但「## 偏离系列大纲」里没有写到这一环`);
    continue;
  }
  const ids = where.match(/\b[a-z]\d{2}\b/g) ?? [];
  if (!ids.length) errors.push(`「${item}」没写落在哪几个 beat，也没写偏离`);
  for (const b of ids) if (!beats.has(b)) errors.push(`「${item}」写的 beat ${b} 在 script.json 里不存在或没有旁白`);
}
if (table !== undefined) for (const x of items) if (!listed.has(squash(x))) errors.push(`系列大纲的「${x}」不在对照表里`);

for (const e of errors) console.log(`错误 ${e}`);
console.log(`大纲对照：系列大纲 ${items.length} 环，${errors.length} 个错误`);
process.exit(errors.length ? 1 : 0);
