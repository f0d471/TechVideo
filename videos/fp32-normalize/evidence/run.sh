#!/usr/bin/env bash
# 在课程固定提交上验证第 3 集的直通、右移、移出位并回。
# 从仓库根目录运行：node tools/vt.mjs evidence fp32-normalize
set -euo pipefail
: "${SRC_ANCHORFP:?用 node tools/vt.mjs evidence fp32-normalize 运行}"
cd "$(dirname "$0")"
RTL="$SRC_ANCHORFP/fp/rtl/fp32_mul_pipe.v"
VVP=$(mktemp)
trap 'rm -f "$VVP"' EXIT
iverilog -g2012 -s tb_normalize_cases -o "$VVP" tb_normalize_cases.v "$RTL"
{
    iverilog -V 2>&1 | sed -n 1p
    sha256sum "$RTL" | sed 's#  .*/#  #'
    vvp -n "$VVP"
} > sim.log
cat sim.log
