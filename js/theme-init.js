'use strict';
/* =========================================================
   Lädt im <head>: setzt den gespeicherten Modus schon vor dem
   ersten Zeichnen (kein Aufblitzen) und malt für den Capybara-
   Modus einen Seerosenteich in Pixelart als Hintergrund-Kachel.
   Modi: 'mouse' (🐭 hell/rosa), 'squirrel' (🐿️ Nachthimmel), 'capy' (🍊 Teich)
   ========================================================= */
const THEMES = ['mouse', 'squirrel', 'capy'];

/** Pixel-Teich-Kachel (64×64, wird per CSS 4× vergrößert und gekachelt). */
function makePondTile() {
  const S = 64, c = document.createElement('canvas');
  c.width = S; c.height = S;
  const g = c.getContext('2d');
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(((x % S) + S) % S, ((y % S) + S) % S, 1, 1); };
  // Wasser mit etwas tieferen Stellen
  g.fillStyle = '#6cc3ea'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 70; i++) { const x = rnd() * S | 0, y = rnd() * S | 0; px(x, y, '#5ab4e0'); px(x + 1, y, '#5ab4e0'); }
  // Kleine Wellen (helle Striche)
  for (let i = 0; i < 26; i++) {
    const x = rnd() * S | 0, y = rnd() * S | 0, len = 2 + (rnd() * 3 | 0);
    for (let k = 0; k < len; k++) px(x + k, y, '#a6e1f8');
  }
  // Seerosenblätter: grüne Kreise mit Kerbe, eins davon mit pinker Blüte
  const pad = (cx, cy, r, flower) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d > r * r + r) continue;
      if (x > 0 && Math.abs(y) <= x * 0.35) continue; // Kerbe
      px(cx + x, cy + y, d > (r - 1) * (r - 1) ? '#2f8a43' : (x + y) % 5 === 0 ? '#5cc06a' : '#46ab55');
    }
    if (flower) {
      const P = '#ff8fc4', Pd = '#e46aa8';
      [[0, -2], [-2, 0], [2, 0], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, y], i) => px(cx - 1 + x, cy - 1 + y, i < 4 ? P : Pd));
      px(cx - 1, cy - 1, '#ffd966');
    }
  };
  pad(12, 14, 6, true);
  pad(44, 30, 5, false);
  pad(26, 50, 7, true);
  pad(56, 56, 3, false);
  return c.toDataURL();
}

function applyThemeEarly(theme) {
  const root = document.documentElement;
  if (theme && theme !== 'mouse') root.dataset.theme = theme; else delete root.dataset.theme;
  if (theme === 'capy' && !root.style.getPropertyValue('--pond')) {
    try { root.style.setProperty('--pond', `url("${makePondTile()}")`); } catch {}
  }
}

(function () {
  let theme = 'mouse';
  try { theme = JSON.parse(localStorage.getItem('codequest-v1') || '{}').theme || 'mouse'; } catch {}
  applyThemeEarly(THEMES.includes(theme) ? theme : 'mouse');
})();
