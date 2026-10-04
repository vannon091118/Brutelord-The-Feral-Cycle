# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Regelwerk — zuerst lesen, keine Kopie anlegen

Die verbindlichen Regeln (drei Wächter: Hard Caps, Versionierung, Commit-Policy)
stehen in **`AGENTS.md`**. `Docs/ARCHITEKTUR.md` trägt die Entscheidungen mit
Begründung, die Importmatrix und die Werkzeuge; `Docs/ROADMAP.md` die Absicht;
`COMMIT_POLICY.md` den Wortlaut der Commit- und Versionsregeln. **Keine der
vier Dateien darf hier nachgeschrieben werden** — eine zweite Kopie des
Regelwerks läuft still auseinander, und die CI prüft nur das Original.

Verbindliche Sprache: Commit-Bodies und Code-Kommentare auf Deutsch,
Code-Bezeichner englisch.

## Lage: was ist was

```
index.html + vite.config.js   Einstieg; Vite bindet auf 127.0.0.1 (Dev-Server)
src/                          das Spiel, in fünf Ebenen (siehe unten)
scripts/                      die Wächter: Gate, Abnahmesimulation, Version
tools/preview/                Browser-Preview-Werkzeug (Supervisor, Marker, Inbox)
Docs/                         ARCHITEKTUR (Warum), ROADMAP (Absicht), CHANGELOG
.github/workflows/            ci.yml (Gate) und auto-bump.yml (Versionsbot)
version.lock.json             die einzige Versionsautorität
```

## Befehle — gibt kein `npm test`, keinen Linter, keinen Formatter

```sh
npm ci                                        # Abhängigkeiten (CI: Node 22, lokal: Node 26)
npm run dev                                   # Vite-Dev-Server auf 127.0.0.1
npm run build                                 # Produktionsbuild

# Die beiden Qualitätswächter — alles, was hier geprüft wird:
npm run gate                                  # alle drei Wächter (Hard Caps, Version, Commits)
npm run gate -- --tree                        # nur Hard Caps
npm run gate -- --commits=<base>..<head>      # Commit-Regeln, explizite Range
npm run gate -- --version --base=<sha>         # Version gegen eine Basisrevision
npm run verify                                # deterministische Slice-Simulation in node
npm run verify:commits                        # Regressionstests des Commit-Gates

# Versionierung — nur über den Versionierer, nie von Hand:
npm run version:bump -- patch                 # auch minor | major
npm run version:check                         # Lock vs. Spiegel konsistent?
```

Zwei Fallen, die nur hier auffallen:
- **Gate und verify lesen Pfade relativ zum CWD** — immer aus dem
  Repo-Wurzelverzeichnis starten.
- **Das Gate ohne neue Commits meldet „keine neuen Commits" und übersieht
  Verstöße.** Lokal deshalb immer mit expliziter `--commits=<base>..<head>`.

## Architektur — die fünf Ebenen und ihre Richtung

Die Schichtkette ist **Konvention, nicht Gate** (das Gate prüft nur drei
Korruptionssignale: kein React/DOM in `src/domain/`, kein `Math.random(`/
`Date.now(` in `src/`, kein SVG-Markup in `src/domain/`). Wer eine Ebene
überspringt, fällt durch keine Prüfung — die Richtung muss gewusst werden:

| Ebene | Was | Regel |
| --- | --- | --- |
| `src/domain/` | Spielwahrheit: Regeln, Entitäten, Zeitpläne | Reines JS, deterministisch, importiert nur sich selbst (54 Kanten, null heraus) |
| `src/state/` | Reducer, Aktionen, Selektoren, die vier Uhren | Der Zustand wird **nur** hier verändert; importiert `domain` + `ui`-freie Hooks |
| `src/ui/` | HUD, Menüs, Labor-Panel | Liest den Zustand, entscheidet nichts; darf `world` importieren (`GameStage`) |
| `src/world/` | SVG-Ebenen: Kacheln, Vorräte, Bauten, Wurzeln, Partikel | Bekommt Geometrie, nie Spielwahrheit; `world-view.js` liest `state/selectors.js` |
| `src/app/` | `App.jsx`: reine Komposition | Reducer aus `state`, Bühne + HUD als Darstellung |

Der Zustandsfluss ist linear: UI-Event → `use-game-actions.js` dispatcht
`ACTION.*` → `game-reducer.js` iteriert eine Liste von Domänen-Reducern
(`hive`, `dungling`, `selection`, `lab`, `world`, `colony`), **der erste, der
den Zustand verändert, gewinnt** → neue `game` an `ui/` und `world/` zurück.

Zwei gewollte Kanten entgegen der Schichtkette: `GameStage.jsx` (ui) rendert
`DungeonWorld` (world), und `world-view.js` (world) liest `selectors.js`
(state). Es gibt **keine** Kante `world → ui` oder `state → ui`.

## Die vier Uhren — wer tickt was

In `src/state/`, alle ohne eigenen Zustand, alle lesen den Zustand:
- `use-schedule-runner.js` — führt den Onboarding-Plan aus; Timer verfallen bei
  jedem Phasenwechsel.
- `use-colony-clock.js` — bündelt `use-rooting-runner.js` (Verwurzelung),
  `use-work-runner.js` (Arbeitstakt) und `use-hive-runner.js` (Hive presst
  Essenz), weil `use-game-engine.js` sonst am Import-Cap steht. Die Hive-Uhr
  läuft auch im Leerlauf weiter — ein Motor mit Idle-Stopp wäre kein Motor.
- `use-rooting-runner.js` tickt über `rootingWorkCount()` — eine Liste aktiver
  Felder, nicht alle 4.096 Kacheln.

## Konventionen, die nicht self-evident sind

- **Hard Caps** (blockieren CI): pro Datei unter `src/`/`scripts/` (`.js`,
  `.jsx`, `.mjs`, `.css`) höchstens 300 Codezeilen, 7 Importzeilen, 3
  Parameter, 30 LOC pro Funktion, 5 Kommentarzeilen. Details +
  Objekt-Parameter-Ausweg in `AGENTS.md`.
- **Fakten sind eingefrorene Konstanten-Objekte** in `*-config.js` beim
  Entity — nie Magic Strings. Die Prüfungen rechnen gegen diese Werte
  (z. B. `JOB_CONFIG.tickMs`), nicht gegen gerundete Zahlen.
- **Determinismus:** jede sichtbare Geometrie leitet sich aus Koordinaten und
  Seeds ab. Drei eigene Hash-Instanzen sind Absicht, keine Dubletten:
  `tileSeed` (`src/world/tile-shapes.js`), `deposit-hash.js` und
  `stone-seed.js` (beide `src/domain/`) — die Schichtgrenze wiegt schwerer
  als Wiederverwendung.
- **Eine Regel pro Ort.** `spawnTile()` in `selectors.js` ist der einzige
  Anker für Spawn; neue Aufrufer nutzen den Selektor, nie einen eigenen.
- **Kein `??`-Fallback auf totalen Tabellen.** `HINTS[state]` ohne `??` —
  ein fehlender Eintrag soll rot werden, nicht still zurückfallen.
- **Reducer pro Verantwortung** unter `src/state/reducers/`; `colony-reducer.js`
  und `world-reducer.js` teilen sich nur wegen des Import-Caps.
- **Stil:** 2 Leerzeichen, kein Semikolon, einfache Quotes — folgt dem
  Bestehenden, kein Formatter.
- **Commit-Policy (Gate-erzwungen):** Betreff ≤ 72 Zeichen, Body 100–1000
  Wörter, jede geänderte Datei namentlich im Body, letzte nichtleere Zeile
  exakt das VANNON-Label, keine Co-Author/Generated-Trailer. Vorprüfung per
  `commitViolations()` aus `scripts/lib/commit-rules.mjs`.

## `verify` — die eigentliche Abnahme

`scripts/verify-slice.mjs` spielt den Slice mit einer virtuellen Uhr durch
und importiert die **echten** Module aus `src/` — nicht Nachbauten.
`scripts/verify/expect.mjs` zählt global über den ganzen Lauf; `summary()` ist
nur einmal aufrufbar, deshalb ist die Reihenfolge in `verify-slice.mjs` fest:
`checkStart()` läuft vor `makeOnboardingRun()`, weil der Start-Zustand der
Run-Erzeugung zugrunde liegt. Neue Domänenlogik ist erst geprüft, wenn eine
`check-*.mjs` sie aufruft.

## Workflow pro Task (nicht verhandelbar)

1. **Roadmap aktualisieren** — `Docs/ROADMAP.md` wandert im selben Commit mit;
   fertiges wird gehäkcht, der Eintrag bleibt stehen (Erledigtes wird nie
   gelöscht).
2. **`npm run gate -- --commits=<base>..<head>`** mit echter Range.
3. **`npm run verify`**, dann **`npm run build`** — ein Fehlpfad fällt nur
   hier auf, nicht im Gate.
4. **Commit** (Policy + Vorprüfung siehe oben), dann **Push auf `main`**.
   Kein PR, kein Branch-Zirkus.

Bleibt die Version stehen, muss auch die `revision` stehen — Regel- und
Doku-Commits brauchen keinen Bump.

## CI

Zwei Workflows in `.github/workflows/`:
- **`ci.yml`** — läuft auf Push/PR: `gate --version`, `gate --tree`,
  `gate --commits`, `verify:commits`, `verify`, `build`.
- **`auto-bump.yml`** — committet als `github-actions[bot]` (unsigned,
  `git log --show-signature` zeigt `N`): bei `src/*`/`scripts/*`-Änderungen
  `version:bump patch`, sonst kein Bump. Hand-Commits zeigen `G`.

## Pitfalls — die, die hier brennen

Vollständige Liste (alle gemessen) in `AGENTS.md` Abschnitt 9. Die drei, die
am häufigsten zuschlagen:
- **Abgeschriebene Zahlen in `check-*.mjs` bleiben grün, während die Regel
  kippt.** Wer eine Config ändert, muss die Literale mitziehen — besser aus
  der Config ableiten.
- **Hive-Position und Startkoordinaten liegen in zwei Dateien**
  (`world-config.js` + `onboarding-config.js`). Wer den Hive verschiebt, muss
  beide mitziehen.
- **`expect.mjs` ist global zustandsbehaftet** — `lines`, `failures` und
  `summary()` zählen über den ganzen Lauf; die Reihenfolge in
  `verify-slice.mjs` ist deshalb fest.

## Browser-Preview (optional)

`tools/preview/` stellt ein sichtbares Chrome-Fenster mit Element-Marker:
`node tools/preview/up.mjs` (Supervisor, startet Dev-Server + Chrome + Daemon),
`node tools/preview/down.mjs` (räumt auf). Im Fenster: `m` markiert, `p`
blendet Panel ein, `Esc` beendet; `node tools/preview/pull.mjs` holt die
Mark-Liste aus der Inbox (`127.0.0.1:9333`) zurück. Details in
`Docs/ARCHITEKTUR.md`, Abschnitt „Werkzeuge".