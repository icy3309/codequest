'use strict';
/* =========== Impressum & Datenschutz (Angaben aus js/config.js) =========== */
function legalHtml(kind) {
  const o = SITE_OWNER, missing = '<i class="muted">(noch nicht eingetragen – siehe js/config.js)</i>';
  if (kind === 'imprint') return `<h3>Impressum</h3>
    <p>Angaben gemäß § 5 DDG:</p>
    <p>${esc(o.name) || missing}<br>${esc(o.street) || missing}<br>${esc(o.city) || missing}</p>
    <p>E-Mail: ${o.email ? `<a href="mailto:${esc(o.email)}">${esc(o.email)}</a>` : missing}</p>
    <p class="muted small">Private, nicht-kommerzielle Lern-Seite.</p>`;
  return `<h3>Datenschutz</h3>
    <p><b>Ohne Anmeldung</b> bleibt alles in deinem Browser (localStorage): Fortschritt, Code-Entwürfe, Einstellungen. Python läuft komplett lokal in deinem Browser (Pyodide, geladen von jsDelivr).</p>
    <p><b>Mit Anmeldung</b> speichern wir bei Supabase (EU-Region empfohlen): E-Mail-Adresse, Spielername, Punkte, gelöste Level, Freundschaften, Rätsel-Lösungen und deinen Fortschritt. Andere Spieler sehen nur Spielername, Rang, Punkte und – während du online bist – was du gerade lernst.</p>
    <p><b>KI-Feedback</b>: Der Knopf „KI-Feedback kopieren“ legt nur einen Text (Aufgabe, dein Code, Testergebnisse, bisherige Versuche) in deine Zwischenablage. Die App schickt dabei nichts an eine KI – du entscheidest selbst, ob und wo du ihn einfügst. Dein Name oder deine E-Mail stehen nicht im Text.</p>
    <p>Du kannst deinen Account samt aller Online-Daten jederzeit im Profil löschen.</p>
    <p>Verantwortlich: ${esc(o.name) || missing}${o.email ? `, ${esc(o.email)}` : ''}</p>`;
}
function initLegal() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-legal]');
    if (!a) return;
    e.preventDefault();
    $('#legalBody').innerHTML = legalHtml(a.dataset.legal);
    openModal('legalModal');
  });
}
