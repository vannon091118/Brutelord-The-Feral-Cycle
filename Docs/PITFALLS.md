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

### Der Footer-Stripper frisst den Betreff, wenn er ihn mitstrippt

Der `generic-trailer`-Pattern verlangt für **jede** Zeile `Schlüssel: Wert` —
konventionelle Betreffs (`feat: …`, `chore: …`) sehen so aus. Strippte der
Draft-Generator über alle Zeilen, war die generierte Message betrefflos und
das Commit-Gate meldete „leerer Betreff".

> **Gegenprobe:** `buildDraftMessage()` mit konventionellem Betreff rufen und
> die Message ins `commitViolations()` werfen — ohne den Schutz fiel exakt die
> Betreff-Prüfung um, alle anderen blieben grün.

**Was zu tun ist:** `stripForeignFooters()` ist auf Zeile null geschützt — der
Betreff bleibt unangetastet, alles darunter unterliegt den Footer-Regeln. Der
Draft-Generator schreibt ihn ohnehin aus dem Argument, nicht aus der Quelle.

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

- `check-mining-progress.mjs` rechnet die Erwartung selbst aus
  (`Math.max(1, Math.round(miningDurationMs / miningTickMs))`) und **misst
  zusätzlich**, dass `totalMiningTicks()` denselben Wert liefert. Die beiden
  Zeilen sind nicht dasselbe: die erste ist die Ableitung, die zweite prüft den
  Zeitplan dagegen. Vorher kam die Erwartung aus derselben Funktion, gegen die
  geprüft wurde — das ist der Fehler, nicht das Fehlen eines Literals. Gemessen
  an der Schwelle: `miningDurationMs` auf 2000 gezogen fällt genau
  „Der Zeitplan zählt dieselbe Tickzahl", nicht die Ableitungszeile.
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

### Ein Node-Test sieht keine Animation — und der Build ist auch kein Richter

Gemessen an `dl-hit-punch`: `className` auf `undefined` gesetzt (der Block federt
nicht mehr) lässt **Build und `verify` grün**. Sabotiert man zusätzlich den
`key`, startet die Animation nur noch einmal statt je Takt — ebenfalls grün. Der
Grund ist strukturell: die Animation ist CSS auf einem Knoten, den erst der
Browser malt. `npm run build` prüft Aufloesen von Importen, die Abnahme prüft
Zustände, und keines der beiden rendert.

> **Gegenprobe:** `scripts/verify/check-hit-juice.mjs` liest darum den Quelltext
> von `EarthTile.jsx`, `DungeonWorld.jsx` und `globals.css` und verlangt, dass
> die Klasse am `working`-Zustand haengt, dass ihr `key` den Schritt traegt und
> dass beide `@keyframes` existieren. Beide Sabotagen fallen damit um.

Und noch eine, die danebenlag: die Kamera-Huelle bekam zuerst
`pointer-events: none` — das erbt in die Bauplaetze und schluckt dort den
Klick. Das ist derselbe Fehler wie bei den Augen des Dunglings unten, an anderer
Stelle.

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

### Ein verwaister Abnahme-Server auf Port 5199 richtet sich als „bereit" aus

`startServer()` wartet nur darauf, dass **irgendwer** auf 5199 antwortet. Ein
Vite-Prozess, den ein abgebrochener Lauf übrig gelassen hat, antwortet auch —
und dann prüft `npm run verify` den alten Stand. Gemessen am 2026-10-06: ein
Waisen, das seit 2 h 38 min lief, lieferte die alte `DunglingBody.jsx` aus,
während die neue `Dungling.svg.jsx` schon lief. Das Ergebnis war kein
Kompilierfehler, sondern ein Seitenfehler im ersten Dungling
(`Cannot read properties of undefined (reading 'map')`), danach abgeräumter
React-Baum und fünf Beats mit exakt 30 001 ms — die Aktionsgrenze von
Playwright, nicht ein Spiel, das hängt.

> **Symptom:** Beats mit `drive` kosten exakt 30 001 ms, `pageerror` steht im
> Log, und im DOM fehlen plötzlich alle Knöpfe, obwohl `checkStart()` grün war.

**Was zu tun ist:** vor einem Lauf, dem man misstraut, `ss -ltnp | grep 5199`
und fragen, wie alt der Prozess ist. Der Waisen ist ein Kind von
`scripts/browser/server.mjs` und gehört einem — nur den killen, nie den
Vorschau-Server, der auf 5173 ohne `--port` läuft.

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

### Ein vorhandener Chromium ist kein lauffähiger Chromium

Gemessen in einem frischen Container: Playwright hat Chromium **installiert**
(`~/.cache/ms-playwright/chromium-1243`), und trotzdem bricht der Start mit
`Target page, context or browser has been closed` ab. Der Grund steht nicht in
der Fehlermeldung, sondern in `ldd`: **24 fehlende Systembibliotheken**, die
erste ist `libglib-2.0.so.0`. `npx playwright install-deps chromium` holt genau
diese Liste und repariert es (setzt `root` voraus und ein erreichbares
Paketarchiv — im Container muss vorher `apt-get update` laufen, sonst meldet apt
„Unable to locate package“).

> **Gegenprobe:** `node -e "chromium.launch()"` muss eine Version melden. Wer
> `npm run verify:browser` als „kaputt“ abtut, hat sehr oft nur die Bibliotheken
> nicht geprüft.

### Der verwaltete Vorschau-Server schlägt den eigenen

`scripts/browser/server.mjs` startet sonst selbst ein Vite auf Port 5199. Wer in
einer Umgebung mit verwaltetem Dev-Server arbeitet, setzt `DL_BROWSER_URL` —
`baseUrl()` nimmt die Adresse, `startServer()` liefert `null`, und
`stopServer(null)` bleibt ein No-op. Der eigene Pfad bleibt der Default, damit
CI nichts von der Umgebung weiß.

### `npm run dev` bindet auf 127.0.0.1

Aus einem Container nicht erreichbar. Das ist Absicht — der Dev-Server bringt die
Kontodatenbank mit und soll nicht im Netz stehen. Wer ihn von aussen braucht
(Container, getunnelte Vorschau), sagt es ausdrücklich: `DL_HOST=0.0.0.0 npm run dev`.

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

## Die Konto-API

### `request.destroy()` schickt die eigene Antwort nicht mehr ab

Gemessen, nicht vermutet: als der Rumpf-Wächter ein zu grosses Paket erkannte, rief
er `request.destroy()` auf — und `curl` bekam **HTTP 000**, also gar nichts. Der
Fehler war nicht die Absicht (die war richtig), sondern die Reihenfolge: die
Verbindung ist weg, bevor `response.end()` den Puffer leert.

> **Symptom:** ein Wächter ist grün im `npm run verify` und liefert im Browser
> `Failed to fetch`, ohne dass irgendein Statuscode zu sehen ist.

> **Gegenprobe:** `curl -s -o /dev/null -w "%{http_code}" -X POST … --data-binary @6kb.txt`
> muss **413** liefern, nicht `000`. Und die nächste Anfrage muss trotzdem
> funktionieren — der Server darf an der zu grossen nicht hängen bleiben.

### `DL_DATA_DIR=..` löscht den Elternordner, und die erste Schranke sah das nicht

Gemessen, nicht vermutet. `purge.mjs` löscht rekursiv in `DL_DATA_DIR`, und die
Schranke prüfte nur, ob der Pfad *gleich* Wurzel, Home oder Arbeitsordner ist.
`..` ist keines davon — also lief der Löschlauf und hat den Inhalt des
Elternordners entfernt, bevor `rmSync` an einem belegten Verzeichnis scheiterte.

> **Gegenprobe:** `DL_DATA_DIR=..` muss **mit Exit 1 abbrechen**, und die Datei
> neben dem Arbeitsordner muss danach noch da sein. Beides wird heute in einer
> Sandbox geprüft — im Repo selbst wäre das der letzte Test, den man schreibt.

**Regel für jeden rekursiven Löschlauf:** nicht fragen „ist das ein geschützter
Pfad?", sondern „was liegt **in** diesem Pfad, das ich nicht löschen will?".
Alles, was den Arbeitsordner enthält, ist tabu.

### Eine asynchrone Prüfgruppe, die nicht abgewartet wird, meldet sich nie

`checkAccount()` gab ein Promise zurück, `checkWorldViews()` rief es ohne `await`
auf, und `verify-slice.mjs` rief `summary()`, bevor der Server stand. Der Lauf
blieb grün — **und die Prüfzahl blieb exakt dieselbe**, was das einzige verräterische
Merkmal war.

> **Symptom:** eine neue Prüfgruppe erscheint in keiner Ausgabe, und die
> Prüfungszahl bewegt sich nicht. „Grün" und „nie gelaufen" sehen gleich aus.

> **Gegenprobe:** nach jeder neuen Prüfgruppe muss die Zahl aus
> `npm run verify` steigen. Bewacht wird das hier nicht durch eine Regel, sondern
> dadurch, dass `verify-slice.mjs` am Ende `await` schreibt — und ein `fetch`,
> das scheitert, wirft nicht, sondern gibt einen Befund zurück (`status: 0`).
> Sonst beendet sich der ganze Lauf mit einem Sockelfehler statt mit einem
> roten Befund, und wer das für einen Absturz hält, sucht im Server.

### Ein Helfer, der mehr Takte laufen lässt als der Pfad lang ist, misst die Erkundung

Gemessen beim Bau des Raids. `digTo()` im Aufbau `raid-fixture.mjs` lief mit
fester Tickzahl (40). Der Pfad zum Grabfeld ist nach zwei Schritten zu Ende —
und die Gruppe hat, ohne Befehl, **aus eigenem Antrieb weitergerbaut**. Die
Prüfung „zwei Grabfelder kosten zwei Ausdauer“ schlug deshalb fehl, obwohl der
Preis stimmte.

> **Symptom:** eine Kostenprüfung schlägt fehl, obwohl die Mechanik rechnet; im
> Log stehen mehr Grabfelder als Felder auf dem Pfad.

> **Gegenprobe:** `digTo()` läuft `ordered.path.length` Takte, nicht „genug“.
> Wer einen Helfer mit fester Tickzahl schreibt, prüft ab dem zweiten Aufruf den
> Idle-Takt statt des Befehls — und der ist per Bauabsicht ein anderer.

### Die Reihenfolge einer Kandidatenliste ist Teil des Replay-Formats

`entryPointFor()` wählt den Einmarsch mit `index = hash * list.length` aus
`candidates()`. Sortiert jemand diese Liste um — um eine Schleife lesbarer zu
machen —, verschiebt sich der Einmarsch **jedes laufenden Tickets**, ohne dass
eine Regel gekippt wäre: Kein Feld ändert seine Bedeutung, kein Test schlägt
fehl, und der Replay des Clients passt nicht mehr zu dem, was der Server gegen
dasselbe Ticket gerechnet hat.

> **Symptom:** keines. Genau das ist das Problem — es gibt keinen Befund, den man
> suchen könnte.

> **Gegenprobe:** `check-raid-format.mjs` friert Länge, ersten und letzten Punkt
> der Liste ein, und `RAID_FORMAT_VERSION` steht in `stateHashInput()`. Umdrehen
> wird damit rot statt still. Das Muster ist das aus „Abschriebene Zahlen in
> `check-*.mjs`“: Was das Replay-Format bestimmt, gehört als Konstante in eine
> Prüfung.

### Eine Bremse, die beim ersten Fehlversuch auslöst, ist kein Fehlschutz

Der Zähler zählte zuerst, aber `isLocked()` fragte nur noch, ob ein Eintrag
existierte — der erste falsche Login sperrte das Konto für eine Minute. Der Test
sah das als „nach fünf Versuchen gesperrt" und blieb grün, weil fünf Versuche
eben vier 401 und ein 429 sind. **Ein Test, der das Fenster prüft statt der
Schwelle, prüft die Bremse nicht.**

> **Gegenprobe:** `attempts - 1` Fehlversuche müssen **frei** bleiben, erst der
> letzte sperrt. Steht diese Zahl in der Prüfung oder ist sie im Skript fest
> verdrahtet, ist sie beim Umstellen von `attempts` schon wieder eine Abschreibung.

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

### Ein Spielstand, der die ganze Welt mitschreibt

Gemessen an einem frischen Zustand des Slice: `JSON.stringify(state)` ergibt
**783,6 KB** — 4096 Kacheln zu je rund 185 Byte. Ein `localStorage` verkraftet
das zwar, aber nicht fünfmal in fünf Sekunden.

Der Ausweg ist nicht „die Kacheln wegkürzen", sondern **die Welt nicht
mitzuschreiben**: sie ist eine Funktion ihres Seeds. `createWorld()` liefert für
denselben Seed exakt denselben Zustand — **gemessen 0 abweichende Kacheln** —
also trägt ein Spielstand nur die Kacheln mit, die vom frisch abgeleiteten
Zustand abweichen, dazu `world.deposits`. Ergebnis: **18,1 KB**, Roundtrip
byte-identisch.

> **Die Falle im Ausweg:** man darf *nicht* nach Sichtbarkeit filtern. Im Raster
> liegen **333 Vorrats-Zellen**, und nur **38 Kacheln** sind überhaupt sichtbar —
> ein Sichtbarkeitsfilter löscht also rund **295 Vorräte im Verborgenen** und
> verschiebt damit die Ökonomie, ohne dass irgendwo ein Fehler sichtbar wird.

> **Gegenprobe:** `packState()` gefolgt von `JSON.parse(JSON.stringify(...))`
> und `unpackState()` muss byte-identisch zum Ausgangszustand sein — auch für
> einen Zustand, in dem abgebaut und geerntet wurde. Wer diese Prüfung weglässt,
> verliert die Abweichungen still.

### Dekoration schluckt den Klick

Der erste szenariale Browserlauf blieb beim Bauen hängen: Playwright meldete
`intercepts pointer events`, und das Element, das den Klick abfing, waren die
**Augen des Dunglings** — `<ellipse cx="0.4" cy="-1.6" rx="4.6" ry="5.2">` direkt
über dem Bauplatz, den der Dungling gerade bewacht. 30 Sekunden Timeout, dann
Fehlschlag. Kein Node-Test sieht das, weil im Node nichts klickt.

> **Ursache:** SVG trifft keine Aussage darüber, ob ein Teil Dekoration ist.
> Ein `<g>` erbt `pointer-events: auto` und liegt damit über allem, was darunter
> liegt. `MiningParticles` hatte `pointerEvents: 'none'` gesetzt, der Dungling
> nicht.

> **Gegenprobe:** `npm run verify:tests`, Station `extractor-loop`. Wer eine
> Kreatur oder ein Effekt-`<g>` zeichnet, setzt `pointer-events: none` an der
> Wurzelgruppe — nicht an jedem Teil einzeln.

### Ein Testname ist Teil des Testzustands

Der Konto-Test prüfte fünf Fehlversuche auf **401** und bekam beim zweiten Lauf
`401,401,401,401,429`. Die Bremse hängt am **Namen**, und die Kontodatenbank des
Laufs (`tools/tests/.data`) lebt zwischen den Läufen weiter — der Zähler war also
schon bei 4, bevor der Fall anfing. Zusätzlich verbrauchte die erste Sonde des
Falls selbst einen Versuch.

> **Regel:** ein Fall, der einen **Zähler** prüft, braucht einen **eigenen
> Namen je Lauf** (`bremse-${Date.now()}`). Ein fester Name ist kein Testfall,
> sondern eine Restgröße aus dem letzten Lauf.

> **Gegenprobe:** denselben Fall zweimal hintereinander laufen lassen. Wenn das
> zweite Urteil anders ausfällt als das erste, hängt der Fall an etwas
> Überlebtem.

### Zwei Testläufe schreiben in dieselbe Protokolldatei

Beim Aufräumen sah eine Prüfung „`from.selector is not a function" — ein Fehler,
den der Code schon nicht mehr enthielt. Ursache: ein **alter Szenarienlauf**
stand noch in `hold()` und schrieb in dasselbe `latest.jsonl` wie der neue. Die
Datei war eine Mischung aus zwei Prozessen, und die Fehlermeldung gehörte zu
dem alten.

> **Gegenprobe:** ein Lauf, der eine Datei festhält, ist ein zweiter Lauf. Wer
> einen Lauf abbricht, muss den Prozess tot kriegen — und ein Logpfad, der
> von jedem Lauf neu geschrieben wird, ist kein Beweis, wer ihn zuletzt
> angefasst hat.

### Ein Wirt, dessen Browser tot ist, lügt

Der geteilte Browserwirt meldete „bereit", während sein Browser-Driver längst
gestorben war: sein HTTP-Kanal lebte noch, sein Websocket nicht. Der Lauf
bekam `ECONNREFUSED` auf einer Adresse, die er eben noch selbst bekommen hatte.

> **Ursache:** Der Wirt prüfte seinen eigenen Zustand statt den des Browsers.
> Ein HTTP-Antwortcode sagt nichts über den Prozess dahinter.

> **Gegenprobe:** stirbt der Browser-Driver, geht der Wirt mit. Und der Lauf,
> der sich nicht anhängen kann, räumt auf und startet **einmal** neu — ein
> zweiter Versuch ohne Ende ist schlechter als ein klarer Fehlschlag.

---

## Ein Zustand, den niemand liest

### `HIVE_PHASE.SETTLED` wird geschrieben und von niemandem gelesen

`settleHive()` setzt den Zustand, und die einzige Leseebene war `isSettled()` —
im Export-Durchgang als tot erkannt und geloescht. `canMutate()` liest
`DORMANT`, `hive-state.js` liest `MUTATING`, und niemand verzweigt an `SETTLED`.

> **Das ist kein Fehler, sondern eine Lücke.** `SETTLED` ist der Endzustand, den
> Speichern und die Leiter brauchen werden — beides steht unfertig in der
> ROADMAP. Ein Schreibzustand ohne Leser wird vom naechsten
> Export-Durchgang fuer toten Code gehalten und faellt weg.

**Was zu tun ist:** als `[FUTURE]` markieren, nicht loeschen. Heute steht die
Markierung **an der Schreibstelle** (`settleHive()` in
`src/domain/entities/hive.js`) und nicht beim Leser — sie wandert mit
`settleHive()` und verschwindet nicht, wenn jemand die Datei aufraeumt.
Ausfuehrlich in [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md) — die Leiter ist dort
als offener Punkt verzeichnet.

### Ein Kommentar zaehlt gegen die Hard Cap, nicht gegen die Erklaerung

Der Marker passte in `settleHive()` locker, derselbe Text in `hive-reducer.js`
sprengte die fuenf Kommentarzeilen, und `EntranceLadder.jsx` brauchte dafuer vier
kuerzere Zeilen als gedacht. `npm run gate -- --tree` nennt die Verstoesse
einzeln; die Cap gilt **pro Datei**, nicht pro Aenderung.

> **Was zu tun ist:** die Erklaerung gehoert nach [`PITFALLS.md`](PITFALLS.md)
> und [`ARCHITEKTUR.md`](ARCHITEKTUR.md), in den Code nur der Kopf. Das ist
> keine Formalie: die Gate-Meldung sagt es bei jedem Verstoss.

### Ein Migrator, der sein eigenes Ergebnis ueberschreibt

Der Kommentar-Cap wurde in zwei Laeuufen eingefuehrt. Der erste schrieb die
echte Prosa in die Spiegel-Dateien — richtig. Der zweite lief mit `--fresh`,
gab es aber auf einen bereits migrierten Baum: `docs/daten` wurde geloescht und
aus den Quellen neu erzeugt, und die Quellen trugen nur noch Pointer. Ergebnis:
159 von 160 Dateien hatten unter `## Verantwortung` wieder den Pointer statt des
Textes, **479 Kommentarzeilen aus `src/` waren weg** — sie standen nur noch im
Git von `99da74e`. Das Gate blieb gruen: es prueft Pointer, Existenz, Orphans
und Caps, aber keinen Inhalt.

> **Ursache ist nicht der Schalter, sondern die Datenrichtung:** nach der
> Migration ist `docs/daten` die Quelle der Erklaerung. Wer sie als Ausgabe
> behandelt und loescht, kann sie nicht wiederherstellen, weil es nur noch
> eine Quelle gibt.

> **Gegenprobe:** zwei Dinge, die zusammen den Fehler unsichtbar machten. Erst
> `proseOf()` muss den Pointer ueber `POINTER_RE` ausschliessen — ein zweiter
> Lauf schrieb sonst die Adresse als Prosa zurueck. Zweitens darf der Migrator
> keine Datei mit echter Prosa ueberschreiben und muss byteidentisch laufen:
> drei Laeufe hintereinander melden nach dem ersten `0 neu aufgebaut, 155
> behalten`. Beweis der Erholung ist nicht ein gruener Gate, sondern die
> konkrete Datei: `docs/daten/world/grid.md` muss wieder „Das Raster: ein Tile
> pro Koordinate …" tragen.

### 160 Drift-Verstoesse, die keine sind

Der Spiegel-Umbau erzeugte 160 neue Doku-Dateien, alle noch ungetrackt.
`npm run gate -- --spiegel` meldete daraufhin fuer **jede** Quelldatei
„Quelle und Spiegel-Datei wandern zusammen". Der Befund sah echt aus und war
falsch: `driftEntries()` liest `git diff --name-only <base>`, und ungetrackte
Dateien stehen in keinem Diff. Nach `git add src docs` war derselbe Lauf gruen
— ohne eine Zeile Code zu aendern.

> **Symptom:** eine Regel, die eine *Aenderung* vergleicht, kann eine Datei
> nicht sehen, die noch gar nicht committed ist. In der CI kann das nicht
> passieren — dort ist alles committed —, lokal aber schon, und zwar genau dann,
> wenn man die Regel zum ersten Mal ausprobt.

> **Gegenprobe:** Wer eine neue Regel gegen einen frischen Umbau faehrt, staged
> beide Seiten (`git add`) und wiederholt den Lauf, bevor er ueberhaupt auf einen
> Codefehler schliesst. Sonst sucht man einen Bug in `spiegel-rules.mjs`, den
> dort nicht gibt.

### Ein Vorwaerts-Hash hat keine Ruecksubstitution — und eine gebaute Wahrheit daneben

Der erste Etagen-Entwurf hat den Spielerseed aus dem Welt-Seed **zurueckgerechnet**,
weil der Weltzustand nur den Seed trug. Gemessen ueber alle Tiefen: **jede** Tiefe
ungleich 0 kam falsch zurueck. Der zweite Versuch mit einer eigenen Mischfunktion
litt am selben Grund — `Math.imul`-Ketten sind vorwaertsgerichtet und haben keine
Inverse.

> **Symptom:** Der Wert ist eine Zahl, sieht plausibel aus, und das Spiel startet
> trotzdem. Es gibt keinen Befund, nur eine Welt, die irgendwie anders ist.

> **Gegenprobe:** `createInitialGameState(seed).playerseed` muss der **Eingang**
> sein, und `floorSeed(playerseed, 0)` muss `worldSeed(playerseed)` ergeben. Wer
> stattdessen zurueckrechnet, baut sich eine zweite Wahrheit neben der ersten.

### Ein Salz auf Tiefe 0 benennt eine Welt, die der Spieler nie sieht

Der Hash mischte das Salz auch auf der Starttiefe. `floorSeed(p, 0)` ergab
**2712521215**, `createWorld({ playerseed: p })` dagegen **2712847316** — dieselbe
Funktion, dieselbe Zahl, zwei verschiedene Startwelten. `FLOOR.start` bezeichnete
so einen Wert, dessen Welt nie im Bild auftaucht.

> **Gegenprobe:** `check-verticality.mjs` verlangt, dass Tiefe 0 **exakt** die
> Startwelt ist. Sabotiert auf `depth < FLOOR.start`, faellt genau diese eine Zeile
> um — alle anderen bleiben gruen, weil die Welt „irgendwie" plausibel ist.

### `canDescend(-1)` war wahr

Die Grenze lautete `depth < DEEPEST_FLOOR`. Eine negative Tiefe galt damit als
abstiegsberecht — der Sprung „eine Etage tiefer" fuehrt dann auf `-2` und geht
unter das Nichts. Kein Absturz, keine Meldung: ein Zustand, den es nicht geben
darf.

> **Gegenprobe:** `canDescend` muss `depth >= FLOOR.start` **mit**pruefen. Die
> Abnahme fragt `-1`, `undefined`, `'1'` und `NaN` ab; jeder davon ist `false`.

### Ein Cache-Schluessel ohne die neue Dimension liefert die falsche Ebene

Der Spielstand speichert die Welt als **Abweichung** vom Seed-Zustand, und der
Seed-Zustand wird über einen Cache wiederverwendet. Dessen Schluessel nannte
Seed, Mass und Hive-Anker — aber nicht die Tiefe. Nach einem Sprung rutschte
darum eine Ebene durch denselben Eintrag.

> **Gegenprobe:** die Tiefe gehoert in den Schluessel **und** in `isSavedShape()`.
> Sabotiert man nur eines der beiden, bleibt der Lauf gruen — beide Pruefungen
> sind noetig, weil sie zwei verschiedene Tueren sichern: die Ableitung und die
> Formpruefung. `SNAPSHOT_VERSION` steht auf 2, damit ein Stand aus Fassung 1
> (ohne Tiefe) verworfen wird und nicht still eine Ebene ohne Sprungpfad laedt.

### Eine Pruefung, die den Seed vergleicht, prueft den Cache-Schluessel nicht

Der erste Wächter der Tiefe hieß „Der Cache verwechselt die Tiefen nicht" und
verglich zwei **Seeds**. Sie blieb gruen, als der Schluessel beschnitten war. Der
Test hat etwas anderes geprueft als das, was sein Name behauptet — die Seeds waren
auch nach dem Fehler verschieden, weil zwei Tiefen immer verschiedene Seeds haben.

> **Gegenprobe:** entweder wird die Wirkung gemessen (das Verhalten bricht) oder
> die Stelle gelesen. Beides ueber `check-verticality-wiring.mjs`, weil Node den
> Sprung nicht ausfuehrt und `npm run build` bei gebrochenem Cache-Schluessel
> gruen bleibt.

### Ein Testname verwechselt „ungepackt" mit „gespeichert"

`isSavedShape()` gilt fuer das **gepackte** Format, weil `readSavedState()` auf
Packe-Werte prueft und erst danach entpackt. Die erste Fassung der Tiefen-Pruefung
rief sie auf dem **ungepackten** Zustand auf und meldete „ein Stand mit Tiefe wird
angenommen" als fehlgeschlagen — im gruenen Lauf.

> **Symptom:** eine neu geschriebene Pruefung schlaegt sofort fehl und ihre
> Umkehrung ist der Sabotage nicht mehr wert.

> **Gegenprobe:** Wer `isSavedShape` pruft, prueft `packState(state)`. Geht es um
> die Form, nicht um die Wirkung, ist das der Unterschied zwischen einem Befund
> und einem Verwirrungsfehler.

---

## Was daraus folgt

Die meisten Einträge hier sind keine Fehler, sondern **Kanten des Projekts, an
denen schon jemand gestoßen ist.** Sie sind nicht weg, weil man sie nicht mehr
beachtet, sondern weil sie gemessen und aufgeschrieben wurden. Das ist der
gesamte Grund, warum es dieses Dokument gibt — und der Grund, warum ein neuer
Fund hierhin gehört statt in den Commit-Body, in dem er nach drei Monaten
niemandem mehr begegnet.