'use strict';
/* =========================================================
   Level-Karte und Level-Ansicht (Lerntext, Aufgabe, Editor,
   Tests, Hinweise, Sterne). Projekte haben mehrere Teilschritte.
   ========================================================= */
const LV = { lang: 'python', level: null, editor: null, hints: 0, fails: 0, solution: false, results: null, busy: false };

/* ---------- Karte ---------- */
function openMap(langId) {
  LV.lang = langId;
  showScreen('map');
}
function renderMap() {
  const c = COURSES[LV.lang], p = courseProgress(LV.lang), cur = frontier(LV.lang);
  $('#mapTitle').innerHTML = `${c.lang.icon} ${esc(c.lang.name)}`;
  $('#mapProgress').innerHTML = `${p.done}/${p.total} gelöst · ⭐ ${p.stars}/${p.maxStars}`;
  $('#mapTopics').innerHTML = c.topics.map((t) => {
    const done = t.levels.filter((l) => save.stars[l.id]).length;
    return `<div class="topic">
      <div class="topic-head"><span class="topic-num">THEMA ${t.n}</span><h3>${esc(t.title)}</h3><span class="muted small">${done}/${t.levels.length} · ${esc(t.desc || '')}</span></div>
      <div class="nodes">${t.levels.map((l) => {
        const open = isUnlocked(l.id), st = save.stars[l.id] || 0;
        return `<button class="node ${l.kind === 'project' ? 'project' : ''} ${cur?.id === l.id ? 'current' : ''}" data-lv="${l.id}" ${open ? '' : 'disabled'}>
          <div class="nn">${l.kind === 'project' ? '🛠 Projekt' : 'Level ' + levelNo(l)}</div>
          <div class="nt">${esc(l.title)}</div>
          ${starsHtml(st)}${open ? '' : '<span class="lock">🔒</span>'}
        </button>`;
      }).join('')}</div></div>`;
  }).join('');
  const node = $('.node.current');
  if (node) setTimeout(() => node.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
}

/* ---------- Level öffnen ---------- */
function openLevel(id) {
  const info = LEVEL_INDEX[id];
  if (!info || !isUnlocked(id)) return;
  LV.lang = info.lang.id;
  LV.level = info.level;
  LV.hints = 0; LV.fails = 0; LV.solution = false; LV.results = null;
  save.lastLevel = id; persist();
  showScreen('level');
  renderLevel();
  setPresenceActivity(`${info.lang.name} · Level ${levelNo(info.level)}`);
  setTimeout(() => Mascot.say(isProject(info.level) ? `Ein Projekt! Ich hab den Schraubendreher bereit 🔧` : `Los geht’s mit „${info.level.title}“! 🐭`, 3500), 400);
  Runner.for(LV.lang).boot?.().catch((e) => consoleShow(`<span class="err-line">${esc(e.message)}</span>`));
}

const isProject = (lv) => lv.kind === 'project';
const projStep = (lv) => Math.min(save.projStep[lv.id] || 0, lv.steps.length - 1);
/** Tests, die gerade gelten: bei Projekten alle Schritte bis zum aktuellen. */
function activeTests(lv) {
  if (!isProject(lv)) return { visible: lv.tests || [], hidden: lv.hidden || [] };
  const cur = projStep(lv);
  let from = 0; // Schritte mit "replaces" ersetzen die Tests der vorherigen (z. B. neue Eingabe-Reihenfolge)
  lv.steps.forEach((s, i) => { if (s.replaces && i <= cur) from = i; });
  const steps = lv.steps.slice(from, cur + 1);
  return { visible: steps.flatMap((s) => s.tests || []), hidden: steps.flatMap((s) => s.hidden || []) };
}
function activeHints(lv) { return isProject(lv) ? lv.steps[projStep(lv)].hints || [] : lv.hints || []; }

function renderLevel() {
  const lv = LV.level, info = LEVEL_INDEX[lv.id];
  $('#lvCrumb').textContent = `${info.lang.name} · Thema ${info.topic.n}: ${info.topic.title}`;
  $('#lvTitle').textContent = (isProject(lv) ? '🛠 Projekt: ' : `Level ${levelNo(lv)}: `) + lv.title;
  $('#lvStars').innerHTML = starsHtml(save.stars[lv.id] || 0);
  $('#edFile').textContent = info.lang.file;

  $('#lvLesson').innerHTML = `
    ${md(lv.lesson)}
    ${lv.commands?.length ? `<h4>Befehle</h4><div class="cmds">${lv.commands.map((c) => `<div class="cmd"><code>${esc(c[0])}</code><span>${inline(c[1])}</span></div>`).join('')}</div>` : ''}
    ${lv.example ? `<h4>Beispiel</h4><pre class="code">${highlight(lv.example.trim())}</pre>${lv.exampleOut ? `<div class="example-out muted">Ausgabe:<pre>${esc(lv.exampleOut.trim())}</pre></div>` : ''}` : ''}`;
  renderTask();

  if (!LV.editor) {
    LV.editor = new CodeEditor($('#editor'), {
      onRun: runCode, onCheck: checkCode,
      onChange: (v) => { save.drafts[LV.level.id] = v; persistDraftSoon(); toggleInputBox(); },
    });
  }
  LV.editor.value = save.drafts[lv.id] ?? lv.starter ?? '';
  toggleInputBox();
  $('#runInputs').value = '';
  consoleShow('<span class="muted">Ausgabe erscheint hier. Tipp: <kbd>Strg</kbd>+<kbd>Enter</kbd> führt aus, <kbd>Strg</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> prüft.</span>');
  $('#results').innerHTML = '';
  $('#hints').innerHTML = '';
  $('#claudeBox').hidden = true;
  updateHelpButtons();
  setTimeout(() => LV.editor.focus(), 60);
}

function renderTask() {
  const lv = LV.level;
  if (!isProject(lv)) { $('#lvTask').innerHTML = `<b>🎯 Aufgabe</b>${md(lv.task)}`; return; }
  const cur = projStep(lv), done = save.projStep[lv.id] || 0;
  $('#lvTask').innerHTML = `
    <div class="steps">${lv.steps.map((s, i) => `<span class="${i < done ? 'ok' : i === cur ? 'on' : ''}">${i < done ? '✓' : i + 1}. ${esc(s.title)}</span>`).join('')}</div>
    <b>🎯 Schritt ${cur + 1} von ${lv.steps.length}: ${esc(lv.steps[cur].title)}</b>${md(lv.steps[cur].task)}`;
}

let draftTimer = 0;
function persistDraftSoon() { clearTimeout(draftTimer); draftTimer = setTimeout(persist, 600); }
function toggleInputBox() { $('#runInputBox').hidden = !/\binput\s*\(/.test(LV.editor?.value || ''); }
function consoleShow(html) { $('#console').innerHTML = html; }
function updateHelpButtons() {
  const hs = activeHints(LV.level);
  $('#btnHint').disabled = LV.hints >= hs.length;
  $('#btnHint').textContent = hs.length ? `💡 Hinweis (${Math.min(LV.hints, hs.length)}/${hs.length})` : '💡 Kein Hinweis';
}

/* ---------- Ausführen ---------- */
async function runCode() {
  if (LV.busy) return;
  LV.busy = true; setBusy(true);
  const inputs = $('#runInputs').value ? $('#runInputs').value.split('\n') : [];
  Mascot.react('fix', Mascot.line('run'), 1400);
  consoleShow(PyRunner.status === 'ready' ? '<span class="info">▶ läuft …</span>' : '<span class="info"><span class="spin">⏳</span> Python wird geladen (nur beim ersten Mal, ca. 5–10 s) …</span>');
  try {
    const r = await Runner.run(LV.lang, LV.editor.value, inputs);
    let html = r.out ? esc(r.out) : (r.error ? '' : '<span class="muted">(keine Ausgabe)</span>');
    if (r.error?.type === 'InputExhausted') html += `<div class="err-box">⌨️ Dein Programm fragt mit <code>input()</code> nach einer Eingabe. Trag sie oben im Feld <b>„Eingaben“</b> ein (eine pro Zeile) und führe erneut aus.</div>`;
    else if (r.error) html += explainError(r.error);
    if (r.error && r.error.type !== 'InputExhausted') Mascot.react('sad', r.error.line ? `Huch! Schau mal in Zeile ${r.error.line} 🔍` : Mascot.line('error'), 2200);
    else if (r.error) Mascot.say('Ich warte auf deine Eingabe ⌨️ – trag sie unten ein!');
    consoleShow(html);
    questEvent('run');
  } catch (e) { consoleShow(runFailText(e)); mascotFail(e); }
  LV.busy = false; setBusy(false);
}
function mascotFail(e) { Mascot.react(e.timeout ? 'dizzy' : 'sad', e.timeout ? Mascot.line('dizzy') : Mascot.line('error'), 2600); }
function runFailText(e) {
  if (e.timeout) return `<div class="err-box">⏱ Dein Programm lief länger als ${RUN_TIMEOUT / 1000} Sekunden und wurde gestoppt. Wahrscheinlich eine <b>Endlosschleife</b> – ändert sich die Bedingung deiner <code>while</code>-Schleife irgendwann?</div>`;
  return `<div class="err-box">${esc(e.message)}</div>`;
}
function setBusy(b) { ['#btnRun', '#btnCheck'].forEach((s) => ($(s).disabled = b)); }

/* ---------- Prüfen ---------- */
async function checkCode() {
  if (LV.busy) return;
  const lv = LV.level;
  LV.busy = true; setBusy(true);
  const { visible, hidden } = activeTests(lv);
  $('#results').innerHTML = `<div class="muted">${PyRunner.status === 'ready' ? '🧪 Prüfe …' : '<span class="spin">⏳</span> Python wird geladen …'}</div>`;
  let res;
  try { res = await Runner.test(LV.lang, LV.editor.value, [...visible, ...hidden]); }
  catch (e) { $('#results').innerHTML = runFailText(e); mascotFail(e); LV.busy = false; setBusy(false); return; }
  LV.busy = false; setBusy(false);
  res.forEach((r, i) => { r.hidden = i >= visible.length; });
  LV.results = res;
  renderResults(res);
  const ok = res.every((r) => r.ok);
  if (!ok) {
    LV.fails++; Sound.fail();
    const passed = res.filter((r) => r.ok).length, err = res.find((r) => r.error)?.error;
    Mascot.react('sad', err?.line ? `Fast! Schau mal in Zeile ${err.line} 🔍` : passed ? `${passed} von ${res.length} Tests grün – ${Mascot.line('fail')}` : Mascot.line('fail'), 2400);
    return;
  }
  Sound.ok();
  if (isProject(lv)) {
    const cur = projStep(lv);
    if (cur < lv.steps.length - 1 && (save.projStep[lv.id] || 0) <= cur) {
      save.projStep[lv.id] = cur + 1; persist();
      LV.hints = 0; updateHelpButtons(); $('#hints').innerHTML = '';
      burst(innerWidth / 2, innerHeight / 3, '#9ce5c9', 30);
      Mascot.react('cheer', 'Schritt geschafft! 🎉 Weiter so!', 2200, true);
      toast(`✅ Schritt ${cur + 1} geschafft! Weiter mit <b>${esc(lv.steps[cur + 1].title)}</b>.`);
      renderTask();
      return;
    }
    save.projStep[lv.id] = lv.steps.length;
  }
  levelSolved();
}

function renderResults(res) {
  const firstErr = res.find((r) => r.error);
  const rows = res.map((r, i) => {
    const title = r.hidden ? `Versteckter Test ${i + 1}` : testTitle(r);
    let body = '';
    if (!r.ok && !r.hidden) {
      if (r.error && r !== firstErr) body = `<div class="muted small">Fehler: ${esc(r.error.type)}</div>`;
      else if (r.msg) body = `<div class="small">${inline(r.msg)}</div>`;
      else if ('got' in r && !r.error) body = `<div class="cmp"><div><span class="muted small">Erwartet</span><pre>${esc(r.expect) || ' '}</pre></div><div><span class="muted small">Dein Ergebnis</span><pre>${esc(r.got) || '(nichts)'}</pre></div></div>`;
    } else if (!r.ok && r.hidden) body = `<div class="muted small">Klappt für andere Werte noch nicht – ist dein Code allgemein genug (keine festen Werte eingetippt)?</div>`;
    return `<div class="test ${r.ok ? 'ok' : 'fail'}"><span>${r.ok ? '✅' : '❌'}</span><div><div>${title}</div>${body}</div></div>`;
  });
  const passed = res.filter((r) => r.ok).length;
  $('#results').innerHTML = `<div class="muted small">${passed}/${res.length} Tests bestanden</div>${rows.join('')}${firstErr ? explainError(firstErr.error) : ''}`;
}
function testTitle(r) {
  if (r.label) return esc(r.label);
  if (r.type === 'src' || r.type === 'nosrc' || r.type === 'assert') return inline(r.msg || 'Code-Prüfung');
  if (r.type === 'eval' || r.type === 'evalout') return `<code>${esc(r.expr)}</code>`;
  if (r.input?.length) return `Ausgabe bei Eingabe <code>${esc(r.input.join(' ⏎ '))}</code>`;
  return 'Ausgabe des Programms';
}

/* ---------- Geschafft ---------- */
function computeStars() {
  if (LV.solution) return 1;
  let s = 3;
  if (LV.hints > 0) s--;
  if (LV.fails >= 4) s--;
  return Math.max(1, s);
}
function levelSolved() {
  const lv = LV.level, stars = computeStars(), before = save.stars[lv.id] || 0;
  const gained = stars > before ? levelPoints(lv, stars) - levelPoints(lv, before) : 0;
  if (stars > before) save.stars[lv.id] = stars;
  save.total += gained;
  touchDay();
  persist();
  recordLevelOnline(lv.id, save.stars[lv.id]);
  questEvent('solve', { stars, noHint: LV.hints === 0 && !LV.solution, project: isProject(lv), firstTime: before === 0 });
  refreshHeader();
  checkRankUp();
  $('#lvStars').innerHTML = starsHtml(save.stars[lv.id]);
  isProject(lv) ? (confetti(), Sound.win()) : (burst(innerWidth / 2, innerHeight / 3, '#ff6fa8', 50), Sound.squeak());
  Mascot.react('cheer', Mascot.line('pass'), 3000);
  const nxt = nextLevel(lv.id);
  const why = stars < 3 ? `<br><span class="small">${LV.solution ? 'Lösung angesehen → 1 Stern.' : [LV.hints ? 'Hinweis genutzt (−1 ★)' : '', LV.fails >= 4 ? 'viele Fehlversuche (−1 ★)' : ''].filter(Boolean).join(' · ')}</span>` : '';
  showDone({
    stars,
    head: isProject(lv) ? '🎉 Projekt abgeschlossen!' : stars === 3 ? 'Perfekt gelöst!' : 'Geschafft!',
    text: `${gained ? `+${fmt(gained)} Punkte` : before >= stars ? 'Schon mit so vielen Sternen gelöst – keine neuen Punkte.' : ''}${why}`,
    actions: [
      { label: 'Feedback von Claude', onClick: () => askClaude() },
      { label: 'Zur Karte', onClick: () => showScreen('map') },
      nxt ? { label: (nxt.kind === 'project' ? 'Zum Projekt' : 'Nächstes Level') + ' →', primary: true, onClick: () => openLevel(nxt.id) }
          : { label: '🏁 Kurs abgeschlossen!', primary: true, onClick: () => showScreen('map') },
    ],
  });
}

/* ---------- Hilfe ---------- */
function showHint() {
  const hs = activeHints(LV.level);
  if (LV.hints >= hs.length) return;
  LV.hints++;
  Mascot.say(Mascot.line('hint'));
  $('#hints').innerHTML = hs.slice(0, LV.hints).map((h, i) => `<div class="hint">💡 <b>Hinweis ${i + 1}:</b> ${md(h).replace(/^<p>|<\/p>$/g, '')}</div>`).join('');
  updateHelpButtons();
}
function showSolution() {
  if (!LV.solution && !confirm('Lösung anzeigen? Dann gibt es für dieses Level höchstens 1 Stern.')) return;
  LV.solution = true;
  const sol = LV.level.solution || '';
  $('#hints').insertAdjacentHTML('beforeend', `<div class="hint">👀 <b>Musterlösung</b> (versuch sie zu verstehen und tipp sie selbst ab):<pre class="code">${highlight(sol.trim())}</pre></div>`);
}

function initLevels() {
  onEnter('map', renderMap);
  $('#mapTopics').addEventListener('click', (e) => { const b = e.target.closest('[data-lv]'); if (b) openLevel(b.dataset.lv); });
  $('#btnRun').onclick = runCode;
  $('#btnCheck').onclick = checkCode;
  $('#btnHint').onclick = showHint;
  $('#btnSolution').onclick = showSolution;
  $('#btnClaude').onclick = () => askClaude();
  $('#btnReset').onclick = () => {
    if (!confirm('Deinen Code durch den Startcode ersetzen?')) return;
    LV.editor.value = LV.level.starter || '';
    delete save.drafts[LV.level.id]; persist(); toggleInputBox();
  };
}
