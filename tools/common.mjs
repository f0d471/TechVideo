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

// Chrome 会自动升级，升级后出图可能有像素级变化；版本号记进回归基准，对不上时提示重做基准。
// Windows 上 chrome.exe --version 会启动浏览器，所以从文件属性读版本
export const chromeVersion = () => {
  if (!CHROME) return 'remotion-headless-shell';
  if (IS_WIN) return execSync(`powershell -NoProfile -Command "(Get-Item '${CHROME}').VersionInfo.ProductVersion"`).toString().trim();
  return execSync(`"${CHROME}" --version`).toString().trim();
};
