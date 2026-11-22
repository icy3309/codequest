'use strict';
/* =========================================================
   Easter-Egg: das geheime Versteck des Maskottchens
   (🐭 Käseversteck · 🐿️ Nussversteck · 🍊 Orangen-Oase).
   Auslöser auf der Startseite:
   - das große Maskottchen 7× schnell hintereinander anklicken, oder
   - das Tier-Wort tippen: „piep“ (Maus), „nuss“ (Erdhörnchen), „capy“ (Capybara).
   Belohnung: Regen aus Käse/Nüssen/Orangen, Tanz, Melodie – danach
   Krönchen (bzw. goldene Orange beim Capybara). Texte: js/flavor.js
   ========================================================= */
const EGG = { clicks: 0, lastClick: 0, typed: '', busy: false };

function eggPop(text, x, y) {
  const el = document.createElement('div');
  el.className = 'egg-pop';
  el.textContent = text;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function cheeseParty() {
  if (EGG.busy) return;
  EGG.busy = true;
  save.secretCheese = (save.secretCheese || 0) + 1;
  persist();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Regen aus Käse / Nüssen / Orangen
  const items = flavor().egg.rain;
  const n = reduce ? 12 : 42;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.className = 'cheese-drop';
    s.textContent = items[i % items.length];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = 18 + Math.random() * 22 + 'px';
    s.style.animationDuration = 2.2 + Math.random() * 2 + 's';
    s.style.animationDelay = Math.random() * 1.2 + 's';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 5000);
  }
  // Das Maskottchen tanzt
  const hero = $('.hero-mouse');
  hero?.classList.add('party');
  if (hero) {
    let f = 0;
    const dance = setInterval(() => { drawMouse(hero, ['cheer', 'idle', 'cheer', 'blink'][f++ % 4], f % 2 === 0); }, 220);
    setTimeout(() => { clearInterval(dance); hero.classList.remove('party'); drawMouse(hero, 'cheer'); EGG.busy = false; }, 3600);
  } else EGG.busy = false;
  // Kleine Tier-Melodie (Soundeffekt, folgt dem 🔊-Schalter)
  const theme = document.documentElement.dataset.theme;
  if (theme === 'capy') [392, 523, 659, 523, 784].forEach((f, i) => Sound.note(f, 0.22, { type: 'triangle', vol: 0.06, when: i * 0.16 }));
  else if (theme === 'squirrel') [2637, 2349, 2637, 3136, 2637, 3520].forEach((f, i) => Sound.note(f, 0.06, { type: 'square', vol: 0.02, when: i * 0.08, to: f * 0.8 }));
  else [1568, 1760, 2093, 1760, 2349, 2637].forEach((f, i) => Sound.note(f, 0.12, { type: 'sine', vol: 0.045, when: i * 0.11, to: f * 1.25 }));
  setTimeout(() => Sound.animal(), 900);
  confetti();
  const first = save.secretCheese === 1;
  toast(first ? flavor().egg.first : flavor().egg.again(save.secretCheese), [], 7000);
  renderEggBadge();
}

function renderEggBadge() {
  const box = $('#eggBadge');
  if (!box) return;
  const n = save.secretCheese || 0;
  box.hidden = !n;
  box.textContent = n ? `${flavor().egg.badge}${n > 1 ? ` ×${n}` : ''}` : '';
}

function initEaster() {
  const hero = $('.hero-mouse');
  if (hero) {
    hero.style.cursor = 'pointer';
    hero.addEventListener('click', (e) => {
      const now = Date.now();
      EGG.clicks = now - EGG.lastClick < 900 ? EGG.clicks + 1 : 1;
      EGG.lastClick = now;
      Sound.animal();
      hero.classList.remove('boop'); void hero.offsetWidth; hero.classList.add('boop');
      if (EGG.clicks >= 7) { EGG.clicks = 0; cheeseParty(); }
      else if (EGG.clicks >= 2) eggPop(flavor().egg.hints[(EGG.clicks - 2) % flavor().egg.hints.length], e.clientX, e.clientY - 20);
    });
  }
  // Tier-Wort tippen (nur auf der Startseite und nicht in Eingabefeldern)
  document.addEventListener('keydown', (e) => {
    if (UI.current !== 'home' || e.target.closest?.('input, textarea, [contenteditable]') || e.key.length !== 1) return;
    const word = flavor().egg.word;
    EGG.typed = (EGG.typed + e.key.toLowerCase()).slice(-word.length);
    if (EGG.typed === word) { EGG.typed = ''; cheeseParty(); }
  });
  renderEggBadge();
}
