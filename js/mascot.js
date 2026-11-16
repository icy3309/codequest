'use strict';
/* =========================================================
   Pixel-Maus mit Schraubendreher – läuft über dem Editor hin
   und her, reagiert auf Ausführen/Prüfen und macht Mut.
   Sprites sind Zeichen-Raster (24×14), gemalt auf <canvas>.
   ========================================================= */
const MOUSE_PAL = {
  K: '#5b3a4a', // Umriss
  G: '#cfc6db', // Fell (grau-lila)
  L: '#f5f0f8', // Bauch
  P: '#ff8fb8', // Ohren innen / Nase
  E: '#2b1a24', // Auge
  W: '#ffffff', // Lichtpunkt im Auge
  C: '#ffb3cf', // Bäckchen
  T: '#f4a3c0', // Schwanz
  S: '#ff6fa8', // Griff des Schraubendrehers
  M: '#a3adbf', // Metall
  B: '#8fd3ff', // Träne
  Y: '#ffd966', // Funke / Käse
};
const W = 24, H = 14;
const BASE = [
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
].map((r) => r.padEnd(W, '.').slice(0, W));
const LEGS_A = '....KK...KK..KK..KK';
const LEGS_B = '.....KK.KK...KK.KK';
const LEGS_STAND = '.....KK..KK..KK.KK';

/** Frame bauen: Basis + Beine (letzte Zeile) + einzelne Pixel [zeile, spalte, zeichen]. */
function buildFrame(legs, px) {
  const g = BASE.map((r) => r.split(''));
  g[H - 1] = legs.padEnd(W, '.').split('');
  for (const [r, c, ch] of px) if (g[r] && c >= 0 && c < W) g[r][c] = ch;
  return g;
}
const DRIVER_HELD = [[10, 19, 'S'], [10, 20, 'S'], [11, 19, 'S'], [11, 20, 'S'], [10, 21, 'M'], [10, 22, 'M'], [10, 23, 'M']];
const TAIL_A = [[10, 2, 'T'], [11, 1, 'T'], [11, 0, 'T']];
const TAIL_B = [[10, 2, 'T'], [9, 1, 'T'], [9, 0, 'T']];
const BLINK = [[5, 16, 'G'], [5, 17, 'G'], [6, 16, 'K'], [6, 17, 'K']];
const FRAMES = {
  walk1: buildFrame(LEGS_A, [...TAIL_A, ...DRIVER_HELD]),
  walk2: buildFrame(LEGS_B, [...TAIL_B, ...DRIVER_HELD]),
  idle: buildFrame(LEGS_STAND, [...TAIL_A, ...DRIVER_HELD]),
  blink: buildFrame(LEGS_STAND, [...TAIL_A, ...DRIVER_HELD, ...BLINK]),
  cheer: buildFrame(LEGS_STAND, [...TAIL_B, [8, 19, 'P'], [3, 21, 'S'], [4, 21, 'S'], [3, 22, 'S'], [4, 22, 'S'], [0, 21, 'M'], [1, 21, 'M'], [2, 21, 'M'], [0, 23, 'Y'], [1, 23, 'Y']]),
  sad: buildFrame(LEGS_STAND, [...TAIL_B, ...BLINK, [7, 17, 'B'], [8, 17, 'B'], [11, 19, 'S'], [12, 20, 'S'], [13, 21, 'M']]),
  fix1: buildFrame(LEGS_STAND, [...TAIL_A, [10, 19, 'S'], [10, 20, 'S'], [11, 21, 'M'], [12, 22, 'M']]),
  fix2: buildFrame(LEGS_STAND, [...TAIL_A, [10, 19, 'S'], [10, 20, 'S'], [11, 21, 'M'], [12, 21, 'M'], [13, 22, 'Y'], [12, 23, 'Y']]),
};

/** Frame auf ein Canvas malen (optional gespiegelt). */
function drawMouse(canvas, frame = 'idle', flip = false) {
  const ctx = canvas.getContext('2d');
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
  ctx.clearRect(0, 0, W, H);
  const g = FRAMES[frame] || FRAMES.idle;
  const crown = typeof save !== 'undefined' && save.secretCheese > 0;
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
    const ch = crown && r === 0 && (c === 14 || c === 15) ? 'Y' : crown && r === 1 && (c === 14 || c === 15) ? 'Y' : g[r][c];
    const col = MOUSE_PAL[ch];
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
