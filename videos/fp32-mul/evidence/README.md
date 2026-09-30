# fp32-mul 取数

在仓库根目录运行 node tools/vt.mjs evidence fp32-mul。统一入口把 curriculum/sources.json 固定提交的 RTL 快照传给 run.sh；run.sh 用 Icarus Verilog 编译 tb_mul_cases.v，并把工具版本、RTL sha256 与原始输出写入 sim.log。不要手改日志。

| 用例 | 验证重点 | 画面用途 |
|---|---|---|
| main：3F800001 × 3FC00000 | 两个 24 位尾数、符号 0、候选阶码 127、48 位积 600000C00000 | 贯穿三路计算；最终舍入结果只用于断言 |
| negative：BF800000 × 3FC00000 | 异号得负，普通数值路径仍独立工作 | 符号异或门 |
| high_product：3FC00000 × 3FC00000 | 48 位积 900000000000，最高位为 1 | 留给第 3 集的规格化问题 |
| low_exponent / high_exponent | 中间阶码分别为 −125 / 381，普通 8 位阶码无法暂存 | 10 位带符号范围；最终冲零或无穷只用于断言 |
| inf_times_zero / nan_input | 两类条件都触发 NaN 选择，最终编码 7FC00000 | 特殊值旁路 |

五组普通输入的字段拆分、符号异或、阶码算式、24×24 整数乘积及 48 位位串已用独立整数算术复核。文档规则与具体位置见 references.md；代码画面逐字片段由 vt code 写入 build/code.json，与 sim.log 的 RTL sha256 相同。
