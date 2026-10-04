# Pitfalls

Alles hier ist **gemessen**, nicht geraten. Jeder Eintrag hat dieselbe Form:
Symptom, Ursache, Gegenprobe. Wer einen neuen Fund hat, trägt ihn hier ein und
nicht in den Commit-Body — denn die Body werden nicht wiedergefunden, diese
Datei schon.

Die Regeln selbst stehen in [`GOVERNANCE.md`](GOVERNANCE.md), der Ablauf in
[`WORKFLOW.md`](WORKFLOW.md).

---

## Das Gate

### Das Gate prüft Commits nur gegen eine Basisrevision

`npm run gate` **ohne** `--commits=<base>..<head>` nimmt die Basis aus der
Umgebung. Auf `main` ohne neue Commits meldet es „keine neuen Commits" und
übersieht damit Regelverstöße komplett.

> **Gegenprobe:** Auf `main` ohne Argumente laufen lassen. „Keine neuen Commits"
> ist kein grüner Lauf, das ist ein Lauf, der nichts geprüft hat.

**Was zu tun ist:** lokal immer mit expliziter Range. Der eigentliche Test ist
der PR-Check in der CI.

### `TREE_ROOTS` kennt nur `src` und `scripts`

Die Hard Caps gelten nur für diese beiden Ordner. Ein Hilfsskript im Repo-Root
umgeht **alle** Caps — und landet beim Staging trotzdem im Commit.

> **Symptom:** eine neue Datei über 300 Zeilen, Gate grün.

**Was zu tun ist:** Messskripte gehören nach `/tmp`. Was wirklich ins Repo muss,
trägt seinen Namen im Commit-Body.

### Der Vorrat an `Math.random()` und `Date.now()` gilt für ganz `src/`

Die Architekturprüfung verbietet `Math.random(` und `Date.now(` in **ganz**
`src/`, nicht nur in `src/domain/`. Das ist eine Prüfung mit zwei Zielen:
Spielwahrheit ohne Zufall, und die Abnahme selbst ohne Systemzeit — sonst wäre
`verify` flakig.

---

## Abschriebene Zahlen

Das ist der teuerste Fehler im Repo, weil er am längsten unentdeckt bleibt.

### Abgeschriebene Zahlen in `check-*.mjs` bleiben grün, während die Regel kippt

Wer eine Config ändert, muss die Literale in den Prüfungen mitziehen. Besser:
sie aus der Config ableiten. `check-start.mjs` prüfte „exakt vier Hive-Tiles" als
Literal `4` — heute kommt die Erwartung aus `world.hiveSize`, ist also von
`HIVE_SIZE` abgeleitet.

> **Gegenprobe:** mit hartkodiertem Raster in `grid.js` und `HIVE_SIZE` auf
> 3 × 2 fällt genau diese eine Prüfung rot. Damit ist sie überhaupt eine.

Und die Regel dahinter, die allgemeiner ist als der Fall: die Zahl im Test um
eins kippen. Fällt eine Prüfung, sucht sie die Zahl; fällt keine, prüft sie
nichts.

Konkret betroffen und bereits abgeschrieben oder abgeleitet:

- `check-mining-progress.mjs` prüft `totalMiningTicks() === 35` als Literal.
  Wer `miningDurationMs` oder `earthStateThresholds` ändert, muss die 35
  mitziehen.
- `check-start.mjs` liest die erwartete Hive-Fläche aus `world.hiveSize` — das
  ist der Weg, den alle anderen auch gehen sollten.
- `check-deposits.mjs` vergleicht die Welt gegen die Konstanten aus
  `deposit-config.js`. Wer `blockStride` oder `skipPerMille` ändert, färbt genau
  diese eine Prüfung rot. Das ist richtig so.
- `run-slice.mjs` leitet sein Zielfeld aus `firstEarthBlock` ab, es ist kein
  festes Raster verdrahtet. Verschiebt sich der Hive, wandert das Ziel mit —
  die abgeleiteten Erwartungen in den Prüfungen aber nicht automatisch.

### Ein Vergleich gegen die Konstante, die er prüft, prüft nichts

`expect('x === 3', x === 3)` ist immer grün. Erwartungen gehören aus der Config
abgeleitet, nicht aus der Funktion gezogen, gegen die geprüft wird. Genau dieser
Fehler steckt in den Fortschrittsticks, wo die Erwartung aus derselben Funktion
kam, gegen die geprüft wurde.

### Prüfungen, die sich selbst vergleichen

> **Symptom:** eine Prüfung bleibt grün, obwohl du die falsche Datei sabotiert
> hast. Das ist kein Test, der nichts findet — das ist ein Test, der nichts
> beweist.

Der Fund aus dem Export-Durchgang: `withSlot()` steht in `stone-roll.js`, nicht
in `lab-state.js`. Wer in `lab-state.js` sabotiert, trifft nichts und meldet
Erfolg.

---

## Die Abnahme

### `expect.mjs` ist global zustandsbehaftet

`lines` und `failures` stehen auf Modulebene, alles zählt über den ganzen Lauf,
und `summary()` ist nur **einmal** aufrufbar.

> **Symptom:** eine neue Prüfgruppe erscheint nicht in der Ausgabe, oder der
> Lauf endet nach der halben Liste.

**Was zu tun ist:** die Reihenfolge in `verify-slice.mjs` ist fest. `checkStart()`
muss vor `makeOnboardingRun()` laufen, weil der Start-Zustand der
Run-Erzeugung zugrunde liegt. Eine Prüfung, die irgendwo dazwischen ihre
Position braucht, hängt an einen vorhandenen Einstiegspunkt — der Einstiegspunkt
selbst steht an der Importgrenze.

### `startRooting(world, tile)` nimmt die Welt **und** die Kachel

Beim Nachtreiben von Hand: nicht nur die Kachel. Wer die Welt weglässt, prüft
gegen eine Welt, die es so nicht gibt.

### `check-workflow.mjs` prüft den Versions-Bot

Der Bot committet mit `GITHUB_TOKEN` und löst **keine** CI aus. Ein Verstoß in
seinem Commit-Body fällt deshalb erst auf, wenn jemand die Range über einen
Bot-Commit zieht. Der Check existiert, damit das nicht nötig ist.

> **Gegenprobe:** den Check gegen die alte Workflow-Datei laufen lassen. Alle drei
> Prüfungen fallen rot.

---

## Zwei Dateien, eine Wahrheit

### Hive-Position und Startkoordinaten liegen in zwei Dateien

`HIVE_ORIGIN` in `src/domain/world/world-config.js` und `dunglingSpawnTile` /
`firstEarthBlock` in `src/domain/onboarding/onboarding-config.js`.

> **Symptom:** der Hive verschiebt sich, aber das Onboarding zielt ins Leere —
> oder der Abbau läuft ins Raster, das niemand mehr angeschaut hat.

**Was zu tun ist:** wer den Hive verschiebt, muss beide mitziehen. Und weil
`run-slice.mjs` sein Ziel aus `firstEarthBlock` ableitet, wandert die Simulation
mit — die Erwartungen in den Prüfungen tun das nicht automatisch.

### `spawnTile()` und `HINTS[]`

Reduzierter Work-State las den Spawn-Anker selbst, mit Rückfallwert; der Reducer
las ihn ohne. Diese Asymmetrie ließ `parseTileId` auf `null` abstürzen. Beide
lesen jetzt `spawnTile()` aus `selectors.js`.

`HINTS[state]` hat **kein** `??`. Die Hinweistexte sind total über alle
Onboarding-Phasen, deshalb soll ein fehlender Eintrag rot werden und nicht
still auf „Der Hive wartet." zurückfallen.

---

## SVG und Geometrie

### Das `transform`-Attribut einer Form wird von der CSS-`transform`-Eigenschaft der Animation überschrieben

Platzierung gehört deshalb in eine **umschließende Gruppe**, nicht in das
Attribut der animierten Form.

### `soilBlob` zieht mit positivem `jitter` immer nach innen

Überlappung zwischen Nachbarfeldern entsteht nur über `outward`. Und ohne die
vier festen Eckpunkte (`0`, `0.25`, `0.5`, `0.75`) schneidet `smoothClosedPath`
die Ecken ab.

> **Symptom:** dunkle Rauten im Raster.

Das sieht nach Abstand zwischen den Feldern aus. Es ist eine **fehlende Ecke**.

### Ein gemeinsamer Radialverlauf zwingt allen Kacheln die Helligkeit der ersten auf

Jeder Vorrat braucht seinen eigenen Verlauf, sonst sieht jeder Cluster aus wie
der erste.

### Der `RootingVeil` malt mit 78 Prozent deckend und begräbt die Vorratshinweise

`DepositLayer.jsx` hängt deshalb in `TileLayer.jsx` **über** den Wurzeln —
genau auf den Feldern, für die der Veil steht. Eine Ebene, die nicht mehr da
ist, wo sie hingehört, fällt im Bild sofort auf und in keiner Prüfung.

---

## Der Dev-Server

### `npm run dev` bindet auf 127.0.0.1

Aus einem Container nicht erreichbar. Das ist Absicht.

### Port 5173 kann belegt sein

Vite weicht dann still auf 5174 aus. Vor dem Neustart `ss -ltnp | grep 517`.

### `nohup … &` wird mit der Shell wieder abgeräumt

Bewährt ist `python3 -c "subprocess.Popen([…], start_new_session=True)"` mit Log
in `/tmp/vite-dev.log`.

> **Aber:** Der Log ist keine Verlässlichkeit. Vite meldet `ready in ~1000 ms`,
> der Port antwortet erst nach etwa 4 s. Ein `curl` dazwischen liefert `000` —
> das ist die Lücke zwischen „gebunden" und „liefert", kein Fehler.

### Ein lokales `.venv/` taucht in keiner Dateiliste auf

Wer in diesem Repo einmal eine virtuelle Python-Umgebung angelegt hat, hat sie
in keiner `.gitignore` gefunden: **es gibt hier keine `.venv`-Regel**, weil es
hier keine gibt. Das Verzeichnis steht nicht unter Versionskontrolle, wird aber
von sich selbst ignoriert (sein eigenes `.gitignore` enthält `*`) — es ist damit
in `git status` unsichtbar und frisst trotzdem jede Dateizählung, die man zur
Absicherung des Hard-Cap-Scans heranzieht.

> **Regel:** `git status` ist kein Beweis, dass etwas nicht da ist.

`dist/` ist Build-Ausgabe und nicht versioniert — nicht von Hand editieren.

---

## Der Preview-Supervisor

Drei Fehler steckten darin, und alle drei haben schon ein Chrome-Fenster
aufgerissen, das nicht offen bleiben sollte.

### Der Health-Check darf **kein HTTP-`fetch`** sein

Node hält Keep-Alive-Sockets, die Chrome nach kurzer Zeit schließt. Der nächste
`fetch` landet auf einem toten Socket und meldet „Chrome tot", während `curl` in
11 ms mit 200 antwortet. Ein `net.connect` kann das nicht.

### Chrome und Port müssen **getrennt** geprüft werden

Gibt es den Prozess noch, aber der Port ist zu, ist das kein Grund für ein
zweites Fenster.

### Ein geschlossenes Fenster muss vom Absturz unterscheidbar sein

Sonst wird jedes normale Schließen zum Neustart.

### `Page.addScriptToEvaluateOnNewDocument` gilt nur für die offene CDP-Session

Ein Kurzskript verliert die Registrierung beim Schließen — deshalb der Daemon.

### Der Marker darf bei `document-start` kein DOM anfassen

`document.body` ist dort noch `null`, der Mount hängt am `readyState`.

### Tastatur-Handler laufen in der Capture-Phase

Ein Kind kann sie nicht stoppen. Die Tipp-Prüfung muss **vor** jeder Taste
stehen, sonst schluckt ein `Esc` im Kommentarfeld den Fokus und der Rest des
Satzes verschwindet.

---

## Werkzeuggrenzen

### `git log -1 --format=%B | tail -1` taugt nicht als Label-Prüfung

`%B` endet mit Zeilenumbruch, die letzte Zeile ist leer. Erst `messageParts()`
aus `scripts/lib/commit-rules.mjs` filtert die Leerzeilen weg.

### Die deutschen `rule`-Texte aus `commitViolations` sind eine Schnittstelle

`verify-commit-gate.mjs` greift per `includes()` auf sie zu und unterscheidet
Großschreibung. Ein umbenannter Regelname macht genau eine Zeile rot, ohne auf
die Ursache zu zeigen.

### Der Build ist die einzige Instanz, die einen toten Import bemerkt

Rollup findet einen fehlenden Export beim Auflösen und stirbt. Im `verify`-Lauf
fällt so etwas nicht auf, weil der Zustand im Test gesetzt wird. Deshalb gehört
`npm run build` zu jedem Task, nicht nur ins CI.

### Es gibt keinen Lint- und keinen Format-Automat

Nichts davon in `package.json`. Einrückungsfehler bleiben unentdeckt, bis
jemand die Datei liest.

### `git rev-parse --verify` bestätigt eine erfundene SHA

`hasRef()` in `scripts/ci-gate.mjs` sollte sagen, ob eine Referenz wirklich
existiert. Mit `rev-parse --verify --quiet <sha>` stimmt das nicht: git gibt
einen vierzigstelligen Hex-String **unaufgelöst** zurück und beendet mit 0 —
jede erfundene SHA gilt als „gefunden". Nur `^{commit}` erzwingt die Auflösung.
Der Wächter hat die Basis also nie geprüft und ist daran erst gescheitert, als
ein Force-Push `github.event.before` auf einen Commit zeigte, den es nicht mehr
gibt: `fatal: Invalid revision range`, Abbruch mit Status 128 statt eines
Befunds.

Die Gegenprobe steht in `verify-commit-gate.mjs` — drei Zeilen, eine davon mit
`deadbeef`. Ein Wächter, der nach einem Fehler *prinzipiell* nichts prüft, ist
schlimmer als keiner, weil er grün meldet.

### Nach einem Force-Push ist `main` bis zum nächsten Push rot

`ci.yml` nimmt `github.event.before` als Basis. Der SHA gehört zu der
History, die der Force-Push gerade weggeworfen hat, also läuft der Job ins
Leere. Das ist kein Fehler im Code, sondern eine Folge des Umschreibens — und
es bleibt stehen, bis ein weiterer Push eine gültige Basis mitbringt. Wer nach
einem Force-Push `main` auf grün wartet, wartet auf sich selbst.

---

## Was daraus folgt

Die meisten Einträge hier sind keine Fehler, sondern **Kanten des Projekts, an
denen schon jemand gestoßen ist.** Sie sind nicht weg, weil man sie nicht mehr
beachtet, sondern weil sie gemessen und aufgeschrieben wurden. Das ist der
gesamte Grund, warum es dieses Dokument gibt — und der Grund, warum ein neuer
Fund hierhin gehört statt in den Commit-Body, in dem er nach drei Monaten
niemandem mehr begegnet.