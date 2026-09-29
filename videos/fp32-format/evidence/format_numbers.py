"""Exact arithmetic behind on-screen values; run via vt evidence."""
from fractions import Fraction as Q
import platform
import struct


def pow2(e):
    return Q(2 ** e) if e >= 0 else Q(1, 2 ** -e)


def decode(bits):
    sign, field, frac = bits >> 31, (bits >> 23) & 255, bits & 0x7fffff
    if field == 255:
        return None
    value = Q(frac, 2 ** 23) * pow2(-126) if field == 0 else (1 + Q(frac, 2 ** 23)) * pow2(field - 127)
    return -value if sign else value


def encode(x):
    """Nearest binary32 to an exact rational; ties to even, no float arithmetic."""
    sign = int(x < 0) << 31
    x = abs(x)
    if not x:
        return sign
    e = x.numerator.bit_length() - x.denominator.bit_length()
    if x < pow2(e):
        e -= 1
    if e < -126:
        return sign | round(x / pow2(-149))
    m = round(x / pow2(e - 23))
    if m == 2 ** 24:
        m >>= 1
        e += 1
    if e > 127:
        return sign | 0x7f800000
    return sign | ((e + 127) << 23) | (m - 2 ** 23)


print('Python', platform.python_version())
print('policy=exact rational; round nearest ties even; Q16.16 signed total32 fractional16')
print('binary_fraction 1.101_2 = 1+1/2+0/4+1/8 =', Q(1) + Q(1, 2) + Q(1, 8))
print('fixed_step=', pow2(-16), 'range=[', -32768, ',', Q(32768)-pow2(-16), ']')
print('scientific_notation 1.024*10^3=', Q('1.024')*1000)
print('quantization columns: input type bits readback exact_abs_error relative_error relative_percent')
for text in ['0.000001', '0.001', '1', '1000', '1000000']:
    x = Q(text)
    fixed_int = round(x * 65536)
    bits = encode(x)
    oracle = struct.unpack('>I', struct.pack('>f', float(x)))[0]
    assert bits == oracle, (text, bits, oracle)
    if -(2**31) <= fixed_int < 2**31:
        formats = [('Q16.16', fixed_int & 0xffffffff, Q(fixed_int,65536))]
    else:
        formats = []
        print(f'{text} Q16.16 OUT_OF_RANGE rounded_integer={fixed_int} max_signed={2**31-1}')
    formats.append(('FP32',bits,decode(bits)))
    for kind, raw, y in formats:
        err = abs(y-x)
        relative = err / abs(x)
        print(f'{text} {kind} {raw:08X} {float(y):.17g} {err} {float(relative):.12g} {float(100*relative):.12g}%')

print('decode columns: hex sign E E_binary fraction_binary fraction_integer value_exact value_decimal')
values = [0x3f800001,0x3fc00000,0x00000000,0x80000000,0x00800000,0x007fffff,
          0x00400000,0x00000002,0x00000001,0x80000001,0x7e800000,0x3f000000,
          0x3f800000,0x7f800000,0xff800000,0x7fc00000,0x3fc00002]
for bits in values:
    s, e, f = bits >> 31, (bits >> 23) & 255, bits & 0x7fffff
    x = decode(bits)
    kind = 'NaN' if e == 255 and f else ('-infinity' if s else '+infinity') if e == 255 else '-0' if s and x == 0 else str(x)
    print(f'{bits:08X} {s} {e} {e:08b} {f:023b} {f} {kind} ' + (f'{float(x):.17g}' if x is not None else 'special'))
assert decode(0x3f800001) == 1 + pow2(-23)
assert decode(0x3fc00000) == Q(3,2)
assert decode(0x00800000) == pow2(-126)
assert decode(0x00400000) == pow2(-127)
assert decode(0x00000001) == pow2(-149)
assert decode(0x007fffff) == pow2(-126) - pow2(-149)
print('gradual_underflow spacing=', pow2(-149), 'min_normal_units=', 2**23)
print('exact multiplication; IEEE column applies nearest ties even, preserving subnormals')
for a,b,expected in [(0x3f800001,0x3fc00000,0x3fc00002),(1,0x3f800000,1),
                     (0x00800000,0x3f000000,0x00400000),(0x80000001,0x3f800000,0x80000001),
                     (0x00400000,0x7e800000,0x3f000000)]:
    x = decode(a)*decode(b)
    actual = encode(x)
    assert actual == expected, (a,b,actual,expected)
    print(f'{a:08X} * {b:08X} exact={x} IEEE={actual:08X}')

# 第三稿开场与引用卡里的算术；原文数字见 references.md
params = 7 * 10 ** 9
flops_per_token = 2 * params            # Kaplan 等 2020 式 2.2 的主项
macs_per_token = flops_per_token // 2   # 一次乘加 = 一次乘法 + 一次加法
assert macs_per_token == params
print(f'scenario params={params} forward_flops_per_token~2N={flops_per_token} macs_per_token={macs_per_token}')
horowitz_pj = {'int8_mult': Q('0.2'), 'fp16_mult': Q('1.1'), 'fp32_mult': Q('3.7'), 'int32_mult': Q('3.1')}
ratio = horowitz_pj['fp32_mult'] / horowitz_pj['int8_mult']
assert 10 < ratio < 20
print(f'horowitz_45nm fp32_mult/int8_mult={float(ratio)} (十几倍)')
cycles_normal, cycles_subnormal_min = 4, 200
print(f'andrysco_core_i7_sse mult normal={cycles_normal} subnormal>{cycles_subnormal_min} ratio>{cycles_subnormal_min // cycles_normal}')
min_normal = pow2(-126)
assert Q(1, 10 ** 38) < min_normal < Q(2, 10 ** 38)
print(f'min_normal 2^-126={float(min_normal):.6e} (约 10^-38)')
rel = {t: abs(decode(encode(Q(t))) - Q(t)) / Q(t) for t in ['0.000001', '0.001', '1000000']}
assert all(r < Q(1, 10 ** 7) for r in rel.values())
print('FP32 relative errors ' + ' '.join(f'{t}={float(r):.3g}' for t, r in rel.items()) + ' all < 1e-7 (都不到千万分之一)')
tpu_v4_mults = 2 * 4 * 128 * 128  # 两个 TensorCore，各 4 个 128x128 的 MXU
print(f'tpu_v4 2 cores x 4 MXU x 128x128 = {tpu_v4_mults}')
assert Q(1, 2 * 65536) > Q('0.000001')
print('0.000001 < half step 2^-17 (连半格都不到)')
widths = {'FP32': (1, 8, 23), 'BF16': (1, 8, 7), 'FP16': (1, 5, 10), 'FP8 E5M2': (1, 5, 2), 'FP8 E4M3': (1, 4, 3)}
for name, (s, e, f) in widths.items():
    print(f'format {name} sign={s} exponent={e} fraction={f} total={s + e + f}')
print('PASS arithmetic assertions and independent struct cross-checks')
