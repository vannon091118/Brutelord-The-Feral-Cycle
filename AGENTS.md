# AGENTS.md — Dungeon Lord

Vite + React 19 + Tailwind 4. Ein Spiel-Slice: Hive anklicken, Erde abbauen,
Bauten errichten, Essenz sammeln, Steine züchten. Spielwahrheit ist reines JS
unter `src/domain/` — ohne React, DOM, SVG, `Math.random()` und `Date.now()`.
Das Gate erzwingt drei Dinge, und es läuft in CI genauso wie lokal: Hard Caps,
globale Versionierung, Commit-Policy.

Die ausführlichen Regeln, Messzahlen und Begründungen stehen in
`Docs/ARCHITEKTUR.md`. Die Absicht steht in `Docs/ROADMAP.md`. Dieses Dokument
trägt nur, was man vor **jedem** Commit wissen muss.

---

## 1. Befehle

```sh
npm ci                                     # CI pinnt Node 22, lokal läuft Node 26
npm run dev                                # Vite, bindet auf 127.0.0.1
npm run gate                               # alle drei Wächter
npm run gate -- --tree                     # nur Hard Caps
npm run gate -- --commits=<base>..<head>   # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>     # Version gegen eine Basisrevision
npm run verify                             # Abnahmesimulation des Slice in node
npm run verify:commits                     # Regressionstests des Commit-Gates
npm run build                              # Production-Build
npm run version:bump -- patch              # auch minor | major
npm run version:check                      # Lock vs. Spiegel
```

Es gibt **kein `npm test` und keinen Linter**. `gate` und `verify` sind die
Qualitätswächter. `verify` ist die eigentliche Abnahmesimulation: sie spielt
den Slice deterministisch mit einer virtuellen Uhr durch und importiert die
echten Module aus `src/`.

**Gate und verify lesen Pfade relativ zum CWD** — immer aus dem
Repo-Wurzelverzeichnis starten.

---

## 2. Workflow (nicht verhandelbar)

Nach **jedem** abgeschlossenen Task, in dieser Reihenfolge:

1. **Roadmap aktualisieren.** `Docs/ROADMAP.md` ist versionsgebundene
   Pflichtdoku und wandert im selben Commit mit. Fertiges bekommt ein Häkchen,
   der Eintrag bleibt stehen — Erledigtes wird nie gelöscht.
2. **`npm run gate -- --commits=<base>..<head>`** — explizit, mit echter Range.
   Auf `main` ohne neue Commits meldet das Gate „keine neuen Commits" und
   übersieht Regelverstöße. Nach dem Push ist die Pflichtprüfung Formsache.
3. **`npm run verify`**, dann **`npm run build`**. Ein Fehlpfad fällt nur hier
   auf, nicht im Gate.
4. **Commit**, dann **Push auf `main`**. Kein PR, kein Branch-Zirkus.

Bleibt die Version stehen, muss auch die `revision` stehen bleiben. Regel- und
Doku-Commits brauchen deshalb keinen Bump, ihr Roadmap-Eintrag darf trotzdem
als erledigt unter der nächsten Section stehen.

---

## 3. Hard Caps (blockieren CI)

Jede Datei unter `src/` und `scripts/` — `.js`, `.jsx`, `.mjs` **und `.css`**:

| Cap | Wert |
| --- | --- |
| Codezeilen pro Datei | 300 (Kommentar- und Leerzeilen fallen heraus) |
| Importzeilen pro Datei | 7 |
| Parameter pro benannter Funktion | 3 |
| LOC pro benannter Funktion | 30 |
| Kommentarzeilen pro Datei | 5 |

Zwei Details, die man kennen muss:

- **Imports zählen als Zeilen**, nicht als Symbole. Ein mehrzeiliger
  `import { … }`-Block ist eine Zeile; zwei getrennte Statements sind zwei.
- **Die Parameter-Grenze zählt Kommas auf oberster Ebene.** `f(a, b, c, d)`
  fällt durch, `f({ a, b, c, d })` nicht. Der Ausweg ist ein Objekt-Parameter.

Wer mehr erklären will, schreibt es nach `Docs/ARCHITEKTUR.md`. Fünf Zeilen
bedeuten keine Zensur, sondern einen Indikator: Wer für drei Datenbauten
fünfzehn Kommentarzeilen braucht, hat zu viel Logik in eine Datei gelegt.

---

## 4. Commit-Policy (hart, per Gate erzwungen)

- Betreff max. 72 Zeichen.
- Body **100–1000 Wörter**, ohne das Label.
- **Jede geänderte Datei muss namentlich im Body vorkommen** — vollständiger
  Pfad, nicht der Ordnername. `src/x.js` zählt, `src/` nicht.
- Letzte nichtleere Body-Zeile, exakt einmal:
  `created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.`
- Verboten: `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`, `Generated with …`,
  Footer-Trenner (`---`) und generische `Key: value`-Trailer. Dateien also in
  Prosa nennen, selbst wenn das den Body länger macht.
- Zeilen, die auf `codebuff`, `copilot`, `claude` oder `cursor` enden, gelten als
  Bot-Signatur.

**Vorprüfung ohne Commit** — billiger als ein Commit, der am Gate scheitert.
`commitViolations({ sha, message, paths })` aus `scripts/lib/commit-rules.mjs`
mit `git diff --cached --name-only` als `paths`. Message nach
`/tmp/commit-msg.txt` schreiben, darauf prüfen, dann
`git commit -F /tmp/commit-msg.txt` — Vorprüfung und Commit müssen dieselben
Bytes sehen.

**Die Signaturpflicht gilt für Hand-Commits, nicht für den Versions-Bot.**
`.github/workflows/auto-bump.yml` committet als `github-actions[bot]` und ist
deshalb unsigniert; `git log --show-signature -1` zeigt `N`. Das bleibt so: Ein
Bot, der sich als Mensch ausgibt, ist nicht prüfbar, sondern nur behauptet — und
der persönliche Signaturschlüssel gehört nicht in `GITHUB_TOKEN`. Hand-Commits
zeigen `G`.

**Ausgenommen von der Signatur ist der Bot nicht von der Commit-Policy.** Er
schreibt inzwischen regelkonform: Label in einer eigenen Zeile, die vier
Spiegeldateien namentlich, genug Wörter. `scripts/verify/check-workflow.mjs`
prüft das bei jedem `npm run verify`. Der Grund, warum das überhaupt auffiel:
Bot-Commits lösen mit `GITHUB_TOKEN` keine CI aus, ein Verstoß bleibt also
unentdeckt, bis jemand die Range über einen Bot-Commit zieht.

---

## 5. Versionierung

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel und werden nur über `npm run version:bump`
geändert. Die `revision` steigt pro Versionserhöhung um genau 1.

Eine einzige Ausnahme von der Monotonie gibt es: eine ausdrückliche Rücknahme
einer Fehlbenennung, als `amends` im Lock. `versionTransitionViolations` lässt
einen Rückschritt nur durch, wenn `amends` exakt der Basisstand ist.

---

## 6. Lesereihenfolge

Wer den Bau verstehen will, liest in dieser Reihenfolge — jede Ebene setzt die
vorige voraus und ist ohne sie nicht sinnvoll:

1. `Docs/ARCHITEKTUR.md` — die Entscheidungen und ihre Warum-Begründung.
2. `src/domain/` — die Spielwahrheit. Hier entstehen Regeln des Spiels, nicht
   Regeln des Stils.
3. `src/state/` — Reducer, Aktionen, Selektoren. Der Zustand wird nur hier
   verändert.
4. `src/ui/` — HUD und Menüs. Liest, entscheidet nichts.
5. `src/world/` — SVG-Ebenen. Bekommt Geometrie, keine Spielwahrheit.

Für die Prüfungen: `scripts/verify-slice.mjs` ist der Einstiegspunkt,
`scripts/verify/expect.mjs` das Gerüst.

---

## 7. Konventionen

- 2 Leerzeichen, kein Semikolon am Zeilenende, einfache Quotes — folgt dem
  bestehenden Stil; kein Formatter ist konfiguriert.
- Commit-Bodies und Code-Kommentare auf Deutsch, Code-Bezeichner englisch.
- Fakten liegen als eingefrorene Konstanten-Objekte (`TILE_KIND`,
  `STONE_RARITY`, `HARD_CAPS`, …) in `*-config.js` beim Entity — nie als
  Magic Strings. `check-start.mjs:21` reißt das: dort steht das Literal
  `'VISIBLE'`. Wer eine Konstante umbenennt, lässt diese eine Prüfung still
  grün werden.
- **Eine Regel pro Ort, nicht eine Ausnahme und eine Ausnahme.** Der Spawn-Anker
  kommt aus `spawnTile()` in `src/state/selectors.js`; Reducer *und* Work-State
  lesen ihn. Neue Aufrufer nutzen den Selektor.
- **Kein `??`-Fallback auf einer Tabelle, die vollständig sein muss.** Die
  Hinweistexte sind total über die 13 Onboarding-Phasen, deshalb `HINTS[state]`
  ohne `??` — ein fehlender Eintrag soll auffallen, nicht still zurückfallen.
- **Ein Zeitplan wird an einer Stelle entschieden, nicht in jeder Uhr.** Was ein
  Takt tut, steht in der Domäne; Browser- und Node-Uhr fragen nur noch.
- Deterministisch: sichtbare Geometrie leitet sich aus Koordinaten und Seeds ab,
  nie aus `Math.random()`. Jede eigene Domänen-Instanz (`tileSeed`,
  `deposit-hash`, `stone-seed`) ist Absicht — die Schichtgrenze wiegt schwerer
  als Wiederverwendung.
- Ein Reducer pro Verantwortung unter `src/state/reducers/`, verbunden in
  `game-reducer.js`: dort iteriert eine Liste über die Reducer, der erste, der
  den Zustand verändert, gewinnt. Am Import-Cap teilen sich Bau-Befehle und
  Arbeitstakt die `colony-reducer.js`.
- Dauerprozesse gehören in einen eigenen Runner, nicht in den Onboarding-Plan:
  die Timer aus `onboarding-schedule.js` verfallen bei jedem Phasenwechsel.

Die reale Importmatrix, die Schichtkette und die vollständigen Konfigurationswerte
stehen in `Docs/ARCHITEKTUR.md`. Die Kette ist **Konvention, nicht Gate**:
`check-architecture.mjs` prüft genau drei Dinge — kein React und kein DOM in
`src/domain/`, kein `Math.random(` und kein `Date.now(` in `src/`, kein
SVG-Markup in `src/domain/`. Die Importrichtung prüft er nicht.

---

## 8. Gestalterische Vorgaben

Vom Auftraggeber gesetzt und nicht verhandelbar:

- Nichts darf als Kachel erkennbar sein. Erde und Boden sind eine
  zusammenhängende Masse; Auswahlringe und Effekte folgen der Fläche, nie dem
  Rechteck.
- Der Untergrund bleibt bei einer Art: heller Stein. Obsidian und Sand wurden
  verworfen.
- Die Welt ist auf 64 × 64 Felder gedeckelt, sichtbar bleibt ein 13 × 13-Fenster,
  das dem gebauten Raum folgt. Der Rest ist Dunkelheit.
- Die Leiter steht außerhalb des Sichtfelds und wird erst gezeichnet, wenn die
  Kamera sie erreicht.

---

## 9. Fallen (alle gemessen, nicht geraten)

- **`npm run gate` prüft Commits nur gegen eine Basisrevision.** Auf `main`
  ohne neue Commits meldet es „keine neuen Commits" und übersieht damit
  Regelverstöße. Der eigentliche Test ist der PR-Check; lokal immer mit
  expliziter `--commits=<base>..<head>`.
- **`TREE_ROOTS` in `scripts/ci-gate.mjs` kennt nur `src` und `scripts`.**
  Hilfsskripte im Repo-Root umgehen alle Caps, landen aber beim Staging im
  Commit und müssen dort namentlich im Body stehen. Messskripte gehören nach
  `/tmp`.
- **Abgeschriebene Zahlen in Prüfungen bleiben grün, während die Regel kippt.**
  Wer eine Config ändert, muss die Literale in den `check-*.mjs` mitziehen —
  besser ist es, sie aus der Config abzuleiten. Beispiel: `check-build.mjs` trug
  drei Erwartungen über einen Startvorrat, der sich änderte.
- **`scripts/verify/expect.mjs` ist global zustandsbehaftet.** `lines` und
  `failures` stehen auf Modulebene, alles zählt über den ganzen Lauf, und
  `summary()` ist nur einmal aufrufbar. Deshalb liegt die Reihenfolge fest in
  `verify-slice.mjs`: `checkStart()` läuft vor `makeOnboardingRun()`, weil der
  Start-Zustand der Run-Erzeugung zugrunde liegt.
- **Hive-Position und Startkoordinaten liegen in zwei Dateien**: `HIVE_ORIGIN`
  in `src/domain/world/world-config.js` und `dunglingSpawnTile` /
  `firstEarthBlock` in `src/domain/onboarding/onboarding-config.js`. Wer den
  Hive verschiebt, muss beide mitziehen.
- **`run-slice.mjs` leitet sein Zielfeld aus `firstEarthBlock` ab**, es ist kein
  festes Raster verdrahtet. Verschiebt sich der Hive, wandert das Ziel mit —
  die abgeleiteten Erwartungen in den `check-*.mjs` aber nicht automatisch.
  `check-start.mjs` liest die erwartete Hive-Fläche aus `world.hiveSize`, also
  aus `HIVE_SIZE`. `firstEarthBlock` und die Thresholds tragen in den
  `check-*.mjs` aber weiterhin Literale — wer sie ändert, muss die mitziehen.
- **`soilBlob` zieht mit positivem `jitter` immer nach innen.** Überlappung
  entsteht nur über `outward`, und ohne die festen Eckpunkte schneidet
  `smoothClosedPath` die Ecken ab. Symptom sind dunkle Rauten im Raster — das
  sieht nach Abstand aus, ist aber eine fehlende Ecke.
- **Das `transform`-Attribut einer SVG-Form wird von der CSS-`transform`-
  Eigenschaft der Animation überschrieben.** Platzierung gehört deshalb in eine
  umschließende Gruppe.
- **`.venv/` steht nicht in `.gitignore`, wird aber von sich selbst ignoriert**
  (`.venv/.gitignore` enthält `*`). Es ist in `git status` unsichtbar und frisst
  trotzdem jede Datei-Zählung. `git status` ist kein Beweis, dass etwas nicht da
  ist.
- **`dist/` ist Build-Ausgabe und nicht versioniert** — nicht von Hand editieren.
- **Kein Lint- oder Format-Automat.** Nichts davon in `package.json`.
  Einrückungsfehler bleiben unentdeckt, bis jemand die Datei liest.
- **`npm run dev` bindet an `127.0.0.1`** — aus einem Container nicht erreichbar.
  Läuft schon ein Server auf 5173, weicht Vite still auf 5174 aus. Vor dem
  Neustart `ss -ltnp | grep 517`.
- **Der Dev-Server muss von der Shell losgelöst starten.** `nohup … &` wird mit
  der Shell wieder abgeräumt. Bewährt:
  `python3 -c "subprocess.Popen([…], start_new_session=True)"` mit Log in
  `/tmp/vite-dev.log`. Der Log ist keine Verlässlichkeit: Vite meldet
  `ready in ~1000 ms`, der Port antwortet erst nach etwa 4 s. Ein `curl`
  dazwischen liefert `000` — das ist die Lücke zwischen „gebunden" und
  „liefert".
- **Die deutschen `rule`-Texte aus `commitViolations` sind die Schnittstelle zu
  `verify-commit-gate.mjs`** — die Tests greifen per `includes()` und
  unterscheiden Großschreibung. Ein umbenannter Regelname macht genau eine Zeile
  rot, ohne auf die Ursache zu zeigen.
- **`git log -1 --format=%B | tail -1` taugt nicht als Label-Prüfung** — `%B`
  endet mit Zeilenumbruch, die letzte Zeile ist leer. Erst `messageParts()` aus
  `scripts/lib/commit-rules.mjs` filtert die Leerzeilen weg.

Details zu jedem dieser Punkte, die Preview-Werkzeuge unter `tools/preview/`
und die vollständige Importmatrix stehen in `Docs/ARCHITEKTUR.md`.