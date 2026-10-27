#!/usr/bin/env python3
"""
批量生成 13 语种 × 180 句的离线 TTS 音频。

引擎：macOS 内置 `say`（187 个系统语音，覆盖全部目标语种）
      → ffmpeg 转 mp3（libmp3lame 48kbps 单声道 22.05kHz）

为什么不用 edge-tts：微软已封本机出口 IP（403），且隧道 URL 每次重启都变，
微信后台「request 合法域名」白名单要跟着改 + 重新发版。离线音频一次生成、URL 恒定。

用法：
  python3 scripts/gen_audio.py --out ../waiyu-180-audio --jobs 8
"""
import argparse, json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 语种 → (macOS 音色, 源数据文件)
LANGS = {
    'en': ('Samantha', 'en'), 'es': ('Mónica', 'es'), 'fr': ('Thomas', 'fr'),
    'ar': ('Majed', 'ar'),   'ru': ('Milena', 'ru'),     'de': ('Anna', 'de'),
    'hi': ('Lekha', 'hi'),   'pt': ('Luciana', 'pt'),   'ja': ('Kyoko', 'ja'),
    'ko': ('Yuna', 'ko'),    'vi': ('Linh', 'vi'),       'it': ('Alice', 'it'),
    'th': ('Kanya', 'th'),
}

def clean(t: str) -> str:
    t = ' '.join(t.replace('\n', ' ').split())
    return t.strip()

def synth_one(lang, voice, text, out_mp3: Path) -> tuple[bool, str]:
    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    if out_mp3.exists() and out_mp3.stat().st_size > 512:
        return True, 'skip'
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / 'a.wav'
        r = subprocess.run(['say', '-v', voice, '-o', str(wav),
                            '--data-format=LEI16@22050', text],
                           capture_output=True, text=True)
        if r.returncode != 0 or not wav.exists() or wav.stat().st_size == 0:
            return False, f'say failed: {(r.stderr or "")[:120]}'
        r2 = subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
                             '-codec:a', 'libmp3lame', '-b:a', '48k',
                             '-ar', '22050', '-ac', '1', str(out_mp3)],
                            capture_output=True, text=True)
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
        f = data_root / f'sentences-{src}.json'
        d = json.load(open(f, encoding='utf-8'))
        for item in d:
            text = clean(item.get('text', ''))
            if not text:
                continue
            tasks.append((lang, voice, text, out_root / 'audio' / lang / f"{item['id']}.mp3"))

    print(f'▶ 待生成 {len(tasks)} 个音频（13 语种）→ {out_root}/audio', flush=True)
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
                if len(errors) < 20:
                    errors.append(f'{lang}/{path.name}: {msg}')
            if done % 100 == 0 or done == len(tasks):
                print(f'  {done}/{len(tasks)}  ok={ok} skip={skip} fail={fail}', flush=True)

    # manifest
    man = {}
    for lang in LANGS:
        d = json.load(open(data_root / f"sentences-{LANGS[lang][1]}.json", encoding='utf-8'))
        man[lang] = {str(i['id']): i.get('text', '') for i in d}
    (out_root / 'manifest.json').write_text(json.dumps(
        {'version': 1, 'base': 'https://chengjian19740507-afk.github.io/waiyu-180-audio/audio',
         'format': 'mp3', 'langs': list(LANGS), 'entries': man},
        ensure_ascii=False, indent=1), encoding='utf-8')

    print(f'\n完成：生成 {ok}，跳过 {skip}，失败 {fail}', flush=True)
    if errors:
        print('失败明细：')
        for e in errors: print('  ' + e)
    total = sum(f.stat().st_size for f in (out_root/'audio').rglob('*.mp3')) if (out_root/'audio').exists() else 0
    print(f'总体积：{total/1024/1024:.1f} MB')
    return 1 if fail else 0

if __name__ == '__main__':
    sys.exit(main())
