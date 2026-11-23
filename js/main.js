'use strict';
/* =========== Start: Startseite und alles verdrahten =========== */
function renderHome() {
  const last = save.lastLevel && LEVEL_INDEX[save.lastLevel] ? save.lastLevel : null;
  const lang = last ? LEVEL_INDEX[last].lang.id : 'python';
  const target = last && !save.stars[last] ? LEVEL_INDEX[last].level : frontier(lang);
  const p = courseProgress(lang), info = target && LEVEL_INDEX[target.id];
  $('#continueCard').innerHTML = target ? `
    <h3>${p.done ? '▶ Weitermachen' : '🚀 Los geht\'s'}</h3>
    <p><b>${info.lang.icon} ${esc(info.lang.name)} · ${target.kind === 'project' ? 'Projekt' : 'Level ' + levelNo(target)}</b><br>${esc(target.title)}</p>
    <div class="bar"><div class="bar-fill" style="width:${(p.done / p.total) * 100}%"></div></div>
    <p class="muted small">${p.done}/${p.total} Aufgaben · ⭐ ${p.stars}/${p.maxStars}</p>
    <button class="primary" id="continueBtn">${p.done ? 'Weiter' : 'Erstes Level starten'}</button>` : '';
  $('#continueBtn')?.addEventListener('click', () => { LV.lang = lang; openLevel(target.id); });

  $('#langGrid').innerHTML = LANGS.map((l) => {
    const pr = courseProgress(l.id);
    return `<button class="lang-card" style="--lc:${l.color}" data-lang="${l.id}" ${l.ready ? '' : 'disabled'}>
      ${l.ready ? '' : '<span class="soon">bald</span>'}
      <div class="li">${l.icon}</div><div class="ln">${esc(l.name)}</div>
      <div class="muted small">${esc(l.blurb)}</div>
      ${l.ready ? `<div class="bar"><div class="bar-fill" style="width:${(pr.done / Math.max(1, pr.total)) * 100}%;background:${l.color}"></div></div><div class="muted small">${pr.done}/${pr.total} · ${COURSES[l.id].topics.length} Themen</div>` : ''}
    </button>`;
  }).join('');
  renderQuests();
  renderPuzzleTeaser();
  setPresenceActivity('Startseite');
}

function init() {
  fxInit();
  initUI();
  initRanks();
  initAuthForms();
  initFriends();
  initLeaderboard();
  initQuests();
  initPuzzle();
  initLevels();
  initLexicon();
  initLegal();
  paintStaticMice();
  Mascot.init();
  initMusic();
  initEaster();
  HeroMouse.init();
  onEnter('home', renderHome);
  onEnter('social', () => { renderSocial(true); setPresenceActivity('Freunde & Rangliste'); });
  $('#langGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && !b.disabled) openMap(b.dataset.lang); });

  onNetChange(() => {
    if (loggedIn()) { socialStart(); cloudLoad(); } else socialStop();
    if (NET.user && !NET.profile && NET.ready) openNameModal();
    refreshHeader();
    if (UI.current === 'social') renderSocial();
    if (UI.current === 'puzzle') loadPuzzleBoard();
  });
  netInit();
  showScreen('home');
  if (save.rankSeen == null) { save.rankSeen = rankIndex(currentTotal()); persist(); }
  // Python schon im Hintergrund laden, sobald die Seite steht
  setTimeout(() => PyRunner.boot().catch(() => {}), 1500);
}
init();
