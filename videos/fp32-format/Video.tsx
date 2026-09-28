import React from 'react';
import {defineVideo} from '../../src/core/VideoShell';
import {Manifest} from '../../src/core/timeline';
import {SegmentLabel,TitleCard} from '../../src/components/Frame';
import {Origins} from './scenes/Origins';
import {Fields} from './scenes/Fields';
import {Special,Gradual} from './scenes/Special';
import {Ftz} from './scenes/Ftz';
import {Unpack} from './scenes/Unpack';
import {Classify,Ending} from './scenes/Classify';
import manifest from './build/manifest.json';
const Scenes:React.FC=()=><>
 <TitleCard eyebrow="浮点乘法 · 第 1 集" title="IEEE 754 与 FTZ" subtitle="一个小数，怎样放进 32 位" inBeat="t00" outBeat="p01" underline={[592,605,1324,601]}/>
 <SegmentLabel segments={[
 {label:'原理 · 为什么用浮点',from:'p01',to:'p26'},
 {label:'原理 · 三个字段',from:'p26',to:'p52'},
 {label:'原理 · 特殊值与逐渐下溢',from:'p52',to:'p68'},
 {label:'原理 · FTZ 的取舍',from:'p68',to:'c01'},
 {label:'代码 · 拆字段与补隐藏位',from:'c01',fromDelay:8,to:'c23'},
 {label:'代码 · 分类与输入冲零',from:'c23',fromDelay:8,to:'c39'},
 {label:'下一步 · 三路计算',from:'c39',fromDelay:8},
 ]}/>
 <Origins/><Fields/><Special/><Gradual/><Ftz/><Unpack/><Classify/><Ending/>
</>;
export default defineVideo('fp32-format',manifest as Manifest,Scenes);
