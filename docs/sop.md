# 标准流程

一集视频分九个阶段。每个阶段都写明输入、命令、产出和验收条件；验收没过不进入下一阶段。阶段完成后在这一集的 `STATUS.md` 勾选，并同步 `videos/README.md` 的阶段列与系列总表的状态列。

阶段之间的依赖：大纲决定要取哪些数，数定了才能写脚本，脚本审过才能配音，配音定了时间轴，时间轴定了才能做画面。后一阶段发现前一阶段的问题时，回到前一阶段改，再往后重跑。

## 审阅方式

人工只在 S7 看成片，中途不看大纲、脚本和画面。S0–S6 由制作方一次做完，质量由两道审查把关，做法见 `docs/standards/review.md`：

- S3 审稿：配音之前，由没有参与写稿的上下文（子 agent 或新会话）按审稿清单 R1–R10 逐条审，每条写结论和页码证据，记进 `STATUS.md`。`vt tts` 核对当前脚本指纹的审稿记录，缺一条不配音。
- S5 画面审查：出片之前，同样由独立的上下文按 `visual.md` 的自查清单看四宫格。
- 写稿的上下文自己看一遍不算审查。
- 大纲偏离了系列大纲（换例子、换理由、加计划外的内容），在 `outline.md` 的「偏离系列大纲」一节写明原因，出片后写进「交片说明」。能照系列大纲做的，不偏离。

## S0 立项

- 输入：`curriculum/` 里某个系列总表中的一行，以及系列大纲开头的情景。一集只讲总表里写的那个主题。
- 命令：`node tools/vt.mjs new <id> <标题>`，id 与标题照抄总表。id 用小写字母、数字和连字符。
- 产出：`videos/<id>/`（从 `_template` 复制），`videos/registry.ts` 多一行，`videos/README.md` 多一行；系列总表里这一行的状态改为「S0 立项」。
- 验收：`npx remotion studio` 里能看到这一集（此时只有空白片头）；`vt curriculum` 零错误。

## S1 大纲

- 从系列大纲里这一集的条目出发，编写 `videos/<id>/outline.md`，按模板填写：
  - 观众起点：默认起点（见 `docs/standards/principle.md` 第一节）加上前置集讲过的概念。
  - 这一集要回答的一个问题。
  - 概念依赖链：按出现顺序列出每个概念，写明它依赖哪些前面的概念。前置集已经讲过的概念标「回顾」，只用一句话带过；新概念登记进 `curriculum/concepts.json`，叫法与已有概念统一。规则见 `docs/standards/principle.md`。
  - 类比：每个类比都写明它和原概念在哪一点上严格等价。
  - 数字清单：画面上会出现的每一个数字、位串、结果，各写出处类型（仿真、实测、文档、算术）和具体来源。
  - 代码范围：素材仓名、文件路径与行号区间，原理段怎样过渡到代码段；要翻译的代码词，按 `curriculum/terms.json` 标出完整翻译还是只高亮。没有对应代码的集写「无」。
  - 角色色。
  - 开场：前三句怎样从情景里的需求引出这一集的问题。
  - 偏离系列大纲：例子、理由、范围与系列大纲不同的地方，逐条写明原因；没有偏离写「无」。
  - 论断边界：为了不说错需要知道的限制。它只约束措辞（不说出错的话），不变成旁白里的限定语和画面上的小字，见 `docs/standards/narration.md` 第三节。
- 验收：链上没有「先用后讲」的概念；数字清单里的每个数都能说出由什么得到；旁白和画面要用的术语都在 `concepts.json` 里或属于观众起点；`vt curriculum` 零错误。

## S2 取数

- 在 `videos/<id>/evidence/` 放实验文件（例如仿真 testbench）和运行脚本 `run.sh`。需要素材源码时，`run.sh` 从环境变量 `SRC_<仓库名大写>` 取固定提交的快照目录，不写别的路径。
- 命令：`node tools/vt.mjs evidence <id>`。输出原样保存为日志文件，不手抄、不改格式。
- 验收：数字清单里出处为仿真或实测的每个数都能在日志里找到；出处为文档的写明文档与位置；出处为算术的写出算式。`STATUS.md` 记下运行命令、工具版本和日期。

## S3 脚本

- 编写 `videos/<id>/script.json`。一个 beat 是一句旁白加一次画面变化；每个 beat 有 `say`（送给 TTS 的朗读文本）和可选的 `sub`（字幕，缺省与 `say` 相同），可加 `hold`（语音结束后额外停留的秒数）。片头等无旁白的 beat 写 `silent`（秒）。beat id 是段落字母加两位序号：`t00` 片头、`p01` 起原理段、`c01` 起代码段。
- 有代码段时，在 `script.json` 的 `code` 数组里一段写一项：名字、素材仓名、文件路径与行号区间，例如 `{"name": "unpack", "source": "anchorfp", "path": "fp/rtl/fp32_mul_pipe.v", "from": 39, "to": 47}`，然后运行 `node tools/vt.mjs code <id>`。画面代码用 `codeSnippet(codeJson, 'unpack')` 按名字取段。
- 写法规则见 `docs/standards/narration.md`。写完运行：
  - `node tools/vt.mjs lint <id>`：必须零错误。提醒逐条处理：多音字听过读音后登记进 `tools/lexicon.json`，设问句和长句按规范改写或说明保留理由，别名改成标准叫法。
  - `node tools/vt.mjs table <id>`：生成 `build/script.md`，页码、字幕与朗读三栏，并打印脚本指纹。
- 审稿：按 `docs/standards/review.md` 第二节，由独立的上下文审 `build/script.md`，记录按第三节的格式写进 `STATUS.md` 的「脚本审稿」。有一条是「修改」，改脚本、重新 `table`、重新审稿。
- 验收：`lint` 零错误，提醒逐条有结论；当前脚本指纹有完整的审稿记录，R1–R10 全部通过。脚本改动（换行除外）会改变指纹，要重新审稿。

## S4 配音与时间轴

- 命令：`node tools/vt.mjs tts <id>`，然后 `node tools/vt.mjs asr <id>`。
- `tts` 先核对 `STATUS.md` 里有当前脚本指纹，没有就拒绝配音；完成后检查语速和片长是否在 `tools/limits.json` 的区间内，超出时退出码为 1。
- 产出：`audio/*.wav`（一句一个）、`build/manifest.json`（每个 beat 的起止帧）、`build/captions.srt`、`build/asr_check.json`。
- 回听校对：`asr` 把配音转回文字，在拼音层逐句比对，相似度低于 0.95 的句子会被标出。逐条判断是识别端听错（同音字、英文单词拼写）还是配音读错；读错的改 `lexicon.json` 或 `say`，再重跑 `tts`（只会重合成改过的句子）。
- 已知盲区：多音字读错通常查不出来，因为识别模型会按上下文写出正确的字。多音字靠 S3 的 `lint` 提醒和 S7 的审片把关。
- 验收：`tts` 退出码为 0；标出的句子都有结论并记进 `STATUS.md`。不能听音频的制作方，不写「已确认」，也不往 `lexicon.json` 的 `confirmed` 里加词；没登记读音的多音字所在页写进「交片说明」，审片时顺带听。

## S5 画面

- 编写 `videos/<id>/Video.tsx` 与 `scenes/*.tsx`。先查 `docs/architecture.md` 的组件表，能用现成组件的不另写；画面进度全部由 beat 驱动（`useT()` 的 `p`、`span`）；视觉规则见 `docs/standards/visual.md`。代码写法照参照成片的 `scenes/Code.tsx`：一个属性一行，每个场景开头注释写它对应哪几个 beat，一行不超过 `limits.json` 的 `sceneLineChars`。
- 预览：`npx remotion studio`。
- 检查：`npm run typecheck` 零错误（Remotion 打包时不查类型，拼错的属性名只会在这里暴露）；`node tools/vt.mjs check <id>` 四项全过（脚本、画面代码、时序、课程登记），画面代码的提醒逐条处理。改过脚本、时间轴变了之后重跑。
- 抽帧自查：`node tools/vt.mjs stills <id> 0.5 --all`。有旁白的 beat 取语音刚结束的那一帧，字幕仍在画面上；逐张看 `out/<id>/check/sheet-*.png`，按 `visual.md` 的自查清单检查。发现问题修完再抽一次。需要看细节时用比例 1 单独抽某一帧。
- 画面审查：自查改完后，由独立的上下文按 `docs/standards/review.md` 第四节再看一遍四宫格，记录写进 `STATUS.md` 的「画面审查」。
- 画面定下来之后：`node tools/vt.mjs baseline <id>`，记录回归基准。
- 验收：类型检查与 `check` 零错误，自查清单与画面审查全部通过，发现并修掉的问题记进 `STATUS.md`。

## S6 出片

- 命令：`node tools/vt.mjs render <id>`，然后 `node tools/vt.mjs master <id>`。
- 产出：`out/<id>/raw.mp4`（渲染原片）、`out/<id>/<id>.mp4`（成片）、`out/<id>/<id>.srt`（外挂字幕）、`out/<id>/probe.txt`（检查结果）。
- `master` 做两遍 loudnorm，把响度归一到 −14 LUFS，画面流原样拷贝，然后检查成片。
- 验收：`probe.txt` 里画面帧数与时间轴一致（容器时长会因 AAC 尾部填充略长，不作判据）、片头无旁白段静音、响度在 −14 ± 1 LUFS、峰值不高于 −1 dBFS。
- 交片：在 `STATUS.md` 写「交片说明」（`review.md` 第五节），连同成片一起交付，进入 S7。

## S7 审片与反馈

- 审片看成片，这是全流程唯一的人工审阅。画面左下角的页码就是审阅表的页码，反馈按页码定位；`vt page <id> <页码>` 给出对应的 beat 与时间。
- 反馈逐条记入 `STATUS.md` 的「反馈记录」，每条写明处理结果。
- 能推广到以后各集的反馈，按 `AGENTS.md` 铁律第 7 条落到规范、工具和裁决记录三处。
- 修改后回到受影响的最早阶段往后重跑；只改了画面时，跑 `regress` 确认只有预期的帧变了，然后重做 `baseline`。
- 审片通过后：这一版的脚本指纹记进 `STATUS.md` 的「审片通过」表；这一集 `vt lint` 提醒过的多音字词语，随成片听过，登记进 `lexicon.json` 的 `confirmed`，依据写「<id> 审片通过」，以后各集不再提醒。

## S8 发布

- 上传平台后，在 `STATUS.md` 记下平台链接、日期和成片的 sha256；`videos/README.md` 与系列总表的状态改为「已发布」。
- 课程登记：确认这一集引入的概念都在 `concepts.json`，完整翻译过的代码词都在 `terms.json`，`vt curriculum` 零错误。

## 改共享层时

改 `src/core/` 或 `src/components/` 之前，确认每一集都有回归基准；改完先跑 `npm run typecheck`，再对每一集运行 `node tools/vt.mjs regress <id>`。判定规则：逐字节相同或 PSNR ≥ 60 dB 算画面未变（Chrome 连续出图有亚像素抖动，实测 95–99 dB）；低于 60 dB 的帧逐张比对新旧图，确认是预期变化后重做该集的 `baseline`。
