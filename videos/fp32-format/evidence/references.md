# 第一集文档出处

核查日期：2026-09-28。以下为定位、短摘录和本集采用的解释。数值计算与 RTL 结果分别见 numbers.log、sim.log；硬件手册不替代本实现的实验。

## IEEE 单精度格式

Oracle Solaris Studio 12.4, Numerical Computation Guide，§2.2.2 Single Format，Figure 2-1、Table 2-2、Table 2-3：
https://docs.oracle.com/cd/E37069_01/html/E39019/z4000ac019178.html

短摘录：“The 23-bit fraction combined with the implicit leading significand bit provides 24 bits of precision in single-format normal numbers.”

采用：32 位分为符号 1 位、阶码 8 位、小数位 23 位。E=1…254 用 1.f 与 E−127；E=0 用 0.f 与 −126；E=255 按小数位是否为零区分无穷与 NaN。零保留符号。7FC00000 只是 NaN 编码的一例。具体位串的十进制值以本集精确计算复核。

同系列 Numerical Computation Guide, Table 4-1 IEEE Floating-Point Exceptions：
https://docs.oracle.com/cd/E19957-01/816-2464/ncg_handle.html

采用：0×∞ 属于无效运算，默认结果为 quiet NaN。本集 `sim.log` 的 `inf_times_zero` 另外核对了乘法器行为。

## 逐渐下溢

同书 §2.3.2 How Does IEEE Arithmetic Treat Underflow?：
https://docs.oracle.com/cd/E37069_01/html/E39019/z4000ac019677.html

采用：在普通范围和零之间提供非规格数。继续接近零时可用的有效位逐渐减少；小到不能用非规格数表示时仍会舍入到零，不能讲成任意小的数都能保存。非规格数间距 2⁻¹⁴⁹ 来自单精度位权算式。

## NVIDIA 的开关

Floating Point and IEEE 754，§4.4 Compiler Flags：
https://docs.nvidia.com/cuda/floating-point/index.html#compiler-flags

短摘录：“In the fast mode denormal numbers are flushed to zero”

采用：文档列出单精度选项 -ftz=false / -ftz=true；默认 IEEE 模式保留非规格数。画面只说 CUDA 提供开关，不说 GPU 默认冲零，不把快模式的其他选项和 FTZ 混为一条规则。

## Arm 的开关

Arm Cortex-M33 Processor Technical Reference Manual，Document ID 100230_0100_07_en，Issue 07，§7.2.2.2，纸面第 53 页（PDF 索引 52）：
https://documentation-service.arm.com/static/641b2edcde84571cc27f3caa

短摘录：“Setting the FPSCR.FZ bit enables Flush-to-Zero (FZ) mode.”

采用：该处理器的 FZ 模式把算术操作的非规格输入当零，并把舍入前判为极小的结果替换为零。VABS/VNEG/VMOV 有例外。画面只介绍 Arm 的 FZ 位，不指称具体型号，也不声称全部 Arm 指令、处理器及边界判定都与本乘法器相同。

## x86 输入与结果的不同名称

Intel oneAPI DPC++/C++ Compiler Developer Guide and Reference 2024.2，Set the FTZ and DAZ Flags，表格 Flag / When set to ON：
https://www.intel.com/content/www/us/en/docs/dpcpp-cpp-compiler/developer-guide-reference/2024-2/set-the-ftz-and-daz-flags.html

短摘录：“treats denormal values used as input to floating-point instructions as zero.”

采用：SSE/AVX 的 DAZ 控制非规格输入当零，FTZ 控制非规格结果冲零；属于偏离 IEEE 渐进下溢语义的模式。是否使用取决于应用容忍度。本课对本实现用 FTZ 统称两端冲零，介绍 x86 时拆开名称。

## 情景的适用边界

本集不引用未经测量的 AI 数值分布、面积或频率数据。“省下专门处理非规格数的逻辑”是设计动机；是否能承受损失，须验证目标模型。sim.log 的 scaled_sub 实验说明极小输入的影响可以被后续乘法放大，不能由输入小直接推导误差无害。

## 复跑与检查

仓库根执行 node tools/vt.mjs evidence fp32-format。run.sh 从 SRC_ANCHORFP 读取固定提交快照，使用 Python 精确有理数和 Icarus Verilog，日志由命令直接写入。

- format_numbers.py：有理数到 FP32 最近值，定点同样取最近值；Python struct 交叉核对示例；逐一断言字段与乘法数学结果。
- tb_format_cases.v：16 组输入逐项断言分类标志、结果、out_valid；包含 a/b 非规格数、正负号、最小规格化边界、输入/输出冲零、无穷和 NaN。
- sim.log 的 mant 是源码原始拼接导线的位串；对非规格数它不是标准数值的尾数。只有普通路径使用补 1 的解释。
