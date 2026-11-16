'use strict';
/* =========================================================
   Ränge: Dropdown in der Kopfleiste und Rang-Aufstieg-Animation.
   (Aus Tastenrausch übernommen, Namen und Schwellen neu.)
   ========================================================= */
const RANKS = [
  [0, 'Babymaus', '🐭', '#b88aa0'],
  [300, 'Krümelsucherin', '🧀', '#e0a21a'],
  [1000, 'Käsedetektivin', '🔍', '#3fa9c9'],
  [2500, 'Schrauber-Maus', '🔧', '#2fb37e'],
  [5000, 'Mäusegenie', '🧠', '#c46bd9'],
  [10000, 'Käse-Architektin', '🏰', '#ff6fa8'],
  [20000, 'Mäusekönigin', '👑', '#e5466f'],
];
const rankIndex = (total) => RANKS.reduce((idx, [min], i) => (total >= min ? i : idx), 0);
const rankFor = (total) => RANKS[rankIndex(total)][1];
const currentTotal = () => (loggedIn() ? Math.max(save.total, NET.profile.total_score) : save.total);

const RANK_DIST = { at: 0, data: null, loading: null, failed: false };
async function loadRankDistribution() {
  if (!NET.sb) return null;
  if (RANK_DIST.data && Date.now() - RANK_DIST.at < 60000) return RANK_DIST.data;
  RANK_DIST.loading ||= NET.sb.rpc('rank_distribution', { p_thresholds: RANKS.map(([m]) => m) })
    .then(({ data, error }) => {
      if (error) throw error;
      const counts = RANKS.map(() => 0);
      for (const r of data || []) { const i = Number(r.rank_idx); if (i >= 0 && i < counts.length) counts[i] = Number(r.players) || 0; }
      Object.assign(RANK_DIST, { data: counts, at: Date.now(), failed: false });
      return counts;
    })
    .catch((e) => { console.warn('Rang-Verteilung:', e.message); RANK_DIST.failed = true; return null; })
    .finally(() => { RANK_DIST.loading = null; });
  return RANK_DIST.loading;
}

function renderRankMenu(dist) {
  const total = currentTotal(), cur = rankIndex(total), next = RANKS[cur + 1];
  const sum = dist ? dist.reduce((a, b) => a + b, 0) : 0;
  const pct = (i) => (sum ? (dist[i] / sum) * 100 : 0);
  const pctText = (i) => (!dist ? (NET.sb && !RANK_DIST.failed ? '…' : '–') : pct(i) === 0 ? '0 %' : pct(i) < 1 ? '< 1 %' : `${Math.round(pct(i))} %`);
  const progress = next ? Math.min(100, ((total - RANKS[cur][0]) / (next[0] - RANKS[cur][0])) * 100) : 100;
  $('#rankMenu').innerHTML = `
    <div class="rm-head"><div class="rm-icon">${RANKS[cur][2]}</div>
      <div><div class="rm-title" style="color:${RANKS[cur][3]}">${esc(RANKS[cur][1])}</div><div class="muted">${fmt(total)} Punkte</div></div></div>
    ${next ? `<div class="rm-next"><div class="bar"><div class="bar-fill" style="width:${progress}%;background:${next[3]}"></div></div>
      Noch <b>${fmt(next[0] - total)} Punkte</b> bis <b style="color:${next[3]}">${next[2]} ${esc(next[1])}</b></div>`
      : '<div class="rm-next"><b>Höchster Rang erreicht – du bist die Mäusekönigin! 👑</b></div>'}
    <ul class="rm-list">${RANKS.map(([min, name, icon, color], i) => `
      <li class="${i === cur ? 'me' : i < cur ? 'done' : ''}" style="--rc:${color}">
        <span>${icon}</span><span class="rm-n"><b>${esc(name)}</b><small>ab ${fmt(min)} Punkten</small></span>
        ${NET.sb ? `<span class="rm-p"><span class="rm-pbar"><span style="width:${dist ? Math.max(pct(i), pct(i) > 0 ? 3 : 0) : 0}%"></span></span>${pctText(i)}</span>` : '<span></span>'}
      </li>`).join('')}</ul>
    <div class="rm-foot">${dist ? `Anteil aller ${fmt(sum)} Spieler je Rang.` : ''}
      <details><summary>So steigst du auf</summary><ul>
        <li><b>Level</b>: ${POINTS.level} Punkte pro Stern, <b>Projekte</b>: ${POINTS.project} pro Stern.</li>
        <li><b>Tagesaufgaben</b> bringen jeden Tag Bonuspunkte.</li>
        <li>Das <b>Wochenrätsel</b> bringt bis zu 700 Punkte – plus Bonus für die Schnellsten.</li>
        <li>Hinweise und Lösung kosten Sterne – selbst knobeln lohnt sich!</li>
      </ul></details></div>`;
}
function toggleRankMenu(force) {
  const menu = $('#rankMenu'), btn = $('#rank');
  const open = force ?? menu.hidden;
  menu.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  if (!open) return;
  renderRankMenu(RANK_DIST.data);
  const r = btn.getBoundingClientRect();
  menu.style.top = r.bottom + 8 + 'px';
  menu.style.left = Math.max(12, Math.min(r.left, innerWidth - menu.offsetWidth - 12)) + 'px';
  loadRankDistribution().then((d) => { if (!menu.hidden && d) renderRankMenu(d); });
}

let rankUpTimer = 0;
function checkRankUp() {
  const idx = rankIndex(currentTotal());
  if (save.rankSeen == null || idx <= save.rankSeen) {
    if (save.rankSeen == null || idx > save.rankSeen) { save.rankSeen = idx; persist(); }
    return;
  }
  save.rankSeen = idx; persist();
  setTimeout(() => showRankUp(idx), 1200);
}
function showRankUp(idx) {
  const el = $('#rankUp'), [, name, icon, color] = RANKS[idx], next = RANKS[idx + 1];
  closeModal('doneModal');
  el.style.setProperty('--rc', color);
  $('#ruIcon').textContent = icon; $('#ruName').textContent = name;
  $('#ruSub').textContent = next ? `Nächster Rang: ${next[1]} ab ${fmt(next[0])} Punkten` : 'Der höchste Rang!';
  el.hidden = false; el.dataset.since = Date.now();
  Sound.win(); confetti();
  clearTimeout(rankUpTimer);
  rankUpTimer = setTimeout(hideRankUp, 5000);
}
function hideRankUp() {
  const el = $('#rankUp');
  if (el.hidden || Date.now() - Number(el.dataset.since || 0) < 600) return;
  clearTimeout(rankUpTimer); el.hidden = true;
}
function initRanks() {
  $('#rank').addEventListener('click', (e) => { e.stopPropagation(); toggleRankMenu(); });
  document.addEventListener('click', (e) => { if (!$('#rankMenu').hidden && !e.target.closest('#rankMenu')) toggleRankMenu(false); });
  addEventListener('resize', () => toggleRankMenu(false));
  $('#rankUp').addEventListener('click', hideRankUp);
  onHeader(() => {
    const i = rankIndex(currentTotal());
    $('#rank').textContent = `${RANKS[i][2]} ${RANKS[i][1]} ▾`;
    $('#rank').style.color = RANKS[i][3];
  });
}
