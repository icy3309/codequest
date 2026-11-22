'use strict';
/* =========================================================
   Maskottchen mit Schraubendreher (Pixel-Maus bzw. im dunklen Modus
   ein dickes Erdhörnchen) – läuft über dem Editor hin und her,
   reagiert auf Ausführen/Prüfen und macht Mut.
   Sprites sind Zeichen-Raster (24×14), gemalt auf <canvas>.
   ========================================================= */
const W = 24, H = 14;
const pad = (rows) => rows.map((r) => r.padEnd(W, '.').slice(0, W));

/** Frame bauen: Basis + Beine (letzte Zeile) + einzelne Pixel [zeile, spalte, zeichen]. */
function buildFrame(base, legs, px) {
  const g = base.map((r) => r.split(''));
  g[H - 1] = legs.padEnd(W, '.').split('');
  for (const [r, c, ch] of px) if (g[r] && c >= 0 && c < W) g[r][c] = ch;
  return g;
}
const BLINK = [[5, 16, 'G'], [5, 17, 'G'], [6, 16, 'K'], [6, 17, 'K']];

/* ---------- 🐭 Maus ---------- */
const MOUSE_BASE = pad([
  '...........KKK..KKK',
  '..........KPPPKKPPPK',
  '..........KPPPKKPPPK',
  '...........KKGGGGKK',
  '..........KGGGGGGGGK',
  '.....KKKKKGGGGGGEWGGK',
  '....KGGGGGGGGGGGEEGGGK',
  '...KGGGGGGGGGGCCGGGGGPK',
  '...KGGGGGGGGGGGGGGGGKK',
  '...KGLLLLLLGGGGGGGGK',
  '...KGLLLLLLLGGGGGGK',
  '....KGLLLLLGGGGGKK',
  '.....KKKKKKKKKKK',
  '',
]);
const M_LEGS = { a: '....KK...KK..KK..KK', b: '.....KK.KK...KK.KK', s: '.....KK..KK..KK.KK' };
const M_DRIVER = [[10, 19, 'S'], [10, 20, 'S'], [11, 19, 'S'], [11, 20, 'S'], [10, 21, 'M'], [10, 22, 'M'], [10, 23, 'M']];
const M_TAIL_A = [[10, 2, 'T'], [11, 1, 'T'], [11, 0, 'T']];
const M_TAIL_B = [[10, 2, 'T'], [9, 1, 'T'], [9, 0, 'T']];
const MOUSE = {
  pal: { K: '#5b3a4a', G: '#cfc6db', L: '#f5f0f8', P: '#ff8fb8', E: '#2b1a24', W: '#ffffff', C: '#ffb3cf', T: '#f4a3c0', S: '#ff6fa8', M: '#a3adbf', B: '#8fd3ff', Y: '#ffd966' },
  crown: [0, 1],
  frames: {
    walk1: buildFrame(MOUSE_BASE, M_LEGS.a, [...M_TAIL_A, ...M_DRIVER]),
    walk2: buildFrame(MOUSE_BASE, M_LEGS.b, [...M_TAIL_B, ...M_DRIVER]),
    idle: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_A, ...M_DRIVER]),
    blink: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_A, ...M_DRIVER, ...BLINK]),
    cheer: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_B, [8, 19, 'P'], [3, 21, 'S'], [4, 21, 'S'], [3, 22, 'S'], [4, 22, 'S'], [0, 21, 'M'], [1, 21, 'M'], [2, 21, 'M'], [0, 23, 'Y'], [1, 23, 'Y']]),
    sad: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_B, ...BLINK, [7, 17, 'B'], [8, 17, 'B'], [11, 19, 'S'], [12, 20, 'S'], [13, 21, 'M']]),
    fix1: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_A, [10, 19, 'S'], [10, 20, 'S'], [11, 21, 'M'], [12, 22, 'M']]),
    fix2: buildFrame(MOUSE_BASE, M_LEGS.s, [...M_TAIL_A, [10, 19, 'S'], [10, 20, 'S'], [11, 21, 'M'], [12, 21, 'M'], [13, 22, 'Y'], [12, 23, 'Y']]),
  },
};

/* ---------- 🐿️ Dickes Erdhörnchen (kleine Öhrchen, Pausbacken, Rückenstreifen, buschiger Schwanz) ---------- */
const SQ_BASE = pad([
  '',
  '',
  '............KK...KK',
  '...........KPGK.KGPK',
  '..........KGGGGGGGGGK',
  '....KKKKKKGGGGGGEWGGGK',
  '...KGDGGDGGGGGGGEEGGGGK',
  '..KGGDGGDGGGGGCCCCGGGGPK',
  '..KGGDGGDGGGGCCCCCGGGKK',
  '..KGLLLLLLLGGGCCCGGGK',
  '..KGLLLLLLLLGGGGGGGK',
  '...KGLLLLLLLLGGGGKK',
  '....KKKKKKKKKKKKKK',
  '',
]);
const S_LEGS = { a: '....KK...KK...KK..KK', b: '.....KK.KK....KK.KK', s: '.....KK..KK...KK.KK' };
const S_DRIVER = [[10, 20, 'S'], [10, 21, 'S'], [11, 20, 'S'], [11, 21, 'S'], [10, 22, 'M'], [10, 23, 'M']];
const S_TAIL_A = [[3, 1, 'T'], [3, 2, 'T'], [4, 0, 'T'], [4, 1, 'T'], [4, 2, 'T'], [4, 3, 'T'], [5, 0, 'T'], [5, 1, 'T'], [5, 2, 'T'], [5, 3, 'T'], [6, 0, 'T'], [6, 1, 'T'], [6, 2, 'T'], [7, 0, 'T'], [7, 1, 'T'], [8, 1, 'T'], [4, 1, 'U'], [5, 1, 'U']];
const S_TAIL_B = [[2, 2, 'T'], [2, 3, 'T'], [3, 1, 'T'], [3, 2, 'T'], [3, 3, 'T'], [4, 0, 'T'], [4, 1, 'T'], [4, 2, 'T'], [4, 3, 'T'], [5, 0, 'T'], [5, 1, 'T'], [5, 2, 'T'], [5, 3, 'T'], [6, 1, 'T'], [6, 2, 'T'], [7, 1, 'T'], [3, 2, 'U'], [4, 1, 'U']];
const SQUIRREL = {
  pal: { K: '#2b1c14', G: '#c99560', D: '#8b5a31', L: '#f3dfbf', P: '#e7907e', E: '#1b120c', W: '#ffffff', C: '#e3b47f', T: '#a9743f', U: '#cf9a5d', S: '#f6b94c', M: '#b7c0d6', B: '#8fd3ff', Y: '#ffe38a' },
  crown: [1, 2],
  frames: {
    walk1: buildFrame(SQ_BASE, S_LEGS.a, [...S_TAIL_A, ...S_DRIVER]),
    walk2: buildFrame(SQ_BASE, S_LEGS.b, [...S_TAIL_B, ...S_DRIVER]),
    idle: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_A, ...S_DRIVER]),
    blink: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_A, ...S_DRIVER, ...BLINK]),
    cheer: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_B, [8, 19, 'P'], [3, 21, 'S'], [4, 21, 'S'], [3, 22, 'S'], [4, 22, 'S'], [0, 21, 'M'], [1, 21, 'M'], [2, 21, 'M'], [0, 23, 'Y'], [1, 23, 'Y']]),
    sad: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_B, ...BLINK, [7, 18, 'B'], [8, 18, 'B'], [11, 20, 'S'], [12, 21, 'S'], [13, 22, 'M']]),
    fix1: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_A, [10, 20, 'S'], [10, 21, 'S'], [11, 22, 'M'], [12, 23, 'M']]),
    fix2: buildFrame(SQ_BASE, S_LEGS.s, [...S_TAIL_A, [10, 20, 'S'], [10, 21, 'S'], [11, 22, 'M'], [12, 22, 'M'], [13, 23, 'Y'], [12, 23, 'Y']]),
  },
};
const isSquirrel = () => document.documentElement.dataset.theme === 'squirrel';
const currentSprite = () => (isSquirrel() ? SQUIRREL : MOUSE);

/** Frame auf ein Canvas malen (optional gespiegelt). Maus oder Erdhörnchen – je nach Modus. */
function drawMouse(canvas, frame = 'idle', flip = false) {
  const ctx = canvas.getContext('2d');
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  ctx.clearRect(0, 0, W, H);
  const sp = currentSprite(), g = sp.frames[frame] || sp.frames.idle;
  const crown = typeof save !== 'undefined' && save.secretCheese > 0;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const ch = crown && sp.crown.includes(r) && (c === 14 || c === 15) ? 'Y' : g[r][c];
    const col = sp.pal[ch];
    if (!col) continue;
    ctx.fillStyle = col;
    ctx.fillRect(flip ? W - 1 - c : c, r, 1, 1);
  }
}

const MOUSE_LINES = {
  idle: [
    'Du schaffst das! 🧀', 'Ich glaub an dich! 💕', 'Ein Käsestück nach dem anderen 🧀',
    'Fehler sind nur Krümel auf dem Weg 🍪', 'Piep piep – weiter so! 🐭', 'Programmieren ist wie Käse suchen: dranbleiben! 🔍',
    'Kleine Schritte, großer Käse 🧀', 'Ich halt schon mal den Schraubendreher bereit 🔧', 'Du bist richtig gut darin! ✨',
    'Pause machen ist auch erlaubt ☕', 'Noch ein Level bis zum nächsten Käse! 🧀',
  ],
  run: ['Ich schraub mal mit … 🔧', 'Mal sehen, was passiert … 👀', 'Los geht’s! 🐭💨'],
  pass: ['Juhuu! 🎉', 'Käse für dich! 🧀🧀🧀', 'Du bist die Beste! 💖', 'Perfekt geschraubt! 🔧✨', 'Piiiiep! Geschafft! 🎉'],
  fail: ['Fast! Du schaffst das 💪', 'Nicht schlimm – nochmal probieren! 🧀', 'Ein Krümel fehlt noch 🍪', 'Fehler sind zum Lernen da 💕'],
  error: ['Huch! Lies mal die Meldung unten 🔍', 'Da klemmt was – ich schau mit 🔧'],
  hint: ['Gute Idee – Hilfe holen ist schlau! 💡', 'Ein kleiner Tipp kann Wunder wirken ✨'],
  dizzy: ['Puh, mir ist ganz schwindelig 😵 – Endlosschleife?', 'Ich renn im Kreis … 🌀 Endet deine Schleife?'],
  click: ['Piep! 🐭', 'Hihi, das kitzelt! 💕', 'Hallo du! 👋', 'Hast du Käse dabei? 🧀', 'Ich bin Mimi, deine Schraubermaus! 🔧'],
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const Mascot = {
  lane: null, cv: null, bubble: null,
  x: 30, dir: 1, mode: 'walk', modeUntil: 0, nextIdle: 0, nextTalk: 0, bubbleUntil: 0,
  t: 0, last: 0, raf: 0, reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,

  init() {
    this.lane = $('#mouseLane');
    if (!this.lane) return;
    this.cv = $('.mouse-sprite', this.lane);
    this.bubble = $('.mouse-bubble', this.lane);
    const now = performance.now();
    this.nextIdle = now + 4000 + Math.random() * 5000;
    this.nextTalk = now + 8000;
    this.lane.addEventListener('click', () => this.react('cheer', pick(MOUSE_LINES.click), 1200, true));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.start(); });
    this.start();
  },
  start() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },

  /** Reaktion zeigen: Pose für eine Weile + Sprechblase. */
  react(mode, text, ms = 1800, squeak = false) {
    const now = performance.now();
    this.mode = mode;
    this.modeUntil = now + ms;
    if (text) this.say(text, Math.max(ms, 2600));
    if (squeak) Sound.squeak?.();
    this.start();
  },
  say(text, ms = 3000) {
    if (!this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.classList.add('show');
    this.bubbleUntil = performance.now() + ms;
    this.nextTalk = performance.now() + 25000 + Math.random() * 15000;
  },
  /** Singt kurz zur Musik mit (nur wenn sie gerade fröhlich herumläuft). */
  sing() {
    if (!this.lane?.offsetParent || (this.mode !== 'walk' && this.mode !== 'idle')) return;
    this.react('cheer', pick(['♪ piep piep ♪', '♫ pieps-di-piep ♫', '♪ la-la-piep ♪', '♫ mmh, Käsebeats ♫']), 900);
  },
  /** Kurzformen für die Level-Ansicht. */
  line(kind) { return pick(MOUSE_LINES[kind] || MOUSE_LINES.idle); },

  tick(now) {
    this.raf = 0;
    if (document.hidden || !this.lane || !this.lane.offsetParent) { this.raf = 0; if (!document.hidden) setTimeout(() => this.start(), 500); return; }
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    const laneW = this.lane.clientWidth, spriteW = this.cv.clientWidth || 72;
    const maxX = Math.max(0, laneW - spriteW - 4);

    // Modus-Wechsel: nach einer Reaktion wieder loslaufen, ab und zu verschnaufen
    if (this.mode !== 'walk' && this.mode !== 'idle' && now > this.modeUntil) this.mode = 'walk';
    if (this.mode === 'idle' && now > this.modeUntil) { this.mode = 'walk'; this.nextIdle = now + 5000 + Math.random() * 7000; }
    if (this.mode === 'walk' && now > this.nextIdle) { this.mode = 'idle'; this.modeUntil = now + 1500 + Math.random() * 2500; }
    if (now > this.nextTalk && this.mode !== 'sad') this.say(pick(MOUSE_LINES.idle), 3500);
    if (this.bubbleUntil && now > this.bubbleUntil) { this.bubble.classList.remove('show'); this.bubbleUntil = 0; }

    let frame = 'idle', jump = 0;
    if (this.mode === 'walk' && !this.reduce) {
      this.x += this.dir * 30 * dt;
      if (this.x >= maxX) { this.x = maxX; this.dir = -1; }
      if (this.x <= 0) { this.x = 0; this.dir = 1; }
      frame = Math.floor(this.t * 6) % 2 ? 'walk2' : 'walk1';
      jump = Math.abs(Math.sin(this.t * 12)) * 1.5;
    } else if (this.mode === 'idle' || this.mode === 'walk') {
      frame = (this.t % 3.2) < 0.15 ? 'blink' : 'idle';
    } else if (this.mode === 'cheer') {
      frame = 'cheer';
      jump = this.reduce ? 0 : Math.abs(Math.sin(this.t * 9)) * 10;
    } else if (this.mode === 'fix') {
      frame = Math.floor(this.t * 8) % 2 ? 'fix2' : 'fix1';
    } else if (this.mode === 'sad') {
      frame = 'sad';
    } else if (this.mode === 'dizzy') {
      frame = 'sad';
      if (!this.reduce) this.dir = Math.floor(this.t * 5) % 2 ? 1 : -1;
    }
    this.x = Math.min(this.x, maxX);
    drawMouse(this.cv, frame, this.dir < 0);
    this.cv.style.transform = `translate(${this.x}px, ${-jump}px)`;

    // Sprechblase neben die Maus (rechts, sonst links)
    if (this.bubbleUntil) {
      const bw = this.bubble.offsetWidth;
      const right = this.x + spriteW + 8;
      this.bubble.style.left = (right + bw < laneW - 4 ? right : Math.max(4, this.x - bw - 8)) + 'px';
    }
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },
};

/** Kleine Mäuse für Logo, Startseite und Erfolgsfenster. */
function paintStaticMice() {
  $$('canvas[data-mouse]').forEach((cv) => drawMouse(cv, cv.dataset.mouse, cv.dataset.flip === '1'));
}

/* =========================================================
   Startseite: Mimi macht kleine Kunststückchen – blinzeln,
   umschauen, schrauben, ein Stück trippeln, hüpfen, träumen.
   ========================================================= */
const HeroMouse = {
  cv: null, stage: null, bubble: null, act: null, actStart: 0, actLen: 0, x: 0, flip: false, t0: 0, raf: 0,
  reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
  ACTS: [
    ['idle', 5], ['look', 2], ['tinker', 2], ['scoot', 2], ['hop', 2], ['think', 2], ['sleepy', 1],
  ],
  THOUGHTS: ['🧀?', '💭 Käse …', '♪ ♫', '💕', 'Weiter lernen? 🐭', '✨', 'Piep!'],

  init() {
    this.cv = $('.hero-mouse');
    this.stage = $('.hero-stage');
    this.bubble = $('.hero-bubble');
    if (!this.cv || !this.stage) return;
    this.next(performance.now());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.start(); });
    this.start();
  },
  start() { if (!this.raf) this.raf = requestAnimationFrame((t) => this.tick(t)); },

  /** Nächstes Kunststück auswählen (gewichteter Zufall). */
  next(now) {
    const pool = this.reduce ? [['idle', 1], ['look', 1], ['think', 1]] : this.ACTS;
    const sum = pool.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * sum;
    let act = pool[0][0];
    for (const [name, w] of pool) { if ((r -= w) < 0) { act = name; break; } }
    if (act === this.act && act !== 'idle') act = 'idle';
    this.act = act;
    this.actStart = now;
    this.actLen = { idle: 2500 + Math.random() * 2000, look: 1400, tinker: 1700, scoot: 2600, hop: 900, think: 2600, sleepy: 3000 }[act];
    if (act === 'think') this.say(this.THOUGHTS[Math.floor(Math.random() * this.THOUGHTS.length)]);
    if (act === 'sleepy') this.say('Zzz … 💤');
    if (act === 'tinker') this.say('🔧');
  },
  say(text) {
    if (!this.bubble) return;
    this.bubble.textContent = text;
    this.bubble.classList.add('show');
    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => this.bubble.classList.remove('show'), 2200);
  },

  tick(now) {
    this.raf = 0;
    if (document.hidden) return;
    if (!this.cv.offsetParent) { setTimeout(() => this.start(), 600); return; }
    if (typeof EGG !== 'undefined' && EGG.busy) { this.raf = requestAnimationFrame((t) => this.tick(t)); return; } // Käseparty läuft
    const p = Math.min(1, (now - this.actStart) / this.actLen);
    let frame = 'idle', y = 0, flip = false;
    const blink = (now % 3400) < 140;
    switch (this.act) {
      case 'idle':
        frame = blink ? 'blink' : 'idle';
        y = this.reduce ? 0 : Math.sin(now / 420) * 2.5; // sanftes Atmen
        break;
      case 'look':
        flip = p > 0.15 && p < 0.85;
        frame = blink ? 'blink' : 'idle';
        break;
      case 'tinker':
        frame = Math.floor(now / 120) % 2 ? 'fix2' : 'fix1';
        break;
      case 'scoot': {
        // ein Stück nach links trippeln und wieder zurück
        const out = p < 0.5;
        const q = out ? p * 2 : (p - 0.5) * 2;
        this.x = (out ? q : 1 - q) * -46;
        flip = out;
        frame = Math.floor(now / 140) % 2 ? 'walk2' : 'walk1';
        y = Math.abs(Math.sin(now / 70)) * 1.5;
        break;
      }
      case 'hop':
        frame = 'cheer';
        y = Math.sin(p * Math.PI) * 22;
        break;
      case 'think':
        frame = p > 0.4 && p < 0.5 ? 'blink' : 'idle';
        y = Math.sin(now / 600) * 1.5;
        break;
      case 'sleepy':
        frame = 'blink';
        y = Math.sin(now / 700) * 1.5;
        break;
    }
    if (this.act !== 'scoot') this.x *= 0.9;
    drawMouse(this.cv, frame, flip);
    this.stage.style.transform = `translate(${this.x.toFixed(1)}px, ${(-y).toFixed(1)}px)`;
    if (p >= 1) this.next(now);
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },
};
