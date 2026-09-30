# fp32-mul 文档出处

本集的仿真输入、原始输出与代码快照见 sim.log；素材提交固定在 curriculum/sources.json。下列文档只支撑格式和特殊值规则，不替代本集 RTL 的实测结果。

| 论断 | 文档、位置与链接 | 本集使用的范围 |
|---|---|---|
| 单精度是 1 位符号、8 位带偏置阶码、23 位小数；正规数隐藏位为 1，合计 24 位有效精度；阶码按 e−127 解释 | Oracle Developer Studio 12.5, Numerical Computation Guide, §2.2.2 Single Format，Table 2；https://docs.oracle.com/cd/E60778_01/html/E60763/z4000ac019878.html | 支撑字段宽度、偏置 127、正常输入阶码 1…254、两个尾数各 24 位。本文的 ea+eb−127 与 24×24→48 是据此作出的算术推导。 |
| 无穷乘零属于 invalid operation，未启用异常陷阱时默认 quiet NaN | Oracle Numerical Computation Guide, §4.2 What Is an Exception?, Table 4-1；https://docs.oracle.com/cd/E19957-01/806-3568/ncg_handle.html | 只支撑结果类别；本集 RTL 输出的具体 7FC00000 编码另由仿真确认。 |
| 浮点乘法若任一操作数是 NaN，结果是 NaN；两符号相同为正、不同为负；无穷乘零为 NaN | Java Language Specification, Java SE 9, §15.17.1 Multiplication Operator；https://docs.oracle.com/javase/specs/jls/se9/html/jls-15.html#jls-15.17.1 | 作为 IEEE 754 浮点乘法规则的公开交叉核对；不把 Java 实现或 NaN payload 当成本集 RTL 的来源。 |

## 论断边界

- Oracle 的格式表限定正规数才有隐藏的 1；零、非规格数、无穷与 NaN 不按两个 1.F 直接相乘。视频的 24×24 位普通数据路先以正规输入为例。
- 数值 7FC00000 是本素材选择的 quiet NaN 编码，Oracle 的格式表也把它列为一个 NaN 示例；NaN 可以有多个编码。
- 素材采用输入 FTZ：非规格数会被归入零类。该选择已在第 1 集解释，本集不把它说成所有 IEEE 754 设备都必须如此。
