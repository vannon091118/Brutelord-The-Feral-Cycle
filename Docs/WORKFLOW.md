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
| `npm run verify` | Verhalten der Domäne: Onboarding, Abbau, Verwurzelung, Bau, Brutlord, Ökonomie, Konto | CI |
| `npm run verify:commits` | Das Commit-Gate gegen sich selbst — Regressionstests der Regelprüfung | CI |
| `npm run verify:browser` | Dieselbe Onboarding-Kette im echten Chromium, mit angehaltener Uhr — braucht einen Browser und den Port 5199 | Hand |
| `VERIFY_SHOTS=1 npm run verify:browser` | Zusätzlich die Bilder in `Docs/shots/` neu erzeugen — sonst fasst der Lauf die versionierten Bilder nicht an | Hand |
| `npm run build` | Importauflösung über den echten Bundler | CI |

```sh
npm ci                                     # CI pinnt Node 22, lokal läuft Node 26
npm run dev                                # Vite, bindet auf 127.0.0.1
npm run gate                               # alle Wächter
npm run gate -- --tree                     # nur Hard Caps
npm run gate -- --commits=<base>..<head>   # Commits gegen expliziten Bereich
npm run gate -- --version --base=<sha>     # Version gegen eine Basisrevision
npm run gate -- --docs                     # Metadaten-Pflicht der Doku-Einträge
npm run docs:sync --check                  # Pre-Flight des Doku-Syncs (liest nur)
npm run docs:sync                          # Sync ausführen — im Bot-Workflow
npm run commit:draft                       # Commit-Body-Vorprüfung für gestagete Dateien
npm run verify                             # Abnahmesimulation des Slice in node
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

### 3. Abnahme und Build

```sh
npm run verify
npm run build
```

Ein Fehlpfad fällt nur hier auf, nicht im Gate. `verify` prüft Verhalten im
Node-Prozess, `build` prüft Importauflösung im echten Bundler — es gibt keine
andere Instanz, die einen fehlenden Export bemerkt.

### 4. Commit vorprüfen, dann committen

**Empfohlener Weg: der Draft-Generator.** `npm run commit:draft -- "Betreff"
"Absatz eins" "Absatz zwei"` generiert aus den **gestageten** Dateien einen
regelkonformen Body — Prosa je Datei, das VANNON-Label allein in der letzten
Zeile — und entfernt fremde Footer (`Co-Authored-By`, `Generated with …`,
Bot-Signaturen, `Key: value`-Trailer), bevor sie jemals in einen Commit
gelangen. Die Ausgabe nach `/tmp/commit-msg.txt` schreiben, mit
`git diff --cached --name-only` gegen die Vorprüfung spiegeln, dann aus
derselben Datei committen:

```sh
npm run commit:draft -- "Betreff" "Erster Absatz." "Noch einer." > /tmp/commit-msg.txt
git diff --cached --name-only
git commit -F /tmp/commit-msg.txt
```

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

- **`ci.yml`** — läuft auf Push und PR. Ermittelt eine Basisrevision (PR-Base,
  sonst `before`, sonst `HEAD^`) und fährt danach `gate --version`,
  `gate --tree`, `gate --commits`, `verify:commits`, `verify` und `build`.
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
- **Wer eine Prüfung hinzufügt, hängt sie an einen vorhandenen Einstiegspunkt.**
  `verify-slice.mjs` steht an der Importgrenze. `check-deposits.mjs` hängt
  deshalb an `checkRooting()`, `check-colony.mjs` bündelt Bauen und Beanspruchung
  samt `check-traits.mjs`.

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