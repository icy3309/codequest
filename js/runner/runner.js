'use strict';
/* =========================================================
   Code-Ausführung. Einheitliche Schnittstelle je Sprache:
     Runner.run(lang, code, inputs) → { out, error }
     Runner.test(lang, code, tests) → [ { ok, … } ]
   Python läuft per Pyodide in einem Web Worker. Hängt der Code
   (Endlosschleife), wird der Worker beendet und neu gestartet.
   ========================================================= */
const RUN_TIMEOUT = 6000;

const PyRunner = {
  worker: null, ready: null, seq: 0, pending: new Map(), status: 'idle', listeners: [],

  onStatus(fn) { this.listeners.push(fn); },
  setStatus(s) { this.status = s; this.listeners.forEach((f) => f(s)); },

  boot() {
    if (this.ready) return this.ready;
    this.setStatus('loading');
    this.worker = new Worker('js/runner/python-worker.js?v=2');
    this.ready = new Promise((res, rej) => {
      this.worker.onmessage = ({ data }) => {
        if (data.type === 'ready') { this.setStatus('ready'); res(); }
        else if (data.type === 'fatal') { this.setStatus('error'); this.ready = null; rej(new Error('Python konnte nicht geladen werden: ' + data.msg)); }
        else if (data.type === 'result') {
          const p = this.pending.get(data.id);
          if (!p) return;
          this.pending.delete(data.id); clearTimeout(p.timer);
          data.crash ? p.rej(new Error(data.crash)) : p.res(data.result);
        }
      };
      this.worker.onerror = (e) => { this.setStatus('error'); this.ready = null; rej(new Error(e.message || 'Worker-Fehler')); };
    });
    return this.ready;
  },

  restart() {
    this.worker?.terminate();
    this.worker = null; this.ready = null;
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.rej(new Error('abgebrochen')); }
    this.pending.clear();
    this.boot().catch(() => {});
  },

  async call(msg) {
    await this.boot();
    const id = ++this.seq;
    return new Promise((res, rej) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.restart();
        const e = new Error('timeout'); e.timeout = true; rej(e);
      }, RUN_TIMEOUT);
      this.pending.set(id, { res, rej, timer });
      this.worker.postMessage({ ...msg, id });
    });
  },
  run(code, inputs) { return this.call({ cmd: 'run', code, inputs }); },
  test(code, tests) { return this.call({ cmd: 'test', code, tests }); },
};

const Runner = {
  for(lang) {
    if (lang === 'python') return PyRunner;
    throw new Error(`Für ${lang} gibt es noch keinen Runner.`);
  },
  run(lang, code, inputs = []) { return this.for(lang).run(code, inputs); },
  test(lang, code, tests) { return this.for(lang).test(code, tests); },
};

/* ---------- Python-Fehler auf Deutsch erklären ---------- */
const PY_ERRORS = {
  SyntaxError: 'Syntaxfehler – Python versteht diese Zeile nicht. Oft fehlt ein Doppelpunkt `:`, eine Klammer oder ein Anführungszeichen.',
  IndentationError: 'Einrückungsfehler – nach einer Zeile mit `:` muss der Block eingerückt sein (4 Leerzeichen), und alle Zeilen eines Blocks müssen gleich weit eingerückt sein.',
  TabError: 'Tabs und Leerzeichen sind gemischt. Nutze nur Leerzeichen zum Einrücken.',
  NameError: 'Dieser Name ist unbekannt. Hast du dich vertippt, oder benutzt du eine Variable, bevor du ihr einen Wert gibst? Text muss in Anführungszeichen stehen.',
  TypeError: 'Typfehler – du verknüpfst Werte, die nicht zusammenpassen (z. B. Text + Zahl). Wandle mit `str()` oder `int()` um – oder prüfe, ob du eine Funktion mit der richtigen Anzahl an Argumenten aufrufst.',
  ValueError: 'Wertfehler – der Typ stimmt, aber der Wert passt nicht (z. B. `int("hallo")`).',
  ZeroDivisionError: 'Division durch null ist nicht erlaubt.',
  IndexError: 'Index außerhalb des Bereichs – die Liste/der Text ist kürzer, als du denkst. Denk dran: Zählen beginnt bei 0.',
  KeyError: 'Diesen Schlüssel gibt es im Dictionary nicht. Mit `.get()` oder `in` kannst du vorher prüfen.',
  AttributeError: 'Diese Methode oder Eigenschaft gibt es für diesen Typ nicht. Tippfehler? Oder ist die Variable `None`?',
  RecursionError: 'Zu tiefe Rekursion – deine Funktion ruft sich endlos selbst auf. Fehlt der Basisfall?',
  UnboundLocalError: 'Du benutzt eine Variable in einer Funktion, bevor sie dort einen Wert hat. Für globale Variablen bräuchtest du `global`.',
  InputExhausted: 'Dein Programm ruft öfter `input()` auf, als der Test Eingaben liefert.',
  ModuleNotFoundError: 'Dieses Modul gibt es hier nicht.',
  AssertionError: 'Eine Prüfung (assert) ist fehlgeschlagen.',
};
function explainError(err) {
  if (!err) return '';
  const tip = PY_ERRORS[err.type] || '';
  const where = err.line ? `Zeile ${err.line}${err.src ? `: <code>${esc(err.src)}</code>` : ''}` : '';
  return `<div class="err-box"><b>${esc(err.type)}</b>${err.msg ? ': ' + esc(err.msg) : ''}${where ? `<br><span class="muted">${where}</span>` : ''}${tip ? `<br>💡 ${inline(tip)}` : ''}</div>`;
}
