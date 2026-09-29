import {createContext, useContext} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export type Beat = {
  id: string;
  start: number;
  frames: number;
  audio?: string;
  audioFrom?: number;
  audioFrames?: number;
  sub?: string;
  section?: string; // 小节第一句带小节名，画面的小节标签按它切换
};

export type Manifest = {id: string; fps: number; totalFrames: number; beats: Beat[]};

export const ManifestCtx = createContext<Manifest | null>(null);

const ease = Easing.bezier(0.33, 0, 0.2, 1);

// 画面是状态机：每个 beat 的起点是一次状态跃迁，动画进度都相对某个 beat 计算
export const useT = () => {
  const m = useContext(ManifestCtx)!;
  const f = useCurrentFrame();
  const idx = new Map(m.beats.map((b) => [b.id, b]));
  const s = (id: string) => {
    const b = idx.get(id);
    if (!b) throw new Error(`unknown beat ${id}`);
    return b.start;
  };
  // 从 beat 起点延迟 d 帧开始、历时 len 帧的 0→1 进度
  const p = (id: string, d = 0, len = 18) =>
    interpolate(f, [s(id) + d, s(id) + d + len], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease,
    });
  // 某个 beat 开始时出现、另一个 beat 开始时消失
  const span = (from: string, to?: string, len = 12) => {
    const a = p(from, 0, len);
    return to ? a * (1 - p(to, 0, len)) : a;
  };
  const end = (id: string) => s(id) + idx.get(id)!.frames;
  return {f, s, p, span, end, beats: m.beats, total: m.totalFrames};
};
