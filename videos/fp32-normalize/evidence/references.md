# fp32-normalize 文档出处

本集的数字以固定提交的 RTL 仿真和整数算术为主。素材来源、提交号与许可证登记在 `curriculum/sources.json`；取数脚本应在该提交的快照上运行。下面两份公开文档只支持格式规则与 Verilog 结构解释，不替代 RTL 输出。

| 论断 | 文档、位置与链接 | 本集使用的范围 |
|---|---|---|
| 单精度由 1 位符号、8 位带偏置阶码、23 位小数组成；正常数按 `(-1)^s × 2^(e−127) × 1.f` 解读，隐藏首位与小数位合计 24 位有效精度 | Oracle Developer Studio 12.5, *Numerical Computation Guide*, §2.2.2 Single Format，Table 2；https://docs.oracle.com/cd/E60778_01/html/E60763/z4000ac019878.html | 只支撑第 1 集已经讲过的规格化形式、偏置 127、24 位尾数。一次乘法的 `[1,4)`、移位补偿和具体位串是本集算术或仿真结果。 |
| `always @*` 可描述随输入变化的逻辑，若分支遗漏赋值可能形成锁存；时钟沿触发的块才描述相应触发器；块内的 `=` 是阻塞赋值 | YosysHQ, *Yosys: Basic principles*, §2.2.3 Behavioural modelling；https://yosyshq.readthedocs.io/projects/yosys/en/0.39/CHAPTER_Basics.html | 用于避免把源码中的 `reg`、`always @(*)` 和组合块赋值讲成又多了一拍的寄存器。该段两分支均给两项输出赋值，且敏感事件不是时钟沿。 |
| `always` 中的 `if` 经过综合流程可表示为选择器，与寄存器单元分开 | YosysHQ, *Synthesis starter*, “Converting process blocks”；https://yosyshq.readthedocs.io/projects/yosys/en/v0.59/getting_started/example_synth.html | 只支撑把第 121–129 行画成二选一结构；不声称本素材实际综合后的门数、延迟或面积。 |

## 源码核对

- 课程固定提交：`39944a926d908bf3cb760f2e4ecd4d33a65d4cab`。
- 源文件：`fp/rtl/fp32_mul_pipe.v`，本地固定快照 sha256 `66cdb40707cd8148b89b934bad679ef55ff09d9db90dddd494d3ab9c4032af88`。
- 第 120–129 行是本集的组合规格化；第 131–137 行是下一集对规格化后积的舍入。纯右移后源码将原始 bit 1 与 bit 0 做或写入新 bit 0，给下一集的低位合并保留信息。
- 仿真的结果、工具版本与输入输出已由 `node tools/vt.mjs evidence fp32-normalize` 写入 `sim.log`；四组断言均通过。独立整数算术输出另见 `arithmetic.log`。

## 论断边界

- 移出的 bit 0 并回后，`prod_n` 的最低位是压缩过的“是否有 1”标记，整条位串不再是精确乘积的纯右移值。它的目的在于让后面的粘滞位判断保留这项信息。
- `reg` 这个关键字本身不保证物理寄存器。本集只按源码的完整赋值和 `always @(*)` 解释组合路径；不报未经综合测量的面积、速度或具体门数。
- Oracle 格式表规定浮点编码；本集的“只右移一次”只对两个规格化数的尾数积成立。特殊值与 FTZ 路径不在这一规则的适用范围内。
