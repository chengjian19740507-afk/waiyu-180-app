<div align="center">

# Travel-Ready 180 · 2,340 Phrases in 13 Languages

**One phrase per moment. Say it the moment you land. 13 languages · 2,340 phrases · 18 real travel scenarios · offline speech.**

[Live Demo](https://chengjian19740507-afk.github.io/waiyu-180-app/) ·
[Privacy Policy](https://chengjian19740507afk.github.io/waiyu-180-app/privacy.html) ·
[Terms of Use](https://chengjian19740507-afk.github.io/waiyu-180-app/terms.html) ·
[中文](README.md)

</div>

---

## What this is

The worst part of travelling abroad is freezing mid-sentence. **13 languages and 18 real travel scenarios** — enough to get you through most countries in the world, from immigration to hotel check-in, ordering food to asking for directions. Every entry shows **original text + romanization + Chinese**, and plays on tap. **Fully offline, no sign-up, no backend.**

- 🌐 **13 languages**: English / Spanish / French / Arabic / Russian / German / Hindi / Portuguese / Japanese / Korean / Vietnamese / Italian / Thai
- 💬 **2,340 phrases**: 180 per language across 18 scenarios
- 📚 **7,000 words**: 1,000 high-frequency words each with IPA, for 7 languages
- 🔊 **Offline speech**: browser-native `SpeechSynthesis` on web — **your text never leaves your device**
- 📱 **WeChat Mini Program**: AppID `wxc90a6aebcd03229c` — search "出国无忧外语180句"
- 🕊️ **No tracking**: no account, no analytics, no ads, no data collection

## The 18 scenarios

Greetings · Self-introduction · Airport & Immigration · Hotel Check-in · Front Desk · Food & Dining · Transport · Shopping · Time & Date · Directions · Numbers · Family · Common Phrases · Restaurants · Medical · Travel Essentials · Business · Social Etiquette · Visa Types

> Not every language includes every scenario — the UI renders categories dynamically per language.

## Three ways to use it

**1. Web** — open and go
```
https://chengjian19740507-afk.github.io/waiyu-180-app/
```

**2. WeChat Mini Program** — search "**出国无忧外语180句**" in WeChat.
All data ships inside the app, so it works on a plane or in a subway with no signal.

**3. Run it locally**
```bash
git clone https://github.com/chengjian19740507-afk/waiyu-180-app.git
cd waiyu-180-app
python3 -m http.server 8000
# open http://localhost:8000
```
> `SpeechSynthesis` requires HTTP(S) — you cannot open `file://` directly.

## Tech

Pure static HTML + CSS + JavaScript. **Zero dependencies, zero backend, zero build step.**

- Native browser `SpeechSynthesis` (Chrome / Safari / Edge) — no network needed
- `localStorage` for language preference and unlock state
- Hosted on GitHub Pages
- Responsive on phone / tablet / desktop
- Right-to-left rendering for Arabic
- PWA-ready, installable to the home screen

## Data format

Each `sentences-{lang}.json` holds 180 entries:

```json
{
  "id": 1,
  "category": "greetings",
  "category_zh": "问候",
  "text": "Hello",
  "romanization": "Hello",
  "translation": "你好"
}
```

Vocabulary lives in `vocabulary-{lang}.json` (1,000 words each for en / es / fr / ru / ja / ko / ar, with IPA).

## Validation

The repo ships a consistency checker so all 13 languages stay aligned at 180 phrases each:

```bash
npm run check:atlas
```

## Contributing

Issues, new languages, new scenarios, UI improvements — all welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Acknowledgements

Thanks to everyone who filed an issue, added a language, proofread a translation, or recommended the tool.

## License

| Part | License | Notes |
|---|---|---|
| Source code | [MIT](LICENSE) | Commercial use permitted |
| Phrase & vocabulary data | [CC BY-NC 4.0](LICENSE-DATA) | Free for non-commercial use, incl. translation and derivatives; **commercial use requires authorization** |

Commercial licensing: [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md) · chengjian19740507@gmail.com

Please keep the credit **"Author: 北极虎 / Cheng Jian"** and link back when you redistribute or build on this.

---

<div align="center">
<sub>© 2026 成键 / Cheng Jian — Shanghai Municipal Commission of Housing &amp; Urban-Rural Development · World Cities Day Coordination Centre</sub>
</div>
