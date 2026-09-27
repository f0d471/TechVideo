import {Config} from '@remotion/cli/config';
import env from './tools/env.cjs';

Config.setEntryPoint('src/index.ts');
// 每集的音频在 videos/<id>/audio/，staticFile('<id>/audio/<beat>.wav') 从这里解析
Config.setPublicDir('videos');
// 渲染用的 Chrome 与 tools/*.mjs 共用 tools/env.cjs；找不到本机 Chrome 时用 Remotion 自带的无头浏览器
if (env.chrome) Config.setBrowserExecutable(env.chrome);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(6);
