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
npm ci          # CI pinnt Node 22 (ci.yml), lokal läuft Node 26 — keine .env, keine externen Dienste
npm run dev     # Vite auf 127.0.0.1
```

Der Dev-Server muss von der Shell losgelöst starten: `nohup … &` in einem
normalen Befehl wird mit der Shell wieder abgeräumt. Bewährt hat sich
`python3 -c "subprocess.Popen([…], start_new_session=True)"` mit Log in
`/tmp/vite-dev.log`.

Der Log ist dabei keine Verlässlichkeit: Vite meldet `ready in ~1000 ms`,
der Port antwortet aber erst nach etwa 4 s. Ein `curl` dazwischen liefert
`000` — das ist kein Absturz, sondern die Lücke zwischen „gebunden" und
„liefert". Erst ab HTTP 200 ist der Server wirklich da.

## Build & Test

```sh
npm run gate            # alle drei Wächter: Hard Caps, Version, Commits
npm run gate -- --tree  # nur Hard Caps (300 LOC/Modul, 30 LOC/Funktion, 3 Parameter, 7 Imports)
npm run gate -- --commits=<base>..<head>  # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>    # Version gegen eine Basisrevision
npm run verify          # Slice-Simulation in node: Onboarding, Abbau, Verwurzelung, Bauen, Architekturgrenzen
npm run verify:commits  # Regressionstests des Commit-Gates selbst
npm run build           # Production-Build (vite build)
npm run version:check   # Lock vs. VERSION, package.json, package-lock.json
npm run version:sync    # package.json und package-lock aus dem Lock spiegeln
```

Es gibt kein `npm test` und kein Linting-Tool — Gate und `verify` sind die
Qualitätswächter. `npm run verify` ist die eigentliche Abnahmesimulation: sie
spielt den Slice deterministisch mit einer virtuellen Uhr durch und prüft
Onboarding-Zeiten, Abbau-Ergebnis, Verwurzelungs-Phasen und Grid-Ausbau. Seit
dem Bau-System gehört ein vollständiger Durchlauf dazu: `check-colony.mjs` lässt
Extraktor, Schwarmhort und Brutlord bauen, bezahlen und brüten. Sie importiert
die echten Module aus `src/` — neue Domänenlogik ist erst geprüft, wenn ein
`check-*.mjs` unter `scripts/verify/` sie aufruft; Einstiegspunkt ist
`scripts/verify-slice.mjs`.

`.github/workflows/ci.yml` fährt genau diese Befehle in dieser Reihenfolge:
`gate --version`, `gate --tree`, `gate --commits`, `verify:commits`, `verify`,
`build`. Die Basisrevision ermittelt der Workflow selbst in einem
Vorschritt („Basisrevision ermitteln") aus `pull_request.base.sha`, sonst
`github.event.before`, sonst `HEAD^` — lokal musst du `--base=` bzw. die
Range selbst mitgeben. `fetch-depth: 0` ist Pflicht, sonst fehlen dem
Commit-Wächter die Shas.

## Hard Caps (blockieren CI)

Jede Datei unter `src/` und `scripts/`: max. 300 **Codezeilen**, max. 7 Imports,
max. 3 Parameter pro benannter Funktion, max. 30 LOC pro benannter Funktion —
und **max. 5 Kommentarzeilen pro Datei**. Der Check ist eine Textanalyse in
`scripts/lib/source-metrics.mjs`:

- Gemessen wird `.js`, `.jsx`, `.mjs` **und `.css`** — `src/styles/globals.css`
  steht ausdrücklich mit im Cap. Dokumentation (`.md`, `.txt`) ist ausgenommen.
- Für den LOC-Cap zählen nur Codezeilen: Kommentarzeilen und Leerzeilen fallen
  heraus. Der Cap gilt global, auch für CSS.
- Die Dokumentations-Ausnahme ist implizit: `DOCUMENTATION_EXTENSIONS` wird
  nirgends angewandt — `.md` und `.txt` entkommen dem Cap nur, weil
  `collectSourceFiles` sie nicht einsammelt. `Docs/` darf damit beliebig lang sein.
- Kommentare sind auf fünf Zeilen pro Datei begrenzt — wer mehr erklären will,
  schreibt es nach `Docs/` (siehe `Docs/ARCHITEKTUR.md`). Kurze Warum-Sätze im
  Code bleiben erlaubt, ganze Absätze nicht.
- **Imports zählen als Zeilen**, nicht als Symbole: ein mehrzeiliger
  `import { … }`-Block ist eine Zeile, zwei getrennte `import`-Statements sind
  zwei. Anonyme Callbacks zählen nicht als Funktionen.

Konsequenz: neue Logik gehört in eine eigene Datei, nicht in eine bestehende
Komponente. Ein Verstoß wird erst sichtbar, wenn das Gate läuft — `npm run gate`
vor dem Commit.

Aktueller Stand, gemessen mit derselben Regex wie das Gate (Grenze 7 Imports /
300 Codezeilen / 5 Kommentarzeilen / 30 LOC pro Funktion):

- Genau 7 Imports, also am Anschlag: `src/state/game-reducer.js`,
  `src/state/reducers/colony-reducer.js`, `src/state/reducers/mining-reducer.js`,
  `src/state/use-game-engine.js`, `src/ui/GameStage.jsx`,
  `src/world/DungeonWorld.jsx`, `src/world/Dungling.svg.jsx`,
  `src/world/Hive.svg.jsx`, `src/world/world-view.js`, `src/world/TileLayer.jsx`,
  `scripts/verify-slice.mjs`, `scripts/verify/check-next-mine.mjs`,
  `scripts/verify/check-start.mjs`, `scripts/verify/check-rooting.mjs`,
  `scripts/verify/check-deposits.mjs`.
  Ein achter Import fällt dort sofort durch — `game-reducer.js` ist deshalb
  bei sieben geblieben: Bau-Befehle und Arbeitstakt teilen sich den
  `colony-reducer.js`, statt die Kette um einen achten Import zu erweitern.
  `mining-reducer.js` hat die Grenze mit dem Freilegen erreicht: der Vorrats-
  Aufruf kam als zweiter Namen in die bestehende `deposit-state`-Zeile, nicht
  als neue.
- Bei 6 Imports: dreizehn weitere Dateien, darunter alle übrigen Reducer in
  `src/state/reducers/`, `scripts/verify/run-slice.mjs` und
  `scripts/verify/build-run.mjs`.
- Größtes Modul: `src/styles/globals.css` mit 274 von 300 Codezeilen, davor
  `scripts/lib/source-metrics.mjs` (171) und `scripts/verify/build-run.mjs`
  (146). Die Kommentarzeilen sind nicht überall auf den Kopf zurückgeführt:
  über 60 Dateien tragen zwischen zwei und fünf, die meisten davon sind der
  Kopf plus ein bis zwei Warum-Sätze. Der Bau-Durchlauf liegt bewusst in viele
  kleine Phasen zerlegt; die längste davon (`buildRun`) hat 12 Zeilen.
- Längste Funktion: `OnboardingHint()` in `src/ui/OnboardingHint.jsx` und
  `HiveRoots()` in `src/world/hive/HiveRoots.jsx` mit je 29 von 30 LOC. Beide
  können keinen ganzen Absatz mehr aufnehmen; `CharacterGradients()` liegt bei
  28, `chipBlob()` und `main()` bei 27. Der JSX-Block einer Komponente zählt
  vollständig mit — bei langen Panels hilft nur ein Aufteilen in Unterkomponenten
  (`GameHud.jsx` und `BuildingPanel.jsx` sind genau dafür entstanden).

Die Parameter-Grenze zählt Kommas auf **oberster Ebene**: `function f(a, b, c, d)`
fällt durch, `function f({ a, b, c, d })` nicht. Der Ausweg aus der
Drei-Parameter-Grenze ist deshalb ein Objekt-Parameter, kein zusätzlicher
Helfer.

## Versionierung

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel. Nur ändern über:

```sh
npm run version:bump -- patch   # auch minor | major
npm run version:check
```

Direkte Edits an Lock oder Spiegeln fallen im Gate durch. Die `revision` steigt
pro Versionserhöhung um genau 1. `npm run version:sync` spiegelt den Lock in
`VERSION`, `package.json` und `package-lock.json`, ohne weitere Felder des
Locks zu verlieren — der Lock darf also mehr wissen als Version und Revision.

Bleibt die Version stehen, muss auch die `revision` stehen bleiben —
`versionTransitionViolations` prüft beides. Regel- und Doku-Commits brauchen
deshalb keinen Bump, und ihr Roadmap-Eintrag darf trotzdem als erledigt unter
der nächsten Section stehen.

Genau eine Ausnahme von der Monotonie gibt es: eine ausdrückliche Rücknahme
einer Fehlbenennung. Sie steht als `amends` im Lock und nennt die Version, die
damit korrigiert wird (Beispiel: `{ "version": "0.0.1", "revision": 2,
"amends": "0.1.0" }`). `versionTransitionViolations` lässt einen Rückschritt nur
dann durch, wenn `amends` exakt der Basisstand ist; jede andere Abwärtsbewegung
bleibt ein Gate-Fehler.

## Commit-Policy (hart, per Gate erzwungen)

- Betreff max. 72 Zeichen.
- Body **100–1000 Wörter** (ohne das Label) und **jede geänderte Datei muss
  namentlich im Body vorkommen**.
- Letzte nichtleere Body-Zeile: exakt einmal
  `created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.`
- Verboten: `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`, `Generated with …`,
  Footer-Trenner (`---`) und generische `Key: value`-Trailer.
- Die Trailer-Erkennung ist ein Zeilenanfang-Muster: jede Body-Zeile, die mit
  `Wort:` plus Text beginnt, fällt durch — auch `Dateien: …` oder
  `src/x.js: Beschreibung`. Dateien also in Prosa nennen, selbst wenn das den
  Body länger macht.
- Zeilen, die auf `codebuff`, `copilot`, `claude` oder `cursor` enden, gelten als
  Bot-Signatur. Der hier verlangte Footer ist allein das Vannon-Label.
- Vorprüfung ohne Commit: `commitViolations({ sha, message, paths })` aus
  `scripts/lib/commit-rules.mjs` mit `git diff --cached --name-only` als `paths`
  aufrufen. Damit lassen sich Wortzahl, Label und Dateiabdeckung prüfen, bevor
  der Commit existiert — billiger als ein Commit, der am Gate scheitert. `sha`
  wird nur als `scope` durchgereicht, inhaltlich uninteressant.
- Vorprüfung und Commit müssen dieselben Bytes sehen: Message nach
  `/tmp/commit-msg.txt` schreiben, `commitViolations` darauf laufen lassen,
  dann `git commit -F /tmp/commit-msg.txt`.
- **Die Signaturpflicht gilt für Commits von Hand, nicht für den
  Versions-Bot.** `commit.gpgsign = true` mit SSH-Signatur ist die Voreinstellung,
  und `~/.ssh/allowed_signers` kennt genau einen Schlüssel: deinen. Der Workflow
  `.github/workflows/auto-bump.yml` committet als `github-actions[bot]` und ist
  deshalb unsigniert (`git log --show-signature` zeigt `N`). Das bleibt so: Ein
  Bot, der sich als Mensch ausgibt, ist nicht prüfbar, sondern nur behauptet —
  und der persönliche Signaturschlüssel gehört nicht in `GITHUB_TOKEN`. Ein
  automatisches Nachsignieren würde die Aussage wertlos machen. Nachprüfen:
  `git log --show-signature -1` zeigt `G` mit Schlüssel-Kennung für Hand-Commits.

Commit-Nachrichten und Code-Kommentare auf Deutsch, Code-Bezeichner englisch.

## Konventionen

- 2 Leerzeichen, kein Semikolon am Zeilenende, einfache Quotes — folgt dem
  bestehenden Stil; kein Formatter ist konfiguriert.
- Layout: `src/domain/` (Spielwahrheit) → `src/state/` (Reducer, Actions,
  Selektoren) → `src/ui/` (HUD, Menüs) → `src/world/` (SVG-Ebenen). Die
  Schichtkette stimmt, ist aber **Konvention, nicht Gate**:
  `scripts/verify/check-architecture.mjs` prüft genau drei Dinge und keine
  Importrichtung — (1) `src/domain/` zieht weder `react` noch `document`/
  `window`, (2) in ganz `src/` gibt es kein `Math.random(` und kein
  `Date.now(` (Kommente vorher entfernt), (3) `src/domain/` enthält kein
  `<svg>`/`<path>`-Markup. Wer `src/domain/` etwas aus `src/world/` importieren
  lässt, fällt durch keine dieser drei Zeilen.
- Die reale Importmatrix, gemessen über alle Specifier: `domain` importiert
  ausschließlich sich selbst (22 Kanten, 0 aus dem Ordner heraus). `state` und
  `ui` lesen aus `domain`, `world` ebenfalls. Zwei Kanten zeigen entgegen der
  Kette und sind so gewollt: `src/ui/GameStage.jsx:3-4` importiert `world`
  (es rendert die Szene), und `src/world/world-view.js:23` importiert
  `state/selectors.js` (die Kamera liest den Zustand). Es gibt keine einzige
  Kante `world → ui` oder `state → ui`.
- React steht in `src/`: 17 Dateien importieren `react`/`react-dom` — vier
  Hooks in `src/state/` (`use-game-engine`, `use-game-actions`,
  `use-rooting-runner`, `use-schedule-runner`), drei in `src/ui/`
  (`use-stage-scale.js`, `BuildMenu.jsx`, `TileActionMenu.jsx`) und zehn in
  `src/world/`. `src/domain/` und `src/app/` sind frei.
- Ein Reducer pro Verantwortung in `src/state/reducers/`, verbunden in
  `src/state/game-reducer.js` — dort iteriert eine Liste über `DOMAIN_REDUCERS`,
  der erste Reducer, der den Zustand verändert, gewinnt.
- Fakten liegen als eingefrorene Konstanten-Objekte (`TILE_KIND`, `TILE_VISIBILITY`,
  `TILE_USABILITY`, `EARTH_HEALTH`, `DUNGLING_STATE`, `ROOTING_PHASE`, `HARD_CAPS`)
  in `*-config.js` bzw. beim Entity — nie als Magic Strings. `src/` hält sich
  daran; `scripts/verify/check-start.mjs:21` reißt es: dort steht das Literal
  `'VISIBLE'`. Wer `TILE_VISIBILITY` umbenennt, lässt diese eine Prüfung still
  grün werden.
- Kommentare sind auf Deutsch, höchstens fünf Zeilen pro Datei, und erklären
  das *Warum* in einem Satz. Alles Ausführliche gehört nach `Docs/`, vor allem
  `Docs/ARCHITEKTUR.md` — nicht in den Code.
- Deterministisch: sichtbare Geometrie leitet sich aus Koordinaten und Seeds ab,
  nie aus `Math.random()`. Die Seed-Funktion heißt `tileSeed(x, y)` und lebt in
  `src/world/tile-shapes.js` — daneben `makeRng(seed)` als Zufallsstrom darauf.
  Ein exportiertes `seed` gibt es nirgends; wer eines sucht, findet nur den
  Parameter.
- Dauerprozesse gehören in einen eigenen Runner, nicht in den Onboarding-Plan:
  `src/state/use-rooting-runner.js` tickt unabhängig, weil die Timer aus
  `onboarding-schedule.js` bei jedem Phasenwechsel verfallen.
- Deterministische Streuung darf die Domäne nicht aus `src/world/tile-shapes.js`
  holen. Wo sie gebraucht wird (`wobbleAt` in `reveal.js`), steht bewusst eine
  eigene kleine Hash-Funktion — die Schichtgrenze ist wichtiger als
  Wiederverwendung. Zweite eigene Instanz: `deposit-hash.js` streut die
  Vorräte über `Math.imul`, `tileSeed` bleibt unangetastet.
- Ein Vorrat hängt an einem Cluster-Datensatz in `world.deposits`, die Tiles
  tragen nur `depositId`. Pro-Tile-Datensätze wären falsch: der Pool gehört dem
  ganzen Vorrat. Details in `Docs/ARCHITEKTUR.md`.
- **Eine Regel pro Ort, nicht eine Ausnahme und eine Ausnahme.** Der Spawn-Anker
  kommt aus `spawnTile()` in `src/state/selectors.js` — Reducer *und* `work-state`
  lesen ihn. Ein `??`-Fallback an einer Stelle und `parseTileId` an der anderen
  war zwei Regeln für denselben Wert; `parseTileId` ruft `id.split(',')` und
  stürzt auf `null`. Neue Aufrufer nutzen den Selektor.
- **Kein `??`-Fallback auf einer Tabelle, die vollständig sein muss.** Der
  Hinweistext ist total über die 13 Phasen, deshalb `HINTS[state]` ohne `??`:
  ein fehlender Eintrag soll auffallen, nicht still auf "Der Hive wartet."
  zurückfallen. Die Vollständigkeit prüft `checkHintCoverage()` in
  `scripts/verify/check-onboarding.mjs`.
- **Ein Zeitplan wird an einer Stelle entschieden, nicht in jeder Uhr.** Was der
  Intervall-Tick tut, steht in `intervalAction()` in
  `src/domain/onboarding/onboarding-schedule.js`; Browser- und Node-Uhr fragen
  nur noch. Vorher kannte die Onboarding-Uhr den Mining-Zustand (`WORKING`)
  und änderte sich mit ihm.

## Gestalterische Vorgaben

Vom Auftraggeber gesetzt und nicht verhandelbar:

- Nichts darf als Kachel erkennbar sein. Erde und Boden sind eine
  zusammenhängende Masse; Auswahlringe, Effekte und Einladungen folgen der
  Fläche, nie dem Rechteck.
- Der Untergrund bleibt vorerst bei einer Art: heller Stein. Obsidian und Sand
  wurden verworfen; `src/world/floor/substrate.js` hält nur noch Stein-Spuren.
- Die Welt ist bei rund 64 × 64 Feldern gedeckelt, sichtbar bleibt ein
  13 × 13-Fenster, das dem gebauten Raum folgt. Der Rest ist Dunkelheit.
- Die Leiter steht außerhalb des Sichtfelds und wird erst gezeichnet, wenn die
  Kamera sie erreicht.

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
  (`lines`, `failures`) auf Modulebene — alles zählt über den ganzen
  `verify`-Lauf, und `summary()` ist nur einmal aufrufbar. Deshalb liegt die
  Reihenfolge fest in `scripts/verify-slice.mjs`: `checkStart()` läuft vor
  `makeOnboardingRun()`, weil der Start-Zustand der Run-Erzeugung zugrunde liegt.
- `scripts/verify/run-slice.mjs` leitet sein Zielfeld aus
  `ONBOARDING_CONFIG.firstEarthBlock` über `tileId()` ab, es ist kein festes
  Raster verdrahtet. Verschiebt sich der Hive, wandert das Ziel mit — die
  abgeleiteten Erwartungen in den `check-*.mjs` aber nicht automatisch. Genau
  da liegen die harten Zahlen: `check-mining-progress.mjs:12` prüft
  `totalMiningTicks() === 35`, `check-start.mjs:19` prüft „exakt vier
  Hive-Tiles" als Literal statt `HIVE_SIZE`. Wer `miningDurationMs`,
  `earthStateThresholds` oder `HIVE_SIZE` ändert, muss diese Zahlen
  mitziehen — sonst wird `verify` rot und der Grund ist nicht dort zu sehen.
- Hive-Position und Startkoordinaten liegen in zwei Dateien: `HIVE_ORIGIN` in
  `src/domain/world/world-config.js` und `dunglingSpawnTile`/`firstEarthBlock`
  in `src/domain/onboarding/onboarding-config.js`. Wer den Hive verschiebt,
  muss beide mitziehen.
- `soilBlob` zieht mit positivem `jitter` immer nach innen. Überlappung
  zwischen Feldern entsteht nur über `outward`, und ohne die festen Eckpunkte
  schneidet `smoothClosedPath` die Ecken ab: je vier Nachbarn lassen dann ein
  rautenförmiges Loch. Symptom sind dunkle Rauten im regelmäßigen Raster — das
  sieht nach Abstand aus, ist aber fehlende Ecke.
- Die Verwurzelungs-Uhr läuft praktisch immer: `tickRooting` geht alle 100 ms
  über alle 4.096 Kacheln (~41 k Zugriffe/s), und die Uhr schweigt nur, wenn
  nichts wächst oder ruht — bei 64 × 64 nie. Ein Index über die aktiven Felder
  wäre der nächste Schritt, falls es ruckelt.
- Sichtprüfungen laufen über `tools/preview/`, nicht über eine temporäre
  `lab.html`. `node tools/preview/preview.mjs` startet ein sichtbares Chrome
  mit `--remote-debugging-port=9222` und eigenem Profil unter
  `.preview-profile/`, `node tools/preview/daemon.mjs` hängt sich per CDP an
  und injiziert `marker.js` dauerhaft. Im Fenster markiert `m` ein Element,
  `Esc` beendet; jeder Klick vergibt eine ID `m1`, `m2`, … und ein `node
  tools/preview/marks.mjs` liefert genau diese Elemente als JSON mit Selector
  und Rechteck — damit lässt sich im Chat „m2 ist zu blau" sagen und es ist
  eindeutig. Zwei Fallstricke: `Page.addScriptToEvaluateOnNewDocument` gilt nur
  für die offene CDP-Session, ein Kurzskript verliert die Registrierung beim
  Schließen (deshalb der Daemon), und der Marker darf bei `document-start` kein
  DOM anfassen — `document.body` ist dann noch `null`, der Mount hängt am
  `readyState`.
- `dist/` ist Build-Ausgabe und nicht versioniert (`git ls-files dist` ist
  leer) — nicht von Hand editieren. Dasselbe gilt für `dogfood-output/`:
  nicht tracked, aber auch **nicht** in `.gitignore`. `.freebuff/` und
  `.worktrees/` stehen dafür inzwischen drin.
- `.venv/` steht **nicht** in `.gitignore, wird aber von sich selbst ignoriert
  (`.venv/.gitignore` enthält `*`). Deshalb ist es in `git status` unsichtbar
  und frisst trotzdem jede Datei-Zählung: ein naiver `pygount .` zählt 121
  Zeilen `_virtualenv.py` und eine `activate.fish` mit, die zu diesem Projekt
  nichts sagen. Tools, die den Baum ablaufen, brauchen `.venv` im Ausschluss —
  `git status` ist kein Beweis, dass etwas nicht da ist.
- Kein Lint- oder Format-Automat: Keine eslint-/prettier-/biome-Konfiguration,
  nichts davon in `package.json`. Einrückungsfehler bleiben unentdeckt, bis
  jemand die Datei liest.
- `npm run dev` bindet an `127.0.0.1` (`vite.config.js`) — aus einem Container
  oder von außen nicht erreichbar; über die Host-IP gibt `curl` Exit 7. Läuft
  schon ein Dev-Server auf 5173, weicht Vite still auf 5174 aus und loggt das
  als eine Zeile — wer weiter 5173 prüft, testet den alten Prozess. Vor dem
  Neustart `ss -ltnp | grep 517`.
- Die deutschen `rule`-Texte aus `commitViolations` sind die Schnittstelle zu
  `scripts/verify-commit-gate.mjs` — die Tests greifen per `includes()` und
  unterscheiden Großschreibung. Ein umbenannter Regelname macht genau eine
  Zeile rot, ohne auf die Ursache zu zeigen.
- Das Pflicht-Label enthält einen Gedankenstrich (U+2014); ein ASCII-Hyphen
  fällt durch. `git log -1 --format=%B | tail -1` taugt nicht als Prüfung —
  `%B` endet mit Zeilenumbruch, die letzte Zeile ist leer. Erst `messageParts()`
  aus `scripts/lib/commit-rules.mjs` filtert die Leerzeilen weg.
- `TREE_ROOTS` in `scripts/ci-gate.mjs` kennt nur `src` und `scripts`:
  Hilfsskripte im Repo-Root umgehen alle Caps, landen beim Staging aber im
  Commit und müssen dort namentlich im Body stehen. Messskripte gehören nach `/tmp`.
