"""Re-recognize ASR outliers with a terminology prompt, preserving the first report.

Usage: PYTHONPATH=<asr libraries> python3 tools/review_audio.py <video id>
This is an automated second pass; it does not certify human listening or tones.
"""
import json
import os
import sys
from faster_whisper import WhisperModel
from asr_check import score

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
vid = sys.argv[1]
build = os.path.join(ROOT, 'videos', vid, 'build')
first = json.load(open(os.path.join(build, 'asr_check.json'), encoding='utf-8'))
model = WhisperModel(os.path.join(ROOT, 'models', 'faster-whisper-small'), device='cpu', compute_type='int8')
# 提示词取自这一集在课程登记里的概念和代码词，工具本身不写某一集的内容。
# 提示词会把识别结果推向预期的词，所以这一轮只能排除识别端的误差，不能证明读音正确
def load(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as handle:
        return json.load(handle)
names = [c['name'] for c in load('curriculum/concepts.json') if c['episode'] == vid]
codes = [t['code'].split()[0] for t in load('curriculum/terms.json') if t['episode'] == vid]
prompt = '中文技术讲解。术语：' + '，'.join(names) + '。代码词：' + '，'.join(dict.fromkeys(codes)) + '。'
report = []
for row in first:
    if row['ratio'] >= 0.95:
        continue
    wav = os.path.join(ROOT, 'videos', vid, 'audio', row['id'] + '.wav')
    segments, _ = model.transcribe(wav, language='zh', beam_size=8, initial_prompt=prompt,
                                   condition_on_previous_text=False)
    heard = ''.join(s.text for s in segments).strip()
    ratio, diffs = score(row['say'], heard)
    item = {'id':row['id'], 'firstHeard':row['heard'], 'reviewHeard':heard,
            'reviewRatio':round(ratio,3), 'reviewDiffs':diffs, 'say':row['say']}
    report.append(item)
    print(json.dumps(item, ensure_ascii=False), flush=True)
with open(os.path.join(build,'asr_review.json'),'w',encoding='utf-8') as handle:
    json.dump(report, handle, ensure_ascii=False, indent=1)
print('Reviewed', len(report), 'outliers; no original report overwritten.')
