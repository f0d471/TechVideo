// 单帧渲染：一次打包、一个浏览器，按帧号批量出 PNG
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {CHROME, ROOT} from './common.mjs';

// frames: [{frame, name}]；返回每张图的 sha256
export const renderStills = async (id, scale, frames, dir) => {
  fs.mkdirSync(dir, {recursive: true});
  const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'videos')});
  const browser = await openBrowser('chrome', {browserExecutable: CHROME});
  const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser, browserExecutable: CHROME});
  const hashes = {};
  for (const {frame, name} of frames) {
    const output = path.join(dir, `${name}.png`);
    await renderStill({composition, serveUrl, output, frame, scale, puppeteerInstance: browser, browserExecutable: CHROME});
    hashes[name] = crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex');
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  await browser.close({silent: true});
  return hashes;
};
