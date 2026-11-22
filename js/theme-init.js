'use strict';
/* Lädt im <head>, damit der gewählte Modus (🐭 Maus / 🐿️ Erdhörnchen)
   schon vor dem ersten Zeichnen gilt – kein kurzes rosa Aufblitzen. */
(function () {
  try {
    const s = JSON.parse(localStorage.getItem('codequest-v1') || '{}');
    if (s.theme === 'squirrel') document.documentElement.dataset.theme = 'squirrel';
  } catch {}
})();
