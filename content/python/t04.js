'use strict';
/* Thema 4: Strings vertieft */
addTopic('python', {
  n: 4, title: 'Strings vertieft', desc: 'Index, Slicing, Methoden',
  levels: [
    {
      id: 'py-04-01', title: 'Index & Länge',
      lesson: [
        "Ein String ist eine **Folge von Zeichen**. Jedes Zeichen hat eine Position (**Index**) – und Python zählt **ab 0**!",
        "`wort[0]` ist das erste Zeichen, `wort[-1]` das letzte, `wort[-2]` das vorletzte. `len(wort)` gibt die Länge.",
        "```\n  P  y  t  h  o  n\n  0  1  2  3  4  5\n -6 -5 -4 -3 -2 -1\n```",
      ],
      commands: [
        ['len(s)', 'Anzahl Zeichen'],
        ['s[0]', 'erstes Zeichen'],
        ['s[-1]', 'letztes Zeichen'],
        ['s[i]', 'Zeichen an Position i'],
      ],
      example: code`wort = "Python"
print(len(wort))
print(wort[0], wort[-1])
print(wort[2])`,
      exampleOut: '6\nP n\nt',
      task: [
        "Lies ein Wort ein. Gib in drei Zeilen aus: den **ersten** Buchstaben, den **letzten** Buchstaben und die **Länge**.",
        "Bei `Banane`:\n```\nB\ne\n6\n```",
      ],
      starter: code`wort = input("Wort? ")
`,
      tests: [
        { type: 'out', input: ['Banane'], expect: 'B\ne\n6' },
        { type: 'out', input: ['Ok'], expect: 'O\nk\n2' },
      ],
      hidden: [{ type: 'out', input: ['Programmieren'], expect: 'P\nn\n13' }],
      hints: ['`print(wort[0])`, `print(wort[-1])`, `print(len(wort))`'],
      solution: code`wort = input("Wort? ")
print(wort[0])
print(wort[-1])
print(len(wort))`,
    },
    {
      id: 'py-04-02', title: 'Slicing',
      lesson: [
        "Mit **Slicing** schneidest du Teile heraus: `s[start:stop]` – von `start` bis **vor** `stop`.",
        "Lässt du etwas weg, geht es vom Anfang bzw. bis zum Ende: `s[:3]` sind die ersten 3 Zeichen, `s[3:]` alles ab Index 3. Mit einem dritten Wert bestimmst du die Schrittweite: `s[::2]` jedes zweite, `s[::-1]` **rückwärts**!",
      ],
      commands: [
        ['s[a:b]', 'Index a bis b-1'],
        ['s[:n]', 'die ersten n Zeichen'],
        ['s[-n:]', 'die letzten n Zeichen'],
        ['s[::-1]', 'umgedreht'],
      ],
      example: code`s = "Wochenende"
print(s[:5])
print(s[5:])
print(s[::-1])`,
      exampleOut: 'Woche\nnende\nednenehcoW',
      task: [
        "Schreib eine Funktion… nein, noch nicht 😄 – lies ein Wort ein und prüfe, ob es ein **Palindrom** ist (vorwärts wie rückwärts gleich, Groß-/Kleinschreibung egal). Gib `Palindrom` oder `kein Palindrom` aus.",
        "Tipp: `wort.lower()` macht alles klein.",
      ],
      starter: code`wort = input("Wort? ")
`,
      tests: [
        { type: 'out', input: ['Anna'], expect: 'Palindrom' },
        { type: 'out', input: ['Otto'], expect: 'Palindrom' },
        { type: 'out', input: ['Python'], expect: 'kein Palindrom' },
      ],
      hidden: [{ type: 'out', input: ['Rentner'], expect: 'Palindrom' }, { type: 'out', input: ['ab'], expect: 'kein Palindrom' }],
      hints: ['Erst klein machen: `w = wort.lower()`', 'Dann vergleichen: `if w == w[::-1]:`'],
      solution: code`wort = input("Wort? ")
w = wort.lower()
if w == w[::-1]:
    print("Palindrom")
else:
    print("kein Palindrom")`,
    },
    {
      id: 'py-04-03', title: 'String-Methoden',
      lesson: [
        "Strings haben viele eingebaute **Methoden** – Funktionen, die man mit einem Punkt anhängt: `text.upper()`.",
        "Wichtig: Strings sind **unveränderlich**. Methoden geben einen **neuen** String zurück, das Original bleibt gleich. Darum: `name = name.strip()`.",
      ],
      commands: [
        ['s.upper() / s.lower()', 'GROSS / klein'],
        ['s.capitalize()', 'Erster Buchstabe groß'],
        ['s.strip()', 'Leerzeichen am Rand weg'],
        ['s.replace("a", "b")', 'ersetzen'],
        ['s.count("x")', 'wie oft kommt x vor?'],
        ['s.startswith("ab")', 'beginnt mit …?'],
        ['"x" in s', 'enthält s den Text?'],
      ],
      example: code`satz = "  ich lerne python  "
satz = satz.strip()
print(satz.capitalize())
print(satz.replace("python", "Python 🐍"))
print(satz.count("e"))`,
      exampleOut: 'Ich lerne python\nich lerne Python 🐍\n3',
      task: [
        "Lies einen Benutzernamen ein, der unordentlich getippt sein kann (Leerzeichen, wilde Groß-/Kleinschreibung).",
        "Gib ihn **aufgeräumt** aus: ohne Rand-Leerzeichen, komplett klein, Leerzeichen innen durch `_` ersetzt. Aus `  Max Mustermann ` wird `max_mustermann`.",
      ],
      starter: code`name = input("Benutzername? ")
`,
      tests: [
        { type: 'out', input: ['  Max Mustermann '], expect: 'max_mustermann' },
        { type: 'out', input: ['CODE NINJA'], expect: 'code_ninja' },
      ],
      hidden: [{ type: 'out', input: ['   lea'], expect: 'lea' }, { type: 'out', input: ['Der Coole Coder  '], expect: 'der_coole_coder' }],
      hints: ['Methoden kann man verketten: `name.strip().lower()`', '…`.replace(" ", "_")` dranhängen.'],
      solution: code`name = input("Benutzername? ")
print(name.strip().lower().replace(" ", "_"))`,
    },
    {
      id: 'py-04-04', title: 'Zeichen durchlaufen',
      lesson: [
        "Mit `for` kannst du direkt **durch jeden Buchstaben** eines Strings laufen: `for zeichen in text:`.",
        "Neue Strings baust du Stück für Stück mit `+=` zusammen: Starte mit dem leeren String `\"\"`.",
        "Nützlich: `z.isdigit()` (Ziffer?), `z.isalpha()` (Buchstabe?), `z in \"aeiou\"` (Vokal?).",
      ],
      commands: [
        ['for z in text:', 'jedes Zeichen'],
        ['neu = ""', 'leerer String'],
        ['neu += z', 'anhängen'],
        ['z.isdigit() / z.isalpha()', 'Ziffer / Buchstabe?'],
      ],
      example: code`text = "Hallo Welt"
ohne_l = ""
for z in text:
    if z != "l":
        ohne_l += z
print(ohne_l)`,
      exampleOut: 'Hao Wet',
      task: [
        "Lies einen Satz ein und gib in zwei Zeilen aus:",
        "1. die **Anzahl der Vokale** (a, e, i, o, u – groß oder klein)\n2. den Satz **ohne Vokale**",
        "Bei `Hallo Otto`: `4` und `Hll tt`.",
      ],
      starter: code`satz = input("Satz? ")
`,
      tests: [
        { type: 'out', input: ['Hallo Otto'], expect: '4\nHll tt' },
        { type: 'out', input: ['Python macht Spass'], expect: '3\nPythn mcht Spss' },
        { type: 'src', pattern: '\\bfor\\b', msg: 'Benutzt eine `for`-Schleife' },
      ],
      hidden: [{ type: 'out', input: ['AEIOU xyz'], expect: '5\n xyz' }],
      hints: ['Prüf mit `if z.lower() in "aeiou":`', 'Zwei Variablen: `anzahl = 0` und `rest = ""` – im `if` zählen, im `else` anhängen.'],
      solution: code`satz = input("Satz? ")
anzahl = 0
rest = ""
for z in satz:
    if z.lower() in "aeiou":
        anzahl += 1
    else:
        rest += z
print(anzahl)
print(rest)`,
    },
    {
      id: 'py-04-p', kind: 'project', title: 'Geheimschrift (Caesar)',
      lesson: [
        "🛠 **Projekt: Caesar-Verschlüsselung!** Schon Julius Caesar verschob jeden Buchstaben um eine feste Zahl im Alphabet: Mit Schlüssel 3 wird `a`→`d`, `b`→`e`, … und am Ende geht's von vorne los: `x`→`a`.",
        "Dafür brauchst du das Alphabet als String und die Methode `.index()`: `\"abc\".index(\"c\")` → `2`. Mit `% 26` springst du nach `z` wieder auf `a`.",
      ],
      commands: [
        ['alphabet = "abcdefghijklmnopqrstuvwxyz"', 'Alphabet'],
        ['alphabet.index(z)', 'Position eines Buchstabens'],
        ['(pos + k) % 26', 'verschieben mit Umlauf'],
        ['z in alphabet', 'ist es ein Kleinbuchstabe?'],
      ],
      starter: code`alphabet = "abcdefghijklmnopqrstuvwxyz"
text = input("Text? ").lower()
k = int(input("Schlüssel? "))
`,
      steps: [
        {
          title: 'Verschlüsseln',
          task: [
            "Verschlüssele `text` mit dem Schlüssel `k` und gib das Ergebnis aus. Zeichen, die **keine** Buchstaben a–z sind (Leerzeichen, Satzzeichen), bleiben unverändert.",
            "`hallo welt` mit `3` → `kdoor zhow`",
          ],
          tests: [
            { type: 'out', input: ['hallo welt', '3'], expect: 'kdoor zhow', label: 'hallo welt, 3' },
            { type: 'out', input: ['xyz!', '3'], expect: 'abc!', label: 'Umlauf am Ende des Alphabets' },
            { type: 'out', input: ['Python', '13'], expect: 'clguba', label: 'Großbuchstaben werden klein' },
          ],
          hints: ['Baue `ergebnis = ""` Zeichen für Zeichen auf.', 'Für Buchstaben: `neu = alphabet[(alphabet.index(z) + k) % 26]`'],
        },
        {
          title: 'Entschlüsseln',
          task: [
            "Frag zuerst nach dem **Modus**: `v` für verschlüsseln oder `e` für entschlüsseln. Lies **danach** Text und Schlüssel ein (also Reihenfolge: Modus, Text, Schlüssel).",
            "Beim Entschlüsseln wird einfach in die andere Richtung verschoben. `kdoor zhow` mit `e` und `3` → `hallo welt`.",
            "⚠️ Da sich die Eingabe-Reihenfolge ändert, gelten ab hier diese neuen Tests.",
          ],
          tests: [
            { type: 'out', input: ['v', 'hallo welt', '3'], expect: 'kdoor zhow', label: 'Verschlüsseln' },
            { type: 'out', input: ['e', 'kdoor zhow', '3'], expect: 'hallo welt', label: 'Entschlüsseln' },
            { type: 'out', input: ['e', 'abc!', '3'], expect: 'xyz!', label: 'Entschlüsseln mit Umlauf' },
          ],
          hints: ['Entschlüsseln = verschlüsseln mit `-k`. Ein `if modus == "e": k = -k` reicht!', 'Python rechnet `-2 % 26` korrekt zu `24` – der Umlauf klappt also automatisch.'],
          replaces: true,
        },
      ],
      solution: code`alphabet = "abcdefghijklmnopqrstuvwxyz"
modus = input("v/e? ")
text = input("Text? ").lower()
k = int(input("Schlüssel? "))
if modus == "e":
    k = -k
ergebnis = ""
for z in text:
    if z in alphabet:
        ergebnis += alphabet[(alphabet.index(z) + k) % 26]
    else:
        ergebnis += z
print(ergebnis)`,
    },
  ],
});
