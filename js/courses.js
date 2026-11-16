'use strict';
/* =========================================================
   Sprachen & Kurse. Inhalte liegen in content/<sprache>/tNN.js
   und hängen sich über addTopic() hier ein.
   ========================================================= */
const LANGS = [
  { id: 'python', prefix: 'py', name: 'Python', icon: '🐍', color: '#ffd43b', file: 'main.py', blurb: 'Der beste Einstieg: klare Syntax, riesig in Daten, KI und Automatisierung.', ready: true },
  { id: 'javascript', prefix: 'js', name: 'JavaScript', icon: '⚡', color: '#f7df1e', file: 'main.js', blurb: 'Die Sprache des Webs – läuft in jedem Browser.', ready: false },
  { id: 'sql', prefix: 'sql', name: 'SQL', icon: '🗄️', color: '#4dabf7', file: 'query.sql', blurb: 'Daten abfragen, filtern und verknüpfen.', ready: false },
  { id: 'web', prefix: 'web', name: 'HTML & CSS', icon: '🎨', color: '#ff8a5c', file: 'index.html', blurb: 'Webseiten bauen und gestalten.', ready: false },
  { id: 'java', prefix: 'java', name: 'Java', icon: '☕', color: '#e76f51', file: 'Main.java', blurb: 'Objektorientiert, typisiert – Klassiker in Firmen und Android.', ready: false },
];
/** Für Code in Inhalten: Backslashes bleiben erhalten (print("a\nb") bleibt so). */
const code = String.raw;
const COURSES =Object.fromEntries(LANGS.map((l) => [l.id, { lang: l, topics: [] }]));

/** Punkte pro Stern – identisch in supabase/schema.sql (record_levels). */
const POINTS = { level: 30, project: 100 };
const levelPoints = (lv, stars) => (lv.kind === 'project' ? POINTS.project : POINTS.level) * stars;

const LEVEL_INDEX = {}; // id → { level, topic, lang, idx (global in Sprache) }
function addTopic(langId, topic) {
  const c = COURSES[langId];
  c.topics.push(topic);
  c.topics.sort((a, b) => a.n - b.n);
  reindex(langId);
}
function reindex(langId) {
  const c = COURSES[langId];
  let i = 0;
  for (const t of c.topics) for (const lv of t.levels) {
    lv.topic = t.n;
    LEVEL_INDEX[lv.id] = { level: lv, topic: t, lang: c.lang, idx: i++ };
  }
}
const courseLevels = (langId) => COURSES[langId].topics.flatMap((t) => t.levels);
const levelNo = (lv) => (lv.kind === 'project' ? `${lv.topic}-P` : `${lv.topic}-${lv.id.split('-').pop().replace(/^0/, '')}`);

/** Freigeschaltet: erstes Level oder das vorherige hat mind. 1 Stern. */
function isUnlocked(id) {
  const info = LEVEL_INDEX[id];
  if (!info) return false;
  const all = courseLevels(info.lang.id);
  return info.idx === 0 || (save.stars[all[info.idx - 1].id] || 0) >= 1;
}
function nextLevel(id) {
  const info = LEVEL_INDEX[id];
  return courseLevels(info.lang.id)[info.idx + 1] || null;
}
/** Das nächste noch nicht gelöste (freigeschaltete) Level einer Sprache. */
function frontier(langId) {
  const all = courseLevels(langId);
  return all.find((l) => !save.stars[l.id]) || all[all.length - 1] || null;
}
function courseProgress(langId) {
  const all = courseLevels(langId);
  const done = all.filter((l) => save.stars[l.id]).length;
  const stars = all.reduce((a, l) => a + (save.stars[l.id] || 0), 0);
  return { done, total: all.length, stars, maxStars: all.length * 3 };
}
