'use strict';
/* =========== Navigation, Kopfleiste, Modals =========== */
const UI = { current: 'home', enterHooks: {}, headerFns: [], back: { map: 'home', level: 'map', puzzle: 'home', social: 'home' } };

function onEnter(id, fn) { UI.enterHooks[id] = fn; }
function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  UI.current = id;
  document.body.dataset.screen = id;
  UI.enterHooks[id]?.();
  refreshHeader();
  window.scrollTo(0, 0);
}
function goBack() { showScreen(UI.back[UI.current] || 'home'); }
function onHeader(fn) { UI.headerFns.push(fn); }
function refreshHeader() { UI.headerFns.forEach((f) => f()); }

function openModal(id) { $('#' + id).classList.add('show'); setTimeout(() => $('#' + id).querySelector('input')?.focus(), 50); }
function closeModal(id) { $('#' + id).classList.remove('show'); }

/** Ergebnis-Fenster nach bestandenem Level. */
function showDone({ stars, head, text, actions }) {
  $('#doneStars').innerHTML = [0, 1, 2].map((i) => `<span class="${i < stars ? 'on' : ''}" style="animation-delay:${0.15 + i * 0.2}s">★</span>`).join('');
  $('#doneHead').textContent = head;
  $('#doneText').innerHTML = text;
  const box = $('#doneActions'); box.innerHTML = '';
  for (const a of actions) {
    const b = document.createElement('button');
    b.className = a.primary ? 'primary' : 'ghost';
    b.textContent = a.label;
    b.onclick = () => { closeModal('doneModal'); a.onClick(); };
    box.appendChild(b);
  }
  openModal('doneModal');
  setTimeout(() => box.querySelector('.primary')?.focus(), 80);
}

function initUI() {
  $$('[data-back]').forEach((b) => (b.onclick = goBack));
  $$('[data-go]').forEach((b) => (b.onclick = () => showScreen(b.dataset.go)));
  $('#logo').onclick = () => showScreen('home');
  $$('[data-close]').forEach((b) => (b.onclick = () => b.closest('.modal').classList.remove('show')));
  $$('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m && m.dataset.closable !== 'false') m.classList.remove('show'); }));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $('.modal.show');
    if (open && open.dataset.closable !== 'false') open.classList.remove('show');
  });
  $('#muteBtn').onclick = () => { save.muted = !save.muted; persist(); refreshHeader(); };
  // 🐭 / 🐿️ / 🍊 Modus-Schalter
  $('#themeSeg').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-theme]');
    if (b && b.dataset.theme !== save.theme) setTheme(b.dataset.theme, true);
  });
  setTheme(save.theme || 'mouse', false);
  onHeader(() => {
    $('#dayStreak').textContent = currentDayStreak();
    $('#starCount').textContent = totalStars();
    $('#totalScore').textContent = fmt(currentTotal());
    $('#muteBtn').textContent = save.muted ? '🔇' : '🔊';
    $('#muteBtn').title = save.muted ? 'Soundeffekte an' : 'Soundeffekte aus';
  });
}

/* ---------- Modi: Farben, Maskottchen, Titel ---------- */
const THEME_INFO = {
  mouse: { title: 'Mause Quest', logo: 'MAUSE <span>QUEST</span>', icon: '🐭', hello: 'Guten Morgen! ☀️🐭' },
  squirrel: { title: 'Gurt Quest', logo: 'GURT <span>QUEST</span>', icon: '🐿️', hello: 'Nachtschicht! 🌙🐿️' },
  capy: { title: 'CapyQuest', logo: 'CAPY<span>QUEST</span>', icon: '🍊', hello: 'Ab in den Teich! 🍊💦' },
};
function setTheme(theme, announce) {
  if (!THEME_INFO[theme]) theme = 'mouse';
  save.theme = theme;
  persist();
  applyThemeEarly(theme); // data-theme + Teich-Kachel (theme-init.js)
  const info = THEME_INFO[theme];
  $('#logoText').innerHTML = info.logo;
  document.title = `${info.title} – Programmieren lernen`;
  const fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${info.icon}</text></svg>`);
  $$('#themeSeg button').forEach((b, i) => {
    const on = b.dataset.theme === theme;
    b.classList.toggle('on', on);
    b.setAttribute('aria-checked', String(on));
    if (on) $('#themeSeg').style.setProperty('--ti', i);
  });
  if (typeof paintStaticMice === 'function') paintStaticMice();
  if (announce && typeof Mascot !== 'undefined' && Mascot.lane?.offsetParent) Mascot.say(info.hello);
}
