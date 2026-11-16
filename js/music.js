'use strict';
/* =========================================================
   „Käsekrümel-Café“ – ein Lofi-Song, live im Browser erzeugt
   (WebAudio, keine Audiodateien). ~76 BPM, ca. 2:45 lang, läuft
   in Schleife. Ab und zu quietscht Mimi mit. 🐭🎶
   Ein/aus über den 🎵-Knopf oben (save.music).
   ========================================================= */
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

// Akkorde: Bass-Grundton + Rhodes-Voicing (ohne Grundton, schön jazzig)
const CH = {
  Fmaj9: { b: 41, k: [57, 60, 64, 67] },
  Em9: { b: 40, k: [55, 59, 62, 66] },
  Dm9: { b: 38, k: [53, 57, 60, 64] },
  Cmaj7: { b: 36, k: [52, 55, 59, 62] },
  Am9: { b: 45, k: [55, 60, 64, 71] },
  G13: { b: 43, k: [53, 57, 59, 64] },
  Cmaj9: { b: 36, k: [52, 55, 59, 62] },
  Bbmaj7: { b: 46, k: [53, 57, 58, 62] },
  Am7: { b: 45, k: [55, 57, 60, 64] },
  Gm7: { b: 43, k: [53, 55, 58, 62] },
  C7sus: { b: 36, k: [53, 55, 58, 62] },
};
const PROG = {
  A: ['Fmaj9', 'Em9', 'Dm9', 'Cmaj7'],
  B: ['Am9', 'Dm9', 'G13', 'Cmaj9'],
  BR: ['Bbmaj7', 'Am7', 'Gm7', 'C7sus'],
};
// Aufbau des Songs: jede Zeile = ein Teil (Akkordfolge × Wiederholungen + Instrumente)
const SONG = [
  { name: 'Intro', prog: 'A', reps: 1, keys: 1, bass: 0, drums: 0, hats: 0, mel: 0 },
  { name: 'Strophe 1', prog: 'A', reps: 2, keys: 1, bass: 1, drums: 1, hats: 1, mel: 0 },
  { name: 'Strophe 2', prog: 'A', reps: 2, keys: 1, bass: 1, drums: 1, hats: 1, mel: 11 },
  { name: 'Refrain', prog: 'B', reps: 2, keys: 1, bass: 1, drums: 1, hats: 2, mel: 23 },
  { name: 'Bridge', prog: 'BR', reps: 1, keys: 1, bass: 1, drums: 0, hats: 1, mel: 0 },
  { name: 'Refrain 2', prog: 'B', reps: 2, keys: 1, bass: 1, drums: 1, hats: 2, mel: 37 },
  { name: 'Strophe 3', prog: 'A', reps: 2, keys: 1, bass: 1, drums: 1, hats: 1, mel: 52 },
  { name: 'Outro', prog: 'A', reps: 1, keys: 1, bass: 0, drums: 0, hats: 0, mel: 0, fade: 1 },
];
const BARS = SONG.flatMap((s) => {
  const bars = [];
  for (let r = 0; r < s.reps; r++) PROG[s.prog].forEach((c, i) => bars.push({ ...s, chord: CH[c], barInPart: r * 4 + i, partBars: s.reps * 4 }));
  return bars;
});
const PENTA = [72, 74, 76, 79, 81, 84, 86];

/** Kleiner deterministischer Zufall, damit Melodien bei jedem Durchlauf gleich klingen. */
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296; }

const Music = {
  ctx: null, out: null, keysBus: null, noiseBuf: null, crackle: null,
  playing: false, timer: 0, step: 0, nextTime: 0, bpm: 76, mel: {},

  get stepDur() { return 60 / this.bpm / 4; },

  init() {
    if (this.ctx) return;
    const c = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const warm = c.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 3200; warm.Q.value = 0.4;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    this.out = c.createGain(); this.out.gain.value = 0;
    this.out.connect(warm).connect(comp).connect(c.destination);
    // Leichtes „Leiern“ wie bei einer alten Kassette
    this.keysBus = c.createGain(); this.keysBus.gain.value = 0.9;
    const keysLp = c.createBiquadFilter(); keysLp.type = 'lowpass'; keysLp.frequency.value = 1900;
    this.keysBus.connect(keysLp).connect(this.out);
    this.noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  },

  start() {
    if (this.playing) return;
    try { this.init(); } catch { return; }
    this.ctx.resume();
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.out.gain.cancelScheduledValues(this.ctx.currentTime);
    this.out.gain.setTargetAtTime(0.55, this.ctx.currentTime, 0.8);
    this.startCrackle();
    this.timer = setInterval(() => this.schedule(), 50);
  },
  stop() {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    const t = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(t);
    this.out.gain.setTargetAtTime(0, t, 0.25);
    setTimeout(() => { if (!this.playing) { this.crackle?.stop(); this.crackle = null; this.ctx.suspend(); } }, 1200);
  },
  toggle() {
    save.music = !save.music; persist();
    save.music ? this.start() : this.stop();
    refreshHeader();
  },

  /** Noten bis kurz in die Zukunft planen (läuft alle 50 ms). */
  schedule() {
    while (this.nextTime < this.ctx.currentTime + 0.2) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += this.stepDur;
      this.step = (this.step + 1) % (BARS.length * 16);
    }
  },

  playStep(step, t) {
    const bar = BARS[Math.floor(step / 16)], s = step % 16;
    const swing = s % 2 ? this.stepDur * 0.18 : 0; // lässiger Swing
    t += swing;
    let vol = 1;
    if (bar.fade) vol = 1 - (bar.barInPart * 16 + s) / (bar.partBars * 16);
    if (step < 32) vol = Math.min(1, 0.4 + step / 50); // sanft einblenden

    if (bar.keys) {
      if (s === 0) this.chord(bar.chord.k, t, this.stepDur * 14, 0.11 * vol);
      if (s === 10 && bar.barInPart % 2 === 1) this.chord(bar.chord.k.slice(1), t, this.stepDur * 6, 0.07 * vol);
    }
    if (bar.bass) {
      if (s === 0) this.bass(bar.chord.b, t, this.stepDur * 7, 0.32 * vol);
      if (s === 10) this.bass(bar.chord.b + 7, t, this.stepDur * 4, 0.22 * vol);
      if (s === 14 && bar.barInPart % 4 === 3) this.bass(bar.chord.b + 12, t, this.stepDur * 2, 0.18 * vol);
    }
    if (bar.drums) {
      if (s === 0 || s === 10 || (s === 7 && bar.barInPart % 2)) this.kick(t, 0.5 * vol);
      if (s === 4 || s === 12) this.snare(t, 0.16 * vol);
    }
    if (bar.hats && s % 2 === 0) this.hat(t, (s % 4 === 2 ? 0.05 : 0.03) * vol);
    if (bar.hats === 2 && s % 2 === 1 && (step * 7) % 5 === 0) this.hat(t, 0.02 * vol);
    if (bar.mel) this.melodyStep(bar, s, t, vol);
    // Mimi quietscht ab und zu mit 🐭
    if (s === 6 && bar.barInPart % 8 === 5 && bar.drums) this.squeak(t, 0.05 * vol);
  },

  melodyStep(bar, s, t, vol) {
    const key = bar.mel * 100 + bar.barInPart;
    if (!this.mel[key]) {
      const r = rng(key * 7919), notes = [];
      let idx = Math.floor(r() * 4);
      for (let i = 0; i < 16; i += 2) {
        if (r() < (i === 0 ? 0.7 : 0.38)) {
          idx = Math.max(0, Math.min(PENTA.length - 1, idx + Math.floor(r() * 5) - 2));
          notes.push({ s: i, m: PENTA[idx], len: 2 + Math.floor(r() * 3) * 2 });
        }
      }
      this.mel[key] = notes;
    }
    for (const n of this.mel[key]) if (n.s === s) this.bell(n.m, t, this.stepDur * n.len, 0.06 * vol);
  },

  /* ---------- Instrumente ---------- */
  voice(freq, t, dur, vol, { type = 'sine', dest = this.out, attack = 0.01, detune = 0 } = {}) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(vol * 0.45, t + attack + 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  },
  chord(notes, t, dur, vol) {
    notes.forEach((m, i) => {
      const st = t + i * 0.018; // leicht „gestrummt“
      this.voice(mtof(m), st, dur, vol, { dest: this.keysBus, detune: (Math.random() - 0.5) * 8 });
      this.voice(mtof(m) * 2, st, dur * 0.5, vol * 0.18, { type: 'triangle', dest: this.keysBus });
    });
  },
  bass(m, t, dur, vol) { this.voice(mtof(m), t, dur, vol, { type: 'triangle', attack: 0.02 }); },
  bell(m, t, dur, vol) {
    this.voice(mtof(m), t, dur, vol, { type: 'sine', attack: 0.005 });
    this.voice(mtof(m) * 3, t, dur * 0.3, vol * 0.12, { type: 'sine', attack: 0.005 });
  },
  kick(t, vol) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    o.connect(g).connect(this.out); o.start(t); o.stop(t + 0.4);
  },
  noise(t, dur, vol, { type = 'bandpass', freq = 1800, q = 0.8 } = {}) {
    const c = this.ctx, src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = this.noiseBuf; src.playbackRate.value = 0.8 + Math.random() * 0.4;
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.out);
    src.start(t, Math.random()); src.stop(t + dur + 0.05);
  },
  snare(t, vol) { this.noise(t, 0.22, vol, { freq: 1600, q: 0.7 }); this.voice(190, t, 0.12, vol * 0.5, { type: 'triangle', attack: 0.002 }); },
  hat(t, vol) { this.noise(t, 0.05, vol, { type: 'highpass', freq: 7000, q: 0.5 }); },
  squeak(t, vol) {
    const c = this.ctx;
    [[1900, 2700, 0], [2200, 3100, 0.11]].forEach(([a, b, dt]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(a, t + dt); o.frequency.exponentialRampToValueAtTime(b, t + dt + 0.07);
      g.gain.setValueAtTime(0.0001, t + dt); g.gain.linearRampToValueAtTime(vol, t + dt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.09);
      o.connect(g).connect(this.out); o.start(t + dt); o.stop(t + dt + 0.12);
    });
    // Mimi zeigt, dass sie mitsingt
    const delay = Math.max(0, (t - c.currentTime) * 1000);
    setTimeout(() => { if (this.playing && typeof Mascot !== 'undefined') Mascot.sing?.(); }, delay);
  },
  /** Leises Vinyl-Knistern im Hintergrund. */
  startCrackle() {
    if (this.crackle) return;
    const c = this.ctx, len = c.sampleRate * 3, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : 0) + (Math.random() * 2 - 1) * 0.012;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 2500; f.Q.value = 0.5; g.gain.value = 0.35;
    src.connect(f).connect(g).connect(this.out); src.start();
    this.crackle = src;
  },
};

function initMusic() {
  const btn = $('#musicBtn');
  btn.onclick = (e) => { e.stopPropagation(); Music.toggle(); };
  onHeader(() => {
    btn.textContent = '🎵';
    btn.title = save.music ? 'Musik aus' : 'Musik an';
    btn.classList.toggle('off', !save.music);
  });
  // Browser erlauben Ton erst nach einer Interaktion → beim ersten Klick/Tastendruck starten
  const kick = () => {
    removeEventListener('pointerdown', kick); removeEventListener('keydown', kick);
    if (save.music) Music.start();
  };
  addEventListener('pointerdown', kick); addEventListener('keydown', kick);
  // Im Hintergrund pausieren (spart Akku, vermeidet Holpern)
  document.addEventListener('visibilitychange', () => {
    if (!Music.ctx || !save.music) return;
    if (document.hidden) Music.ctx.suspend(); else if (Music.playing) Music.ctx.resume();
  });
}
