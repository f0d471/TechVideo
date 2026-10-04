# 视频索引

已立项的视频，每集一个目录，详细状态看各自的 `STATUS.md`。还没立项的计划在 `curriculum/` 的系列大纲里。新建一集用 `node tools/vt.mjs new <id> <标题>`，会自动在下表追加一行。S0–S2 的阶段手动更新「阶段」列并同步系列总表的状态列；之后由 `vt make`、`vt accept` 自动更新。

| id | 标题 | 阶段 | 状态 |
|---|---|---|---|
| fp32-rne | 舍入（第 4 集） | S8 发布（待上传） | [STATUS](fp32-rne/STATUS.md) |
| fp32-format | IEEE 754 与 FTZ | 已发布 | [STATUS](fp32-format/STATUS.md) |
| fp32-mul | 两个浮点数相乘 | S8 发布（待上传） | [STATUS](fp32-mul/STATUS.md) |
| fp32-normalize | 规格化 | S8 发布（待上传） | [STATUS](fp32-normalize/STATUS.md) |
| fp32-boundary | 舍入之后 | S8 发布（待上传） | [STATUS](fp32-boundary/STATUS.md) |
| fp32-pipeline | 寄存器与流水线（现行样片） | S8 发布（待上传） | [STATUS](fp32-pipeline/STATUS.md) |
