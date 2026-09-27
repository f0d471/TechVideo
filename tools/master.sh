#!/usr/bin/env bash
# 出片最后一步：两遍 loudnorm 把响度归一到 -14 LUFS、真峰值 -1.5 dBTP，画面流原样拷贝；
# 再拷出外挂字幕，并把检查结果写进 out/<id>/probe.txt
# 用法（bash 侧，仓库根目录）：bash tools/master.sh <视频 id>，一般通过 node tools/vt.mjs master <id> 调用
set -euo pipefail
id=$1
raw=out/$id/raw.mp4
fin=out/$id/$id.mp4
[ -f "$raw" ] || { echo "没有 $raw，先跑 render"; exit 1; }

m=$(ffmpeg -hide_banner -i "$raw" -vn -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$m" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
ffmpeg -hide_banner -loglevel error -y -i "$raw" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a aac -b:a 192k "$fin"
cp "videos/$id/build/captions.srt" "out/$id/$id.srt"

# 检查项：画面帧数与时间轴一致、第一句旁白之前静音、响度与峰值。
# 容器时长会比时间轴略长，是 AAC 每 1024 个采样一帧留下的尾部填充，不作为判据
expect=$(python3 -c "import json;m=json.load(open('videos/$id/build/manifest.json'));print(m['totalFrames'])")
first=$(python3 -c "import json;m=json.load(open('videos/$id/build/manifest.json'));b=[x for x in m['beats'] if 'audio' in x][0];print(round((b['start']+b['audioFrom'])/m['fps']-0.05,3))")
vframes=$(ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nw=1:nk=1 "$fin")
dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$fin")
[ "$vframes" = "$expect" ] && fcheck="一致" || fcheck="不一致"
streams=$(ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate -of compact "$fin" | tr '\n' ' ')
head=$(ffmpeg -hide_banner -t "$first" -i "$fin" -vn -af volumedetect -f null - 2>&1 | grep -oE "max_volume: [-0-9.]+ dB" || echo "max_volume: n/a")
loud=$(ffmpeg -hide_banner -i "$fin" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2 | tr -s ' ' | tr '\n' ' ')
{
  echo "成片      $fin"
  echo "sha256    $(sha256sum "$fin" | cut -d' ' -f1)"
  echo "画面帧数  $vframes（时间轴 $expect 帧，$fcheck）；容器时长 $dur 秒"
  echo "流        $streams"
  echo "片头静音  前 $first 秒 $head"
  echo "响度      $loud"
} | tee "out/$id/probe.txt"
