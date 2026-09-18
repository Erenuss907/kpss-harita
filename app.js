'use strict';
/* ════════════════════════════════════════════════════════════════════
   Türkiye Dağları & Gölleri Ezber  –  app.js
   Requires: data.js (DAGLAR, GOLLER, ALL_ITEMS, ALL_KATEGORILER, CAT_TO_IMAGE)
   ════════════════════════════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────────────────────────────
const TOLERANCE     = 5;   // % radius for correct click
const REPEAT_GAP    = 4;   // re-insert wrong answer every N questions
const QUESTION_TIME = 15;  // seconds per question in timed mode
const LS_PROG       = 'trk-progress';
const LS_CAL        = 'trk-calibration';
const LS_BADGES     = 'trk-badges';
const LS_SOUND      = 'trk-sound';
const LS_TTS        = 'trk-tts';
const LS_BLITZ_HIGH = 'trk-blitz-high';

// ── State ─────────────────────────────────────────────────────────────────
const S = {
  mode: 'mountains', category: null, qtype: 'mixed',
  screenMode: 'menu',
  timedMode: false,
  isMistakesMode: false,
  isBlitz: false,
  isDaily: false,
  activeItems: [], queue: [],
  currentItem: null, currentQType: null, isAnswered: false,
  sessionStats: { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 },
  streak: 0,
  timerId: null, timeLeft: QUESTION_TIME,
  calTarget: null,
  osymData: null,
  // blitz mode
  blitzScore: 0,
  blitzTimeLeft: 60,
  blitzTimerId: null,
  blitzHighScore: 0,
  lastAnswerTime: 0,
  // explore mode
  exploreCat: null,
  exploreSelectedId: null,
  exploredItemsCount: 0,
  // pinch / pan
  mapScale: 1, mapTx: 0, mapTy: 0,
  pinching: false, pinchStartDist: 0, pinchStartScale: 1,
  panning: false, panStartX: 0, panStartY: 0, panStartTx: 0, panStartTy: 0,
  // flashcards
  fcMode: 'card', fcQueue: [], fcTotalInit: 0, fcCurrent: null,
  fcStats: { correct: 0, wrong: 0 },
  // persisted
  progress: {}, calibration: {}, badges: [],
};

// ── DOM helpers ───────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls)  e.className  = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
const esc = s => String(s||'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ── Category colour lookup ─────────────────────────────────────────────────
const CAT_COLOR = {};
ALL_KATEGORILER.forEach(k => { CAT_COLOR[k.id] = k.renk; });

// ─────────────────────────────────────────────────────────────────────────
//  WEB AUDIO API (SOUND EFFECTS) & HAPTICS
// ─────────────────────────────────────────────────────────────────────────
const Sound = {
  ctx: null,
  enabled: localStorage.getItem(LS_SOUND) !== 'false',
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(LS_SOUND, this.enabled ? 'true' : 'false');
    updateSoundUI();
    if (this.enabled) this.playTone(600, 0.05, 'sine', 0.1);
  },
  playTone(freq, duration, type='sine', gainVal=0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(_) {}
  },
  playCorrect() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine'; osc2.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);       // D5
      osc2.frequency.setValueAtTime(880.00, now + 0.09); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc1.connect(gain); osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now); osc1.stop(now + 0.09);
      osc2.start(now + 0.09); osc2.stop(now + 0.32);
    } catch(_) {}
  },
  playWrong() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.linearRampToValueAtTime(115, now + 0.22);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch(_) {}
  },
  playStreak() {
    if (!this.enabled) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.18, 'sine', 0.1), idx * 60);
    });
  },
  playBadge() {
    if (!this.enabled) return;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.25, 'sine', 0.12), idx * 80);
    });
  }
};

function updateSoundUI() {
  const icon = Sound.enabled ? '🔊' : '🔇';
  const soundIcon = document.querySelector('#menu-sound-btn .tool-btn-icon') || $('menu-sound-btn');
  if (soundIcon) soundIcon.textContent = icon;
  const quizBtn = $('btn-sound-toggle');
  if (quizBtn) quizBtn.textContent = icon;
}

// ─────────────────────────────────────────────────────────────────────────
//  TEXT-TO-SPEECH (TTS) SES MOTORU
// ─────────────────────────────────────────────────────────────────────────
const SpeechEngine = {
  enabled: localStorage.getItem(LS_TTS) === 'true',
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(LS_TTS, this.enabled ? 'true' : 'false');
    updateTTSUI();
    if (this.enabled) {
      this.speak('Sesli soru okuma açıldı.');
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  },
  speak(rawText) {
    if (!this.enabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = String(rawText || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/[•*_~"']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      const utt = new SpeechSynthesisUtterance(clean);
      utt.lang = 'tr-TR';
      utt.rate = 1.0;
      utt.pitch = 1.0;
      window.speechSynthesis.speak(utt);
    } catch (_) {}
  }
};

function updateTTSUI() {
  const icon = SpeechEngine.enabled ? '🗣️' : '🤐';
  const quizBtn = $('btn-tts-toggle');
  if (quizBtn) quizBtn.textContent = icon;
}

function triggerHaptic(ok) {
  try {
    if (navigator.vibrate) {
      if (ok) navigator.vibrate(35);
      else navigator.vibrate([40, 45, 40]);
    }
  } catch(_) {}
}

// ─────────────────────────────────────────────────────────────────────────
//  ACHIEVEMENT BADGES
// ─────────────────────────────────────────────────────────────────────────
const BADGES_DEF = [
  { id: 'first_quiz',  icon: '🌱', title: 'İlk Adım',         desc: 'İlk harita testini başarıyla tamamla' },
  { id: 'streak_3',    icon: '🔥', title: "3'te 3",          desc: 'Üst üste 3 doğru cevap ver' },
  { id: 'streak_5',    icon: '⚡', title: 'Alev Aldın',        desc: 'Üst üste 5 doğru cevap ver' },
  { id: 'streak_10',   icon: '👑', title: 'Durdurulamaz',     desc: 'Üst üste 10 doğru cevap ver' },
  { id: 'toroslar',    icon: '⛰️', title: 'Dağlar Kurdu',      desc: 'Dağlar testinde en az %80 başarı göster' },
  { id: 'goller',      icon: '💧', title: 'Göller Kaşifi',     desc: 'Göller testinde en az %80 başarı göster' },
  { id: 'ovalar',      icon: '🌾', title: 'Ova Fatihi',        desc: 'Ovalar testinde en az %80 başarı göster' },
  { id: 'platolar',    icon: '🏞️', title: 'Yayla & Plato Ustası', desc: 'Platolar testinde en az %80 başarı göster' },
  { id: 'akarsu_ustasi',icon: '🌊', title: 'Akarsu Kurdu',      desc: 'Akarsular testinde en az %80 başarı göster' },
  { id: 'gecit_rehberi',icon: '🚪', title: 'Geçitler Rehberi',  desc: 'Geçitler testinde en az %80 başarı göster' },
  { id: 'gunun_fatihi',icon: '📅', title: 'Günün Fatihi',      desc: 'Günün KPSS Harita Görevini başarıyla tamamla' },
  { id: 'kart_ustasi', icon: '🃏', title: 'Kart Dehası',       desc: 'Bir Bilgi Kartları turunu tamamla' },
  { id: 'hizli_tur',   icon: '⏱️', title: 'Hız Canavarı',     desc: 'Süreye karşı modda bir tur tamamla' },
  { id: 'kesifci',     icon: '🗺️', title: 'Meraklı Kâşif',    desc: 'Haritayı İncele modunda 5 farklı noktayı incele' },
  { id: 'kusursuz',    icon: '🌟', title: 'Kusursuz Tur',     desc: 'En az 8 soruluk bir testi %100 doğrulukla bitir' },
  { id: 'blitz_first', icon: '⚡', title: 'Fırtına Başlangıcı', desc: 'İlk 60 sn Harita Fırtınası turunu tamamla' },
  { id: 'blitz_1000',  icon: '🏎️', title: 'Hız Şampiyonu',     desc: 'Harita Fırtınasında 1.000 puanı aş' },
  { id: 'blitz_2000',  icon: '👑', title: 'Efsane Refleks',    desc: 'Harita Fırtınasında 2.000 puan yaparak rekor kır' },
];

function loadBadges() {
  try { S.badges = JSON.parse(localStorage.getItem(LS_BADGES)) || []; } catch(_) { S.badges = []; }
}
function saveBadges() {
  localStorage.setItem(LS_BADGES, JSON.stringify(S.badges));
}
function unlockBadge(id) {
  if (S.badges.includes(id)) return;
  const b = BADGES_DEF.find(x => x.id === id);
  if (!b) return;
  S.badges.push(id);
  saveBadges();
  Sound.playBadge();
  showStreakToast(`🏆 Rozet Kazanıldı: ${b.title}!`, b.desc);
}

function openBadgesModal() {
  const list = $('badges-list');
  if (!list) return;
  list.innerHTML = '';
  BADGES_DEF.forEach(b => {
    const isUnlocked = S.badges.includes(b.id);
    const card = el('div', `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`);
    card.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-title">${esc(b.title)}</div>
      <div class="badge-desc">${esc(b.desc)}</div>
      <div style="font-size:10px;font-weight:700;margin-top:2px;color:${isUnlocked?'#2ecc71':'#7f8c8d'}">
        ${isUnlocked ? '✓ Açıldı' : '🔒 Kilitli'}
      </div>`;
    list.appendChild(card);
  });
  $('modal-badges').classList.remove('hidden');
}

// ─────────────────────────────────────────────────────────────────────────
//  MNEMONICS MODAL
// ─────────────────────────────────────────────────────────────────────────
function openMnemonicsModal(filterCat = null) {
  const list = $('mnemonics-list');
  if (!list) return;
  list.innerHTML = '';
  const cats = ALL_KATEGORILER.filter(k => k.kodlama && (!filterCat || k.id === filterCat));
  cats.forEach(k => {
    const item = el('div', 'mnemonic-item');
    item.style.borderLeft = `4px solid ${k.renk}`;
    item.innerHTML = `
      <div class="mnemonic-cat" style="color:${k.renk}">
        ${k.tip === 'dag' ? '⛰️' : '💧'} ${esc(k.id)}
      </div>
      <div class="mnemonic-text">${esc(k.kodlama)}</div>`;
    list.appendChild(item);
  });
  $('modal-mnemonics').classList.remove('hidden');
}

// ─────────────────────────────────────────────────────────────────────────
//  SCREEN MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────
function showScreen(id) {
  hideDisambiguationBubble();
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = '';
  });
  const scr = $(id);
  if (scr) { scr.classList.add('active'); }
}

// ─────────────────────────────────────────────────────────────────────────
//  MAP IMAGE & STAGE SIZING
// ─────────────────────────────────────────────────────────────────────────
function resizeMapStage() {
  const container = $('map-container');
  const img       = $('map-bg');
  const stage     = $('map-stage');
  if (!container || !img || !stage) return;
  if (!img.src || img.classList.contains('hidden') || !img.naturalWidth) return;

  const cW = container.clientWidth;
  const cH = container.clientHeight;
  const nW = img.naturalWidth;
  const nH = img.naturalHeight;
  const s  = Math.min(cW / nW, cH / nH);

  stage.style.width  = Math.round(nW * s) + 'px';
  stage.style.height = Math.round(nH * s) + 'px';
}

function switchMapImage(kategori) {
  const src    = CAT_TO_IMAGE[kategori] || null;
  const img    = $('map-bg');
  const noImg  = $('map-no-img');
  const stage  = $('map-stage');

  if (src) {
    if (!img.src.endsWith(src)) {
      img.onload = () => resizeMapStage();
      img.src = src;
    }
    img.classList.remove('hidden');
    stage.classList.remove('hidden');
    noImg.classList.add('hidden');
    if (img.complete) resizeMapStage();
  } else {
    img.src = '';
    img.classList.add('hidden');
    stage.classList.add('hidden');
    noImg.classList.remove('hidden');
  }
}

window.addEventListener('resize', () => resizeMapStage());
window.addEventListener('orientationchange', () => setTimeout(resizeMapStage, 120));

// ─────────────────────────────────────────────────────────────────────────
//  COORDINATE CONVERSION  (stage-percentage ↔ screen)
// ─────────────────────────────────────────────────────────────────────────
function imgPoint(clientX, clientY) {
  const stage = $('map-stage');
  const rect  = stage.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(100, (clientX - rect.left) / rect.width * 100)),
    y: Math.max(0, Math.min(100, (clientY - rect.top) / rect.height * 100)),
  };
}

// ─────────────────────────────────────────────────────────────────────────
//  PINS
// ─────────────────────────────────────────────────────────────────────────
function addPin(xPct, yPct, label, color, size=18, pulse=true, extraCls='', onClick=null) {
  const wrap = el('div', 'pin-wrap' + (extraCls ? ' ' + extraCls : ''));
  wrap.style.left = xPct + '%';
  wrap.style.top  = yPct + '%';

  if (pulse) {
    const ring = el('div', 'pin-ring');
    ring.style.width  = ring.style.height = (size + 14) + 'px';
    ring.style.borderColor = color;
    wrap.appendChild(ring);
  }

  const dot = el('div', 'pin-dot');
  dot.style.width  = dot.style.height = size + 'px';
  dot.style.background = color;

  if (label !== null && label !== '') {
    const lbl = el('span', 'pin-lbl', String(label));
    dot.appendChild(lbl);
  }

  wrap.appendChild(dot);
  if (onClick) {
    wrap.addEventListener('click', e => { e.stopPropagation(); onClick(e); });
  }

  $('map-pins').appendChild(wrap);
  return wrap;
}

function clearPins() { $('map-pins').innerHTML = ''; }

function enableMapClick(on) {
  const ov = $('map-overlay');
  if (ov) ov.style.pointerEvents = on ? 'all' : 'none';
}

// ─────────────────────────────────────────────────────────────────────────
//  DISAMBIGUATION BUBBLE (ÇİFT / YAKIN NOKTA SEÇİMİ)
// ─────────────────────────────────────────────────────────────────────────
let currentBubbleEl = null;

function hideDisambiguationBubble() {
  if (currentBubbleEl) {
    currentBubbleEl.remove();
    currentBubbleEl = null;
  }
}

function showDisambiguationBubble(clientX, clientY, items, onSelect) {
  hideDisambiguationBubble();
  const container = $('map-container');
  if (!container || !items || items.length === 0) return;

  const rect = container.getBoundingClientRect();
  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  const bubble = el('div', 'disambiguation-bubble');
  // If tap is too close to the top of the container, flip arrow to top
  if (relY < 120) {
    bubble.classList.add('arrow-up');
  }

  // Keep bubble within horizontal container bounds
  const clampedX = Math.max(95, Math.min(rect.width - 95, relX));
  bubble.style.left = clampedX + 'px';
  bubble.style.top  = relY + 'px';

  const header = el('div', 'bubble-header');
  header.innerHTML = `
    <span class="bubble-title">Hangisini Seçtiniz?</span>
    <button class="bubble-close" title="Kapat">✕</button>
  `;
  header.querySelector('.bubble-close').addEventListener('click', e => {
    e.stopPropagation();
    hideDisambiguationBubble();
  });
  bubble.appendChild(header);

  const optWrap = el('div', 'bubble-options');
  items.forEach(item => {
    const btn = el('button', 'bubble-opt-btn');
    const color = CAT_COLOR[item.kategori] || '#38bdf8';
    btn.innerHTML = `
      <span class="bubble-opt-dot" style="background:${color}"></span>
      <span>${esc(item.isim)}</span>
    `;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      hideDisambiguationBubble();
      onSelect(item);
    });
    optWrap.appendChild(btn);
  });
  bubble.appendChild(optWrap);

  // Prevent taps inside bubble from propagating to map
  bubble.addEventListener('click', e => e.stopPropagation());
  bubble.addEventListener('touchend', e => e.stopPropagation());

  container.appendChild(bubble);
  currentBubbleEl = bubble;
  Sound.playTone(480, 0.04, 'sine', 0.08);
}

// ─────────────────────────────────────────────────────────────────────────
//  LOCAL STORAGE & PROGRESS
// ─────────────────────────────────────────────────────────────────────────
function loadProgress()    { try { S.progress    = JSON.parse(localStorage.getItem(LS_PROG)) || {}; } catch(_){ S.progress = {}; } }
function saveProgress()    { localStorage.setItem(LS_PROG, JSON.stringify(S.progress)); }
function loadCalibration() { try { S.calibration = JSON.parse(localStorage.getItem(LS_CAL))  || {}; } catch(_){ S.calibration = {}; } }
function saveCalibration() { localStorage.setItem(LS_CAL,  JSON.stringify(S.calibration)); }

function applyCalibration() {
  ALL_ITEMS.forEach(item => {
    const c = S.calibration[item.id];
    if (c) { item.x = c.x; item.y = c.y; }
  });
}

// ── Analytics & Mastery Calculations ──────────────────────────────────────
function getCategoryMastery(catId) {
  const items = ALL_ITEMS.filter(i => i.kategori === catId && i.x !== null && i.y !== null);
  if (items.length === 0) return { total: 0, learned: 0, pct: 0 };
  const learned = items.filter(i => {
    const p = S.progress[i.id];
    return p && p.attempts > 0 && p.wrong === 0;
  }).length;
  return { total: items.length, learned, pct: Math.round((learned / items.length) * 100) };
}

function getOverallMastery() {
  const calibrated = ALL_ITEMS.filter(i => i.x !== null && i.y !== null && CAT_TO_IMAGE[i.kategori]);
  if (calibrated.length === 0) return { total: 0, learned: 0, pct: 0 };
  const learned = calibrated.filter(i => {
    const p = S.progress[i.id];
    return p && p.attempts > 0 && p.wrong === 0;
  }).length;
  return { total: calibrated.length, learned, pct: Math.round((learned / calibrated.length) * 100) };
}

function getMistakesCount() {
  const active = getActiveItems();
  return active.filter(i => (S.progress[i.id]?.wrong || 0) > 0).length;
}

function updateMasteryUI() {
  const overall = getOverallMastery();
  const textEl = $('menu-mastery-text');
  const fillEl = $('menu-mastery-fill');
  if (textEl) textEl.textContent = `%${overall.pct} (${overall.learned}/${overall.total})`;
  if (fillEl) fillEl.style.width = `${overall.pct}%`;

  // Update mistakes badge
  const mistakesCnt = getMistakesCount();
  const mBtn = $('mistakes-btn');
  const mBadge = $('mistakes-badge');
  if (mBadge) mBadge.textContent = mistakesCnt;
  if (mBtn) {
    if (mistakesCnt > 0) mBtn.classList.remove('hidden');
    else mBtn.classList.add('hidden');
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('trk-cal-v3') !== 'ready') {
    localStorage.removeItem(LS_CAL);
    localStorage.setItem('trk-cal-v3', 'ready');
  }

  loadProgress();
  loadCalibration();
  loadBadges();
  applyCalibration();
  buildMenu();
  bindMenuEvents();
  bindResultsEvents();
  bindShareModalEvents();
  bindMapGestures();
  bindMapClickEvents();
  updateSoundUI();
  showScreen('screen-menu');
});

// ─────────────────────────────────────────────────────────────────────────
//  MENU
// ─────────────────────────────────────────────────────────────────────────
function buildMenu() {
  renderCategoryChips();
  updateItemCount();
  updateMasteryUI();
  updateBlitzBadge();
}

function updateBlitzBadge() {
  S.blitzHighScore = parseInt(localStorage.getItem(LS_BLITZ_HIGH) || '0', 10);
  const badge = $('blitz-high-badge');
  if (badge) {
    badge.textContent = S.blitzHighScore > 0
      ? `👑 Rekor: ${S.blitzHighScore} Puan`
      : '⚡ 60 Saniye';
  }
}

function bindMenuEvents() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.mode = btn.dataset.mode; S.category = null;
      renderCategoryChips(); updateItemCount(); updateMasteryUI();
      Sound.playTone(500, 0.04, 'sine', 0.08);
    });
  });

  document.querySelectorAll('.qtype-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.qtype-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.qtype = btn.dataset.qtype;
      Sound.playTone(500, 0.04, 'sine', 0.08);
    });
  });

  // Timer Challenge Toggle
  $('timer-toggle-btn')?.addEventListener('click', () => {
    S.timedMode = !S.timedMode;
    const btn = $('timer-toggle-btn');
    if (btn) {
      btn.classList.toggle('active', S.timedMode);
      btn.innerHTML = S.timedMode
        ? `⏱️ Süreye Karşı: <b>15 sn (AÇIK)</b>`
        : `⏱️ Süreye Karşı: <b>KAPALI</b>`;
    }
    Sound.playTone(S.timedMode ? 650 : 400, 0.06, 'sine', 0.1);
  });

  // Action Buttons
  $('start-btn')?.addEventListener('click', () => startQuiz(false));
  $('osym-btn')?.addEventListener('click', () => startOsymMode());
  $('blitz-btn')?.addEventListener('click', () => startBlitzMode());
  $('explore-btn')?.addEventListener('click', () => enterExploreMode());
  $('mistakes-btn')?.addEventListener('click', () => startQuiz(true));

  // Reset Progress
  $('reset-btn')?.addEventListener('click', () => {
    if (!confirm('Tüm ilerleme ve öğrenme istatistikleri sıfırlansın mı?')) return;
    S.progress = {}; saveProgress();
    buildMenu();
    Sound.playTone(300, 0.1, 'sine', 0.1);
  });

  // Header Tools
  $('menu-sound-btn')?.addEventListener('click', () => Sound.toggle());
  $('menu-badges-btn')?.addEventListener('click', openBadgesModal);
  $('modal-badges-close')?.addEventListener('click', () => $('modal-badges').classList.add('hidden'));
  $('menu-mnemonics-btn')?.addEventListener('click', () => openMnemonicsModal());
  $('modal-mnemonics-close')?.addEventListener('click', () => $('modal-mnemonics').classList.add('hidden'));
  $('menu-daily-btn')?.addEventListener('click', startDailyChallenge);
  $('menu-pdf-btn')?.addEventListener('click', exportStudyAtlasPDF);

  // Bilgi Kartları modal
  const fcBtn = $('flashcard-btn');
  if (fcBtn) fcBtn.addEventListener('click', openFlashcardModal);
  const closeBtn = $('btn-fc-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', () => $('modal-fc-mode').classList.add('hidden'));
  const cardModeBtn = $('btn-fc-card-mode');
  if (cardModeBtn) cardModeBtn.addEventListener('click', () => {
    $('modal-fc-mode').classList.add('hidden');
    startFlashcards('card');
  });
  const testModeBtn = $('btn-fc-test-mode');
  if (testModeBtn) testModeBtn.addEventListener('click', () => {
    $('modal-fc-mode').classList.add('hidden');
    startFlashcards('test');
  });
}

function renderCategoryChips() {
  const c = $('category-container');
  c.innerHTML = '';
  const cats = ALL_KATEGORILER.filter(k =>
    S.mode === 'mixed'     ? true :
    S.mode === 'mountains' ? k.tip === 'dag' :
    S.mode === 'ovalar'    ? k.tip === 'ova' :
    S.mode === 'platolar'  ? k.tip === 'plato' :
    S.mode === 'akarsular' ? k.tip === 'akarsu' :
    S.mode === 'gecitler'  ? k.tip === 'gecit' :
    k.tip === 'gol'
  );

  addChip(c, 'Hepsi', '#7f8c8d', null, S.category === null, () => {
    S.category = null; renderCategoryChips(); updateItemCount(); updateMasteryUI();
  });

  cats.forEach(k => {
    const hasImg = !!CAT_TO_IMAGE[k.id];
    const mastery = getCategoryMastery(k.id);
    addChip(c, k.id + (hasImg ? '' : ' 🚫'), k.renk, mastery.pct, S.category === k.id, () => {
      S.category = k.id; renderCategoryChips(); updateItemCount(); updateMasteryUI();
    });
  });
}

function addChip(parent, label, color, masteryPct, active, onClick) {
  const btn = el('button', 'cat-chip' + (active ? ' active' : ''));
  btn.style.borderColor = color;
  btn.style.color       = active ? '#fff' : color;
  if (active) btn.style.background = color;

  let text = esc(label);
  if (masteryPct !== null && masteryPct !== undefined) {
    text += `<span class="cat-mastery-tag" style="background:${active?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.15)'}">%${masteryPct}</span>`;
  }
  btn.innerHTML = text;
  btn.addEventListener('click', onClick);
  parent.appendChild(btn);
}

function getActiveItems() {
  return ALL_ITEMS.filter(item => {
    const tipOk  = S.mode === 'mixed'     ? true :
                   S.mode === 'mountains' ? item.tip === 'dag' :
                   S.mode === 'ovalar'    ? item.tip === 'ova' :
                   S.mode === 'platolar'  ? item.tip === 'plato' :
                   S.mode === 'akarsular' ? item.tip === 'akarsu' :
                   S.mode === 'gecitler'  ? item.tip === 'gecit' :
                   item.tip === 'gol';
    const catOk  = !S.category || item.kategori === S.category;
    return tipOk && catOk;
  });
}

function updateItemCount() {
  $('item-count').textContent = `(${getActiveItems().length} öğe)`;

  const facts = getActiveFacts();
  const showFC = facts && facts.length > 0;

  const fcBtn = $('flashcard-btn');
  if (fcBtn) {
    if (showFC) fcBtn.classList.remove('hidden');
    else fcBtn.classList.add('hidden');
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  QUIZ FLOW & TIMERS
// ─────────────────────────────────────────────────────────────────────────
function startQuiz(isMistakesMode = false) {
  let pool = getActiveItems();
  const calibrated = pool.filter(i => i.x !== null && i.y !== null && CAT_TO_IMAGE[i.kategori]);
  if (calibrated.length === 0) {
    alert('Bu kategoride henüz kalibre edilmiş soru bulunmuyor!');
    return;
  }

  if (isMistakesMode) {
    const mistakesPool = calibrated.filter(i => (S.progress[i.id]?.wrong || 0) > 0);
    if (mistakesPool.length === 0) {
      alert('Tebrikler! Bu kategoride henüz hiç yanlışınız yok.');
      return;
    }
    S.isMistakesMode = true;
    S.queue = shuffle(mistakesPool);
  } else {
    S.isMistakesMode = false;
  S.queue = buildQueue(calibrated);
  }

  S.isBlitz      = false;
  S.isDaily      = false;
  S.activeItems  = calibrated;
  S.screenMode   = 'quiz';
  S.sessionStats = { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 };
  S.streak       = 0;
  S.isAnswered   = false;
  S.calTarget    = null;
  hideDisambiguationBubble();
  $('res-blitz-banner')?.classList.add('hidden');

  showScreen('screen-main');
  resetMapTransform();
  nextQuestion();
}

function buildQueue(items) {
  const q = [];
  items.forEach(item => {
    const w = 1 + Math.min((S.progress[item.id] || { wrong:0 }).wrong, 3);
    for (let i = 0; i < w; i++) q.push(item);
  });
  return shuffle(q);
}

function startQuestionTimer() {
  stopQuestionTimer();
  const bar  = $('quiz-timer-bar');
  const fill = $('quiz-timer-fill');
  if (!S.timedMode || !bar || !fill) {
    if (bar) bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  fill.className = 'quiz-timer-fill';
  fill.style.width = '100%';
  S.timeLeft = QUESTION_TIME;

  const startMs = Date.now();
  const durationMs = QUESTION_TIME * 1000;

  S.timerId = setInterval(() => {
    const elapsed = Date.now() - startMs;
    const remaining = Math.max(0, durationMs - elapsed);
    const pct = (remaining / durationMs) * 100;
    fill.style.width = pct + '%';

    if (pct < 30) {
      fill.className = 'quiz-timer-fill danger';
    } else if (pct < 60) {
      fill.className = 'quiz-timer-fill warning';
    }

    if (remaining <= 0) {
      stopQuestionTimer();
      handleTimeOut();
    }
  }, 100);
}

function stopQuestionTimer() {
  if (S.timerId) {
    clearInterval(S.timerId);
    S.timerId = null;
  }
}

function handleTimeOut() {
  if (S.isAnswered || S.screenMode !== 'quiz') return;
  S.isAnswered = true;
  Sound.playWrong();
  triggerHaptic(false);

  recordAnswer(S.currentItem, false);

  if (S.currentQType === 'osym') {
    handleOsymTimeout();
  } else if (S.currentQType === 'name-to-loc') {
    enableMapClick(false);
    addPin(S.currentItem.x, S.currentItem.y, null, '#27ae60', 20);
    appendFeedback(false, S.currentItem, true);
  } else {
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.id === S.currentItem.id) btn.classList.add('correct');
    });
    appendFeedback(false, S.currentItem, true);
  }
}

function nextQuestion() {
  stopQuestionTimer();
  hideDisambiguationBubble();
  let item = null;
  while (S.queue.length > 0) {
    const c = S.queue.shift();
    if (CAT_TO_IMAGE[c.kategori] && c.x !== null && c.y !== null) {
      item = c; break;
    }
  }
  if (!item) { endSession(); return; }

  S.currentItem  = item;
  if (S.qtype === 'osym') {
    S.currentQType = 'osym';
  } else if (S.qtype === 'mixed') {
    const r = Math.random();
    if (r < 0.33) {
      S.currentQType = 'osym';
    } else if (r < 0.66) {
      S.currentQType = 'name-to-loc';
    } else {
      S.currentQType = 'loc-to-name';
    }
  } else {
    S.currentQType = S.qtype;
  }
  S.isAnswered   = false;

  switchMapImage(item.kategori);
  clearPins();
  enableMapClick(false);
  $('top-panel').innerHTML = '';
  $('bottom-panel').innerHTML = '';

  renderQuizHeader();
  renderQuestion();
  startQuestionTimer();
}

function renderQuizHeader() {
  const done  = S.sessionStats.correct + S.sessionStats.wrong;
  const total = done + S.queue.length + 1;
  const cat   = S.isDaily
    ? '📅 Günün KPSS Sınavı'
    : (S.isMistakesMode
        ? '🎯 Yanıldıklarım'
        : (S.currentQType === 'osym' || S.qtype === 'osym'
            ? '🏛️ ÖSYM Soru Formatı'
            : (S.category || (
                S.mode==='mountains'?'Dağlar':
                S.mode==='lakes'?'Göller':
                S.mode==='ovalar'?'Ovalar':
                S.mode==='platolar'?'Platolar':
                S.mode==='akarsular'?'Akarsular':
                S.mode==='gecitler'?'Geçitler':
                'Karışık'
              ))));
  const streakHtml = S.streak >= 2
    ? `<div class="tbar-streak"><span class="streak-flame">🔥</span> ${S.streak} Seri!</div>`
    : '';

  $('top-bar').innerHTML = `
    <button class="btn-icon" id="quiz-back">←</button>
    <div class="tbar-meta">
      <div class="tbar-cat">${esc(cat)}</div>
      <div class="tbar-progress">${done+1} / ${total}</div>
    </div>
    ${streakHtml}
    <div class="tbar-score">
      <span class="score-c">✓ ${S.sessionStats.correct}</span>
      <span class="score-w">✗ ${S.sessionStats.wrong}</span>
    </div>
    <button class="btn-icon" id="btn-sound-toggle" title="Sesi Aç/Kapat">${Sound.enabled ? '🔊' : '🔇'}</button>
    <button class="btn-icon" id="btn-tts-toggle" title="Sesli Soru Okuma">${SpeechEngine.enabled ? '🗣️' : '🤐'}</button>
    <button class="btn-icon" id="btn-hint-mnemonic" title="Hafıza İpucu">💡</button>`;

  $('quiz-back')?.addEventListener('click', () => {
    if (confirm('Quizden çıkmak istiyor musunuz?')) {
      stopQuestionTimer();
      clearPins(); enableMapClick(false); showScreen('screen-menu'); buildMenu();
    }
  });
  $('btn-sound-toggle')?.addEventListener('click', () => Sound.toggle());
  $('btn-tts-toggle')?.addEventListener('click', () => SpeechEngine.toggle());
  $('btn-hint-mnemonic')?.addEventListener('click', () => {
    const cat = ALL_KATEGORILER.find(k => k.id === S.currentItem.kategori);
    if (cat && cat.kodlama) {
      alert(`💡 ${cat.id} Hafıza Şifresi:

${cat.kodlama}`);
    } else {
      alert('Bu kategori için özel bir şifre bulunamadı.');
    }
  });
}

function renderQuestion() {
  const item  = S.currentItem;
  const color = CAT_COLOR[item.kategori] || '#3498db';

  const tipName = item.tip === 'dag' ? 'dağ' :
                  item.tip === 'ova' ? 'ova' :
                  item.tip === 'plato' ? 'plato' :
                  item.tip === 'akarsu' ? 'akarsu' :
                  item.tip === 'gecit' ? 'dağ geçidi' : 'göl';

  if (S.currentQType === 'osym') {
    renderOsymQuestion(item);
  } else if (S.currentQType === 'name-to-loc') {
    $('top-panel').innerHTML = `
      <div class="question-prompt">
        <div class="q-hint">Haritada tıklayın / dokunun</div>
        <div class="q-name">${esc(item.isim)}</div>
        <div class="q-cat" style="color:${color}">${esc(item.kategori)}</div>
      </div>`;
    enableMapClick(true);
    $('bottom-panel').innerHTML = `
      <div style="padding:8px 14px;font-size:11px;color:#7f8c8d;text-align:center">
        Tolerans ±${TOLERANCE}% &nbsp;·&nbsp; Pinch ile zoom &nbsp;·&nbsp; Çift tık = sıfırla
      </div>`;
    if (SpeechEngine.enabled) {
      SpeechEngine.speak(`${item.isim}. Haritada nerede?`);
    }
  } else {
    addPin(item.x, item.y, '?', '#f39c12', 20, true);
    renderChoices(item);
    if (SpeechEngine.enabled) {
      SpeechEngine.speak(`İşaretli yer hangi ${tipName}?`);
    }
  }
}

function renderChoices(correct) {
  const options = buildChoices(correct);
  const wrap    = el('div', 'choices-wrap');
  const tipName = correct.tip === 'dag' ? 'dağ' :
                  correct.tip === 'ova' ? 'ova' :
                  correct.tip === 'plato' ? 'plato' :
                  correct.tip === 'akarsu' ? 'akarsu' :
                  correct.tip === 'gecit' ? 'dağ geçidi' : 'göl';
  wrap.appendChild(el('div', 'choices-hint',
    `Bu konum hangi ${tipName}dır/dir?`));
  const grid = el('div', 'choices-grid');
  options.forEach(opt => {
    const btn = el('button', 'choice-btn', esc(opt.isim));
    btn.dataset.id = opt.id;
    btn.addEventListener('click', () => handleChoice(opt));
    grid.appendChild(btn);
  });
  wrap.appendChild(grid);
  $('bottom-panel').appendChild(wrap);
}

function buildChoices(correct) {
  const pool = ALL_ITEMS.filter(i =>
    i.id !== correct.id && i.x !== null && i.y !== null && i.tip === correct.tip
  );
  const same  = pool.filter(i => i.kategori === correct.kategori);
  const other = pool.filter(i => i.kategori !== correct.kategori);
  return shuffle([correct, ...shuffle([...same, ...other]).slice(0, 3)]);
}

// ─────────────────────────────────────────────────────────────────────────
//  ÖSYM QUESTION FORMAT (I - II - III - IV - V)
// ─────────────────────────────────────────────────────────────────────────
function startOsymMode() {
  document.querySelectorAll('.qtype-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.qtype === 'osym');
  });
  S.qtype = 'osym';
  Sound.playTone(550, 0.06, 'sine', 0.1);
  startQuiz(false);
}

function sanitizeNoteForOsym(note, itemName) {
  if (!note) return '';
  let s = note;
  const words = itemName.split(/\s+/).filter(w => w.length > 2);
  words.forEach(w => {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    s = s.replace(re, '___');
  });
  return s;
}

function buildOsymQuestionData(target) {
  const mapImg = CAT_TO_IMAGE[target.kategori];
  const mapPool = ALL_ITEMS.filter(i =>
    CAT_TO_IMAGE[i.kategori] === mapImg &&
    i.x !== null && i.y !== null
  );

  const optCount = Math.min(5, mapPool.length);
  const distractorsNeeded = Math.max(1, optCount - 1);

  let archetype = 'id'; // 'formation' | 'feature' | 'id'
  let stemHtml = '';
  let badgeSub = 'Harita Sorusu';
  let distractorPool = mapPool.filter(i => i.id !== target.id);

  const isMountains = (target.tip === 'dag');
  const isOva       = (target.tip === 'ova');
  const isPlato     = (target.tip === 'plato');
  const isAkarsu    = (target.tip === 'akarsu');
  const isGecit     = (target.tip === 'gecit');

  if (isMountains) {
    const isVolcanic = (target.kategori === 'Volkanik Dağlar');
    const isFaulted  = (target.kategori === 'Kırıklı Dağlar');
    const isFolded   = (target.kategori === 'Kıvrımlı Dağlar');

    const rand = Math.random();
    if (rand < 0.42) {
      if (isVolcanic) {
        archetype = 'formation';
        badgeSub = 'Jeolojik Oluşum (Volkanizma)';
        stemHtml = `
          <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
          <div class="osym-q-stem">Bu alanların hangisinde <b>volkanik faaliyetler (magmatizma)</b> sonucu oluşmuş bir dağ yer almaktadır?</div>
        `;
        const nonVolcanic = distractorPool.filter(i => i.kategori !== 'Volkanik Dağlar');
        if (nonVolcanic.length >= distractorsNeeded) {
          distractorPool = nonVolcanic;
        }
      } else if (isFaulted) {
        archetype = 'formation';
        badgeSub = 'Jeolojik Oluşum (Horst / Kırılma)';
        stemHtml = `
          <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
          <div class="osym-q-stem">Bu alanların hangisinde <b>faylanma ve kırılma hareketleri (horst)</b> sonucu oluşmuş bir dağ yer almaktadır?</div>
        `;
        const nonFaulted = distractorPool.filter(i => i.kategori !== 'Kırıklı Dağlar');
        if (nonFaulted.length >= distractorsNeeded) {
          distractorPool = nonFaulted;
        }
      } else if (isFolded && Math.random() < 0.5) {
        archetype = 'formation';
        badgeSub = 'Jeolojik Oluşum (Orojenez / Kıvrılma)';
        stemHtml = `
          <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
          <div class="osym-q-stem">Bu alanların hangisinde <b>orojenez (levha sıkışması ve kıvrılma)</b> sonucu oluşmuş bir dağ yer almaktadır?</div>
        `;
        const others = distractorPool.filter(i => i.kategori !== 'Kıvrımlı Dağlar');
        if (others.length >= 2) {
          distractorPool = shuffle([...others, ...distractorPool]);
        }
      }
    }
  } else if (isOva && Math.random() < 0.42) {
    if (target.kategori === 'Delta Ovaları') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Delta)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde akarsuların taşıdığı alüvyonları denize döküldüğü yerde biriktirmesiyle oluşan bir <b>delta ovası</b> yer almaktadır?</div>
      `;
      const nonDelta = distractorPool.filter(i => i.kategori !== 'Delta Ovaları');
      if (nonDelta.length >= distractorsNeeded) distractorPool = nonDelta;
    } else if (target.kategori === 'Karstik Ovalar (Polye)') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Karstik Polye)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde kalker/kireçtaşı arazilerin erimesi ve karstlaşma sonucu oluşan bir <b>polye (karstik ova)</b> yer almaktadır?</div>
      `;
      const nonKarst = distractorPool.filter(i => i.kategori !== 'Karstik Ovalar (Polye)');
      if (nonKarst.length >= distractorsNeeded) distractorPool = nonKarst;
    } else if (target.kategori === 'Tektonik Ovalar') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Tektonizma)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde fay hatları boyunca meydana gelen çökmeler sonucu oluşmuş bir <b>tektonik ova</b> yer almaktadır?</div>
      `;
    }
  } else if (isPlato && Math.random() < 0.42) {
    if (target.kategori === 'Karstik Platolar') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Karstik Plato)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde kalkerli arazinin derin kanyonlarla yarılması sonucu oluşmuş <b>karstik bir plato</b> yer almaktadır?</div>
      `;
    } else if (target.kategori === 'Volkanik Platolar') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Lav Platosu)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde lav örtülerinin akarsularca yarılmasıyla oluşan yüksek <b>volkanik bir plato</b> yer almaktadır?</div>
      `;
    } else if (target.kategori === 'Aşınım Platoları') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Peneplen)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde aşınarak deniz seviyesine yaklaşmış düzlüğün sonradan yükselmesiyle oluşan bir <b>aşınım (peneplen) platosu</b> yer almaktadır?</div>
      `;
    } else if (target.kategori === 'Tabaka Düzlüğü Platoları') {
      archetype = 'formation';
      badgeSub = 'Jeomorfolojik Oluşum (Yatay Duruşlu)';
      stemHtml = `
        <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
        <div class="osym-q-stem">Bu alanların hangisinde yatay duruşlu tortul tabakaların derin akarsu vadileriyle yarılmasıyla oluşan bir <b>tabaka düzlüğü platosu</b> yer almaktadır?</div>
      `;
    }
  } else if (isAkarsu && Math.random() < 0.45) {
    archetype = 'formation';
    badgeSub = 'Akarsu & Havza';
    stemHtml = `
      <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
      <div class="osym-q-stem">Bu alanların hangisinde <b>${esc(target.kategori)}</b> kuşağında yer alan önemli bir akarsu bulunmaktadır?</div>
    `;
  } else if (isGecit && Math.random() < 0.5) {
    archetype = 'formation';
    badgeSub = 'Ulaşım & Dağ Geçidi';
    stemHtml = `
      <div class="osym-q-intro">Aşağıdaki Türkiye haritasında numaralandırılarak ${optCount} alan gösterilmiştir.</div>
      <div class="osym-q-stem">Bu alanların hangisinde kıyı kuşağı ile iç kesimler arasındaki karayolu ulaşımını sağlayan stratejik bir <b>dağ geçidi</b> yer almaktadır?</div>
    `;
  }

  // Feature question candidate (if not formation and target has a good note)
  if (archetype === 'id' && target.not && target.not.trim().length > 14 && Math.random() < 0.6) {
    archetype = 'feature';
    badgeSub = 'KPSS Soru Kalıbı';
    const cleanNote = sanitizeNoteForOsym(target.not, target.isim);
    const itemNoun = (target.tip === 'dag') ? 'dağ' :
                     (target.tip === 'ova') ? 'ova' :
                     (target.tip === 'plato') ? 'plato' :
                     (target.tip === 'akarsu') ? 'akarsu' :
                     (target.tip === 'gecit') ? 'dağ geçidi' : 'göl';
    stemHtml = `
      <div class="osym-q-intro">Aşağıdaki haritada numaralandırılarak ${optCount} alan gösterilmiştir.</div>
      <div class="osym-q-bullet">• <i>"${esc(cleanNote)}"</i></div>
      <div class="osym-q-stem">Yukarıda özellikleri belirtilen <b>${itemNoun}</b>, haritada numaralandırılmış alanların hangisinde yer almaktadır?</div>
    `;
  }

  // Fallback: Direct identification question
  if (archetype === 'id') {
    badgeSub = 'Lokasyon Belirleme';
    stemHtml = `
      <div class="osym-q-intro">Aşağıdaki haritada numaralandırılarak ${optCount} alan gösterilmiştir.</div>
      <div class="osym-q-stem">Bu alanların hangisinde <b>${esc(target.isim)}</b> yer almaktadır?</div>
    `;
  }

  // Distractor selection with spatial separation (>= 4.8%)
  const selected = [target];
  const candidates = shuffle(distractorPool);

  for (const cand of candidates) {
    if (selected.length >= optCount) break;
    const tooClose = selected.some(s => Math.hypot(cand.x - s.x, cand.y - s.y) < 4.8);
    if (!tooClose) selected.push(cand);
  }

  // If still need more, loosen distance requirement
  if (selected.length < optCount) {
    for (const cand of candidates) {
      if (selected.length >= optCount) break;
      if (!selected.some(s => s.id === cand.id)) {
        selected.push(cand);
      }
    }
  }

  const ROMANS  = ['I', 'II', 'III', 'IV', 'V'];
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  const shuffledItems = shuffle(selected);

  const options = shuffledItems.map((item, idx) => ({
    letter: LETTERS[idx],
    roman: ROMANS[idx],
    item: item,
    isCorrect: item.id === target.id
  }));

  const correctOption = options.find(o => o.isCorrect);

  return {
    target,
    options,
    correctOption,
    stemHtml,
    badgeSub,
    mapImg
  };
}

function renderOsymQuestion(target) {
  const osymData = buildOsymQuestionData(target);
  S.osymData = osymData;
  enableMapClick(false);
  clearPins();

  // 1. Top Panel: Prompt
  $('top-panel').innerHTML = `
    <div class="osym-prompt">
      <div class="osym-badge-row">
        <span class="osym-tag">🏛️ ÖSYM FORMATI</span>
        <span class="osym-sub-tag">${osymData.badgeSub}</span>
      </div>
      ${osymData.stemHtml}
    </div>
  `;

  // 2. Map Pins: Roman numerals with .pin-osym
  osymData.options.forEach(opt => {
    addPin(
      opt.item.x,
      opt.item.y,
      opt.roman,
      '#0f172a',
      28,
      true,
      'pin-osym',
      () => handleOsymChoice(opt)
    );
  });

  // 3. Bottom Panel: Choice buttons
  const wrap = el('div', 'osym-choices-wrap');
  wrap.innerHTML = `
    <div class="osym-choices-hint">👆 Haritadaki numaraya dokunun veya aşağıdaki seçeneği işaretleyin:</div>
    <div class="osym-choices-row">
      ${osymData.options.map(opt => `
        <button class="osym-choice-btn" data-letter="${opt.letter}" data-roman="${opt.roman}" data-id="${opt.item.id}">
          <span class="osym-opt-letter">${opt.letter})</span>
          <span class="osym-opt-roman">${opt.roman}</span>
        </button>
      `).join('')}
    </div>
  `;

  wrap.querySelectorAll('.osym-choice-btn').forEach(btn => {
    const roman = btn.dataset.roman;
    const opt = osymData.options.find(o => o.roman === roman);
    if (opt) {
      btn.addEventListener('click', () => handleOsymChoice(opt));
    }
  });

  $('bottom-panel').innerHTML = '';
  $('bottom-panel').appendChild(wrap);
}

function handleOsymChoice(chosenOpt) {
  if (S.isAnswered || !S.osymData) return;
  stopQuestionTimer();
  S.isAnswered = true;

  const osym = S.osymData;
  const ok = chosenOpt.isCorrect;

  if (ok) {
    Sound.playCorrect();
    triggerHaptic(true);
  } else {
    Sound.playWrong();
    triggerHaptic(false);
  }

  recordAnswer(osym.target, ok);

  // Disable buttons and update button colors
  document.querySelectorAll('.osym-choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.roman === osym.correctOption.roman) {
      btn.classList.add('correct');
    } else if (!ok && btn.dataset.roman === chosenOpt.roman) {
      btn.classList.add('wrong');
    }
  });

  // Reveal pins on the map
  revealOsymPins(chosenOpt, false);

  // Render comprehensive ÖSYM breakdown in bottom panel
  renderOsymFeedback(ok, chosenOpt, false);
}

function handleOsymTimeout() {
  if (S.isAnswered || !S.osymData) return;
  stopQuestionTimer();
  S.isAnswered = true;

  Sound.playWrong();
  triggerHaptic(false);
  recordAnswer(S.osymData.target, false);

  document.querySelectorAll('.osym-choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.roman === S.osymData.correctOption.roman) {
      btn.classList.add('correct');
    }
  });

  revealOsymPins(null, true);
  renderOsymFeedback(false, null, true);
}

function revealOsymPins(chosenOpt, isTimeout = false) {
  if (!S.osymData) return;
  clearPins();

  S.osymData.options.forEach(opt => {
    let pinLabel = opt.roman;
    let extraCls = 'pin-osym';
    let pinColor = '#334155';
    let pinSize  = 26;
    let pulse    = false;

    if (opt.isCorrect) {
      pinLabel = opt.roman + ' ✓';
      extraCls = 'pin-osym revealed-correct';
      pinColor = '#059669';
      pinSize  = 30;
      pulse    = true;
    } else if (chosenOpt && !chosenOpt.isCorrect && opt.roman === chosenOpt.roman) {
      pinLabel = opt.roman + ' ✗';
      extraCls = 'pin-osym revealed-wrong';
      pinColor = '#dc2626';
      pinSize  = 28;
    }

    const pinWrap = addPin(
      opt.item.x,
      opt.item.y,
      pinLabel,
      pinColor,
      pinSize,
      pulse,
      extraCls
    );

    // Add visual name tag under the pin
    const tag = el('div', 'pin-osym-label' + (opt.isCorrect ? ' is-target' : ''));
    tag.textContent = `${opt.roman}: ${opt.item.isim}`;
    pinWrap.appendChild(tag);
  });
}

function renderOsymFeedback(ok, chosenOpt, isTimeout = false) {
  const osym = S.osymData;
  const target = osym.target;
  const correctOpt = osym.correctOption;

  const panel = el('div', 'feedback-panel osym-feedback');
  panel.innerHTML = `
    <div class="osym-fb-header">
      <div class="fb-icon">${ok ? '✅' : '❌'}</div>
      <div style="flex:1">
        <div class="fb-result ${ok ? 'correct' : 'wrong'}">
          ${isTimeout ? '⏰ Süre Doldu!' : (ok ? 'Tebrikler, Doğru Cevap!' : 'Yanlış Cevap!')}
        </div>
        <div class="osym-fb-correct-ans">
          Doğru Seçenek: <b>${correctOpt.letter}) ${correctOpt.roman}</b> — 
          <span style="color:${CAT_COLOR[target.kategori] || '#38bdf8'};font-weight:700;">${esc(target.isim)}</span> 
          <span style="color:#94a3b8;font-size:12px;">(${esc(target.kategori)})</span>
        </div>
      </div>
    </div>

    ${target.not ? `
      <div class="fb-item-note" style="margin:0">
        📌 <b>ÖSYM Bilgi Notu:</b> ${esc(target.not)}
      </div>
    ` : ''}

    <div class="osym-breakdown-card">
      <div class="osym-breakdown-title">📋 Haritadaki Tüm Numaraların Açıklaması</div>
      <div class="osym-breakdown-list">
        ${osym.options.map(opt => `
          <div class="osym-breakdown-item ${opt.isCorrect ? 'is-correct' : ''}">
            <span class="breakdown-roman">${opt.roman}:</span>
            <span class="breakdown-name">${esc(opt.item.isim)}</span>
            <span class="breakdown-cat">(${esc(opt.item.kategori)})</span>
            ${opt.isCorrect ? '<span class="breakdown-check">✓ Doğru</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <button class="fb-continue" id="osym-continue-btn" style="width:100%;margin-top:2px;">Sonraki Soru →</button>
  `;

  panel.querySelector('#osym-continue-btn').addEventListener('click', () => {
    resetMapTransform();
    clearPins();
    $('top-panel').innerHTML = '';
    $('bottom-panel').innerHTML = '';
    S.osymData = null;
    nextQuestion();
  });

  $('bottom-panel').innerHTML = '';
  $('bottom-panel').appendChild(panel);
}


// ─────────────────────────────────────────────────────────────────────────
//  ANSWER CHECKING & STREAKS
// ─────────────────────────────────────────────────────────────────────────
function onMapClick(e) {
  if (S.screenMode === 'calibration' && S.calTarget) {
    const pt = imgPoint(e.clientX, e.clientY);
    setCalibrationPoint(pt.x, pt.y);
    return;
  }
  if (S.screenMode === 'explore') {
    handleExploreMapClick(e);
    return;
  }
  if ((S.screenMode !== 'quiz' && S.screenMode !== 'blitz') || S.isAnswered) return;
  if (S.currentQType !== 'name-to-loc') return;

  const ov = $('map-overlay');
  if (ov && ov.style.pointerEvents === 'none') return;

  const pt = imgPoint(e.clientX, e.clientY);

  // Active items on current map
  const activeItemsOnMap = ALL_ITEMS.filter(i =>
    i.kategori === S.currentItem.kategori && i.x !== null && i.y !== null
  );

  // Sort items by distance to click
  const candidates = activeItemsOnMap.map(it => ({
    item: it,
    dist: Math.hypot(pt.x - it.x, pt.y - it.y)
  })).sort((a, b) => a.dist - b.dist);

  const c1 = candidates[0];
  const c2 = candidates[1];

  // If user is not zoomed in and clicks near close neighboring points (< 3.2% apart):
  // AUTO-ZOOM in so user can distinguish and select them visually!
  if (S.mapScale <= 1.35 && c1 && c2) {
    const interDist = Math.hypot(c1.item.x - c2.item.x, c1.item.y - c2.item.y);
    if (interDist <= 3.2 && c1.dist <= 6.0) {
      const midX = (c1.item.x + c2.item.x) / 2;
      const midY = (c1.item.y + c2.item.y) / 2;
      zoomToLocation(midX, midY, 2.6);
      Sound.playTone(600, 0.05, 'sine', 0.08);

      $('bottom-panel').innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#1e293b;border-radius:10px;font-size:12px;color:#e2e8f0;gap:8px;">
          <span>🔍 <b>Noktalar Çok Yakın:</b> Net seçim yapabilmeniz için harita büyütüldü. Lütfen hedefinize dokunun!</span>
          <button id="btn-cancel-zoom" class="btn btn-secondary btn-sm" style="flex-shrink:0;">Uzaklaş</button>
        </div>
      `;
      $('btn-cancel-zoom')?.addEventListener('click', () => {
        resetMapTransform();
        $('bottom-panel').innerHTML = `
          <div style="padding:8px 14px;font-size:11px;color:#7f8c8d;text-align:center">
            Tolerans ±${TOLERANCE}% &nbsp;·&nbsp; Pinch ile zoom &nbsp;·&nbsp; Çift tık = sıfırla
          </div>`;
      });
      return;
    }
  }

  // Snap to nearest candidate
  if (c1 && c1.dist <= 6.0) {
    if (S.screenMode === 'blitz') {
      const ok = c1.item.id === S.currentItem.id;
      handleBlitzAnswer(c1.item, ok);
    } else {
      evaluateNameToLocAnswer(c1.item, pt.x, pt.y);
    }
  } else {
    // Click was too far from any valid point
    if (S.screenMode === 'blitz') {
      handleBlitzAnswer(null, false);
    } else {
      evaluateNameToLocAnswer(null, pt.x, pt.y);
    }
  }
}

function evaluateNameToLocAnswer(chosenItem, clickX, clickY) {
  if (S.isAnswered) return;
  stopQuestionTimer();
  hideDisambiguationBubble();
  S.isAnswered = true;

  const ok = chosenItem ? (chosenItem.id === S.currentItem.id) : false;

  if (ok) { Sound.playCorrect(); } else { Sound.playWrong(); }
  triggerHaptic(ok);

  recordAnswer(S.currentItem, ok);
  showNameToLocFeedback(ok, S.currentItem, clickX, clickY, chosenItem);
}

function handleChoice(chosen) {
  if (S.isAnswered) return;
  stopQuestionTimer();
  hideDisambiguationBubble();
  S.isAnswered = true;
  const ok = chosen.id === S.currentItem.id;

  if (S.screenMode === 'blitz') {
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.id === S.currentItem.id) btn.classList.add('correct');
      else if (btn.dataset.id === chosen.id && !ok) btn.classList.add('wrong');
    });
    handleBlitzAnswer(chosen, ok);
    return;
  }

  if (ok) { Sound.playCorrect(); } else { Sound.playWrong(); }
  triggerHaptic(ok);

  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.id === S.currentItem.id) btn.classList.add('correct');
    else if (btn.dataset.id === chosen.id && !ok) btn.classList.add('wrong');
  });

  clearPins();
  addPin(S.currentItem.x, S.currentItem.y, null, '#27ae60', 20);
  recordAnswer(S.currentItem, ok);
  appendFeedback(ok, S.currentItem);
}

function recordAnswer(item, ok) {
  if (ok) {
    S.sessionStats.correct++;
    S.streak++;
    if (S.streak > S.sessionStats.bestStreak) S.sessionStats.bestStreak = S.streak;

    if (S.isMistakesMode && S.progress[item.id] && S.progress[item.id].wrong > 0) {
      S.progress[item.id].wrong = Math.max(0, S.progress[item.id].wrong - 1);
    }

    if (S.streak === 3) {
      unlockBadge('streak_3');
      showStreakToast("🔥 3'te 3!", 'Harika bir seri yakaladın!');
      Sound.playStreak();
    } else if (S.streak === 5) {
      unlockBadge('streak_5');
      showStreakToast("⚡ 5'te 5 - Alev Aldın!", 'Hafızan süper çalışıyor!');
      Sound.playStreak();
    } else if (S.streak === 10) {
      unlockBadge('streak_10');
      showStreakToast("👑 10'da 10 - Durdurulamaz!", 'Efsane bir seri!');
      Sound.playStreak();
    }
  } else {
    S.sessionStats.wrong++;
    S.streak = 0;
    S.sessionStats.wrongItems[item.id] = (S.sessionStats.wrongItems[item.id] || 0) + 1;
    S.queue.splice(Math.min(REPEAT_GAP, S.queue.length), 0, item);
  }

  if (!S.progress[item.id]) S.progress[item.id] = { attempts:0, wrong:0 };
  S.progress[item.id].attempts++;
  if (!ok) S.progress[item.id].wrong++;
  saveProgress();
  renderQuizHeader();
}

function showNameToLocFeedback(ok, item, cx, cy, chosenItem = null) {
  enableMapClick(false);
  clearPins();
  if (!ok) {
    if (chosenItem) {
      addPin(chosenItem.x, chosenItem.y, '✗', '#e74c3c', 20, false);
    } else {
      addPin(cx, cy, '✗', '#e74c3c', 18, false);
    }
  }
  addPin(item.x, item.y, '✓', '#27ae60', 22, true);
  appendFeedback(ok, item, false, chosenItem);
}

function appendFeedback(ok, item, isTimeout = false, chosenItem = null) {
  const color   = CAT_COLOR[item.kategori] || '#3498db';
  const catObj  = ALL_KATEGORILER.find(k => k.id === item.kategori);
  const mText   = catObj?.kodlama || '';
  const noteBox = item.not ? `<div class="fb-item-note">📌 <b>Önemli Bilgi:</b> ${esc(item.not)}</div>` : '';
  const mBox    = mText ? `<div class="fb-mnemonic-box">💡 <b>Grup Şifresi:</b> ${esc(mText)}</div>` : '';

  let wrongExplain = '';
  if (!ok && !isTimeout) {
    if (chosenItem && chosenItem.id !== item.id) {
      wrongExplain = `<div style="font-size:12.5px;color:#fca5a5;margin-top:2px;">📍 Siz <b>${esc(chosenItem.isim)}</b> noktasını seçtiniz. Doğru konum yeşil işaretlendi.</div>`;
    } else {
      wrongExplain = `<div style="font-size:12.5px;color:#fca5a5;margin-top:2px;">📍 Tıkladığınız yer hedeften uzaktı. Doğru konum yeşil işaretlendi.</div>`;
    }
  }

  const div = el('div', 'feedback-panel');
  div.innerHTML = `
    <div class="fb-icon">${ok ? '✅' : '❌'}</div>
    <div class="fb-body">
      <div class="fb-result ${ok?'correct':'wrong'}">${isTimeout ? 'Süre Doldu!' : (ok ? 'Doğru!' : 'Yanlış')}</div>
      <div class="fb-name" style="color:${color}">${esc(item.isim)} · ${esc(item.kategori)}</div>
      ${wrongExplain}
      ${noteBox}
      ${mBox}
    </div>
    <button class="fb-continue">Devam →</button>`;

  $('bottom-panel').appendChild(div);
  div.querySelector('.fb-continue').addEventListener('click', () => {
    resetMapTransform();
    enableMapClick(false); clearPins();
    $('top-panel').innerHTML = '';
    $('bottom-panel').innerHTML = '';
    nextQuestion();
  });
}

function showStreakToast(title, sub) {
  const toast = $('streak-toast');
  if (!toast) return;
  $('streak-toast-title').textContent = title;
  $('streak-toast-sub').textContent   = sub;
  toast.classList.remove('hidden');
  setTimeout(() => { toast.classList.add('hidden'); }, 2300);
}

// ─────────────────────────────────────────────────────────────────────────
//  RESULTS
// ─────────────────────────────────────────────────────────────────────────
function endSession() {
  stopQuestionTimer();
  const { correct, wrong, wrongItems, bestStreak } = S.sessionStats;
  const total = correct + wrong;
  if (total === 0) { showScreen('screen-menu'); buildMenu(); return; }

  const pct = Math.round((correct / total) * 100);
  $('res-correct').textContent = correct;
  $('res-wrong').textContent   = wrong;
  $('res-pct').textContent     = pct + '%';

  const streakBanner = $('res-streak-banner');
  if (streakBanner) {
    streakBanner.innerHTML = `🔥 Bu Turdaki En Uzun Seriniz: <b>${bestStreak} Doğru</b>`;
  }

  unlockBadge('first_quiz');
  if (S.timedMode && total >= 5) unlockBadge('hizli_tur');
  if (pct >= 80 && S.mode === 'mountains') unlockBadge('toroslar');
  if (pct >= 80 && S.mode === 'lakes')     unlockBadge('goller');
  if (pct >= 80 && S.mode === 'ovalar')    unlockBadge('ovalar');
  if (pct >= 80 && S.mode === 'platolar')  unlockBadge('platolar');
  if (pct >= 80 && S.mode === 'akarsular') unlockBadge('akarsu_ustasi');
  if (pct >= 80 && S.mode === 'gecitler')  unlockBadge('gecit_rehberi');
  if (S.isDaily && pct >= 60) {
    const todayStr = new Date().toISOString().slice(0, 10);
    try { localStorage.setItem(`trk-daily-${todayStr}`, 'true'); } catch(_) {}
    unlockBadge('gunun_fatihi');
  }
  if (pct === 100 && total >= 8)           unlockBadge('kusursuz');

  const worst = Object.entries(wrongItems)
    .sort((a,b) => b[1]-a[1]).slice(0,5)
    .map(([id,cnt]) => ({ item: ALL_ITEMS.find(i => i.id===id), cnt }))
    .filter(x => x.item);

  const wDiv = $('res-worst');
  if (worst.length) {
    wDiv.innerHTML = '<h4>En çok yanıldıklarınız</h4>';
    worst.forEach(({ item, cnt }) => {
      const r = el('div','worst-item');
      r.innerHTML = `<span class="wi-name">${esc(item.isim)}</span><span class="wi-count">${cnt} ✗</span>`;
      wDiv.appendChild(r);
    });
  } else {
    wDiv.innerHTML = '<div style="color:#27ae60;text-align:center;padding:12px">🎉 Harika! Tüm sorular doğru!</div>';
  }
  $('res-title').textContent = S.isDaily ? '📅 Günün Sınavı Tamamlandı!' : '🏁 Tur Sona Erdi';
  $('res-blitz-banner')?.classList.add('hidden');
  showScreen('screen-results');
}

function bindResultsEvents() {
  $('res-again-btn')?.addEventListener('click', () => {
    if (S.isBlitz) startBlitzMode();
    else startQuiz(S.isMistakesMode);
  });
  $('res-menu-btn')?.addEventListener('click', () => { showScreen('screen-menu'); buildMenu(); });
  $('res-badges-btn')?.addEventListener('click', openBadgesModal);
  $('res-share-btn')?.addEventListener('click', openShareModal);
}

// ─────────────────────────────────────────────────────────────────────────
//  60 SANİYE HARİTA FIRTINASI (BLITZ MODE)
// ─────────────────────────────────────────────────────────────────────────
function startBlitzMode() {
  let pool = getActiveItems();
  const calibrated = pool.filter(i => i.x !== null && i.y !== null && CAT_TO_IMAGE[i.kategori]);
  if (calibrated.length === 0) {
    alert('Bu kategoride henüz kalibre edilmiş soru bulunmuyor!');
    return;
  }

  S.isBlitz = true;
  S.isMistakesMode = false;
  S.activeItems = calibrated;
  S.queue = shuffle(calibrated);
  S.screenMode = 'blitz';
  S.sessionStats = { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 };
  S.streak = 0;
  S.blitzScore = 0;
  S.blitzTimeLeft = 60;
  S.isAnswered = false;
  S.calTarget = null;
  hideDisambiguationBubble();

  showScreen('screen-main');
  resetMapTransform();

  startBlitzTimer();
  nextBlitzQuestion();
}

function startBlitzTimer() {
  stopBlitzTimer();
  stopQuestionTimer();

  const bar = $('quiz-timer-bar');
  if (bar) bar.classList.add('hidden');

  S.blitzTimerId = setInterval(() => {
    S.blitzTimeLeft -= 0.1;

    // Update blitz timer in header
    const timerEl = $('blitz-tbar-timer');
    if (timerEl) {
      const sec = Math.max(0, Math.ceil(S.blitzTimeLeft));
      timerEl.innerHTML = `⚡ <b>${sec}</b> sn`;
      if (sec <= 10) {
        timerEl.style.background = '#991b1b';
      } else {
        timerEl.style.background = '#dc2626';
      }
    }

    if (S.blitzTimeLeft <= 0) {
      stopBlitzTimer();
      endBlitzSession();
    }
  }, 100);
}

function stopBlitzTimer() {
  if (S.blitzTimerId) {
    clearInterval(S.blitzTimerId);
    S.blitzTimerId = null;
  }
}

function renderBlitzHeader() {
  const sec = Math.max(0, Math.ceil(S.blitzTimeLeft));

  $('top-bar').innerHTML = `
    <button class="btn-icon" id="blitz-back">←</button>
    <div class="tbar-blitz-timer" id="blitz-tbar-timer">
      ⚡ <b>${sec}</b> sn
    </div>
    <div class="tbar-blitz-score">
      🎯 <span id="blitz-tbar-pts">${S.blitzScore}</span>
    </div>
    <div class="tbar-streak" id="blitz-tbar-streak">
      🔥 ${S.streak}
    </div>
    <button class="btn-icon" id="btn-sound-toggle" title="Sesi Aç/Kapat">${Sound.enabled ? '🔊' : '🔇'}</button>
  `;

  $('blitz-back')?.addEventListener('click', () => {
    if (confirm('Fırtına modundan çıkmak istiyor musunuz?')) {
      stopBlitzTimer();
      clearPins(); enableMapClick(false); showScreen('screen-menu'); buildMenu();
    }
  });
  $('btn-sound-toggle')?.addEventListener('click', () => Sound.toggle());
}

function nextBlitzQuestion() {
  if (S.blitzTimeLeft <= 0) {
    endBlitzSession();
    return;
  }

  // Refill queue if needed
  if (S.queue.length === 0) {
    S.queue = shuffle(S.activeItems);
  }
  const item = S.queue.shift();
  S.currentItem = item;
  S.currentQType = S.qtype === 'mixed'
    ? (Math.random() < 0.5 ? 'name-to-loc' : 'loc-to-name') : S.qtype;
  S.isAnswered = false;
  S.lastAnswerTime = Date.now();

  switchMapImage(item.kategori);
  clearPins();
  enableMapClick(false);
  $('top-panel').innerHTML = '';
  $('bottom-panel').innerHTML = '';

  renderBlitzHeader();
  renderQuestion();
}

function handleBlitzAnswer(chosenItem, ok) {
  if (S.isAnswered || S.blitzTimeLeft <= 0) return;
  S.isAnswered = true;
  enableMapClick(false);

  const elapsedSec = (Date.now() - S.lastAnswerTime) / 1000;

  if (ok) {
    S.sessionStats.correct++;
    S.streak++;
    if (S.streak > S.sessionStats.bestStreak) S.sessionStats.bestStreak = S.streak;

    // Score calculation: Base 100 + streak bonus + speed bonus
    let pts = 100 + (S.streak * 25);
    if (elapsedSec < 2.5) pts += 50;

    S.blitzScore += pts;
    Sound.playCorrect();
    triggerHaptic(true);

    showStreakToast(`+${pts} PUAN! 🔥`, S.streak >= 3 ? `${S.streak} Seri Çarpanı!` : 'Hızlı cevap!');
    if (S.streak === 5 || S.streak === 10) Sound.playStreak();

    // Show green pin
    clearPins();
    addPin(S.currentItem.x, S.currentItem.y, '✓', '#22c55e', 22, true);

    // Update header points immediately
    const ptsEl = $('blitz-tbar-pts');
    if (ptsEl) ptsEl.textContent = S.blitzScore;
    const streakEl = $('blitz-tbar-streak');
    if (streakEl) streakEl.textContent = `🔥 ${S.streak}`;

    // Fast advance
    setTimeout(() => {
      if (S.blitzTimeLeft > 0) nextBlitzQuestion();
    }, 380);
  } else {
    S.sessionStats.wrong++;
    S.streak = 0;
    // Penalty: -2 seconds
    S.blitzTimeLeft = Math.max(0, S.blitzTimeLeft - 2);

    Sound.playWrong();
    triggerHaptic(false);
    showStreakToast('❌ -2 SANİYE!', 'Dikkat! Yanlış cevap süre kaybı');

    clearPins();
    if (chosenItem) {
      addPin(chosenItem.x, chosenItem.y, '✗', '#ef4444', 20, false);
    }
    addPin(S.currentItem.x, S.currentItem.y, '✓', '#22c55e', 22, true);

    const streakEl = $('blitz-tbar-streak');
    if (streakEl) streakEl.textContent = `🔥 0`;

    setTimeout(() => {
      if (S.blitzTimeLeft > 0) nextBlitzQuestion();
    }, 600);
  }
}

function endBlitzSession() {
  stopBlitzTimer();
  S.screenMode = 'results';
  clearPins();
  enableMapClick(false);

  // Check achievements
  unlockBadge('blitz_first');
  if (S.blitzScore >= 1000) unlockBadge('blitz_1000');
  if (S.blitzScore >= 2000) unlockBadge('blitz_2000');

  // Check High Score
  const prevHigh = parseInt(localStorage.getItem(LS_BLITZ_HIGH) || '0', 10);
  const isNewRecord = S.blitzScore > prevHigh;
  if (isNewRecord) {
    S.blitzHighScore = S.blitzScore;
    localStorage.setItem(LS_BLITZ_HIGH, String(S.blitzScore));
    Sound.playBadge();
  }

  // Populate Results Screen for Blitz
  $('res-title').textContent = '⚡ Harita Fırtınası Tamamlandı!';
  const bBanner = $('res-blitz-banner');
  if (bBanner) {
    bBanner.classList.remove('hidden');
    $('res-blitz-score').textContent = S.blitzScore.toLocaleString('tr-TR');
    const recTag = $('res-blitz-record-tag');
    if (recTag) recTag.classList.toggle('hidden', !isNewRecord);
  }

  const { correct, wrong } = S.sessionStats;
  const total = correct + wrong;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  $('res-correct').textContent = correct;
  $('res-wrong').textContent = wrong;
  $('res-pct').textContent = pct + '%';

  const sBanner = $('res-streak-banner');
  if (sBanner) {
    sBanner.innerHTML = `👑 Fırtına Rekorunuz: <b>${S.blitzHighScore} Puan</b> &nbsp;·&nbsp; En Uzun Seri: <b>${S.sessionStats.bestStreak}</b>`;
  }

  $('res-worst').innerHTML = '';
  showScreen('screen-results');
  buildMenu(); // Refresh high score badge on menu
}

// ─────────────────────────────────────────────────────────────────────────
//  SKOR KARTI & SOSYAL MEDYA PAYLAŞIMI (CANVAS GENERATOR)
// ─────────────────────────────────────────────────────────────────────────
function openShareModal() {
  const modal = $('modal-share');
  if (!modal) return;
  generateShareCard();
  modal.classList.remove('hidden');
}

function bindShareModalEvents() {
  $('modal-share-close')?.addEventListener('click', () => {
    $('modal-share')?.classList.add('hidden');
  });
  $('btn-native-share')?.addEventListener('click', shareScoreCard);
  $('btn-download-card')?.addEventListener('click', downloadScoreCard);
  $('btn-copy-link')?.addEventListener('click', copyAppLink);
}

function copyAppLink() {
  const url = 'https://erenuss907.github.io/kpss-harita/';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      alert('🔗 Uygulama bağlantısı panoya kopyalandı:\n' + url);
    });
  } else {
    prompt('Uygulama linkini kopyalayın:', url);
  }
}

function generateShareCard() {
  const canvas = $('share-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#0a1128');
  bgGrad.addColorStop(0.4, '#101f42');
  bgGrad.addColorStop(1, '#050a18');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // 2. Decorative circles / glow
  const glow1 = ctx.createRadialGradient(200, 200, 20, 200, 200, 450);
  glow1.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
  glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(880, 850, 20, 880, 850, 450);
  glow2.addColorStop(0, 'rgba(245, 158, 11, 0.14)');
  glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 3. Card Border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#38bdf8';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(40, 40, W - 80, H - 80, 36);
    ctx.stroke();
  } else {
    ctx.strokeRect(40, 40, W - 80, H - 80);
  }

  // Inner gold border accent
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(55, 55, W - 110, H - 110, 28);
    ctx.stroke();
  }

  // 4. Header Badge
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('★ KPSS COĞRAFYA HARİTA USTASI ★', W / 2, 125);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BAŞARI SERTİFİKASI', W / 2, 185);

  // Category Tag Box
  const catTitle = S.isDaily
    ? '📅 GÜNÜN KPSS SINAVI'
    : (S.isBlitz
        ? '⚡ 60 SANİYE HARİTA FIRTINASI'
        : (S.category ? S.category.toUpperCase() : (
            S.mode === 'mountains' ? 'TÜRKİYE DAĞLARI' :
            S.mode === 'lakes' ? 'TÜRKİYE GÖLLERİ' :
            S.mode === 'ovalar' ? 'TÜRKİYE OVALARI' :
            S.mode === 'platolar' ? 'TÜRKİYE PLATOLARI' :
            S.mode === 'akarsular' ? 'TÜRKİYE AKARSULARI' :
            S.mode === 'gecitler' ? 'TÜRKİYE DAĞ GEÇİTLERİ' :
            'TÜRKİYE COĞRAFYASI'
          )));

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(W / 2 - 260, 220, 520, 52, 26);
    ctx.fill();
  }
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(catTitle, W / 2, 255);

  // 5. Main Hero Value (Score or Percentage)
  if (S.isBlitz) {
    // Blitz Score
    const scoreGrad = ctx.createLinearGradient(0, 360, 0, 480);
    scoreGrad.addColorStop(0, '#fef08a');
    scoreGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = scoreGrad;
    ctx.font = '900 130px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(S.blitzScore.toLocaleString('tr-TR'), W / 2, 450);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TOPLAM PUAN', W / 2, 505);
  } else {
    // Percentage
    const total = S.sessionStats.correct + S.sessionStats.wrong;
    const pct = total > 0 ? Math.round((S.sessionStats.correct / total) * 100) : 0;
    
    const pctGrad = ctx.createLinearGradient(0, 360, 0, 480);
    pctGrad.addColorStop(0, '#86efac');
    pctGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = pctGrad;
    ctx.font = '900 135px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`%${pct}`, W / 2, 450);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(pct >= 85 ? '🌟 HARİKA BAŞARI' : pct >= 60 ? '👍 İYİ İLERLEME' : '🎯 ÇALIŞMAYA DEVAM', W / 2, 505);
  }

  // 6. Stat Cards (3 Pills)
  const stats = [
    { label: 'Doğru', val: `✓ ${S.sessionStats.correct}`, color: '#22c55e' },
    { label: 'Yanlış', val: `✗ ${S.sessionStats.wrong}`, color: '#ef4444' },
    { label: 'En Uzun Seri', val: `🔥 ${S.sessionStats.bestStreak || S.streak}`, color: '#f59e0b' }
  ];

  const cardW = 260;
  const cardH = 120;
  const gap = 36;
  const startX = (W - (cardW * 3 + gap * 2)) / 2;
  const cardY = 565;

  stats.forEach((st, i) => {
    const x = startX + i * (cardW + gap);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x, cardY, cardW, cardH);
    }

    ctx.fillStyle = st.color;
    ctx.font = '900 40px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(st.val, x + cardW / 2, cardY + 54);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(st.label, x + cardW / 2, cardY + 95);
  });

  // 7. Motivational Quote Box
  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(140, 725, W - 280, 95, 20);
    ctx.fill();
  }
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'italic 500 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('« Haritada yerini gördüğün şeyi hafızan asla unutmaz! »', W / 2, 768);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('KPSS 2026 Coğrafya Cepte 🎯', W / 2, 802);

  // 8. Footer Brand & QR / Link
  ctx.fillStyle = '#64748b';
  ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Sen de Türkiye Haritasını Keşfet & Kendini Sına:', W / 2, 885);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('erenuss907.github.io/kpss-harita', W / 2, 930);

  const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillStyle = '#475569';
  ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${dateStr} • Türkiye Dağları & Gölleri Ezber Platformu`, W / 2, 985);

  // Show in image element preview
  const previewImg = $('share-img-preview');
  if (previewImg) {
    previewImg.src = canvas.toDataURL('image/png');
  }
}

function shareScoreCard() {
  const canvas = $('share-canvas');
  if (!canvas) return;

  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], 'kpss-harita-skor.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        title: 'KPSS Harita Başarı Kartım',
        text: 'KPSS Türkiye Dağları ve Gölleri harita testim bitti! Sen de dene:',
        url: 'https://erenuss907.github.io/kpss-harita/',
        files: [file]
      }).catch(err => {
        if (err.name !== 'AbortError') downloadScoreCard();
      });
    } else {
      downloadScoreCard();
      alert('Görsel telefonunuza/bilgisayarınıza indirildi! WhatsApp veya Instagram hikayenizde kolayca paylaşabilirsiniz.');
    }
  }, 'image/png');
}

function downloadScoreCard() {
  const canvas = $('share-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `kpss-harita-skor-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function startDailyChallenge() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const alreadyDone = localStorage.getItem(`trk-daily-${todayStr}`);
  if (alreadyDone && !confirm('Bugünkü Günün KPSS Sınavı görevini zaten tamamladınız! Tekrar çözmek ister misiniz?')) {
    return;
  }

  // Deterministic seed based on today's date
  let seed = 0;
  for (let i = 0; i < todayStr.length; i++) {
    seed = (seed * 31 + todayStr.charCodeAt(i)) >>> 0;
  }
  const pseudoRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed >>> 0) / 4294967296;
  };

  const calibrated = ALL_ITEMS.filter(i => i.x !== null && i.y !== null && CAT_TO_IMAGE[i.kategori]);
  const dags = calibrated.filter(i => i.tip === 'dag');
  const gols = calibrated.filter(i => i.tip === 'gol');
  const ovas = calibrated.filter(i => i.tip === 'ova');
  const plats = calibrated.filter(i => i.tip === 'plato');
  const akarsus = calibrated.filter(i => i.tip === 'akarsu');
  const gecits = calibrated.filter(i => i.tip === 'gecit');

  const pickOne = (arr) => arr[Math.floor(pseudoRand() * arr.length)];
  const dailySet = [
    pickOne(dags),
    pickOne(gols),
    pickOne(ovas),
    pickOne(plats),
    pseudoRand() > 0.5 ? pickOne(akarsus) : pickOne(gecits)
  ].filter(Boolean);

  S.isDaily = true;
  S.isMistakesMode = false;
  S.isBlitz = false;
  S.mode = 'mixed';
  S.category = null;
  S.qtype = 'mixed';
  S.queue = [...dailySet];
  S.activeItems = dailySet;
  S.screenMode = 'quiz';
  S.sessionStats = { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 };
  S.streak = 0;
  S.isAnswered = false;
  S.calTarget = null;
  hideDisambiguationBubble();
  $('res-blitz-banner')?.classList.add('hidden');

  showScreen('screen-main');
  resetMapTransform();
  nextQuestion();
}

function exportStudyAtlasPDF() {
  const printWin = window.open('', '_blank');
  if (!printWin) {
    alert('Açılır pencere engellendi! Lütfen tarayıcınızın ayarlarından pop-up izni verin.');
    return;
  }

  const sections = [
    {
      title: '⛰️ TÜRKİYE DAĞLARI',
      tip: 'dag',
      cats: ['Kıvrımlı Dağlar', 'Kırıklı Dağlar (Horst-Graben)', 'Volkanik Dağlar']
    },
    {
      title: '💧 TÜRKİYE GÖLLERİ',
      tip: 'gol',
      cats: ['Tektonik Göller', 'Karstik Göller', 'Volkanik Göller', 'Buzul (Sirk) Gölleri', 'Heyelan Set Gölleri', 'Volkanik Set Gölleri', 'Alüvyon Set Gölleri', 'Kıyı Set (Lagün) Gölleri']
    },
    {
      title: '🌾 TÜRKİYE OVALARI',
      tip: 'ova',
      cats: ['Delta Ovaları', 'Karstik Ovalar (Polye)']
    },
    {
      title: '🏞️ TÜRKİYE PLATOLARI',
      tip: 'plato',
      cats: ['Karstik Platolar', 'Volkanik (Lav) Platoları', 'Aşınım (Aşınım Düzlüğü) Platoları', 'Tabaka Düzlüğü (Yatay Duruşlu) Platolar']
    },
    {
      title: '🌊 TÜRKİYE AKARSULARI & HAVZALARI',
      tip: 'akarsu',
      cats: ['Karadeniz Akarsuları', 'Akdeniz Akarsuları', 'Ege ve Marmara Akarsuları', 'Basra ve Hazar Akarsuları']
    },
    {
      title: '🚪 TÜRKİYE STRATEJİK DAĞ GEÇİTLERİ',
      tip: 'gecit',
      cats: ['Karadeniz Geçitleri', 'Akdeniz Geçitleri']
    }
  ];

  let bodyHtml = `
    <div class="no-print header-bar">
      <button onclick="window.print()" class="btn-print">🖨️ Yazdır / PDF Olarak Kaydet</button>
      <button onclick="window.close()" class="btn-close">✕ Kapat</button>
    </div>
    <div class="atlas-cover">
      <h1>🇹🇷 KPSS COĞRAFYA HARİTA & HAFIZA ATLASI</h1>
      <p class="subtitle">Tüm Yer Şekilleri, Sınav İpuçları ve Şifreli Hafıza Kodlamaları Özet Çalışma Fasikülü</p>
      <div class="meta-tag">Lisans • Önlisans • Ortaöğretim KPSS Hazırlık Rehberi | Toplam 230 Sınav Noktası</div>
    </div>

    <div class="mnemonics-section">
      <h2>💡 KPSS ALTIN HAFIZA ŞİFRELERİ (KODLAMALAR)</h2>
      <div class="mnemonics-grid">
  `;

  ALL_KATEGORILER.forEach(cat => {
    if (cat.kodlama) {
      bodyHtml += `
        <div class="mnemonic-card">
          <div class="m-title" style="border-left: 4px solid ${cat.renk || '#3498db'}">${cat.id}</div>
          <div class="m-code">${esc(cat.kodlama).replace(/\\n/g, '<br>')}</div>
        </div>
      `;
    }
  });

  bodyHtml += `
      </div>
    </div>
  `;

  sections.forEach(sec => {
    bodyHtml += `
      <div class="sec-divider">
        <h2>${sec.title}</h2>
      </div>
    `;

    sec.cats.forEach(catName => {
      const items = ALL_ITEMS.filter(i => i.kategori === catName);
      if (!items.length) return;
      const catObj = ALL_KATEGORILER.find(k => k.id === catName);

      bodyHtml += `
        <div class="cat-block">
          <div class="cat-header" style="background: ${catObj?.renk ? catObj.renk + '20' : '#f0f4f8'}; border-left: 5px solid ${catObj?.renk || '#2c3e50'}">
            <h3>${catName} <span class="count-badge">(${items.length} Adet)</span></h3>
            ${catObj?.kodlama ? `<div class="cat-code-hint">🔑 Kodlama: <b>${esc(catObj.kodlama)}</b></div>` : ''}
          </div>
          <table class="atlas-table">
            <thead>
              <tr>
                <th style="width:25%">Yer Şekli / İsim</th>
                <th style="width:20%">Kategori</th>
                <th style="width:55%">KPSS'de Çıkabilecek Önemli Notlar & Özellikler</th>
              </tr>
            </thead>
            <tbody>
      `;

      items.forEach(item => {
        bodyHtml += `
          <tr>
            <td class="item-name"><b>${esc(item.isim)}</b></td>
            <td class="item-cat">${esc(item.kategori)}</td>
            <td class="item-notes">${esc(item.not || '-')}</td>
          </tr>
        `;
      });

      bodyHtml += `
            </tbody>
          </table>
        </div>
      `;
    });
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>KPSS Coğrafya Harita ve Hafıza Atlası</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2c3e50;
      background: #fff;
      line-height: 1.5;
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header-bar {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    .btn-print {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .btn-close {
      background: #64748b;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
    }
    .atlas-cover {
      text-align: center;
      padding: 24px 16px;
      background: #f8fafc;
      border-radius: 12px;
      border: 2px solid #cbd5e1;
      margin-bottom: 24px;
    }
    .atlas-cover h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #0f172a;
    }
    .subtitle {
      margin: 0 0 12px 0;
      font-size: 15px;
      color: #475569;
    }
    .meta-tag {
      display: inline-block;
      background: #e2e8f0;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
    }
    .mnemonics-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .mnemonics-section h2 {
      font-size: 18px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 6px;
      color: #1e3a8a;
    }
    .mnemonics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }
    .mnemonic-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      break-inside: avoid;
    }
    .m-title {
      font-weight: 700;
      font-size: 13px;
      padding-left: 6px;
      margin-bottom: 4px;
      color: #1e293b;
    }
    .m-code {
      font-size: 12px;
      color: #334155;
      font-family: 'SFMono-Regular', Consolas, monospace;
      line-height: 1.4;
    }
    .sec-divider h2 {
      font-size: 19px;
      background: #0f172a;
      color: #fff;
      padding: 8px 14px;
      border-radius: 6px;
      margin: 28px 0 14px 0;
      page-break-after: avoid;
    }
    .cat-block {
      margin-bottom: 22px;
      page-break-inside: avoid;
    }
    .cat-header {
      padding: 8px 12px;
      border-radius: 6px 6px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cat-header h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
    }
    .count-badge {
      font-size: 12px;
      color: #64748b;
      font-weight: normal;
    }
    .cat-code-hint {
      font-size: 12px;
      color: #0f172a;
    }
    .atlas-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      border: 1px solid #cbd5e1;
    }
    .atlas-table th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      font-weight: 700;
    }
    .atlas-table td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .atlas-table tr:nth-child(even) {
      background: #f8fafc;
    }
    .item-name {
      color: #0f172a;
    }
    .item-cat {
      color: #475569;
    }
    .item-notes {
      color: #1e293b;
    }
    @media print {
      body { padding: 0; max-width: 100%; font-size: 11px; }
      .no-print { display: none !important; }
      .sec-divider h2 { background: #333 !important; color: #fff !important; }
      .atlas-table { font-size: 10px; }
      .atlas-table td, .atlas-table th { padding: 4px 6px; }
      .cat-block { page-break-inside: avoid; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(fullHtml);
  printWin.document.close();
}

// ─────────────────────────────────────────────────────────────────────────
//  HARİTAYI İNCELE (EXPLORE / SERBEST KEŞİF MODU)
// ─────────────────────────────────────────────────────────────────────────
function enterExploreMode(catId = null) {
  S.screenMode = 'explore';
  hideDisambiguationBubble();
  enableMapClick(false);
  showScreen('screen-main');
  resetMapTransform();

  if (!catId) {
    if (S.category) catId = S.category;
    else if (S.mode === 'mountains') catId = 'Kıvrımlı Dağlar';
    else if (S.mode === 'ovalar') catId = 'Delta Ovaları';
    else if (S.mode === 'platolar') catId = 'Karstik Platolar';
    else if (S.mode === 'akarsular') catId = 'Karadeniz Akarsuları';
    else if (S.mode === 'gecitler') catId = 'Karadeniz Geçitleri';
    else catId = 'Tektonik Göller';
  }
  S.exploreCat = catId;
  S.exploreSelectedId = null;

  renderExploreHeader();
  renderExploreMap(catId);
}

function renderExploreHeader() {
  const availableCats = ALL_KATEGORILER.filter(k => CAT_TO_IMAGE[k.id]);
  const optionsHtml = availableCats.map(k =>
    `<option value="${esc(k.id)}" ${k.id===S.exploreCat?'selected':''}>${esc(k.id)}</option>`
  ).join('');

  $('top-bar').innerHTML = `
    <button class="btn-icon" id="explore-back">←</button>
    <div style="flex:1;text-align:center">
      <select id="explore-cat-select" style="background:#1e2d3d;color:#fff;border:1px solid #34495e;padding:4px 8px;border-radius:10px;font-weight:700;font-size:13px;max-width:200px">
        ${optionsHtml}
      </select>
    </div>
    <button class="btn-icon" id="explore-sound-btn" title="Ses Aç/Kapat">${Sound.enabled ? '🔊' : '🔇'}</button>
    <button class="btn-icon" id="explore-hint-btn" title="Hafıza Şifresi">💡</button>`;

  $('explore-back')?.addEventListener('click', () => {
    hideDisambiguationBubble();
    clearPins(); showScreen('screen-menu'); buildMenu();
  });
  $('explore-sound-btn')?.addEventListener('click', () => Sound.toggle());
  $('explore-hint-btn')?.addEventListener('click', () => openMnemonicsModal(S.exploreCat));

  $('explore-cat-select')?.addEventListener('change', e => {
    enterExploreMode(e.target.value);
  });
}

function renderExploreMap(catId) {
  switchMapImage(catId);
  clearPins();
  $('top-panel').innerHTML = `
    <div style="padding:8px 14px;background:#111e2d;border-bottom:1px solid #1e2d3d;text-align:center;font-size:12px;color:#cbd5e1">
      🗺️ İncelemek istediğiniz dağ veya göl noktasına dokunun
    </div>`;

  const items = ALL_ITEMS.filter(i => i.kategori === catId && i.x !== null && i.y !== null);
  const color = CAT_COLOR[catId] || '#3498db';

  items.forEach(item => {
    const isSelected = item.id === S.exploreSelectedId;
    const pin = addPin(item.x, item.y, item.num || null, color, isSelected ? 22 : 14, false,
      `pin-explore ${isSelected ? 'selected' : ''}`,
      () => selectExploreItem(item)
    );

    const lbl = el('div', 'pin-text-label', esc(item.isim));
    pin.appendChild(lbl);
  });

  if (items.length > 0 && !S.exploreSelectedId) {
    selectExploreItem(items[0], false);
  }
}

function handleExploreMapClick(e) {
  if (!S.exploreCat) return;
  const pt = imgPoint(e.clientX, e.clientY);
  const items = ALL_ITEMS.filter(i => i.kategori === S.exploreCat && i.x !== null && i.y !== null);
  const candidates = items.map(it => ({
    item: it,
    dist: Math.hypot(pt.x - it.x, pt.y - it.y)
  })).sort((a, b) => a.dist - b.dist);

  const c1 = candidates[0];
  const c2 = candidates[1];

  // If unzoomed and near close points, auto-zoom
  if (S.mapScale <= 1.35 && c1 && c2) {
    const interDist = Math.hypot(c1.item.x - c2.item.x, c1.item.y - c2.item.y);
    if (interDist <= 3.2 && c1.dist <= 6.0) {
      const midX = (c1.item.x + c2.item.x) / 2;
      const midY = (c1.item.y + c2.item.y) / 2;
      zoomToLocation(midX, midY, 2.6);
      Sound.playTone(600, 0.05, 'sine', 0.08);
      return;
    }
  }

  if (c1 && c1.dist <= 6.0) {
    selectExploreItem(c1.item);
  }
}

function selectExploreItem(item, countExplore = true) {
  S.exploreSelectedId = item.id;
  if (countExplore) {
    S.exploredItemsCount++;
    Sound.playTone(600, 0.04, 'sine', 0.08);
    if (S.exploredItemsCount >= 5) unlockBadge('kesifci');
  }

  renderExploreMap(item.kategori);

  const catObj = ALL_KATEGORILER.find(k => k.id === item.kategori);
  const kodlama = catObj?.kodlama || '';
  
  const noteBox = item.not 
    ? `<div class="explore-item-note">📌 <b>Önemli Bilgi:</b> ${esc(item.not)}</div>` 
    : '';

  const mBox = kodlama 
    ? `<div class="explore-mnemonic-box">💡 <b>Grup Şifresi (${esc(item.kategori)}):</b> ${esc(kodlama)}</div>` 
    : '';

  const isZoomed = S.mapScale > 1.2;

  $('bottom-panel').innerHTML = `
    <div class="explore-bottom-card">
      <div class="explore-bottom-row">
        <div>
          <div class="explore-name">${esc(item.isim)}</div>
          <div class="explore-cat" style="color:${CAT_COLOR[item.kategori]||'#3498db'}">${esc(item.kategori)} ${item.num ? `(#${item.num})` : ''}</div>
        </div>
        <button id="btn-explore-center" class="btn ${isZoomed ? 'btn-primary' : 'btn-secondary'} btn-sm">
          ${isZoomed ? '🔄 Uzaklaş' : '🎯 Odaklan'}
        </button>
      </div>
      ${noteBox}
      ${mBox}
    </div>`;

  $('btn-explore-center')?.addEventListener('click', () => {
    const btn = $('btn-explore-center');
    if (S.mapScale > 1.2) {
      resetMapTransform();
      if (btn) {
        btn.textContent = '🎯 Odaklan';
        btn.className = 'btn btn-secondary btn-sm';
      }
      Sound.playTone(450, 0.05, 'sine', 0.08);
    } else {
      S.mapScale = 2.4;
      const stage = $('map-stage');
      if (stage) {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        S.mapTx = (50 - item.x) * (w / 100) * 1.8;
        S.mapTy = (50 - item.y) * (h / 100) * 1.8;
        applyMapTransform();
      }
      if (btn) {
        btn.textContent = '🔄 Uzaklaş';
        btn.className = 'btn btn-primary btn-sm';
      }
      Sound.playTone(650, 0.05, 'sine', 0.08);
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────
//  MAP GESTURES  (pinch/zoom + pan)
// ─────────────────────────────────────────────────────────────────────────
function bindMapGestures() {
  const mc = $('map-container');
  mc.addEventListener('touchstart', onTouchStart, { passive: false });
  mc.addEventListener('touchmove',  onTouchMove,  { passive: false });
  mc.addEventListener('touchend',   onTouchEnd,   { passive: false });
  let lastTap = 0;
  mc.addEventListener('touchend', () => {
    const now = Date.now();
    if (now - lastTap < 300) resetMapTransform();
    lastTap = now;
  }, { passive: true });
}

function onTouchStart(e) {
  if (e.touches.length === 2) {
    S.pinching = true;
    S.pinchStartDist  = touchDist(e);
    S.pinchStartScale = S.mapScale;
    e.preventDefault();
  } else if (e.touches.length === 1) {
    S.panning    = S.mapScale > 1.05;
    S.panStartX  = e.touches[0].clientX;
    S.panStartY  = e.touches[0].clientY;
    S.panStartTx = S.mapTx;
    S.panStartTy = S.mapTy;
  }
}
function onTouchMove(e) {
  if (S.pinching && e.touches.length === 2) {
    S.mapScale = Math.min(6, Math.max(1, S.pinchStartScale * touchDist(e) / S.pinchStartDist));
    applyMapTransform(); e.preventDefault();
  } else if (S.panning && e.touches.length === 1) {
    S.mapTx = S.panStartTx + e.touches[0].clientX - S.panStartX;
    S.mapTy = S.panStartTy + e.touches[0].clientY - S.panStartY;
    applyMapTransform(); e.preventDefault();
  }
}
function onTouchEnd(e) {
  if (e.touches.length < 2) setTimeout(() => { S.pinching = false; }, 60);
  if (e.touches.length === 0) S.panning = false;
}
function touchDist(e) {
  return Math.hypot(e.touches[0].clientX-e.touches[1].clientX,
                    e.touches[0].clientY-e.touches[1].clientY);
}
function applyMapTransform() {
  $('map-zoom-wrapper').style.transform =
    `translate(${S.mapTx}px,${S.mapTy}px) scale(${S.mapScale})`;
}
function zoomToLocation(xPct, yPct, targetScale = 2.6) {
  S.mapScale = targetScale;
  const stage = $('map-stage');
  if (stage) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    S.mapTx = (50 - xPct) * (w / 100) * (targetScale - 0.7);
    S.mapTy = (50 - yPct) * (h / 100) * (targetScale - 0.7);
    const wrapper = $('map-zoom-wrapper');
    if (wrapper) {
      wrapper.style.transition = 'transform .28s ease-out';
      applyMapTransform();
      setTimeout(() => { wrapper.style.transition = ''; }, 300);
    }
  }
}
function resetMapTransform() {
  S.mapScale = 1; S.mapTx = 0; S.mapTy = 0;
  const w = $('map-zoom-wrapper');
  if (w) {
    w.style.transition = 'transform .3s ease';
    applyMapTransform();
    setTimeout(() => { w.style.transition = ''; }, 320);
  }
}

let lastTouchTime = 0;
function bindMapClickEvents() {
  const mc = $('map-container');
  mc.addEventListener('click', e => {
    if (Date.now() - lastTouchTime < 500) return;
    onMapClick(e);
  });
  mc.addEventListener('touchend', e => {
    if (e.changedTouches.length === 1 && !S.pinching) {
      lastTouchTime = Date.now();
      onMapClick({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════════════════════════════
//  BİLGİ KARTLARI (FLASHCARDS) MODU
// ═══════════════════════════════════════════════════════════════════════════
function getActiveFacts() {
  if (S.category) {
    const cat = ALL_KATEGORILER.find(k => k.id === S.category);
    return (cat && cat.facts) ? cat.facts.map(f => ({ ...f, kategori: cat.id })) : [];
  }
  const allFacts = [];
  const targetCats = ALL_KATEGORILER.filter(k => {
    if (S.mode === 'mixed') return true;
    if (S.mode === 'mountains') return k.tip === 'dag';
    if (S.mode === 'ovalar') return k.tip === 'ova';
    if (S.mode === 'platolar') return k.tip === 'plato';
    if (S.mode === 'akarsular') return k.tip === 'akarsu';
    if (S.mode === 'gecitler') return k.tip === 'gecit';
    return k.tip === 'gol';
  });
  targetCats.filter(k => k.facts && k.facts.length > 0).forEach(k => {
    k.facts.forEach(f => allFacts.push({ ...f, kategori: k.id }));
  });
  return allFacts;
}

function openFlashcardModal() {
  const facts = getActiveFacts();
  if (facts.length === 0) {
    alert('Bu kategoride henüz soru-cevap eklenmemiş.');
    return;
  }
  const defaultTitle = S.mode === 'mountains' ? 'Tüm Dağlar' :
                       S.mode === 'lakes' ? 'Tüm Göller' :
                       S.mode === 'ovalar' ? 'Tüm Ovalar' :
                       S.mode === 'platolar' ? 'Tüm Platolar' :
                       S.mode === 'akarsular' ? 'Tüm Akarsular' :
                       S.mode === 'gecitler' ? 'Tüm Dağ Geçitleri' : 'Tüm Konular';
  const title = S.category || defaultTitle;
  $('modal-fc-cat-name').textContent = `${title} (${facts.length} Bilgi Kartı)`;
  $('modal-fc-mode').classList.remove('hidden');
}

function startFlashcards(subMode) {
  const facts = getActiveFacts();
  if (facts.length === 0) return;

  S.fcMode      = subMode;
  S.fcQueue     = shuffle(facts);
  S.fcTotalInit = S.fcQueue.length;
  S.fcCurrent   = null;
  S.fcStats     = { correct: 0, wrong: 0 };

  showScreen('screen-flashcards');
  $('fc-finish-wrap').classList.add('hidden');

  if (subMode === 'card') {
    $('fc-card-mode-wrap').classList.remove('hidden');
    $('fc-test-mode-wrap').classList.add('hidden');
  } else {
    $('fc-card-mode-wrap').classList.add('hidden');
    $('fc-test-mode-wrap').classList.remove('hidden');
  }

  nextFlashcard();
}

function renderFlashcardHeader() {
  const done  = S.fcStats.correct + S.fcStats.wrong;
  const total = done + S.fcQueue.length + 1;
  const title = S.category || 'Göller';
  const modeLbl = S.fcMode === 'card' ? 'Kart Modu' : 'Test Modu';

  $('fc-top-bar').innerHTML = `
    <button class="btn-icon" id="fc-back-btn">←</button>
    <div class="tbar-meta">
      <div class="tbar-cat">🃏 ${esc(title)} · ${modeLbl}</div>
      <div class="tbar-progress">${done + 1} / ${total}</div>
    </div>
    <div class="tbar-score">
      <span class="score-c">✓ ${S.fcStats.correct}</span>
      <span class="score-w">✗ ${S.fcStats.wrong}</span>
    </div>
    <button class="btn-icon" id="fc-sound-btn" title="Ses Aç/Kapat">${Sound.enabled ? '🔊' : '🔇'}</button>
    <button class="btn-icon" id="fc-hint-btn" title="Hafıza Şifresi">💡</button>`;

  $('fc-back-btn')?.addEventListener('click', () => {
    if (confirm('Bilgi Kartlarından çıkmak istiyor musunuz?')) {
      showScreen('screen-menu'); buildMenu();
    }
  });
  $('fc-sound-btn')?.addEventListener('click', () => Sound.toggle());
  $('fc-hint-btn')?.addEventListener('click', () => {
    if (S.fcCurrent) openMnemonicsModal(S.fcCurrent.kategori);
    else openMnemonicsModal();
  });
}

function nextFlashcard() {
  if (S.fcQueue.length === 0) {
    endFlashcards();
    return;
  }
  S.fcCurrent = S.fcQueue.shift();
  renderFlashcardHeader();

  if (S.fcMode === 'card') renderCardMode(S.fcCurrent);
  else renderTestMode(S.fcCurrent);
}

// ── 1. Kart Modu ───────────────────────────────────────────────────────────
function renderCardMode(fact) {
  const card = $('fc-card');
  card.classList.remove('flipped');
  $('fc-card-actions').classList.add('hidden');

  $('fc-question-text').textContent = fact.s;
  $('fc-answer-text').textContent   = fact.c;
}

$('fc-card')?.addEventListener('click', () => {
  const card = $('fc-card');
  if (!card.classList.contains('flipped')) {
    card.classList.add('flipped');
    $('fc-card-actions').classList.remove('hidden');
    Sound.playTone(550, 0.04, 'sine', 0.08);
  }
});

$('fc-known-btn')?.addEventListener('click', () => {
  S.fcStats.correct++;
  Sound.playCorrect();
  triggerHaptic(true);
  nextFlashcard();
});

$('fc-again-btn')?.addEventListener('click', () => {
  S.fcStats.wrong++;
  Sound.playWrong();
  triggerHaptic(false);
  const pos = Math.min(3, S.fcQueue.length);
  S.fcQueue.splice(pos, 0, S.fcCurrent);
  nextFlashcard();
});

// ── 2. Test Modu ───────────────────────────────────────────────────────────
function renderTestMode(fact) {
  $('fc-test-q-text').textContent = fact.s;
  const choicesDiv = $('fc-test-choices');
  choicesDiv.innerHTML = '';
  const feedbackDiv = $('fc-test-feedback');
  feedbackDiv.classList.add('hidden');
  feedbackDiv.innerHTML = '';

  const allAnswers = [...new Set(
    ALL_KATEGORILER.filter(k => k.tip === 'gol' && k.facts)
      .flatMap(k => k.facts.map(f => f.c))
  )];
  const sameCatAnswers = (ALL_KATEGORILER.find(k => k.id === fact.kategori)?.facts || [])
    .map(f => f.c).filter(c => c !== fact.c);
  const otherAnswers = allAnswers.filter(c => c !== fact.c && !sameCatAnswers.includes(c));
  const wrongPool = [...shuffle(sameCatAnswers), ...shuffle(otherAnswers)];
  const wrongPicked = wrongPool.slice(0, 3);
  const options = shuffle([fact.c, ...wrongPicked]);

  let answered = false;

  options.forEach(opt => {
    const btn = el('button', 'choice-btn', esc(opt));
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const isCorrect = (opt === fact.c);

      choicesDiv.querySelectorAll('.choice-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent === fact.c) b.classList.add('correct');
        else if (b.textContent === opt && !isCorrect) b.classList.add('wrong');
      });

      if (isCorrect) {
        S.fcStats.correct++;
        Sound.playCorrect();
        triggerHaptic(true);
      } else {
        S.fcStats.wrong++;
        Sound.playWrong();
        triggerHaptic(false);
        const pos = Math.min(3, S.fcQueue.length);
        S.fcQueue.splice(pos, 0, fact);
      }

      renderFlashcardHeader();

      feedbackDiv.classList.remove('hidden');
      feedbackDiv.innerHTML = `
        <div class="fb-icon">${isCorrect ? '✅' : '❌'}</div>
        <div class="fb-body">
          <div class="fb-result ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? 'Doğru!' : 'Yanlış'}</div>
          <div class="fb-name">Doğru cevap: <strong>${esc(fact.c)}</strong></div>
        </div>
        <button class="fb-continue" id="fc-test-continue">Devam →</button>`;

      $('fc-test-continue')?.addEventListener('click', () => nextFlashcard());
    });
    choicesDiv.appendChild(btn);
  });
}

function endFlashcards() {
  unlockBadge('kart_ustasi');
  $('fc-card-mode-wrap').classList.add('hidden');
  $('fc-test-mode-wrap').classList.add('hidden');
  $('fc-finish-wrap').classList.remove('hidden');
  $('fc-res-correct').textContent = S.fcStats.correct;
  $('fc-res-wrong').textContent   = S.fcStats.wrong;
}

$('fc-again-all-btn')?.addEventListener('click', () => startFlashcards(S.fcMode));
$('fc-menu-btn')?.addEventListener('click', () => { showScreen('screen-menu'); buildMenu(); });

// ════════════════════════════════════════════════════════════════════
// TURİZM QUIZ  (turizm_data.js required)
// ════════════════════════════════════════════════════════════════════
const TZ = {
  pool:      [],   // shuffled question list
  idx:       0,    // current question index
  correct:   0,
  wrong:     0,
  answered:  false,

  // ── Start / Init ──────────────────────────────────────────────────
  start() {
    // Fisher-Yates shuffle
    this.pool = [...(window.TURIZM_SORULAR || [])];
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pool[i], this.pool[j]] = [this.pool[j], this.pool[i]];
    }
    this.idx      = 0;
    this.correct  = 0;
    this.wrong    = 0;
    this.answered = false;

    showScreen('screen-turizm');
    this.render();
  },

  // ── Render current question ────────────────────────────────────────
  render() {
    const q   = this.pool[this.idx];
    const tot = this.pool.length;

    // header
    $('tz-q-num').textContent   = this.idx + 1;
    $('tz-q-total').textContent = tot;
    $('tz-score-correct').textContent = '✓ ' + this.correct;
    $('tz-score-wrong').textContent   = '✗ ' + this.wrong;

    // progress bar
    $('tz-progress-fill').style.width = (this.idx / tot * 100) + '%';

    // question text
    $('tz-question-text').textContent = q.s;

    // options
    for (let i = 0; i < 4; i++) {
      const btn = $('tz-opt-' + i);
      btn.textContent = q.o[i];
      btn.className   = 'tz-option-btn';
      btn.disabled    = false;
    }

    // hide feedback + next
    const fb = $('tz-feedback');
    fb.classList.add('hidden');
    fb.className = 'tz-feedback hidden';
    $('tz-next-btn').classList.add('hidden');
    $('tz-result').classList.add('hidden');

    this.answered = false;
  },

  // ── Handle answer ─────────────────────────────────────────────────
  answer(chosenIdx) {
    if (this.answered) return;
    this.answered = true;

    const q = this.pool[this.idx];
    const isCorrect = (chosenIdx === q.d);

    if (isCorrect) this.correct++;
    else           this.wrong++;

    // Colour buttons
    for (let i = 0; i < 4; i++) {
      const btn = $('tz-opt-' + i);
      btn.disabled = true;
      if (i === q.d)       btn.classList.add('correct');
      if (i === chosenIdx && !isCorrect) btn.classList.add('wrong');
    }

    // Feedback message
    const fb = $('tz-feedback');
    fb.classList.remove('hidden');
    if (isCorrect) {
      fb.className = 'tz-feedback is-correct';
      fb.innerHTML = '✅ Doğru! ' + q.a;
    } else {
      fb.className = 'tz-feedback is-wrong';
      fb.innerHTML = '❌ Yanlış — Doğru cevap: <strong>' + q.o[q.d] + '</strong><br><small>' + q.a + '</small>';
    }

    // Show next button
    const nextBtn = $('tz-next-btn');
    nextBtn.classList.remove('hidden');

    // If last question, change button label
    if (this.idx + 1 >= this.pool.length) {
      nextBtn.textContent = 'Sonuçları Gör →';
    } else {
      nextBtn.textContent = 'Sonraki Soru →';
    }
  },

  // ── Advance to next question ──────────────────────────────────────
  next() {
    this.idx++;
    if (this.idx >= this.pool.length) {
      this.showResult();
    } else {
      this.render();
    }
  },

  // ── Final result ──────────────────────────────────────────────────
  showResult() {
    const tot = this.pool.length;
    const pct = Math.round(this.correct / tot * 100);

    // Hide quiz elements
    $('tz-question-card').style.display = 'none';
    $('tz-options-grid').style.display  = 'none';
    $('tz-feedback').classList.add('hidden');
    $('tz-next-btn').classList.add('hidden');

    // Update progress bar to 100%
    $('tz-progress-fill').style.width = '100%';
    $('tz-q-num').textContent = tot;

    // Emoji based on score
    let icon = pct >= 80 ? '🏆' : pct >= 60 ? '🥈' : pct >= 40 ? '🥉' : '📚';
    $('tz-result-icon').textContent    = icon;
    $('tz-result-score').textContent   = this.correct + ' / ' + tot + '  (' + pct + '%)';
    $('tz-result-bar').style.width     = pct + '%';

    const res = $('tz-result');
    res.classList.remove('hidden');

    // Restore display for restart
    $('tz-restart-btn').onclick = () => {
      $('tz-question-card').style.display = '';
      $('tz-options-grid').style.display  = '';
      this.start();
    };
    $('tz-menu-btn').onclick = () => {
      $('tz-question-card').style.display = '';
      $('tz-options-grid').style.display  = '';
      showScreen('screen-menu');
      buildMenu();
    };
  }
};

// ── Wire buttons ──────────────────────────────────────────────────────────────
$('turizm-btn')?.addEventListener('click', () => TZ.start());

$('tz-back-btn')?.addEventListener('click', () => {
  showScreen('screen-menu');
  buildMenu();
});

$('tz-next-btn')?.addEventListener('click', () => TZ.next());

// Option buttons (event delegation)
$('tz-options-grid')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.tz-option-btn');
  if (!btn || btn.disabled) return;
  TZ.answer(parseInt(btn.dataset.idx, 10));
});
