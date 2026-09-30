# 工程结构

## 一、渲染原理

一段视频是一个函数：输入帧号，输出这一帧的画面。Remotion 用 React 写这个函数，渲染时打开无头 Chrome 逐帧截图，再用 FFmpeg 拼成视频、混入音频。画面上的一切都必须由帧号算出来：不用 CSS 动画、`setTimeout`、`requestAnimationFrame` 这类按真实时间走的写法，否则逐帧截图时画面会乱。Remotion 的写法约束以 `.agents/skills/remotion-best-practices/` 为准。

任意一帧都能单独渲染，这是抽帧自查（`vt stills`）和回归比对（`vt regress`）成立的前提。

## 二、一集的组成

```
videos/<id>/
  script.json      分镜脚本：配音参数、代码段列表（code 数组，每段一个名字）、beat 列表（唯一真源）
  outline.md       大纲：观众起点、概念链、类比、要实跑的数、代码范围、角色色
  STATUS.md        状态：阶段勾选、验收记录、反馈记录、待办
  Video.tsx        本集入口：片头、段落标签、各段场景，用 defineVideo 导出
  scenes/          本集的画面代码，一段一个文件
  evidence/        画面数字的出处：实验文件、run.sh、原始日志
  assets/          引用的图片与论文页面（公有领域或 CC BY），许可登记在 evidence/references.md
  audio/           生成，不入库：一句一个 wav，cache.json 记录文本哈希
  build/           生成：manifest.json 与 code.json 入库；captions.srt、asr_check.json、script.md 不入库
```

`Video.tsx` 用 `defineVideo(id, manifest, Scenes)` 导出，`videos/registry.ts` 收集后由 `src/Root.tsx` 注册成 Composition，Composition 的 id 与目录名相同。`remotion.config.ts` 把 `videos/` 设为静态资源目录，所以 `staticFile('<id>/audio/p01.wav')` 指向 `videos/<id>/audio/p01.wav`。

## 三、时间轴

`tools/build_audio.py` 读 `script.json`，逐句合成音频，按下式算出每个 beat 的帧数，写进 `build/manifest.json`：

```
frames = leadFrames + ceil(语音秒数 × 30) + gapFrames + round(hold × 30)
```

无旁白的 beat 帧数为 `round(silent × 30)`。beat 的起点是前面所有 beat 的帧数之和。字幕时间用同一组数算出，所以音频、字幕、画面三者不可能错位。改一句旁白，只有这一句重合成，后面的 beat 自动顺延。

## 四、共享层接口

### `src/core/`

| 文件 | 导出 | 用途 |
|---|---|---|
| `theme.ts` | `C`、`F`、`W`、`H` | 配色、字体、画面尺寸 |
| `timeline.ts` | `useT()`、`ManifestCtx`、类型 `Beat`、`Manifest` | 按 beat 计时 |
| `rough.tsx` | `RRect`、`RLine`、`RPath`、`REllipse`、`RArrow` | 手绘图元，`draw` 控制描线进度 |
| `VideoShell.tsx` | `defineVideo`、`VideoShell`、类型 `VideoDef` | 一集的外壳：计时上下文、字体预载、底色、画布、左下角页码、字幕（按 `sub` 里的 `\n` 换行，不自动折行）、分句配音；`inputProps.layoutProbe` 为真时挂载版面探针（只给 `vt layout` 用，正常渲染不挂载） |

`useT()` 返回：

- `p(beat, 延迟=0, 时长=18)`：从该 beat 起点延迟若干帧开始、历时若干帧的 0→1 进度，带缓动。
- `span(from, to?, 时长=12)`：`from` 开始时淡入、`to` 开始时淡出的不透明度。
- `s(beat)`、`end(beat)`：beat 的起止帧；`f`：当前帧；`beats`、`total`：整条时间轴。

引用不存在的 beat 会直接抛错，改脚本删了 beat 时，画面代码里的引用会在渲染时暴露出来。

### `src/components/`

| 文件 | 导出 | 用途 |
|---|---|---|
| `Prims.tsx` | `Txt`、`Bracket`、`Chip` | 文字（`mono` 为等宽且关连字）、方括号标注、概念卡 |
| `Frame.tsx` | `TitleCard`、`SegmentLabel`、`SectionTag`、`PartCard`，类型 `Part` | 片头卡、左上角段落与小节标签、无旁白的部件卡 |
| `BitStrip.tsx` | `BitStrip`、`STRIP`、`cellX`、`cellCX` | 位条（默认 48 位），按位设置外观 |
| `Powers.tsx` | `Powers` | 带指数的一行式子（`−3 × 10²`），指数小一号写在右上，不用 Unicode 上标 |
| `CodePanel.tsx` | `CodePanel`、`codeSnippet`、`panelHeight`、`CODE`、`tokenize`、`codeCol`、`tokX`，类型 `CodeFile`、`CodeSource` | 代码面板：显示 `code.json` 里的一个代码段（`codeSnippet(codeJson, 名字)` 取段），右上角只标语言名，面板高度随行数变化，宽度可由 `w` 指定（默认占满左右留白之间，结构图放右侧时给窄）；行按源文件行号对位但不画行号；行底色与记号下划线由调用方给出 |
| `TransTable.tsx` | `TransTable` | 逐词翻译表：代码 → 英文 → 中文 |
| `Gates.tsx` | `andPath`、`orPath`、`Wire`、`Val`、`Src` | 与门、或门、导线、信号值圆标、信号源格子 |

组件只负责画，时序由场景决定：场景用 `useT()` 算出不透明度和进度，作为属性传给组件。新组件先写在某一集的 `scenes/` 里，第二集要用时再提到这里，提取后对所有视频跑 `vt regress`。

## 五、字体加载

`VideoShell` 在渲染前把霞鹜文楷和 JetBrains Mono 的全部子集加载完（`delayRender`）。霞鹜文楷按 Unicode 区段拆成近百个子集，只按页面上的文字加载会漏掉个别字形，所以一次全部加载。

## 六、回归

`vt baseline` 对每个 beat 取两帧（起点后 20 帧、结束前 2 帧），以 0.5 倍尺寸出图并记录哈希与 Chrome 版本；`vt regress` 重新出图比对。逐字节相同或 PSNR ≥ 60 dB 视为画面未变：同一浏览器连续出图时有亚像素级抖动，实测 95–99 dB。时间轴变化后基准失效，需要确认画面后重做基准。

## 七、工具

`tools/vt.mjs` 是统一入口，各命令与 `docs/sop.md` 的阶段一一对应。

| 文件 | 用途 |
|---|---|
| `common.mjs` | 路径、页码、脚本指纹、抽帧取哪一帧、在 bash 里执行命令（Windows 上转给 WSL，其他系统直接用本机 bash） |
| `env.cjs` | 本机设置：环境变量 > `tools/env.local.json` > 默认值；`remotion.config.ts` 也读它 |
| `sources.mjs` | 素材源码：按 `curriculum/sources.json` 的固定提交读文件、解出快照目录 |
| `limits.json` | 各项数值界限：句长、字幕宽度、停留、语速、片长、字号、版面 |
| `lint_script.mjs` | 脚本检查（`vt lint`） |
| `lint_scenes.mjs` | 画面代码检查（`vt check` 的一项） |
| `check_curriculum.mjs` | 课程登记检查（`vt curriculum`） |
| `check_outline.mjs` | 系列大纲对照：概念链每一环对到 beat 或写成偏离（`vt check` 的一项）；`--items` 打印对照表第一列 |
| `extract_code.mjs` | 逐字抽代码（`vt code`） |
| `build_audio.py`、`asr_check.py` | 分句配音与时间轴、回听校对（在 bash 侧运行） |
| `review_audio.py` | vt asr 的 --review 模式，对 ASR 低分句做技术词提示复核；保留首轮结果，输出 build/asr_review.json，不替代人工听音 |
| `stills.mjs` | 单帧渲染，抽帧、版面检查与回归共用 |
| `layout.mjs` | 版面检查（`vt layout`）：带 `layoutProbe` 渲染检查帧，`VideoShell` 里的探针量出文字与图片外框，判越界、进字幕区与重叠，结果在 `out/<id>/layout/report.json` |
| `master.sh` | 响度归一化与成片检查 |
| `setup_env.sh` | bash 侧的 Python 库与语音识别模型 |
| `link_skills.mjs` | 重建 `.claude/skills/` 的目录链接 |

## 八、尚未实现

下面这些在规划里出现过，仓库里还没有，不要当成现成功能使用；需要时先实现，再写进上面的表。

- 状态变化处的轻提示音。
- 公式逐项变形的组件（一个式子逐项变成另一个式子）。
- 通用公式排版、核心公式条、引用卡、照片框、按坐标算端点的箭头。初版在 `videos/fp32-format/scenes/Kit.tsx`（`MathText` 逐字符定位，指数用小号 `tspan`；`FormulaBar`、`CiteCard`、`Photo`、`Arrow`、`Bars`）；小节标签与部件卡已提取到 `src/components/Frame.tsx`。其他组件跨集复用时再提取，提完对所有视频跑 `regress`。
- 任意位宽的位串组件。`src/components/BitStrip.tsx` 按 48 位的积写死；`videos/fp32-format/scenes/Kit.tsx` 的 `Bits32` 是 32 位的另一份。下一集再用到位串时，把两者合成一个按位宽参数化的共享组件，提完对所有视频跑 `regress`。

`videos/fp32-rne/scenes/` 里的抽象数轴与真值点（`Principle.tsx` 的 `AbstractLine`、`Dot`）、十进制对照数轴（`DecLine`）、判定树（`Node`、`Edge`、`Tree`）目前只由这一集使用。跨集复用时按第四节的规则提取到 `src/components/`，随后对已有视频运行 `vt regress`。
