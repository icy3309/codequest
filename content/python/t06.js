'use strict';
/* Thema 6: Dictionaries & Sets */
addTopic('python', {
  n: 6, title: 'Dictionaries & Sets', desc: 'Schlüssel-Wert-Paare, Mengen',
  levels: [
    {
      id: 'py-06-01', title: 'Dictionaries',
      lesson: [
        "Ein **Dictionary** (`dict`) speichert **Schlüssel → Wert**-Paare, wie ein Wörterbuch oder Telefonbuch: `alter = {\"Mia\": 16, \"Ben\": 17}`.",
        "Zugriff über den Schlüssel statt über eine Position: `alter[\"Mia\"]` → `16`. Neue Einträge legst du einfach an: `alter[\"Lea\"] = 15`.",
        "Gibt es den Schlüssel nicht, kommt ein `KeyError`. Sicherer: `d.get(\"Tom\", 0)` liefert `0`, wenn `Tom` fehlt. Mit `in` prüfst du vorher: `if \"Tom\" in d:`.",
      ],
      commands: [
        ['d = {"a": 1}', 'Dictionary anlegen'],
        ['d["a"]', 'Wert lesen'],
        ['d["b"] = 2', 'setzen / ändern'],
        ['d.get(k, standard)', 'lesen mit Ersatzwert'],
        ['k in d', 'Schlüssel vorhanden?'],
        ['del d[k]', 'Eintrag löschen'],
      ],
      example: code`preise = {"Apfel": 0.5, "Banane": 0.3}
preise["Kiwi"] = 0.4
print(preise["Apfel"])
print(preise.get("Mango", "gibt's nicht"))
print(len(preise))`,
      exampleOut: "0.5\ngibt's nicht\n3",
      task: [
        "Ein Mini-Übersetzer: `woerter = {\"hallo\": \"hello\", \"katze\": \"cat\", \"hund\": \"dog\", \"haus\": \"house\"}`.",
        "Lies ein deutsches Wort ein (Groß-/Kleinschreibung egal) und gib die Übersetzung aus. Kennt das Wörterbuch das Wort nicht, gib `?? unbekannt` aus.",
      ],
      starter: code`woerter = {"hallo": "hello", "katze": "cat", "hund": "dog", "haus": "house"}
wort = input("Deutsches Wort? ")
`,
      tests: [
        { type: 'out', input: ['Katze'], expect: 'cat' },
        { type: 'out', input: ['hund'], expect: 'dog' },
        { type: 'out', input: ['Auto'], expect: '?? unbekannt' },
      ],
      hidden: [{ type: 'out', input: ['HAUS'], expect: 'house' }],
      hints: ['`wort = wort.lower()` zuerst.', '`print(woerter.get(wort, "?? unbekannt"))` – eine Zeile reicht!'],
      solution: code`woerter = {"hallo": "hello", "katze": "cat", "hund": "dog", "haus": "house"}
wort = input("Deutsches Wort? ").lower()
print(woerter.get(wort, "?? unbekannt"))`,
    },
    {
      id: 'py-06-02', title: 'Durchlaufen',
      lesson: [
        "`for k in d:` läuft über die **Schlüssel**. Meist willst du beides – dann nimm `.items()`: `for name, wert in d.items():`.",
        "`d.keys()` und `d.values()` liefern nur Schlüssel bzw. Werte – z. B. `sum(d.values())`.",
        "Sortiert ausgeben: `for k in sorted(d):` sortiert nach Schlüssel.",
      ],
      commands: [
        ['for k, v in d.items():', 'Paare durchlaufen'],
        ['d.values()', 'alle Werte'],
        ['sorted(d)', 'Schlüssel sortiert'],
      ],
      example: code`lager = {"Schrauben": 120, "Nägel": 0, "Dübel": 35}
for teil, anzahl in lager.items():
    if anzahl == 0:
        print(teil, "nachbestellen!")
print("Gesamt:", sum(lager.values()))`,
      exampleOut: 'Nägel nachbestellen!\nGesamt: 155',
      task: [
        "Gegeben sind Noten: `noten = {\"Mathe\": 2, \"Deutsch\": 3, \"Englisch\": 1, \"Physik\": 4, \"Kunst\": 1}`.",
        "Gib alle Fächer **alphabetisch sortiert** im Format `Fach: Note` aus. Danach `Schnitt: X` (auf 2 Stellen gerundet) und zuletzt `Beste: ` mit allen Fächern mit Note 1, alphabetisch und durch `, ` getrennt.",
      ],
      starter: code`noten = {"Mathe": 2, "Deutsch": 3, "Englisch": 1, "Physik": 4, "Kunst": 1}
`,
      tests: [
        { type: 'out', expect: 'Deutsch: 3\nEnglisch: 1\nKunst: 1\nMathe: 2\nPhysik: 4\nSchnitt: 2.2\nBeste: Englisch, Kunst' },
        { type: 'src', pattern: 'sorted\\(', msg: 'Benutzt `sorted()`' },
      ],
      hints: ['`for fach in sorted(noten): print(f"{fach}: {noten[fach]}")`', '`beste = [f for f in sorted(noten) if noten[f] == 1]` – oder mit einer normalen Schleife und `append`.'],
      solution: code`noten = {"Mathe": 2, "Deutsch": 3, "Englisch": 1, "Physik": 4, "Kunst": 1}
for fach in sorted(noten):
    print(f"{fach}: {noten[fach]}")
print(f"Schnitt: {round(sum(noten.values()) / len(noten), 2)}")
beste = []
for fach in sorted(noten):
    if noten[fach] == 1:
        beste.append(fach)
print("Beste: " + ", ".join(beste))`,
    },
    {
      id: 'py-06-03', title: 'Zählen mit dict',
      lesson: [
        "Eines der nützlichsten Muster überhaupt: **Häufigkeiten zählen**. Für jedes Element erhöhst du seinen Zähler im Dictionary:",
        "```\nzaehler[x] = zaehler.get(x, 0) + 1\n```",
        "`.get(x, 0)` liefert beim ersten Mal `0` – so musst du nicht extra prüfen, ob der Schlüssel schon existiert.",
        "Sortieren nach Wert: `sorted(d.items(), key=lambda p: p[1], reverse=True)` – `lambda` lernst du in Thema 7 genauer kennen.",
      ],
      commands: [
        ['d[x] = d.get(x, 0) + 1', 'Zähler erhöhen'],
        ['max(d, key=d.get)', 'Schlüssel mit größtem Wert'],
      ],
      example: code`stimmen = ["Pizza", "Sushi", "Pizza", "Döner", "Pizza", "Sushi"]
zaehler = {}
for s in stimmen:
    zaehler[s] = zaehler.get(s, 0) + 1
print(zaehler)
print("Gewinner:", max(zaehler, key=zaehler.get))`,
      exampleOut: "{'Pizza': 3, 'Sushi': 2, 'Döner': 1}\nGewinner: Pizza",
      task: [
        "Lies einen Text ein und zähle, wie oft jeder **Buchstabe** vorkommt (Groß-/Kleinschreibung egal, nur Buchstaben – keine Leerzeichen oder Satzzeichen).",
        "Gib die Buchstaben **alphabetisch** im Format `a: 3` aus.",
      ],
      starter: code`text = input("Text? ").lower()
zaehler = {}
`,
      tests: [
        { type: 'out', input: ['Hallo!'], expect: 'a: 1\nh: 1\nl: 2\no: 1' },
        { type: 'out', input: ['Ein Ei'], expect: 'e: 2\ni: 2\nn: 1' },
        { type: 'src', pattern: 'zaehler\\[', msg: 'Zählt im Dictionary `zaehler`' },
      ],
      hidden: [{ type: 'out', input: ['Mississippi'], expect: 'i: 4\nm: 1\np: 2\ns: 4' }],
      hints: ['`for z in text: if z.isalpha(): …`', 'Ausgabe: `for b in sorted(zaehler): print(f"{b}: {zaehler[b]}")`'],
      solution: code`text = input("Text? ").lower()
zaehler = {}
for z in text:
    if z.isalpha():
        zaehler[z] = zaehler.get(z, 0) + 1
for b in sorted(zaehler):
    print(f"{b}: {zaehler[b]}")`,
    },
    {
      id: 'py-06-04', title: 'Sets – Mengen',
      lesson: [
        "Ein **Set** ist eine Sammlung **ohne Duplikate** und ohne feste Reihenfolge: `{1, 2, 3}`. `set(liste)` entfernt alle Doppelten auf einen Schlag.",
        "Sets können Mengenlehre:",
        "- `a & b` – **Schnittmenge** (in beiden)\n- `a | b` – **Vereinigung** (in mindestens einem)\n- `a - b` – **Differenz** (in a, aber nicht in b)",
        "Ein leeres Set ist `set()` – denn `{}` ist ein leeres Dictionary!",
      ],
      commands: [
        ['set(liste)', 'Duplikate entfernen'],
        ['s.add(x)', 'hinzufügen'],
        ['a & b', 'Schnittmenge'],
        ['a | b', 'Vereinigung'],
        ['a - b', 'Differenz'],
      ],
      example: code`mia = {"Gaming", "Musik", "Kochen"}
ben = {"Sport", "Gaming", "Musik"}
print(sorted(mia & ben))
print(sorted(mia - ben))
print(len(mia | ben))`,
      exampleOut: "['Gaming', 'Musik']\n['Kochen']\n4",
      task: [
        "Lies zwei Zeilen ein: die Hobbys von Person A und von Person B, jeweils durch Komma getrennt (z. B. `lesen,gaming,kochen`).",
        "Gib in drei Zeilen aus (jeweils alphabetisch, durch `, ` getrennt):",
        "```\nGemeinsam: …\nNur A: …\nNur B: …\n```",
      ],
      starter: code`a = set(input("Hobbys A? ").split(","))
b = set(input("Hobbys B? ").split(","))
`,
      tests: [
        { type: 'out', input: ['lesen,gaming,kochen', 'sport,gaming,lesen'], expect: 'Gemeinsam: gaming, lesen\nNur A: kochen\nNur B: sport' },
        { type: 'src', pattern: '&|intersection', msg: 'Benutzt die Schnittmenge' },
      ],
      hidden: [{ type: 'out', input: ['a,b', 'c,d'], expect: 'Gemeinsam: \nNur A: a, b\nNur B: c, d' }],
      hints: ['`", ".join(sorted(a & b))`'],
      solution: code`a = set(input("Hobbys A? ").split(","))
b = set(input("Hobbys B? ").split(","))
print("Gemeinsam: " + ", ".join(sorted(a & b)))
print("Nur A: " + ", ".join(sorted(a - b)))
print("Nur B: " + ", ".join(sorted(b - a)))`,
    },
    {
      id: 'py-06-p', kind: 'project', title: 'Vokabeltrainer',
      lesson: [
        "🛠 **Projekt: Vokabeltrainer.** Er fragt dich Vokabeln ab, zählt Punkte und merkt sich, welche Wörter du noch üben musst.",
        "Die Vokabeln stehen in einem Dictionary. In den Tests werden die Wörter in der Reihenfolge abgefragt, in der sie im Dictionary stehen (Python behält die Einfüge-Reihenfolge bei).",
      ],
      commands: [
        ['for de, en in vokabeln.items():', 'alle Paare'],
        ['antwort.strip().lower()', 'Eingabe säubern'],
        ['falsch.append(de)', 'Fehler merken'],
      ],
      starter: code`vokabeln = {"Hund": "dog", "Katze": "cat", "Baum": "tree", "Wasser": "water"}
`,
      steps: [
        {
          title: 'Abfragen',
          task: [
            "Frag jede Vokabel ab (`input(f\"{de} auf Englisch? \")`). Ist die Antwort richtig (Groß-/Kleinschreibung und Leerzeichen am Rand egal), gib `✓` aus, sonst `✗ richtig: dog`.",
          ],
          tests: [
            { type: 'has', input: ['dog', 'Cat', 'baum', ' water '], expect: '✓\n✓\n✗ richtig: tree\n✓', label: 'drei richtig, eins falsch' },
          ],
          hints: ['`if antwort.strip().lower() == en:`'],
        },
        {
          title: 'Punkte',
          task: ["Gib am Ende aus: `Ergebnis: 3/4 (75%)` – Prozent als ganze Zahl (mit `round`)."],
          tests: [
            { type: 'has', input: ['dog', 'Cat', 'baum', ' water '], expect: 'Ergebnis: 3/4 (75%)', label: '3 von 4' },
            { type: 'has', input: ['x', 'x', 'x', 'x'], expect: 'Ergebnis: 0/4 (0%)', label: 'alles falsch' },
          ],
          hints: ['`richtig = 0` vor der Schleife, `len(vokabeln)` für die Gesamtzahl.'],
        },
        {
          title: 'Üben',
          task: [
            "Gib danach alle falsch beantworteten deutschen Wörter **alphabetisch** aus: `Üben: Baum, Hund`. Waren alle richtig, gib stattdessen `Perfekt! 🎉` aus.",
          ],
          tests: [
            { type: 'has', input: ['x', 'cat', 'x', 'water'], expect: 'Üben: Baum, Hund', label: 'zwei zum Üben' },
            { type: 'has', input: ['dog', 'cat', 'tree', 'water'], expect: 'Perfekt! 🎉', label: 'alles richtig' },
          ],
          hints: ['Sammle Fehler in `falsch = []` und nutze `sorted(falsch)`.'],
        },
      ],
      solution: code`vokabeln = {"Hund": "dog", "Katze": "cat", "Baum": "tree", "Wasser": "water"}
richtig = 0
falsch = []
for de, en in vokabeln.items():
    antwort = input(f"{de} auf Englisch? ")
    if antwort.strip().lower() == en:
        print("✓")
        richtig += 1
    else:
        print(f"✗ richtig: {en}")
        falsch.append(de)
prozent = round(richtig / len(vokabeln) * 100)
print(f"Ergebnis: {richtig}/{len(vokabeln)} ({prozent}%)")
if falsch:
    print("Üben: " + ", ".join(sorted(falsch)))
else:
    print("Perfekt! 🎉")`,
    },
  ],
});
