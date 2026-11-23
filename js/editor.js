'use strict';
/* =========================================================
   Kleiner Code-Editor: Textarea über einem eingefärbten <pre>.
   Bewusst OHNE automatisches Einrücken oder Klammern-Ergänzen:
   Doppelpunkt und Einrückung sollen selbst gelernt werden.
   Tab = 4 Leerzeichen, Shift+Tab rückt aus, Strg/Cmd+Enter = Ausführen.
   ========================================================= */
/** Senkrechte Einrückungslinien wie in einer IDE: je 4 Leerzeichen ein Strich.
    Leere Zeilen innerhalb eines Blocks bekommen die Linien des Blocks weiter. */
function indentGuides(code) {
  const lines = code.split('\n');
  const ind = lines.map((l) => (l.trim() ? Math.floor(l.match(/^ */)[0].length / 4) : -1));
  for (let i = 0; i < ind.length; i++) {
    if (ind[i] !== -1) continue;
    let a = i - 1; while (a >= 0 && ind[a] === -1) a--;
    let b = i + 1; while (b < ind.length && lines[b].trim() === '') b++;
    ind[i] = a >= 0 && b < ind.length ? Math.min(ind[a], Math.floor(lines[b].match(/^ */)[0].length / 4)) : 0;
  }
  return ind.map((n) => '<span class="ig">    </span>'.repeat(n)).join('\n') + '\n';
}

class CodeEditor {
  constructor(host, { onRun, onCheck, onChange } = {}) {
    host.innerHTML = `<div class="ed-gutter"></div><div class="ed-area"><pre class="ed-sizer"></pre><pre class="ed-guides" aria-hidden="true"></pre><pre class="ed-hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Code-Editor"></textarea></div>`;
    this.host = host;
    this.gutter = $('.ed-gutter', host);
    this.hl = $('.ed-hl', host);
    this.guides = $('.ed-guides', host);
    this.sizer = $('.ed-sizer', host);
    this.ta = $('textarea', host);
    this.onChange = onChange;
    this.ta.addEventListener('input', () => { this.render(); this.onChange?.(this.value); });
    this.ta.addEventListener('keydown', (e) => this.key(e, onRun, onCheck));
  }
  get value() { return this.ta.value; }
  set value(v) { this.ta.value = v; this.render(); }
  focus() { this.ta.focus(); }

  render() {
    const v = this.ta.value;
    // Sizer bestimmt die Größe (Textarea und Highlight liegen absolut darüber)
    this.sizer.textContent = v + '\n';
    this.hl.innerHTML = highlight(v) + '\n';
    this.guides.innerHTML = indentGuides(v);
    const n = v.split('\n').length;
    this.gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join('\n');
  }

  /** Text im Bereich [a,b) ersetzen – mit Undo-Unterstützung des Browsers. */
  replace(a, b, text, selA, selB) {
    this.ta.setSelectionRange(a, b);
    if (!document.execCommand('insertText', false, text)) this.ta.setRangeText(text, a, b, 'end');
    this.ta.setSelectionRange(selA ?? a + text.length, selB ?? selA ?? a + text.length);
    this.render(); this.onChange?.(this.value);
  }

  key(e, onRun, onCheck) {
    const ta = this.ta, v = ta.value, s = ta.selectionStart, end = ta.selectionEnd;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); (e.shiftKey ? onCheck : onRun)?.(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      if (s === end && !e.shiftKey) { this.replace(s, end, '    '); return; }
      const le = v.indexOf('\n', end - (end > s && v[end - 1] === '\n' ? 1 : 0));
      const blockEnd = le === -1 ? v.length : le;
      const lines = v.slice(ls, blockEnd).split('\n');
      const changed = lines.map((l) => (e.shiftKey ? l.replace(/^ {1,4}/, '') : '    ' + l)).join('\n');
      this.replace(ls, blockEnd, changed, ls, ls + changed.length);
      return;
    }
  }
}
