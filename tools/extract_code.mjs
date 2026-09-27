// 从素材源码逐字抽取代码到 videos/<id>/build/code.json。视频里的代码只来自这里，不手抄
// 用法：node tools/extract_code.mjs <视频 id>；抽取范围写在 script.json 的 code 数组，一段一项：
//   "code": [{"name": "unpack", "source": "anchorfp", "path": "fp/rtl/fp32_mul_pipe.v", "from": 39, "to": 47}]
// name 是这段代码在画面代码里的名字（codeSnippet(codeJson, 'unpack')）；source 是 curriculum/sources.json
// 里的仓库名，文件取自那里固定的提交。每段是连续的几行，不超过 tools/limits.json 的 codeLines。
// code.json 记下仓库、提交与文件的 sha256，只作出处记录；画面上不显示文件名和源文件行号
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT, buildDir, loadScript, readJson, requireVideo} from './common.mjs';
import {readSourceFile, source} from './sources.mjs';

// 检查不通过时只打印原因，不打印调用栈
process.on('uncaughtException', (e) => {
  console.error(e.message);
  process.exit(1);
});

const LANG = {'.v': 'Verilog', '.sv': 'SystemVerilog', '.vh': 'Verilog', '.c': 'C', '.h': 'C', '.py': 'Python'};
const MAX_LINES = readJson(path.join(ROOT, 'tools/limits.json')).codeLines.max;

const id = process.argv[2];
requireVideo(id);
const spec = loadScript(id).code;
if (!spec) throw new Error(`videos/${id}/script.json 没有 code 字段`);
if (!Array.isArray(spec)) throw new Error('script.json 的 code 要写成数组，一段一项，每项带 name，见 docs/standards/code.md 第四节');

const dst = path.join(buildDir(id), 'code.json');
const old = fs.existsSync(dst) ? JSON.parse(fs.readFileSync(dst, 'utf8')) : null;
const snippets = {};
for (const s of spec) {
  if (!/^[a-z][a-z0-9-]*$/.test(s.name ?? '')) throw new Error(`代码段名字 ${s.name} 要用小写字母、数字和连字符，以字母开头`);
  if (snippets[s.name]) throw new Error(`代码段名字 ${s.name} 重复`);
  if (!(s.from >= 1 && s.to >= s.from)) throw new Error(`代码段 ${s.name} 的行号区间 ${s.from}–${s.to} 不对`);
  if (s.to - s.from + 1 > MAX_LINES) throw new Error(`代码段 ${s.name} 有 ${s.to - s.from + 1} 行，一个面板最多 ${MAX_LINES} 行，拆成两段`);
  const raw = readSourceFile(s.source, s.path);
  const all = raw.toString('utf8').split(/\r?\n/);
  if (s.to > all.length) throw new Error(`${s.path} 只有 ${all.length} 行`);
  const lines = [];
  for (let no = s.from; no <= s.to; no++) lines.push({no, text: all[no - 1]});
  const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  snippets[s.name] = {
    source: s.source,
    repo: source(s.source).repo,
    commit: source(s.source).commit,
    path: s.path,
    sha256,
    lang: LANG[path.extname(s.path)] ?? '',
    lines,
  };
  const before = old?.snippets?.[s.name];
  if (before?.sha256 && before.sha256 !== sha256) console.log(`注意：代码段 ${s.name} 的源文件与上次抽取时不同，核对画面里引用的行与记号`);
  console.log(`[${s.name}]`);
  console.log(lines.map((l) => `${l.no}|${l.text}`).join('\n'));
}
fs.mkdirSync(buildDir(id), {recursive: true});
fs.writeFileSync(dst, JSON.stringify({snippets}, null, 1) + '\n');
