# 第一集文档出处与图片许可

核查日期：2026-09-28。每条写定位、短摘录和本集采用的说法。数值计算与电路结果分别见 numbers.log、sim.log；文档不替代实验。旁白里的说法不超出摘录。页码 pNN 指第三稿脚本的 beat。

## 一、开场：推理的运算量

Kaplan, McCandlish, Henighan, Brown 等，Scaling Laws for Neural Language Models，arXiv:2001.08361，2020（OpenAI），第 2.1 节式 (2.2) 与表 1：
https://arxiv.org/abs/2001.08361

短摘录：
- “Evaluating a forward pass of the Transformer involves roughly C_forward ≈ 2N + 2 n_layer n_ctx d_model add-multiply operations, where the factor of two comes from the multiply-accumulate operation used in matrix multiplication.”
- “For contexts and models with d_model > n_ctx/12, the context-dependent computational cost per token is a relatively small fraction of the total compute.”

采用：p05「每写一个词，运算次数约是参数个数的两倍」（第二项在大模型里占比小，故说「约」）。p06「一次乘加算两次运算」对应「the factor of two comes from the multiply-accumulate」；70 亿次乘加是算术（numbers.log scenario）。引用卡写作者、年份与论文题目，不贴页面（许可为 arXiv 非独占分发）。

## 二、开场：推理芯片

Jouppi 等，TPU v4: An Optically Reconfigurable Supercomputer for Machine Learning with Hardware Support for Embeddings，ISCA 2023，arXiv:2304.01433（CC BY 4.0），第 2 节：
https://arxiv.org/abs/2304.01433

短摘录：“contains two TensorCores (TC). Each TC contains four 128x128 Matrix Multiply Units (MXUs)”

采用：p07「谷歌 TPU v4 的一颗芯片里，有 8 个 128 × 128 的乘法阵列」（2 × 4 = 8）；p08「成千上万」对应 8 × 128 × 128 = 131072。

板卡照片：Wikimedia Commons File:TPU v4.png，作者 Norman P. Jouppi 等（取自上面这篇论文），许可 CC BY 4.0：
https://commons.wikimedia.org/wiki/File:TPU_v4.png

处理：裁去四周白边，存为 assets/tpu-v4.jpg（920×760）。画面署名「TPU v4 · Jouppi 等 2023 · CC BY 4.0」。

## 三、切入点：各种格式的能耗

Mark Horowitz（Departments of Electrical Engineering and Computer Science, Stanford University），1.1 Computing's Energy Problem (and what we can do about it)，2014 IEEE International Solid-State Circuits Conference（ISSCC）Digest of Technical Papers，pp. 10–14，Figure 1.1.9 “Rough energy costs for various operations in 45nm 0.9V”：
https://doi.org/10.1109/ISSCC.2014.6757323

摘录（图中数值）：Integer Mult 8 bit 0.2 pJ、32 bit 3.1 pJ；FP Mult 16 bit 1.1 pJ、32 bit 3.7 pJ；Integer Add 8 bit 0.03 pJ；FP Add 32 bit 0.9 pJ。

采用：p10–p12，按原数重画成条形图（32 位浮点乘、16 位浮点乘、8 位整数乘三根）。p10「位数越少越省电」只指这张图的能耗，不说面积。引用卡写 ISSCC 与题目，不贴原图。

## 四、切入点：FP32 是基准

Micikevicius, Narang, Alben, Diamos, Elsen 等（NVIDIA、Baidu Research），Mixed Precision Training，ICLR 2018，arXiv:1710.03740，第 1、3.1 节：
https://arxiv.org/abs/1710.03740

短摘录：“maintaining a master copy of weights in FP32 … and FP16 arithmetic with accumulation in FP32”；“trained to match the accuracy FP32 training”。

采用：p14–p15。「英伟达和百度的研究者提出」对应作者单位；「参数本身留在 FP32」对应 master copy of weights；「效果也拿 FP32 来比」指这篇论文以 FP32 训练为对照。引用卡不贴页面（arXiv 非独占分发）。

## 五、切入点：浮点格式同一种结构

Micikevicius, Stosic, Burgess, Cornea, Dubey 等（NVIDIA、Arm、Intel），FP8 Formats for Deep Learning，arXiv:2209.05433，2022，摘要：
https://arxiv.org/abs/2209.05433

短摘录：“In this paper we propose an 8-bit floating point (FP8) binary interchange format consisting of two encodings - E4M3 (4-bit exponent and 3-bit mantissa) and E5M2 (5-bit exponent and 2-bit mantissa).”

采用：p16「2022 年定下的两种 FP8」。许可 CC BY 4.0。第一页（标题、作者、摘要）由 pdftocairo 以 160 dpi 渲染并裁剪，存为 assets/paper-fp8.jpg，画面署名「Micikevicius 等 2022 · arXiv · CC BY 4.0」。

BF16 的位宽：Google Cloud Blog，BFloat16: The secret to high performance on Cloud TPUs，2019，“Bfloat16 semantics” 一节：
https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus

短摘录：“comprised of one sign bit, eight exponent bits, and seven mantissa bits”。

FP16 的位宽（1、5、10）与 FP32（1、8、23）：IEEE Std 754-2008 的 binary16、binary32 格式；FP32 的字段另见第七节 Oracle 文档。

采用：p16 的格式对照图：FP32 1/8/23、BF16 1/8/7、FP16 1/5/10、FP8 E4M3 1/4/3、E5M2 1/5/2（numbers.log format）。

## 六、切入点：常见的数值格式

NVIDIA A100 Tensor Core GPU 规格表（nvidia-a100-datasheet.pdf），“Specifications” 一栏：
https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet.pdf

摘录：列出 FP64、FP32（Single-Precision）、TF32、Half-Precision（FP16）、Bfloat16、Integer Performance 下的 INT8 与 INT4 的峰值性能。

采用：p10「英伟达 A100 的规格表上就列了 INT4、INT8 两种整数，和 FP16、BF16、FP32 这些浮点」。画面只列格式名与位数，不列吞吐数字。FP8 另见第五节。

## 七、IEEE 单精度格式

Oracle Solaris Studio 12.4, Numerical Computation Guide，§2.2.2 Single Format，Figure 2-1、Table 2-2、Table 2-3：
https://docs.oracle.com/cd/E37069_01/html/E39019/z4000ac019178.html

短摘录：“The 23-bit fraction combined with the implicit leading significand bit provides 24 bits of precision in single-format normal numbers.”

采用：p18「公式出自浮点标准 IEEE 754」；32 位分为符号 1 位、阶码 8 位、小数位 23 位；E=1…254 用 1.F 与 E−127；E=0 用 0.F 与 −126；E=255 按小数位是否为零区分无穷与 NaN；零保留符号；7FC00000 只是 NaN 编码的一例。

同系列 Numerical Computation Guide, Table 4-1 IEEE Floating-Point Exceptions：
https://docs.oracle.com/cd/E19957-01/816-2464/ncg_handle.html

采用：0 × ∞ 属于无效运算，默认结果为 NaN（p60）。sim.log 的 inf_times_zero 另外核对了电路行为。

## 八、逐渐下溢

同书 §2.3.2 How Does IEEE Arithmetic Treat Underflow?：
https://docs.oracle.com/cd/E37069_01/html/E39019/z4000ac019677.html

采用：在规格化数和零之间提供非规格数，越接近零可用的有效位越少（p63–p65）。最小正非规格数 2⁻¹⁴⁹ 来自位权算式（numbers.log decode）。

## 九、逐渐下溢的来历

Charles Severance，IEEE 754: An Interview with William Kahan（“An Interview with the Old Man of Floating-Point”），IEEE Computer，1998 年 3 月，全文存于 Kahan 主页：
https://people.eecs.berkeley.edu/~wkahan/ieee754status/754story.html

短摘录：
- “In 1976 Intel began to design a floating-point co-processor for its i8086/8 and i432 microprocessors.”；“Palmer … recruited Kahan as a consultant to help design the arithmetic for … the i8086/8's upcoming i8087 coprocessor.”（p66）
- “After that 1977 meeting Kahan went back to Intel and requested permission to participate in the standard effort. With permission granted, Kahan and his student Jerome Coonen at U.C. Berkeley, and a visiting Prof. Harold Stone, prepared a draft specification in the format of an IEEE standard”；“This applied particularly to Gradual Underflow”（p67）
- “Until the 1980s, almost all computers flushed underflows to zero … VAXs went likewise by default.”；“At an early meeting of p754 in the late 1970s a hardware engineer from DEC had stated flatly that K-C-S could not be built to run as fast as VAX arithmetic hardware.”（p68）
- “DEC tried to break the impasse by commissioning … Prof. G.W. (Pete) Stewart III, a highly respected error-analyst … At a p754 meeting in 1981 … on balance, he thought Gradual Underflow was the right thing to do.”（p69）

标准的年份：IEEE Std 754-1985（p69「写进了 1985 年的标准」）。

采用：p66–p69。旁白不给 Stewart 与 Payne 的名字，只说「DEC 请来的误差分析专家」。

Intel 8087 裸片照片，Wikimedia Commons File:Intel 8087 die.JPG，作者 Pauli Rautakorpi，许可 CC BY 3.0：
https://commons.wikimedia.org/wiki/File:Intel_8087_die.JPG

处理：缩到 1400 像素宽，存为 assets/intel-8087-die.jpg。画面署名「Intel 8087 裸片 · Pauli Rautakorpi · CC BY 3.0」。Kahan 的照片在 Wikimedia 上是 CC BY-SA，不用。

## 十、非规格数有多慢

Andrysco, Kohlbrenner, Mowery, Jhala, Lerner, Shacham，On Subnormal Floating Point and Abnormal Timing，IEEE Symposium on Security and Privacy 2015，pp. 623–639，第 II-C 节：
https://doi.org/10.1109/SP.2015.44

短摘录：“on a Core i7 processor using SSE instructions, performing standard multiply between two normal numbers takes 4 clock cycles, whereas the same multiply given a subnormal input takes over 200 clock cycles.”；“When flags are set, the performance problems associated with subnormals disappears on all processors we tested”（flags 指 FTZ 与 DAZ）。

采用：p71–p73「碰到非规格数会慢多少」，条形图 4 拍与 200 多拍（numbers.log andrysco）。测的是整条乘法，旁白不说成某一步。旁白说「电脑常用的 x86 处理器」，不点型号。

## 十一、AI 芯片与处理器的冲零

Google Cloud，Improve your model's performance with bfloat16（Cloud TPU 文档），“Format conversion” 一节：
https://docs.cloud.google.com/tpu/docs/bfloat16

短摘录：“the bfloat16 on Cloud TPU does not support subnormals, so all subnormals are flushed to zero during the conversion.”

采用：p80「转换成 BF16 时不支持非规格数，一律冲成 0」。画面引用卡放英文原句与中文意思。

NVIDIA，Floating Point and IEEE 754 Compliance for NVIDIA GPUs，§4.4 Compiler Flags：
https://docs.nvidia.com/cuda/floating-point/index.html#compiler-flags

短摘录：“In the fast mode denormal numbers are flushed to zero”

采用：p81「英伟达的 GPU 有冲零模式」。不说 GPU 默认冲零。

Arm，Cortex-M33 Processor Technical Reference Manual，Document ID 100230_0100_07_en，§7.2.2.2：
https://documentation-service.arm.com/static/641b2edcde84571cc27f3caa

短摘录：“Setting the FPSCR.FZ bit enables Flush-to-Zero (FZ) mode.”

采用：p81「Arm 处理器有 FZ 位」。FPSCR.FZ 是 Arm 浮点控制寄存器里的通用位，画面不点型号。

Intel oneAPI DPC++/C++ Compiler Developer Guide and Reference 2024.2，Set the FTZ and DAZ Flags：
https://www.intel.com/content/www/us/en/docs/dpcpp-cpp-compiler/developer-guide-reference/2024-2/set-the-ftz-and-daz-flags.html

短摘录：FTZ “sets denormal results from floating-point calculations to zero.”；DAZ “treats denormal values used as input to floating-point instructions as zero.”

采用：p81，DAZ 管输入、FTZ 管结果。

## 十二、情景的论断边界

- 「模型里的数几乎不会小到 10⁻³⁸」是系列大纲给定的情景理由；它由第十一节的业界选择支撑，本集不引用未经测量的数值分布。
- 「推理芯片常常把非规格数当成 0」是情景里的设计选择，业界例子见第十一节；不说「所有 AI 芯片」。
- 「更小更快的乘加单元」是设计动机，本集不给面积或频率数字。
- sim.log 的 scaled_sub 实验说明极小输入的影响可以被后续乘法放大；按系列大纲，代价在 p79 讲一次，不加反例。

## 十三、复跑与检查

仓库根执行 node tools/vt.mjs evidence fp32-format。run.sh 从 SRC_ANCHORFP 读取固定提交快照，使用 Python 精确有理数和 Icarus Verilog，日志由命令直接写入。

- format_numbers.py：有理数到 FP32 最近值，定点同样取最近值；Python struct 交叉核对示例；逐一断言字段与乘法数学结果；第三稿开场与引用卡的算术。
- tb_format_cases.v：16 组输入逐项断言分类标志、结果、out_valid；包含 a/b 非规格数、正负号、最小规格化边界、输入/输出冲零、无穷和 NaN。
- sim.log 的 mant 是源码原始拼接导线的位串；对非规格数它不是标准数值的尾数。只有规格化数路径使用补 1 的解释。
