#!/usr/bin/env bash
# 固定源码的字段、分类和 FTZ 实验，以及画面数字的精确算术。
set -euo pipefail
: "${SRC_ANCHORFP:?用 node tools/vt.mjs evidence fp32-format 运行}"
cd "$(dirname "$0")"
RTL="$SRC_ANCHORFP/fp/rtl/fp32_mul_pipe.v"
VVP=$(mktemp)
trap 'rm -f "$VVP"' EXIT
PYTHONDONTWRITEBYTECODE=1 python3 format_numbers.py > numbers.log
iverilog -g2012 -s tb_format_cases -o "$VVP" tb_format_cases.v "$RTL"
{
    iverilog -V 2>&1 | sed -n 1p
    sha256sum "$RTL" | sed 's#  .*/#  #'
    vvp -n "$VVP"
} > sim.log
cat numbers.log sim.log
