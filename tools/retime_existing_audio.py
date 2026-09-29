"""Offline tempo correction for already synthesized per-beat WAV files.

Usage (from the repository root): python3 tools/retime_existing_audio.py <video-id> <tempo>
This never calls TTS. Run once per audio set; the marker prevents double processing.
"""
import json
import math
import os
import re
import subprocess
import sys
import wave


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wav_seconds(path):
    with wave.open(path, "rb") as audio:
        return audio.getnframes() / audio.getframerate()


def srt_time(sec):
    ms = round(sec * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    vid, tempo_text = sys.argv[1:3]
    tempo = float(tempo_text)
    if not 1.0 < tempo <= 1.1:
        raise ValueError("tempo must be between 1.0 and 1.1")
    vdir = os.path.join(ROOT, "videos", vid)
    script = json.load(open(os.path.join(vdir, "script.json"), encoding="utf-8"))
    build_dir = os.path.join(vdir, "build")
    audio_dir = os.path.join(vdir, "audio")
    manifest_path = os.path.join(build_dir, "manifest.json")
    marker = os.path.join(audio_dir, "retime.json")
    if os.path.exists(marker):
        raise RuntimeError("audio already retimed; refusing to change tempo twice")
    old = json.load(open(manifest_path, encoding="utf-8"))
    old_beats = {b["id"]: b for b in old["beats"]}
    spoken = [b for b in script["beats"] if "say" in b]
    if any(b["id"] not in old_beats or "audio" not in old_beats[b["id"]] for b in spoken):
        raise RuntimeError("manifest does not match script")

    # FFmpeg's atempo keeps pitch while shortening the existing voice recording.
    for b in spoken:
        bid = b["id"]
        wav = os.path.join(audio_dir, f"{bid}.wav")
        temp = os.path.join(audio_dir, f"{bid}.retime.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav,
                        "-af", f"atempo={tempo}", "-ar", "48000", "-ac", "1", temp], check=True)
        os.replace(temp, wav)

    fps, lead, gap = script["fps"], script["leadFrames"], script["gapFrames"]
    beats, srt, cursor = [], [], 0
    for b in script["beats"]:
        bid = b["id"]
        extra = {"section": b["section"]} if "section" in b else {}
        if "silent" in b:
            frames = round(b["silent"] * fps)
            beats.append({"id": bid, "start": cursor, "frames": frames, **extra})
        else:
            sec = wav_seconds(os.path.join(audio_dir, f"{bid}.wav"))
            audio_frames = math.ceil(sec * fps)
            frames = lead + audio_frames + gap + round(b.get("hold", 0) * fps)
            previous = old_beats[bid]
            sub = b.get("sub", b["say"])
            beats.append({"id": bid, "start": cursor, "frames": frames,
                          "audio": f"{vid}/audio/{bid}.wav", "audioFrom": lead,
                          "audioFrames": audio_frames, "audioSec": round(sec, 3),
                          "sub": sub, "say": b["say"], "tts": previous["tts"], **extra})
            start_sec = (cursor + lead) / fps
            srt.append(f"{len(srt) + 1}\n{srt_time(start_sec)} --> {srt_time(start_sec + sec)}\n{sub}\n")
        cursor += frames
    manifest = {"id": vid, "fps": fps, "totalFrames": cursor, "beats": beats}
    with open(manifest_path, "w", encoding="utf-8") as dest:
        json.dump(manifest, dest, ensure_ascii=False, indent=1)
    with open(os.path.join(build_dir, "captions.srt"), "w", encoding="utf-8") as dest:
        dest.write("\n".join(srt))
    with open(marker, "w", encoding="utf-8") as dest:
        json.dump({"source": "existing synthesized WAV files", "tempo": tempo,
                   "method": "ffmpeg atempo", "beats": len(spoken)}, dest, indent=2)
    rate = sum(len(re.sub(r"[，。：；、？！“”\s]", "", b["say"])) / b["audioSec"]
               for b in beats if "audioSec" in b) / len(spoken)
    print(f"{len(beats)} beats, {cursor} frames = {cursor / fps:.1f} s, speech rate {rate:.2f} chars/s")


if __name__ == "__main__":
    main()
