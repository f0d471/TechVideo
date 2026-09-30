# 环境与安装

Node 侧工具（Remotion 渲染、抽帧、各项检查）在本机运行。配音、回听校对、FFmpeg 相关步骤在 bash 里运行：Windows 上由 `tools/vt.mjs` 自动转给 WSL，Linux 与 macOS 上直接用本机 bash。

## 一、版本

| 组件 | 版本 | 说明 |
|---|---|---|
| Node | 24（开发时用 24.16.0） | |
| Remotion | 4.0.529（全部 `@remotion/*` 锁定同一版本，升级时一起升） | `package-lock.json` 锁定 |
| React | 19 | 同上 |
| roughjs | 4.6.6 | 同上 |
| TypeScript | 5.9.3（只做类型检查，`npm run typecheck`） | 同上 |
| 字体 | 霞鹜文楷 `lxgw-wenkai-webfont` 1.7.0，`@fontsource/jetbrains-mono` 5.3.0 | 同上 |
| Chrome | 回归基准记录的版本见 `out/<id>/baseline/hashes.json` | 本机安装版，位置自动探测 |
| Python（bash 侧） | 3.12 及以上（开发时用 3.14.4） | |
| edge-tts | 7.2.8 | `setup_env.sh` 安装 |
| faster-whisper / ctranslate2 / pypinyin | 1.2.1 / 4.8.2 / 0.55.0 | 同上 |
| 语音识别模型 | faster-whisper small（int8，CPU） | `models/faster-whisper-small`，不入库 |
| FFmpeg（bash 侧） | 8.0.1 | 系统包 |
| Icarus Verilog（bash 侧） | 12.0 | 系统包，用于 `evidence/` 里的仿真 |
| git | 任意近期版本 | 素材源码按固定提交读取 |

## 二、从零搭环境

1. Node 依赖：在仓库根目录执行 `npm ci`。Remotion 打包时只从项目自己的 `node_modules` 解析依赖，所以依赖必须装在仓库里。
2. skill：`npx skills experimental_install` 按 `skills-lock.json` 把 Remotion 官方 skill 恢复到 `.agents/skills/`，再执行 `node tools/link_skills.mjs` 生成 `.claude/skills/` 的目录链接。恢复取的是上游当前的版本，完成后如果 `skills-lock.json` 有变化，按第四节核对。
3. bash 侧：Windows 上执行 `wsl -e bash -c "cd <仓库在 WSL 里的路径> && bash tools/setup_env.sh"`，其他系统在仓库根目录执行 `bash tools/setup_env.sh`。它装好两组 Python 库、下载语音识别模型并校验 sha256，已装好的部分会跳过。需要 `python3`、`python3-pip`、`ffmpeg`、`curl`、`iverilog`，缺哪个脚本会提示。
4. 本机设置（可选）：需要时新建 `tools/env.local.json`，见第三节。
5. 验证：`node tools/vt.mjs check fp32-format` 五项全过；`node tools/vt.mjs code fp32-format` 能抽出代码；`node tools/vt.mjs stills fp32-format 0.5 p24` 能出图（需要先 `vt tts fp32-format` 生成配音）。

## 三、本机设置

`tools/env.cjs` 按「环境变量 > `tools/env.local.json` > 默认值」取值。`env.local.json` 不入库，只写需要改的项：

```
{
  "chrome": "Chrome 可执行文件的路径",
  "pyTts": "~/pylibs/tts",
  "pyAsr": "~/pylibs/asr",
  "sources": {"anchorfp": "素材仓本地克隆的路径，相对仓库根或绝对路径"}
}
```

| 项 | 环境变量 | 默认值 |
|---|---|---|
| `chrome` | `TECHVIDEO_CHROME` | 在各系统的常见安装位置里找 Chrome；找不到时用 Remotion 自带的无头浏览器（首次使用会下载） |
| `pyTts`、`pyAsr` | `TECHVIDEO_PY_TTS`、`TECHVIDEO_PY_ASR` | `~/pylibs/tts`、`~/pylibs/asr`（在 bash 侧解析，与 `setup_env.sh` 的安装位置一致） |
| `sources` | — | 没写的素材仓由工具克隆到 `.cache/sources/<名字>.git` |

素材源码只按 `curriculum/sources.json` 里的提交号读取，本地克隆的工作区有没有改动都不影响结果。

## 四、skill 的位置与更新

- 真实文件在 `.agents/skills/`。这是 skills 命令行的通用位置，Codex、OpenCode 等 agent 从这里读取。
- `.claude/skills/` 里每一项都是指向 `.agents/skills/` 的目录链接，供 Claude Code 自动发现。
- 这两个目录都不入库：上游仓库没有声明许可证，不随本仓库再分发。来源与哈希记在 `skills-lock.json`，克隆后按第二节恢复。
- `skills-lock.json` 只记来源与哈希，不记上游的提交号，所以恢复与更新都会取到上游当前的版本，并改写哈希。Windows 上换行符不同也会让哈希变化。`skills-lock.json` 有变化时，逐个比对变化的 skill：只有换行符不同的，还原 `skills-lock.json`；内容真的变了的，通读变化的 `SKILL.md`，确认没有与本仓库规范冲突的新规则后再提交新的 `skills-lock.json`。
- 更新：`npx skills add remotion-dev/skills -s '*' -a claude-code -a codex -a opencode -y`，完成后按上一条核对。
- 不管某个 agent 是否支持自动发现 skill，`AGENTS.md` 都要求写 Remotion 代码前读 `.agents/skills/remotion-best-practices/SKILL.md`。

## 五、网络

| 目标 | 状况 | 做法 |
|---|---|---|
| edge-tts 在线合成 | 偶发超时；部分地区直连会被拒绝 | `build_audio.py` 每句重试 4 次；需要时给 bash 侧配代理 |
| PyPI | 部分地区直连常断 | `setup_env.sh` 默认用清华镜像，环境变量 `TECHVIDEO_PIP_INDEX` 可换成别的源 |
| HuggingFace 与 hf-mirror | 部分地区下载模型很慢 | `setup_env.sh` 从 ModelScope 镜像下载，用 sha256 核对与原版一致 |
| Remotion 自带的无头浏览器 | 从 Google 存储下载，部分地区很慢 | 用本机 Chrome，见第三节 |

## 六、Chrome 升级

本机 Chrome 会自动升级，升级后同一帧的像素可能有细微变化。`vt baseline` 把 Chrome 版本记进基准，`vt regress` 发现版本不同时会提示。升级后先跑一次 `regress`：只有亚像素抖动时照常；出现真实差异时，逐张确认画面正确后重做基准。

## 七、注意事项

- 在 WSL 里执行 bash 用 `bash -c`，不用 `bash -lc`。
- Windows 上不要运行 `chrome.exe --version`，它会启动浏览器而不是打印版本；版本号用 `tools/common.mjs` 的 `chromeVersion()` 读取。
- 含中文的文件不要用 perl 批量修改，用 Node 或 Python。
- 仓库用 LF 换行（`.gitattributes`），bash 脚本在 CRLF 下无法运行。
