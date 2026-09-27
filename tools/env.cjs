// 本机环境：渲染用的 Chrome、Python 库的位置、素材源码仓的本地克隆。
// 取值顺序：环境变量 > tools/env.local.json（不入库，写法见 docs/toolchain.md）> 默认值。
// 写成 CommonJS，tools/*.mjs 与 remotion.config.ts 共用这一份
const fs = require('node:fs');
const path = require('node:path');

const localPath = path.join(__dirname, 'env.local.json');
const local = fs.existsSync(localPath) ? JSON.parse(fs.readFileSync(localPath, 'utf8')) : {};

// 常见的 Chrome 安装位置；都找不到时返回 null，Remotion 改用它自带的无头浏览器
const CHROME_CANDIDATES = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
};
const findChrome = () => (CHROME_CANDIDATES[process.platform] || []).find((p) => fs.existsSync(p)) || null;

module.exports = {
  chrome: process.env.TECHVIDEO_CHROME || local.chrome || findChrome(),
  // Python 库用 pip --target 装进这两个目录，运行时靠 PYTHONPATH 找到；路径在执行 Python 的那一侧解析
  pyTts: process.env.TECHVIDEO_PY_TTS || local.pyTts || '~/pylibs/tts',
  pyAsr: process.env.TECHVIDEO_PY_ASR || local.pyAsr || '~/pylibs/asr',
  // 素材源码仓的本地克隆，键是 curriculum/sources.json 里的名字；没写的仓库由工具克隆到 .cache/sources/
  sources: local.sources || {},
};
