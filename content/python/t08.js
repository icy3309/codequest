'use strict';
/* Thema 8: Fehler & Robustheit */
addTopic('python', {
  n: 8, title: 'Fehler & Robustheit', desc: 'Fehlermeldungen, try/except, raise',
  levels: [
    {
      id: 'py-08-01', title: 'Fehlermeldungen lesen',
      lesson: [
        "Fehler sind normal – Profis machen sie ständig. Wichtig ist, die **Fehlermeldung zu lesen**. Sie verrät dir **welche Art** von Fehler (z. B. `TypeError`), **was** genau los ist und **in welcher Zeile**.",
        "Die häufigsten:",
        "- `SyntaxError` – Python versteht die Zeile nicht (Doppelpunkt, Klammer, Anführungszeichen vergessen)\n- `IndentationError` – Einrückung passt nicht\n- `NameError` – Name unbekannt (Tippfehler?)\n- `TypeError` – Typen passen nicht zusammen (`\"5\" + 3`)\n- `ValueError` – Wert passt nicht (`int(\"abc\")`)\n- `IndexError` / `KeyError` – Position bzw. Schlüssel gibt es nicht",
      ],
      commands: [
        ['Fehlertyp: Meldung', 'was ist passiert?'],
        ['Zeile X', 'wo ist es passiert?'],
        ['str() / int()', 'Typen umwandeln'],
      ],
      example: code`alter = 16
# print("Ich bin " + alter)   → TypeError: can only concatenate str (not "int") to str
print("Ich bin " + str(alter))`,
      exampleOut: 'Ich bin 16',
      task: [
        "Dieses Programm hat **vier Fehler**. Führe es aus, lies die Meldung, repariere – und wiederhole, bis es läuft. Es soll ausgeben:",
        "```\nEinkauf: 3 Sachen\nErstes: Milch\nGesamt: 7.5 Euro\n```",
      ],
      starter: code`einkauf = ["Milch", "Brot", "Käse"]
preise = {"Milch": 1.5, "Brot": 2.5, "Käse": 3.5}

print("Einkauf: " + len(einkauf) + " Sachen")
print("Erstes: " + einkauf[1])
gesamt = 0
for ding in einkauf
    gesamt += preis[ding]
print(f"Gesamt: {gesamt} Euro")`,
      tests: [
        { type: 'out', expect: 'Einkauf: 3 Sachen\nErstes: Milch\nGesamt: 7.5 Euro' },
      ],
      hints: ['Fehler 1: `SyntaxError` – nach `for … in einkauf` fehlt etwas.', 'Fehler 2: `NameError` – heißt das Dictionary `preis` oder `preise`?', 'Fehler 3 & 4: `TypeError` bei `+ len(...)` → `str(len(einkauf))`. Und das **erste** Element hat Index `0`.'],
      solution: code`einkauf = ["Milch", "Brot", "Käse"]
preise = {"Milch": 1.5, "Brot": 2.5, "Käse": 3.5}

print("Einkauf: " + str(len(einkauf)) + " Sachen")
print("Erstes: " + einkauf[0])
gesamt = 0
for ding in einkauf:
    gesamt += preise[ding]
print(f"Gesamt: {gesamt} Euro")`,
    },
    {
      id: 'py-08-02', title: 'try & except',
      lesson: [
        "Manche Fehler kannst du nicht vermeiden – z. B. wenn jemand Buchstaben statt einer Zahl eintippt. Mit `try/except` **fängst** du sie ab, statt dass das Programm abstürzt.",
        "Der Code in `try` wird versucht. Tritt der genannte Fehler auf, springt Python sofort in den `except`-Block. Fange immer **konkrete** Fehlertypen ab (`except ValueError:`), nicht pauschal alles.",
        "Optional: `else:` läuft, wenn **kein** Fehler auftrat, `finally:` läuft **immer**.",
      ],
      commands: [
        ['try:', 'versuchen …'],
        ['except ValueError:', '… bei diesem Fehler hierhin'],
        ['except (A, B):', 'mehrere Typen'],
        ['except ZeroDivisionError as e:', 'Fehler-Objekt in e'],
      ],
      example: code`eingabe = input("Zahl? ")
try:
    zahl = int(eingabe)
    print(100 / zahl)
except ValueError:
    print("Das war keine Zahl.")
except ZeroDivisionError:
    print("Durch 0 geht nicht.")`,
      exampleOut: 'Das war keine Zahl.',
      task: [
        "Lies so lange Eingaben, bis eine **gültige ganze Zahl** kommt. Bei ungültiger Eingabe gib `Bitte eine Zahl eingeben!` aus und frag erneut. Bei Erfolg gib `Danke: X` aus.",
        "Eingaben `abc`, `4.5`, `7` → zweimal die Warnung, dann `Danke: 7`.",
      ],
      starter: code`while True:
    eingabe = input("Zahl? ")
`,
      tests: [
        { type: 'out', input: ['abc', '4.5', '7'], expect: 'Bitte eine Zahl eingeben!\nBitte eine Zahl eingeben!\nDanke: 7' },
        { type: 'out', input: ['-3'], expect: 'Danke: -3' },
        { type: 'src', pattern: 'except\\s+ValueError', msg: 'Fängt gezielt `ValueError` ab' },
      ],
      hidden: [{ type: 'out', input: ['', 'zwölf', '12'], expect: 'Bitte eine Zahl eingeben!\nBitte eine Zahl eingeben!\nDanke: 12' }],
      hints: ['Im `try`: `zahl = int(eingabe)` und dann `break`.', 'Nach der Schleife: `print(f"Danke: {zahl}")`'],
      solution: code`while True:
    eingabe = input("Zahl? ")
    try:
        zahl = int(eingabe)
        break
    except ValueError:
        print("Bitte eine Zahl eingeben!")
print(f"Danke: {zahl}")`,
    },
    {
      id: 'py-08-03', title: 'raise – eigene Fehler',
      lesson: [
        "Du kannst auch **selbst** Fehler auslösen – mit `raise`. Das ist sinnvoll, wenn eine Funktion mit ungültigen Werten aufgerufen wird: Lieber laut scheitern als still Unsinn berechnen.",
        "`raise ValueError(\"Alter darf nicht negativ sein\")` – der Text erklärt das Problem. Der Aufrufer kann den Fehler dann mit `try/except` behandeln.",
      ],
      commands: [
        ['raise ValueError("…")', 'Fehler auslösen'],
        ['raise TypeError("…")', 'falscher Typ'],
        ['except ValueError as e: print(e)', 'Meldung ausgeben'],
      ],
      example: code`def wurzel(x):
    if x < 0:
        raise ValueError("Keine Wurzel aus negativen Zahlen")
    return x ** 0.5

try:
    print(wurzel(-4))
except ValueError as e:
    print("Fehler:", e)`,
      exampleOut: 'Fehler: Keine Wurzel aus negativen Zahlen',
      task: [
        "Schreib `abheben(kontostand, betrag)`, die den neuen Kontostand zurückgibt. Sie soll aber Fehler auslösen:",
        "- `ValueError(\"Betrag muss positiv sein\")` wenn `betrag <= 0`\n- `ValueError(\"Nicht genug Geld\")` wenn `betrag > kontostand`",
      ],
      starter: code`def abheben(kontostand, betrag):
    return kontostand - betrag
`,
      tests: [
        { type: 'eval', expr: 'abheben(100, 30)', expect: '70' },
        { type: 'assert', code: 'try:\n    abheben(100, -5)\n    assert False\nexcept ValueError as e:\n    assert str(e) == "Betrag muss positiv sein"', msg: '`abheben(100, -5)` löst `ValueError("Betrag muss positiv sein")` aus' },
        { type: 'assert', code: 'try:\n    abheben(50, 80)\n    assert False\nexcept ValueError as e:\n    assert str(e) == "Nicht genug Geld"', msg: '`abheben(50, 80)` löst `ValueError("Nicht genug Geld")` aus' },
      ],
      hidden: [{ type: 'eval', expr: 'abheben(50, 50)', expect: '0' }, { type: 'assert', code: 'try:\n    abheben(10, 0)\n    assert False\nexcept ValueError:\n    pass', msg: '0 ist ungültig' }],
      hints: ['Prüfungen **vor** dem `return`: `if betrag <= 0: raise ValueError("Betrag muss positiv sein")`'],
      solution: code`def abheben(kontostand, betrag):
    if betrag <= 0:
        raise ValueError("Betrag muss positiv sein")
    if betrag > kontostand:
        raise ValueError("Nicht genug Geld")
    return kontostand - betrag`,
    },
    {
      id: 'py-08-04', title: 'Eingaben prüfen',
      lesson: [
        "Robuste Programme **vertrauen keiner Eingabe**. Gute Praxis: eine Hilfsfunktion, die so lange fragt, bis die Eingabe passt – dann kannst du sie überall wiederverwenden.",
        "Kombiniere alles: `try/except` für den Typ, `if` für den Wertebereich, `while True` zum Wiederholen.",
      ],
      commands: [
        ['def frage_zahl(text, mini, maxi):', 'wiederverwendbare Eingabe'],
        ['mini <= x <= maxi', 'Bereich prüfen'],
      ],
      example: code`def frage_ja_nein(text):
    while True:
        a = input(text).strip().lower()
        if a in ("j", "ja"):
            return True
        if a in ("n", "nein"):
            return False
        print("Bitte ja oder nein.")`,
      task: [
        "Schreib `frage_zahl(text, mini, maxi)`: Sie fragt mit `input(text)` so lange, bis eine ganze Zahl **zwischen mini und maxi** (einschließlich) eingegeben wird, und gibt sie zurück.",
        "Bei keiner Zahl: `Das ist keine Zahl.` – außerhalb des Bereichs: `Bitte zwischen MINI und MAXI.`",
        "Das Hauptprogramm unten fragt nach einer Note und gibt sie aus – lass es so stehen.",
      ],
      starter: code`def frage_zahl(text, mini, maxi):
    pass


note = frage_zahl("Note (1-6)? ", 1, 6)
print(f"Note: {note}")`,
      tests: [
        { type: 'out', input: ['x', '9', '0', '2'], expect: 'Das ist keine Zahl.\nBitte zwischen 1 und 6.\nBitte zwischen 1 und 6.\nNote: 2' },
        { type: 'out', input: ['6'], expect: 'Note: 6' },
        { type: 'evalout', expr: 'frage_zahl("? ", 10, 20)', callInput: ['5', '15'], expect: 'Bitte zwischen 10 und 20.' },
        { type: 'eval', expr: 'frage_zahl("? ", 10, 20)', callInput: ['abc', '20'], expect: '20' },
      ],
      hints: ['Gerüst: `while True:` → `try: zahl = int(input(text))` → `except ValueError: print(...); continue`', 'Dann `if mini <= zahl <= maxi: return zahl` sonst die Bereichs-Meldung.'],
      solution: code`def frage_zahl(text, mini, maxi):
    while True:
        try:
            zahl = int(input(text))
        except ValueError:
            print("Das ist keine Zahl.")
            continue
        if mini <= zahl <= maxi:
            return zahl
        print(f"Bitte zwischen {mini} und {maxi}.")


note = frage_zahl("Note (1-6)? ", 1, 6)
print(f"Note: {note}")`,
    },
    {
      id: 'py-08-p', kind: 'project', title: 'Robuster Notenrechner',
      lesson: [
        "🛠 **Projekt: Notenrechner, der nicht kaputtgeht.** Egal was der Benutzer eintippt – dein Programm bleibt freundlich.",
        "Du baust Funktionen für die Eingabe und die Berechnung und trennst so „Daten holen“ von „Daten verarbeiten“.",
      ],
      commands: [
        ['try / except ValueError', 'falsche Eingaben abfangen'],
        ['raise ValueError(...)', 'ungültige Daten melden'],
        ['round(x, 2)', 'runden'],
      ],
      starter: code`def schnitt(noten):
    pass
`,
      steps: [
        {
          title: 'schnitt()',
          task: [
            "Schreib `schnitt(noten)`: Durchschnitt einer Liste von Noten auf 2 Stellen gerundet. Ist die Liste leer, löse `ValueError(\"Keine Noten\")` aus.",
          ],
          tests: [
            { type: 'eval', expr: 'schnitt([1, 2, 3])', expect: '2' },
            { type: 'eval', expr: 'schnitt([1, 2, 2])', expect: '1.67' },
            { type: 'assert', code: 'try:\n    schnitt([])\n    assert False\nexcept ValueError:\n    pass', msg: 'Leere Liste → `ValueError`' },
          ],
          hints: ['`if not noten: raise ValueError("Keine Noten")`'],
        },
        {
          title: 'Noten einlesen',
          task: [
            "Lies im Hauptprogramm Noten ein, bis eine **leere Eingabe** kommt. Gültig sind nur ganze Zahlen von 1 bis 6. Ungültige Eingaben: `Ungültig: XYZ` (die Eingabe selbst) – und weiter geht's.",
            "Gib danach `Schnitt: X` aus. Kamen **keine** gültigen Noten, fange den `ValueError` von `schnitt` ab und gib `Keine Noten eingegeben.` aus.",
          ],
          tests: [
            { type: 'has', input: ['2', 'drei', '9', '3', ''], expect: 'Ungültig: drei\nUngültig: 9\nSchnitt: 2.5', label: 'gemischte Eingaben' },
            { type: 'has', input: [''], expect: 'Keine Noten eingegeben.', label: 'keine Noten' },
          ],
          hints: ['In der Schleife: `try: n = int(e)` / `except ValueError: print(f"Ungültig: {e}"); continue`', 'Dann noch `if not 1 <= n <= 6:` prüfen.'],
        },
        {
          title: 'Zeugnis',
          task: [
            "Ergänze nach dem Schnitt eine Bewertung: Schnitt **bis 2.5** → `Super! 🎉`, bis **4.0** → `Bestanden.`, sonst `Da geht noch was! 💪`.",
          ],
          tests: [
            { type: 'out', input: ['2', '3', ''], expect: 'Schnitt: 2.5\nSuper! 🎉', label: 'Schnitt 2.5' },
            { type: 'out', input: ['4', '4', ''], expect: 'Schnitt: 4.0\nBestanden.', label: 'Schnitt 4' },
            { type: 'out', input: ['5', '6', ''], expect: 'Schnitt: 5.5\nDa geht noch was! 💪', label: 'Schnitt 5.5' },
          ],
          hints: ['Das gehört in den Teil, der nur läuft, wenn `schnitt` geklappt hat (z. B. ein `else:` beim `try`).'],
        },
      ],
      solution: code`def schnitt(noten):
    if not noten:
        raise ValueError("Keine Noten")
    return round(sum(noten) / len(noten), 2)

noten = []
while True:
    e = input("Note (leer = fertig)? ")
    if e == "":
        break
    try:
        n = int(e)
    except ValueError:
        print(f"Ungültig: {e}")
        continue
    if not 1 <= n <= 6:
        print(f"Ungültig: {e}")
        continue
    noten.append(n)

try:
    s = schnitt(noten)
except ValueError:
    print("Keine Noten eingegeben.")
else:
    print(f"Schnitt: {s}")
    if s <= 2.5:
        print("Super! 🎉")
    elif s <= 4.0:
        print("Bestanden.")
    else:
        print("Da geht noch was! 💪")`,
    },
  ],
});
