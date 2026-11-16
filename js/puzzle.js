'use strict';
/* =========================================================
   Wochenrätsel: jede Woche ein Rätsel in 3 Stufen. Antworten
   werden online nur vom Server geprüft (submit_puzzle), offline
   lokal gegen den Hash.
   ========================================================= */
const PZ = { tier: 1, editor: null, lb: 'all' };
const TIER_NAMES = { 1: 'Leicht', 2: 'Mittel', 3: 'Schwer' };
const TIER_POINTS = { 1: 100, 2: 200, 3: 400 };

/** Montag der aktuellen Woche (lokal) als "YYYY-MM-DD". */
function weekStart(d = new Date()) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.toLocaleDateString('sv');
}
function weekSlot(week = weekStart()) {
  const n = Math.round((new Date(week) - new Date(PUZZLE_START)) / 6048e5);
  const count = new Set(PUZZLES.map((p) => p.slot)).size;
  return ((n % count) + count) % count;
}
const weekPuzzle = (tier) => PUZZLES.find((p) => p.slot === weekSlot() && p.tier === tier);
const normAnswer = (a) => String(a).replace(/\s+/g, '').toLowerCase();
const solvedTier = (tier) => Boolean(save.puzzle[weekStart()]?.[tier]);

function renderPuzzleTeaser() {
  const done = [1, 2, 3].filter(solvedTier).length;
  $('#puzzleTeaser').innerHTML = `<h3>🧠 Wochenrätsel</h3>
    <p><b>${esc(weekPuzzle(1)?.title || '')}</b> und zwei schwerere Stufen.</p>
    <p class="muted small">${done}/3 Stufen gelöst · bis zu 700 Punkte · ${countdownText()}</p>
    <button class="primary sm" data-go-puzzle>Zum Rätsel</button>`;
  $('[data-go-puzzle]').onclick = () => showScreen('puzzle');
}
function countdownText() {
  const end = new Date(weekStart()); end.setDate(end.getDate() + 7);
  const ms = end - Date.now(), d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
  return `noch ${d} T ${h} Std`;
}

function renderPuzzle() {
  const p = weekPuzzle(PZ.tier);
  $('#pzWeek').textContent = `Woche ab ${new Date(weekStart()).toLocaleDateString('de-DE')}`;
  $('#pzTitle').textContent = '🧠 ' + p.title;
  $('#pzCountdown').textContent = countdownText();
  $('#pzTiers').innerHTML = [1, 2, 3].map((t) => `<button data-tier="${t}" class="${t === PZ.tier ? 'on' : ''}">${solvedTier(t) ? '<span class="ok">✓</span> ' : ''}${TIER_NAMES[t]} · ${TIER_POINTS[t]}</button>`).join('');
  $('#pzText').innerHTML = md(p.story) + (p.data ? `<h4 class="muted">Deine Daten</h4><pre class="code">${esc(p.data)}</pre><button class="ghost sm" id="pzCopy">📋 Daten kopieren</button>` : '');
  $('#pzCopy')?.addEventListener('click', () => navigator.clipboard.writeText(p.data).then(() => toast('📋 Kopiert!')));
  const solved = solvedTier(PZ.tier);
  $('#pzAnswer').disabled = solved;
  $('#pzForm button').disabled = solved;
  $('#pzMsg').textContent = solved ? '✅ Gelöst!' : '';
  if (!PZ.editor) PZ.editor = new CodeEditor($('#pzEditor'), { onRun: runPuzzleCode });
  const key = `pz-${weekStart()}-${PZ.tier}`;
  PZ.editor.onChange = (v) => { save.drafts[key] = v; persistDraftSoon(); };
  PZ.editor.value = save.drafts[key] ?? (p.data ? 'zeilen = daten.split("\\n")\nprint(len(zeilen))\n' : '# Rechne hier\n');
  loadPuzzleBoard();
}

async function runPuzzleCode() {
  const p = weekPuzzle(PZ.tier);
  $('#pzConsole').innerHTML = '<span class="info">▶ läuft …</span>';
  const prelude = `daten = ${JSON.stringify(p.data)}\n`;
  try {
    const r = await Runner.run('python', prelude + PZ.editor.value, []);
    if (r.error?.line) r.error.line -= 1;
    $('#pzConsole').innerHTML = esc(r.out) + (r.error ? explainError(r.error) : '');
  } catch (e) { $('#pzConsole').innerHTML = runFailText(e); }
}

async function submitPuzzle(e) {
  e.preventDefault();
  const tier = PZ.tier, p = weekPuzzle(tier), answer = $('#pzAnswer').value;
  if (!answer.trim()) return;
  const btn = e.submitter; btn.disabled = true;
  try {
    let points = 0, ok;
    if (loggedIn()) {
      const res = await rpc('submit_puzzle', { p_week: weekStart(), p_tier: tier, p_answer: normAnswer(answer) });
      ok = res.ok; points = res.points || 0;
      if (res.wait) { $('#pzMsg').textContent = `⏳ Zu viele Versuche – warte ${res.wait} Sekunden.`; btn.disabled = false; return; }
      if (ok) { await refreshProfile(); if (res.place) toast(`🏅 Platz ${res.place} in dieser Stufe!`); }
    } else {
      // Antworten prüft nur der Server – so lassen sie sich nicht aus dem Code zurückrechnen.
      $('#pzMsg').textContent = SUPABASE_CONFIGURED ? '🔑 Melde dich an – die Antwort wird auf dem Server geprüft.' : '📡 Antworten können nur online geprüft werden.';
      if (SUPABASE_CONFIGURED && NET.ready && !NET.user) openLogin();
      btn.disabled = false;
      return;
    }
    if (!ok) { $('#pzMsg').textContent = '❌ Leider falsch. Prüf deinen Code nochmal!'; Sound.fail(); btn.disabled = false; return; }
    (save.puzzle[weekStart()] ||= {})[tier] = true;
    touchDay(); persist();
    Sound.win(); confetti();
    toast(`🧠 Rätsel gelöst! +${fmt(points)} Punkte`);
    questEvent('puzzle');
    refreshHeader(); checkRankUp();
    renderPuzzle();
  } catch (err) { $('#pzMsg').textContent = '⚠️ ' + err.message; btn.disabled = false; }
}

async function loadPuzzleBoard() {
  const box = $('#pzBoard');
  if (!loggedIn()) { box.innerHTML = `<p class="muted small">${SUPABASE_CONFIGURED ? 'Melde dich an, um in der Wochen-Rangliste zu erscheinen.' : 'Die Rangliste gibt es, sobald der Online-Teil eingerichtet ist.'}</p>`; return; }
  $$('#pzLbSeg button').forEach((b) => b.classList.toggle('on', b.dataset.k === PZ.lb));
  let q = NET.sb.rpc('get_puzzle_leaderboard', { p_week: weekStart() });
  if (PZ.lb === 'friends') { await loadFriends(false); q = q.in('user_id', [NET.user.id, ...SOC.friends.map((f) => f.id)]); }
  const { data, error } = await q;
  if (error) { box.innerHTML = `<p class="muted">Fehler: ${esc(error.message)}</p>`; return; }
  const medal = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
  box.innerHTML = data.length ? `<table class="lb">${data.map((r, i) => `<tr class="${r.user_id === NET.user.id ? 'me' : ''}"><td class="rk">${medal(i)}</td><td>${esc(r.username)}</td><td class="ex">${'★'.repeat(r.tiers)}</td><td class="vl">${fmt(r.points)}</td></tr>`).join('')}</table>`
    : '<p class="muted">Noch niemand hat diese Woche gelöst – sei der Erste!</p>';
}

function initPuzzle() {
  onEnter('puzzle', () => { renderPuzzle(); setPresenceActivity('Wochenrätsel'); });
  $('#pzTiers').addEventListener('click', (e) => { const b = e.target.closest('[data-tier]'); if (b) { PZ.tier = +b.dataset.tier; $('#pzAnswer').value = ''; renderPuzzle(); } });
  $('#pzForm').onsubmit = submitPuzzle;
  $('#pzRun').onclick = runPuzzleCode;
  $('#pzLbSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { PZ.lb = b.dataset.k; loadPuzzleBoard(); } });
}
