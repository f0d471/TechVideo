// 课程登记检查：curriculum/ 下的系列总表、概念表、词汇表、素材登记彼此一致，每一集都在某个系列里
// 用法：node tools/check_curriculum.mjs；有错误时退出码为 1
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, readJson} from './common.mjs';

const CUR = path.join(ROOT, 'curriculum');
const errors = [];

// 系列总表：文件名前的序号是系列顺序，表格第二列是集 id，第五列是前置集
const order = new Map(); // 集 id → 全局序号
const series = fs.readdirSync(CUR).filter((f) => /^\d+-.+\.md$/.test(f)).sort();
for (const f of series) {
  const text = fs.readFileSync(path.join(CUR, f), 'utf8');
  const table = text.split(/^## 总表\s*$/m)[1]?.split(/^## /m)[0] ?? '';
  const rows = table.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l));
  if (!rows.length) errors.push(`${f}：没有找到「## 总表」表格`);
  for (const row of rows) {
    const cells = row.split('|').map((c) => c.trim());
    const id = cells[2]?.match(/`([a-z0-9-]+)`/)?.[1];
    if (!id) {
      errors.push(`${f}：总表这一行的第二列不是集 id：${row}`);
      continue;
    }
    if (order.has(id)) errors.push(`${f}：集 ${id} 在总表里重复`);
    for (const pre of cells[5]?.matchAll(/`([a-z0-9-]+)`/g) ?? []) {
      if (!order.has(pre[1])) errors.push(`${f}：${id} 的前置 ${pre[1]} 不在它前面`);
    }
    order.set(id, order.size);
  }
}

// 做过的每一集都要在某个系列里
for (const d of fs.readdirSync(path.join(ROOT, 'videos'), {withFileTypes: true})) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  if (!order.has(d.name)) errors.push(`videos/${d.name} 不在任何系列的总表里`);
  const sp = path.join(ROOT, 'videos', d.name, 'script.json');
  const code = fs.existsSync(sp) ? readJson(sp).code : undefined;
  if (code && !Array.isArray(code)) errors.push(`videos/${d.name}/script.json 的 code 要写成数组，一段一项`);
  for (const c of [code ?? []].flat()) {
    if (!(c.source in readJson(path.join(CUR, 'sources.json')))) errors.push(`videos/${d.name}/script.json 的代码段 ${c.name} 的 source ${c.source} 不在 sources.json 里`);
  }
}

// 概念表
const concepts = readJson(path.join(CUR, 'concepts.json'));
const byId = new Map();
const names = new Set();
for (const c of concepts) {
  for (const k of ['id', 'name', 'def', 'episode']) if (!c[k]) errors.push(`concepts.json：${c.id ?? '?'} 缺 ${k}`);
  if (byId.has(c.id)) errors.push(`concepts.json：id ${c.id} 重复`);
  if (names.has(c.name)) errors.push(`concepts.json：叫法「${c.name}」重复`);
  if (!order.has(c.episode)) errors.push(`concepts.json：${c.id} 的 episode ${c.episode} 不在任何系列的总表里`);
  byId.set(c.id, c);
  names.add(c.name);
}
for (const c of concepts) {
  for (const d of c.deps ?? []) {
    const dep = byId.get(d);
    if (!dep) errors.push(`concepts.json：${c.id} 依赖的 ${d} 不存在`);
    else if (order.get(dep.episode) > order.get(c.episode)) {
      errors.push(`concepts.json：${c.id}（${c.episode}）依赖 ${d}，但 ${d} 由更靠后的 ${dep.episode} 引入`);
    }
  }
}

// 词汇表
const terms = readJson(path.join(CUR, 'terms.json'));
const codes = new Set();
for (const t of terms) {
  for (const k of ['code', 'en', 'zh', 'episode']) if (!t[k]) errors.push(`terms.json：${t.code ?? '?'} 缺 ${k}`);
  if (codes.has(t.code)) errors.push(`terms.json：${t.code} 重复`);
  if (!order.has(t.episode)) errors.push(`terms.json：${t.code} 的 episode ${t.episode} 不在任何系列的总表里`);
  codes.add(t.code);
}

// 素材登记
for (const [name, s] of Object.entries(readJson(path.join(CUR, 'sources.json')))) {
  if (!/^https:\/\//.test(s.repo ?? '')) errors.push(`sources.json：${name} 的 repo 要写 https 地址`);
  if (!/^[0-9a-f]{40}$/.test(s.commit ?? '')) errors.push(`sources.json：${name} 的 commit 要写完整的 40 位提交号`);
  if (!s.license) errors.push(`sources.json：${name} 缺 license`);
}

for (const e of errors) console.log(`错误 ${e}`);
console.log(`课程登记：${series.length} 个系列，${order.size} 集，${concepts.length} 个概念，${terms.length} 个代码词：${errors.length} 个错误`);
process.exit(errors.length ? 1 : 0);
