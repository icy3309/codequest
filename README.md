# Mausequest – Programmieren lernen, Käsestück für Käsestück 🐭🧀

(Maus-Version von Codequest – das Original liegt als Backup in `../CodingLearning-Backup`.)

Eine kleine Lern-App im Browser: kurze Erklärung → Befehlsliste mit Beispiel → Aufgabe → automatische Prüfung → Feedback (auch von Claude). Nach jedem Themenbereich gibt es ein Projekt. Dazu: Punkte, Ränge, Tagesaufgaben, ein Wochenrätsel mit 3 Stufen, Freundesliste mit Online-Status und Ranglisten.

**Inhalt bisher:** Python mit 10 Themen × (4 Level + 1 Projekt) = 50 Aufgaben. JavaScript, SQL, HTML/CSS und Java sind vorbereitet („bald“).

## Lokal starten

Kein Build, keine Installation – nur Python 3 (auf dem Mac schon da):

```bash
cd ~/Desktop/Claude/Code/CodingLearning
python3 -m http.server 8000
```

Dann <http://localhost:8000> öffnen. Ohne weitere Einrichtung läuft alles **offline** (Fortschritt im Browser). Python selbst läuft per [Pyodide](https://pyodide.org) im Browser – beim ersten Ausführen lädt es ca. 10 MB (danach aus dem Cache).

`http://localhost:8000/verify.html` prüft alle Musterlösungen gegen ihre Tests – nach Änderungen an Inhalten aufrufen.

## Online-Teil einrichten (Freunde, Rangliste, Claude-Feedback)

1. **Supabase-Projekt anlegen** auf <https://supabase.com> (neues, eigenes Projekt; Region am besten EU).
2. **SQL ausführen:** Im Dashboard → *SQL Editor* den Inhalt von `supabase/schema.sql` einfügen und ausführen, danach `supabase/puzzles.sql`.
3. **Zugangsdaten eintragen:** *Project Settings → API* → `Project URL` und den `anon`/`publishable` Key in `js/config.js` eintragen. (Beide sind öffentlich – geschützt wird alles per Row-Level-Security.)
4. **Login-Weiterleitung:** *Authentication → URL Configuration* → `Site URL` = `http://localhost:8000` (bzw. später die echte Adresse) und dieselbe Adresse unter *Redirect URLs* eintragen.
5. **Claude-Feedback (Edge Function):**
   - *Edge Functions → Deploy a new function → Via Editor*, Name **`review`**, Inhalt von `supabase/functions/review/index.ts` einfügen, deployen.
   - *Edge Functions → Secrets*: `ANTHROPIC_API_KEY` mit deinem Key aus der [Claude Console](https://console.anthropic.com) anlegen.
   - Limit: 20 Feedbacks pro Person und Tag (änderbar in `bump_ai_usage()` in `schema.sql`). Modell: `claude-opus-5-5` mit niedrigem Aufwand (`effort: low`) – kurz und günstig.

Hinweis: Supabase verschickt ohne eigenen Mailserver nur wenige Login-Mails pro Stunde. Nach dem ersten Login kann man im Profil ein Passwort festlegen.

## Online stellen (optional)

Der Ordner ist eine statische Webseite – z. B. über **GitHub Pages** veröffentlichen. Danach die neue Adresse in Supabase (Schritt 4) eintragen und in `js/config.js` die Angaben für Impressum/Datenschutz ausfüllen.

## Wie es funktioniert

| Teil | Dateien |
|---|---|
| Seite & Screens | `index.html`, `style.css`, `js/ui.js`, `js/main.js` |
| Kurse & Level-Daten | `js/courses.js`, `content/python/t01.js` … `t10.js` |
| Code ausführen & testen | `js/runner/runner.js`, `python-worker.js`, `harness.py` |
| Editor | `js/editor.js` |
| Maus-Maskottchen | `js/mascot.js` |
| Level-Ansicht, Sterne | `js/levels.js` |
| Login, Cloud, Punkte | `js/net.js` |
| Freunde, Online-Status, Rangliste | `js/social.js` |
| Ränge | `js/ranks.js` |
| Tagesaufgaben | `js/quests.js` |
| Wochenrätsel | `js/puzzle.js`, `js/puzzles-data.js`, `supabase/puzzles.sql` |
| Claude-Feedback | `js/feedback.js`, `supabase/functions/review/index.ts` |
| Datenbank | `supabase/schema.sql` |

**Punkte:** Level 30 / Projekt 100 pro Stern (3 Sterne; −1 für Hinweise, −1 für 4+ Fehlversuche, Lösung angesehen = 1 Stern). Tagesaufgaben 20–100. Wochenrätsel 100/200/400 + Bonus für die ersten drei. Online rechnet der **Server** die Punkte aus (`record_levels`, `claim_quest`, `submit_puzzle`); Rätselantworten prüft nur der Server.

**Ränge:** 🐭 Babymaus (0) → 🧀 Krümelsucherin (300) → 🔍 Käsedetektivin (1.000) → 🔧 Schrauber-Maus (2.500) → 🧠 Mäusegenie (5.000) → 🏰 Käse-Architektin (10.000) → 👑 Mäusekönigin (20.000).

**Maskottchen:** Mimi, die Pixel-Schraubermaus (`js/mascot.js`). Sprites sind Zeichen-Raster im Code; Reaktionen über `Mascot.react(modus, text)`.

### Ein Level hinzufügen

Level sind reine Daten (siehe `content/python/t01.js`). Testarten in `tests`/`hidden`:

- `{ type: 'out', input: ['3'], expect: '...' }` – komplette Ausgabe (Eingaben für `input()`)
- `{ type: 'has', … }` – Ausgabe enthält den Text
- `{ type: 'eval', expr: 'f(2)', expect: '4' }` – Python-Ausdruck, Typ zählt
- `{ type: 'evalout', expr: 'f()', callInput: [...], expect: '...' }` – Ausgabe beim Funktionsaufruf
- `{ type: 'assert', code: 'assert x == 3', msg: '…' }` – beliebiger Check
- `{ type: 'src' | 'nosrc', pattern: 'regex', msg: '…' }` – Code muss (nicht) enthalten

Projekte haben `steps` (jeder mit `title`, `task`, `tests`, `hints`); Tests gelten kumulativ, `replaces: true` startet neu. Beim Prüfen ist `random` mit Seed 0 eingefroren (`randint(1, 100)` → 50).

### Neues Wochenrätsel

Das Generator-Skript liegt in `.puzzle-generator/` (per .gitignore nicht im Repo, weil man daraus die Antworten berechnen kann): `python3 .puzzle-generator/gen_puzzles.py js/puzzles-data.js supabase/puzzles.sql`. Neue Rätsel: Eintrag in `js/puzzles-data.js` (`hash` = SHA-256 von `s<slot>t<stufe>:<antwort ohne Leerzeichen, klein>`) und dieselbe Zeile in `weekly_puzzles` eintragen. Die Rätsel rotieren wöchentlich ab `PUZZLE_START`.

### Weitere Sprachen

`LANGS` in `js/courses.js` auf `ready: true` setzen, Inhalte unter `content/<sprache>/` anlegen und in `js/runner/runner.js` einen Runner ergänzen (JavaScript: Web Worker, SQL: sql.js, HTML/CSS: iframe, Java: externer Ausführungsdienst über eine Edge Function).
