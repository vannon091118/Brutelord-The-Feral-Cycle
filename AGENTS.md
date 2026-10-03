# AGENTS.md — Dungeon Lord

Vite + React 19 + Tailwind 4. Ein spielbarer Slice: Hive anklicken, Dungling
erscheint, angrenzende Erde abbauen, ein Feld wird nutzbarer Boden, Wurzeln
greifen in die Nachbarfelder aus. Die Domäne unter `src/domain/` ist reines JS
ohne React, DOM, SVG, `Math.random()` und `Date.now()` — `npm run verify` prüft
das automatisch. Das Repository ist streng regelgebunden: Hard Caps, globale
Versionierung und eine Commit-Policy werden von einem eigenen Gate durchgesetzt,
das in CI genauso läuft wie lokal.

## Dev-Umgebung

```sh
npm ci          # Node 22 in CI, keine .env, keine externen Dienste
npm run dev     # Vite auf 127.0.0.1
```

## Build & Test

```sh
npm run gate            # alle drei Wächter: Hard Caps, Version, Commits
npm run gate -- --tree  # nur Hard Caps (300 LOC/Modul, 30 LOC/Funktion, 3 Parameter, 7 Imports)
npm run gate -- --commits=<base>..<head>  # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>    # Version gegen eine Basisrevision
npm run verify          # Slice-Simulation in node: Onboarding, Abbau, Verwurzelung, Architekturgrenzen
npm run verify:commits  # Regressionstests des Commit-Gates selbst
npm run build           # Production-Build (vite build)
npm run version:check   # Lock vs. VERSION, package.json, package-lock.json
npm run version:sync    # package.json und package-lock aus dem Lock spiegeln
```

Es gibt kein `npm test` und kein Linting-Tool — Gate und `verify` sind die
Qualitätswächter. `npm run verify` ist die eigentliche Abnahmesimulation: sie
spielt den Slice deterministisch mit einer virtuellen Uhr durch und prüft
Onboarding-Zeiten, Abbau-Ergebnis, Verwurzelungs-Phasen und Grid-Ausbau. Sie
importiert die echten Module aus `src/` — neue Domänenlogik ist erst geprüft,
wenn ein `check-*.mjs` unter `scripts/verify/` sie aufruft; Einstiegspunkt ist
`scripts/verify-slice.mjs`.

`.github/workflows/ci.yml` fährt genau diese Befehle in dieser Reihenfolge:
`gate --version`, `gate --tree`, `gate --commits`, `verify:commits`, `verify`,
`build` — mit `fetch-depth: 0`, sonst fehlen dem Commit-Wächter die Shas.

## Hard Caps (blockieren CI)

Jede Datei unter `src/` und `scripts/`: max. 300 LOC, max. 7 Imports, max. 3
Parameter pro benannter Funktion, max. 30 LOC pro benannter Funktion. Der Check
ist eine Textanalyse in `scripts/lib/source-metrics.mjs` — er zählt **Imports
als Zeilen**, nicht als Symbole: ein mehrzeiliger `import { … }`-Block ist eine
Zeile, zwei getrennte `import`-Statements sind zwei. Anonyme Callbacks zählen
nicht als Funktionen. Gemessen werden nur `.js`, `.jsx` und `.mjs` —
`src/styles/globals.css` fällt nicht darunter.

Konsequenz: neue Logik gehört in eine eigene Datei, nicht in eine bestehende
Komponente. Ein Verstoß wird erst sichtbar, wenn das Gate läuft — `npm run gate`
vor dem Commit. Mehrere Dateien in `src/ui/` und `src/world/` stehen bereits bei
genau 7 Imports; ein weiterer Import dort fällt sofort durch.

## Versionierung

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel. Nur ändern über:

```sh
npm run version:bump -- patch   # auch minor | major
npm run version:check
```

Direkte Edits an Lock oder Spiegeln fallen im Gate durch. Die `revision` steigt
pro Versionserhöhung um genau 1.

## Commit-Policy (hart, per Gate erzwungen)

- Betreff max. 72 Zeichen.
- Body **100–1000 Wörter** (ohne das Label) und **jede geänderte Datei muss
  namentlich im Body vorkommen**.
- Letzte nichtleere Body-Zeile: exakt einmal `Vannon-(vannon091118)`.
- Verboten: `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`, `Generated with …`,
  Footer-Trenner (`---`) und generische `Key: value`-Trailer.

Commit-Nachrichten und Code-Kommentare auf Deutsch, Code-Bezeichner englisch.

## Konventionen

- 2 Leerzeichen, kein Semikolon am Zeilenende, einfache Quotes — folgt dem
  bestehenden Stil; kein Formatter ist konfiguriert.
- Layout: `src/domain/` (Spielwahrheit) → `src/state/` (Reducer, Actions,
  Selektoren) → `src/ui/` (HUD, Menüs) → `src/world/` (SVG-Ebenen). Nur
  `src/domain/` importiert nach außen nichts — das ist die einzige erzwingte
  Grenze (`scripts/verify/check-architecture.mjs`). Im übrigen gilt: `state`,
  `ui` und `world` lesen aus `domain`; `ui/GameStage.jsx` importiert `world`,
  und `world/world-view.js` importiert `state/selectors.js`.
- Ein Reducer pro Verantwortung in `src/state/reducers/`, verbunden in
  `src/state/game-reducer.js` — dort iteriert eine Liste über `DOMAIN_REDUCERS`,
  der erste Reducer, der den Zustand verändert, gewinnt.
- Fakten liegen als eingefrorene Konstanten-Objekte (`TILE_KIND`, `DUNGLING_STATE`,
  `HARD_CAPS`) in `*-config.js` bzw. beim Entity — nie als Magic Strings.
- Kommentare und Doc-Blöcke sind auf Deutsch und erklären das *Warum*.
- Deterministisch: sichtbare Geometrie leitet sich aus Koordinaten und Seeds ab
  (`makeRng`, `seed`), nie aus `Math.random()`.

## Task-Abschluss (hart, nicht verhandelbar)

Nach **jedem** abgeschlossenen Task, ohne Ausnahme:

1. **Roadmap aktualisieren.** `Docs/ROADMAP.md` ist versionsgebundene
   Pflichtdoku und wird im selben Commit nachgezogen. Fertiges bekommt ein
   Häkchen, der Eintrag bleibt stehen. Eine neue Zielversion bekommt eine eigene
   Section. Erledigtes wird nie gelöscht — die Historie ist der Punkt.
   Die Versionsnummer selbst kommt aus `version.lock.json`, nicht aus dem Dokument.
2. **Commit + Push auf `main` ist by design.** Kein PR-Warten, kein
   Branches-Zirkus. Wer erst im Review-Check erfährt, dass die Regeln
   verletzt sind, hat zu lange gewartet.
3. **Vor dem Push das Gate explizit auf den neuen Commit zeigen.** Nach dem
   Push ist `origin/main..HEAD` leer und der Commit-Wächter meldet „keine
   neuen Commits" — die Pflichtprüfung wäre dann Formsache. Deshalb:
   `npm run gate -- --commits=HEAD~1..HEAD` (bei mehreren neuen Commits:
   `<base>..HEAD`).
4. **Erst pushen, wenn 1–3 grün sind.** Sonst ist `main` die Fehlerkonsole.

Reihenfolge: Roadmap → `npm run gate -- --commits=…` → `npm run verify` →
Commit → Push.

## Pitfalls

- `npm run gate` prüft Commits nur gegen eine Basisrevision (`origin/main..HEAD`).
  Auf `main` mit uncommitteten Änderungen meldet es „keine neuen Commits" und
  übersieht damit Regelverstöße — der eigentliche Test ist der PR-Check. Lokal
  stattdessen `npm run gate -- --commits=<base>..<head>`. Genau darum ist
  Schritt 3 oben Pflicht: nach einem Push auf `main` ist dieser Bereich leer.
- Gate und `verify` lesen Pfade relativ zum CWD (`analyzeTree('src')`,
  `readVersionState(process.cwd())`, `collect('src/domain')`) — immer aus dem
  Repo-Wurzelverzeichnis starten.
- Der Sektions-Wächter in `scripts/verify/expect.mjs` ist global zustandsbehaftet
  (`lines`, `failures`); Prüfungen zählen über den ganzen `verify`-Lauf.
- `scripts/verify/run-slice.mjs` leitet sein Zielfeld aus
  `ONBOARDING_CONFIG.firstEarthBlock` über `tileId()` ab, es ist kein festes
  Raster verdrahtet. Verschiebt sich der Hive, wandert das Ziel mit — die
  abgeleiteten Erwartungen in den `check-*.mjs` aber nicht automatisch.
- `dist/` ist Build-Ausgabe und nicht versioniert — nicht von Hand editieren.
- Kein Lint- oder Format-Automat: Einrückungsfehler bleiben unentdeckt, bis
  jemand die Datei liest.
- `npm run dev` bindet an `127.0.0.1` — aus einem Container oder von außen ist
  das nicht erreichbar.
