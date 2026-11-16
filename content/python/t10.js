'use strict';
/* Thema 10: Fortgeschrittene Basics */
addTopic('python', {
  n: 10, title: 'Fortgeschrittene Basics', desc: 'Comprehensions, Module, Rekursion, Generatoren',
  levels: [
    {
      id: 'py-10-01', title: 'List Comprehensions',
      lesson: [
        "Eine **List Comprehension** baut eine Liste in **einer** Zeile – sehr „pythonisch“:",
        "```\nquadrate = [x * x for x in range(5)]          # [0, 1, 4, 9, 16]\ngerade = [x for x in zahlen if x % 2 == 0]   # mit Filter\n```",
        "Lies sie so: „Gib mir `x * x` für jedes `x` in …“. Das Gleiche geht für Dictionaries (`{k: v for …}`) und Sets (`{x for …}`).",
        "Faustregel: Comprehensions für einfache Umwandlungen/Filter. Wird's kompliziert, lieber eine normale Schleife – Lesbarkeit geht vor.",
      ],
      commands: [
        ['[f(x) for x in liste]', 'umwandeln'],
        ['[x for x in liste if bed]', 'filtern'],
        ['{k: v for k, v in …}', 'Dict-Comprehension'],
      ],
      example: code`woerter = ["Hallo", "ich", "bin", "Python"]
laengen = [len(w) for w in woerter]
gross = [w.upper() for w in woerter if len(w) > 3]
print(laengen)
print(gross)
print({w: len(w) for w in woerter[:2]})`,
      exampleOut: "[5, 3, 3, 6]\n['HALLO', 'PYTHON']\n{'Hallo': 5, 'ich': 3}",
      task: [
        "Schreib drei Funktionen – **jede nur mit einer Comprehension** im `return`:",
        "- `quadrate(n)` → Liste der Quadrate von 1 bis n: `quadrate(4)` → `[1, 4, 9, 16]`\n- `nur_positive(zahlen)` → nur die Zahlen > 0\n- `initialen(namen)` → Dictionary Name → erster Buchstabe: `{\"Mia\": \"M\"}`",
      ],
      starter: code`def quadrate(n):
    pass
`,
      tests: [
        { type: 'eval', expr: 'quadrate(4)', expect: '[1, 4, 9, 16]' },
        { type: 'eval', expr: 'nur_positive([3, -1, 0, 7, -5])', expect: '[3, 7]' },
        { type: 'eval', expr: 'initialen(["Mia", "Ben"])', expect: '{"Mia": "M", "Ben": "B"}' },
        { type: 'nosrc', pattern: '\\.append\\(', msg: 'Ohne `.append()` – nur Comprehensions' },
      ],
      hidden: [{ type: 'eval', expr: 'quadrate(0)', expect: '[]' }],
      hints: ['`return [i * i for i in range(1, n + 1)]`', '`return {n: n[0] for n in namen}`'],
      solution: code`def quadrate(n):
    return [i * i for i in range(1, n + 1)]

def nur_positive(zahlen):
    return [z for z in zahlen if z > 0]

def initialen(namen):
    return {n: n[0] for n in namen}`,
    },
    {
      id: 'py-10-02', title: 'Module: math & random',
      lesson: [
        "Python bringt eine riesige **Standardbibliothek** mit. Mit `import` holst du dir Module:",
        "- `math`: `math.sqrt(16)`, `math.pi`, `math.floor(2.7)`, `math.ceil(2.1)`\n- `random`: `random.randint(1, 6)`, `random.choice(liste)`, `random.shuffle(liste)`\n- `from math import sqrt` holt nur eine Funktion, dann ohne Präfix: `sqrt(9)`",
        "Beim Prüfen ist der Zufall eingefroren (immer gleiche „Zufalls“-Folge), darum klappen Tests trotzdem.",
      ],
      commands: [
        ['import math', 'Modul laden'],
        ['math.sqrt(x) / math.pi', 'Wurzel / Pi'],
        ['math.ceil(x)', 'aufrunden'],
        ['random.choice(l)', 'zufälliges Element'],
        ['from modul import name', 'einzeln importieren'],
      ],
      example: code`import math
import random

print(math.sqrt(2))
print(math.ceil(7 / 3))
wuerfe = [random.randint(1, 6) for _ in range(5)]
print(len(wuerfe), all(1 <= w <= 6 for w in wuerfe))`,
      exampleOut: '1.4142135623730951\n3\n5 True',
      task: [
        "Schreib zwei Funktionen:",
        "- `kreis(r)` gibt Fläche und Umfang eines Kreises als Tupel zurück, beides auf 2 Stellen gerundet (`A = π·r²`, `U = 2·π·r`)\n- `wuerfeln(n)` gibt eine Liste mit n Würfen eines normalen Würfels (1–6) zurück",
        "Bonus-Verständnis: `kartons(teile, pro_karton)` – wie viele Kartons braucht man? (Aufrunden mit `math.ceil`)",
      ],
      starter: code`import math
import random
`,
      tests: [
        { type: 'eval', expr: 'kreis(1)', expect: '(3.14, 6.28)' },
        { type: 'eval', expr: 'kreis(2.5)', expect: '(19.63, 15.71)' },
        { type: 'assert', code: 'w = wuerfeln(200)\nassert len(w) == 200 and set(w) == {1, 2, 3, 4, 5, 6}', msg: '`wuerfeln(200)` liefert 200 Würfe mit allen Augenzahlen 1–6' },
        { type: 'eval', expr: 'kartons(10, 4)', expect: '3' },
        { type: 'eval', expr: 'kartons(8, 4)', expect: '2' },
      ],
      hints: ['`return round(math.pi * r ** 2, 2), round(2 * math.pi * r, 2)`', '`return [random.randint(1, 6) for _ in range(n)]`', '`return math.ceil(teile / pro_karton)`'],
      solution: code`import math
import random

def kreis(r):
    return round(math.pi * r ** 2, 2), round(2 * math.pi * r, 2)

def wuerfeln(n):
    return [random.randint(1, 6) for _ in range(n)]

def kartons(teile, pro_karton):
    return math.ceil(teile / pro_karton)`,
    },
    {
      id: 'py-10-03', title: 'Rekursion',
      lesson: [
        "Eine **rekursive** Funktion ruft sich selbst auf – mit einem *kleineren* Problem. Damit das endet, braucht sie einen **Basisfall**, der ohne Selbstaufruf auskommt.",
        "Klassiker Fakultät: `5! = 5 · 4!`, und `0! = 1` ist der Basisfall.",
        "```\ndef fakultaet(n):\n    if n == 0:          # Basisfall\n        return 1\n    return n * fakultaet(n - 1)\n```",
        "Fehlt der Basisfall, gibt's einen `RecursionError`. Rekursion ist besonders elegant für verschachtelte Strukturen (Ordner, Bäume, verschachtelte Listen).",
      ],
      commands: [
        ['if basisfall: return …', 'Abbruch'],
        ['return f(kleiner)', 'Selbstaufruf'],
        ['isinstance(x, list)', 'ist x eine Liste?'],
      ],
      example: code`def countdown(n):
    if n == 0:
        print("Start!")
        return
    print(n)
    countdown(n - 1)

countdown(3)`,
      exampleOut: '3\n2\n1\nStart!',
      task: [
        "Schreib **rekursiv** (ohne Schleifen):",
        "- `quersumme(n)`: Summe der Ziffern, `quersumme(1234)` → `10` (Tipp: `n % 10` ist die letzte Ziffer, `n // 10` der Rest)\n- `tiefe_summe(liste)`: Summe aller Zahlen in einer **beliebig verschachtelten** Liste: `tiefe_summe([1, [2, [3, 4]], 5])` → `15`",
      ],
      starter: code`def quersumme(n):
    pass
`,
      tests: [
        { type: 'eval', expr: 'quersumme(1234)', expect: '10' },
        { type: 'eval', expr: 'quersumme(7)', expect: '7' },
        { type: 'eval', expr: 'tiefe_summe([1, [2, [3, 4]], 5])', expect: '15' },
        { type: 'eval', expr: 'tiefe_summe([])', expect: '0' },
        { type: 'nosrc', pattern: '\\b(for|while)\\b', msg: 'Ohne `for`/`while` – rein rekursiv' },
      ],
      hidden: [{ type: 'eval', expr: 'tiefe_summe([[[[10]]], [], 1])', expect: '11' }, { type: 'eval', expr: 'quersumme(99999)', expect: '45' }],
      hints: ['quersumme: Basisfall `if n < 10: return n`, sonst `return n % 10 + quersumme(n // 10)`', 'tiefe_summe ohne Schleife: Basisfall leere Liste → `0`. Sonst erstes Element `liste[0]` (ist es selbst eine Liste? dann `tiefe_summe` davon) + `tiefe_summe(liste[1:])`.'],
      solution: code`def quersumme(n):
    if n < 10:
        return n
    return n % 10 + quersumme(n // 10)

def tiefe_summe(liste):
    if not liste:
        return 0
    kopf = liste[0]
    wert = tiefe_summe(kopf) if isinstance(kopf, list) else kopf
    return wert + tiefe_summe(liste[1:])`,
    },
    {
      id: 'py-10-04', title: 'Generatoren',
      lesson: [
        "Ein **Generator** liefert Werte **einen nach dem anderen** – statt alles auf einmal in eine Liste zu packen. Statt `return` benutzt er `yield`: Die Funktion pausiert dort und macht beim nächsten Wert genau da weiter.",
        "Vorteil: Er braucht kaum Speicher und kann sogar **unendlich** viele Werte liefern. Mit `for` kannst du ihn durchlaufen, mit `next()` einzeln Werte holen, mit `list()` alles einsammeln (nur wenn er endlich ist!).",
        "Generator-Ausdrücke sehen aus wie Comprehensions mit runden Klammern: `sum(x * x for x in range(10))`.",
      ],
      commands: [
        ['yield wert', 'Wert liefern und pausieren'],
        ['next(gen)', 'nächsten Wert holen'],
        ['list(gen)', 'alle Werte als Liste'],
        ['(x for x in …)', 'Generator-Ausdruck'],
      ],
      example: code`def zaehle_hoch(start, ende):
    while start <= ende:
        yield start
        start += 1

for z in zaehle_hoch(1, 3):
    print(z)
g = zaehle_hoch(10, 99)
print(next(g), next(g))`,
      exampleOut: '1\n2\n3\n10 11',
      task: [
        "Schreib zwei Generatoren:",
        "- `fibonacci()` liefert **endlos** die Fibonacci-Zahlen: 0, 1, 1, 2, 3, 5, 8, … (jede Zahl ist die Summe der beiden vorherigen)\n- `woerter_mit(text, buchstabe)` liefert nacheinander alle Wörter aus `text`, die mit `buchstabe` beginnen (Groß-/Kleinschreibung egal)",
      ],
      starter: code`def fibonacci():
    a, b = 0, 1
`,
      tests: [
        { type: 'eval', expr: '[x for _, x in zip(range(8), fibonacci())]', expect: '[0, 1, 1, 2, 3, 5, 8, 13]' },
        { type: 'eval', expr: 'list(woerter_mit("Sonne Strand und See", "s"))', expect: '["Sonne", "Strand", "See"]' },
        { type: 'assert', code: 'import types\nassert isinstance(fibonacci(), types.GeneratorType) and isinstance(woerter_mit("a", "a"), types.GeneratorType)', msg: 'Beides sind Generatoren (mit `yield`)' },
      ],
      hidden: [{ type: 'eval', expr: 'list(woerter_mit("Alle Affen", "b"))', expect: '[]' }],
      hints: ['fibonacci: `while True: yield a` und dann `a, b = b, a + b`', 'woerter_mit: `for w in text.split(): if w.lower().startswith(buchstabe.lower()): yield w`'],
      solution: code`def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def woerter_mit(text, buchstabe):
    for w in text.split():
        if w.lower().startswith(buchstabe.lower()):
            yield w`,
    },
    {
      id: 'py-10-p', kind: 'project', title: 'Text-Adventure',
      lesson: [
        "🛠 **Abschlussprojekt: ein Text-Adventure!** Hier kommt alles zusammen: Dictionaries für die Spielwelt, Listen fürs Inventar, Funktionen, Schleifen und Bedingungen.",
        "Die Welt ist ein Dictionary von Räumen. Jeder Raum hat eine Beschreibung, Ausgänge (Richtung → Raum) und evtl. einen Gegenstand. Die Struktur ist im Startcode schon vorgegeben.",
      ],
      commands: [
        ['welt[raum]["ausgaenge"]', 'verschachtelter Zugriff'],
        ['befehl.split(" ", 1)', 'Befehl + Argument'],
        ['inventar.append(x)', 'aufheben'],
      ],
      starter: code`welt = {
    "Flur": {"text": "Ein dunkler Flur.", "ausgaenge": {"nord": "Küche", "ost": "Labor"}, "ding": None},
    "Küche": {"text": "Es riecht nach Pizza.", "ausgaenge": {"sued": "Flur"}, "ding": "Schlüssel"},
    "Labor": {"text": "Bildschirme flackern. Eine Tür ist verschlossen.", "ausgaenge": {"west": "Flur", "nord": "Serverraum"}, "ding": None},
    "Serverraum": {"text": "Der Server! Du hast es geschafft!", "ausgaenge": {}, "ding": None},
}
raum = "Flur"
inventar = []
`,
      steps: [
        {
          title: 'Herumlaufen',
          task: [
            "Schreib `beschreibe(raum)`, die `== RAUM ==`, den Text und `Ausgänge: nord, ost` (alphabetisch, durch `, `) ausgibt.",
            "Dann die Spielschleife: Erst den Startraum beschreiben, dann Befehle lesen bis `ende`. `geh RICHTUNG` wechselt den Raum (und beschreibt ihn). Gibt's die Richtung nicht: `Da geht's nicht weiter.`",
          ],
          tests: [
            { type: 'has', input: ['geh ost', 'geh west', 'geh sued', 'ende'], expect: "== Flur ==\nEin dunkler Flur.\nAusgänge: nord, ost\n== Labor ==\nBildschirme flackern. Eine Tür ist verschlossen.\nAusgänge: nord, west\n== Flur ==\nEin dunkler Flur.\nAusgänge: nord, ost\nDa geht's nicht weiter.", label: 'Rundgang' },
            { type: 'has', input: ['geh nord', 'ende'], expect: "== Küche ==\nEs riecht nach Pizza.\nAusgänge: sued", label: 'in die Küche' },
          ],
          hints: ['`", ".join(sorted(welt[raum]["ausgaenge"]))`', 'Befehl zerlegen: `teile = befehl.split(" ", 1)`'],
        },
        {
          title: 'Gegenstände',
          task: [
            "Liegt in einem Raum ein Ding, zeigt `beschreibe` zusätzlich `Hier liegt: Schlüssel`.",
            "Neue Befehle: `nimm` hebt das Ding auf (`Du nimmst: Schlüssel`, danach ist der Raum leer; liegt nichts da: `Hier ist nichts.`) und `inventar` zeigt `Inventar: Schlüssel` bzw. `Inventar: leer`.",
          ],
          tests: [
            { type: 'has', input: ['geh nord', 'nimm', 'nimm', 'inventar', 'ende'], expect: 'Hier liegt: Schlüssel\nDu nimmst: Schlüssel\nHier ist nichts.\nInventar: Schlüssel', label: 'Schlüssel holen' },
            { type: 'has', input: ['inventar', 'ende'], expect: 'Inventar: leer', label: 'leeres Inventar' },
          ],
          hints: ['`ding = welt[raum]["ding"]` – nach dem Aufheben `welt[raum]["ding"] = None`.'],
        },
        {
          title: 'Verschlossene Tür & Sieg',
          task: [
            "Der Weg vom Labor nach **nord** in den Serverraum ist nur **mit Schlüssel** möglich. Ohne: `Die Tür ist verschlossen. 🔒`",
            "Erreichst du den Serverraum, wird er beschrieben, dann gibt das Spiel `🏆 Gewonnen in X Zügen!` aus und endet (gezählt werden nur erfolgreiche `geh`-Befehle).",
          ],
          tests: [
            { type: 'has', input: ['geh ost', 'geh nord', 'ende'], expect: 'Die Tür ist verschlossen. 🔒', label: 'ohne Schlüssel' },
            { type: 'has', input: ['geh nord', 'nimm', 'geh sued', 'geh ost', 'geh nord'], expect: '== Serverraum ==\nDer Server! Du hast es geschafft!\nAusgänge: \n🏆 Gewonnen in 4 Zügen!', label: 'durchspielen' },
          ],
          hints: ['Vor dem Raumwechsel: `if raum == "Labor" and richtung == "nord" and "Schlüssel" not in inventar:`', 'Nach dem Wechsel: `if raum == "Serverraum": … break`'],
        },
      ],
      solution: code`welt = {
    "Flur": {"text": "Ein dunkler Flur.", "ausgaenge": {"nord": "Küche", "ost": "Labor"}, "ding": None},
    "Küche": {"text": "Es riecht nach Pizza.", "ausgaenge": {"sued": "Flur"}, "ding": "Schlüssel"},
    "Labor": {"text": "Bildschirme flackern. Eine Tür ist verschlossen.", "ausgaenge": {"west": "Flur", "nord": "Serverraum"}, "ding": None},
    "Serverraum": {"text": "Der Server! Du hast es geschafft!", "ausgaenge": {}, "ding": None},
}
raum = "Flur"
inventar = []
zuege = 0

def beschreibe(raum):
    print(f"== {raum} ==")
    print(welt[raum]["text"])
    print("Ausgänge: " + ", ".join(sorted(welt[raum]["ausgaenge"])))
    if welt[raum]["ding"]:
        print(f"Hier liegt: {welt[raum]['ding']}")

beschreibe(raum)
while True:
    befehl = input("> ")
    if befehl == "ende":
        break
    teile = befehl.split(" ", 1)
    if teile[0] == "geh" and len(teile) == 2:
        richtung = teile[1]
        if richtung not in welt[raum]["ausgaenge"]:
            print("Da geht's nicht weiter.")
            continue
        if raum == "Labor" and richtung == "nord" and "Schlüssel" not in inventar:
            print("Die Tür ist verschlossen. 🔒")
            continue
        raum = welt[raum]["ausgaenge"][richtung]
        zuege += 1
        beschreibe(raum)
        if raum == "Serverraum":
            print(f"🏆 Gewonnen in {zuege} Zügen!")
            break
    elif befehl == "nimm":
        ding = welt[raum]["ding"]
        if ding:
            inventar.append(ding)
            welt[raum]["ding"] = None
            print(f"Du nimmst: {ding}")
        else:
            print("Hier ist nichts.")
    elif befehl == "inventar":
        print("Inventar: " + (", ".join(inventar) if inventar else "leer"))
    else:
        print("?")`,
    },
  ],
});
