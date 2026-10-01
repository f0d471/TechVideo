#!/usr/bin/env bash
# 画面数字的出处：把三组输入送进源 RTL，打印保留位、G/S/L、进位、最终阶码与写回结果
# 用法（仓库根目录）：node tools/vt.mjs evidence fp32-boundary，它把素材仓固定提交的快照目录以 SRC_ANCHORFP 传进来
set -euo pipefail
: "${SRC_ANCHORFP:?用 node tools/vt.mjs evidence fp32-boundary 运行}"
cd "$(dirname "$0")"
RTL="$SRC_ANCHORFP/fp/rtl/fp32_mul_pipe.v"
VVP=$(mktemp)
iverilog -g2012 -o "$VVP" tb_boundary_cases.v "$RTL"
{ iverilog -V 2>&1 | sed -n 1p; sha256sum "$RTL" | sed 's#  .*/#  #'; vvp -n "$VVP"; } > sim.log
rm -f "$VVP"
cat sim.log
