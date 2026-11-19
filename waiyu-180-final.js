// 出国无忧常用语 · 13 语种 × 210 句
(async () => {
  try {
  const langsEl = document.getElementById('langs');
  const catsEl = document.getElementById('cats');
  const cardsEl = document.getElementById('cards');
  const statsEl = document.getElementById('stats');
  const titleEl = document.getElementById('app-title');
  const subtitleEl = document.getElementById('app-subtitle');
  const searchEl = document.getElementById('search');
  const searchClearEl = document.getElementById('search-clear');
  const searchMicEl = document.getElementById('search-mic');
  const searchBoxEl = document.querySelector('.search-box');
  const tpl = document.getElementById('card-tpl');

  const RTL_LANGS = new Set(['ar']);

  // ============ 首页软件介绍（首次显示 · 可关闭并记住）============
  const heroIntroEl = document.getElementById('hero-intro');
  const heroIntroHideEl = document.getElementById('hero-intro-hide');
  const HERO_INTRO_KEY = 'waiyu-hero-intro-hidden-v1';
  if (heroIntroEl) {
    if (localStorage.getItem(HERO_INTRO_KEY) === '1') {
      heroIntroEl.hidden = true;
    } else {
      heroIntroEl.hidden = false;
    }
    if (heroIntroHideEl) {
      heroIntroHideEl.addEventListener('change', (e) => {
        if (e.target.checked) {
          localStorage.setItem(HERO_INTRO_KEY, '1');
          heroIntroEl.hidden = true;
        } else {
          localStorage.removeItem(HERO_INTRO_KEY);
          heroIntroEl.hidden = false;
        }
      });
    }
  }

  // ============ TTS 声音管理 ============
  let _voicesCache = null;
  function ensureVoices() {
    if (_voicesCache) return Promise.resolve(_voicesCache);
    if (!('speechSynthesis' in window)) return Promise.resolve([]);
    return new Promise((resolve) => {
      const v = speechSynthesis.getVoices();
      if (v && v.length) { _voicesCache = v; resolve(v); return; }
      const handler = () => {
        _voicesCache = speechSynthesis.getVoices();
        resolve(_voicesCache);
      };
      speechSynthesis.addEventListener('voiceschanged', handler);
      setTimeout(() => {
        _voicesCache = speechSynthesis.getVoices();
        resolve(_voicesCache);
      }, 1000);
    });
  }

  function pickBestVoice(voices, langCode) {
    if (!voices || !voices.length) return null;
    const lang = langCode.toLowerCase().split('-')[0];
    // 1. 完全匹配
    let v = voices.find(x => x.lang === langCode);
    if (v) return v;
    // 2. 高质量声音（premium/neural/enhanced/natural/microsoft/google）
    const qualityRe = /(premium|neural|enhanced|natural|microsoft|google|samantha|tingting|meijia)/i;
    const qualified = voices.filter(x => x.lang.toLowerCase().startsWith(lang) && qualityRe.test(x.name));
    if (qualified.length) return qualified[0];
    // 3. 任何同语族声音
    const family = voices.filter(x => x.lang.toLowerCase().startsWith(lang));
    if (family.length) return family[0];
    return null;
  }

  ensureVoices(); // 预加载

  const LANGS = {
    en: { label: '英语 · 出国无忧', sub: '文字+语音 · 英语母语发音 · 出国无忧常用语 210 句', file: 'sentences-en.json', tts: 'speech', lang: 'en-US' },
    es: { label: '西语 · 出国无忧', sub: '文字+语音 · 西语母语发音 · 出国无忧常用语 210 句', file: 'sentences-es.json', tts: 'speech', lang: 'es-ES' },
    fr: { label: '法语 · 出国无忧', sub: '文字+语音 · 法语母语发音 · 出国无忧常用语 210 句', file: 'sentences-fr.json', tts: 'speech', lang: 'fr-FR' },
    ar: { label: '阿语 · 出国无忧', sub: '文字+罗马字 · 阿语母语发音 · 出国无忧常用语 210 句', file: 'sentences-ar.json', tts: 'speech', lang: 'ar-SA' },
    ru: { label: '俄语 · 出国无忧', sub: '文字+语音 · 俄语母语发音 · 出国无忧常用语 210 句', file: 'sentences-ru.json', tts: 'speech', lang: 'ru-RU' },
    de: { label: '德语 · 出国无忧', sub: '文字+语音 · 德语母语发音 · 出国无忧常用语 210 句', file: 'sentences-de.json', tts: 'speech', lang: 'de-DE' },
    hi: { label: '印地语 · 出国无忧', sub: '文字+罗马字 · 印地语母语发音 · 出国无忧常用语 210 句', file: 'sentences-hi.json', tts: 'speech', lang: 'hi-IN' },
    pt: { label: '葡萄牙语 · 出国无忧', sub: '文字+语音 · 葡萄牙语母语发音 · 出国无忧常用语 210 句', file: 'sentences-pt.json', tts: 'speech', lang: 'pt-BR' },
    ja: { label: '日语 · 出国无忧', sub: '文字+罗马字 · 日语假名发音 · 出国无忧常用语 210 句', file: 'sentences-ja.json', tts: 'speech', lang: 'ja-JP' },
    ko: { label: '韩语 · 出国无忧', sub: '文字+罗马字 · 韩语母语发音 · 出国无忧常用语 210 句', file: 'sentences-ko.json', tts: 'speech', lang: 'ko-KR' },
    vi: { label: '越南语 · 出国无忧', sub: '文字+罗马字 · 越南语母语发音 · 出国无忧常用语 210 句', file: 'sentences-vi.json', tts: 'speech', lang: 'vi-VN' },
    it: { label: '意大利语 · 出国无忧', sub: '文字+语音 · 意大利语母语发音 · 出国无忧常用语 210 句', file: 'sentences-it.json', tts: 'speech', lang: 'it-IT' },
    th: { label: '泰语 · 出国无忧', sub: '文字+罗马字 · 泰语母语发音 · 出国无忧常用语 210 句', file: 'sentences-th.json', tts: 'speech', lang: 'th-TH' },
  };


  // ============ 访问规则（全部开放 · 2026-11-17） ============
  // 决策：非营利公益工具 —— 所有类目暂时免费，无任何收款通道。
  // 与小程序 v1.3.3 完全一致（小程序侧见 utils/access.js）。
  // 保留 FREE_CATS / isUnlocked 接口，旧调用方不会报错，后续若政策变化只改这一处。
  const ALL_CATS = [
    'emergency', 'greetings', 'intro', 'airport', 'hotel', 'frontdesk',
    'restaurant', 'transport', 'directions', 'shopping', 'food',
    'travel', 'medical', 'common', 'time', 'numbers', 'family',
    'work', 'social', 'visa'
  ];
  const FREE_CATS = new Set(ALL_CATS);

  function isUnlocked() {
    return true;
  }

  // 类目定义（2026-11-08 与小程序 v1.3.0 完全对齐）
  // 顺序原则：紧急求助排第一 → 旅行动线类目聚在一起 → 深度场景类目聚在一起（游客价值）
  const catDefs = [
    { key: 'emergency', zh: '紧急求助' },
    { key: 'greetings', zh: '问候' },
    { key: 'intro', zh: '自我介绍' },
    { key: 'airport', zh: '机场海关' },
    { key: 'hotel', zh: '宾馆入住' },
    { key: 'frontdesk', zh: '前台常用' },
    { key: 'restaurant', zh: '餐厅' },
    { key: 'transport', zh: '交通' },
    { key: 'directions', zh: '问路' },
    { key: 'shopping', zh: '购物' },
    { key: 'food', zh: '饮食' },
    { key: 'travel', zh: '旅游实用' },
    { key: 'medical', zh: '医疗' },
    { key: 'common', zh: '常用表达' },
    { key: 'time', zh: '时间日期' },
    { key: 'numbers', zh: '数字' },
    { key: 'family', zh: '家庭' },
    { key: 'work', zh: '工作场景' },
    { key: 'social', zh: '社交礼仪' },
    { key: 'visa', zh: '签证类型' },
    { key: 'all', zh: '全部' },
  ];

  const CAT_ORDER = {};
  catDefs.forEach((c, i) => CAT_ORDER[c.key] = i);

  let currentLang = localStorage.getItem('waiyu-lang') || 'en';
  let allData = [];
  let currentCat = 'all';
  let currentSearch = '';
  let currentUtter = null;
  let currentCard = null;
  let currentAudioEl = null;
  // 离线发音音频库（macOS say 生成，13 语种 × 210 句）
  const AUDIO_BASE = 'https://chengjian19740507-afk.github.io/waiyu-180-audio';

  // 离线音频相对路径：句子 audio/<lang>/<id>.mp3，词表 vocab_audio/<lang>/<rank>.mp3
  function audioRelPath(kind, lang, id) {
    return `${kind}/${lang}/${id}.mp3`;
  }

  // 播放离线 mp3 兜底（微信内置浏览器等无 speechSynthesis 的环境）
  function playMp3Fallback(relPath) {
    if (currentAudioEl) {
      try { currentAudioEl.pause(); currentAudioEl = null; } catch (e) {}
    }
    const a = new Audio(`${AUDIO_BASE}/${relPath}`);
    currentAudioEl = a;
    a.onended = () => { currentAudioEl = null; stopCurrent(); };
    a.onerror = () => {
      currentAudioEl = null;
      console.warn(`离线发音 ${lang}/${id} 加载失败`);
      stopCurrent();
    };
    a.play().catch(() => {});
  }

  function matchesSearch(s, q) {
    if (!q) return true;
    const t = (s.text || '').toLowerCase();
    const r = (s.romanization || '').toLowerCase();
    const c = (s.translation || '').toLowerCase();
    return t.includes(q) || r.includes(q) || c.includes(q);
  }

  async function load(lang) {
    const cfg = LANGS[lang];
    try {
      const res = await fetch(cfg.file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      cardsEl.innerHTML = `<div style="padding:40px;text-align:center;color:#f87171">
        加载失败：${err.message}<br><br>
        请用 <code>python3 -m http.server 8000</code> 启动本地服务
      </div>`;
      return [];
    }
  }

  // 当前语种实际包含的类别（各语种场景略有差异，如 de/hi/pt/vi/it/th 有 visa 而无 social）
  function availableCats() {
    if (!allData.length) return catDefs;
    const present = new Set(allData.map(s => s.category));
    return catDefs.filter(c => c.key === 'all' || present.has(c.key));
  }

  function renderCats() {
    catsEl.innerHTML = '';
    for (const cat of availableCats()) {
      const btn = document.createElement('button');
      // 全部类目免费开放（v1.3.3 起无锁定）
      const locked = false;
      btn.className = 'chip'
        + (cat.key === currentCat ? ' active' : '')
        + (locked ? ' locked' : '');
      btn.innerHTML = cat.zh + (locked ? ' <span class="lock-icon">🔒</span>' : '');
      btn.dataset.cat = cat.key;
      btn.addEventListener('click', () => filter(cat.key));
      catsEl.appendChild(btn);
    }
  }

  function filter(cat) {
    currentCat = cat;
    document.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === cat);
    });
    render();
  }

  function _filterOriginal(cat) {
    currentCat = cat;
    document.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cat === cat);
    });
    render();
  }

  function render() {
    const cfg = LANGS[currentLang];
    titleEl.textContent = `${cfg.label}`;
    subtitleEl.textContent = cfg.sub;
    let list;
    if (currentCat === 'all') {
      list = [...allData];
    } else {
      list = allData.filter(s => s.category === currentCat);
    }
    if (currentSearch) list = list.filter(s => matchesSearch(s, currentSearch));
    list.sort((a, b) => (CAT_ORDER[a.category] - CAT_ORDER[b.category]) || (a.id - b.id));
    if (list.length === 0 && currentSearch) {
      cardsEl.innerHTML = `<div style="padding:48px 20px;text-align:center;color:#94a3b8">未找到匹配 “<strong style="color:#475569">${currentSearch}</strong>” 的句子</div>`;
      statsEl.textContent = `共 ${allData.length} 句 · 匹配 0`;
      return;
    }
    cardsEl.innerHTML = '';
    list.forEach(s => cardsEl.appendChild(makeCard(s, cfg)));
    const matchNote = currentSearch ? ` · 匹配 ${list.length}` : '';
    statsEl.textContent = `共 ${allData.length} 句 · 当前 ${list.length}${matchNote}`;
  }

  function makeCard(s, cfg) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.id = s.id;
    node.querySelector('.num').textContent = String(s.id).padStart(3, '0');
    const textEl = node.querySelector('.text');
    textEl.textContent = s.text;
    textEl.setAttribute('dir', RTL_LANGS.has(currentLang) ? 'rtl' : 'ltr');
    textEl.setAttribute('lang', currentLang);
    node.querySelector('.romanization').textContent = s.romanization;
    node.querySelector('.translation').textContent = s.translation;

    const playBtn = node.querySelector('.play');
    playBtn.addEventListener('click', e => {
      e.stopPropagation();
      play(s, node, cfg);
    });
    node.addEventListener('click', () => play(s, node, cfg));
    return node;
  }

  function stopCurrent() {
    if (currentUtter) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioEl) {
      try { currentAudioEl.pause(); currentAudioEl = null; } catch (e) {}
    }
    if (currentCard) {
      currentCard.classList.remove('playing');
      const pb = currentCard.querySelector('.play');
      if (pb) pb.classList.remove('playing');
    }
  }

  async function play(s, node, cfg) {
    stopCurrent();

    const playBtn = node.querySelector('.play');
    node.classList.add('playing');
    playBtn.classList.add('playing');
    currentCard = node;

    if (!('speechSynthesis' in window)) {
      playMp3Fallback(audioRelPath('audio', currentLang, s.id));
      return;
    }

    const voices = await ensureVoices();
    // 优先用用户保存的 voice
    let voice = null;
    const savedName = localStorage.getItem('voice-' + currentLang);
    if (savedName) {
      voice = voices.find(v => v.name === savedName);
      if (!voice) console.warn(`保存的 voice "${savedName}" 在当前浏览器不可用，回退到自动选择`);
    }
    if (!voice) voice = pickBestVoice(voices, cfg.lang);

    const utter = new SpeechSynthesisUtterance(s.text);
    utter.lang = cfg.lang;
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang; // 使用 voice 自身的 lang，确保发音一致
    }
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    currentUtter = utter;
    utter.onend = stopCurrent;
    utter.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn(`TTS ${cfg.lang}: ${e.error}`);
      }
      stopCurrent();
    };

    if (!voice) {
      console.warn(`TTS ${cfg.lang}: 未找到匹配 voice，使用浏览器默认`);
    } else if (window._debugTTS) {
      console.log(`TTS ${cfg.lang} → ${voice.name} (${voice.lang})`);
    }

    window.speechSynthesis.speak(utter);
  }

  // ============ 声音设置弹窗 ============
  const voiceBtn = document.getElementById('voice-btn');
  const voiceModal = document.getElementById('voice-modal');
  const voiceModalBody = document.getElementById('voice-modal-body');

  async function openVoiceModal() {
    const voices = await ensureVoices();
    voiceModalBody.innerHTML = '';

    for (const [key, cfg] of Object.entries(LANGS)) {
      const lang = cfg.lang.toLowerCase().split('-')[0];
      const matching = voices.filter(v => v.lang.toLowerCase().startsWith(lang));
      const saved = localStorage.getItem('voice-' + key);

      const group = document.createElement('div');
      group.className = 'voice-group';

      const h3 = document.createElement('h3');
      const langZh = cfg.label.split('海外')[0];
      h3.textContent = key.toUpperCase() + ' · ' + langZh;
      group.appendChild(h3);

      if (!matching.length) {
        const empty = document.createElement('div');
        empty.className = 'voice-empty';
        empty.textContent = '当前浏览器无 ' + langZh + ' 语 voice';
        group.appendChild(empty);
        voiceModalBody.appendChild(group);
        continue;
      }

      const select = document.createElement('select');
      select.dataset.langKey = key;

      const autoOpt = document.createElement('option');
      autoOpt.value = '__auto__';
      autoOpt.textContent = '🔄 自动（推荐）';
      select.appendChild(autoOpt);

      matching.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = v.name + ' (' + v.lang + ')';
        if (saved && v.name === saved) opt.selected = true;
        select.appendChild(opt);
      });

      if (!saved) autoOpt.selected = true;

      select.addEventListener('change', (e) => {
        const v = e.target.value;
        if (v === '__auto__') {
          localStorage.removeItem('voice-' + key);
        } else {
          localStorage.setItem('voice-' + key, v);
        }
        // 试听（读语种名）
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(langZh);
          u.lang = cfg.lang;
          const matched = v === '__auto__'
            ? pickBestVoice(voices, cfg.lang)
            : voices.find(voice => voice.name === v);
          if (matched) {
            u.voice = matched;
            u.lang = matched.lang;
          }
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        } catch (err) {
          console.warn('试听失败:', err);
        }
      });

      group.appendChild(select);
      voiceModalBody.appendChild(group);
    }

    voiceModal.hidden = false;
  }

  function closeVoiceModal() {
    voiceModal.hidden = true;
    window.speechSynthesis.cancel();
  }

  if (voiceBtn) voiceBtn.addEventListener('click', openVoiceModal);
  voiceModal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeVoiceModal);
  });
  document.addEventListener('keydown', e => {
    if (e.code === 'Escape' && !voiceModal.hidden) closeVoiceModal();
  });

  for (const btn of langsEl.querySelectorAll('.lang-chip')) {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;
      stopCurrent();
      currentLang = lang;
      localStorage.setItem('waiyu-lang', lang);
      langsEl.querySelectorAll('.lang-chip').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
      });
      allData = await load(lang);
      currentCat = 'all';
      renderCats();
      render();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      const first = cardsEl.querySelector('.card');
      if (first) first.click();
    }
  });

  searchEl.addEventListener('input', e => {
    currentSearch = e.target.value.trim().toLowerCase();
    searchClearEl.hidden = !currentSearch;
    searchBoxEl.classList.toggle('has-clear', !!currentSearch);
    if (currentMode === 'vocab') {
      vocabVisibleCount = 200;
      renderVocab();
    } else {
      render();
    }
  });
  searchClearEl.addEventListener('click', () => {
    searchEl.value = '';
    currentSearch = '';
    searchClearEl.hidden = true;
    searchBoxEl.classList.remove('has-clear');
    if (currentMode === 'vocab') {
      renderVocab();
    } else {
      render();
    }
    searchEl.focus();
  });

  // ============ 语音搜索（跟随当前语种）============
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  if (SpeechRec && searchMicEl) {
    searchMicEl.hidden = false;
    searchMicEl.addEventListener('click', () => {
      if (recognition) {
        // 正在听 → 停止
        recognition.stop();
        return;
      }
      recognition = new SpeechRec();
      recognition.lang = LANGS[currentLang].lang;  // 跟随当前语种：en-US / ru-RU / ja-JP …
      recognition.interimResults = false;  // 只取最终结果，简化 UX
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.trim();
        searchEl.value = transcript;
        searchEl.dispatchEvent(new Event('input'));
      };
      recognition.onerror = (e) => {
        console.warn('语音搜索错误:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          alert('麦克风权限被拒绝，请在浏览器设置中允许麦克风后重试。');
        } else if (e.error === 'no-speech') {
          // 静默：用户没说话不算错误
        } else {
          alert('语音识别失败：' + e.error);
        }
      };
      recognition.onend = () => {
        searchMicEl.classList.remove('recording');
        recognition = null;
      };
      try {
        recognition.start();
        searchMicEl.classList.add('recording');
      } catch (err) {
        console.warn('recognition.start() 失败:', err);
        recognition = null;
      }
    });
  } else if (searchMicEl) {
    // 浏览器不支持 → 永久隐藏
    searchMicEl.hidden = true;
  }

  langsEl.querySelectorAll('.lang-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
  allData = await load(currentLang);
  renderCats();
  render();

  // ============ 词汇表模式（1000 词）============
  const modeToggleEl = document.getElementById('mode-toggle');
  const vocabEl = document.getElementById('vocab');
  const vocabTbodyEl = document.getElementById('vocab-tbody');
  const vocabMoreEl = document.getElementById('vocab-more');
  const vocabCountEl = document.getElementById('vocab-count');
  const vocabMoreBtn = document.getElementById('vocab-more-btn');

  let currentMode = localStorage.getItem('waiyu-mode') || 'sentences';
  let currentVocab = [];
  let vocabVisibleCount = 200;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function renderVocab() {
    if (!currentVocab.length) return;
    const f = currentSearch;
    const filtered = f
      ? currentVocab.filter(v =>
          (v.word || '').toLowerCase().includes(f) ||
          (v.ipa || '').toLowerCase().includes(f) ||
          (v.translation || '').toLowerCase().includes(f))
      : currentVocab;
    const visible = filtered.slice(0, vocabVisibleCount);
    vocabTbodyEl.innerHTML = visible.map(v => `
      <tr>
        <td class="vocab-rank">${v.rank}</td>
        <td class="vocab-word" data-word="${escapeHtml(v.word)}" data-lang="${currentLang}" data-rank="${v.rank}">${escapeHtml(v.word)}</td>
        <td class="vocab-ipa">${escapeHtml(v.ipa || '')}</td>
        <td class="vocab-trans">${escapeHtml(v.translation || '')}</td>
      </tr>
    `).join('');
    if (filtered.length > vocabVisibleCount) {
      vocabMoreEl.hidden = false;
      vocabCountEl.textContent = `已显示 ${visible.length} / 共 ${filtered.length} 词`;
    } else {
      vocabMoreEl.hidden = true;
    }
  }

  async function loadVocab(lang) {
    try {
      const res = await fetch(`vocabulary-${lang}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      currentVocab = await res.json();
      vocabVisibleCount = 200;
      renderVocab();
    } catch (err) {
      vocabTbodyEl.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:#f87171">词汇加载失败：${err.message}</td></tr>`;
      vocabMoreEl.hidden = true;
    }
  }

  function switchMode(mode) {
    currentMode = mode;
    localStorage.setItem('waiyu-mode', mode);
    modeToggleEl.querySelectorAll('.mode-btn').forEach(b => {
      const active = b.dataset.mode === mode;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', active);
    });
    if (mode === 'vocab') {
      cardsEl.hidden = true;
      catsEl.hidden = true;
      vocabEl.hidden = false;
      loadVocab(currentLang);
    } else {
      cardsEl.hidden = false;
      catsEl.hidden = false;
      vocabEl.hidden = true;
    }
  }

  // 词点击 → TTS 发音
  vocabTbodyEl.addEventListener('click', e => {
    const cell = e.target.closest('.vocab-word');
    if (!cell) return;
    const word = cell.dataset.word;
    const lang = cell.dataset.lang;
    const rank = cell.dataset.rank;
    if (!word) return;
    stopCurrent();
    if (!('speechSynthesis' in window)) {
      if (rank) playMp3Fallback(audioRelPath('vocab_audio', lang, rank));
      return;
    }
    const cfg = LANGS[lang];
    const u = new SpeechSynthesisUtterance(word);
    u.lang = cfg.lang;
    u.rate = 0.85;
    currentUtter = u;
    speechSynthesis.speak(u);
  });

  modeToggleEl.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  vocabMoreBtn.addEventListener('click', () => {
    vocabVisibleCount += 200;
    renderVocab();
  });

  // 初始化模式
  if (currentMode === 'vocab') {
    switchMode('vocab');
  }

  } catch(e) {
    console.error("IIFE ERROR:", e);
    document.body.insertAdjacentHTML("beforeend", "<pre style=\"position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:9999\">IIFE ERROR: " + e.message + "</pre>");
  }
})();