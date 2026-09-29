# 舍入的文档出处

## FP32 字段

Oracle，*Numerical Computation Guide*，§2.2.2「Single Format」，Figure 2-1、Table 2-2：单精度的符号位 1 位、阶码 8 位、小数位 23 位；规格化数补隐藏的首位 1，所以有效数字共 24 位。公开文档：https://docs.oracle.com/cd/E19957-01/806-3568/ncg_math.html

## 舍入方向

Oracle，*Numerical Computation Guide*，「Rounding Direction」：IEEE 默认方向为就近；恰好在相邻两数中间时，选最低位为 0 的数，即就近舍入到偶数。公开文档：https://docs.oracle.com/cd/E19957-01/806-3568/ncg_lib.html 。规范位置另见 IEEE 754-2019 §4.3.1 `roundTiesToEven`，标准修订组说明：https://grouper.ieee.org/groups/msc/ANSI_IEEE-Std-754-2019/background/ 。

本集的具体 48 位积与 G/S/L 值来自 `sim.log`，不把文档结论当成电路输出。
