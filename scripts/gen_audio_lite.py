#!/usr/bin/env python3
"""
生成「小程序内置版」句子音频：32kbps 单声道 22.05kHz，体积约为 48kbps 的 2/3。

2340 句 × 32kbps ≈ 12.9MB，配合现有 2.4MB 代码 = 15.3MB，
可装进微信小程序 20MB 总包上限（按语种分包，单包 ≤ 2MB）。

与 gen_audio.py 的区别：
  - 输出到独立目录，不覆盖已上线的 48kbps 库（那个给网页版和数据集用）
  - 32kbps（可在 24/32/48 之间调）
  - 只生成句子，不含词表（词表 7000 个放不进小程序）

用法：
  python3 scripts/gen_audio_lite.py --out ../waiyu-180-audio-lite --jobs 8 --bitrate 32
"""
import argparse, json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LANGS = {
    'en': ('Samantha', 'en'), 'es': ('Mónica', 'es'), 'fr': ('Thomas', 'fr'),
    'ar': ('Majed', 'ar'),   'ru': ('Milena', 'ru'),     'de': ('Anna', 'de'),
    'hi': ('Lekha', 'hi'),   'pt': ('Luciana', 'pt'),   'ja': ('Kyoko', 'ja'),
    'ko': ('Yuna', 'ko'),    'vi': ('Linh', 'vi'),       'it': ('Alice', 'it'),
    'th': ('Kanya', 'th'),
}

def clean(t):
    return ' '.join(str(t or '').replace('\n', ' ').split()).strip()

def synth_one(lang, voice, text, out_mp3: Path, bitrate: int):
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    if out_mp3.exists() and out_mp3.stat().st_size > 512:
        return True, 'skip'
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / 'a.wav'
        r = subprocess.run(['say', '-v', voice, '-o', str(wav),
                            '--data-format=LEI16@22050', text], capture_output=True, text=True)
        if r.returncode != 0 or not wav.exists() or wav.stat().st_size == 0:
            return False, f'say failed: {(r.stderr or "")[:120]}'
        r2 = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
                             '-codec:a', 'libmp3lame', '-b:a', f'{bitrate}k',
                             '-ar', '22050', '-ac', '1', str(out_mp3)],
                            capture_output=True, text=True)
        if r2.returncode != 0 or not out_mp3.exists():
            return False, f'ffmpeg failed: {(r2.stderr or "")[:120]}'
    return True, 'ok'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(ROOT.parent / 'waiyu-180-audio-lite'))
    ap.add_argument('--jobs', type=int, default=8)
    ap.add_argument('--bitrate', type=int, default=32)
    ap.add_argument('--data', default=str(ROOT))
    args = ap.parse_args()

    out_root = Path(args.out)
    data_root = Path(args.data)

    tasks = []
    for lang, (voice, src) in LANGS.items():
        for item in json.load(open(data_root / f'sentences-{src}.json', encoding='utf-8')):
            text = clean(item.get('text'))
            if text:
                tasks.append((lang, voice, text, out_root / 'audio' / lang / f"{item['id']}.mp3"))

    print(f'▶ 待生成 {len(tasks)} 个（{args.bitrate}kbps）→ {out_root}/audio', flush=True)
    ok = fail = skip = 0
    errors = []
    with ThreadPoolExecutor(max_workers=args.jobs) as ex:
        futs = {ex.submit(synth_one, *t, args.bitrate): t for t in tasks}
        done = 0
        for fut in as_completed(futs):
            lang, voice, text, path = futs[fut]
            done += 1
            try:
                good, msg = fut.result()
            except Exception as e:
                good, msg = False, str(e)[:120]
            if good:
                if msg == 'skip': skip += 1
                else: ok += 1
            else:
                fail += 1
                if len(errors) < 10: errors.append(f'{lang}/{path.name}: {msg}')
            if done % 300 == 0 or done == len(tasks):
                print(f'  {done}/{len(tasks)}  ok={ok} skip={skip} fail={fail}', flush=True)

    # 体积报告 + 每语种分包大小
    print(f'\n完成：生成 {ok}，跳过 {skip}，失败 {fail}', flush=True)
    for e in errors: print('  ' + e)
    print(f'\n每语种体积（用于分包）：')
    total = 0
    for lang in LANGS:
        d = out_root / 'audio' / lang
        if not d.exists(): continue
        sz = sum(f.stat().st_size for f in d.glob('*.mp3'))
        total += sz
        print(f'  {lang}: {sz/1024/1024:.2f}MB  {"⚠超2MB单包上限" if sz > 2*1024*1024 else "✓"}')
    print(f'  合计 {total/1024/1024:.2f}MB  (+ 现有 2.4MB 代码 = {(total+2.4*1024*1024)/1024/1024:.1f}MB)')
    return 1 if fail else 0

if __name__ == '__main__':
    sys.exit(main())
