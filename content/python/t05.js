'use strict';
/* Thema 5: Listen & Tupel */
addTopic('python', {
  n: 5, title: 'Listen & Tupel', desc: 'Sammlungen von Werten',
  levels: [
    {
      id: 'py-05-01', title: 'Listen anlegen',
      lesson: [
        "Eine **Liste** speichert mehrere Werte in einer Variable – in eckigen Klammern, getrennt durch Kommas: `noten = [2, 1, 3]`.",
        "Indizes und Slicing funktionieren wie bei Strings (`liste[0]`, `liste[-1]`, `liste[1:3]`). Anders als Strings sind Listen aber **veränderbar**: `liste[0] = 5` überschreibt ein Element.",
        "`len()`, `sum()`, `min()` und `max()` funktionieren direkt mit Zahlenlisten.",
      ],
      commands: [
        ['liste = [1, 2, 3]', 'Liste anlegen'],
        ['liste[0] = 9', 'Element ändern'],
        ['len(liste)', 'Anzahl Elemente'],
        ['sum() / min() / max()', 'Summe, Minimum, Maximum'],
      ],
      example: code`temps = [18, 21, 25, 19]
print(temps[0], temps[-1])
temps[1] = 22
print(temps)
print(max(temps), sum(temps) / len(temps))`,
      exampleOut: '18 19\n[18, 22, 25, 19]\n25 21.0',
      task: [
        "Gegeben ist die Liste `punkte = [12, 7, 19, 3, 15]`.",
        "Gib in drei Zeilen aus: die **höchste** Punktzahl, die **niedrigste** und den **Durchschnitt** auf 1 Nachkommastelle gerundet. Ändere danach den zweiten Wert auf `10` und gib die ganze Liste aus.",
      ],
      starter: code`punkte = [12, 7, 19, 3, 15]
`,
      tests: [
        { type: 'out', expect: '19\n3\n11.2\n[12, 10, 19, 3, 15]' },
        { type: 'nosrc', pattern: 'print\\(\\s*(19|3|11\\.2)\\s*\\)', msg: 'Werte werden berechnet, nicht eingetippt' },
      ],
      hints: ['`max(punkte)`, `min(punkte)`, `round(sum(punkte) / len(punkte), 1)`', 'Der zweite Wert hat den Index `1`: `punkte[1] = 10`'],
      solution: code`punkte = [12, 7, 19, 3, 15]
print(max(punkte))
print(min(punkte))
print(round(sum(punkte) / len(punkte), 1))
punkte[1] = 10
print(punkte)`,
    },
    {
      id: 'py-05-02', title: 'Listen-Methoden',
      lesson: [
        "Listen kann man wachsen und schrumpfen lassen:",
        "- `append(x)` hängt hinten an\n- `insert(i, x)` fügt an Position i ein\n- `remove(x)` entfernt den ersten Wert x\n- `pop()` entfernt das letzte Element **und gibt es zurück**\n- `sort()` sortiert die Liste selbst, `sorted(liste)` gibt eine sortierte Kopie\n- `x in liste` prüft, ob x enthalten ist",
        "Eine leere Liste ist `[]` – perfekt, um sie in einer Schleife zu füllen.",
      ],
      commands: [
        ['liste.append(x)', 'anhängen'],
        ['liste.remove(x)', 'Wert entfernen'],
        ['liste.pop()', 'letztes entfernen'],
        ['liste.sort()', 'sortieren'],
        ['x in liste', 'enthalten?'],
      ],
      example: code`team = ["Mia", "Ben"]
team.append("Lea")
team.insert(0, "Tom")
team.remove("Ben")
team.sort()
print(team, len(team))`,
      exampleOut: "['Lea', 'Mia', 'Tom'] 3",
      task: [
        "Lies Namen ein, bis eine **leere Eingabe** kommt. Jeder Name wird zur Liste hinzugefügt – aber nur, wenn er **noch nicht** drin ist.",
        "Gib dann die Liste **sortiert** aus, einen Namen pro Zeile, und zum Schluss `Anzahl: X`.",
      ],
      starter: code`namen = []
while True:
    name = input("Name (leer = fertig)? ")
`,
      tests: [
        { type: 'out', input: ['Tom', 'Anna', 'Tom', 'Ben', ''], expect: 'Anna\nBen\nTom\nAnzahl: 3' },
        { type: 'out', input: [''], expect: 'Anzahl: 0' },
        { type: 'src', pattern: '\\.append\\(', msg: 'Benutzt `.append()`' },
      ],
      hidden: [{ type: 'out', input: ['zoe', 'Zoe', 'adam', ''], expect: 'Zoe\nadam\nzoe\nAnzahl: 3' }],
      hints: ['Abbruch: `if name == "": break`', 'Doppelte vermeiden: `if name not in namen: namen.append(name)`', 'Nach der Schleife: `namen.sort()` und `for n in namen: print(n)`'],
      solution: code`namen = []
while True:
    name = input("Name (leer = fertig)? ")
    if name == "":
        break
    if name not in namen:
        namen.append(name)
namen.sort()
for n in namen:
    print(n)
print(f"Anzahl: {len(namen)}")`,
    },
    {
      id: 'py-05-03', title: 'Durchlaufen & filtern',
      lesson: [
        "Mit `for x in liste:` gehst du jedes Element durch. Brauchst du zusätzlich die Position, nimm `enumerate`: `for i, x in enumerate(liste):`.",
        "Ein häufiges Muster ist **Filtern**: eine neue, leere Liste anlegen und nur die passenden Elemente anhängen.",
        "Texte zerlegen und zusammensetzen: `\"a b c\".split()` → `['a', 'b', 'c']`, und `\", \".join(liste)` klebt eine Liste von Strings zusammen.",
      ],
      commands: [
        ['for x in liste:', 'jedes Element'],
        ['for i, x in enumerate(liste):', 'mit Index'],
        ['text.split()', 'Text → Liste (an Leerzeichen)'],
        ['", ".join(liste)', 'Liste → Text'],
      ],
      example: code`einkauf = ["Milch", "Brot", "Eier"]
for i, ding in enumerate(einkauf, start=1):
    print(f"{i}. {ding}")
woerter = "das ist ein test".split()
lange = []
for w in woerter:
    if len(w) > 3:
        lange.append(w)
print(", ".join(lange))`,
      exampleOut: '1. Milch\n2. Brot\n3. Eier\ntest',
      task: [
        "Lies eine Zeile mit Zahlen ein, getrennt durch Leerzeichen (z. B. `4 15 8 23 42`).",
        "Gib alle Zahlen aus, die **größer als 10** sind – in einer Zeile, getrennt durch Komma und Leerzeichen. Gib in der zweiten Zeile ihre **Summe** aus.",
        "`4 15 8 23 42` → `15, 23, 42` und `80`.",
      ],
      starter: code`zeile = input("Zahlen? ")
teile = zeile.split()
`,
      tests: [
        { type: 'out', input: ['4 15 8 23 42'], expect: '15, 23, 42\n80' },
        { type: 'out', input: ['11 2 30'], expect: '11, 30\n41' },
      ],
      hidden: [{ type: 'out', input: ['1 2 3'], expect: '\n0' }, { type: 'out', input: ['100'], expect: '100\n100' }],
      hints: ['Die Teile sind Strings – wandle jedes mit `int(t)` um.', 'Sammle die großen Zahlen in `gross = []`. Für `join` brauchst du Strings: `", ".join(str(z) for z in gross)` – oder sammle gleich `t` (den String) in einer zweiten Liste.'],
      solution: code`zeile = input("Zahlen? ")
teile = zeile.split()
gross = []
for t in teile:
    z = int(t)
    if z > 10:
        gross.append(z)
print(", ".join(str(z) for z in gross))
print(sum(gross))`,
    },
    {
      id: 'py-05-04', title: 'Tupel & Entpacken',
      lesson: [
        "Ein **Tupel** ist wie eine Liste, aber **unveränderlich** – mit runden Klammern: `punkt = (3, 4)`. Gut für Dinge, die zusammengehören und sich nicht ändern sollen (Koordinaten, Datum, Name + Alter).",
        "**Entpacken**: `x, y = punkt` verteilt die Werte auf zwei Variablen. Damit kann man sogar elegant tauschen: `a, b = b, a`.",
        "Listen von Tupeln sind sehr praktisch: `for name, alter in personen:`.",
      ],
      commands: [
        ['t = (1, 2)', 'Tupel'],
        ['a, b = t', 'entpacken'],
        ['a, b = b, a', 'tauschen'],
        ['for x, y in paare:', 'Paare durchlaufen'],
        ['zip(a, b)', 'zwei Listen paarweise'],
      ],
      example: code`spieler = [("Mia", 120), ("Ben", 95), ("Lea", 140)]
for name, punkte in spieler:
    print(f"{name}: {punkte}")
a, b = 1, 2
a, b = b, a
print(a, b)`,
      exampleOut: 'Mia: 120\nBen: 95\nLea: 140\n2 1',
      task: [
        "Gegeben ist `staedte = [(\"Berlin\", 3.7), (\"Hamburg\", 1.9), (\"München\", 1.5), (\"Köln\", 1.1)]` (Einwohner in Millionen).",
        "Finde die Stadt mit den **meisten** Einwohnern **mit einer Schleife** (ohne `max`) und gib aus: `Berlin hat 3.7 Mio. Einwohner`. Gib in der zweiten Zeile die Gesamtzahl aus: `Gesamt: 8.2 Mio.` (auf 1 Stelle gerundet).",
      ],
      starter: code`staedte = [("Berlin", 3.7), ("Hamburg", 1.9), ("München", 1.5), ("Köln", 1.1)]
`,
      tests: [
        { type: 'out', expect: 'Berlin hat 3.7 Mio. Einwohner\nGesamt: 8.2 Mio.' },
        { type: 'src', pattern: 'for\\s+\\w+\\s*,\\s*\\w+\\s+in', msg: 'Entpackt die Tupel in der `for`-Schleife' },
        { type: 'nosrc', pattern: '\\bmax\\(', msg: 'Ohne `max()` – mit einer eigenen Schleife' },
      ],
      hints: ['Merke dir den bisher besten: `best_name, best_ew = staedte[0]`', 'In der Schleife: `if ew > best_ew: best_name, best_ew = name, ew` – und nebenbei `gesamt += ew`.'],
      solution: code`staedte = [("Berlin", 3.7), ("Hamburg", 1.9), ("München", 1.5), ("Köln", 1.1)]
best_name, best_ew = staedte[0]
gesamt = 0
for name, ew in staedte:
    if ew > best_ew:
        best_name, best_ew = name, ew
    gesamt += ew
print(f"{best_name} hat {best_ew} Mio. Einwohner")
print(f"Gesamt: {round(gesamt, 1)} Mio.")`,
    },
    {
      id: 'py-05-p', kind: 'project', title: 'Einkaufslisten-Manager',
      lesson: [
        "🛠 **Projekt: Einkaufslisten-Manager.** Ein kleines Kommandozeilen-Programm, das Befehle versteht – so funktionieren viele echte Tools!",
        "Das Programm liest Befehle in einer Schleife, bis `ende` kommt. Ein Befehl besteht aus einem Wort und evtl. einem Argument: `add Milch`. Mit `befehl.split(\" \", 1)` trennst du in höchstens 2 Teile.",
      ],
      commands: [
        ['teile = zeile.split(" ", 1)', 'in Befehl + Rest teilen'],
        ['cmd = teile[0]', 'erstes Wort'],
        ['len(teile) > 1', 'gibt es ein Argument?'],
        ['enumerate(liste, 1)', 'nummerieren ab 1'],
      ],
      starter: code`liste = []
while True:
    zeile = input("> ")
    if zeile == "ende":
        break
`,
      steps: [
        {
          title: 'add & zeigen',
          task: [
            "Unterstütze zwei Befehle:",
            "- `add DING` hängt DING an die Liste an und gibt `+ DING` aus\n- `zeigen` gibt die Liste nummeriert aus (`1. Milch`) – oder `Liste ist leer.`",
          ],
          tests: [
            { type: 'has', input: ['add Milch', 'add Brot', 'zeigen', 'ende'], expect: '+ Milch\n+ Brot\n1. Milch\n2. Brot', label: 'zwei Sachen' },
            { type: 'has', input: ['zeigen', 'ende'], expect: 'Liste ist leer.', label: 'leere Liste' },
            { type: 'has', input: ['add Bio Eier', 'zeigen', 'ende'], expect: '+ Bio Eier\n1. Bio Eier', label: 'Ding mit Leerzeichen' },
          ],
          hints: ['`teile = zeile.split(" ", 1)` → bei `add Bio Eier` ist `teile[1]` gleich `"Bio Eier"`.', 'Nummerieren: `for i, ding in enumerate(liste, 1): print(f"{i}. {ding}")`'],
        },
        {
          title: 'weg & Fehler',
          task: [
            "Neue Befehle:",
            "- `weg DING` entfernt DING und gibt `- DING` aus. Ist es nicht auf der Liste: `DING ist nicht auf der Liste.`\n- Unbekannte Befehle: `Unbekannter Befehl: XYZ` (nur das erste Wort)",
          ],
          tests: [
            { type: 'has', input: ['add Milch', 'weg Milch', 'zeigen', 'ende'], expect: '+ Milch\n- Milch\nListe ist leer.', label: 'entfernen' },
            { type: 'has', input: ['weg Käse', 'ende'], expect: 'Käse ist nicht auf der Liste.', label: 'nicht vorhanden' },
            { type: 'has', input: ['tanzen jetzt', 'ende'], expect: 'Unbekannter Befehl: tanzen', label: 'unbekannter Befehl' },
          ],
          hints: ['`if ding in liste: liste.remove(ding)`'],
        },
        {
          title: 'Sortieren & zählen',
          task: [
            "Letzte Befehle:",
            "- `sort` sortiert die Liste alphabetisch und gibt `Sortiert.` aus\n- Beim Beenden (`ende`) gibt das Programm `Tschüss! X Sachen auf der Liste.` aus",
          ],
          tests: [
            { type: 'out', input: ['add Zucker', 'add Apfel', 'sort', 'zeigen', 'ende'], expect: '+ Zucker\n+ Apfel\nSortiert.\n1. Apfel\n2. Zucker\nTschüss! 2 Sachen auf der Liste.', label: 'sortieren' },
            { type: 'has', input: ['ende'], expect: 'Tschüss! 0 Sachen auf der Liste.', label: 'Abschied' },
          ],
          hints: ['Den Abschied druckst du direkt vor dem `break`.'],
        },
      ],
      solution: code`liste = []
while True:
    zeile = input("> ")
    if zeile == "ende":
        print(f"Tschüss! {len(liste)} Sachen auf der Liste.")
        break
    teile = zeile.split(" ", 1)
    cmd = teile[0]
    arg = teile[1] if len(teile) > 1 else ""
    if cmd == "add":
        liste.append(arg)
        print(f"+ {arg}")
    elif cmd == "zeigen":
        if not liste:
            print("Liste ist leer.")
        for i, ding in enumerate(liste, 1):
            print(f"{i}. {ding}")
    elif cmd == "weg":
        if arg in liste:
            liste.remove(arg)
            print(f"- {arg}")
        else:
            print(f"{arg} ist nicht auf der Liste.")
    elif cmd == "sort":
        liste.sort()
        print("Sortiert.")
    else:
        print(f"Unbekannter Befehl: {cmd}")`,
    },
  ],
});
