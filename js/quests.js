'use strict';
/* =========================================================
   Tagesaufgaben: jeden Tag 3 kleine Ziele, die Bonuspunkte
   bringen. Belohnungen identisch in supabase/schema.sql (claim_quest).
   ========================================================= */
const QUEST_DEFS = [
  { id: 'solve2', text: 'Löse 2 Level', stat: 'solve', n: 2, pts: 40 },
  { id: 'solve4', text: 'Löse 4 Level', stat: 'solve', n: 4, pts: 80 },
  { id: 'first1', text: 'Löse ein Level zum ersten Mal', stat: 'first', n: 1, pts: 40 },
  { id: 'nohint2', text: 'Löse 2 Level ohne Hinweis', stat: 'noHint', n: 2, pts: 50 },
  { id: 'three1', text: 'Hol 3 Sterne in einem Level', stat: 'three', n: 1, pts: 30 },
  { id: 'three3', text: 'Hol dreimal 3 Sterne', stat: 'three', n: 3, pts: 70 },
  { id: 'run10', text: 'Führe 10-mal Code aus', stat: 'run', n: 10, pts: 20 },
  { id: 'claude1', text: 'Hol dir Feedback von Claude', stat: 'claude', n: 1, pts: 20 },
  { id: 'project1', text: 'Schließe ein Projekt ab', stat: 'project', n: 1, pts: 100 },
  { id: 'puzzle1', text: 'Löse eine Stufe des Wochenrätsels', stat: 'puzzle', n: 1, pts: 50 },
];

/** Die 3 Aufgaben des Tages – für alle gleich (aus dem Datum berechnet), mit verschiedenen Zielen. */
function todaysQuests(day = dayStr()) {
  const pool = [...QUEST_DEFS], out = [];
  let h = hashStr('quests:' + day);
  while (out.length < 3 && pool.length) {
    const q = pool.splice(h % pool.length, 1)[0];
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
    if (!out.some((o) => o.stat === q.stat)) out.push(q);
  }
  return out;
}
function questState() {
  const day = dayStr();
  if (save.quests.day !== day) save.quests = { day, claimed: [], stats: {} };
  return save.quests;
}

/** Ereignisse aus dem Spiel zählen. */
function questEvent(kind, info = {}) {
  const st = questState().stats;
  const readyIds = () => todaysQuests().filter((q) => !questState().claimed.includes(q.id) && (st[q.stat] || 0) >= q.n).map((q) => q.id);
  const before = readyIds();
  const inc = (k) => { st[k] = (st[k] || 0) + 1; };
  if (kind === 'run') inc('run');
  if (kind === 'claude') inc('claude');
  if (kind === 'puzzle') inc('puzzle');
  if (kind === 'solve') {
    inc('solve');
    if (info.firstTime) inc('first');
    if (info.noHint) inc('noHint');
    if (info.stars === 3) inc('three');
    if (info.project) inc('project');
  }
  persist();
  for (const id of readyIds().filter((x) => !before.includes(x))) {
    const q = QUEST_DEFS.find((x) => x.id === id);
    toast(`🎯 Tagesaufgabe erfüllt: <b>${esc(q.text)}</b>`, [{ label: `+${q.pts} abholen`, primary: true, onClick: () => claimQuest(q.id) }], 7000);
  }
  if (UI.current === 'home') renderQuests();
}

async function claimQuest(id) {
  const q = QUEST_DEFS.find((x) => x.id === id), qs = questState();
  if (!q || qs.claimed.includes(id) || (qs.stats[q.stat] || 0) < q.n) return;
  if (loggedIn()) {
    try {
      const pts = await rpc('claim_quest', { p_day: qs.day, p_quest: id });
      if (!pts) { toast('ℹ️ Schon abgeholt.'); }
      await refreshProfile();
    } catch (e) { toast('❌ ' + esc(e.message)); return; }
  }
  qs.claimed.push(id);
  save.total += q.pts;
  touchDay();
  persist();
  Sound.coin();
  burst(innerWidth / 2, innerHeight / 2, '#ffd966', 30);
  toast(`🪙 +${q.pts} Punkte!`);
  refreshHeader(); checkRankUp();
  if (UI.current === 'home') renderQuests();
}

function renderQuests() {
  const qs = questState();
  $('#questCard').innerHTML = `<h3>🎯 Tagesaufgaben</h3>` + todaysQuests().map((q) => {
    const have = Math.min(qs.stats[q.stat] || 0, q.n), claimed = qs.claimed.includes(q.id), done = have >= q.n;
    return `<div class="quest ${claimed ? 'done' : ''}">
      <div class="qt">${esc(q.text)}<div class="qp">${have}/${q.n} · +${q.pts} Punkte</div></div>
      ${claimed ? '✅' : done ? `<button class="primary sm" data-claim="${q.id}">Abholen</button>` : `<span class="muted small">${Math.round((have / q.n) * 100)} %</span>`}
    </div>`;
  }).join('') + '<div class="muted small">Neue Aufgaben um Mitternacht.</div>';
}
function initQuests() {
  $('#questCard').addEventListener('click', (e) => { const b = e.target.closest('[data-claim]'); if (b) claimQuest(b.dataset.claim); });
}
