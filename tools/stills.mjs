// 单帧渲染：一次打包、一个浏览器，按帧号批量出 PNG
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {CHROME, ROOT} from './common.mjs';

// frames: [{frame, name}]；返回每张图的 sha256。
// opts.inputProps 传给画面（例如 {layoutProbe: true}），opts.onLog(frame, text) 收页面里的 console.log
export const renderStills = async (id, scale, frames, dir, opts = {}) => {
  fs.mkdirSync(dir, {recursive: true});
  const inputProps = opts.inputProps ?? {};
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'videos')});
  // 收日志时不再让 Remotion 把页面日志打到终端
  const logLevel = opts.onLog ? 'error' : 'info';
  const browser = await openBrowser('chrome', {browserExecutable: CHROME, logLevel});
  const composition = await selectComposition({serveUrl, id, inputProps, logLevel, puppeteerInstance: browser, browserExecutable: CHROME});
  const hashes = {};
  for (const {frame, name} of frames) {
    const output = path.join(dir, `${name}.png`);
    const onBrowserLog = opts.onLog ? (log) => opts.onLog(frame, log.text) : undefined;
    await renderStill({composition, serveUrl, output, frame, scale, inputProps, onBrowserLog, logLevel, puppeteerInstance: browser, browserExecutable: CHROME});
    hashes[name] = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  await browser.close({silent: true});
  return hashes;
};
