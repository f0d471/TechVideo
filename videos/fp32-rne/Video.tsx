import React from 'react';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest} from '../../src/core/timeline';
import {SegmentLabel, TitleCard} from '../../src/components/Frame';
import {Principle} from './scenes/Principle';
import {Code} from './scenes/Code';
import manifest from './build/manifest.json';

// FP32 乘法 · 舍入：原理段 p01–p24，代码段 c01–c14
const Scenes: React.FC = () => (
  <>
    <TitleCard eyebrow="浮点乘法" title="舍入" subtitle="积比格子长，多出来的位怎么办" inBeat="t00" outBeat="p01" />
    <SegmentLabel
      segments={[
        {label: '原理 · 舍入', from: 'p01', to: 'c01'},
        {label: '代码 · 舍入', from: 'c01', fromDelay: 10},
      ]}
    />
    <Principle />
    <Code />
  </>
);

export default defineVideo('fp32-rne', manifest as Manifest, Scenes);
