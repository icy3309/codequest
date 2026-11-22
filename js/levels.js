'use strict';
/* =========================================================
   Level-Karte und Level-Ansicht (Lerntext, Aufgabe, Editor,
   Tests, Hinweise, Sterne). Projekte haben mehrere Teilschritte.
   ========================================================= */
const LV = { history: [], lang: 'python', level: null, editor: null, hints: 0, fails: 0, solution: false, results: null, busy: false };

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
  LV.hints = 0; LV.fails = 0; LV.solution = false; LV.results = null; LV.history = [];
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
      onChange: (v) => { save.drafts[LV.level.id] = v; persistDraftSoon(); },
    });
  }
  LV.editor.value = save.drafts[lv.id] ?? lv.starter ?? '';
  LV.session = null;
  consoleShow('<span class="muted">Ausgabe erscheint hier. Tipp: <kbd>Strg</kbd>+<kbd>Enter</kbd> führt aus, <kbd>Strg</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd> prüft.</span>');
  $('#results').innerHTML = '';
  $('#hints').innerHTML = '';
  $('#claudeBox').hidden = true;
  updateHelpButtons();
  setTimeout(() => LV.editor.focus(), 60);
}

function renderTask() {
  const lv = LV.level;
  if (!isProject(lv)) { $('#lvTask').innerHTML = `<b>🎯 Aufgabe</b>${md(lv.task)}${expectedHtml(lv.tests || [], Boolean(lv.hidden?.length))}`; return; }
  const cur = projStep(lv), done = save.projStep[lv.id] || 0;
  $('#lvTask').innerHTML = `
    <div class="steps">${lv.steps.map((s, i) => `<span class="${i < done ? 'ok' : i === cur ? 'on' : ''}">${i < done ? '✓' : i + 1}. ${esc(s.title)}</span>`).join('')}</div>
    <b>🎯 Schritt ${cur + 1} von ${lv.steps.length}: ${esc(lv.steps[cur].title)}</b>${md(lv.steps[cur].task)}${expectedHtml(lv.steps[cur].tests || [], Boolean(lv.steps[cur].hidden?.length))}`;
}

/** „So soll es aussehen“: zeigt aus den sichtbaren Tests, welches Ergebnis genau erwartet wird. */
function expectedHtml(tests, hidden = false) {
  const inp = (t) => (t.input?.length ? `<div class="exp-in">⌨️ Eingaben: ${t.input.map((x) => `<code>${esc(x) || '(leer)'}</code>`).join(' ⏎ ')}</div>` : '');
  const outs = tests.filter((t) => t.type === 'out' || t.type === 'has').slice(0, 2);
  const evals = tests.filter((t) => t.type === 'eval' || t.type === 'evalout');
  const checks = tests.filter((t) => ['assert', 'src', 'nosrc'].includes(t.type) && t.msg);
  if (!outs.length && !evals.length && !checks.length) return '';
  const parts = [];
  for (const t of outs) {
    parts.push(`<div class="exp-case">${t.label ? `<div class="exp-label">${esc(t.label)}</div>` : ''}${inp(t)}
      <div class="exp-what">${t.type === 'out' ? 'Deine Ausgabe muss <b>genau</b> so aussehen:' : 'In deiner Ausgabe muss <b>genau</b> das vorkommen:'}</div>
      <pre class="exp-out">${esc(t.expect)}</pre></div>`);
  }
  if (evals.length) {
    parts.push(`<div class="exp-case"><div class="exp-what">Deine Funktion wird so aufgerufen und muss Folgendes liefern:</div>
      <ul class="exp-list">${evals.slice(0, 5).map((t) => t.type === 'eval'
        ? `<li><code>${esc(t.expr)}</code> → <code>${esc(t.expect)}</code></li>`
        : `<li><code>${esc(t.expr)}</code> gibt aus: <code>${esc(t.expect)}</code></li>`).join('')}</ul></div>`);
  }
  if (checks.length) parts.push(`<div class="exp-case"><div class="exp-what">Außerdem wird geprüft:</div><ul class="exp-list">${checks.map((t) => `<li>${inline(t.msg)}</li>`).join('')}</ul></div>`);
  return `<details class="expected" open><summary>👀 So soll es aussehen</summary>${parts.join('')}
    <div class="exp-note muted small">Groß-/Kleinschreibung, Satzzeichen und Leerzeichen zählen mit.${hidden ? ' Zusätzlich gibt es versteckte Tests mit anderen Werten – also nichts fest eintippen.' : ''}</div></details>`;
}

let draftTimer = 0;
function persistDraftSoon() { clearTimeout(draftTimer); draftTimer = setTimeout(persist, 600); }
function consoleShow(html) { $('#console').innerHTML = html; }
function updateHelpButtons() {
  const hs = activeHints(LV.level);
  $('#btnHint').disabled = LV.hints >= hs.length;
  $('#btnHint').textContent = hs.length ? `💡 Hinweis (${Math.min(LV.hints, hs.length)}/${hs.length})` : '💡 Kein Hinweis';
}

/* ---------- Ausführen ---------- */
/* ---------- Ausführen – wie in einem echten Terminal ----------
   Fragt das Programm mit input() nach etwas, erscheint die Frage unten
   in der Konsole mit einem Eingabefeld. Nach Enter läuft es weiter.
   (Technisch: Das Programm wird mit allen bisherigen Antworten neu
   gestartet – Ausgaben sind gleich, also wirkt es wie ein Weiterlaufen.) */
async function runCode() {
  if (LV.busy) return;
  LV.session = { id: (LV.session?.id || 0) + 1, inputs: [] };
  Mascot.react('fix', Mascot.line('run'), 1400);
  consoleShow(PyRunner.status === 'ready' ? '<span class="info">▶ läuft …</span>' : '<span class="info"><span class="spin">⏳</span> Python wird geladen (nur beim ersten Mal, ca. 5–10 s) …</span>');
  await runSession(LV.session);
}

async function runSession(ses) {
  LV.busy = true; setBusy(true);
  try {
    const r = await Runner.run(LV.lang, LV.editor.value, ses.inputs, { interactive: true });
    if (ses !== LV.session) return; // inzwischen neu gestartet oder abgebrochen
    if (r.waiting) { renderTerminal(r.out, 'waiting'); return; }
    renderTerminal(r.out, r.error ? 'error' : 'done', r.error);
    LV.session = null;
    if (r.error) Mascot.react('sad', r.error.line ? `Huch! Schau mal in Zeile ${r.error.line} 🔍` : Mascot.line('error'), 2200);
    const firstOut = (r.out || '').trim().split('\n').slice(-3).join(' ⏎ ').slice(0, 160);
    logAttempt('run', { summary: r.error ? `${r.error.type}: ${r.error.msg}${r.error.line ? ` (Zeile ${r.error.line})` : ''}` : `lief ohne Fehler${ses.inputs.length ? ` (Eingaben: ${JSON.stringify(ses.inputs)})` : ''}${firstOut ? `, Ausgabe: ${firstOut}` : ', keine Ausgabe'}` });
    questEvent('run');
  } catch (e) {
    if (ses === LV.session) {
      LV.session = null;
      consoleShow(runFailText(e)); mascotFail(e);
      logAttempt('run', { summary: e.timeout ? 'nach 6 Sekunden abgebrochen (Endlosschleife?)' : e.message });
    }
  } finally {
    LV.busy = false; setBusy(false);
  }
}

/** Konsole zeichnen. state: 'waiting' (Eingabefeld), 'done', 'error'. */
function renderTerminal(out, state, error) {
  const box = $('#console');
  let html = `<span class="term-out">${esc(out)}</span>`;
  if (state === 'waiting') html += '<input class="stdin" type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Eingabe für dein Programm"><div class="term-hint">⌨️ Dein Programm wartet auf eine Eingabe – tippen und <kbd>Enter</kbd> drücken (<kbd>Esc</kbd> bricht ab).</div>';
  else if (state === 'error') html += explainError(error) + '<div class="term-end err">✖ Programm mit Fehler beendet</div>';
  else html += `${out ? '' : '<span class="muted">(keine Ausgabe)</span>'}<div class="term-end">✔ Programm beendet</div>`;
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;
  if (state !== 'waiting') return;
  const inp = $('.stdin', box);
  Mascot.say('Ich warte auf deine Eingabe ⌨️');
  setTimeout(() => { inp.focus({ preventScroll: true }); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 30);
  inp.addEventListener('keydown', (e) => {
    const ses = LV.session;
    if (!ses) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (LV.busy) return;
      const v = inp.value;
      ses.inputs.push(v);
      // Antwort sofort „einfrieren“, dann weiterlaufen lassen
      inp.replaceWith(Object.assign(document.createElement('span'), { className: 'stdin-echo', textContent: v + '\n' }));
      $('.term-hint', box)?.remove();
      runSession(ses);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      stopSession('⏹ Abgebrochen');
    }
  });
}
function stopSession(msg) {
  if (!LV.session) return;
  LV.session = null;
  const box = $('#console'), inp = $('.stdin', box);
  if (inp) { inp.disabled = true; inp.replaceWith(document.createElement('span')); }
  $('.term-hint', box)?.remove();
  box.insertAdjacentHTML('beforeend', `<div class="term-end">${esc(msg)}</div>`);
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
  stopSession('⏹ Beendet – es wird jetzt geprüft');
  const lv = LV.level;
  LV.busy = true; setBusy(true);
  const { visible, hidden } = activeTests(lv);
  $('#results').innerHTML = `<div class="muted">${PyRunner.status === 'ready' ? '🧪 Prüfe …' : '<span class="spin">⏳</span> Python wird geladen …'}</div>`;
  let res;
  try { res = await Runner.test(LV.lang, LV.editor.value, [...visible, ...hidden]); }
  catch (e) { $('#results').innerHTML = runFailText(e); mascotFail(e); logAttempt('check', { summary: e.timeout ? 'nach 6 Sekunden abgebrochen (Endlosschleife?)' : e.message }); LV.busy = false; setBusy(false); return; }
  LV.busy = false; setBusy(false);
  res.forEach((r, i) => { r.hidden = i >= visible.length; });
  LV.results = res;
  renderResults(res);
  const ok = res.every((r) => r.ok);
  { const e1 = res.find((r) => r.error)?.error; logAttempt('check', { summary: `${res.filter((r) => r.ok).length} von ${res.length} Tests bestanden${e1 ? ` – ${e1.type}: ${e1.msg}${e1.line ? ` (Zeile ${e1.line})` : ''}` : ''}` }); }
  if (!ok) {
    const failed = res.filter((r) => !r.ok);
    // Nur Kleinigkeiten (Satzzeichen, Groß/klein, Leerzeichen)? Dann kein Fehlversuch – kostet keinen Stern.
    if (failed.every(isNearMiss)) {
      Mascot.react('fix', 'Fast perfekt! Nur eine Kleinigkeit 🔍', 2400);
      return;
    }
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

/* ---------- Unterschiede erklären ---------- */
// Satzzeichen nur am Wort-/Zeilenende ignorieren (so bleiben 3.5 und -3 unterscheidbar)
const loose = (x) => String(x ?? '').toLowerCase().replace(/[.,!?:;]+(?=\s|$)/g, '').replace(/['"„“”‚‘’]/g, '').replace(/\s+/g, '');
/** Fast richtig? Nur Groß-/Kleinschreibung, Leerzeichen oder Satzzeichen weichen ab. */
function isNearMiss(r) {
  if (r.ok || r.error || !('got' in r) || r.got == null) return false;
  if (!['out', 'has', 'eval', 'evalout'].includes(r.type)) return false;
  const g = loose(r.got), e = loose(r.expect);
  if (!e) return false;
  return r.type === 'has' ? g.includes(e) : g === e;
}
const lines = (x) => String(x ?? '').replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/^\n+|\n+$/g, '').split('\n');
/** Kurze Erklärung, was genau anders ist – und in welcher Zeile. */
function diffInfo(r) {
  const E = lines(r.expect), G = lines(r.got);
  if (!String(r.got ?? '').trim()) return { line: -1, why: 'Dein Programm gibt (noch) nichts aus – fehlt ein <code>print()</code>?' };
  let i = 0;
  if (r.type === 'has') {
    // Wo weicht die Ausgabe vom gesuchten Block ab? Ab der Zeile suchen, in der der Block beginnen müsste.
    const start = G.findIndex((g) => loose(g) === loose(E[0]));
    if (start === -1) return { line: -1, why: `Die Zeile <code>${esc(E[0])}</code> kommt in deiner Ausgabe nicht vor.` };
    while (i < E.length && G[start + i] === E[i]) i++;
    if (i >= E.length) return null;
    return { line: start + i, eline: i, why: explainLine(E[i], G[start + i], i) };
  }
  while (i < Math.max(E.length, G.length) && E[i] === G[i]) i++;
  if (i >= Math.max(E.length, G.length)) return null;
  if (i >= G.length) return { line: -1, eline: i, why: `Es fehlt noch eine Zeile: <code>${esc(E[i])}</code>` };
  if (i >= E.length) return { line: i, why: `Diese Zeile ist zu viel: <code>${esc(G[i])}</code>` };
  return { line: i, eline: i, why: explainLine(E[i], G[i], i) };
}
function explainLine(exp, got, i) {
  const where = `Zeile ${i + 1}`;
  if (got == null) return `${where} fehlt: <code>${esc(exp)}</code>`;
  if (exp.toLowerCase() === got.toLowerCase()) return `${where}: Nur die <b>Groß-/Kleinschreibung</b> ist anders.`;
  if (exp.replace(/\s+/g, '') === got.replace(/\s+/g, '')) return `${where}: Nur die <b>Leerzeichen</b> sind anders (zu viele oder zu wenige).`;
  if (loose(exp) === loose(got)) {
    const eEnd = exp.slice(-1), gEnd = got.slice(-1);
    if (/[.!?:]/.test(eEnd) && eEnd !== gEnd) return `${where}: Am Ende fehlt das Satzzeichen <code>${esc(eEnd)}</code>.`;
    return `${where}: Nur ein <b>Satzzeichen</b> (Punkt, Komma, Ausrufezeichen …) ist anders.`;
  }
  // erstes abweichendes Zeichen
  let k = 0;
  while (k < exp.length && exp[k] === got[k]) k++;
  return `${where} ist ab Zeichen ${k + 1} anders: erwartet <code>${esc(exp.slice(k, k + 20) || '(Zeilenende)')}</code>, bei dir <code>${esc(got.slice(k, k + 20) || '(Zeilenende)')}</code>.`;
}
function markedPre(text, mark) {
  const L = String(text ?? '').replace(/\n+$/, '').split('\n');
  return `<pre>${L.map((l, i) => (i === mark ? `<mark>${esc(l) || ' '}</mark>` : esc(l))).join('\n') || '(nichts)'}</pre>`;
}

function renderResults(res) {
  const firstErr = res.find((r) => r.error);
  const rows = res.map((r, i) => {
    const title = r.hidden ? `Versteckter Test ${i + 1}` : testTitle(r);
    const near = isNearMiss(r);
    let body = '';
    if (!r.ok && !r.hidden) {
      if (r.error && r !== firstErr) body = `<div class="muted small">Fehler: ${esc(r.error.type)}</div>`;
      else if (r.msg) body = `<div class="small">${inline(r.msg)}</div>`;
      else if ('got' in r && !r.error) {
        const d = r.type === 'out' || r.type === 'has' || r.type === 'evalout' ? diffInfo(r) : null;
        body = `${near ? '<div class="near">🤏 <b>Fast perfekt!</b> Nur eine Kleinigkeit ist anders – das zählt nicht als Fehlversuch.</div>' : ''}
          ${d ? `<div class="diff-why">🔍 ${d.why}</div>` : ''}
          <div class="cmp"><div><span class="muted small">Erwartet</span>${markedPre(r.expect, d?.eline ?? -1)}</div><div><span class="muted small">Dein Ergebnis</span>${markedPre(r.got, d?.line ?? -1)}</div></div>`;
      }
    } else if (!r.ok && r.hidden) {
      body = near ? '<div class="near">🤏 Fast! Nur Groß-/Kleinschreibung, Leerzeichen oder Satzzeichen weichen ab.</div>'
        : `<div class="muted small">Klappt für andere Werte noch nicht – ist dein Code allgemein genug (keine festen Werte eingetippt)?</div>`;
    }
    return `<div class="test ${r.ok ? 'ok' : near ? 'nearmiss' : 'fail'}"><span>${r.ok ? '✅' : near ? '🤏' : '❌'}</span><div><div>${title}</div>${body}</div></div>`;
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
      { label: '🤖 KI-Feedback kopieren', onClick: () => copyAiPrompt() },
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
  $('#btnClaude').onclick = () => copyAiPrompt();
  $('#btnReset').onclick = () => {
    if (!confirm('Deinen Code durch den Startcode ersetzen?')) return;
    LV.editor.value = LV.level.starter || '';
    delete save.drafts[LV.level.id]; persist();
  };
}
