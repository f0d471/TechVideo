// 用 24 位整数乘法独立核对第 3 集的预期位串；原始输出写入 arithmetic.log。
import assert from 'node:assert/strict';

const cases = [
  ['no_shift', 0x3F800001n, 0x3FC00000n, 0x600000C00000n, 0x600000C00000n, 127, 127, 0x3FC00002n],
  ['high_product', 0x3FC00000n, 0x3FC00000n, 0x900000000000n, 0x480000000000n, 127, 128, 0x40100000n],
  ['lost_bit', 0x3FC00001n, 0x3FC00001n, 0x900001800001n, 0x480000C00001n, 127, 128, 0x40100002n],
  ['lost_bit_changes_rounding', 0x3F801001n, 0x3FFFF001n, 0x800800800001n, 0x400400400001n, 127, 128, 0x40000801n],
];
const hex = (n, width) => n.toString(16).toUpperCase().padStart(width, '0');
console.log('Node ' + process.version);

for (const [tag, a, b, wantProduct, wantNormalized, wantExp0, wantExpN, wantOut] of cases) {
  const mantA = 0x800000n | (a & 0x7FFFFFn);
  const mantB = 0x800000n | (b & 0x7FFFFFn);
  const exp0 = Number((a >> 23n) & 0xFFn) + Number((b >> 23n) & 0xFFn) - 127;
  const product = mantA * mantB;
  const shift = (product & (1n << 47n)) !== 0n;
  const expN = exp0 + Number(shift);
  const pureShift = shift ? product >> 1n : product;
  const normalized = shift
    ? (pureShift & ~1n) | ((pureShift | product) & 1n)
    : product;
  const kept = normalized >> 23n;
  const guard = (normalized >> 22n) & 1n;
  const sticky = (normalized & ((1n << 22n) - 1n)) ? 1n : 0n;
  const roundUp = guard & (sticky | (kept & 1n));
  const rounded = kept + roundUp;
  assert.equal(rounded >> 24n, 0n, tag + ': unexpected later-stage carry');
  const output = (BigInt(expN) << 23n) | (rounded & 0x7FFFFFn);

  assert.equal(product, wantProduct, tag + ': product');
  assert.equal(normalized, wantNormalized, tag + ': normalized');
  assert.equal(exp0, wantExp0, tag + ': candidate exponent');
  assert.equal(expN, wantExpN, tag + ': adjusted exponent');
  assert.equal(output, wantOut, tag + ': final cross-check');
  console.log(tag + ' a=' + hex(a, 8) + ' b=' + hex(b, 8)
    + ' product=' + hex(product, 12) + ' bit47=' + Number(shift)
    + ' old_bit0=' + Number(product & 1n) + ' pure_shift=' + hex(pureShift, 12)
    + ' normalized=' + hex(normalized, 12) + ' exp=' + exp0 + '->' + expN
    + ' G=' + guard + ' S=' + sticky + ' L=' + (kept & 1n)
    + ' round_up=' + roundUp + ' output=' + hex(output, 8));
}
console.log('all 4 arithmetic cases passed');
