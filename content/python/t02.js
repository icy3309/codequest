'use strict';
/* Thema 2: Entscheidungen */
addTopic('python', {
  n: 2, title: 'Entscheidungen', desc: 'Vergleiche, if/elif/else, Logik',
  levels: [
    {
      id: 'py-02-01', title: 'Vergleiche & Wahrheitswerte',
      lesson: [
        "Programme müssen Entscheidungen treffen. Die Grundlage sind **Vergleiche** – ihr Ergebnis ist immer `True` oder `False` (Typ `bool`).",
        "Achtung: Ein einzelnes `=` weist zu, **zwei** `==` vergleichen!",
        "Texte kann man auch vergleichen: `\"Apfel\" == \"apfel\"` ist `False`, weil Groß-/Kleinschreibung zählt.",
      ],
      commands: [
        ['a == b', 'gleich'],
        ['a != b', 'ungleich'],
        ['a < b   a > b', 'kleiner / größer'],
        ['a <= b  a >= b', 'kleiner-gleich / größer-gleich'],
      ],
      example: code`alter = 15
print(alter >= 18)
print(alter == 15)
ist_teen = 13 <= alter <= 19
print(ist_teen)`,
      exampleOut: 'False\nTrue\nTrue',
      task: [
        "Gegeben sind `punkte = 73` und `bestanden_ab = 50`.",
        "Lege eine Variable `bestanden` an, die `True` ist, wenn `punkte` mindestens `bestanden_ab` ist. Lege außerdem `volle_punktzahl` an, die prüft, ob `punkte` genau `100` ist. Gib beide aus.",
      ],
      starter: code`punkte = 73
bestanden_ab = 50
`,
      tests: [
        { type: 'out', expect: 'True\nFalse' },
        { type: 'assert', code: 'assert bestanden is True and volle_punktzahl is False', msg: '`bestanden` und `volle_punktzahl` sind Wahrheitswerte' },
        { type: 'src', pattern: 'bestanden\\s*=\\s*.*(>=|<=|<|>)', msg: '`bestanden` wird mit einem Vergleich berechnet' },
        { type: 'src', pattern: 'volle_punktzahl\\s*=\\s*.*==', msg: '`volle_punktzahl` benutzt `==`' },
      ],
      hints: ['`bestanden = punkte >= bestanden_ab`', '`volle_punktzahl = punkte == 100`'],
      solution: code`punkte = 73
bestanden_ab = 50
bestanden = punkte >= bestanden_ab
volle_punktzahl = punkte == 100
print(bestanden)
print(volle_punktzahl)`,
    },
    {
      id: 'py-02-02', title: 'if & else',
      lesson: [
        "Mit `if` führst du Code **nur dann** aus, wenn eine Bedingung wahr ist. Mit `else` gibst du an, was sonst passiert.",
        "Wichtig: Nach der Bedingung kommt ein **Doppelpunkt** `:` und der Block darunter wird **eingerückt** (4 Leerzeichen bzw. Tab-Taste). Die Einrückung zeigt Python, was zum `if` gehört.",
      ],
      commands: [
        ['if bedingung:', 'Block nur wenn wahr'],
        ['else:', 'sonst-Block'],
        ['    (4 Leerzeichen)', 'Einrückung = gehört zum Block'],
      ],
      example: code`temp = int(input("Temperatur? "))
if temp > 25:
    print("Ab ins Freibad!")
else:
    print("Lieber Kino.")
print("Schönen Tag!")   # nicht eingerückt → immer`,
      exampleOut: 'Ab ins Freibad!\nSchönen Tag!',
      task: [
        "Lies eine Zahl ein. Ist sie **gerade**, gib `gerade` aus, sonst `ungerade`.",
        "Tipp aus Thema 1: Der Rest `%` hilft – eine Zahl ist gerade, wenn `zahl % 2 == 0`.",
      ],
      starter: code`zahl = int(input("Zahl? "))
`,
      tests: [
        { type: 'out', input: ['4'], expect: 'gerade' },
        { type: 'out', input: ['7'], expect: 'ungerade' },
      ],
      hidden: [{ type: 'out', input: ['0'], expect: 'gerade' }, { type: 'out', input: ['-3'], expect: 'ungerade' }],
      hints: ['```\nif zahl % 2 == 0:\n    print("gerade")\n```', 'Vergiss den Doppelpunkt nach `else` nicht.'],
      solution: code`zahl = int(input("Zahl? "))
if zahl % 2 == 0:
    print("gerade")
else:
    print("ungerade")`,
    },
    {
      id: 'py-02-03', title: 'elif – mehrere Fälle',
      lesson: [
        "Mit `elif` (kurz für *else if*) prüfst du weitere Bedingungen. Python geht **von oben nach unten** und führt nur den **ersten** passenden Block aus.",
        "Darum ist die Reihenfolge wichtig: Prüf zuerst den strengsten Fall.",
      ],
      commands: [
        ['if a:', 'erster Fall'],
        ['elif b:', 'sonst, wenn b'],
        ['else:', 'alles andere'],
      ],
      example: code`stunde = 14
if stunde < 12:
    print("Guten Morgen")
elif stunde < 18:
    print("Guten Tag")
else:
    print("Guten Abend")`,
      exampleOut: 'Guten Tag',
      task: [
        "Lies eine Punktzahl (0–100) ein und gib die Note aus:",
        "- ab 90: `sehr gut`\n- ab 75: `gut`\n- ab 50: `bestanden`\n- darunter: `nicht bestanden`",
      ],
      starter: code`punkte = int(input("Punkte? "))
`,
      tests: [
        { type: 'out', input: ['95'], expect: 'sehr gut' },
        { type: 'out', input: ['80'], expect: 'gut' },
        { type: 'out', input: ['50'], expect: 'bestanden' },
        { type: 'out', input: ['12'], expect: 'nicht bestanden' },
      ],
      hidden: [{ type: 'out', input: ['90'], expect: 'sehr gut' }, { type: 'out', input: ['75'], expect: 'gut' }, { type: 'out', input: ['49'], expect: 'nicht bestanden' }],
      hints: ['Fang mit `if punkte >= 90:` an, dann `elif punkte >= 75:` …', '„ab 90“ heißt `>= 90`, nicht `> 90`.'],
      solution: code`punkte = int(input("Punkte? "))
if punkte >= 90:
    print("sehr gut")
elif punkte >= 75:
    print("gut")
elif punkte >= 50:
    print("bestanden")
else:
    print("nicht bestanden")`,
    },
    {
      id: 'py-02-04', title: 'and, or, not',
      lesson: [
        "Bedingungen lassen sich verknüpfen:",
        "- `a and b` – **beide** müssen wahr sein\n- `a or b` – **mindestens eine** muss wahr sein\n- `not a` – dreht den Wert um",
        "Du kannst `if`s auch **verschachteln** (ein `if` im Block eines anderen) – oft ist `and` aber übersichtlicher.",
      ],
      commands: [
        ['a and b', 'beide wahr'],
        ['a or b', 'mindestens eins wahr'],
        ['not a', 'Gegenteil'],
        ['x in ("a", "b")', 'ist x einer dieser Werte?'],
      ],
      example: code`alter = 16
mit_eltern = True
if alter >= 18 or mit_eltern:
    print("Einlass ok")
wochenende = False
if not wochenende:
    print("Schule!")`,
      exampleOut: 'Einlass ok\nSchule!',
      task: [
        "Ein Freizeitpark: Für die Achterbahn muss man **mindestens 140 cm** groß **und** **mindestens 10 Jahre** alt sein.",
        "Lies zuerst die Größe, dann das Alter ein. Gib `Einsteigen!` aus, wenn beides passt, sonst `Leider nicht.`",
      ],
      starter: code`groesse = int(input("Größe in cm? "))
alter = int(input("Alter? "))
`,
      tests: [
        { type: 'out', input: ['150', '12'], expect: 'Einsteigen!' },
        { type: 'out', input: ['130', '12'], expect: 'Leider nicht.' },
        { type: 'out', input: ['160', '9'], expect: 'Leider nicht.' },
      ],
      hidden: [{ type: 'out', input: ['140', '10'], expect: 'Einsteigen!' }, { type: 'out', input: ['120', '8'], expect: 'Leider nicht.' }],
      hints: ['`if groesse >= 140 and alter >= 10:`'],
      solution: code`groesse = int(input("Größe in cm? "))
alter = int(input("Alter? "))
if groesse >= 140 and alter >= 10:
    print("Einsteigen!")
else:
    print("Leider nicht.")`,
    },
    {
      id: 'py-02-p', kind: 'project', title: 'Ticket-Automat',
      lesson: [
        "🛠 **Projekt: Ticket-Automat fürs Kino.** Der Automat fragt nach dem Alter, berechnet den Preis, gibt Rabatte und prüft, ob das Geld reicht.",
        "Preise: Kinder **unter 12**: 6 €, Jugendliche **12–17**: 8 €, Erwachsene **ab 18**: 11 €.",
      ],
      commands: [
        ['if / elif / else', 'Fälle unterscheiden'],
        ['and / or', 'Bedingungen verknüpfen'],
        ['f"{x:.2f}"', 'zwei Nachkommastellen'],
      ],
      starter: code`alter = int(input("Alter? "))
`,
      steps: [
        {
          title: 'Grundpreis',
          task: ["Lies das Alter ein und gib den Preis aus: `Preis: 6 Euro` / `Preis: 8 Euro` / `Preis: 11 Euro`."],
          tests: [
            { type: 'has', input: ['8', 'nein', '20'], expect: 'Preis: 6 Euro', label: 'Kind (8)' },
            { type: 'has', input: ['15', 'nein', '20'], expect: 'Preis: 8 Euro', label: 'Jugendlich (15)' },
            { type: 'has', input: ['30', 'nein', '20'], expect: 'Preis: 11 Euro', label: 'Erwachsen (30)' },
            { type: 'has', input: ['12', 'nein', '20'], expect: 'Preis: 8 Euro', label: 'Grenzfall 12' },
          ],
          hints: ['Speichere den Preis in einer Variable `preis` – die brauchst du später noch.'],
        },
        {
          title: 'Studi-Rabatt',
          task: [
            "Frag danach: `Student? (ja/nein)`. Wer **ab 18** ist **und** `ja` antwortet, bekommt 3 € Rabatt. Gib dann zusätzlich aus: `Zu zahlen: X Euro`.",
            "Wer keinen Rabatt bekommt, zahlt den Grundpreis.",
          ],
          tests: [
            { type: 'has', input: ['25', 'ja', '20'], expect: 'Zu zahlen: 8 Euro', label: 'Student, 25' },
            { type: 'has', input: ['25', 'nein', '20'], expect: 'Zu zahlen: 11 Euro', label: 'kein Student, 25' },
            { type: 'has', input: ['15', 'ja', '20'], expect: 'Zu zahlen: 8 Euro', label: '15 und „ja“ → kein Rabatt' },
          ],
          hints: ['`if alter >= 18 and student == "ja":` → `preis = preis - 3`'],
        },
        {
          title: 'Bezahlen',
          task: [
            "Frag zum Schluss nach dem eingeworfenen Geld (ganze Euro). Reicht es, gib `Rückgeld: X Euro` aus. Reicht es nicht, gib `Es fehlen X Euro` aus.",
          ],
          tests: [
            { type: 'has', input: ['25', 'ja', '20'], expect: 'Rückgeld: 12 Euro', label: '20 € für 8 €' },
            { type: 'has', input: ['30', 'nein', '5'], expect: 'Es fehlen 6 Euro', label: '5 € für 11 €' },
            { type: 'has', input: ['8', 'nein', '6'], expect: 'Rückgeld: 0 Euro', label: 'passend bezahlt' },
          ],
          hints: ['`geld = int(input("Geld? "))` – dann `if geld >= preis:` …'],
        },
      ],
      solution: code`alter = int(input("Alter? "))
if alter < 12:
    preis = 6
elif alter < 18:
    preis = 8
else:
    preis = 11
print(f"Preis: {preis} Euro")
student = input("Student? (ja/nein) ")
if alter >= 18 and student == "ja":
    preis = preis - 3
print(f"Zu zahlen: {preis} Euro")
geld = int(input("Geld? "))
if geld >= preis:
    print(f"Rückgeld: {geld - preis} Euro")
else:
    print(f"Es fehlen {preis - geld} Euro")`,
    },
  ],
});
