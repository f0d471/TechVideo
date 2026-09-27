"""回听校对：把每句配音用语音识别转回文字，和朗读文本逐句比对。

用法（bash 侧，仓库根目录）：PYTHONPATH=~/pylibs/asr python3 tools/asr_check.py <视频 id> [--rescore]
一般通过 node tools/vt.mjs asr <id> 调用。结果写到 videos/<id>/build/asr_check.json。
模型放在 models/faster-whisper-small（ModelScope 的镜像，sha256 与 Systran/faster-whisper-small 一致）。
比对在拼音层做（不带声调）：识别端的同音字误差（尾数/尾书）会自动对上，
只有真正读错的音节会被标出来。加 --rescore 只用上次的识别结果重新打分。
"""
import difflib
import json
import os
import re
import sys

from pypinyin import lazy_pinyin

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIGITS = "零一二三四五六七八九"
THRESHOLD = 0.95


def int_zh(n):
    if n < 10:
        return DIGITS[n]
    if n < 20:
        return "十" + (DIGITS[n % 10] if n % 10 else "")
    if n < 100:
        return DIGITS[n // 10] + "十" + (DIGITS[n % 10] if n % 10 else "")
    if n < 1000:
        rest = n % 100
        tail = "" if rest == 0 else ("零" + DIGITS[rest] if rest < 10 else int_zh(rest) if rest >= 20 else "一" + int_zh(rest))
        return DIGITS[n // 100] + "百" + tail
    return "".join(DIGITS[int(c)] for c in str(n))


def num_zh(m):
    s = m.group(0)
    if "." in s:
        a, b = s.split(".")
        return int_zh(int(a)) + "点" + "".join(DIGITS[int(c)] for c in b)
    return int_zh(int(s))


def norm(s):
    s = re.sub(r"\d+(\.\d+)?", num_zh, s)
    s = s.lower()
    # 去掉一切标点与空白：识别结果会插入《》﹑﹐这类全角符号
    return re.sub(r"[\W_]", "", s)


def syllables(s):
    return [x for x in lazy_pinyin(norm(s)) if x.strip()]


def score(say, heard):
    a, h = syllables(say), syllables(heard)
    sm = difflib.SequenceMatcher(None, a, h, autojunk=False)
    diffs = [(" ".join(a[i1:i2]), " ".join(h[j1:j2]))
             for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    return sm.ratio(), diffs


def main():
    build_dir = os.path.join(ROOT, "videos", sys.argv[1], "build")
    manifest = json.load(open(os.path.join(build_dir, "manifest.json"), encoding="utf-8"))
    out_path = os.path.join(build_dir, "asr_check.json")
    heard_of = {}
    if "--rescore" in sys.argv:
        heard_of = {r["id"]: r["heard"] for r in json.load(open(out_path, encoding="utf-8"))}
    else:
        from faster_whisper import WhisperModel
        model_dir = os.environ.get("WHISPER_MODEL", os.path.join(ROOT, "models", "faster-whisper-small"))
        model = WhisperModel(model_dir, device="cpu", compute_type="int8")

    report = []
    for b in manifest["beats"]:
        if "audio" not in b:
            continue
        heard = heard_of.get(b["id"])
        if heard is None:
            wav = os.path.join(ROOT, "videos", b["audio"])
            segs, _ = model.transcribe(wav, language="zh", beam_size=5,
                                       initial_prompt="以下是普通话的句子，使用简体中文。")
            heard = "".join(seg.text for seg in segs).strip()
        ratio, diffs = score(b["say"], heard)
        report.append({"id": b["id"], "ratio": round(ratio, 3), "diffs": diffs,
                       "say": b["say"], "heard": heard})
        flag = "" if ratio >= THRESHOLD else "  <-- 检查"
        print(f"{b['id']} {ratio:.3f}{flag} {diffs if diffs else ''}\n"
              f"   say:   {b['say']}\n   heard: {heard}", flush=True)

    json.dump(report, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    low = [r["id"] for r in report if r["ratio"] < THRESHOLD]
    print(f"{len(report)} 句，拼音相似度低于 {THRESHOLD} 的：{low}")


if __name__ == "__main__":
    main()
