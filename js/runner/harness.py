# Test-Harness: führt Lerner-Code aus und prüft ihn.
# Läuft im Browser (Pyodide-Worker) und lässt sich lokal mit python3 testen.
import sys, io, json, random, traceback, re, builtins

FILENAME = "<dein-code>"
MAX_OUT = 20000


class InputExhausted(Exception):
    pass


class _Out(io.StringIO):
    def write(self, s):
        if self.tell() > MAX_OUT:
            raise RuntimeError("Zu viel Ausgabe – läuft da eine Endlosschleife mit print()?")
        return super().write(s)


def _error_info(exc, code_lines):
    """Fehlertyp, Meldung und Zeile im Lerner-Code."""
    line = None
    if isinstance(exc, SyntaxError) and exc.filename == FILENAME:
        line = exc.lineno
    else:
        for fr in traceback.extract_tb(exc.__traceback__):
            if fr.filename == FILENAME:
                line = fr.lineno
    src = code_lines[line - 1].strip() if line and 0 < line <= len(code_lines) else ""
    msg = exc.msg if isinstance(exc, SyntaxError) else str(exc)
    return {"type": type(exc).__name__, "msg": msg, "line": line, "src": src}


def run_program(code, inputs=None, seed=0, interactive=False):
    """Programm ausführen. Gibt (namespace, stdout, error) zurück.
    interactive=True: wie im Terminal – der Fragetext von input() und die
    eingegebene Antwort erscheinen in der Ausgabe (für ▶ Ausführen)."""
    inputs = list(inputs or [])
    out = _Out()
    ns = {"__name__": "__main__"}
    used = []

    def fake_input(prompt=""):
        if interactive:
            out.write(str(prompt))
        if not inputs:
            raise InputExhausted("Dein Programm wartet auf mehr Eingaben, als der Test liefert.")
        v = str(inputs.pop(0))
        used.append(v)
        if interactive:
            out.write(v + "\n")
        return v

    old_out, old_input = sys.stdout, builtins.input
    sys.stdout = out
    builtins.input = fake_input
    random.seed(seed)
    err = None
    try:
        compiled = compile(code, FILENAME, "exec")
        exec(compiled, ns)
    except SystemExit:
        pass
    except BaseException as e:  # noqa: B902 – auch KeyboardInterrupt etc. melden
        err = _error_info(e, code.split("\n"))
    finally:
        sys.stdout, builtins.input = old_out, old_input
    return ns, out.getvalue(), err


def _norm(s):
    """Vergleich tolerant: Leerzeichen am Zeilenende und Leerzeilen am Ende egal."""
    return "\n".join(l.rstrip() for l in str(s).replace("\r\n", "\n").split("\n")).strip("\n")


def _same(val, exp):
    """Gleich UND passender Typ (True ist nicht 1, "3" ist nicht 3; 2 und 2.0 zählen gleich)."""
    if isinstance(exp, bool) or isinstance(val, bool):
        return val is exp
    num = (int, float)
    if isinstance(exp, num) and isinstance(val, num):
        return abs(val - exp) < 1e-9
    return type(val) == type(exp) and val == exp


def _call(ns, expr, inputs=None):
    """Ausdruck im Namensraum des Lerners auswerten und dabei Ausgaben abfangen."""
    inputs = list(inputs or [])
    out = _Out()
    old_out, old_input = sys.stdout, builtins.input

    def fake_input(prompt=""):
        if not inputs:
            raise InputExhausted("Die Funktion wartet auf mehr Eingaben, als der Test liefert.")
        return str(inputs.pop(0))

    sys.stdout = out
    builtins.input = fake_input
    try:
        val = eval(expr, ns)
        return val, out.getvalue(), None
    except BaseException as e:
        return None, out.getvalue(), _error_info(e, [])
    finally:
        sys.stdout, builtins.input = old_out, old_input


def run_tests(code, tests):
    """tests: Liste von Dicts.
    out:    {"type":"out", "input":[..], "expect":"..."}        – komplette Ausgabe vergleichen
    has:    {"type":"has", "input":[..], "expect":"..."}        – Ausgabe enthält Text
    eval:   {"type":"eval", "expr":"f(2)", "expect":"4"}        – Python-Ausdruck == erwarteter Ausdruck
    evalout:{"type":"evalout", "expr":"f(2)", "expect":"..."}   – Ausgabe beim Aufruf vergleichen
    assert: {"type":"assert", "code":"assert x == 3", "msg":"…"}  – beliebiger Check im Namensraum
    src:    {"type":"src", "pattern":"for ", "msg":"…"}          – Regex muss im Code vorkommen
    nosrc:  {"type":"nosrc", "pattern":"…", "msg":"…"}           – Regex darf NICHT vorkommen
    """
    results = []
    base_cache = {}

    def base(inputs):
        key = json.dumps(inputs or [])
        if key not in base_cache:
            base_cache[key] = run_program(code, inputs)
        return base_cache[key]

    for t in tests:
        typ = t.get("type", "out")
        r = {"type": typ, "label": t.get("label", ""), "ok": False}
        try:
            if typ in ("src", "nosrc"):
                found = re.search(t["pattern"], code, re.M) is not None
                r["ok"] = found if typ == "src" else not found
                r["msg"] = t.get("msg", "")
            elif typ in ("out", "has"):
                ns, out, err = base(t.get("input"))
                r["got"] = out
                r["expect"] = t["expect"]
                r["input"] = t.get("input") or []
                r["error"] = err
                if not err:
                    r["ok"] = _norm(out) == _norm(t["expect"]) if typ == "out" else _norm(t["expect"]) in _norm(out)
            else:
                ns, out, err = base(t.get("input"))
                # Wartet das Hauptprogramm nur auf Eingaben, sind die Funktionen davor trotzdem definiert.
                if err and err["type"] != "InputExhausted":
                    r["error"] = err
                elif typ == "eval":
                    r["expr"] = t["expr"]
                    val, _, e2 = _call(ns, t["expr"], t.get("callInput"))
                    if e2:
                        r["error"] = e2
                    else:
                        exp = eval(t["expect"], {})
                        r["got"] = repr(val)
                        r["expect"] = repr(exp)
                        r["ok"] = _same(val, exp)
                elif typ == "evalout":
                    r["expr"] = t["expr"]
                    val, out2, e2 = _call(ns, t["expr"], t.get("callInput"))
                    r["got"] = out2
                    r["expect"] = t["expect"]
                    if e2:
                        r["error"] = e2
                    else:
                        r["ok"] = _norm(out2) == _norm(t["expect"])
                elif typ == "assert":
                    r["msg"] = t.get("msg", "")
                    g = dict(ns)
                    o2 = _Out()
                    old = sys.stdout
                    sys.stdout = o2
                    try:
                        exec(t["code"], g)
                        r["ok"] = True
                    except AssertionError:
                        r["ok"] = False
                    except BaseException as e:
                        r["error"] = _error_info(e, [])
                    finally:
                        sys.stdout = old
        except BaseException as e:
            r["error"] = {"type": type(e).__name__, "msg": str(e), "line": None, "src": ""}
        results.append(r)
    return results


def api_run(code, inputs_json, interactive=False):
    _, out, err = run_program(code, json.loads(inputs_json), interactive=bool(interactive))
    # Wartet das Programm auf eine Eingabe, ist das im Terminal-Modus kein Fehler
    waiting = bool(interactive and err and err["type"] == "InputExhausted")
    return json.dumps({"out": out, "error": None if waiting else err, "waiting": waiting})


def api_test(code, tests_json):
    return json.dumps(run_tests(code, json.loads(tests_json)))
