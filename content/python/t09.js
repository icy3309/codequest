'use strict';
/* Thema 9: Objektorientierung */
addTopic('python', {
  n: 9, title: 'Objektorientierung', desc: 'Klassen, Objekte, Vererbung',
  levels: [
    {
      id: 'py-09-01', title: 'Klassen & Objekte',
      lesson: [
        "Eine **Klasse** ist ein Bauplan, ein **Objekt** ist ein Ding, das nach diesem Plan gebaut wurde. Die Klasse `Hund` beschreibt, was jeder Hund hat (Name, Alter) – `bello = Hund(\"Bello\", 3)` ist ein konkreter Hund.",
        "`__init__` ist der **Konstruktor**: Er läuft automatisch beim Erzeugen und legt die **Attribute** an. `self` ist das Objekt selbst – `self.name = name` speichert den Namen *im* Objekt.",
        "Klassennamen schreibt man groß (`Hund`, `Bankkonto`).",
      ],
      commands: [
        ['class Name:', 'Klasse definieren'],
        ['def __init__(self, a):', 'Konstruktor'],
        ['self.a = a', 'Attribut speichern'],
        ['obj = Name(5)', 'Objekt erzeugen'],
        ['obj.a', 'Attribut lesen'],
      ],
      example: code`class Hund:
    def __init__(self, name, alter):
        self.name = name
        self.alter = alter

bello = Hund("Bello", 3)
rex = Hund("Rex", 7)
print(bello.name, rex.alter)
bello.alter += 1
print(bello.alter)`,
      exampleOut: 'Bello 7\n4',
      task: [
        "Schreib eine Klasse `Buch` mit den Attributen `titel`, `autor` und `seiten`. Zusätzlich soll jedes Buch ein Attribut `gelesen` haben, das am Anfang **immer** `False` ist (kein Parameter!).",
        "Erzeuge unten ein Buch `lieblingsbuch` mit `\"Momo\"`, `\"Michael Ende\"`, `304`.",
      ],
      starter: code`class Buch:
    pass
`,
      tests: [
        { type: 'assert', code: 'b = Buch("Tintenherz", "Cornelia Funke", 576)\nassert b.titel == "Tintenherz" and b.autor == "Cornelia Funke" and b.seiten == 576', msg: '`Buch("Tintenherz", "Cornelia Funke", 576)` speichert alle drei Attribute' },
        { type: 'assert', code: 'assert Buch("a", "b", 1).gelesen is False', msg: '`gelesen` ist am Anfang `False`' },
        { type: 'assert', code: 'assert isinstance(lieblingsbuch, Buch) and lieblingsbuch.titel == "Momo" and lieblingsbuch.seiten == 304', msg: '`lieblingsbuch` ist Momo mit 304 Seiten' },
      ],
      hints: ['`def __init__(self, titel, autor, seiten):` und darin `self.titel = titel` usw.', '`self.gelesen = False` ohne Parameter.'],
      solution: code`class Buch:
    def __init__(self, titel, autor, seiten):
        self.titel = titel
        self.autor = autor
        self.seiten = seiten
        self.gelesen = False

lieblingsbuch = Buch("Momo", "Michael Ende", 304)`,
    },
    {
      id: 'py-09-02', title: 'Methoden',
      lesson: [
        "**Methoden** sind Funktionen, die zu einer Klasse gehören. Ihr erster Parameter ist immer `self` – damit kommen sie an die Attribute des Objekts.",
        "Aufgerufen werden sie mit Punkt: `konto.einzahlen(50)`. Python übergibt `self` automatisch.",
        "So bündelst du **Daten und Verhalten**: Ein Konto weiß selbst, wie man einzahlt.",
      ],
      commands: [
        ['def methode(self, x):', 'Methode'],
        ['self.attribut', 'Attribut im Objekt'],
        ['obj.methode(5)', 'aufrufen'],
      ],
      example: code`class Zaehler:
    def __init__(self):
        self.wert = 0

    def klick(self):
        self.wert += 1

    def reset(self):
        self.wert = 0

z = Zaehler()
z.klick(); z.klick()
print(z.wert)`,
      exampleOut: '2',
      task: [
        "Schreib eine Klasse `Bankkonto`:",
        "- `__init__(self, inhaber, stand=0)`\n- `einzahlen(self, betrag)` erhöht den Stand\n- `abheben(self, betrag)` verringert den Stand – aber nur, wenn genug Geld da ist. Gibt `True` bei Erfolg zurück, sonst `False` (Stand bleibt).\n- `info(self)` gibt einen Text zurück: `Mia: 120 Euro`",
      ],
      starter: code`class Bankkonto:
    def __init__(self, inhaber, stand=0):
        self.inhaber = inhaber
        self.stand = stand
`,
      tests: [
        { type: 'assert', code: 'k = Bankkonto("Mia")\nk.einzahlen(100)\nk.einzahlen(20)\nassert k.stand == 120', msg: 'einzahlen erhöht den Stand' },
        { type: 'assert', code: 'k = Bankkonto("Mia", 50)\nassert k.abheben(30) is True and k.stand == 20', msg: 'abheben klappt bei genug Geld' },
        { type: 'assert', code: 'k = Bankkonto("Mia", 50)\nassert k.abheben(80) is False and k.stand == 50', msg: 'abheben verweigert bei zu wenig Geld' },
        { type: 'eval', expr: 'Bankkonto("Mia", 120).info()', expect: '"Mia: 120 Euro"' },
      ],
      hints: ['`def abheben(self, betrag):` → `if betrag > self.stand: return False`', '`return f"{self.inhaber}: {self.stand} Euro"`'],
      solution: code`class Bankkonto:
    def __init__(self, inhaber, stand=0):
        self.inhaber = inhaber
        self.stand = stand

    def einzahlen(self, betrag):
        self.stand += betrag

    def abheben(self, betrag):
        if betrag > self.stand:
            return False
        self.stand -= betrag
        return True

    def info(self):
        return f"{self.inhaber}: {self.stand} Euro"`,
    },
    {
      id: 'py-09-03', title: '__str__ & Co.',
      lesson: [
        "`print(objekt)` zeigt normalerweise so etwas Hässliches wie `<__main__.Punkt object at 0x...>`. Mit der **Spezialmethode** `__str__` bestimmst du selbst, wie dein Objekt als Text aussieht.",
        "Es gibt viele solcher „Dunder“-Methoden (double underscore). Zum Beispiel `__eq__` für `==` und `__lt__` für `<` (damit kann man Objekte sogar sortieren!) oder `__len__` für `len()`.",
      ],
      commands: [
        ['def __str__(self):', 'Text für print()/str()'],
        ['def __eq__(self, other):', 'Vergleich mit =='],
        ['def __lt__(self, other):', 'Vergleich mit < (sortieren)'],
      ],
      example: code`class Punkt:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __str__(self):
        return f"({self.x}|{self.y})"

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

print(Punkt(2, 3))
print(Punkt(1, 1) == Punkt(1, 1))`,
      exampleOut: '(2|3)\nTrue',
      task: [
        "Schreib eine Klasse `Zeit(stunden, minuten)`:",
        "- `__str__` gibt die Zeit zweistellig aus: `Zeit(9, 5)` → `09:05`\n- `__lt__` vergleicht zwei Zeiten, damit `sorted()` funktioniert\n- `plus(minuten)` gibt eine **neue** `Zeit` zurück, die so viele Minuten später ist (über Mitternacht hinaus beginnt es wieder bei `00:00`)",
      ],
      starter: code`class Zeit:
    def __init__(self, stunden, minuten):
        self.stunden = stunden
        self.minuten = minuten
`,
      tests: [
        { type: 'eval', expr: 'str(Zeit(9, 5))', expect: '"09:05"' },
        { type: 'eval', expr: 'str(Zeit(14, 30))', expect: '"14:30"' },
        { type: 'eval', expr: 'Zeit(8, 0) < Zeit(9, 30)', expect: 'True' },
        { type: 'eval', expr: '[str(z) for z in sorted([Zeit(12, 0), Zeit(7, 45), Zeit(9, 15)])]', expect: '["07:45", "09:15", "12:00"]' },
        { type: 'eval', expr: 'str(Zeit(10, 50).plus(25))', expect: '"11:15"' },
        { type: 'eval', expr: 'str(Zeit(23, 30).plus(45))', expect: '"00:15"' },
      ],
      hints: ['Zweistellig: `f"{self.stunden:02d}:{self.minuten:02d}"`', 'Vergleichen und Rechnen geht am einfachsten in Minuten seit Mitternacht: `self.stunden * 60 + self.minuten`', 'plus: `ges = (alt + minuten) % (24 * 60)` → `return Zeit(ges // 60, ges % 60)`'],
      solution: code`class Zeit:
    def __init__(self, stunden, minuten):
        self.stunden = stunden
        self.minuten = minuten

    def gesamt(self):
        return self.stunden * 60 + self.minuten

    def __str__(self):
        return f"{self.stunden:02d}:{self.minuten:02d}"

    def __lt__(self, other):
        return self.gesamt() < other.gesamt()

    def plus(self, minuten):
        ges = (self.gesamt() + minuten) % (24 * 60)
        return Zeit(ges // 60, ges % 60)`,
    },
    {
      id: 'py-09-04', title: 'Vererbung',
      lesson: [
        "Mit **Vererbung** baust du spezialisierte Klassen auf einer allgemeinen auf: `class Katze(Tier):` – eine Katze **ist ein** Tier und erbt alle Attribute und Methoden.",
        "Die Kindklasse kann Methoden **überschreiben** (gleicher Name, anderes Verhalten). Mit `super().__init__(...)` rufst du den Konstruktor der Elternklasse auf, statt alles zu wiederholen.",
        "`isinstance(minka, Tier)` ist `True` – auch für Unterklassen.",
      ],
      commands: [
        ['class Kind(Eltern):', 'erben'],
        ['super().__init__(…)', 'Eltern-Konstruktor'],
        ['gleiche Methode neu definieren', 'überschreiben'],
        ['isinstance(obj, Klasse)', 'Typ prüfen'],
      ],
      example: code`class Tier:
    def __init__(self, name):
        self.name = name

    def sprich(self):
        return "..."

class Katze(Tier):
    def sprich(self):
        return "Miau!"

for t in [Tier("Ding"), Katze("Minka")]:
    print(t.name, t.sprich())`,
      exampleOut: 'Ding ...\nMinka Miau!',
      task: [
        "Gegeben ist die Klasse `Figur` für ein Spiel. Schreib zwei Unterklassen:",
        "- `Krieger(name)`: hat `leben = 120` und `angriff()` gibt `15` zurück\n- `Magier(name)`: hat `leben = 80` und zusätzlich `mana = 50`. `angriff()` gibt `30` zurück und kostet 10 Mana. Ist nicht genug Mana da, gibt `angriff()` nur `5` zurück.",
        "Benutze `super().__init__`.",
      ],
      starter: code`class Figur:
    def __init__(self, name, leben):
        self.name = name
        self.leben = leben

    def angriff(self):
        return 1

    def __str__(self):
        return f"{self.name} ({self.leben} LP)"
`,
      tests: [
        { type: 'eval', expr: 'str(Krieger("Thor"))', expect: '"Thor (120 LP)"' },
        { type: 'eval', expr: 'Krieger("Thor").angriff()', expect: '15' },
        { type: 'assert', code: 'm = Magier("Merlin")\nassert m.leben == 80 and m.mana == 50 and isinstance(m, Figur)', msg: '`Magier` ist eine `Figur` mit 80 LP und 50 Mana' },
        { type: 'assert', code: 'm = Magier("Merlin")\nschaden = [m.angriff() for _ in range(6)]\nassert schaden == [30, 30, 30, 30, 30, 5], schaden\nassert m.mana == 0', msg: 'Magier: 5× 30 Schaden, dann ohne Mana nur 5' },
        { type: 'src', pattern: 'super\\(\\)\\.__init__', msg: 'Benutzt `super().__init__`' },
      ],
      hints: ['`class Krieger(Figur):` → `def __init__(self, name): super().__init__(name, 120)`', 'Magier: `if self.mana >= 10: self.mana -= 10; return 30` sonst `return 5`'],
      solution: code`class Figur:
    def __init__(self, name, leben):
        self.name = name
        self.leben = leben

    def angriff(self):
        return 1

    def __str__(self):
        return f"{self.name} ({self.leben} LP)"

class Krieger(Figur):
    def __init__(self, name):
        super().__init__(name, 120)

    def angriff(self):
        return 15

class Magier(Figur):
    def __init__(self, name):
        super().__init__(name, 80)
        self.mana = 50

    def angriff(self):
        if self.mana >= 10:
            self.mana -= 10
            return 30
        return 5`,
    },
    {
      id: 'py-09-p', kind: 'project', title: 'Tamagotchi',
      lesson: [
        "🛠 **Projekt: Dein eigenes Tamagotchi!** Ein virtuelles Haustier mit Hunger, Laune und Energie – das du füttern, bespielen und schlafen legen musst.",
        "Werte werden auf den Bereich **0 bis 100** begrenzt. Dafür ist `max(0, min(100, wert))` ein praktischer Trick.",
      ],
      commands: [
        ['max(0, min(100, x))', 'auf 0–100 begrenzen'],
        ['def __str__(self):', 'Status-Anzeige'],
        ['self.methode()', 'eigene Methode aufrufen'],
      ],
      starter: code`class Tamagotchi:
    def __init__(self, name):
        self.name = name
        self.hunger = 50
        self.laune = 50
        self.energie = 50
`,
      steps: [
        {
          title: 'Grundpflege',
          task: [
            "Füge Methoden hinzu (alle Werte bleiben zwischen 0 und 100):",
            "- `fuettern()`: hunger −30\n- `spielen()`: laune +25, energie −20, hunger +10\n- `schlafen()`: energie +40, hunger +5",
          ],
          tests: [
            { type: 'assert', code: 't = Tamagotchi("Pixel")\nt.fuettern()\nassert t.hunger == 20\nt.fuettern()\nassert t.hunger == 0', msg: 'fuettern senkt den Hunger (nicht unter 0)' },
            { type: 'assert', code: 't = Tamagotchi("Pixel")\nt.spielen()\nassert (t.laune, t.energie, t.hunger) == (75, 30, 60)', msg: 'spielen verändert Laune, Energie, Hunger' },
            { type: 'assert', code: 't = Tamagotchi("Pixel")\nt.schlafen(); t.schlafen()\nassert t.energie == 100 and t.hunger == 60', msg: 'schlafen – Energie max. 100' },
          ],
          hints: ['Eine Hilfsfunktion spart Arbeit: `def grenze(x): return max(0, min(100, x))`'],
        },
        {
          title: 'Stimmung',
          task: [
            "Schreib `stimmung()`, die einen Text zurückgibt:",
            "- `hungrig` wenn hunger **über 70**\n- sonst `müde` wenn energie **unter 20**\n- sonst `glücklich` wenn laune **mindestens 70**\n- sonst `okay`",
            "Und `__str__`: `Pixel 😺 H:50 L:50 E:50 (okay)`",
          ],
          tests: [
            { type: 'eval', expr: 'str(Tamagotchi("Pixel"))', expect: '"Pixel 😺 H:50 L:50 E:50 (okay)"' },
            { type: 'assert', code: 't = Tamagotchi("P")\nt.hunger = 80\nassert t.stimmung() == "hungrig"\nt.hunger = 10; t.energie = 10\nassert t.stimmung() == "müde"\nt.energie = 50; t.laune = 70\nassert t.stimmung() == "glücklich"', msg: 'stimmung() in der richtigen Reihenfolge' },
          ],
          hints: ['Reihenfolge der `if/elif` ist entscheidend.'],
        },
        {
          title: 'Spielrunde',
          task: [
            "Baue unter der Klasse eine kleine Spielschleife: Erzeuge `tier = Tamagotchi(\"Pixel\")`, gib den Status aus und lies Befehle (`f`, `s`, `z` für füttern, spielen, schlafen) bis `ende`. Nach jedem Befehl wird der Status ausgegeben. Unbekannte Befehle: `?`",
          ],
          tests: [
            { type: 'out', input: ['s', 'f', 'x', 'ende'], expect: 'Pixel 😺 H:50 L:50 E:50 (okay)\nPixel 😺 H:60 L:75 E:30 (glücklich)\nPixel 😺 H:30 L:75 E:30 (glücklich)\n?', label: 'Spielrunde' },
          ],
          hints: ['`print(tier)` ruft automatisch `__str__` auf.'],
        },
      ],
      solution: code`def grenze(x):
    return max(0, min(100, x))

class Tamagotchi:
    def __init__(self, name):
        self.name = name
        self.hunger = 50
        self.laune = 50
        self.energie = 50

    def fuettern(self):
        self.hunger = grenze(self.hunger - 30)

    def spielen(self):
        self.laune = grenze(self.laune + 25)
        self.energie = grenze(self.energie - 20)
        self.hunger = grenze(self.hunger + 10)

    def schlafen(self):
        self.energie = grenze(self.energie + 40)
        self.hunger = grenze(self.hunger + 5)

    def stimmung(self):
        if self.hunger > 70:
            return "hungrig"
        elif self.energie < 20:
            return "müde"
        elif self.laune >= 70:
            return "glücklich"
        return "okay"

    def __str__(self):
        return f"{self.name} 😺 H:{self.hunger} L:{self.laune} E:{self.energie} ({self.stimmung()})"

tier = Tamagotchi("Pixel")
print(tier)
while True:
    befehl = input("f/s/z/ende? ")
    if befehl == "ende":
        break
    if befehl == "f":
        tier.fuettern()
    elif befehl == "s":
        tier.spielen()
    elif befehl == "z":
        tier.schlafen()
    else:
        print("?")
        continue
    print(tier)`,
    },
  ],
});
