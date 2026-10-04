// 全部视频的注册表：一集一行。tools/vt.mjs new 会自动追加
import {VideoDef} from '../src/core/VideoShell';
import fp32Rne from './fp32-rne/Video';
import fp32Format from './fp32-format/Video';
import fp32Mul from './fp32-mul/Video';
import fp32Normalize from './fp32-normalize/Video';
import fp32Boundary from './fp32-boundary/Video';
import fp32Pipeline from './fp32-pipeline/Video';

export const videos: VideoDef[] = [fp32Rne, fp32Format, fp32Mul, fp32Normalize, fp32Boundary, fp32Pipeline];
