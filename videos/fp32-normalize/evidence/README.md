# fp32-normalize 取数

在仓库根目录运行 `node tools/vt.mjs evidence fp32-normalize`。统一入口把 `curriculum/sources.json` 固定提交的 RTL 快照传给 `run.sh`；脚本用 Icarus Verilog 编译 `tb_normalize_cases.v`，把版本、源码 sha256 和逐组原始输出写入 `sim.log`。不手改仿真日志。

另一条独立核对是 `node videos/fp32-normalize/evidence/verify_arithmetic.mjs`。它只用 Node 的 BigInt 从输入位型计算 24 位尾数、48 位整数积、右移、移出位并回及预期输出；运行时的原始输出保存在 `arithmetic.log`。这条算术核对不能替代 RTL 仿真。

| 用例 | 验证重点 | 画面用途 |
|---|---|---|
| `no_shift`：`3F800001 × 3FC00000` | bit 47 为 0，积与阶码直通 | 与上一集主例衔接 |
| `high_product`：`3FC00000 × 3FC00000` | `900000000000 → 480000000000`，阶码 `127 → 128` | 贯穿全片的 `1.5²` |
| `lost_bit`：`3FC00001 × 3FC00001` | 原始 bit 0 为 1，右移后写回新 bit 0 | 放大位条末端，解释为什么并回 |
| `lost_bit_changes_rounding`：`3F801001 × 3FFFF001` | 若只右移，低 22 位全零；并回后粘滞位为 1，下一步舍入输出 `40000801` | 仅作证据断言，不上画面 |

## 当前验证状态

- 2026-09-30：Node v24.16.0 的独立整数算术核对已通过，原始输出见 `arithmetic.log`。
- 2026-09-30：`node tools/vt.mjs evidence fp32-normalize` 在 WSL 的 Icarus Verilog 12.0 上通过，四组 RTL 断言全过，原始输出见 `sim.log`。源码 sha256 为 `66cdb40707cd8148b89b934bad679ef55ff09d9db90dddd494d3ab9c4032af88`，与固定快照一致。
