import React from 'react';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest} from '../../src/core/timeline';
import {SegmentLabel, TitleCard} from '../../src/components/Frame';
import {Main} from './scenes/Main';
import manifest from './build/manifest.json';

// __TITLE__：片头 t00，原理段从 p01 开始；有代码段时从 c01 开始，并在 SegmentLabel 加一段
const Scenes: React.FC = () => (
  <>
    <TitleCard eyebrow="系列名" title="__TITLE__" subtitle="这一集要回答的一个问题" inBeat="t00" outBeat="p01" />
    <SegmentLabel segments={[{label: '原理 · __TITLE__', from: 'p01'}]} />
    <Main />
  </>
);

export default defineVideo('__ID__', manifest as Manifest, Scenes);
