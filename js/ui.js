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
  onHeader(() => {
    $('#dayStreak').textContent = currentDayStreak();
    $('#starCount').textContent = totalStars();
    $('#totalScore').textContent = fmt(currentTotal());
    $('#muteBtn').textContent = save.muted ? '🔇' : '🔊';
    $('#muteBtn').title = save.muted ? 'Soundeffekte an' : 'Soundeffekte aus';
  });
}
