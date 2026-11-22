'use strict';
/* =========================================================
   KI-Feedback: baut einen fertigen Text (Prompt) mit Aufgabe,
   Code, Testergebnissen und bisherigem Vorgehen und kopiert ihn
   in die Zwischenablage. Den fügt man in eine KI seiner Wahl ein
   (Claude, ChatGPT, Gemini …). Es werden keine Daten verschickt.
   ========================================================= */
const HISTORY_MAX = 6;

/** Einen Versuch (Ausführen/Prüfen) für den Prompt merken. */
function logAttempt(kind, info) {
  const code = LV.editor?.value ?? '';
  const prev = LV.history[LV.history.length - 1];
  LV.history.push({ kind, time: new Date(), code: prev && prev.code === code ? null : code, ...info });
  if (LV.history.length > HISTORY_MAX) LV.history.shift();
}

const asText = (x) => (Array.isArray(x) ? x.join('\n\n') : String(x || ''));
/** Mini-Markdown aus der App in schlichten Text umwandeln. */
const plain = (s) => asText(s).replace(/\*\*([^*]+)\*\*/g, '$1').trim();
const fence = (code, lang = 'python') => '```' + lang + '\n' + String(code).replace(/\s+$/, '') + '\n```';

function testLine(r, i) {
  const name = r.hidden ? `Versteckter Test ${i + 1}` : (r.label || r.msg || (r.expr ? `Aufruf ${r.expr}` : r.input?.length ? `Ausgabe bei Eingabe ${JSON.stringify(r.input)}` : 'Ausgabe des Programms'));
  let line = `${r.ok ? '✅' : '❌'} ${plain(name)}`;
  if (!r.ok && !r.hidden) {
    if (r.error) line += `\n   Fehler: ${r.error.type}: ${r.error.msg}${r.error.line ? ` (Zeile ${r.error.line})` : ''}`;
    else if ('got' in r) line += `\n   Erwartet:\n${indent(r.expect)}\n   Bekommen:\n${indent(r.got || '(nichts)')}`;
  }
  return line;
}
const indent = (s) => String(s ?? '').replace(/\s+$/, '').split('\n').map((l) => '     ' + l).join('\n');

/** Den kompletten Prompt bauen. */
function buildFeedbackPrompt() {
  const lv = LV.level, info = LEVEL_INDEX[lv.id];
  const task = isProject(lv) ? lv.steps[projStep(lv)].task : lv.task;
  const hints = activeHints(lv).slice(0, LV.hints);
  const res = LV.results;
  const passed = res ? res.filter((r) => r.ok).length : 0;
  const parts = [];

  parts.push(`Du bist ein geduldiger, motivierender Programmier-Tutor. Ich lerne gerade ${info.lang.name} mit einer Lern-App und brauche Feedback zu meiner Lösung.

So hilfst du mir am besten:
- Antworte auf Deutsch, per Du, freundlich und kurz.
- Wenn etwas nicht klappt: Erklär mir, WAS falsch läuft und WARUM, und zeig auf die konkrete Stelle. Verrate mir aber NICHT die komplette Lösung und schreib den korrigierten Code nicht hin – gib mir lieber einen Denkanstoß oder ein kleines, anderes Beispiel.
- Wenn alles klappt: Lob mich kurz und gib mir 1–2 Tipps für schöneren Code.
- Geh auf mein bisheriges Vorgehen ein, falls du daran etwas erkennst (z. B. ein Denkfehler, der sich wiederholt).`);

  parts.push(`## Level
${info.lang.name} · Thema ${info.topic.n} („${info.topic.title}“) · ${isProject(lv) ? `Projekt „${lv.title}“, Schritt ${projStep(lv) + 1} von ${lv.steps.length} („${lv.steps[projStep(lv)].title}“)` : `Level ${levelNo(lv)}: ${lv.title}`}`);

  if (lv.commands?.length) parts.push(`## Befehle, die in diesem Level erklärt werden\n${lv.commands.map(([c, d]) => `- ${c} – ${plain(d)}`).join('\n')}`);
  parts.push(`## Aufgabe\n${plain(task)}`);
  if (/\binput\s*\(/.test(LV.editor.value)) parts.push('Hinweis zur App: Der Text in input("…") zählt beim Prüfen nicht zur Ausgabe – nur die print()-Ausgaben werden verglichen.');

  parts.push(`## Mein aktueller Code\n${fence(LV.editor.value || '# (noch leer)')}`);

  if (res) {
    parts.push(`## Ergebnis der automatischen Tests (${passed} von ${res.length} bestanden)\n${res.map(testLine).join('\n')}`);
  } else {
    parts.push('## Tests\nIch habe meinen Code noch nicht prüfen lassen.');
  }

  const hist = LV.history.slice(0, -1).filter((h) => h.code !== null || h.summary);
  if (LV.history.length) {
    const lines = LV.history.map((h, i) => `${i + 1}. ${h.kind === 'check' ? 'Geprüft' : 'Ausgeführt'}: ${h.summary}`);
    parts.push(`## Mein bisheriges Vorgehen (älteste zuerst)\n${lines.join('\n')}\nInsgesamt ${LV.fails} fehlgeschlagene Prüfung(en) in diesem Level${LV.hints ? `, ${LV.hints} Hinweis(e) angesehen` : ', keine Hinweise angesehen'}${LV.solution ? ', Musterlösung angesehen' : ''}.`);
  }
  const older = hist.filter((h) => h.code !== null).slice(-2);
  if (older.length) {
    parts.push(`## Frühere Versionen meines Codes\n${older.map((h, i) => `Version ${i + 1} (${h.kind === 'check' ? 'geprüft' : 'ausgeführt'}: ${h.summary}):\n${fence(h.code)}`).join('\n\n')}`);
  }
  if (hints.length) parts.push(`## Hinweise, die ich schon gesehen habe\n${hints.map((h) => '- ' + plain(h)).join('\n')}`);

  parts.push('Was läuft bei mir schief – oder was kann ich besser machen?');
  return parts.join('\n\n');
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  // Fallback für ältere Browser / ohne Zwischenablage-Rechte
  const ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
  document.body.appendChild(ta); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  ta.remove();
  return ok;
}

/** Knopf „KI-Feedback“: Prompt bauen, kopieren, Vorschau zeigen. */
async function copyAiPrompt() {
  const box = $('#claudeBox');
  if (!LV.results && LV.editor.value.trim()) {
    // Einmal prüfen, damit die KI die Testergebnisse kennt
    try {
      const { visible, hidden } = activeTests(LV.level);
      const res = await Runner.test(LV.lang, LV.editor.value, [...visible, ...hidden]);
      res.forEach((r, i) => { r.hidden = i >= visible.length; });
      LV.results = res;
    } catch {}
  }
  const text = buildFeedbackPrompt();
  const ok = await copyText(text);
  box.hidden = false;
  box.innerHTML = `<div class="who">🤖 KI-Feedback</div>
    <p>${ok ? '📋 <b>Kopiert!</b> Füg den Text jetzt in eine KI deiner Wahl ein (z. B. Claude, ChatGPT oder Gemini) – sie sieht dann deine Aufgabe, deinen Code, die Testergebnisse und dein bisheriges Vorgehen.' : '⚠️ Kopieren hat nicht geklappt – markier den Text unten und kopier ihn von Hand (Cmd/Strg + C).'}</p>
    <details ${ok ? '' : 'open'}><summary>Text ansehen</summary><textarea class="prompt-preview" readonly spellcheck="false"></textarea></details>`;
  const ta = $('.prompt-preview', box);
  ta.value = text;
  if (!ok) { ta.focus(); ta.select(); }
  box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  if (ok) {
    toast('📋 KI-Prompt kopiert – jetzt einfach in deine KI einfügen!');
    Mascot.say('Frag ruhig die KI – ich schau mit! 🔍');
    questEvent('claude');
  }
}
