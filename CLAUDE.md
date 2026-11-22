# Mausequest

Python-Lern-App im Browser (Level → Aufgabe → automatische Tests), süßer Maus-Look mit Pixel-Maskottchen „Mimi“. Für Jasper und seine Freundin; live unter https://icy3309.github.io/mausequest/ (GitHub Pages, Repo `icy3309/mausequest`). Das Original im Space-Look liegt unverändert in `../CodingLearning-Backup` – nicht anfassen.

## Kommunikation
- Mit Jasper auf **Deutsch** sprechen. Alle Texte in der App sind Deutsch, per Du, freundlich, mausig.
- Lerninhalte nur ändern, wenn darum gebeten wird – Look & Features ja, Inhalte nein.

## Stack
- Reines HTML/CSS/JS, **kein Build, kein Node**. Globale Funktionen über `<script>`-Tags in fester Reihenfolge in `index.html` (keine ES-Module).
- Python läuft per **Pyodide 0.26.4** in einem Web Worker (`js/runner/`). Test-Logik in `js/runner/harness.py` (läuft auch lokal mit `python3`).
- Online-Teil: **Supabase** (Projekt-Ref `rqvfkpwqozovgqxinfqu`, EU) für Login, Freunde, Ranglisten, Wochenrätsel. Ohne Login läuft alles offline (localStorage, Key `codequest-v1` – nicht umbenennen, sonst ist der Fortschritt weg).

## Wichtige Dateien
- `content/python/t01.js` … `t10.js` – Level als Daten (`addTopic`). Format & Testarten: siehe README „Ein Level hinzufügen“.
- `js/levels.js` – Level-Ansicht, Terminal (interaktives `input()`), Prüfen, Sterne, „So soll es aussehen“, Fast-Treffer.
- `js/mascot.js` – Mimi (Pixel-Sprites als Zeichen-Raster), `Mascot.react()`, `HeroMouse` (Startseite).
- `js/music.js` (Lofi-Song, WebAudio), `js/easter.js` (Käse-Easter-Egg), `js/feedback.js` (KI-Prompt in die Zwischenablage).
- `js/net.js`, `js/social.js`, `js/ranks.js`, `js/quests.js`, `js/puzzle.js` – Online-Funktionen.
- `supabase/schema.sql` + `supabase/update-*.sql` – Datenbank. `supabase/functions/review` ist **ungenutzt** (altes Claude-Feedback).

## Befehle
- Lokal starten (im Terminal-Tab, nicht per Preview-Tool – das hat keinen Zugriff auf den Desktop-Ordner):
  `cd ~/Desktop/Claude/Code/CodingLearning && python3 -m http.server 8000` → http://localhost:8000
- Inhalte prüfen: http://localhost:8000/verify.html muss **„OK 50“** zeigen (jede Musterlösung besteht, jeder Startcode scheitert).
- Hochladen: `git add -A && git commit -m "…" && git push` → nach ~1 Min live. Danach Live-Seite kurz prüfen.

## Regeln (immer beachten)
- **Cache-Busting:** Nach jeder Änderung an einer JS-/CSS-Datei deren `?v=`-Nummer in `index.html` erhöhen (Worker: `python-worker.js?v=` in `runner.js`, `harness.py?v=` im Worker). Sonst sehen Nutzer die alte Version.
- **Editor bleibt „ehrlich“:** kein Auto-Einrücken, keine Auto-Klammern, keine Schrift-Ligaturen. Doppelpunkt & Einrückung sollen gelernt werden.
- **Erwartete Ausgabe muss klar sein:** neue Tests so schreiben, dass „So soll es aussehen“ (aus den sichtbaren Tests generiert) eindeutig ist. Versteckte Tests (`hidden`) gegen Hardcoding.
- Beim Prüfen ist `random` mit Seed 0 eingefroren (`randint(1, 100)` → 50).
- `prefers-reduced-motion` respektieren; Musik und Soundeffekte müssen getrennt abschaltbar bleiben.
- Mobil (375 px) darf nichts horizontal scrollen.

## Sicherheit (sehr wichtig für Jasper)
- **Niemals committen:** `.puzzle-generator/` (enthält `pepper.txt` und `answers.txt` = Rätsel-Lösungen), Tokens, API-Keys, `sb_secret_…`. Vor jedem Commit `git status` ansehen.
- Der Supabase-Key in `js/config.js` ist der **öffentliche** Publishable Key – das ist okay. Den Secret Key nie verwenden.
- Punkte, Ränge, Rätsel ändern sich **nur über Server-Funktionen** (`record_levels`, `claim_quest`, `submit_puzzle`); Tabellen haben RLS. Keine neuen direkten Schreibrechte für `anon`/`authenticated`.
- Rätsel-Antworten werden **nur auf dem Server** geprüft (Hash mit Pepper aus `app_secrets`). Nie Lösungen oder Hashes ins Frontend.
- Alles, was von anderen Spielern kommt (Namen, Presence), mit `esc()` ausgeben. CSP in `index.html` nur gezielt erweitern.
- Neue Rätsel: `python3 .puzzle-generator/gen_puzzles.py js/puzzles-data.js supabase/puzzles.sql`, dann `puzzles.sql` in Supabase ausführen.

## Datenbank ändern
- Änderungen als neue Datei `supabase/update-N-name.sql` (mehrfach ausführbar: `create or replace`, `if not exists`) **und** in `schema.sql` nachziehen.
- Einspielen über das Supabase-Dashboard (SQL-Editor). Vorher Jasper fragen; danach mit einer Abfrage prüfen. Security Advisor im Dashboard checken.

## Arbeitsweise
- Größere Umbauten erst planen (Plan-Modus), kleine Wünsche direkt umsetzen.
- Nicht zwei Claude-Sessions gleichzeitig in diesem Ordner arbeiten lassen (sonst Git-Worktree nutzen).
- Nach Änderungen im Browser testen (Konsole ohne Fehler), dann committen und pushen, dann Live-Seite prüfen. Nicht am Fortschritt in Jaspers eingeloggtem Konto herumspielen (keine Level für ihn lösen).
- Offen (Stand 22.11.2026): Postanschrift im Impressum (`js/config.js`, `SITE_OWNER`) fehlt; Classic-GitHub-Token nach Ablauf löschen; kostenloses Supabase-Projekt pausiert nach 7 Tagen ohne Nutzung.
