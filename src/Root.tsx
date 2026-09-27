import React from 'react';
import {Composition} from 'remotion';
import {W, H} from './core/theme';
import {videos} from '../videos/registry';

// 每集注册成一个 Composition，id 与 videos/ 下的目录名相同
export const Root: React.FC = () => (
  <>
    {videos.map((v) => (
      <Composition key={v.id} id={v.id} component={v.Component} durationInFrames={v.manifest.totalFrames} fps={v.manifest.fps} width={W} height={H} />
    ))}
  </>
);
