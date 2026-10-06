# Workflow

Wie hier gearbeitet und geprüft wird: die drei Wächter, der Ablauf eines Tasks,
die Versionierung, die CI und die Arbeitsumgebung. **Was gilt** steht in
[`GOVERNANCE.md`](GOVERNANCE.md), **warum** in
[`ARCHITEKTUR.md`](ARCHITEKTUR.md), **was schon einmal gebrochen ist** in
[`PITFALLS.md`](PITFALLS.md).

---

## Die Wächter

Es gibt **kein `npm test` und keinen Linter.** `gate` hat drei Modi, dazu kommen
`verify` und `build`. Alles andere ist Sorgfalt — siehe *Sorgfaltspflicht* in
[`GOVERNANCE.md`](GOVERNANCE.md).

| Wächter | Prüft | Blockiert |
| --- | --- | --- |
| `npm run gate -- --tree` | Die fünf Hard Caps pro Datei unter `src/` und `scripts/` — die Werte stehen in [`GOVERNANCE.md`](GOVERNANCE.md) | CI |
| `npm run gate -- --commits=<base>..<head>` | Betreff, Body-Länge, genannte Dateien, VANNON-Label, Bot-Signaturen | CI |
| `npm run gate -- --version --base=<sha>` | Monotonie der `revision`, Übereinstimmung von Lock und Spiegeln | CI |
| `npm run gate -- --docs` | Metadaten-Pflicht der Einträge in `ROADMAP_OPEN.md` und `CHECKPOINTS.md` | CI |
| `npm run gate -- --spiegel` | Kommentar-Cap (1 Zeile = `@doc`-Pointer), Spiegel-Doku unter `docs/daten/`, Caps, Orphans, Drift | CI |
| `npm run check` | Die **betroffenen** Wächter und die Gruppen, deren Eingaben sich geändert haben — gecacht, ohne Browser | Hand |
| `npm run verify` | Verhalten der Domäne: Onboarding, Abbau, Verwurzelung, Bau, Brutlord, Ökonomie, Konto | CI |
| `npm run verify:commits` | Das Commit-Gate gegen sich selbst — Regressionstests der Regelprüfung | CI |
| `npm run verify:browser` | Dieselbe Onboarding-Kette im echten Chromium, mit angehaltener Uhr — braucht einen Browser und den Port 5199 | Hand |
| `VERIFY_SHOTS=1 npm run verify:browser` | Zusätzlich die Bilder in `Docs/shots/` neu erzeugen — sonst fasst der Lauf die versionierten Bilder nicht an | Hand |
| `npm run build` | Importauflösung über den echten Bundler | CI |

```sh
npm ci                                     # CI pinnt Node 22, lokal läuft Node 26
npm run dev                                # Vite, bindet auf 127.0.0.1
npm run gate                               # alle Wächter
npm run check                              # lokal: betroffene Wächter + geänderte Gruppen, gecacht
npm run check -- --list                    # welche Gruppe ist unverändert
npm run check -- <gruppe>                  # genau diese Prüfgruppe
npm run check:browser                      # die Browser-Stufe allein
npm run gate -- --tree                     # nur Hard Caps
npm run gate -- --commits=<base>..<head>   # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>     # Version gegen eine Basisrevision
npm run gate -- --docs                     # Metadaten-Pflicht der Doku-Einträge
npm run docs:sync --check                  # Pre-Flight des Doku-Syncs (liest nur)
npm run docs:sync                          # Sync ausführen — im Bot-Workflow
npm run commit:draft                       # Commit-Body-Vorprüfung für gestagete Dateien
npm run verify                             # Volllauf: Abnahme inkl. Browser — läuft in der CI
npm run verify:commits                     # Regressionstests des Commit-Gates
npm run verify:browser                      # Abnahme im echten Browser (einmal Chromium holen)
npm run build                              # Production-Build
npm run version:bump -- patch              # auch minor | major
npm run version:check                      # Lock vs. Spiegel
npm run purge                              # löscht .data/ samt Datenbank
```

**Gate und verify lesen Pfade relativ zum CWD** — immer aus dem
Repo-Wurzelverzeichnis starten.

---

## Die Testlaufzeit

Gemessen am 2026-10-06 auf dem Entwicklungsrechner, nach dem Umbau der
Browser-Stufe. Die Zeile ist geteilt: **lokal läuft, was sich geändert hat**
und gedeckelt bleibt; **der Volllauf gehört der CI**.

| Lauf | Vorher | Nachher | Wo er läuft |
| --- | --- | --- | --- |
| `npm run check` — betroffene Gruppen, gecacht | — | **2–12 s**, je Last | lokal |
| `npm run check -- --all` — alle Gruppen im Node-Prozess | 56,9 s | **43,7 s** | lokal, auf Abruf |
| `npm run check:browser` — Konto-Tor und Onboarding in Chromium | 194,8 s | **82,9 / 95,9 / 125,5 s** | lokal auf Abruf, sonst CI |
| davon `site-ready` (20 s Spielzeit) | 91,9 s | 33,7 s | — |
| davon `floor-grows` (4,6 s Spielzeit) | 42,4 s | 11,8 s | — |
| `npm run gate` mit allen Wächtern | 5,4 s | 5,4 s | lokal |
| `npm run build` | 3,1 s | 3,1 s | lokal, einmal je Task |
| `npm run verify` — Volllauf, lokal | ~4 m 15 s | ~2 m 25 s | nur wenn es sein muss |
| `npm run verify` — Volllauf, auf der CI | 22 s | **11–14 s** | **CI auf Push** |

**Die alte Zahl war abgeschrieben.** `npm run verify` stand hier mit 2 m 13 s
und war gemessen rund **vier Minuten** lang: die Browser-Stufe allein kostete
194,8 s, weil ihre Schritte alle 50 ms nachsahen. Gemessen wird jetzt vor und
nach jedem Umbau an dieser Zeile, siehe *Messe, bevor du behauptest*.

**Die Zeile ist auch deswegen kürzer, weil die Gruppen kleiner sind.** Jedes
`check-*.mjs` hat seine eigene Zeile in `scripts/verify/groups.mjs` und seinen
eigenen Fingerabdruck: eine Änderung an der Ökonomie fährt die Ökonomie, nicht
das ganze Bündel. Vorher hing der Zuschnitt an der Importgrenze von
`verify-slice.mjs` — acht Importe waren das Cap, also wurden `check-deposits`
an `checkRooting()`, `check-traits` an `checkMutant()`, `check-seed` und
`check-account` an `checkWorldViews()` gebündelt. **Dieser Grund ist weg:**
`index.mjs` reiht `export … from`-Zeilen, und die zählen nicht als Import.

**Und eine quadratische Prüfung ist eine langsame Prüfung.** Der
Spiegel-Vergleich der Brutlord-Konturen suchte zu jedem der 71 682 Punkte den
nächsten gespiegelten — gemessen 10,8 s von 15,6 s der Gruppe. Er sucht jetzt
im Fenster der gespiegelten x-Achse auf einer sortierten Liste; geprüft wird
dieselbe Aussage (`< 1e-6`), nur ohne jedes Paar.

**`npm run check` ist die lokale Zeile.** Er fährt die betroffenen Wächter und
danach nur die Prüfgruppen, deren **Eingaben** sich geändert haben — der
Fingerabdruck einer Gruppe ist ihre ganze Import-Hülle plus jede Datei, die
ihre Module namentlich nennen (goldene Werte, Workflows, gestartete Skripte).
Nichts geändert heißt: nichts läuft. Die **Browser-Stufe läuft dort nicht** —
sie ist der teuerste Teil und hängt an einem Server; die CI fährt sie bei
jedem Push. Wer sie einzeln will, nimmt `npm run check:browser`; auch sie
schweigt, wenn nichts angefasst wurde und `src/` unverändert ist.

```sh
npm run check                          # betroffen, gecacht, ohne Browser
npm run check -- --list                # was ist unverändert, was läuft
npm run check -- determinism storage   # genau diese Gruppen
npm run check -- --all                 # alle Gruppen, ohne Speicher
npm run check -- --no-cache            # alles, Speicher weder lesen noch schreiben
npm run check:browser                  # die Browser-Stufe (braucht einen Server)
```

**Die Browser-Stufe hängt an ganz `src/`.** Ihre Import-Hülle kennt die
zeichnenden Module nicht — `check-startup.mjs` importiert `stage.mjs`, und
`src/world/` sieht der Browser, nicht der Import. Ein Fingerabdruck, der das
Sichtbare nicht enthält, wird still alt, also ist dort `src` ein Eingang: eine
Änderung am Spiel fährt die Abnahme, eine an der Doku nicht.

**Der Speicher ist fail-open, deshalb darf er schweigen.** Eine Gruppe ohne
Eintrag läuft immer, ein roter Lauf wird nie gespeichert, und verglichen
werden Bytes — geänderter Inhalt ist ein anderer Fingerabdruck. Die CI liest
und schreibt ihn nie: `npm run verify` fährt jede Gruppe, jedes Mal.

**Warum der Browser so lange braucht, und was daran gemacht wurde.** Gemessen:
ein Uhrsprung von 500 ms kostet weniger als zehn von 50 ms (1971 ms gegen
5016 ms im selben Fenster), und eine Auskunft über fünf Locator-Runden kostet
131 ms gegen 17 ms im Seitenkontext. `scripts/browser/advance.mjs` springt
deshalb grob und zieht nur im letzten Fenster fein nach, `read.mjs` liest in
einer Auswertung; die Beats fielen von 176 s auf 63 s. Was bleibt, ist echte
Spielzeit: 20 Sekunden Bauzeit sind 20 Sekunden.

**Kein Hintergrundprozess lokal.** Ein `fire-and-forget`-Lauf auf derselben
Maschine verbraucht dieselbe CPU und denselben Chromium; gespart wird die
Wartezeit, nicht die Last. Der asynchrone Lauf ist die CI — ihr Ergebnis ist der
Workflow-Lauf, nicht ein Log im Dateisystem.

**Der Preis, und er ist bewusst:** Zwischen dem Push und dem CI-Bericht kann
`main` rot sein. Der Volllauf ist die Gegenprobe **nach** dem Push, nicht die
Vorprüfung davor. Wer ihn vorher braucht, fährt ihn lokal — dann weiß er, wofür
zwei Minuten draufgehen.

---

## Der Ablauf eines Tasks

Nach **jedem** abgeschlossenen Task, in dieser Reihenfolge:

### 1. Offene Roadmap aktualisieren

`Docs/ROADMAP_OPEN.md` ist Pflichtdoku und wandert im selben Commit mit.
Fertiges bekommt ein Häkchen, **der Eintrag bleibt bis zum Doku-Sync stehen**:
`npm run docs:sync --check` prüft vor jedem Schreiben, ob jeder Eintrag valide
Metadaten trägt, und der Bot bewegt Erledigtes in die
[`CHECKPOINTS.md`](CHECKPOINTS.md) und stempelt Version und Datum.

### 2. Gate gegen eine echte Range

```sh
npm run gate -- --commits=<base>..<head>
```

`npm run gate` **ohne** Argumente prüft Commits nur gegen eine Basisrevision. Auf
`main` ohne neue Commits meldet es „keine neuen Commits" und übersieht damit
Regelverstöße — der eigentliche Test ist der PR-Check. Deshalb lokal immer mit
expliziter Range. `<base>` ist der Commit **vor** deinem ersten Commit auf
diesem Branch, `<head>` der letzte eigene Commit.

### 3. Schnelle Spur lokal, Volllauf in der CI

```sh
npm run check
npm run build
```

`npm run check` fährt die betroffenen Wächter und danach nur die Gruppen,
deren Eingaben sich geändert haben; `-- --list` sagt vorher, welche das sind,
und `-- <gruppe>` fährt genau eine. Die Browser-Stufe ruft man einzeln
(`npm run check:browser`) oder gar nicht — sie gehört der CI.

Ein Fehlpfad fällt nur hier auf, nicht im Gate. Die betroffene Prüfgruppe prüft
Verhalten im Node-Prozess, `build` prüft Importauflösung im echten Bundler — es
gibt keine andere Instanz, die einen fehlenden Export bemerkt, deshalb bleibt
`build` lokal. Der Volllauf `npm run verify` mit Server und Chromium läuft in
der CI auf Push; die Zeiten und die Grenze stehen in *Die Testlaufzeit* oben.

### 4. Commit vorprüfen, dann committen

**Empfohlener Weg: der Draft-Generator.** `node scripts/commit-draft.mjs
"Betreff" "Absatz eins" "Absatz zwei"` generiert aus den **gestageten** Dateien
einen regelkonformen Body — Prosa je Datei, das VANNON-Label allein in der
letzten Zeile — und entfernt fremde Footer (`Co-Authored-By`, `Generated with …`,
Bot-Signaturen, `Key: value`-Trailer), bevor sie jemals in einen Commit
gelangen. Die Ausgabe nach `/tmp/commit-msg.txt` schreiben, mit
`git diff --cached --name-only` gegen die Vorprüfung spiegeln, dann aus
derselben Datei committen:

```sh
node scripts/commit-draft.mjs "Betreff" "Erster Absatz." "Noch einer." > /tmp/commit-msg.txt
git diff --cached --name-only
git commit -F /tmp/commit-msg.txt
```

**Nicht über `npm run` umleiten.** Das npm-Banner geht auf stdout und steht
danach in der Datei; `git commit -F` nimmt es als Betreff, und das Gate sieht
darin keinen Verstoß. Gemessen und aufgeschrieben in
[`PITFALLS.md`](PITFALLS.md), *Das Gate*.

Die Vorprüfung ohne Generator — billiger als ein Commit, der am Gate
scheitert. `commitViolations({ sha, message, paths })` aus
`scripts/lib/commit-rules.mjs` bekommt die Commit-Message und die Liste der
gestageten Dateien:

```sh
git add <nur deine Dateien>
git diff --cached --name-only > /tmp/paths.txt
# Message nach /tmp/commit-msg.txt schreiben, dann:
node --input-type=module -e "
import { readFileSync } from 'node:fs'
import { commitViolations } from './scripts/lib/commit-rules.mjs'
const paths = readFileSync('/tmp/paths.txt', 'utf8').split('\n').filter(Boolean)
const message = readFileSync('/tmp/commit-msg.txt', 'utf8')
const issues = commitViolations({ sha: 'HEAD', message, paths })
console.log(issues.length ? issues.map((i) => i.rule + ' — ' + i.detail).join('\n') : 'keine Verstoesse')
"
```

`--input-type=module` ist nicht Kosmetik: `scripts/lib/commit-rules.mjs` ist ESM,
und ein `require()` darin ist ein `ReferenceError`. Geprüft ist der Aufruf so —
er meldet unter anderem *jede geänderte Datei erklären — <pfad> fehlt im
Commit-Body*, solange eine gestagete Datei nicht im Body steht.

Vorprüfung und Commit **müssen dieselben Bytes sehen** — deshalb beide aus
derselben Datei:

```sh
git commit -F /tmp/commit-msg.txt
```

### 5. Push auf `main`

Kein PR, kein Branch-Zirkus. Steht die Version, muss auch die `revision` stehen
bleiben — Regel- und Doku-Commits brauchen deshalb keinen Bump.

---

## Version und Revision

`version.lock.json` führt; `VERSION`, `package.json` und `package-lock.json` sind
Spiegel und werden nur über den Versionierer geschrieben. Die `revision` steigt
pro Versionserhöhung um genau 1, ein Rückschritt ist verboten — die einzige
Ausnahme ist eine ausdrückliche Rücknahme einer Fehlbenennung mit `amends` im
Lock, und die Regel in `GOVERNANCE.md` lässt genau diesen Fall durch.

Parallele Branches bearbeiten denselben Lock: Zwei konkurrierende
Versionsänderungen erzeugen einen Merge-Konflikt, und das ist der gewünschte
Ausgang. Eine unbemerkte Divergenz wäre schlechter.

---

## CI

Zwei Workflows in `.github/workflows/`:

- **`ci.yml`** — läuft auf Push und PR, in **zwei Jobs**. `gate` ermittelt eine
  Basisrevision (PR-Base, sonst `before`, sonst `HEAD^`) und fährt `gate
  --version`, `--tree`, `--docs`, `--spiegel`, `--commits` und
  `verify:commits`: reine Textarbeit, kein Browser, kein Build. `slice` holt
  Chromium und fährt `npm run verify` und `npm run build`. Beide Jobs laufen
  gleichzeitig; die Wanduhr ist die des Slice. Gemessen: vor der Teilung 73 s
  für **einen** Job — 6 s Checkout, 7 s Node, 3 s `npm ci`, 29 s
  Browser-Download, 22 s Slice, 1 s Build. Nach der Teilung, im ersten Lauf mit
  dem neuen Browser-Cache-Schlüssel: `gate` **9 s**, `slice` **42 s** (21 s
  Download, 11 s Slice, 1 s Build) — beide zusammen 42 s Wanduhr, und ein
  gebrochener Commit-Body steht nach neun Sekunden fest, nicht nach einer
  Minute. Der Browser-Download liegt im Cache, und sein Schlüssel nennt die
  Playwright-Fassung statt des Locks: ein Schlüssel auf `package-lock.json`
  träfe nie, weil der Versions-Bot den Lock bei jedem Push neu schreibt (die
  Version steht darin) — siehe `PITFALLS.md`. Ein Treffer spart den Download;
  die Systempakete holt `--with-deps` in jedem Lauf, gemessen 19 s apt gegen
  2 s Download.

  **Die CI ist die schnelle Maschine, nicht das Gedächtnis.** `npm run verify`
  braucht dort gemessen 11 s gegen 43,7 s auf dem Entwicklungsrechner: die
  schwere Arbeit gehört hierher, und genau deshalb fährt sie nur hier.

  **Der Volllauf bleibt ungeteilt.** `slice` fährt `npm run verify` und nicht
  eine Gruppenauswahl: eine Abnahme, die man unterlaufen kann, ist keine. Die
  Teilung granular zu machen ist Sache von `npm run check` — lokal, wo sie Zeit
  spart, statt online, wo sie eine Lücke öffnen würde.
- **`auto-bump.yml`** — committet als `github-actions[bot]`, also **unsigned**
  (`git log --show-signature -1` zeigt `N`). Er bumpt nur bei Änderungen unter
  `src/`, `scripts/` oder `tools/`; Doku- und Hygiene-Änderungen allein lösen
  keinen Bump aus. Vor dem Bump prüft der Pre-Flight die Doku-Einträge, nach
  dem Bump stempelt der Doku-Sync, und der Commit-Body kommt aus dem
  Draft-Generator. Hand-Commits zeigen `G`.

Die Bot-Ausnahme gilt nur für die **Signatur**, nicht für die Commit-Policy —
siehe `GOVERNANCE.md`. `scripts/verify/check-workflow.mjs` prüft bei jedem
`npm run verify`, dass der Bot regelkonform schreibt.

---

## Die Abnahme

`scripts/verify-slice.mjs` ist der Einstiegspunkt. Sie spielt den Slice mit
einer **virtuellen Uhr** durch und importiert die **echten** Module aus `src/` —
keine Nachbauten, kein Browser, keine Flakiness.

Geprüft wird, was sonst niemand prüft: Onboarding-Zeiten, Abbau-Ergebnis,
Verwurzelungs-Phasen, der komplette Bauablauf bis zum Brutlord, Traits im
echten Reducer, die Essenz-Ökonomie, die Konto-Kette, die Weltbilanz und die
Architekturgrenzen. Jede Prüfgruppe leitet ihre Erwartungen aus den Configs ab,
nicht aus gerundeten Zahlen.

**Neue Domänenlogik ist erst geprüft, wenn eine `check-*.mjs` sie aufruft.** Ein
Prüfmodul, das niemand aufruft, prüft nichts und fällt in einem grünen Lauf
nicht auf — `Jedes Prüfmodul ist verdrahtet` prüft genau das.

Der Gerüstbau ist `scripts/verify/expect.mjs`. Daraus folgen zwei feste Regeln:

- **`expect.mjs` ist global zustandsbehaftet.** `lines` und `failures` stehen
  auf Modulebene, alles zählt über den ganzen Lauf, und `summary()` ist nur
  einmal aufrufbar. Deshalb liegt die Reihenfolge fest: `checkStart()` läuft vor
  `makeOnboardingRun()`, weil der Start-Zustand der Run-Erzeugung zugrunde liegt.
- **Wer eine Prüfung hinzufügt, gibt ihr eine eigene Zeile in
  `scripts/verify/groups.mjs`.** Dort steht die Reihenfolge einmal, gelesen vom
  Volllauf (`verify-slice.mjs`) und vom lokalen Lauf (`check.mjs`). Gebündelt
  wird nichts mehr: jede `check-*.mjs` hat ihren eigenen Einstieg, sonst
  bezahlt eine Änderung an einer Sache die Prüfungen von sieben anderen.

Wie viele Prüfungen das sind, steht nicht in diesem Dokument, sondern in der
letzten Zeile des Laufs. Diese Zahl zu zitieren wäre eine abgeschriebene Zahl —
siehe `GOVERNANCE.md`, *Messe, bevor du behauptest*.

---

## Die Arbeitsumgebung

```sh
npm run dev      # bindet auf 127.0.0.1
```

Aus einem Container oder von unterwegs kommst du da nicht rein; das ist Absicht
und kein Bug. Läuft schon ein Server auf 5173, weicht Vite still auf 5174 aus —
vor dem Neustart `ss -ltnp | grep 517` prüfen.

Der Dev-Server muss **von der Shell losgelöst** starten, sonst räumt ihn die
Shell mit ab:

```sh
python3 -c "subprocess.Popen(['npm','run','dev'], start_new_session=True, \
  stdout=open('/tmp/vite-dev.log','w'), stderr=subprocess.STDOUT)"
```

Der Log ist keine Verlässlichkeit: Vite meldet `ready in ~1000 ms`, der Port
antwortet erst nach etwa 4 s. Ein `curl` dazwischen liefert `000` — das ist die
Lücke zwischen „gebunden" und „liefert", kein Fehler.

### Vorschau im echten Browser

`tools/preview/` stellt ein sichtbares Chrome-Fenster mit Element-Marker bereit,
ohne temporäre `lab.html`:

```sh
node tools/preview/up.mjs      # Dev-Server + Chrome + Marker-Daemon
node tools/preview/down.mjs    # aufräumen
node tools/preview/pull.mjs    # Mark-Liste aus der Inbox holen (127.0.0.1:9333)
```

Im Fenster: `m` markiert, `p` blendet das Panel ein, `Esc` beendet. **Senden →
Chat** legt die Mark-Liste in die Zwischenablage **und** in die Inbox; damit ist
„m2 ist zu blau" eine Zeile mit Selektor und Rechteck statt einer Ratepartie.
Der Daemon hängt sich per CDP an und injiziert den Marker nach jedem Reload neu.
Die Fallstricke des Supervisors stehen in `PITFALLS.md`.

---

## Was hier nicht passiert

- **Kein PR-Zirkus.** Kein Branch, kein Review-Ritual, kein Merge-Konflikt im
  eigenen Task.
- **Kein `npm test`.** Was hier prüft, ist `npm run verify`.
- **Kein Linter, kein Formatter.** Nichts davon in `package.json`.
- **Kein Losgriff auf `dist/`.** Das ist Build-Ausgabe und nicht versioniert.
- **Keine Hand-Versionierung.** Lock und Spiegel nur über den Versionierer.

Und die Regel, die alle anderen trägt: **Ein Fehlpfad wird behoben, nicht
umgangen.** Kein Skip, keine geschwächte Zusicherung, kein verschluckter Fehler,
keine Typ- oder Lint-Unterdrückung, nur damit die Prüfung grün wird. Wenn
etwas davon nötig wäre, um das gewünschte Verhalten zu erreichen, gehört es
erklärt und verifiziert — nicht still eingebaut.