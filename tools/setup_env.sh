#!/usr/bin/env bash
# bash 侧环境：配音、回听校对用的 Python 库，以及语音识别模型。可重复执行，已装好的会跳过
# 用法（bash，仓库根目录；Windows 上在 WSL 里）：bash tools/setup_env.sh
# 库用 pip --target 装进家目录，运行时靠 PYTHONPATH 指过去，不依赖 venv；位置与 tools/env.cjs 的默认值一致
set -euo pipefail
# PyPI 在部分地区直连常断，默认用清华镜像；可用环境变量 TECHVIDEO_PIP_INDEX 换成别的源
MIRROR=${TECHVIDEO_PIP_INDEX:-https://pypi.tuna.tsinghua.edu.cn/simple}

need() { command -v "$1" >/dev/null || { echo "缺少 $1，先 sudo apt install $2"; exit 1; }; }
need python3 python3
need pip3 python3-pip
need ffmpeg ffmpeg
need iverilog iverilog

if ! PYTHONPATH=~/pylibs/tts python3 -c "import edge_tts" 2>/dev/null; then
  pip3 install -q -i "$MIRROR" --target ~/pylibs/tts "edge-tts==7.2.8"
fi
if ! PYTHONPATH=~/pylibs/asr python3 -c "import faster_whisper, pypinyin" 2>/dev/null; then
  pip3 install -q --resume-retries 5 -i "$MIRROR" --target ~/pylibs/asr "faster-whisper==1.2.1" "pypinyin==0.55.0"
fi

# 语音识别模型：ModelScope 上的镜像，国内下载快；model.bin 的 sha256 与 HuggingFace 的 Systran/faster-whisper-small 一致
M=models/faster-whisper-small
SHA=3e305921506d8872816023e4c273e75d2419fb89b24da97b4fe7bce14170d671
mkdir -p "$M"
for f in config.json tokenizer.json vocabulary.txt model.bin; do
  [ -s "$M/$f" ] || curl -sL --retry 3 -o "$M/$f" "https://www.modelscope.cn/models/pengzhendong/faster-whisper-small/resolve/master/$f"
done
echo "$SHA  $M/model.bin" | sha256sum -c -

echo "bash 侧环境就绪"
