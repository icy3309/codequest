'use strict';
/* =========================================================
   Kleiner Code-Editor: Textarea über einem eingefärbten <pre>.
   Tab = 4 Leerzeichen, Shift+Tab rückt aus, Enter übernimmt die
   Einrückung (+4 nach ":"), Strg/Cmd+Enter = Ausführen.
   ========================================================= */
class CodeEditor {
  constructor(host, { onRun, onCheck, onChange } = {}) {
    host.innerHTML = `<div class="ed-gutter"></div><div class="ed-area"><pre class="ed-sizer"></pre><pre class="ed-hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Code-Editor"></textarea></div>`;
    this.host = host;
    this.gutter = $('.ed-gutter', host);
    this.hl = $('.ed-hl', host);
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
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const line = v.slice(ls, s);
      let ind = line.match(/^\s*/)[0];
      if (/:\s*(#.*)?$/.test(line)) ind += '    ';
      this.replace(s, end, '\n' + ind);
      return;
    }
    if (e.key === 'Backspace' && s === end && s > 0) {
      const ls = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(ls, s);
      if (before.length && /^ +$/.test(before)) {
        e.preventDefault();
        const cut = before.length % 4 || 4;
        this.replace(s - cut, s, '');
      }
      return;
    }
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    if (pairs[e.key] && s !== end) { // markierten Text einklammern
      e.preventDefault();
      this.replace(s, end, e.key + v.slice(s, end) + pairs[e.key], s + 1, end + 1);
    }
  }
}
