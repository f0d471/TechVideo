// 画面代码检查：把 docs/standards/visual.md 里能机器判断的规则落成检查项，数值界限取自 tools/limits.json
// 用法：node tools/lint_scenes.mjs <视频 id>；检查 videos/<id>/ 下的 .tsx（audio、build、evidence 除外）。
// 有「错误」时退出码为 1，「提醒」需要逐条看过
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, loadScript, readJson, requireVideo, videoDir} from './common.mjs';

const id = process.argv[2];
requireVideo(id);
const LIMITS = readJson(path.join(ROOT, 'tools/limits.json'));
const SOURCES = readJson(path.join(ROOT, 'curriculum/sources.json'));
const script = loadScript(id);

const projectNames = Object.keys(SOURCES);
if (script.code) projectNames.push(path.basename(script.code.path).replace(/\.[^.]+$/, ''));

const ERRORS = [
  [/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/, '颜色字面量：颜色只用 src/core/theme.ts 的 C'],
  [/linearGradient|radialGradient|<filter|\bfilter[=:]|feGaussianBlur|blur\(|[bB]oxShadow|[tT]extShadow|drop-shadow/, '渐变、滤镜、阴影：视觉效果的上限是手绘'],
  [/perspective|rotate[XY3]|translate3d|matrix3d/, '三维变换：视觉效果的上限是手绘'],
  [/Math\.random|Date\.now|new Date\(|setTimeout|setInterval|requestAnimationFrame/, '按真实时间或随机数变化：画面必须由帧号算出'],
  [/\banimation\s*:|\btransition\s*:|@keyframes/, 'CSS 动画：画面必须由帧号算出'],
];

// 去掉注释，只检查代码和画面文字
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const p = path.join(d, e.name);
    if (e.isDirectory() && !['audio', 'build', 'evidence'].includes(e.name)) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
};
walk(videoDir(id));

const errors = [];
const warns = [];
const {fontSize: FS} = LIMITS;
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  stripComments(fs.readFileSync(file, 'utf8'))
    .split('\n')
    .forEach((line, i) => {
      const at = `${rel}:${i + 1}`;
      for (const [re, why] of ERRORS) if (re.test(line)) errors.push(`${at} ${why}`);
      for (const n of projectNames) if (line.toLowerCase().includes(n.toLowerCase())) errors.push(`${at} 画面代码里出现素材项目或文件名 ${n}`);
      for (const m of line.matchAll(/\b(?:size|fontSize)=\{(\d+(?:\.\d+)?)\}/g)) {
        const v = +m[1];
        if ((v < FS.min || v > FS.max) && v !== FS.title) warns.push(`${at} 字号 ${v}，规定 ${FS.min}–${FS.max}（片头标题 ${FS.title}）`);
      }
      if (/useCurrentFrame\(/.test(line)) warns.push(`${at} 场景直接读帧号：画面进度用 useT() 的 p、span，按 beat 驱动`);
      if (/第\s*\d+\s*行/.test(line)) warns.push(`${at} 画面文字里有「第 N 行」：确认是片段内的相对行，不是源文件行号`);
    });
}

for (const e of errors) console.log(`错误 ${e}`);
for (const w of warns) console.log(`提醒 ${w}`);
console.log(`画面代码 ${files.length} 个文件：${errors.length} 个错误，${warns.length} 个提醒`);
process.exit(errors.length ? 1 : 0);
