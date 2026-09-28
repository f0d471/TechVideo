# fp32-format 证据

在仓库根执行 `node tools/vt.mjs evidence fp32-format`。命令从登记提交建立素材快照，并通过 `SRC_ANCHORFP` 传给 `run.sh`；不用本地源码工作区的未提交修改。

| 文件 | 用途 |
|---|---|
| format_numbers.py | 精确有理数计算：定点与 FP32 的读回误差、格式解码、IEEE 乘法对照 |
| numbers.log | 上述计算的原始输出，包含独立 struct 核对与断言结果 |
| tb_format_cases.v | 16 组 RTL 输入，核查字段、分类、FTZ、特殊值与输出有效信号 |
| sim.log | 原始仿真输出，含工具版本和固定 RTL 文件 SHA256 |
| references.md | 文档位置、短摘录、采用的结论与适用边界 |
| run.sh | 统一复跑入口，任一断言失败即以非零状态退出 |

日志由命令直接生成，不手改。中间 vvp 文件使用系统临时目录，退出时清理；Python 字节码缓存关闭。画面用数及算式的登记见上一级 outline.md。
