// 工具共用的路径、环境常量与小函数
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import ENV from './env.cjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export {ENV};
export const CHROME = ENV.chrome;
export const PY_TTS = ENV.pyTts;
export const PY_ASR = ENV.pyAsr;

// 配音、回听校对、FFmpeg 在 bash 里运行。Windows 上转给 WSL，其他系统直接用本机 bash
const IS_WIN = process.platform === 'win32';
export const toShellPath = (p) => (IS_WIN ? '/mnt/' + p[0].toLowerCase() + p.slice(2).split(path.sep).join('/') : p);
export const SHELL_ROOT = toShellPath(ROOT);
const bashLine = (cmd) =>
  IS_WIN ? `wsl -e bash -c "cd '${SHELL_ROOT}' && ${cmd.replace(/"/g, '\\"')}"` : `bash -c "${cmd.replace(/"/g, '\\"')}"`;
// 在仓库根执行一段 bash；sh 把输出直接打到终端，shOut 返回输出文本
export const sh = (cmd, opts = {}) => execSync(bashLine(cmd), {stdio: 'inherit', cwd: ROOT, ...opts});
export const shOut = (cmd) => execSync(bashLine(cmd), {cwd: ROOT}).toString();

export const videoDir = (id) => path.join(ROOT, 'videos', id);
export const buildDir = (id) => path.join(videoDir(id), 'build');
export const outDir = (id) => path.join(ROOT, 'out', id);

export const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const loadScript = (id) => readJson(path.join(videoDir(id), 'script.json'));
export const loadManifest = (id) => readJson(path.join(buildDir(id), 'manifest.json'));

export const requireVideo = (id) => {
  if (!id || !fs.existsSync(path.join(videoDir(id), 'script.json'))) {
    throw new Error(`没有这一集：videos/${id}/script.json 不存在`);
  }
};

// 抽帧自查用的帧：有旁白的 beat 取语音结束后第 2 帧（字幕仍完全显示，这句话描述的画面已经到位），
// 无旁白的 beat 取最后一帧往前 2 帧
export const checkFrame = (m, id) => {
  const b = m.beats.find((x) => x.id === id);
  if (!b) throw new Error(`manifest 里没有 beat ${id}`);
  const last = b.start + b.frames - 2;
  return b.audio ? Math.min(b.start + b.audioFrom + b.audioFrames + 2, last) : last;
};

// 回归用的帧：每个 beat 取动画中途（起点后 20 帧）与结束各一帧
export const regressionFrames = (m) => {
  const s = new Set();
  for (const b of m.beats) {
    s.add(Math.min(b.start + 20, b.start + b.frames - 1));
    s.add(b.start + b.frames - 2);
  }
  return [...s].sort((a, b) => a - b);
};

// 页码：有旁白的 beat 按出现顺序从 1 编号，画面左下角显示同一个数，审片时按页码定位
export const pageOf = (beats) => {
  const pages = {};
  let n = 0;
  for (const b of beats) if (b.say || b.audio) pages[b.id] = ++n;
  return pages;
};

// 脚本指纹：只取每句的 id、朗读与字幕文本（字幕里的换行不算），停留时长与配音参数不影响。
// 审阅记录写在 STATUS.md，配音前核对指纹，保证配出来的就是审过的那一版
export const scriptFingerprint = (script) => {
  const body = script.beats
    .filter((b) => b.say)
    .map((b) => [b.id, b.say, (b.sub ?? b.say).replace(/\n/g, '')].join('\t'))
    .join('\n');
  return crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
};

// 系列顺序：curriculum/NN-*.md 的「## 总表」按文件名排序拼起来，集 id → 全局序号
export const seriesOrder = () => {
  const cur = path.join(ROOT, 'curriculum');
  const order = new Map();
  for (const f of fs.readdirSync(cur).filter((n) => /^\d+-.+\.md$/.test(n)).sort()) {
    const table = fs.readFileSync(path.join(cur, f), 'utf8').split(/^## 总表\s*$/m)[1]?.split(/^## /m)[0] ?? '';
    for (const row of table.split('\n').filter((l) => /^\|\s*\d+\s*\|/.test(l))) {
      const id = row.split('|')[2]?.match(/`([a-z0-9-]+)`/)?.[1];
      if (id && !order.has(id)) order.set(id, order.size);
    }
  }
  return order;
};

// 一段文字里出现了哪些概念：长的叫法先认（「规格化数」里的「规格化」不算），
// concepts.json 的 ignore 列出字面相同但不是这个概念的词语（「阶码和小数位」是阶码与小数位并列）
export const conceptsIn = (text, concepts) => {
  const taken = new Array(text.length).fill(false);
  const mark = (phrase) => {
    const hits = [];
    for (let i = text.indexOf(phrase); i >= 0; i = text.indexOf(phrase, i + 1)) {
      if (taken.slice(i, i + phrase.length).some(Boolean)) continue;
      for (let k = 0; k < phrase.length; k++) taken[i + k] = true;
      hits.push(i);
    }
    return hits.length > 0;
  };
  for (const c of concepts) for (const phrase of c.ignore ?? []) mark(phrase);
  const found = [];
  for (const c of [...concepts].sort((a, b) => b.name.length - a.name.length)) if (mark(c.name)) found.push(c);
  return found;
};

// Chrome 会自动升级，升级后出图可能有像素级变化；版本号记进回归基准，对不上时提示重做基准。
// Windows 上 chrome.exe --version 会启动浏览器，所以从文件属性读版本
export const chromeVersion = () => {
  if (!CHROME) return 'remotion-headless-shell';
  if (IS_WIN) return execSync(`powershell -NoProfile -Command "(Get-Item '${CHROME}').VersionInfo.ProductVersion"`).toString().trim();
  return execSync(`"${CHROME}" --version`).toString().trim();
};
