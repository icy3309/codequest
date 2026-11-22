'use strict';
/* =========== Lokaler Fortschritt (localStorage) =========== */
const SAVE_KEY = 'codequest-v1';
const saveDefaults = () => ({
  stars: {},        // levelId → 1..3
  drafts: {},       // levelId → Code (bleibt nur lokal)
  projStep: {},     // projektId → Anzahl erledigter Teilschritte
  total: 0,         // Punkte im Offline-Modus
  dayStreak: 0, lastDay: null,
  muted: false, music: true, theme: 'mouse', // 'mouse' (hell, rosa) oder 'squirrel' (dunkel, Nachthimmel)
  rankSeen: null, lastLevel: null,
  secretCheese: 0, // Easter-Egg: wie oft Mimis Käseversteck gefunden wurde
  quests: { day: null, claimed: [], stats: {} },
  puzzle: {},       // "2026-W47" → { 1: true, 3: true }
});
const save = (() => {
  try { return Object.assign(saveDefaults(), JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); }
  catch { return saveDefaults(); }
})();

const persist = () => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
  if (typeof cloudSave === 'function') cloudSave(); // Online-Sicherung (net.js), falls eingeloggt
};

function touchDay() {
  const today = dayStr();
  if (save.lastDay === today) return;
  save.dayStreak = save.lastDay === dayStr(1) ? save.dayStreak + 1 : 1;
  save.lastDay = today;
}
const currentDayStreak = () => (save.lastDay === dayStr() || save.lastDay === dayStr(1) ? save.dayStreak : 0);
const totalStars = () => Object.values(save.stars).reduce((a, b) => a + b, 0);

/** Zwei Stände zusammenführen (Cloud + lokal): pro Level das Beste. */
function mergeSave(a, b) {
  const out = { stars: {}, projStep: {}, puzzle: {} };
  for (const k of ['stars', 'projStep']) {
    new Set([...Object.keys(a[k] || {}), ...Object.keys(b[k] || {})]).forEach((i) => { out[k][i] = Math.max(a[k]?.[i] || 0, b[k]?.[i] || 0); });
  }
  new Set([...Object.keys(a.puzzle || {}), ...Object.keys(b.puzzle || {})]).forEach((w) => { out.puzzle[w] = { ...(a.puzzle?.[w] || {}), ...(b.puzzle?.[w] || {}) }; });
  out.total = Math.max(a.total || 0, b.total || 0);
  const newer = (a.lastDay || '') >= (b.lastDay || '') ? a : b;
  out.lastDay = newer.lastDay || null;
  out.dayStreak = newer.dayStreak || 0;
  out.lastLevel = newer.lastLevel || a.lastLevel || b.lastLevel || null;
  return out;
}
const cloudFields = (s) => ({ stars: s.stars, projStep: s.projStep, puzzle: s.puzzle, total: s.total, lastDay: s.lastDay, dayStreak: s.dayStreak, lastLevel: s.lastLevel });
