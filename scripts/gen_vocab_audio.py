#!/usr/bin/env python3
"""
批量生成 7 语种 × 1000 词的离线 TTS 音频（词表）。

引擎同 gen_audio.py：macOS 内置 `say` → ffmpeg 转 mp3。
输出：<out>/vocab_audio/<lang>/<rank>.mp3，文件名用 rank（词表自带的稳定序号）

用法：
  python3 scripts/gen_vocab_audio.py --out ../waiyu-180-audio --jobs 8
"""
import argparse, json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

LANGS = {
    'en': ('Samantha', 'en'), 'es': ('Mónica', 'es'), 'fr': ('Thomas', 'fr'),
    'ar': ('Majed', 'ar'),   'ru': ('Milena', 'ru'),   'ja': ('Kyoko', 'ja'),
    'ko': ('Yuna', 'ko'),
}

def clean(t):
    return ' '.join(str(t or '').replace('\n', ' ').split()).strip()

def synth_one(lang, voice, text, out_mp3: Path):
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
                             '-codec:a', 'libmp3lame', '-b:a', '48k', '-ar', '22050',
                             '-ac', '1', str(out_mp3)], capture_output=True, text=True)
        if r2.returncode != 0 or not out_mp3.exists():
            return False, f'ffmpeg failed: {(r2.stderr or "")[:120]}'
    return True, 'ok'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=str(ROOT.parent / 'waiyu-180-audio'))
    ap.add_argument('--jobs', type=int, default=8)
    ap.add_argument('--data', default=str(ROOT))
    args = ap.parse_args()

    out_root = Path(args.out)
    data_root = Path(args.data)

    tasks = []
    for lang, (voice, src) in LANGS.items():
        f = data_root / f'vocabulary-{src}.json'
        if not f.exists():
            print(f'跳过 {lang}：{f.name} 不存在', flush=True)
            continue
        for item in json.load(open(f, encoding='utf-8')):
            text = clean(item.get('word'))
            if not text:
                continue
            rank = item.get('rank')
            if rank is None:
                continue
            tasks.append((lang, voice, text, out_root / 'vocab_audio' / lang / f'{rank}.mp3'))

    print(f'▶ 待生成 {len(tasks)} 个词表音频（{len(LANGS)} 语种）→ {out_root}/vocab_audio', flush=True)
    ok = fail = skip = 0
    errors = []
    with ThreadPoolExecutor(max_workers=args.jobs) as ex:
        futs = {ex.submit(synth_one, *t): t for t in tasks}
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
                if len(errors) < 15:
                    errors.append(f'{lang}/{path.name}: {msg}')
            if done % 200 == 0 or done == len(tasks):
                print(f'  {done}/{len(tasks)}  ok={ok} skip={skip} fail={fail}', flush=True)

    print(f'\n完成：生成 {ok}，跳过 {skip}，失败 {fail}', flush=True)
    for e in errors:
        print('  ' + e)
    total = sum(f.stat().st_size for f in (out_root/'vocab_audio').rglob('*.mp3')) if (out_root/'vocab_audio').exists() else 0
    print(f'总体积：{total/1024/1024:.1f} MB')
    return 1 if fail else 0

if __name__ == '__main__':
    sys.exit(main())
