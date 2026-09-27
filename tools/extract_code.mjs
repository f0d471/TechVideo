// 从素材源码逐字抽取代码行到 videos/<id>/build/code.json。视频里的代码只来自这里，不手抄
// 用法：node tools/extract_code.mjs <视频 id>；抽取范围写在 script.json 的 code 字段：
//   "code": {"source": "anchorfp", "path": "fp/rtl/fp32_mul_pipe.v", "from": 131, "to": 137}
// source 是 curriculum/sources.json 里的仓库名，文件取自那里固定的提交。
// code.json 记下仓库、提交与文件的 sha256，只作出处记录；画面上不显示文件名和源文件行号
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {buildDir, loadScript, requireVideo} from './common.mjs';
import {readSourceFile, source} from './sources.mjs';

const LANG = {'.v': 'Verilog', '.sv': 'SystemVerilog', '.vh': 'Verilog', '.c': 'C', '.h': 'C', '.py': 'Python'};

const id = process.argv[2];
requireVideo(id);
const spec = loadScript(id).code;
if (!spec) throw new Error(`videos/${id}/script.json 没有 code 字段`);
const raw = readSourceFile(spec.source, spec.path);
const all = raw.toString('utf8').split(/\r?\n/);
if (spec.to > all.length) throw new Error(`${spec.path} 只有 ${all.length} 行`);
const lines = [];
for (let no = spec.from; no <= spec.to; no++) lines.push({no, text: all[no - 1]});
const out = {
  source: spec.source,
  repo: source(spec.source).repo,
  commit: source(spec.source).commit,
  path: spec.path,
  sha256: crypto.createHash('sha256').update(raw).digest('hex'),
  lang: LANG[path.extname(spec.path)] ?? '',
  lines,
};
const dst = path.join(buildDir(id), 'code.json');
const old = fs.existsSync(dst) ? JSON.parse(fs.readFileSync(dst, 'utf8')) : null;
fs.mkdirSync(buildDir(id), {recursive: true});
fs.writeFileSync(dst, JSON.stringify(out, null, 1) + '\n');
if (old?.sha256 && old.sha256 !== out.sha256) console.log('注意：源文件与上次抽取时不同，核对画面里引用的行与记号');
console.log(lines.map((l) => `${l.no}|${l.text}`).join('\n'));
