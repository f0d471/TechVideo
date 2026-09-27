# TechVideo

技术讲解视频的生产仓库。一集回答一个问题，讲一个概念或几个连贯的小概念，对应 `videos/` 下的一个目录。一个系列可以有一个贯穿的情景，设计取舍都放回情景里解释。画面用 Remotion（React 与 SVG）逐帧渲染，旁白用 TTS 分句合成，时间轴由每句旁白的时长累加得到。每集先讲原理，把新概念拆到观众已有的知识；有对应代码时再讲代码，逐字引用、逐行翻译，并画出对应的电路或结构。

## 上下文分层

做一集视频需要的信息分六层，每层只放在一个地方。不同模型接手时读同一套文件、受同一套检查约束，产出落在同一个区间里。

| 层 | 回答什么 | 位置 | 机器检查 |
|---|---|---|---|
| 流程 | 一集分几步，每步的命令、产出、验收 | `docs/sop.md` | 各命令自带的门槛 |
| 规范 | 原理怎么讲、代码怎么讲、文案怎么写、画面怎么画 | `docs/standards/`，数值界限在 `tools/limits.json` | `vt lint`、`vt check` |
| 元素 | 能用的画面组件、配色字体、计时接口 | `src/core/`、`src/components/`，说明在 `docs/architecture.md` | `npm run typecheck`、`vt regress` |
| 课程 | 系列与每集的概念、讲过的概念和代码词、素材从哪来 | `curriculum/` | `vt curriculum` |
| 单集 | 这一集的大纲、脚本、画面、出处、状态 | `videos/<id>/` | `vt check <id>` |
| 来由 | 规则为什么这样定，来自哪次审片 | `docs/decisions.md` | — |

冲突时以规范为准；`decisions.md` 只解释来由，不单独作为依据。`docs/architecture.md` 第八节列出尚未实现的能力，不在那张表之外假定有别的现成功能。

## 开工前按顺序读

1. 本文件。
2. `docs/sop.md`。
3. `docs/standards/` 下的四份规范：`principle.md`（原理课）、`code.md`（代码课）、`narration.md`（文案与朗读）、`visual.md`（视觉）。
4. `curriculum/README.md` 与要做的那一集所在的系列大纲（`curriculum/NN-<系列>.md`）。
5. `docs/decisions.md`。
6. 要接手的那一集的 `videos/<id>/STATUS.md`，以及 `videos/README.md`。
7. 写画面代码之前：`docs/architecture.md`，以及 `.agents/skills/remotion-best-practices/SKILL.md`（Remotion 官方的 API 手册，按它的指引再读对应的子文档；克隆后按 `docs/toolchain.md` 恢复）。

参照成片是 `videos/fp32-rne`：它走完了全部流程，版面、节奏、代码段的讲法都以它为准。

## 目录与归属

每个文件只属于表里的一格。「源」由人或 agent 编写；「生成」只由 `tools/` 下的脚本写，不手改，删掉后可以重建；「外部」来自仓库以外，只用表里写的方式更新；「本机」只在本机存在，不入库。

| 路径 | 内容 | 归属 | 什么时候改 |
|---|---|---|---|
| `AGENTS.md`、`CLAUDE.md`、`README.md` | 入口文档 | 源 | 流程或目录结构变化时 |
| `LICENSE`、`LICENSE-CONTENT.md` | 代码与内容的许可证 | 源 | 一般不动 |
| `docs/sop.md`、`docs/standards/`、`docs/decisions.md` | 流程、规范、裁决 | 源 | 规则变化时，见下文「规则怎么演进」 |
| `docs/architecture.md`、`docs/toolchain.md` | 工程结构、环境 | 源 | 共享层接口或环境变化时 |
| `docs/images/` | README 用的图 | 源 | 参照成片有新版本时 |
| `curriculum/` | 系列大纲、概念表、代码词汇表、素材源码登记 | 源 | 见 `curriculum/README.md` |
| `src/core/` | 所有视频共用的底座：配色字体、计时、手绘图元、视频外壳（页码与字幕） | 源 | 改完对所有视频跑 `regress` |
| `src/components/` | 跨集复用的可视化组件 | 源 | 同上 |
| `src/index.ts`、`src/Root.tsx` | Remotion 入口，按注册表注册每一集 | 源 | 一般不动 |
| `videos/registry.ts` | 所有视频的注册表，一集一行 | 源 | `vt new` 自动追加 |
| `videos/README.md` | 已立项视频的索引与当前阶段 | 源 | 任何一集阶段变化时 |
| `videos/_template/` | 新建一集时复制的模板 | 源 | 模板本身需要改进时 |
| `videos/<id>/script.json`、`outline.md`、`STATUS.md`、`Video.tsx`、`scenes/`、`evidence/` | 这一集的源文件 | 源 | 只在做这一集时 |
| `videos/<id>/build/manifest.json`、`build/code.json` | 时间轴、抽出的代码 | 生成，入库 | 只由 `vt tts`、`vt code` 写。画面代码直接引用它们，入库后克隆下来就能类型检查和预览，改动也能在 diff 里看到 |
| `videos/<id>/audio/`、`build/` 里的其他文件 | 配音、字幕、校对结果、审阅表 | 生成 | 只由 `vt` 的命令写，不入库 |
| `tools/` | 流程脚本，统一入口 `tools/vt.mjs`；`limits.json` 是各项数值界限；`lexicon.json` 是全局读法词典；`env.cjs` 读本机设置 | 源 | 流程变化或新增检查项时 |
| `tools/env.local.json` | 本机路径：Chrome、Python 库、素材仓的本地克隆 | 本机 | 写法见 `docs/toolchain.md` |
| `.agents/skills/` | Remotion 官方 skill | 外部，不入库 | `npx skills experimental_install` 按 `skills-lock.json` 恢复 |
| `.claude/skills/` | 指向 `.agents/skills/` 的目录链接，供 Claude Code 自动发现 | 生成，不入库 | `node tools/link_skills.mjs` 重建 |
| `skills-lock.json` | skill 的来源与哈希 | 外部 | 随 `npx skills` 更新 |
| `package.json`、`package-lock.json`、`tsconfig.json`、`remotion.config.ts`、`.gitignore`、`.gitattributes` | 工程配置 | 源 | 升级依赖、改渲染设置、改入库范围时 |
| `models/` | 本地语音识别模型 | 外部，不入库 | 按 `docs/toolchain.md` 下载并校验 |
| `.cache/` | 素材仓的克隆与固定提交的快照 | 生成，不入库 | 由 `vt code`、`vt evidence` 写 |
| `out/<id>/` | 抽帧、回归图、成片 | 生成，不入库 | 由 `vt` 的命令写 |
| `node_modules/` | npm 依赖 | 生成，不入库 | `npm ci` |

新增文件时：

1. 先在上表里找到它的归属。属于某一集的文件，一律放进 `videos/<id>/`。
2. 新组件先写在这一集的 `scenes/` 里。等第二集也要用，再提到 `src/components/`，提完对所有视频跑 `regress`。
3. 生成物只进 `audio/`、`build/`、`out/`、`.cache/`。其他位置出现生成物，说明工具写错了地方。
4. 放不进表里任何一格的文件，先改这张表，再加文件。
5. 仓库里不写本机的绝对路径。本机相关的设置只进 `tools/env.local.json`。

## 铁律

1. 视频讲通用知识，不讲某个项目。旁白、字幕、画面上不出现素材仓名、文件名和源文件行号；`vt lint` 与 `vt check` 会查。
2. 画面上的每个数字都要有出处（仿真、实测、引用的文档或写明算式的算术），登记在这一集 `outline.md` 的数字清单里，实验与原始输出放在 `evidence/`。
3. 代码逐字引用，只能由 `vt code` 从素材仓的固定提交抽取，不许改写。
4. 脚本审过才配音：`vt lint` 零错误，提醒逐条处理，审阅表 `build/script.md` 审过后把脚本指纹记进 `STATUS.md`，`vt tts` 会核对。
5. 改了 `src/core/` 或 `src/components/`，对所有视频跑 `vt regress`。
6. 每完成一个阶段就更新这一集的 `STATUS.md`；阶段变化同步到 `videos/README.md` 和系列总表。
7. 审片反馈里能写成规则的，同时落到三处：`docs/standards/` 的条文、`tools/` 的检查（`lint_script.mjs`、`lint_scenes.mjs`、`limits.json` 或 `lexicon.json`）、`docs/decisions.md` 的记录。
8. 仓库里的文字不用 emoji，状态写成 `[ ]` 与 `[x]`；代码注释不用横线分隔；文档不写「用户确认」这类人称视角，只描述仓库里的文件与规则。

## 规则怎么演进

规范文件是当前生效的规则，只写现在怎么做。规则为什么变、从哪次审片来，写在 `docs/decisions.md`。改规则时两边同时改；能机器判断的规则，同时改 `tools/` 里对应的检查或 `limits.json`，让下一集自动受约束。

## 常用命令

所有命令在仓库根目录执行，入口是 `node tools/vt.mjs <命令> <视频 id>`：

```
node tools/vt.mjs new fp32-normalize 规格化     新建一集（id 与标题照抄系列总表）
node tools/vt.mjs lint fp32-rne                 检查脚本
node tools/vt.mjs table fp32-rne                生成脚本审阅表，打印脚本指纹
node tools/vt.mjs code fp32-rne                 从素材仓的固定提交逐字抽代码
node tools/vt.mjs evidence fp32-rne             在固定提交上跑出处实验，刷新原始日志
node tools/vt.mjs tts fp32-rne                  分句配音与时间轴，核对审阅指纹，检查语速与片长
node tools/vt.mjs asr fp32-rne                  回听校对
node tools/vt.mjs check fp32-rne                脚本、画面代码、时序、课程登记四项检查
node tools/vt.mjs stills fp32-rne 0.5 --all     每个 beat 抽一帧（带字幕）并拼四宫格
node tools/vt.mjs page fp32-rne 23              页码对应的 beat 与时间
node tools/vt.mjs baseline fp32-rne             记录回归基准
node tools/vt.mjs regress fp32-rne              回归比对
node tools/vt.mjs render fp32-rne               整片渲染
node tools/vt.mjs master fp32-rne               响度归一化并出成片与字幕
node tools/vt.mjs curriculum                    课程登记检查
npx remotion studio                             打开 Remotion 预览界面
npm run typecheck                               类型检查
```
