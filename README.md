# TechVideo

计算机体系结构与数字电路的中文讲解视频，连同生产这些视频的全部源文件与工具。

一集回答一个问题。每集先讲原理，从高中数学出发把新概念一步步拆开；再看描述它的真实硬件代码，逐字引用，把代码当成结构图来读，画出它对应的电路。

现行样片是[第 6 集「寄存器与流水线」](videos/fp32-pipeline/)，2026-10-05 验收通过，片长 11 分 55 秒，待上传。它汇合了前五集的制作经验，是当前语言与美术风格的最佳范例：旁白平实地讲清操作与因果，画面用电路、时序图和逐拍过程把概念展开。后续制作以这一集为模板，具体参照见[风格模板](docs/standards/reference.md)。

下面两张图直接取自第 6 集验收通过的成片：

![第 6 集原理段：沿之前与沿之后的输入稳定时间，用时序图逐步展开](docs/images/principle.jpg)

![第 6 集代码段：代码在上、电路在下，同一个上升沿存下两级之间的值](docs/images/code.jpg)

已发布作品：[第 1 集「推理芯片怎么计算浮点数？FP32 与 IEEE 754」](https://www.bilibili.com/video/BV1YzaJ6FEzm/)。

## 系列

| 系列 | 内容 | 进度 |
|---|---|---|
| FP32 是怎么计算的 | 情景：AI 模型推理与为它设计的加速器芯片，软件和硬件的人都能听。第一部分沿一次乘法走完，从 IEEE 754 与 FTZ 讲到流水线，共 6 集 | 6 集均已完成并审片通过；第 1 集已发布，第 2–6 集待上传；第 6 集为现行样片 |

各集的概念、前置关系与计划见 `curriculum/01-fp32-mul.md`。

## 特点

- **画面由代码生成**：用 [Remotion](https://www.remotion.dev/)（React 与 SVG）逐帧渲染，浅色暖底，线条手绘，任意一帧都能单独渲染与比对。
- **语言与画面共同讲清过程**：从真实需求引出概念，旁白讲动作、原因和结果；角色色贯穿公式与电路，核心公式常驻，时序图与逐拍表格展示数据怎样流动。
- **画面、配音、字幕不会错位**：旁白一句一个音频，时间轴由每句的时长累加得到，字幕与画面动画都按同一条时间轴走。
- **数字有出处**：画面上的位串与结果来自对素材代码的仿真，实验文件与原始输出随每集保存。
- **代码逐字引用**：代码只从素材仓的固定提交中抽取，不改写。
- **规则可检查**：文案、字幕、画面代码、课程依赖的规则都有对应的检查命令，新的一集自动受同一套约束。

## 快速开始

需要 Node 24、git，以及一个 bash 环境（Linux、macOS，或 Windows 上的 WSL）：

```
npm ci
npx skills experimental_install
node tools/link_skills.mjs
bash tools/setup_env.sh              # bash 侧：配音与回听校对的 Python 库、语音识别模型
node tools/vt.mjs check fp32-pipeline  # 五项检查
node tools/vt.mjs code fp32-pipeline   # 从素材仓抽代码
node tools/vt.mjs tts fp32-pipeline    # 分句配音与时间轴
npx remotion studio                  # 预览
node tools/vt.mjs render fp32-pipeline # 渲染
node tools/vt.mjs master fp32-pipeline # 响度归一化，出成片与字幕
```

完整的环境说明见 `docs/toolchain.md`，一集从立项到发布的九个阶段见 `docs/sop.md`。

## 目录

```
AGENTS.md          入口：上下文分层、目录归属、铁律、命令表
docs/              流程、规范、工程结构、环境、裁决记录
curriculum/        系列大纲、概念表、代码词汇表、素材源码登记
src/               所有视频共用的底座与组件
videos/<id>/       一集的大纲、脚本、画面、出处、状态
tools/             统一入口 vt.mjs 与各项检查
```

## 参与制作

人或 AI agent 接手时从 `AGENTS.md` 开始读，它列出了阅读顺序、每类文件的归属和不能违反的规则。

## 许可证

- 代码（`.ts`、`.tsx`、`.mjs`、`.cjs`、`.py`、`.sh`、`.v` 与工程配置）：MIT，见 `LICENSE`。
- 内容（文档、课程登记、脚本、大纲、成片与图片）：CC BY-NC-SA 4.0，见 `LICENSE-CONTENT.md`。
- 视频里引用的代码来自 [Anchorfp](https://github.com/f0d471/Anchorfp)，以 SHL-2.1 或 Apache-2.0 许可。
- 字体霞鹜文楷与 JetBrains Mono 以 SIL OFL 1.1 许可。
- Remotion 使用自己的许可证，部分组织商用需要购买授权，见 [remotion.dev/license](https://www.remotion.dev/license)。
