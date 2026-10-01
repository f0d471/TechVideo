# 舍入之后的文档出处

## 上溢写成无穷、阶码全 1 是无穷编码

Oracle，*Numerical Computation Guide*，「Overflow」：结果超出最大可表示数时，按就近舍入写成 ±无穷（§2.3 例外与默认处理）。无穷的编码：阶码全 1、小数位全 0，符号位区分 ±∞（Table 2-3）。公开文档：https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html 。规范另见 IEEE 754-2019 §6.1（Infinity 编码）与 §4.3（溢出时按当前舍入方向取 nearest 的溢出结果）。

## 下溢时标准写非规格数

Oracle，*Numerical Computation Guide*，「Underflow」：结果小于最小规格化数时，标准写非规格数（逐渐下溢）；本素材实现按 FTZ 写成带符号的零，属于有意偏离，第 1 集已引 Kahan 访谈（Severance 1998）与业界冲零（NVIDIA、Arm、x86、TPU bfloat16），本集不重复出卡。

本集三个例子的数值来自 `sim.log`（Icarus Verilog 12.0，素材固定提交 `39944a9`），不把文档结论当成电路输出。标准的非规格数对照 `00400000` 由 testbench 按 2⁻¹²⁷ / 2⁻¹⁴⁹ = 2²² 算出，与第 1 集 `sim.log` 的 output_sub 一组一致。
