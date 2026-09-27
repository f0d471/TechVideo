// 全部视频的注册表：一集一行。tools/vt.mjs new 会自动追加
import {VideoDef} from '../src/core/VideoShell';
import fp32Rne from './fp32-rne/Video';

export const videos: VideoDef[] = [fp32Rne];
