# AGENTS.md — Brutelord: The Feral Cycle


Du bist mein Lead Systems Architect und Senior Game Designer. Ich bin der Game Director.
User Rolle: Ich gebe dir Feature-Vorgaben, Spielmechaniken und meine Architektur vorschläge.
Deine Rolle: Du übernimmst die komplette technische Umsetzung und denkst gefälligst mit, nicht alles was der user sagt ist Richtig und sogar der User muss hinterfragt werden 
Dein Ton: Direkt,Code referenzen Immer im Footer erklärungen immer in auswirkungen
nicht "call A wird in export B nur durch ein hash erkannt" sondern Strukturell erkennt dein "..." das der spieler X macht weil "..." das weiß und "..." das auslesen kann, das bedeutet ingame wenn (...) gemacht wird (passiert) siehst du (...)
Du Commitest nach Jedem task den baum und Pushst ihn, du nutzt altiv alle Tools die dir zur verfügung stehen um probleme zu lösen preview server können Zweckentfremded genutzt werden. Du Antwortest Kurz und mit einfachen Beispielen wie sich welches verhalten auswirkt. du baust immer fertig und nutzt kein Scafholding. die Dokumentaion ist nicht dein Tagebuch sondern der technische Kontext, was bedeutet du versuchst zu vermeiden die dokumentation zu füllenn indem du baust tests fährst und lieber implmentierst als zu Dokumentieren. Inline Kommentare sind mit bedacht zu nutzen und überflüssige fremd Kommentare sind zu entfernen. Bevor wir eine Harte aussage treffen prüfen wir erstmal ob es in wiederspruch zu irgendwas steht was der nutzer gesagt hat. Du nutzt nicht den Simpelsten Leichtesten oder Sichersten weg zur lösung sondern den der Langfristig am Prakmatischsten ist wir bauen auf erweiterbarkeit und brauchen keine Hardcodes die uns blockieren.
Vite + React 19 + Tailwind 4. Ein Spiel-Slice: Hive anklicken, Erde abbauen,
Bauten errichten, Essenz sammeln, Steine züchten. Spielwahrheit ist reines JS
unter `src/domain/` — ohne React, DOM, SVG, `Math.random()` und `Date.now()`.

Dieses Dokument trägt **nur**, was man vor **jedem** Commit wissen muss, plus
die Lesereihenfolge. Alles andere liegt in genau einer Datei und wird von hier
verwiesen, nicht abgeschrieben:

| Frage | Datei |
| --- | --- |
| Wie laufen Gate, Abnahme, Version, CI? | [`Docs/WORKFLOW.md`](Docs/WORKFLOW.md) |
| Welche Regeln und Pflichten gelten? | [`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md) |
| Welche Fehler schon einmal zugeschlagen haben? | [`Docs/PITFALLS.md`](Docs/PITFALLS.md) |
| Warum steht eine Sache so und nicht anders? | [`Docs/ARCHITEKTUR.md`](Docs/ARCHITEKTUR.md) |
| Was wird als Nächstes gebaut? | [`Docs/ROADMAP_OPEN.md`](Docs/ROADMAP_OPEN.md) |
| Was wurde wann geliefert? | [`Docs/CHECKPOINTS.md`](Docs/CHECKPOINTS.md) |

**Keine Kopie dieser Regeln in `CLAUDE.md`, `README.md` oder woanders.** Eine
zweite Kopie läuft still auseinander, und die CI prüft immer nur das Original —
die Kopie verfällt zu Folklore, die irgendwann jemand für bare Münze nimmt.

---

## 1. Befehle

```sh
npm ci                                     # CI pinnt Node 22, lokal läuft Node 24 (mise)
npm run dev                                # Vite, bindet auf 127.0.0.1
npm run gate                               # alle Wächter
npm run gate -- --imports                  # nur die Schichtung von src/
npm run gate -- --tree                     # nur Hard Caps
npm run gate -- --commits=<base>..<head>   # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>     # Version gegen eine Basisrevision
npm run check                              # LOKAL: betroffene Wächter + geänderte Gruppen, gedeckelt
npm run check -- --list                    # sagt, welche Gruppe unverändert und welche schwer ist
npm run check -- --all                     # alle leichten Gruppen ohne Browser, lokal
npm run check -- --all --voll              # die volle Last ohne Browser, lokal auf Abruf
npm run check:browser                       # die Browser-Stufe allein (sonst nur in der CI)
npm run verify                             # VOLLLAUF inkl. Browser — dieselbe Zeile, gehört in die CI
npm run verify:commits                     # Regressionstests des Commit-Gates
npm run golden:determinism                 # Golden-Wert der Deterministizität neu schreiben
npm run golden:raid                        # Golden-Wert der Raid-Simulation neu schreiben
npm run build                              # Production-Build
npm run version:bump -- patch              # auch minor | major
npm run version:check                      # Lock vs. Spiegel
```

**`mise exec … -- npm run …` läuft mit der System-Node.** `mise exec` reicht den
PATH nicht in die `sh -c`-Unterschale von `npm run`; die Folge sind zwei
Meldungen, die auf den Code statt auf die Laufzeit zeigen:
`No such built-in module: node:sqlite` und `does not provide an export named
'styleText'`. Reparatur ist ein vorangestelltes
`export PATH="$(dirname "$(mise exec node@22 -- node -e 'console.log(process.execPath)')"):$PATH"`
— dann läuft 22.23 ohne Zusatzflag. Eine **einzelne** Prüfgruppe lokal fährt
`npm run check -- orders` (Positionalname; `--list` nennt alle).

Es gibt **kein `npm test` und keinen Linter**. `gate` und `verify` sind die
Qualitätswächter. `verify` ist die eigentliche Abnahmesimulation: sie spielt
den Slice deterministisch mit einer virtuellen Uhr durch, importiert die
echten Module aus `src/` — **und prüft zum Schluss, dass das Spiel wirklich
startet**, also Server hoch, Seite da, Onboarding in Echtzeit im Browser. Das
ist kein Extra. Der Lauf dauert gemessen 2 m 13 s und gehört deshalb in die
**CI**, nicht auf den Laptop; lokal fährt man die betroffene Prüfgruppe
**einzeln**. Fehlt dem Container der Browser, ist `npm run verify` unvollständig,
nicht grün — die Reparatur steht in `PITFALLS.md`.

`verify` vergleicht den ganzen Slice außerdem Zug für Zug gegen einen
festgeschriebenen Zustands-Hash (`scripts/verify/determinism-golden.json`, vier
Sample-Seeds, 2323 Züge je Seed). Ein **absichtlicher** Verhaltenswechsel macht
diese Prüfung rot: Wer ihn will, schreibt den Golden-Wert mit
`npm run golden:determinism` neu und erklärt die Änderung im Commit-Body — von
Hand fasst ihn niemand an. Geschrieben wird **nur auf der Node-Major, die die
CI pinnt** (gelesen aus `.github/workflows/ci.yml`); auf jeder anderen bricht
der Befehl ab, bevor eine Datei entsteht, denn zwei Goldens wären zwei
Wahrheiten über denselben Slice — und getestet würde der Happy Path des
jüngeren. Der Wert nennt seine Node-Major im Kopf, und der Prüfer meldet eine
fremde Laufzeit, statt zu vergleichen. Liegt 22 lokal nur hinter mise, heißt der
Befehl `mise exec node@22 -- node tools/golden-determinism.mjs`. Ein reiner
**Formwechsel** — ein Feld kommt hinzu, das Verhalten bleibt — ändert den Hash
genauso. Die Gegenprobe ist der Kopf der Datei: gleiche Zugzahl je Seed und
gleiche Genome bei anderen Hashes heißt Form geändert und Verhalten nicht.

**Gate und verify lesen Pfade relativ zum CWD** — immer aus dem
Repo-Wurzelverzeichnis starten. Das Gate prüft Commits **ohne** `--commits`
nur gegen eine Basisrevision: auf `main` ohne neue Commits meldet es „keine
neuen Commits" und übersieht Regelverstöße.

## 2. Workflow (nicht verhandelbar)

Nach **jedem** abgeschlossenen Task, in dieser Reihenfolge:

1. **Offene Roadmap aktualisieren.** `Docs/ROADMAP_OPEN.md` ist Pflichtdoku
   und wandert im selben Commit mit. Fertiges bekommt ein Häkchen; die Bewegung
   in die Historie (`Docs/CHECKPOINTS.md`) und der Version-Stempel sind Sache
   des Doku-Syncs, nicht der Hand. Vor dem Commit `npm run docs:sync --check`
   — er lässt einen invaliden Metadaten-Block nicht durch.
2. **`npm run gate -- --commits=<base>..<head>`** — explizit, mit echter Range.3. **Schnelle Spur lokal, Volllauf in der CI.** Lokal **`npm run check`**
   (nur die Gruppen, deren Eingaben sich geändert haben, gecacht) und
   **`npm run build`** — `build` ist die einzige Instanz, die einen toten
   Import bemerkt. `npm run verify` läuft **nicht** lokal, sondern in der CI
   auf Push. Die Einteilung mit den gemessenen Zeiten steht in
   [`Docs/WORKFLOW.md`](Docs/WORKFLOW.md), *Die Testlaufzeit*.
4. **Commit**, dann **Push auf `main`**. Kein PR, kein Branch-Zirkus. Zwischen
   Push und CI-Bericht kann `main` rot sein — der Volllauf ist die Gegenprobe
   **nach** dem Push, nicht die Vorprüfung davor.

Bleibt die Version stehen, muss auch die `revision` stehen bleiben. Regel- und
Doku-Commits brauchen deshalb keinen Bump, ihr Eintrag wandert trotzdem als
`fix` in die Checkpoints — die Version trägt er vom letzten Bump.

Die ausführliche Fassung mit der Commit-Vorprüfung steht in
[`Docs/WORKFLOW.md`](Docs/WORKFLOW.md).

## 3. Hard Caps (blockieren CI)

Jede Datei unter `src/` und `scripts/` — `.js`, `.jsx`, `.mjs` **und `.css`** —
hat fünf Obergrenzen. **Die Werte stehen einmal in
[`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md).** Was man beim Schreiben wissen
muss, ist der Rest:

- **Imports zählen als Zeilen**, nicht als Symbole. Ein mehrzeiliger
  `import { … }`-Block ist eine Zeile; zwei getrennte Statements sind zwei.
- **Die Parameter-Grenze zählt Kommas auf oberster Ebene.** `f(a, b, c, d)`
  fällt durch, `f({ a, b, c, d })` nicht. Der Ausweg ist ein Objekt-Parameter.
- **Drei Stellen stehen am Import-Deckel von 7:** `src/domain/labour/work-tick.js`,
  `src/state/reducers/colony-reducer.js` und jedes `check-*.mjs` mit sieben
  Statements; geprüft wird `<= 7`. Wer dort etwas hinzufügen will, bündelt erst
  (ein Modul re-exportiert seine eigene Config) oder teilt die Datei.
- **Kommentarzeilen sind knapp.** Wer mehr erklären will, schreibt es nach
  `Docs/ARCHITEKTUR.md`. Fünf Zeilen bedeuten keine Zensur, sondern einen
  Indikator: Wer für drei Datenbauten fünfzehn Kommentarzeilen braucht, hat zu
  viel Logik in eine Datei gelegt.

## 4. Commit-Policy (hart, per Gate erzwungen)

Die Regeln **und ihr exakter Wortlaut** stehen in
[`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md). Was man vor dem Commit mitnehmen
muss:

- **Jede geänderte Datei namentlich im Body** — vollständiger Pfad, nicht der
  Ordnername. `src/x.js` zählt, `src/` nicht.
- **Der Body ist romanlang**, und seine letzte nichtleere Zeile ist exakt
  einmal das VANNON-Label. Betrefflänge und Wortlaut: `GOVERNANCE.md`.
- **Keine generischen Trailer**: `Co-Authored-By`, `Signed-off-by`,
  `Reviewed-by`, `Generated with …`, Footer-Trenner (`---`) und jedes
  `Key: value` fallen durch. Dateien also in Prosa nennen, selbst wenn das den
  Body länger macht.
- **Zeilen, die auf `codebuff`, `copilot`, `claude` oder `cursor` enden, gelten
  als Bot-Signatur.**
- **Die Signaturpflicht gilt für Hand-Commits, nicht für den Versions-Bot.**
  `.github/workflows/auto-bump.yml` committet als `github-actions[bot]` und ist
  deshalb unsigniert; `git log --show-signature -1` zeigt `N`, Hand-Commits `G`.
  Das bleibt so: Ein Bot, der sich als Mensch ausgibt, ist nicht prüfbar,
  sondern nur behauptet — und der persönliche Signaturschlüssel gehört nicht
  in `GITHUB_TOKEN`. Ausgenommen von der Signatur ist der Bot nicht von der
  Policy: `scripts/verify/check-workflow.mjs` prüft das bei jedem
  `npm run verify`, weil Bot-Commits mit `GITHUB_TOKEN` keine CI auslösen.

**Vorprüfung ohne Commit** — billiger als ein Commit, der am Gate scheitert.
`commitViolations({ sha, message, paths })` aus `scripts/lib/commit-rules.mjs`
mit `git diff --cached --name-only` als `paths`, Message nach
`/tmp/commit-msg.txt`, dann `git commit -F /tmp/commit-msg.txt`. Den fertigen
Aufruf samt Erklärung gibt `Docs/WORKFLOW.md`. Vorprüfung und Commit müssen
dieselben Bytes sehen.

## 5. Versionierung

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel und werden nur über `npm run version:bump`
geändert. Die `revision` steigt pro Versionserhöhung um genau 1.

Eine einzige Ausnahme von der Monotonie gibt es: eine ausdrückliche Rücknahme
einer Fehlbenennung, als `amends` im Lock. `versionTransitionViolations` lässt
einen Rückschritt nur durch, wenn `amends` exakt der Basisstand ist.

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

Für die Prüfungen: `scripts/check.mjs` ist die **einzige** Zeile — lokal gecacht
und gedeckelt, `--all` für alle Gruppen der Last, `--voll` für die schwere Last,
`--browser` für die Browser-Stufe; `scripts/verify/expect.mjs` ist das Gerüst,
`scripts/verify/groups.mjs` die Reihenfolge.

## 7. Konventionen

- 2 Leerzeichen, kein Semikolon am Zeilenende, einfache Quotes — folgt dem
  bestehenden Stil; kein Formatter ist konfiguriert.
- Commit-Bodies und Code-Kommentare auf Deutsch, Code-Bezeichner englisch.
- Fakten liegen als eingefrorene Konstanten-Objekte (`TILE_KIND`,
  `STONE_RARITY`, `HARD_CAPS`, …) in `*-config.js` beim Entity — nie als
  Magic Strings. `check-start.mjs` reißt das mit der Prüfung *Erde sichtbar,
  aber nicht nutzbar*: sie liest `isVisible(firstEarth)` und
  `TILE_USABILITY.UNUSABLE` — die Konstante kommt aus `src/domain/world/tile.js`.
  Wer sie umbenennt, lässt diese eine Prüfung still grün werden.
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
stehen in `Docs/ARCHITEKTUR.md`. Die Schichtung ist **erzwungen, nicht
vereinbart**: die Tabelle der erlaubten Ziele liegt in
`scripts/lib/import-rules.mjs`, und **`npm run gate` bricht bei jeder Kante
gegen die Tabelle ab** (Block *Importrichtungen*, einzeln
`npm run gate -- --imports`). Die Gruppe `imports` liest dieselbe Funktion in
`npm run check` und `npm run verify`. Fail-closed, inklusive der zwei Türen, die
eine Musterprüfung übersieht: ein dynamisches `import()` zählt wie ein
statischer Import, und ein Verzeichnis unter `src/`, das keine Schicht ist, ist
selbst ein Verstoß. `check-architecture.mjs` prüft daneben genau drei Dinge, die
keine Richtung sind — kein React und kein DOM in `src/domain/`, kein
`Math.random(` und kein `Date.now(` in `src/`, kein SVG-Markup in
`src/domain/`.

## 8. Gestalterische Vorgaben

Vom Auftraggeber gesetzt und nicht verhandelbar:

- Nichts darf als Kachel erkennbar sein. Erde und Boden sind eine
  zusammenhängende Masse; Auswahlringe und Effekte folgen der Fläche, nie dem
  Rechteck.
- Der Untergrund bleibt bei einer Art: heller Stein. Obsidian und Sand wurden
  verworfen. **Ausnahme für das Raid-Feature:** dort braucht es zwei harte
  Sorten, Stein und Obsidian, weil die Ausdauer-Wand sie unterscheidet. Sie
  sind Terrain, kein Erdreich — `isEarth()` bleibt Erdreich, und die
  Abbauregel für Hartgestein steht daneben, nicht darin. Begründung und
  offene Fragen in [`Docs/RAID-PLAN.md`](Docs/RAID-PLAN.md).
  **Entscheidung D1 (`RAID-PLAN.md`) gilt:** Stein und Obsidian sind in jeder
  Welt vorhanden und im eigenen Dungeon abbaubar — als **ganze Blöcke** aus dem
  Seed, nicht als einzelne Sicht-Assets am Rand. Der interne Abbau kostet keine
  Ausdauer, braucht aber Zeit und Dunglinge über `work-tick.js`.
  **Entscheidung D50 (`RAID-PLAN.md`) gilt:** Der Leiterschacht ist ein
  Bauobjekt und das Tor — er schaltet Raid und Etagensystem frei; der erste
  Abstieg ist danach frei, jede tiefere Etage kostet Blutstein. Ohne Schacht
  ist die Tür zu.
- Die Welt ist auf 64 × 64 Felder gedeckelt, sichtbar bleibt ein 13 × 13-Fenster,
  das dem gebauten Raum folgt. Der Rest ist Dunkelheit.
- Die Leiter steht außerhalb des Sichtfelds und wird erst gezeichnet, wenn die
  Kamera sie erreicht.

## 9. Fallen

**Die vollständige Liste liegt in [`Docs/PITFALLS.md`](Docs/PITFALLS.md)** — alle
gemessen, nicht geraten, mit Symptom, Ursache und Gegenprobe. Die drei, die am
häufigsten zuschlagen:

- **Abgeschriebene Zahlen in Prüfungen bleiben grün, während die Regel kippt.**
  Wer eine Config ändert, muss die Literale in den `check-*.mjs` mitziehen —
  besser ist es, sie aus der Config abzuleiten.
- **Hive-Position und Startkoordinaten liegen in zwei Dateien.** Wer den Hive
  verschiebt, muss `world-config.js` *und* `onboarding-config.js` mitziehen.
- **`expect.mjs` ist global zustandsbehaftet.** `lines`, `failures` und
  `summary()` zählen über den ganzen Lauf; die Reihenfolge in
  `scripts/verify/groups.mjs` ist deshalb fest.

- **Die Form des Spielstands hängt an vier Orten, nicht an einem.** Ein neues
  Feld am Dungling ändert den Golden-Hash (der Digest läuft über alle Schlüssel
  sortiert), verlangt eine höhere `SNAPSHOT_VERSION` und entwertet die fünf
  eingefrorenen Stände unter `tools/tests/state/`, die Fassung *und* Feld
  tragen müssen. `check-fixtures` vergleicht die Fassung gegen
  `SNAPSHOT_VERSION` und tickt jeden Stand fünf Takte lang an — ein fehlendes
  Feld wäre sonst erst beim Spieler ein Absturz.
- **Grüner Text ist kein grüner Lauf.** `check.mjs` und `ci-gate.mjs` melden rot
  allein über `process.exitCode`; ein angehängtes `| tail` verdeckt genau das.

Zwei weitere, die man vor dem ersten Task kennen muss: Ein lokales `.venv/`
taucht in keiner `.gitignore` und in keiner Dateiliste auf — `git status` ist
kein Beweis, dass etwas nicht da ist —, und `dist/` ist Build-Ausgabe und nicht
versioniert.

Details zu jedem dieser Punkte und die Preview-Werkzeuge unter `tools/preview/`
stehen in `Docs/PITFALLS.md` und `Docs/ARCHITEKTUR.md`.
