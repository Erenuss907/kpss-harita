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

// ── State ─────────────────────────────────────────────────────────────────
const S = {
  mode: 'mountains', category: null, qtype: 'mixed',
  screenMode: 'menu',
  timedMode: false,
  isMistakesMode: false,
  activeItems: [], queue: [],
  currentItem: null, currentQType: null, isAnswered: false,
  sessionStats: { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 },
  streak: 0,
  timerId: null, timeLeft: QUESTION_TIME,
  calTarget: null,
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
  const menuBtn = $('menu-sound-btn');
  if (menuBtn) menuBtn.textContent = icon;
  const quizBtn = $('btn-sound-toggle');
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
  { id: 'kart_ustasi', icon: '🃏', title: 'Kart Dehası',       desc: 'Bir Bilgi Kartları turunu tamamla' },
  { id: 'hizli_tur',   icon: '⏱️', title: 'Hız Canavarı',     desc: 'Süreye karşı modda bir tur tamamla' },
  { id: 'kesifci',     icon: '🗺️', title: 'Meraklı Kâşif',    desc: 'Haritayı İncele modunda 5 farklı noktayı incele' },
  { id: 'kusursuz',    icon: '🌟', title: 'Kusursuz Tur',     desc: 'En az 8 soruluk bir testi %100 doğrulukla bitir' },
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
    img.onload = () => resizeMapStage();
    img.src = src;
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
    S.mode === 'mountains' ? k.tip === 'dag' : k.tip === 'gol'
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
                   S.mode === 'mountains' ? item.tip === 'dag' : item.tip === 'gol';
    const catOk  = !S.category || item.kategori === S.category;
    return tipOk && catOk;
  });
}

function updateItemCount() {
  $('item-count').textContent = `(${getActiveItems().length} öğe)`;

  const isLakeCat  = S.category ? (ALL_KATEGORILER.find(k => k.id === S.category)?.tip === 'gol') : false;
  const isLakesAll = (S.mode === 'lakes' && S.category === null);
  const showFC     = isLakeCat || isLakesAll;

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

  S.activeItems  = calibrated;
  S.screenMode   = 'quiz';
  S.sessionStats = { correct: 0, wrong: 0, wrongItems: {}, bestStreak: 0 };
  S.streak       = 0;
  S.isAnswered   = false;
  S.calTarget    = null;
  hideDisambiguationBubble();

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

  if (S.currentQType === 'name-to-loc') {
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
  S.currentQType = S.qtype === 'mixed'
    ? (Math.random() < 0.5 ? 'name-to-loc' : 'loc-to-name') : S.qtype;
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
  const cat   = S.isMistakesMode ? '🎯 Yanıldıklarım' : (S.category || (S.mode==='mountains'?'Dağlar':S.mode==='lakes'?'Göller':'Karışık'));
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
    <button class="btn-icon" id="btn-hint-mnemonic" title="Hafıza İpucu">💡</button>`;

  $('quiz-back')?.addEventListener('click', () => {
    if (confirm('Quizden çıkmak istiyor musunuz?')) {
      stopQuestionTimer();
      clearPins(); enableMapClick(false); showScreen('screen-menu'); buildMenu();
    }
  });
  $('btn-sound-toggle')?.addEventListener('click', () => Sound.toggle());
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

  if (S.currentQType === 'name-to-loc') {
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
  } else {
    addPin(item.x, item.y, '?', '#f39c12', 20, true);
    renderChoices(item);
  }
}

function renderChoices(correct) {
  const options = buildChoices(correct);
  const wrap    = el('div', 'choices-wrap');
  wrap.appendChild(el('div', 'choices-hint',
    `Bu konum hangi ${correct.tip==='dag'?'dağ':'göl'}dür?`));
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
  if (S.screenMode !== 'quiz' || S.isAnswered) return;
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
    evaluateNameToLocAnswer(c1.item, pt.x, pt.y);
  } else {
    // Click was too far from any valid point
    evaluateNameToLocAnswer(null, pt.x, pt.y);
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
  showScreen('screen-results');
}

function bindResultsEvents() {
  $('res-again-btn')?.addEventListener('click', () => startQuiz(S.isMistakesMode));
  $('res-menu-btn')?.addEventListener('click', () => { showScreen('screen-menu'); buildMenu(); });
  $('res-badges-btn')?.addEventListener('click', openBadgesModal);
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
//  BİLGİ KARTLARI (FLASHCARDS) MODU  (SADECE GÖLLER)
// ═══════════════════════════════════════════════════════════════════════════
function getActiveFacts() {
  if (S.category) {
    const cat = ALL_KATEGORILER.find(k => k.id === S.category && k.tip === 'gol');
    return (cat && cat.facts) ? cat.facts.map(f => ({ ...f, kategori: cat.id })) : [];
  }
  const allFacts = [];
  ALL_KATEGORILER.filter(k => k.tip === 'gol' && k.facts && k.facts.length > 0).forEach(k => {
    k.facts.forEach(f => allFacts.push({ ...f, kategori: k.id }));
  });
  return allFacts;
}

function openFlashcardModal() {
  const facts = getActiveFacts();
  if (facts.length === 0) {
    alert('Bu göl kategorisinde henüz soru-cevap eklenmemiş.');
    return;
  }
  const title = S.category || 'Tüm Göller';
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
