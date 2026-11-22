'use strict';
/* =========== Effekte: Partikel, Toasts, kleine Sounds =========== */
const FX = { c: null, ctx: null, parts: [], raf: 0 };
function fxInit() {
  FX.c = $('#fx'); FX.ctx = FX.c.getContext('2d');
  const size = () => { FX.c.width = innerWidth * devicePixelRatio; FX.c.height = innerHeight * devicePixelRatio; };
  size(); addEventListener('resize', size);
}
function burst(x, y, color = '#ff6fa8', n = 30, speed = 7) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random());
    FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, color, s: 2 + Math.random() * 4 });
  }
  if (!FX.raf) FX.raf = requestAnimationFrame(fxTick);
}
function confetti() {
  const cols = ['#ff6fa8', '#ffb3cf', '#ffd966', '#9ce5c9', '#c46bd9'];
  for (let k = 0; k < 6; k++) setTimeout(() => burst(innerWidth * (0.15 + Math.random() * 0.7), innerHeight * (0.25 + Math.random() * 0.3), cols[k % cols.length], 40, 8), k * 140);
}
function fxTick() {
  const { ctx, c } = FX, d = devicePixelRatio;
  ctx.clearRect(0, 0, c.width, c.height);
  FX.parts = FX.parts.filter((p) => p.life > 0);
  for (const p of FX.parts) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.vx *= 0.98; p.life -= 0.016;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * d, p.y * d, p.s * d, p.s * d);
  }
  ctx.globalAlpha = 1;
  FX.raf = FX.parts.length ? requestAnimationFrame(fxTick) : 0;
}

/** Kurze Nachricht unten rechts. actions: [{label, primary, onClick}] */
function toast(html, actions = [], ms = 4500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = html;
  if (actions.length) {
    const box = document.createElement('div'); box.className = 'ta';
    for (const a of actions) {
      const b = document.createElement('button');
      b.className = (a.primary ? 'primary' : 'ghost') + ' sm'; b.textContent = a.label;
      b.onclick = () => { el.remove(); a.onClick(); };
      box.appendChild(b);
    }
    el.appendChild(box);
  }
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), ms);
}

const Sound = {
  ctx: null,
  note(freq, dur, { type = 'sine', vol = 0.05, when = 0, to = 0 } = {}) {
    if (save.muted) return;
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch {}
  },
  ok() { [523, 659, 784].forEach((f, i) => this.note(f, 0.18, { type: 'triangle', when: i * 0.07 })); },
  fail() { this.note(260, 0.25, { type: 'square', vol: 0.03, to: 130 }); },
  win() { this.animal(); [523, 659, 784, 1046, 1318].forEach((f, i) => this.note(f, 0.3, { type: 'triangle', vol: 0.06, when: i * 0.09 })); },
  /** Das Geräusch des aktuellen Maskottchens: Maus piept, Erdhörnchen tschirpt, Capybara pfeift leise und schnurrt. */
  animal() {
    const t = document.documentElement.dataset.theme;
    if (t === 'squirrel') return this.chirp();
    if (t === 'capy') return this.capy();
    return this.squeak();
  },
  chirp() { [0, 0.07, 0.14].forEach((w, i) => this.note(3200 - i * 150, 0.045, { type: 'square', vol: 0.022, when: w, to: 2300 })); },
  capy() {
    this.note(720, 0.16, { type: 'sine', vol: 0.045, to: 980 });
    for (let k = 0; k < 7; k++) this.note(95, 0.045, { type: 'triangle', vol: 0.06, when: 0.18 + k * 0.05 });
  },
  squeak() { this.note(1800, 0.07, { type: 'sine', vol: 0.04, to: 2600 }); this.note(2100, 0.09, { type: 'sine', vol: 0.035, when: 0.09, to: 3000 }); },
  coin() { this.note(988, 0.08, { type: 'square', vol: 0.03 }); this.note(1318, 0.25, { type: 'square', vol: 0.03, when: 0.08 }); },
};
