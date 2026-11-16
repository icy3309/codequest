'use strict';
/* Thema 3: Schleifen */
addTopic('python', {
  n: 3, title: 'Schleifen', desc: 'while, for, range, break',
  levels: [
    {
      id: 'py-03-01', title: 'while-Schleifen',
      lesson: [
        "Eine **Schleife** wiederholt Code. Die `while`-Schleife läuft, **solange** ihre Bedingung wahr ist.",
        "Ganz wichtig: Im Block muss sich etwas ändern, damit die Bedingung irgendwann `False` wird – sonst hast du eine **Endlosschleife**. (Keine Sorge: Die App stoppt dein Programm nach ein paar Sekunden.)",
      ],
      commands: [
        ['while bedingung:', 'wiederholen, solange wahr'],
        ['i += 1', 'Zähler erhöhen'],
        ['i -= 1', 'Zähler verringern'],
      ],
      example: code`i = 1
while i <= 3:
    print("Runde", i)
    i += 1
print("Fertig!")`,
      exampleOut: 'Runde 1\nRunde 2\nRunde 3\nFertig!',
      task: [
        "Ein Countdown! Lies eine Zahl `n` ein und zähle mit einer `while`-Schleife von `n` bis `1` herunter (jede Zahl in eine eigene Zeile). Danach gib `Start!` aus.",
        "Bei `3`:\n```\n3\n2\n1\nStart!\n```",
      ],
      starter: code`n = int(input("Startzahl? "))
`,
      tests: [
        { type: 'out', input: ['3'], expect: '3\n2\n1\nStart!' },
        { type: 'out', input: ['5'], expect: '5\n4\n3\n2\n1\nStart!' },
        { type: 'src', pattern: '\\bwhile\\b', msg: 'Benutzt eine `while`-Schleife' },
      ],
      hidden: [{ type: 'out', input: ['1'], expect: '1\nStart!' }],
      hints: ['Die Bedingung ist `while n > 0:` (oder `n >= 1`).', 'Im Block: `print(n)` und dann `n -= 1`. `Start!` kommt **nach** der Schleife (nicht eingerückt).'],
      solution: code`n = int(input("Startzahl? "))
while n > 0:
    print(n)
    n -= 1
print("Start!")`,
    },
    {
      id: 'py-03-02', title: 'for & range',
      lesson: [
        "Wenn du vorher weißt, **wie oft** etwas passieren soll, ist die `for`-Schleife praktischer. Mit `range()` erzeugst du Zahlenfolgen:",
        "- `range(5)` → 0, 1, 2, 3, 4 (die 5 selbst **nicht**!)\n- `range(1, 6)` → 1 bis 5\n- `range(0, 10, 2)` → 0, 2, 4, 6, 8 (Schrittweite 2)\n- `range(5, 0, -1)` → 5, 4, 3, 2, 1",
        "Die Variable nach `for` (oft `i`) bekommt in jeder Runde den nächsten Wert.",
      ],
      commands: [
        ['for i in range(n):', 'n-mal, i = 0 … n-1'],
        ['range(start, stop)', 'von start bis stop-1'],
        ['range(a, b, schritt)', 'mit Schrittweite'],
        ['print(x, end=" ")', 'ohne Zeilenumbruch ausgeben'],
      ],
      example: code`for i in range(1, 4):
    print(f"{i} x 7 = {i * 7}")`,
      exampleOut: '1 x 7 = 7\n2 x 7 = 14\n3 x 7 = 21',
      task: [
        "Lies eine Zahl `n` ein und gib ihre **Einmaleins-Reihe** von 1 bis 10 aus – im Format `1 x n = …`.",
        "Bei `7` also `1 x 7 = 7` bis `10 x 7 = 70`.",
      ],
      starter: code`n = int(input("Zahl? "))
`,
      tests: [
        { type: 'out', input: ['7'], expect: Array.from({ length: 10 }, (_, i) => `${i + 1} x 7 = ${(i + 1) * 7}`).join('\n') },
        { type: 'src', pattern: '\\bfor\\b.*\\brange\\(', msg: 'Benutzt `for` mit `range()`' },
      ],
      hidden: [{ type: 'out', input: ['3'], expect: Array.from({ length: 10 }, (_, i) => `${i + 1} x 3 = ${(i + 1) * 3}`).join('\n') }],
      hints: ['`for i in range(1, 11):` – die 11, weil das Ende nicht mitzählt.', '`print(f"{i} x {n} = {i * n}")`'],
      solution: code`n = int(input("Zahl? "))
for i in range(1, 11):
    print(f"{i} x {n} = {i * n}")`,
    },
    {
      id: 'py-03-03', title: 'Summen & Zähler',
      lesson: [
        "Ein typisches Muster: Vor der Schleife eine Variable auf `0` setzen (**Akkumulator**) und in jeder Runde etwas dazu addieren.",
        "Genauso kannst du **zählen**, wie oft etwas zutrifft: `if …: anzahl += 1`.",
      ],
      commands: [
        ['summe = 0', 'vor der Schleife starten'],
        ['summe += x', 'in der Schleife aufaddieren'],
        ['anzahl += 1', 'zählen'],
      ],
      example: code`summe = 0
for zahl in range(1, 5):
    summe += zahl
print(summe)   # 1+2+3+4`,
      exampleOut: '10',
      task: [
        "Lies `n` ein. Berechne die Summe aller **geraden** Zahlen von 1 bis `n` (einschließlich) und gib sie aus. Gib in einer zweiten Zeile aus, **wie viele** Zahlen von 1 bis `n` durch 3 teilbar sind.",
        "Bei `10`: gerade Summe `2+4+6+8+10 = 30`, durch 3 teilbar: 3, 6, 9 → `3`.",
      ],
      starter: code`n = int(input("n? "))
summe = 0
`,
      tests: [
        { type: 'out', input: ['10'], expect: '30\n3' },
        { type: 'out', input: ['7'], expect: '12\n2' },
      ],
      hidden: [{ type: 'out', input: ['100'], expect: '2550\n33' }, { type: 'out', input: ['1'], expect: '0\n0' }],
      hints: ['Eine Schleife `for i in range(1, n + 1):` reicht für beides.', 'Gerade: `if i % 2 == 0: summe += i` · durch 3 teilbar: `if i % 3 == 0: anzahl += 1`'],
      solution: code`n = int(input("n? "))
summe = 0
anzahl = 0
for i in range(1, n + 1):
    if i % 2 == 0:
        summe += i
    if i % 3 == 0:
        anzahl += 1
print(summe)
print(anzahl)`,
    },
    {
      id: 'py-03-04', title: 'break & continue',
      lesson: [
        "`break` **beendet** eine Schleife sofort. `continue` **überspringt** den Rest der aktuellen Runde und macht mit der nächsten weiter.",
        "Ein beliebtes Muster ist `while True:` (eigentlich endlos) mit einem `break`, sobald eine Abbruchbedingung erfüllt ist – z. B. bei Benutzereingaben.",
      ],
      commands: [
        ['break', 'Schleife sofort verlassen'],
        ['continue', 'nächste Runde'],
        ['while True:', 'endlos – bis break'],
      ],
      example: code`while True:
    wort = input("Wort (stop zum Beenden): ")
    if wort == "stop":
        break
    if wort == "":
        continue
    print("Du sagtest:", wort)`,
      exampleOut: 'Du sagtest: hallo',
      task: [
        "Lies in einer Schleife Zahlen ein, bis jemand `0` eingibt. **Negative Zahlen werden ignoriert** (`continue`). Gib am Ende die Summe der positiven Zahlen aus.",
        "Eingaben `5, -2, 3, 0` → Ausgabe `8`.",
      ],
      starter: code`summe = 0
while True:
    zahl = int(input("Zahl? "))
`,
      tests: [
        { type: 'out', input: ['5', '-2', '3', '0'], expect: '8' },
        { type: 'out', input: ['0'], expect: '0' },
        { type: 'src', pattern: '\\bbreak\\b', msg: 'Benutzt `break`' },
      ],
      hidden: [{ type: 'out', input: ['-1', '-5', '10', '20', '-3', '0'], expect: '30' }],
      hints: ['`if zahl == 0: break` zuerst prüfen.', 'Dann `if zahl < 0: continue`, danach `summe += zahl`. Die Ausgabe kommt nach der Schleife.'],
      solution: code`summe = 0
while True:
    zahl = int(input("Zahl? "))
    if zahl == 0:
        break
    if zahl < 0:
        continue
    summe += zahl
print(summe)`,
    },
    {
      id: 'py-03-p', kind: 'project', title: 'Zahlenraten',
      lesson: [
        "🛠 **Projekt: Zahlenraten!** Der Computer denkt sich eine Zahl zwischen 1 und 100 aus, du rätst, er sagt „zu groß“ oder „zu klein“.",
        "Zufall gibt's mit dem Modul `random`: `import random` und dann `random.randint(1, 100)`. ",
        "Trick für die Tests: Beim Prüfen ist der Zufall „eingefroren“ – dort liefert `random.randint(1, 100)` immer `50`. Darum starten wir mit einer festen Zahl `geheim = 50` und tauschen sie in Schritt 4 gegen echten Zufall aus. Alle Tests laufen dann weiter.",
      ],
      commands: [
        ['import random', 'Zufallsmodul laden'],
        ['random.randint(1, 100)', 'Zufallszahl 1–100'],
        ['while True: … break', 'Spielschleife'],
      ],
      starter: code`geheim = 50
`,
      steps: [
        {
          title: 'Ein Versuch',
          task: ["Lies **einen** Tipp ein. Gib `Zu klein!`, `Zu groß!` oder `Richtig!` aus (die geheime Zahl ist `50`)."],
          tests: [
            { type: 'has', input: ['10', '50'], expect: 'Zu klein!', label: 'Tipp 10' },
            { type: 'has', input: ['90', '50'], expect: 'Zu groß!', label: 'Tipp 90' },
            { type: 'has', input: ['50'], expect: 'Richtig!', label: 'Tipp 50' },
          ],
          hints: ['`tipp = int(input("Dein Tipp? "))` und dann `if tipp < geheim:` …'],
        },
        {
          title: 'Bis es passt',
          task: ["Pack das Raten in eine Schleife: Es wird so lange geraten, bis der Tipp stimmt. Danach endet das Programm."],
          tests: [
            { type: 'has', input: ['10', '90', '50'], expect: 'Zu klein!\nZu groß!\nRichtig!', label: 'drei Versuche' },
            { type: 'has', input: ['70', '25', '40', '55', '50'], expect: 'Zu groß!\nZu klein!\nZu klein!\nZu groß!\nRichtig!', label: 'fünf Versuche' },
          ],
          hints: ['`while True:` – und bei `Richtig!` ein `break`.'],
        },
        {
          title: 'Versuche zählen',
          task: ["Zähle die Versuche. Statt nur `Richtig!` gib jetzt aus: `Richtig! Du hast 3 Versuche gebraucht.`"],
          tests: [
            { type: 'out', input: ['10', '90', '50'], expect: 'Zu klein!\nZu groß!\nRichtig! Du hast 3 Versuche gebraucht.', label: 'drei Versuche' },
            { type: 'out', input: ['50'], expect: 'Richtig! Du hast 1 Versuche gebraucht.', label: 'sofort richtig' },
          ],
          hints: ['`versuche = 0` vor der Schleife, `versuche += 1` bei jedem Tipp.'],
        },
        {
          title: 'Echter Zufall',
          task: [
            "Jetzt wird's ein echtes Spiel: Ersetze `geheim = 50` durch eine Zufallszahl zwischen 1 und 100. Teste es mit ▶ Ausführen (Tipps unten im Eingabefeld, einer pro Zeile)!",
            "(Beim Prüfen kommt dank eingefrorenem Zufall wieder 50 heraus – darum bleiben alle alten Tests grün.)",
          ],
          tests: [
            { type: 'src', pattern: 'import random', msg: '`random` wird importiert' },
            { type: 'src', pattern: 'random\\.randint\\(\\s*1\\s*,\\s*100\\s*\\)', msg: '`random.randint(1, 100)` wird benutzt' },
            { type: 'nosrc', pattern: '^\\s*geheim\\s*=\\s*50', msg: 'Die feste `50` ist raus' },
          ],
          hints: ['Ganz oben: `import random` · dann `geheim = random.randint(1, 100)`'],
        },
      ],
      solution: code`import random
geheim = random.randint(1, 100)
versuche = 0
while True:
    tipp = int(input("Dein Tipp? "))
    versuche += 1
    if tipp < geheim:
        print("Zu klein!")
    elif tipp > geheim:
        print("Zu groß!")
    else:
        print(f"Richtig! Du hast {versuche} Versuche gebraucht.")
        break`,
    },
  ],
});
