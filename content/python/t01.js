'use strict';
/* Thema 1: Erste Schritte */
addTopic('python', {
  n: 1, title: 'Erste Schritte', desc: 'Ausgabe, Variablen, Rechnen, Eingabe',
  levels: [
    {
      id: 'py-01-01', title: 'Hallo, Welt!',
      lesson: [
        "Willkommen! Ein Programm ist eine Liste von Anweisungen, die der Computer **von oben nach unten** ausführt.",
        "Die wichtigste erste Anweisung ist `print()`. Alles, was du in die Klammern schreibst, wird ausgegeben. **Text** (ein **String**) steht dabei immer in Anführungszeichen – `\"so\"` oder `'so'`.",
        "Jedes `print()` beginnt eine neue Zeile. Zeilen, die mit `#` beginnen, sind **Kommentare** – Python ignoriert sie, sie sind Notizen für Menschen.",
      ],
      commands: [
        ['print("Text")', 'gibt den Text aus'],
        ['print("a", "b")', 'mehrere Werte, mit Leerzeichen getrennt'],
        ['print()', 'leere Zeile'],
        ['# Kommentar', 'wird ignoriert'],
      ],
      example: code`# Mein erstes Programm
print("Hallo!")
print("Ich lerne", "Python")`,
      exampleOut: 'Hallo!\nIch lerne Python',
      task: [
        "Gib genau diese zwei Zeilen aus:",
        "```\nHallo, Welt!\nIch programmiere jetzt.\n```",
      ],
      starter: code`# Schreib deinen Code hier
`,
      tests: [{ type: 'out', expect: 'Hallo, Welt!\nIch programmiere jetzt.' }],
      hints: ['Du brauchst zwei `print()`-Anweisungen – eine pro Zeile.', 'Achte auf Komma, Punkt und Großschreibung: `print("Hallo, Welt!")`'],
      solution: code`print("Hallo, Welt!")
print("Ich programmiere jetzt.")`,
    },
    {
      id: 'py-01-02', title: 'Variablen',
      lesson: [
        "Eine **Variable** ist ein Name für einen Wert – wie ein beschriftetes Kästchen. Mit `=` legst du etwas hinein: `alter = 16`.",
        "Das `=` heißt in Python **„bekommt den Wert“**, nicht „ist gleich“. Du kannst eine Variable später überschreiben.",
        "Variablennamen schreibt man klein, mit `_` statt Leerzeichen: `lieblings_farbe`. Sie dürfen nicht mit einer Zahl beginnen.",
        "Die wichtigsten **Datentypen**: `int` (ganze Zahl `7`), `float` (Kommazahl `3.5` – mit Punkt!), `str` (Text `\"hi\"`) und `bool` (`True`/`False`). `type(x)` verrät dir den Typ.",
      ],
      commands: [
        ['name = "Mia"', 'Variable mit Text'],
        ['punkte = 10', 'Variable mit ganzer Zahl'],
        ['preis = 2.5', 'Kommazahl (Punkt statt Komma!)'],
        ['print(name)', 'gibt den Inhalt aus (ohne Anführungszeichen!)'],
        ['type(preis)', 'Typ eines Werts'],
      ],
      example: code`stadt = "Berlin"
einwohner = 3700000
print(stadt, "hat", einwohner, "Einwohner")
stadt = "Hamburg"   # überschreiben
print(stadt)`,
      exampleOut: 'Berlin hat 3700000 Einwohner\nHamburg',
      task: [
        "Lege drei Variablen an: `name` mit dem Text `\"Alex\"`, `alter` mit der Zahl `17` und `lieblingsessen` mit `\"Pizza\"`.",
        "Gib dann mit **einem** `print()` aus: `Alex ist 17 und mag Pizza` – benutze dafür die Variablen, nicht den Text direkt.",
      ],
      starter: code`name = "Alex"
`,
      tests: [
        { type: 'assert', code: 'assert name == "Alex"', msg: '`name` enthält `"Alex"`' },
        { type: 'assert', code: 'assert alter == 17 and type(alter) is int', msg: '`alter` ist die Zahl `17` (ohne Anführungszeichen)' },
        { type: 'assert', code: 'assert lieblingsessen == "Pizza"', msg: '`lieblingsessen` enthält `"Pizza"`' },
        { type: 'out', expect: 'Alex ist 17 und mag Pizza' },
        { type: 'src', pattern: 'print\\(.*\\bname\\b.*\\balter\\b', msg: 'Die Ausgabe benutzt die Variablen' },
      ],
      hints: ['Zahlen schreibt man ohne Anführungszeichen: `alter = 17`', 'Mit Kommas trennen: `print(name, "ist", alter, ...)` – Python setzt die Leerzeichen automatisch.'],
      solution: code`name = "Alex"
alter = 17
lieblingsessen = "Pizza"
print(name, "ist", alter, "und mag", lieblingsessen)`,
    },
    {
      id: 'py-01-03', title: 'Rechnen',
      lesson: [
        "Python ist ein super Taschenrechner. Es gilt **Punkt vor Strich**, Klammern gehen vor.",
        "Besonders: `/` liefert immer eine Kommazahl (`7 / 2` → `3.5`). `//` ist die **ganzzahlige Division** (`7 // 2` → `3`) und `%` der **Rest** (`7 % 2` → `1`). `**` ist hoch (`2 ** 3` → `8`).",
        "Mit `round(x, 2)` rundest du auf 2 Nachkommastellen. Mit `x += 5` erhöhst du eine Variable um 5 (Kurzform für `x = x + 5`).",
      ],
      commands: [
        ['+  -  *  /', 'Plus, Minus, Mal, Geteilt'],
        ['//', 'ganzzahlig teilen'],
        ['%', 'Rest der Division (Modulo)'],
        ['**', 'Potenz'],
        ['round(x, 2)', 'runden'],
        ['x += 1', 'x um 1 erhöhen'],
      ],
      example: code`minuten = 135
stunden = minuten // 60
rest = minuten % 60
print(stunden, "h", rest, "min")
print(round(10 / 3, 2))`,
      exampleOut: '2 h 15 min\n3.33',
      task: [
        "Ein Kinoticket kostet `preis = 8.5` Euro. Ihr seid `personen = 4`.",
        "Berechne `gesamt` (Preis mal Personen) und gib es aus. Danach: Ihr habt `budget = 50` Euro – gib in einer zweiten Zeile aus, wie viel Geld übrig bleibt.",
      ],
      starter: code`preis = 8.5
personen = 4
budget = 50
`,
      tests: [
        { type: 'out', expect: '34.0\n16.0' },
        { type: 'assert', code: 'assert gesamt == 34', msg: 'Variable `gesamt` = 34' },
        { type: 'nosrc', pattern: '\\b34\\b|\\b16\\b', msg: 'Ergebnis wird berechnet (nicht eingetippt)' },
      ],
      hints: ['`gesamt = preis * personen`', 'Übrig: `budget - gesamt`. Weil `preis` eine Kommazahl ist, kommt `34.0` heraus – das ist richtig so.'],
      solution: code`preis = 8.5
personen = 4
budget = 50
gesamt = preis * personen
print(gesamt)
print(budget - gesamt)`,
    },
    {
      id: 'py-01-04', title: 'Eingabe & f-Strings',
      lesson: [
        "Mit `input()` fragt dein Programm den Benutzer etwas. Das Ergebnis ist **immer ein Text** – auch wenn jemand `42` eintippt!",
        "Zum Rechnen musst du umwandeln: `int(\"42\")` → `42`, `float(\"2.5\")` → `2.5`. Umgekehrt macht `str(42)` einen Text daraus.",
        "**f-Strings** sind der schönste Weg, Text und Werte zu mischen: ein `f` vor die Anführungszeichen, Variablen in `{}`: `f\"Hallo {name}!\"`.",
        "Hinweis: Den Fragetext in `input(\"...\")` zeigt die App beim Prüfen nicht mit an – nur deine `print()`-Ausgaben zählen.",
      ],
      commands: [
        ['x = input("Frage? ")', 'liest Text ein'],
        ['int(x) / float(x)', 'Text → Zahl'],
        ['str(5)', 'Zahl → Text'],
        ['f"{name} ist {alter}"', 'f-String'],
        ['f"{preis:.2f}"', 'mit genau 2 Nachkommastellen'],
      ],
      example: code`name = input("Wie heißt du? ")
jahr = int(input("Geburtsjahr? "))
print(f"Hi {name}, du wirst {2026 - jahr} Jahre alt.")`,
      exampleOut: 'Hi Sam, du wirst 16 Jahre alt.',
      task: [
        "Frag nach einem Namen und danach nach einer Zahl (dem Alter).",
        "Gib aus: `Hallo NAME! In 10 Jahren bist du ZAHL.` – also das Alter plus 10. Beispiel bei `Lea` und `15`: `Hallo Lea! In 10 Jahren bist du 25.`",
      ],
      starter: code`name = input("Name? ")
`,
      tests: [
        { type: 'out', input: ['Lea', '15'], expect: 'Hallo Lea! In 10 Jahren bist du 25.' },
        { type: 'out', input: ['Tom', '8'], expect: 'Hallo Tom! In 10 Jahren bist du 18.' },
      ],
      hidden: [{ type: 'out', input: ['Zoe', '41'], expect: 'Hallo Zoe! In 10 Jahren bist du 51.' }],
      hints: ['Das Alter kommt als Text – wandle es mit `int(...)` in eine Zahl um, bevor du `+ 10` rechnest.', '`print(f"Hallo {name}! In 10 Jahren bist du {alter + 10}.")`'],
      solution: code`name = input("Name? ")
alter = int(input("Alter? "))
print(f"Hallo {name}! In 10 Jahren bist du {alter + 10}.")`,
    },
    {
      id: 'py-01-p', kind: 'project', title: 'Begrüßungs-Bot',
      lesson: [
        "🛠 **Dein erstes Projekt!** Du baust einen kleinen Chat-Bot, der dich begrüßt, etwas über dich ausrechnet und eine Visitenkarte druckt.",
        "Projekte haben mehrere **Schritte**. Dein Code bleibt erhalten – du erweiterst ihn Schritt für Schritt. Jeder Schritt wird geprüft, alle vorherigen Tests müssen weiter grün bleiben.",
        "Nützlich: Texte kann man mit `*` vervielfachen: `\"=\" * 5` → `=====`.",
      ],
      commands: [
        ['input()', 'Eingabe lesen'],
        ['int()', 'Text → Zahl'],
        ['f"..."', 'Text mit Werten'],
        ['"-" * 20', 'Text wiederholen'],
      ],
      starter: code`# Begrüßungs-Bot
`,
      steps: [
        {
          title: 'Begrüßen',
          task: ["Frag nach dem Namen und gib aus: `Hallo NAME, ich bin PyBot!`"],
          tests: [{ type: 'has', input: ['Kim', '2010', 'Gamer'], expect: 'Hallo Kim, ich bin PyBot!', label: 'Begrüßung für Kim' }],
          hints: ['`name = input("Wie heißt du? ")` und dann ein f-String.'],
        },
        {
          title: 'Alter ausrechnen',
          task: ["Frag danach nach dem **Geburtsjahr** und gib aus: `Du wirst dieses Jahr ALTER.` – rechne mit dem Jahr `2026`."],
          tests: [
            { type: 'has', input: ['Kim', '2010', 'Gamer'], expect: 'Du wirst dieses Jahr 16.', label: 'Alter bei 2010' },
            { type: 'has', input: ['Ben', '1999', 'Koch'], expect: 'Du wirst dieses Jahr 27.', label: 'Alter bei 1999' },
          ],
          hints: ['`jahr = int(input("Geburtsjahr? "))` – dann `2026 - jahr`.'],
        },
        {
          title: 'Visitenkarte',
          task: [
            "Frag zum Schluss nach einem **Hobby** und drucke diese Visitenkarte (genau so, die Linie besteht aus 20 `=`):",
            "```\n====================\nName:  Kim\nAlter: 16\nHobby: Gamer\n====================\n```",
          ],
          tests: [
            { type: 'has', input: ['Kim', '2010', 'Gamer'], expect: '====================\nName:  Kim\nAlter: 16\nHobby: Gamer\n====================', label: 'Visitenkarte für Kim' },
            { type: 'has', input: ['Ben', '1999', 'Koch'], expect: '====================\nName:  Ben\nAlter: 27\nHobby: Koch\n====================', label: 'Visitenkarte für Ben' },
          ],
          hints: ['Linie: `print("=" * 20)`', 'Nach `Name:` stehen zwei Leerzeichen, damit es bündig mit `Alter:` ist.'],
        },
      ],
      solution: code`name = input("Wie heißt du? ")
print(f"Hallo {name}, ich bin PyBot!")
jahr = int(input("Geburtsjahr? "))
alter = 2026 - jahr
print(f"Du wirst dieses Jahr {alter}.")
hobby = input("Dein Hobby? ")
print("=" * 20)
print(f"Name:  {name}")
print(f"Alter: {alter}")
print(f"Hobby: {hobby}")
print("=" * 20)`,
    },
  ],
});
