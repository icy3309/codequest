'use strict';
/* Thema 7: Funktionen */
addTopic('python', {
  n: 7, title: 'Funktionen', desc: 'def, Parameter, return, lambda',
  levels: [
    {
      id: 'py-07-01', title: 'def & return',
      lesson: [
        "Mit `def` baust du eigene **Funktionen** – wiederverwendbare Code-Bausteine mit Namen. Sie bekommen **Parameter** (Eingaben) und geben mit `return` ein **Ergebnis** zurück.",
        "Wichtig: `return` ist nicht `print`! `print` zeigt etwas an, `return` gibt einen Wert an den Aufrufer zurück, der damit weiterrechnen kann. Nach `return` ist die Funktion sofort beendet.",
        "Ab jetzt prüfen die Tests oft direkt deine Funktion, z. B. ob `quadrat(4)` wirklich `16` **zurückgibt**.",
      ],
      commands: [
        ['def name(param):', 'Funktion definieren'],
        ['    return wert', 'Ergebnis zurückgeben'],
        ['x = name(5)', 'aufrufen und Ergebnis speichern'],
      ],
      example: code`def brutto(netto):
    return netto * 1.19

preis = brutto(100)
print(round(preis, 2))
print(brutto(10) + brutto(20))`,
      exampleOut: '119.0\n35.7',
      task: [
        "Schreib eine Funktion `celsius_zu_fahrenheit(c)`, die eine Temperatur in Celsius in Fahrenheit umrechnet und **zurückgibt**: `F = C × 9/5 + 32`.",
        "Schreib außerdem `ist_heiss(c)`, die `True` zurückgibt, wenn es **über 30 °C** sind, sonst `False`.",
      ],
      starter: code`def celsius_zu_fahrenheit(c):
    pass  # ersetze pass durch deinen Code
`,
      tests: [
        { type: 'eval', expr: 'celsius_zu_fahrenheit(0)', expect: '32' },
        { type: 'eval', expr: 'celsius_zu_fahrenheit(100)', expect: '212' },
        { type: 'eval', expr: 'ist_heiss(35)', expect: 'True' },
        { type: 'eval', expr: 'ist_heiss(30)', expect: 'False' },
      ],
      hidden: [{ type: 'eval', expr: 'celsius_zu_fahrenheit(-40)', expect: '-40' }, { type: 'eval', expr: 'celsius_zu_fahrenheit(37)', expect: '98.6' }],
      hints: ['`return c * 9 / 5 + 32`', '`ist_heiss` geht in einer Zeile: `return c > 30`'],
      solution: code`def celsius_zu_fahrenheit(c):
    return c * 9 / 5 + 32

def ist_heiss(c):
    return c > 30`,
    },
    {
      id: 'py-07-02', title: 'Parameter & Standardwerte',
      lesson: [
        "Funktionen können mehrere Parameter haben. Parameter mit **Standardwert** (`gruss=\"Hallo\"`) sind optional – sie müssen am Ende stehen.",
        "Beim Aufruf kannst du Argumente auch **mit Namen** übergeben: `begruessen(\"Mia\", gruss=\"Hi\")`. Das macht Code lesbarer.",
        "Eine Funktion kann auch **mehrere Werte** zurückgeben – als Tupel: `return mini, maxi` und dann `a, b = f(...)`.",
      ],
      commands: [
        ['def f(a, b=10):', 'b ist optional'],
        ['f(1, b=5)', 'benanntes Argument'],
        ['return a, b', 'zwei Werte zurück'],
      ],
      example: code`def begruessen(name, gruss="Hallo", laut=False):
    text = f"{gruss}, {name}!"
    if laut:
        text = text.upper()
    return text

print(begruessen("Mia"))
print(begruessen("Ben", laut=True))`,
      exampleOut: 'Hallo, Mia!\nHALLO, BEN!',
      task: [
        "Schreib `preis_berechnen(netto, rabatt=0, versand=4.99)`: Vom Nettopreis wird `rabatt` **Prozent** abgezogen, dann kommen die Versandkosten dazu. Ab einem (rabattierten) Warenwert von **50** ist der Versand **gratis**. Gib das Ergebnis auf 2 Stellen gerundet zurück.",
        "Schreib außerdem `min_max(zahlen)`, die die kleinste und größte Zahl einer Liste als Tupel zurückgibt.",
      ],
      starter: code`def preis_berechnen(netto, rabatt=0, versand=4.99):
    pass
`,
      tests: [
        { type: 'eval', expr: 'preis_berechnen(20)', expect: '24.99' },
        { type: 'eval', expr: 'preis_berechnen(60)', expect: '60' },
        { type: 'eval', expr: 'preis_berechnen(60, rabatt=50)', expect: '34.99' },
        { type: 'eval', expr: 'preis_berechnen(10, versand=2)', expect: '12' },
        { type: 'eval', expr: 'min_max([4, 9, 1, 7])', expect: '(1, 9)' },
      ],
      hidden: [{ type: 'eval', expr: 'preis_berechnen(100, 10)', expect: '90' }, { type: 'eval', expr: 'min_max([5])', expect: '(5, 5)' }],
      hints: ['`ware = netto * (1 - rabatt / 100)`', '`if ware >= 50: versand = 0` – dann `return round(ware + versand, 2)`', '`return min(zahlen), max(zahlen)`'],
      solution: code`def preis_berechnen(netto, rabatt=0, versand=4.99):
    ware = netto * (1 - rabatt / 100)
    if ware >= 50:
        versand = 0
    return round(ware + versand, 2)

def min_max(zahlen):
    return min(zahlen), max(zahlen)`,
    },
    {
      id: 'py-07-03', title: 'Gültigkeitsbereich',
      lesson: [
        "Variablen, die **in** einer Funktion entstehen, sind **lokal** – sie existieren nur während des Aufrufs und sind außen unsichtbar. Das ist gut so: Funktionen stören sich nicht gegenseitig.",
        "Eine Funktion kann globale Variablen **lesen**, aber nicht einfach **ändern**. Der saubere Weg: Werte als Parameter hineingeben und das Ergebnis mit `return` herausgeben.",
        "Listen sind eine Ausnahme mit Falle: Wird eine Liste übergeben und in der Funktion mit `.append()` verändert, ändert sich auch das Original (es ist dasselbe Objekt).",
      ],
      commands: [
        ['lokale Variable', 'nur in der Funktion sichtbar'],
        ['return', 'Ergebnis nach außen geben'],
        ['liste.copy()', 'Kopie statt Original verändern'],
      ],
      example: code`punkte = 10

def bonus(p):
    extra = 5          # lokal
    return p + extra

punkte = bonus(punkte)
print(punkte)
# print(extra) → NameError: extra gibt es außen nicht`,
      exampleOut: '15',
      task: [
        "Hier ist ein Kontostand-Programm mit einem Fehler – die Funktion versucht, eine globale Variable zu verändern, und es kracht mit `UnboundLocalError`.",
        "Baue `einzahlen` so um, dass sie `(stand, betrag)` als Parameter bekommt und den **neuen Stand zurückgibt**. Negative Beträge sollen ignoriert werden (Stand bleibt gleich). Die Ausgabe unten soll `150` und dann `150` zeigen.",
      ],
      starter: code`stand = 100

def einzahlen(betrag):
    stand = stand + betrag
    return stand

stand = einzahlen(50)
print(stand)
stand = einzahlen(-30)
print(stand)`,
      tests: [
        { type: 'eval', expr: 'einzahlen(100, 50)', expect: '150' },
        { type: 'eval', expr: 'einzahlen(80, -30)', expect: '80' },
        { type: 'out', expect: '150\n150' },
        { type: 'nosrc', pattern: '\\bglobal\\b', msg: 'Ohne `global` – mit Parameter und `return`' },
      ],
      hints: ['`def einzahlen(stand, betrag):`', 'Aufruf: `stand = einzahlen(stand, 50)`'],
      solution: code`stand = 100

def einzahlen(stand, betrag):
    if betrag < 0:
        return stand
    return stand + betrag

stand = einzahlen(stand, 50)
print(stand)
stand = einzahlen(stand, -30)
print(stand)`,
    },
    {
      id: 'py-07-04', title: 'lambda & sorted',
      lesson: [
        "Funktionen sind in Python auch nur Werte – man kann sie anderen Funktionen übergeben! Das wichtigste Beispiel: `sorted(liste, key=…)` sortiert nach dem, was die `key`-Funktion für jedes Element liefert.",
        "Für solche kleinen Wegwerf-Funktionen gibt es **lambda**: `lambda x: x * 2` ist eine Funktion ohne Namen, die `x * 2` zurückgibt.",
        "Weitere Helfer, die eine Funktion annehmen: `max(…, key=…)`, `min(…, key=…)`.",
      ],
      commands: [
        ['lambda x: ausdruck', 'Mini-Funktion'],
        ['sorted(l, key=len)', 'nach Länge sortieren'],
        ['sorted(l, key=lambda p: p[1])', 'nach 2. Wert sortieren'],
        ['reverse=True', 'absteigend'],
      ],
      example: code`woerter = ["Kiwi", "Ananas", "Apfel"]
print(sorted(woerter, key=len))
spieler = [("Mia", 30), ("Ben", 45), ("Lea", 12)]
print(max(spieler, key=lambda s: s[1]))`,
      exampleOut: "['Kiwi', 'Apfel', 'Ananas']\n('Ben', 45)",
      task: [
        "Schreib `rangliste(spieler)`: Sie bekommt eine Liste von Tupeln `(name, punkte)` und gibt eine **neue** Liste zurück – sortiert nach Punkten **absteigend**, bei Gleichstand **alphabetisch** nach Name.",
        "Tipp: Ein Sortierschlüssel kann auch ein Tupel sein: `key=lambda s: (-s[1], s[0])`.",
      ],
      starter: code`def rangliste(spieler):
    pass
`,
      tests: [
        { type: 'eval', expr: 'rangliste([("Mia", 30), ("Ben", 45), ("Lea", 12)])', expect: '[("Ben", 45), ("Mia", 30), ("Lea", 12)]' },
        { type: 'eval', expr: 'rangliste([("Zoe", 10), ("Ada", 10), ("Max", 20)])', expect: '[("Max", 20), ("Ada", 10), ("Zoe", 10)]' },
        { type: 'src', pattern: 'lambda', msg: 'Benutzt `lambda`' },
      ],
      hidden: [{ type: 'eval', expr: 'rangliste([])', expect: '[]' }],
      hints: ['`return sorted(spieler, key=lambda s: (-s[1], s[0]))`'],
      solution: code`def rangliste(spieler):
    return sorted(spieler, key=lambda s: (-s[1], s[0]))`,
    },
    {
      id: 'py-07-p', kind: 'project', title: 'Mini-Taschenrechner',
      lesson: [
        "🛠 **Projekt: Taschenrechner mit Funktionen.** Du zerlegst ein Problem in kleine Funktionen, die jede genau eine Sache gut machen – so arbeiten echte Programmierer.",
        "Am Ende versteht dein Rechner Eingaben wie `12 * 3` und rechnet so lange, bis `ende` eingegeben wird.",
      ],
      commands: [
        ['def f(a, op, b):', 'Funktion mit 3 Parametern'],
        ['zeile.split()', 'in Teile zerlegen'],
        ['float(x)', 'Text → Kommazahl'],
      ],
      starter: code`def rechne(a, op, b):
    pass
`,
      steps: [
        {
          title: 'rechne()',
          task: [
            "Schreib `rechne(a, op, b)`: `op` ist `\"+\"`, `\"-\"`, `\"*\"` oder `\"/\"`. Gib das Ergebnis zurück. Bei Division durch 0 oder unbekanntem Operator gib `None` zurück.",
          ],
          tests: [
            { type: 'eval', expr: 'rechne(2, "+", 3)', expect: '5' },
            { type: 'eval', expr: 'rechne(7, "-", 10)', expect: '-3' },
            { type: 'eval', expr: 'rechne(4, "*", 2.5)', expect: '10' },
            { type: 'eval', expr: 'rechne(9, "/", 2)', expect: '4.5' },
            { type: 'eval', expr: 'rechne(1, "/", 0)', expect: 'None' },
            { type: 'eval', expr: 'rechne(1, "%", 2)', expect: 'None' },
          ],
          hints: ['Eine `if/elif`-Kette über `op`.', 'Bei `/`: erst `if b == 0: return None`.'],
        },
        {
          title: 'parse()',
          task: [
            "Schreib `parse(zeile)`, die einen Text wie `\"12 * 3\"` in ein Tupel `(12.0, \"*\", 3.0)` zerlegt (Zahlen als `float`). Ist die Eingabe kaputt (nicht genau 3 Teile oder keine Zahlen), gib `None` zurück.",
            "Für „keine Zahl“ brauchst du `try/except` – das lernst du in Thema 8 richtig. Hier nur so viel: `float(\"abc\")` löst einen `ValueError` aus, den du so abfängst:",
            "```\ntry:\n    a = float(teile[0])\nexcept ValueError:\n    return None\n```",
          ],
          tests: [
            { type: 'eval', expr: 'parse("12 * 3")', expect: '(12.0, "*", 3.0)' },
            { type: 'eval', expr: 'parse("1.5 + 2")', expect: '(1.5, "+", 2.0)' },
            { type: 'eval', expr: 'parse("1 +")', expect: 'None' },
            { type: 'eval', expr: 'parse("a + 2")', expect: 'None' },
          ],
          hints: ['`teile = zeile.split()` und `if len(teile) != 3: return None`'],
        },
        {
          title: 'Rechner-Schleife',
          task: [
            "Baue die Schleife: Lies Zeilen, bis `ende` kommt. Gib für jede Zeile `= ERGEBNIS` aus – oder `Fehler!`, wenn `parse` oder `rechne` `None` liefert.",
            "Ganze Ergebnisse sollen ohne `.0` erscheinen: `12 * 3` → `= 36`, `9 / 2` → `= 4.5`. Tipp: `if erg == int(erg): erg = int(erg)`.",
          ],
          tests: [
            { type: 'out', input: ['12 * 3', '9 / 2', 'ende'], expect: '= 36\n= 4.5', label: 'zwei Rechnungen' },
            { type: 'out', input: ['5 / 0', 'hallo', '2 - 5', 'ende'], expect: 'Fehler!\nFehler!\n= -3', label: 'Fehler abfangen' },
          ],
          hints: ['`teile = parse(zeile)` → `if teile is None: print("Fehler!"); continue`', '`erg = rechne(*teile)` – der `*` verteilt das Tupel auf die drei Parameter.'],
        },
      ],
      solution: code`def rechne(a, op, b):
    if op == "+":
        return a + b
    elif op == "-":
        return a - b
    elif op == "*":
        return a * b
    elif op == "/":
        if b == 0:
            return None
        return a / b
    return None

def parse(zeile):
    teile = zeile.split()
    if len(teile) != 3:
        return None
    try:
        a = float(teile[0])
        b = float(teile[2])
    except ValueError:
        return None
    return a, teile[1], b

while True:
    zeile = input("> ")
    if zeile == "ende":
        break
    teile = parse(zeile)
    if teile is None:
        print("Fehler!")
        continue
    erg = rechne(*teile)
    if erg is None:
        print("Fehler!")
        continue
    if erg == int(erg):
        erg = int(erg)
    print(f"= {erg}")`,
    },
  ],
});
