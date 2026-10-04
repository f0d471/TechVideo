# 流水线的文档出处

旁白与画面里引用的说法不超出下面的摘录。原文为英文的，摘录保留原句，中文是画面与旁白用的意思。

## Bhasker、Chadha《Static Timing Analysis for Nanometer Designs: A Practical Approach》

Springer，2009（DOI 10.1007/978-0-387-93820-2）。章节号按出版社目录核对；下面是这几节的要点，不是原句。3.4.1 节 Synchronous Checks: Setup and Hold；第 8 章 Timing Verification，8.1 节 Setup Timing Check，8.2 节 Hold Timing Check。

- 建立时间：时钟有效沿之前，数据输入必须保持稳定的最短时间；保持时间：时钟有效沿之后，数据输入必须继续保持稳定的最短时间。
- 建立时间检查：发出数据的寄存器在一个时钟沿放出数据，经过时钟到输出延迟与组合路径延迟，必须在下一个时钟沿之前、留出接收寄存器的建立时间到达；不计时钟偏斜时，时钟周期 ≥ 时钟到输出延迟 + 组合逻辑延迟 + 建立时间。两排寄存器之间的每一条路径都要满足。
- 保持时间检查：同一个时钟沿放出的新数据，不能在接收寄存器的保持时间结束前到达，比较的是最短路径；不计时钟偏斜时与时钟周期无关。

画面：引用卡（2009 · Bhasker、Chadha · Springer），一句中文结论。

## AMD（Xilinx）《Floating-Point Operator v7.1 LogiCORE IP Product Guide》（PG060）

PG060，2020 年 12 月 16 日版，amd.com 下载（`pg060-floating-point.pdf`）。

Chapter 4，Latency and Rate Configuration：

> The latency of all operators can be set between 0 and a maximum value that is dependent upon the parameters chosen. … For designs which run at a relatively low frequency, the latency can be reduced while timing can still be met. For instance, if the fully pipelined design with latency=12 can meet timing at 400 MHz, then if the system clock in the user design is 70MHz, for example, then latency can likely be reduced to six and timing can still be met. However, the relationship between latency and achieveable clock speed is not linear. This is because the amount of logic between register stages is roughly the same, so if one register is removed, the achieveable clock frequency drops considerably because one register to register path now has almost double the amount of logic as other register-to-register delays.

Cycles per Operation：

> The Cycles per Operation Vivado IDE parameter describes the minimum number of cycles that must elapse between inputs. … A value of 1 allows operands to be applied on every clock cycle, and results in a fully-parallel circuit. A value greater than 1 enables hardware reuse. The resources consumed by the core reduces as the number of cycles per operation is increased. A value of 2 approximately halves the resources used.

画面：引用卡（各级逻辑差不多，少一排寄存器就有一级逻辑接近翻倍）；表格两行（400 MHz 12 拍；70 MHz 6 拍）；启动间隔大于一时再出一次，写「隔一拍收一组，资源约少一半」。

## de Dinechin、Pasca，Designing Custom Arithmetic Data Paths with FloPoCo

IEEE Design & Test of Computers，28(4)：18–27，2011。摘录取自作者主页的预印本（`perso.citi-lab.fr/fdedinec/recherche/publis/2011-DaT-FloPoCo.pdf`，题为 Custom Arithmetic Datapath Design for FPGAs using the FloPoCo Core Generator）。

Introduction C，Frequency-directed pipeline：

> Pipelining involves a trade-off between latency (number of pipeline levels, or number of clock cycles needed for the computation) and frequency (or throughput). Most core generators let the user specify the latency. In FloPoCo, on the contrary, the user specifies a frequency, and the datapath is pipelined for this frequency.

Table I（x² + y² + z² 的综合结果），Performance versus cost on Virtex4, option 3, varying target frequency，格式 (10,36) 三行：

| target f | performance | cost |
|---|---|---|
| 200 MHz | 6 cycles @ 203 MHz | 874 slices, 9 DSP |
| 100 MHz | 2 cycles @ 109 MHz | 809 slices, 9 DSP |
| 50 MHz | 0 cycles @ 51 MHz | 751 slices, 9 DSP |

画面：引用卡 + 表格（目标频率、延迟拍数、做出来的频率）。

## Catovic，GRFPU – High Performance IEEE-754 Floating-Point Unit

Gaisler Research，DASIA 2004（Data Systems In Aerospace，ESA SP-570）。白皮书 `gaisler.com/doc/grfpu_wp.pdf`。

- 正文：「The FPU is fully pipelined and a new operation can be started every clock cycle. The result and the exception flags will be available three clocks later.」
- 延迟与吞吐表：FADDS、FADDD、FSUBS、FSUBD、FMULS、FMULD、FSMULD 等吞吐 1、延迟 3；FDIV、FSQRT 需要 15–24 拍、不流水，在单独的非阻塞执行单元里算。

画面：引用卡（乘法延迟 3 拍，每拍都能开始一次新运算）。

## Keating、Bricaud《Reuse Methodology Manual for System-on-a-Chip Designs》

第 3 版，Kluwer Academic Publishers，2002。5.6.1 节 Register All Outputs：

> Guideline – For each subblock of a hierarchical macro design, register all output signals from the subblock.

画面：引用卡（每个子模块的输出都存一拍）。

## AMD（Xilinx）《UltraFast Design Methodology Guide for Xilinx FPGAs and SoCs》（UG949）

UG949 v2022.1，2022 年 6 月 8 日。Register Data Paths at Logical Boundaries：

> Register the outputs of hierarchical boundaries to contain critical paths within a single module or boundary. Consider registering the inputs also at the hierarchical boundaries. It is always easier to analyze and repair timing paths which lie within a module, rather than a path spanning multiple modules.

画面：引用卡（在模块边界上存输出，把关键路径关在一个模块之内）。

## 流水行为

`evidence/sim.log`（Icarus Verilog 12.0，素材 anchorfp 固定提交 `39944a9`）：四组输入从第 1 拍起连着送，第 N 组的结果在第 N+2 拍出现在 `p` 上，`out_valid` 比对应输入晚两拍变 1；流水充满后每拍交出一个结果（延迟 2 拍、吞吐每拍一个、启动间隔 1）。

## 不用的项目数据

素材实现自己的设计记录（固定提交 `39944a9` 的 `fp/docs/reports/02-FP32乘法器的流水与舍入实现.md`）中的频率目标、两级划分依据与综合结果（Vivado 2025.2，xc7a200tfbg676-1，OOC，20 ns 约束：LUT 107、FF 66、DSP48 2、WNS 10.882 ns、最差路径 12 级逻辑）不作为旁白与画面的论据（decisions.md 2026-10-01）。流水级数是设计自由度，讲通用知识时用上面的公开文献。代码出处（`fp/rtl/fp32_mul_pipe.v`，提交 `39944a9`，sha256 `66cdb407…`）按代码课规范逐字引用。
