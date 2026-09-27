"""分句配音、时间轴与字幕。

用法（bash 侧，仓库根目录）：PYTHONPATH=~/pylibs/tts python3 tools/build_audio.py <视频 id>
一般通过 node tools/vt.mjs tts <id> 调用。

- 一句一个音频文件，时长取自文件本身；时间轴与字幕由时长累加，误差为零。
- 朗读文本先过 tools/lexicon.json 的替换规则（多音字换同音字），字幕文本不变。
- 按「音色|速率|替换后的朗读文本」做哈希缓存，只重合成改过的句子。
产出：videos/<id>/audio/*.wav 与 cache.json，videos/<id>/build/manifest.json 与 captions.srt。
"""
import asyncio
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import wave

import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def sha(text):
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def wav_seconds(path):
    with wave.open(path, "rb") as w:
        return w.getnframes() / w.getframerate()


def load_lexicon():
    lex = json.load(open(os.path.join(ROOT, "tools", "lexicon.json"), encoding="utf-8"))
    return [(re.compile(r["pattern"]), r["to"]) for r in lex["replace"]]


def apply_lexicon(text, rules):
    for pat, to in rules:
        text = pat.sub(to, text)
    return text


async def synth(text, voice, rate, mp3_path):
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice, rate=rate).save(mp3_path)
            return
        except Exception as e:  # 在线服务偶发超时，重试
            print(f"  retry {attempt + 1}: {type(e).__name__}")
            await asyncio.sleep(2 + attempt * 3)
    raise RuntimeError(f"TTS failed: {text}")


def to_wav(mp3_path, wav_path):
    # 去掉首尾静音，统一成 48 kHz 单声道；句间停顿由时间轴控制
    trim = ("silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
            "silenceremove=start_periods=1:start_threshold=-50dB,areverse")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3_path,
                    "-af", trim, "-ar", "48000", "-ac", "1", wav_path], check=True)


def srt_time(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    vid = sys.argv[1]
    vdir = os.path.join(ROOT, "videos", vid)
    script = json.load(open(os.path.join(vdir, "script.json"), encoding="utf-8"))
    fps, lead, gap = script["fps"], script["leadFrames"], script["gapFrames"]
    voice, rate = script["voice"], script["rate"]
    rules = load_lexicon()

    audio_dir = os.path.join(vdir, "audio")
    build_dir = os.path.join(vdir, "build")
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(build_dir, exist_ok=True)
    cache_path = os.path.join(audio_dir, "cache.json")
    cache = json.load(open(cache_path)) if os.path.exists(cache_path) else {}

    beats, t, srt, keep = [], 0, [], set()
    for b in script["beats"]:
        bid = b["id"]
        if "silent" in b:
            frames = round(b["silent"] * fps)
            beats.append({"id": bid, "start": t, "frames": frames})
            t += frames
            continue
        say = b["say"]
        tts = apply_lexicon(say, rules)
        key = sha(f"{voice}|{rate}|{tts}")
        wav_path = os.path.join(audio_dir, f"{bid}.wav")
        keep.add(f"{bid}.wav")
        if cache.get(bid) != key or not os.path.exists(wav_path):
            mp3_path = os.path.join(audio_dir, f"{bid}.mp3")
            asyncio.run(synth(tts, voice, rate, mp3_path))
            to_wav(mp3_path, wav_path)
            os.remove(mp3_path)
            cache[bid] = key
            print(f"synth {bid}")
        sec = wav_seconds(wav_path)
        audio_frames = math.ceil(sec * fps)
        hold = round(b.get("hold", 0) * fps)
        frames = lead + audio_frames + gap + hold
        sub = b.get("sub", say)
        beats.append({"id": bid, "start": t, "frames": frames,
                      "audio": f"{vid}/audio/{bid}.wav", "audioFrom": lead,
                      "audioFrames": audio_frames, "audioSec": round(sec, 3),
                      "sub": sub, "say": say, "tts": tts})
        a0 = (t + lead) / fps
        srt.append(f"{len(srt) + 1}\n{srt_time(a0)} --> {srt_time(a0 + sec)}\n{sub}\n")
        t += frames

    # 删掉脚本里已不存在的 beat 的旧音频，目录里只留当前脚本用得到的文件
    for f in os.listdir(audio_dir):
        if f.endswith(".wav") and f not in keep:
            os.remove(os.path.join(audio_dir, f))
            cache.pop(f[:-4], None)
            print(f"removed stale {f}")

    json.dump(cache, open(cache_path, "w"), indent=1)
    manifest = {"id": vid, "fps": fps, "totalFrames": t, "beats": beats}
    json.dump(manifest, open(os.path.join(build_dir, "manifest.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    open(os.path.join(build_dir, "captions.srt"), "w", encoding="utf-8").write("\n".join(srt))
    spoken = [b for b in beats if "audioSec" in b]
    rate_cps = sum(len(re.sub(r"[，。：；、？！“”\s]", "", b["say"])) / b["audioSec"] for b in spoken) / max(1, len(spoken))
    print(f"{len(beats)} beats, {t} frames = {t / fps:.1f} s, 语速 {rate_cps:.2f} 字/秒（不计标点）")


if __name__ == "__main__":
    main()
