# 标准流程

一集视频分九个阶段。每个阶段都写明输入、命令、产出和验收条件；验收没过不进入下一阶段。S0–S2 完成后手动在这一集的 `STATUS.md` 勾选，并同步 `videos/README.md` 的阶段列与系列总表的状态列；S3–S7 由 `vt make` 与 `vt accept` 勾选和同步。

一集的做法：写大纲、取数、写脚本（`vt lint`）→ `vt tts` 得到时间轴 → 写画面（`vt check`、`vt layout`）→ `vt make` 出片 → 审片 → `vt accept`。

阶段之间的依赖：大纲决定要取哪些数，数定了才能写脚本，脚本 `lint` 过了才能配音，配音定了时间轴，时间轴定了才能做画面。后一阶段发现前一阶段的问题时，回到前一阶段改，再往后重跑。

## 审阅方式

人工只在 S7 看成片，中途不看大纲、脚本和画面。S0–S6 由制作方一次做完，不另开上下文审稿或审画面：能机器判断的规则都在命令里（`vt lint`、`vt check`、`vt layout`、成片检查），判断不了的由写的人按本文件 S3、S5 的几条自查一遍，不写审查记录。出片用 `vt make` 一条命令跑完，审片通过用 `vt accept` 登记。

- 发现一类问题反复出现，把它写成检查项（`AGENTS.md` 铁律第 7 条），不加人工审查的环节。
- 大纲偏离了系列大纲（换例子、换理由、加计划外的内容），在 `outline.md` 的「偏离系列大纲」一节写明原因，`vt make` 会把每条的第一句写进「交片说明」。能照系列大纲做的，不偏离。

## S0 立项

- 输入：`curriculum/` 里某个系列总表中的一行，以及系列大纲开头的情景。一集只讲总表里写的那个主题。
- 命令：`node tools/vt.mjs new <id> <标题>`，id 与标题照抄总表。id 用小写字母、数字和连字符。
- 产出：`videos/<id>/`（从 `_template` 复制），`videos/registry.ts` 多一行，`videos/README.md` 多一行；系列总表里这一行的状态改为「S0 立项」。
- 验收：`npx remotion studio` 里能看到这一集（此时只有空白片头）；`vt curriculum` 零错误。

## S1 大纲

- 从系列大纲里这一集的条目出发，编写 `videos/<id>/outline.md`，按模板填写：
  - 观众起点：默认起点（见 `docs/standards/principle.md` 第一节）加上前置集讲过的概念。
  - 这一集要回答的一个问题。
  - 概念依赖链：按出现顺序列出每个概念，写明它依赖哪些前面的概念，以及「画法」：用元素表（`docs/standards/visual.md` 第七节）里的哪种元素画，运算写出过程怎样一步步画出来（`docs/standards/principle.md` 第四节之二）。前置集已经讲过的概念标「回顾」，只用一句话带过；新概念登记进 `curriculum/concepts.json`，叫法与已有概念统一。规则见 `docs/standards/principle.md`。
  - 类比：每个类比都写明它和原概念在哪一点上严格等价。
  - 数字清单：画面上会出现的每一个数字、位串、结果，各写出处类型（仿真、实测、文档、算术）和具体来源。
  - 代码范围：素材仓名、文件路径与行号区间，原理段怎样过渡到代码段；要翻译的代码词，按 `curriculum/terms.json` 标出完整翻译还是只高亮。没有对应代码的集写「无」。
  - 角色色。
  - 开场：前三句怎样从情景里的需求引出这一集的问题。
  - 系列大纲对照：系列大纲里这一集的概念链（和类比）每一环写一行，第一列照抄原文（`node tools/check_outline.mjs <id> --items` 打印），第二列写落在哪几个 beat；没做的一环写「偏离：原因」，并写进下一项。S3 写完脚本后把 beat 号填上，`vt check` 逐环核对。
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
  - `node tools/vt.mjs lint <id>`：必须零错误。提醒里的设问句、长句、防御性限定按规范改掉；多音字不用处理，审片时听，`vt accept` 统一登记。
  - `node tools/vt.mjs table <id>`（可选）：生成 `build/script.md`，页码、字幕与朗读三栏，通读时用。
- 写完自查一遍，这几条机器查不了，不写记录：
  - 前三句说出这一集要回答的问题；每个小节第一句从上一节的问题接过来。
  - 新概念在第一次用到之前讲过；后面几集才讲的概念、登记过的别名、「主例」这类制作用语由 `lint` 报错，同一集里的先用后讲靠自查。
  - 只看例子得出的结论和旁白一致，没有构造出来的巧合；理由照系列大纲。
  - 只读朗读一栏从头到尾，相邻两句能补出因果或转折。
  - 每个结论带着它的理由：为什么相加、为什么是四十八位、为什么看最高位。画面上的十六进制数，旁白要把它换算到结论用到的那一位（「九是一零零一，最高位是一」），不让观众自己换算。
  - 画面上的数都在 `outline.md` 的数字清单里；引用的说法不超出 `evidence/references.md` 的摘录。
- 验收：`lint` 零错误。

## S4 配音与时间轴

- 命令：`node tools/vt.mjs tts <id>`。`lint` 有错误时不配音；完成后检查语速和片长是否在 `tools/limits.json` 的区间内，超出时退出码为 1。
- 配音用 edge-tts 在线合成，整集旁白文本会发给在线服务。旁白本来就随成片公开发布，仓库也是公开的，这一步是既定做法，不换成离线配音；音色固定在 `limits.json` 的 `voice`，`lint` 查。
- 产出：`audio/*.wav`（一句一个，按文本缓存，改一句只重合成一句）、`build/manifest.json`（每个 beat 的起止帧）、`build/captions.srt`。
- 回听校对 `vt asr` 不在默认流程里：它查不出多音字（识别模型会按上下文写出正确的字），逐句判断又费时。审片时听出读错的，改 `lexicon.json` 的 `replace` 或 `say`，重跑 `vt make`。
- 验收：`tts` 退出码为 0。

## S5 画面

- 编写 `videos/<id>/Video.tsx` 与 `scenes/*.tsx`。画面只用 `docs/standards/visual.md` 第七节元素表里的元素拼，照大纲「画法」一列画，场景里不直接画框；画面进度全部由 beat 驱动（`useT()` 的 `p`、`span`）；视觉规则见 `docs/standards/visual.md`。代码写法照参照成片的 `scenes/Code.tsx`：一个属性一行，每个场景开头注释写它对应哪几个 beat，一行不超过 `limits.json` 的 `sceneLineChars`。
- 预览：`npx remotion studio`。
- 检查：`npm run typecheck` 零错误（Remotion 打包时不查类型，拼错的属性名只会在这里暴露）；`node tools/vt.mjs check <id>` 五项全过（脚本、画面代码、时序、课程登记、系列大纲对照），画面代码的提醒逐条处理。改过脚本、时间轴变了之后重跑。
- 版面检查：`node tools/vt.mjs layout <id> [beat...]`。在浏览器里量出每个 beat 检查帧（语音刚结束、字幕仍在）的文字与图片外框，报越过左右边距、进入字幕区、文字互相重叠，以及只有散字和标签框的页过多、代码页没有电路、标签框的字不居中；只列有问题的帧和对应的 PNG（`out/<id>/layout/`），只看这几张。界限在 `limits.json` 的 `layout`。
- 抽帧：写一个场景时用 `node tools/vt.mjs stills <id> 0.5 <beat>...` 抽这个场景的几帧看效果，按 `visual.md` 第六节里机器查不了的几条（对齐、疏密、推进、公式条）看一眼。不做整集逐张的审查。
- 验收：类型检查、`check`、`layout` 零错误。回归基准在审片通过时由 `vt accept` 记录。

## S6 出片

- 命令：`node tools/vt.mjs make <id>`。依次跑配音（没改的句子走缓存）、类型检查、`check`、`layout`、渲染、母版、成片检查，任何一步失败就停下，只打印这一步的输出末尾，完整输出在 `out/<id>/make.log`。渲染之后的步骤失败时，改完用 `--from master` 接着跑，不重新渲染（步骤名：tts、typecheck、check、layout、render、master）。
- 产出：`out/<id>/raw.mp4`（渲染原片）、`out/<id>/<id>.mp4`（成片）、`out/<id>/<id>.srt`（外挂字幕）、`out/<id>/probe.txt`（检查结果）。`master` 做两遍 loudnorm，把响度归一到 −14 LUFS，画面流原样拷贝。
- 成片检查：画面帧数与时间轴一致（容器时长会因 AAC 尾部填充略长，不作判据）、响度在 −14 ± 1 LUFS、峰值不高于 −1 dBFS。
- 全部通过后，`make` 自动写 `STATUS.md` 的「交片说明」（片长、配音音色与语速、偏离系列大纲的条目、没登记读音的多音字及页码）和一行验收记录，勾选 S3–S6，阶段改为「S7 待审片」。交付时给成片和这几行。

## S7 审片与反馈

- 审片看成片，这是全流程唯一的人工审阅。画面左下角的页码就是审阅表的页码，反馈按页码定位；`vt page <id> <页码>` 给出对应的 beat 与时间。
- 反馈逐条记入 `STATUS.md` 的「反馈记录」，每条写明处理结果。
- 能推广到以后各集的反馈，按 `AGENTS.md` 铁律第 7 条落到规范、工具和裁决记录三处。
- 修改后回到受影响的最早阶段往后重跑；只改了画面时，跑 `regress` 确认只有预期的帧变了，然后重做 `baseline`。
- 审片通过后：`node tools/vt.mjs accept <id>`。它把脚本指纹记进 `STATUS.md` 的「审片通过」表，把这一集 `vt lint` 提醒过的多音字上下文登记进 `lexicon.json` 的 `confirmed`（依据写「<id> 审片通过」，以后各集不再提醒），记录回归基准，勾选 S7，阶段改为「S8 发布（待上传）」。

## S8 发布

- 上传平台后，在 `STATUS.md` 记下平台链接、日期和成片的 sha256；`videos/README.md` 与系列总表的状态改为「已发布」。
- 课程登记：确认这一集引入的概念都在 `concepts.json`，完整翻译过的代码词都在 `terms.json`，`vt curriculum` 零错误。

## 改共享层时

改 `src/core/` 或 `src/components/` 之前，确认每一集都有回归基准；改完先跑 `npm run typecheck`，再对每一集运行 `node tools/vt.mjs regress <id>`。判定规则：逐字节相同或 PSNR ≥ 60 dB 算画面未变（Chrome 连续出图有亚像素抖动，实测 95–99 dB）；低于 60 dB 的帧逐张比对新旧图，确认是预期变化后重做该集的 `baseline`。
