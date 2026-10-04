#!/usr/bin/env bash
# 流水行为的出处：四组输入连着送进两级流水，逐拍打印有效信号与输出
# 用法（仓库根目录）：node tools/vt.mjs evidence fp32-pipeline，它把素材仓固定提交的快照目录以 SRC_ANCHORFP 传进来
set -euo pipefail
: "${SRC_ANCHORFP:?用 node tools/vt.mjs evidence fp32-pipeline 运行}"
cd "$(dirname "$0")"
RTL="$SRC_ANCHORFP/fp/rtl/fp32_mul_pipe.v"
VVP=$(mktemp)
iverilog -g2012 -o "$VVP" tb_pipeline_cases.v "$RTL"
{ iverilog -V 2>&1 | sed -n 1p; sha256sum "$RTL" | sed 's#  .*/#  #'; vvp -n "$VVP"; } > sim.log
rm -f "$VVP"
cat sim.log
