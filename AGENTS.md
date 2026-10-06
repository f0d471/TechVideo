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

## 按阶段读

只读当前阶段要用的文件，不要一开始把全部规范读一遍。

| 什么时候 | 读 |
|---|---|
| 每次接手 | 本文件、`docs/sop.md`、`docs/standards/reference.md`、这一集的 `videos/<id>/STATUS.md` |
| S1–S2 大纲与取数 | `docs/standards/principle.md`、`curriculum/README.md`、系列大纲（`curriculum/NN-<系列>.md`）里这一集的条目 |
| S3 脚本 | `docs/standards/narration.md`；有代码段时加 `docs/standards/code.md`；参照成片的 `script.json` |
| S5 画面 | `docs/standards/visual.md`（第七节元素表）、`docs/architecture.md`、参照成片的 `scenes/`（原理段与代码段都读，看元素怎样拼成过程）；Remotion 的 API 不熟时查 `.agents/skills/remotion-best-practices/SKILL.md`（克隆后按 `docs/toolchain.md` 恢复） |
| S7 处理反馈 | `docs/decisions.md` 里相关的那一节 |

现行参照成片是第 6 集 `videos/fp32-pipeline`（2026-10-05 审片通过，待上传）。它汇合了前五集的制作经验，是当前语言与美术风格的最佳范例；后续各集的平实讲述、概念递进、角色色、时序图、逐拍过程和代码版式都以这一版为模板。具体场景与阅读顺序见 `docs/standards/reference.md`。动手前按当前阶段读它的 `script.json`、`Video.tsx` 和对应的 `scenes/`，写完逐项对照。`videos/_template` 是新建立项的文件骨架，整集风格以第 6 集为准。第 1 集 `videos/fp32-format` 保留为已发布作品与位域讲解的局部例子；规范中「反例（fp32-format 首稿／第二稿）」记录的是改版前的偏差，按条文里的改法处理。

## 目录与归属

每个文件只属于表里的一格。「源」由人或 agent 编写；「生成」只由 `tools/` 下的脚本写，不手改，删掉后可以重建；「外部」来自仓库以外，只用表里写的方式更新；「本机」只在本机存在，不入库。

| 路径 | 内容 | 归属 | 什么时候改 |
|---|---|---|---|
| `AGENTS.md`、`CLAUDE.md`、`README.md` | 入口文档 | 源 | 流程或目录结构变化时 |
| `LICENSE`、`LICENSE-CONTENT.md` | 代码与内容的许可证 | 源 | 一般不动 |
| `docs/sop.md`、`docs/standards/`、`docs/decisions.md` | 流程、规范、裁决 | 源 | 规则变化时，见下文「规则怎么演进」 |
| `docs/architecture.md`、`docs/toolchain.md` | 工程结构、环境 | 源 | 共享层接口或环境变化时 |
| `docs/images/` | README 用的图 | 源 | README 展示画面需要更新时 |
| `curriculum/` | 系列大纲、概念表、代码词汇表、素材源码登记 | 源 | 见 `curriculum/README.md` |
| `src/core/` | 所有视频共用的底座：配色字体、计时、手绘图元、视频外壳（页码与字幕） | 源 | 改完对所有视频跑 `regress` |
| `src/components/` | 跨集复用的可视化组件 | 源 | 同上 |
| `src/index.ts`、`src/Root.tsx` | Remotion 入口，按注册表注册每一集 | 源 | 一般不动 |
| `videos/registry.ts` | 所有视频的注册表，一集一行 | 源 | `vt new` 自动追加 |
| `videos/README.md` | 已立项视频的索引与当前阶段 | 源 | 任何一集阶段变化时 |
| `videos/_template/` | 新建一集时复制的模板 | 源 | 模板本身需要改进时 |
| `videos/<id>/script.json`、`outline.md`、`STATUS.md`、`Video.tsx`、`scenes/`、`evidence/` | 这一集的源文件 | 源 | 只在做这一集时 |
| `videos/<id>/assets/` | 引用的图片与论文页面（公有领域或 CC BY），作者与许可登记在 `evidence/references.md` | 外部，入库 | 只在做这一集时，按 `docs/standards/principle.md` 第十三节 |
| `videos/<id>/build/manifest.json`、`build/code.json` | 时间轴、抽出的代码 | 生成，入库 | 由 `vt tts`、`vt code` 写。画面代码直接引用它们，入库后克隆下来就能类型检查和预览，改动也能在 diff 里看到 |
| `videos/<id>/audio/`、`build/` 里的其他文件 | 配音、字幕、校对结果、审阅表 | 生成 | 只由 `vt` 的命令写，不入库 |
| `tools/` | 流程脚本，统一入口 `tools/vt.mjs`；`limits.json` 是各项数值界限（音色、语速、片长可按系列在 `seriesOverrides` 覆盖）；`lexicon.json` 是全局读法词典；`env.cjs` 读本机设置 | 源 | 流程变化或新增检查项时 |
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
2. 画面只用 `docs/standards/visual.md` 第七节元素表里的元素拼。需要新的元素种类时，先在表里加一行，组件写进 `src/components/`，再用；场景文件里只做组合与计时，不另起一种框或卡片的样式。改了已有组件，对所有视频跑 `regress`。
3. 生成物只进 `audio/`、`build/`、`out/`、`.cache/`。其他位置出现生成物，说明工具写错了地方。
4. 放不进表里任何一格的文件，先改这张表，再加文件。
5. 仓库里不写本机的绝对路径。本机相关的设置只进 `tools/env.local.json`。

## 铁律

1. 视频讲通用知识，不讲某个项目。旁白、字幕、画面上不出现素材仓名、文件名和源文件行号，也不拿「这个乘法器」当主语，知识点放在系列的情景里讲；`vt lint` 与 `vt check` 会查。
2. 画面上的每个数字都要有出处（仿真、实测、引用的文档或写明算式的算术），登记在这一集 `outline.md` 的数字清单里，实验与原始输出放在 `evidence/`。
3. 代码逐字引用，只能由 `vt code` 从素材仓的固定提交抽取，不许改写。
4. 质量靠命令把关，不另开上下文审稿或审画面：`vt lint` 零错误才配音，`vt make` 里的检查全过才出片。人工只在 S7 看成片，中途不看脚本（`docs/sop.md`「审阅方式」）。机器查不了的几条由写的人自查，不写审查记录。
5. 改了 `src/core/` 或 `src/components/`，对所有视频跑 `vt regress`。
6. S0–S2 完成时更新这一集的 `STATUS.md`，并同步到 `videos/README.md` 和系列总表；S3 之后的阶段由 `vt make`、`vt accept` 自动记录，不手写长段的验收记录。
7. 审片反馈里能写成规则的，同时落到三处：`docs/standards/` 的条文、`tools/` 的检查（`lint_script.mjs`、`lint_scenes.mjs`、`layout.mjs`、`limits.json` 或 `lexicon.json`）、`docs/decisions.md` 的记录。能写成检查的，不写成人工审查的清单。
8. 仓库里的文字不用 emoji，状态写成 `[ ]` 与 `[x]`；代码注释不用横线分隔；文档不写「用户确认」这类人称视角，只描述仓库里的文件与规则。
9. 按系列大纲做：例子、理由、范围照系列大纲；要偏离时写进 `outline.md` 的「偏离系列大纲」并在交片说明里列出，不在脚本里自行改理由、加限定。
10. 各层只放本层的东西：`docs/decisions.md` 只记已定的裁决和审片反馈，制作中自己的取舍写进这一集的 `outline.md`；`curriculum/concepts.json` 的定义写通用知识，不写某个实现的做法；`tools/` 是跨集的，不写某一集的内容。

## 规则怎么演进

规范文件是当前生效的规则，只写现在怎么做。规则为什么变、从哪次审片来，写在 `docs/decisions.md`。改规则时两边同时改；能机器判断的规则，同时改 `tools/` 里对应的检查或 `limits.json`，让下一集自动受约束。

## 常用命令

所有命令在仓库根目录执行，入口是 `node tools/vt.mjs <命令> <视频 id>`。下面以第 6 集 `fp32-pipeline` 为命令参数；新建命令里的 id 与标题照系列总表填写：

```
node tools/vt.mjs new fp32-normalize 规格化     新建一集（id 与标题照抄系列总表）
node tools/vt.mjs lint fp32-pipeline                 检查脚本
node tools/vt.mjs table fp32-pipeline                生成脚本通读表（可选），打印脚本指纹
node tools/vt.mjs code fp32-pipeline                 从素材仓的固定提交逐字抽代码
node tools/vt.mjs evidence fp32-pipeline             在素材仓的固定提交上跑出处实验，刷新原始日志
node tools/vt.mjs tts fp32-pipeline                  分句配音与时间轴，检查语速与片长
node tools/vt.mjs check fp32-pipeline                脚本、画面代码、时序、课程登记、系列大纲对照五项检查
node tools/vt.mjs layout fp32-pipeline               版面检查：越界、进字幕区、文字重叠，只列有问题的帧
node tools/vt.mjs stills fp32-pipeline 0.5 p22 c11   抽几帧（带字幕）看效果
node tools/vt.mjs make fp32-pipeline                 出片一条龙：配音、检查、版面、渲染、母版、交片说明
node tools/vt.mjs make fp32-pipeline --from master   渲染之后的步骤失败时接着跑
node tools/vt.mjs accept fp32-pipeline               审片通过：记指纹、登记多音字、记回归基准
node tools/vt.mjs page fp32-pipeline 23              页码对应的 beat 与时间
node tools/vt.mjs regress fp32-pipeline              回归比对（改了共享层时）
node tools/vt.mjs asr fp32-pipeline                  回听校对（可选）
node tools/vt.mjs curriculum                    课程登记检查
npx remotion studio                             打开 Remotion 预览界面
npm run typecheck                               类型检查
```
