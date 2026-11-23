'use strict';
/* =========================================================
   📖 Lexikon: kleines Pixel-Buch am rechten Rand. Öffnet ein Seitenfenster
   mit allen Befehlen aus schon gelösten Levels, nach Thema sortiert.
   Ein Klick auf einen Befehl klappt Erklärung, Syntax und Beispiel auf.
   Daten: js/lexicon-data.js
   ========================================================= */
const LEX = { open: false, expanded: null };

/* Pixel-Buch 16×16: o = Umriss, d = Buchrücken, c = Einband, g = Etikett, p = Seiten, r = Lesezeichen */
const LEX_BOOK = [
  '.ooooooooooooooo',
  '.odcccccccccccco',
  '.odcccccccccccco',
  '.odccgggggggccco',
  '.odccgooooogccco',
  '.odccgggggggccco',
  '.odcccccccccccco',
  '.odcccccccccccco',
  '.odcccccccccccco',
  '.odcccccccccccco',
  '.odcccccccccccco',
  '.odoooooooooooo.',
  '.odpppppppppprpo',
  '.ooooooooooooroo',
  '.............r..',
  '................',
];
function lexBookSvg() {
  let rects = '';
  LEX_BOOK.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') rects += `<rect class="px-${ch}" x="${x}" y="${y}" width="1" height="1"/>`;
  }));
  return `<svg class="lex-book" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

function lexEntries(langId = 'python') {
  const topics = COURSES[langId]?.topics || [];
  return (LEXICON[langId] || []).map((g) => ({
    topic: topics.find((t) => t.n === g.n),
    items: g.items.map((it, i) => ({ ...it, key: `${g.n}-${i}`, known: (save.stars[it.from] || 0) >= 1 })),
  }));
}

function renderLexicon() {
  const groups = lexEntries(LV.lang || 'python');
  const all = groups.flatMap((g) => g.items);
  const known = all.filter((it) => it.known).length;
  $('#lexCount').textContent = known ? `${known} von ${all.length} Befehlen entdeckt` : '';
  const body = groups.filter((g) => g.items.some((it) => it.known)).map((g) => `
    <section class="lex-topic">
      <h4><span class="topic-num">${g.topic ? 'THEMA ' + g.topic.n : ''}</span> ${esc(g.topic?.title || '')}</h4>
      ${g.items.filter((it) => it.known).map((it) => {
        const open = LEX.expanded === it.key;
        const lv = LEVEL_INDEX[it.from]?.level;
        return `<div class="lex-item${open ? ' open' : ''}">
          <button class="lex-name" data-lex="${it.key}" aria-expanded="${open}"><code>${esc(it.name)}</code><span class="lex-chev" aria-hidden="true">›</span></button>
          ${open ? `<div class="lex-detail">
            <p>${inline(it.desc)}</p>
            <div class="lex-label">Syntax</div><pre class="code">${highlight(it.syntax)}</pre>
            <div class="lex-label">Beispiel</div><pre class="code">${highlight(it.ex)}</pre>
            ${it.out ? `<div class="lex-label">Ausgabe</div><pre class="code lex-out">${esc(it.out)}</pre>` : ''}
            ${lv ? `<div class="muted small">📍 Gelernt in ${lv.kind === 'project' ? 'Projekt' : 'Level'} ${levelNo(lv)}: ${esc(lv.title)}</div>` : ''}
          </div>` : ''}
        </div>`;
      }).join('')}
    </section>`).join('');
  const left = all.length - known;
  $('#lexBody').innerHTML = (body || `<p class="lex-empty">Noch leer! Löse dein erstes Level – dann landet jeder neue Befehl hier zum Nachschlagen.</p>`)
    + (left && known ? `<p class="muted small lex-more">🔒 Noch ${left} Befehle zu entdecken</p>` : '');
}

function setLexicon(open) {
  LEX.open = open;
  const el = $('#lexicon');
  el.classList.toggle('open', open);
  $('#lexPanel').inert = !open;
  $('#lexToggle').setAttribute('aria-expanded', open);
  $('#lexToggle').title = open ? 'Lexikon schließen' : 'Lexikon – schon gelernte Befehle nachschlagen';
  if (open) renderLexicon();
  Sound.note(open ? 700 : 520, 0.06, { type: 'triangle', vol: 0.03, to: open ? 900 : 420 });
}

function initLexicon() {
  $('#lexToggle').innerHTML = lexBookSvg();
  $('#lexToggle').onclick = () => setLexicon(!LEX.open);
  $('#lexClose').onclick = () => { setLexicon(false); $('#lexToggle').focus(); };
  $('#lexPanel').inert = true;
  $('#lexBody').addEventListener('click', (e) => {
    const b = e.target.closest('[data-lex]');
    if (!b) return;
    LEX.expanded = LEX.expanded === b.dataset.lex ? null : b.dataset.lex;
    renderLexicon();
    $(`[data-lex="${LEX.expanded || b.dataset.lex}"]`)?.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && LEX.open && !$('.modal.show')) setLexicon(false);
  }, true); // vor ui.js, damit Esc erst ein offenes Modal schließt
  // Neue Sterne → offenes Lexikon gleich aktualisieren
  onHeader(() => { if (LEX.open) renderLexicon(); });
}
