# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sprache

Antworten, Commit-Bodies und Code-Kommentare auf Deutsch, Code-Bezeichner
englisch. `AGENTS.md`, `Docs/ARCHITEKTUR.md` und `Docs/ROADMAP.md` sind die
verbindlichen Regelwerke — dieses Dokument ist der Kurzüberblick darüber.

## Befehle

```sh
npm ci                  # CI pinnt Node 22, lokal läuft Node 26 — kein .env, keine externen Dienste
npm run dev             # Vite, bindet an 127.0.0.1
npm run gate            # alle Wächter: Hard Caps, Version, Commits
npm run verify          # Abnahmesimulation des Slice (kein Browser, virtuelle Uhr)
npm run build           # Production-Build
```

Es gibt **kein `npm test` und keinen Linter/Formatter**. `gate` und `verify` sind
die einzigen Qualitätswächter.

Gate-Unterbefehle:

```sh
npm run gate -- --tree                       # nur Hard Caps
npm run gate -- --commits=<base>..<head>     # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>       # Version gegen Basisrevision
npm run verify:commits                       # Regressionstests des Commit-Gates selbst
```

`npm run gate` ohne Argumente prüft Commits nur gegen `origin/main..HEAD`. Auf
`main` mit uncommitteten Änderungen meldet das „keine neuen Commits" und
übersieht Verstöße. Der eigentliche Test ist `npm run gate -- --commits=<base>..<head>`.

Versionierung nur über den Versionierer:

```sh
npm run version:bump -- patch   # auch minor | major
npm run version:check
npm run version:sync
```

`version.lock.json` ist die Autorität, `VERSION`, `package.json` und
`package-lock.json` sind Spiegel. Direkte Edits daran fallen im Gate durch.

### Dev-Server

`npm run dev` muss von der Shell gelöst starten
(`python3 -c "subprocess.Popen([…], start_new_session=True)"`, Log nach
`/tmp/vite-dev.log`). Vite meldet `ready in ~1000 ms`, der Port antwortet aber
erst nach ~4 s — HTTP 200 ist das einzige verlässliche Ready-Signal, ein `000`
dazwischen ist kein Absturz.

### Einen Teil prüfen

`npm run verify` läuft als Ganzes, es gibt keinen Einzeltest-Runner.
`scripts/verify-slice.mjs` ist der Einstiegspunkt und ruft die `check-*.mjs` in
fester Reihenfolge auf. Für eine einzelne Prüfung: das `check-*.mjs` temporär
in `verify-slice.mjs` eintragen und `npm run verify` laufen lassen. Vorsicht —
`scripts/verify/expect.mjs` hält `lines` und `failures` global auf Modulebene,
alles zählt über den ganzen Lauf, und `summary()` ist nur einmal aufrufbar.
Deshalb ist die Reihenfolge dort nicht austauschbar.

## Architektur

Vier Schichten, Pfeile zeigen nach oben:

```
src/domain/   Spielwahrheit, reines JS — kein React, kein DOM, kein SVG
src/state/    Reducer, Aktionen, Selektoren
src/ui/       HUD, Menüs
src/world/    SVG-Ebenen
```

Einzig erzwungen ist die Basisgrenze: `scripts/verify/check-architecture.mjs`
prüft in drei Regex-Durchgängen, dass `src/domain/` weder `react` noch
`document.`/`window.` benutzt, dass in ganz `src/` (ohne Kommentare) kein
`Math.random(` und kein `Date.now(` steht und dass `src/domain/` kein
SVG-Markup enthält. Die Domäne wird dabei nur über `.js` eingesammelt, nicht
über `.jsx`. **Die Importrichtung unterhalb davon ist Konvention, nicht Gate** —
sie umzudrehen fällt durch keine dieser drei Prüfungen.

Real gemessen: `domain` importiert nur sich selbst. `state`, `ui` und `world`
lesen aus `domain`. Zwei Kanten zeigen bewusst gegen die Kette:
`src/ui/GameStage.jsx` rendert die Szene aus `world`, und
`src/world/world-view.js` liest Selektoren aus `state`. Es gibt keine Kante
`world → ui` und keine `state → ui`.

### Reducer-Kette

`src/state/game-reducer.js` verteilt auf eine Liste von Domänen-Reducern unter
`src/state/reducers/`; der erste, der den Zustand verändert, gewinnt. Ein Befehl
ändert genau einen Bereich. `colony-reducer.js` trägt aus Importnotwendigkeit
zwei Verantwortungen (Bau-Befehle und Arbeitstakt) — getrennt in der Datei
trotzdem.

### Drei Uhren

Dauerprozesse liegen in eigenen Runnern, nicht im Onboarding-Plan, weil dessen
Timer bei jedem Phasenwechsel verfallen: `use-schedule-runner.js` (Onboarding),
`use-rooting-runner.js` (Verwurzelung), `use-work-runner.js` (Arbeit). Alle drei
lesen den Zustand, sie besitzen ihn nicht, und schweigen, wenn nichts zu tun ist.

### Configs sind die Wahrheit

Jede Zeit und jedes Tuning steht an genau einer Stelle in einem eingefrorenen
`*-config.js` (`ONBOARDING_CONFIG`, `JOB_CONFIG`, `ROOTING_CONFIG`,
`BUILDING_DEFS`, `world-config.js`, `deposit-config.js`) — niemals als Magic
String oder Zahl in einer Komponente. Die `check-*.mjs` leiten ihre Erwartungen
daraus ab. Ausnahme mit Biss: einige Prüfungen rechnen gegen hartkodierte
Literale — `check-mining-progress.mjs` prüft `totalMiningTicks() === 35`,
`check-start.mjs` prüft „exakt vier Hive-Tiles" statt `HIVE_SIZE`. Wer
`miningDurationMs`, `earthStateThresholds`, `HIVE_SIZE`, `blockStride` oder
`skipPerMille` ändert, muss diese Zahlen mitziehen.

Hive-Position und Startkoordinaten liegen in zwei Dateien: `HIVE_ORIGIN` in
`src/domain/world/world-config.js` sowie `dunglingSpawnTile` und
`firstEarthBlock` in `src/domain/onboarding/onboarding-config.js`.

### Determinismus

Sichtbare Geometrie leitet sich aus Koordinaten und Seeds ab, nie aus
`Math.random()`. `tileSeed(x, y)` lebt in `src/world/tile-shapes.js`. Wo die
Domäne Streuung braucht, hat sie bewusst eine **eigene** kleine Hash-Funktion
(die private `wobbleAt` in `src/domain/world/reveal.js`, `deposit-hash.js` über
`Math.imul`) — die Schichtgrenze ist wichtiger als Wiederverwendung, `tileSeed`
bleibt unangetastet. Ein exportiertes `seed` gibt es nirgends.

### Vorräte

Ein Vorrat ist ein Cluster-Datensatz in `world.deposits`; die Tiles tragen nur
`depositId`. Pro-Tile-Datensätze wären falsch — der Pool gehört dem ganzen
Vorrat. Zustände: `BURIED` → `HINTED` (über `spreadToNeighbors` in
`src/domain/world/rooting-world.js`, aufgerufen vom `rooting-reducer.js`) →
`FOUND` (beim Abbau via `mineTile`) → `SPENT`. Der Sichtbarkeitsradius der Sonde
darf keinen verborgenen Vorrat aufdecken, deshalb sitzt der Übergang in
`spreadToNeighbors` und nicht in der Reveal-Logik.

### Darstellung

`src/world/TileLayer.jsx` zeichnet in fünf Durchgängen: Erde, fertiger Boden,
`DepositGlow`, Verwurzelung, Bauten — Bauten stehen damit sichtbar über den
Wurzeln. `jobTrip()` liefert Zwischenpositionen, damit Träger laufen statt springen.

`soilBlob()` in `tile-shapes.js` zieht mit positivem `jitter` nach innen;
Überlappung entsteht nur über `outward`. Die vier festen Eckpunkte (`0`, `0.25`,
`0.5`, `0.75`) sind Pflicht: ohne sie schneidet die weiche Kurve die Ecken ab und
zwischen vier Nachbarn bleibt eine Raute stehen — das sieht nach Abstand aus,
ist aber eine fehlende Ecke.

Gestalterisch nicht verhandelbar: **nichts darf als Kachel erkennbar sein**.
Erde und Boden sind eine zusammenhängende Masse, Auswahlringe und Effekte folgen
der Fläche, nie dem Rechteck. Der Untergrund bleibt bei einer Art (heller Stein,
`src/world/floor/`).

## Hard Caps

Jede Datei unter `src/` und `scripts/`: max. **300 Codezeilen**, max. **30 LOC
pro benannter Funktion**, max. **3 Parameter**, max. **7 Importzeilen**, max.
**5 Kommentarzeilen**. Gemessen für `.js`, `.jsx`, `.mjs` und `.css` als
Textanalyse in `scripts/lib/source-metrics.mjs`. Für den LOC-Cap fallen
Kommentar- und Leerzeilen heraus; Imports zählen als Zeilen, nicht als Symbole.
Anonyme Callbacks zählen nicht als Funktionen.

Praktische Folgen:

- Neue Logik gehört in eine **eigene Datei**, nicht in eine bestehende Komponente.
- Der Ausweg aus der Drei-Parameter-Grenze ist ein **Objekt-Parameter**, kein
  zusätzlicher Helfer — gezählt werden Kommas auf oberster Ebene.
- Der JSX-Block einer Komponente zählt vollständig mit; lange Panels brauchen
  Unterkomponenten (`GameHud.jsx` und `BuildingPanel.jsx` sind genau so entstanden).
- Wer mehr erklären will, schreibt es nach `Docs/`, nicht in den Code.
- `TREE_ROOTS` kennt nur `src` und `scripts` — Hilfsskripte im Repo-Root
  umgehen alle Caps, landen aber im Commit.

## Pitfalls

- Gate und `verify` lesen Pfade relativ zum CWD — immer aus dem
  Repo-Wurzelverzeichnis starten.
- `src/domain/` darf nichts aus `src/world/` importieren; genau diese eine
  Kante prüft das Gate nicht.
- Eine temporäre `lab.html` im Repo-Root rendert echte Komponenten per
  `import '/src/…'` und ist danach wieder zu löschen. Ohne
  `import '/src/styles/globals.css'` fehlen die `--color-*`-Tokens und das Bild
  bleibt schwarz.
- `.venv/` steht nicht in `.gitignore`, wird aber von sich selbst ignoriert
  (`.venv/.gitignore` enthält `*`). `git status` zeigt es nicht, Werkzeuge, die
  den Baum ablaufen, zählen es aber mit — `.venv` braucht im Ausschluss.
- `dist/` und `dogfood-output/` sind Build-Ausgabe: nicht versioniert und nicht
  von Hand zu editieren.
- Ein Dev-Server auf 5173 blockiert, Vite weicht dann still auf 5174 aus. Vor
  dem Neustart `ss -ltnp | grep 517`.
- Änderungen an Domänen-Modulen lösen im Preview einen vollen Reload aus
  (Spielstand weg), und der Tab ist mit dem Menschen geteilt.

## Commit-Policy (hart, per Gate erzwungen)

- Betreff max. 72 Zeichen, Body **100–1000 Wörter**, jede geänderte Datei muss
  namentlich im Body vorkommen.
- Letzte nichtleere Body-Zeile: exakt einmal
  `created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.`
  (mit Gedankenstrich U+2014).
- Verboten: `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`, `Generated with …`,
  Footer-Trenner (`---`) und jedes `Key: value` als Trailer. Dateien deshalb in
  Prosa nennen, nicht als `src/x.js: Beschreibung` — die Trailer-Erkennung ist
  ein Zeilenanfang-Muster.

Vorprüfung ohne Commit:

```sh
git diff --cached --name-only   # → paths
# commitViolations({ sha, message, paths }) aus scripts/lib/commit-rules.mjs
# Message nach /tmp/commit-msg.txt schreiben, gegen dieselben Bytes prüfen,
# dann git commit -F /tmp/commit-msg.txt
```

## Task-Abschluss (hard, nicht verhandelbar)

Reihenfolge, kein PR-Warten, kein Branch-Zirkus — direkt auf `main`:

1. `Docs/ROADMAP.md` im selben Commit nachziehen (Fertiges bekommt ein Häkchen,
   der Eintrag bleibt stehen — die Historie ist der Punkt).
2. `npm run gate -- --commits=HEAD~1..HEAD` (bei mehreren Commits `<base>..HEAD`).
   Der Pflicht-Show muss **vor** dem Push passieren, sonst ist `origin/main..HEAD`
   leer und der Wächter meldet „keine neuen Commits".
3. `npm run verify`
4. Commit, dann Push.
