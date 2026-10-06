# Governance

Verbindliche Regeln, Pflichten und Zuständigkeiten. Hier steht, **was gilt** —
nicht, wie man es ausführt (das ist [`WORKFLOW.md`](WORKFLOW.md)) und nicht,
warum eine Entscheidung so und nicht anders fiel (das ist
[`ARCHITEKTUR.md`](ARCHITEKTUR.md)).

---

## Der eine Ort

Eine Aussage über dieses Projekt steht genau einmal. Wer sie braucht, folgt dem
Verweis; wer sie ändert, ändert die eine Stelle.

| Aussage | Ort |
| --- | --- |
| Was ein Agent vor **jedem** Commit wissen muss | [`AGENTS.md`](../AGENTS.md) |
| Wie Gate, Abnahme, Version und CI laufen | [`WORKFLOW.md`](WORKFLOW.md) |
| Warum eine Entscheidung so und nicht anders fiel | [`ARCHITEKTUR.md`](ARCHITEKTUR.md) |
| Wohin das Spiel überhaupt baut | [`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md) |
| Welche Regeln und Pflichten gelten | dieses Dokument |
| Welche Fehler bereits einmal zugeschlagen haben | [`PITFALLS.md`](PITFALLS.md) |
| Was als Nächstes gebaut wird | [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md) |
| Was sich in einer Version geändert hat | [`CHANGELOG.md`](CHANGELOG.md) |
| Was geliefert wurde, mit Metadaten | [`CHECKPOINTS.md`](CHECKPOINTS.md) |
| Die offenen Fragen eines Features, **bevor** Code entsteht | `Docs/<feature>-PLAN.md` |
| Versionsnummer, verbindlich | `version.lock.json` |
| Wie viele Prüfungen `npm run verify` fährt | der Lauf selbst — **nicht** in einen Text geschrieben |

**Die Verweise sind keine Volltextkopien.** Wer den **Wert** oder den
**Wortlaut** einer Regel in zwei Dateien findet, hat einen Fehler gefunden: eine
der beiden stirbt. Vor dem Schreiben in eine bestehende Datei gehört die Frage
gestellt: Steht das schon woanders?

### Warum das keine Fleißarbeit ist

Eine Kopie des Regelwerks läuft still auseinander — nicht mit einem Fehler,
sondern mit zwei Wahrheiten. Die CI prüft immer nur das Original, also gewinnt
das Original, und die Kopie verfällt zu Folklore, die jemand in drei Monaten
ernst nimmt. Diese Dokumente sind aus genau diesem Grund kurz.

---

## Regeln

### Sprache

Commit-Bodies und Code-Kommentare auf **Deutsch**, Code-Bezeichner auf
**Englisch**. Das ist kein Widerspruch: Der Kommentar erklärt das *Warum* für
Menschen, der Bezeichner ist Maschinensprache für den Refactor.

### Stil

Zwei Leerzeichen, kein Semikolon am Zeilenende, einfache Quotes. Es ist kein
Formatter konfiguriert — der Stil folgt dem Bestehenden, und das Bestehende
ist die Norm. Ein Einrückungsfehler bleibt unentdeckt, bis jemand die Datei
liest; das ist ein Argument dafür, dass eine Datei kurz genug bleibt, um sie zu
lesen, nicht dafür, das Prüfen aufzugeben.

Fakten liegen als eingefrorene Konstanten-Objekte (`TILE_KIND`,
`STONE_RARITY`, `HARD_CAPS`, `BUILDING_DEFS`, …) in `*-config.js` beim Entity —
nie als Magic Strings im Komponenten- oder Reducer-Code. Jede Zeit und jedes
Tuning steht an genau einer Stelle, damit die Abnahme gegen die Config prüfen
kann statt gegen gerundete Zahlen.

### Importrichtungen

Die Schichten von `src/` haben eine Richtung, und sie steht als Tabelle in
`scripts/lib/import-rules.mjs`: `domain` importiert nur `domain`, `state`
zusätzlich `domain`, `world` zusätzlich `state`, `ui` zusätzlich `world`, `app`
alles darunter. Fail-closed — was nicht in der Tabelle steht, ist verboten.
Jeder nicht-relative Specifier ist in `domain` verboten und sonst auf `react`,
`react-dom` und `react/jsx-runtime` begrenzt; ein Ziel außerhalb von `src/` ist
in jeder Schicht ein Verstoß. Zwei Türen sind mitgeprüft, weil sie sonst offen
blieben: ein dynamisches `import()` zählt wie ein statischer Import, und ein
Verzeichnis unter `src/`, das keine Schicht ist, ist selbst ein Verstoß — eine
neue Schicht braucht eine Zeile in der Tabelle, nicht nur einen Ordner.

Die Tabelle ist ein **Abbruchgrund im Gate**, kein Prüfbericht: `npm run gate`
liest dieselbe Funktion wie die Gruppe `imports` (Block *Importrichtungen*,
einzeln `npm run gate -- --imports`). `scripts/verify/check-imports.mjs` lässt
jede der acht verbotenen Kanten an einer erfundenen Kante fallen und prüft
danach den echten Baum: eine Importregel ohne einen Fall, der sie bricht, ist
eine Behauptung.

### Hard Caps

Jede Datei unter `src/` und `scripts/` — `.js`, `.jsx`, `.mjs` **und** `.css`:

| Cap | Wert |
| --- | --- |
| Codezeilen pro Datei | 300 (Kommentar- und Leerzeilen fallen heraus) |
| Importzeilen pro Datei | 7 |
| Parameter pro benannter Funktion | 3 |
| LOC pro benannter Funktion | 30 |
| Kommentarzeilen pro Datei, `src/` | 1 — nur der `@doc`-Pointer, siehe *Kommentar-Cap und Spiegel-Doku* |
| Kommentarzeilen pro Datei, `scripts/` und `tools/` | 5 |

Die Werte stehen als `HARD_CAPS` im Gate-Skript, die Tabelle hier ist die
einzige abschriftliche Fassung — `AGENTS.md` verweist auf sie, statt sie zu
wiederholen. Drei Details, die man kennen muss:

- **Imports zählen als Zeilen**, nicht als Symbole. Ein mehrzeiliger
  `import { … }`-Block ist eine Zeile; zwei getrennte Statements sind zwei.
- **Die Parameter-Grenze zählt Kommas auf oberster Ebene.** `f(a, b, c, d)`
  fällt durch, `f({ a, b, c, d })` nicht. Der Ausweg ist ein Objekt-Parameter.
- **Dokumentation ist ausgenommen.** Diese Dateien unterliegen keinem Cap.

Wer mehr erklären will, schreibt es nach `ARCHITEKTUR.md`. Fünf Zeilen bedeuten
keine Zensur, sondern einen Indikator: Wer für drei Datenbauten fünfzehn
Kommentarzeilen braucht, hat zu viel Logik in eine Datei gelegt.

### Kommentar-Cap und Spiegel-Doku

Der Kontext des Codes steht **nicht im Code**. Jede Datei unter `src/` trägt
höchstens **eine** Kommentarzeile, und die ist ausschließlich ein Metadaten-
Pointer auf die Spiegel-Doku:

```js
// @doc: docs/daten/<domain>/<name>.md#<name>
```

Fließtext, Inline-Erklärungen, `TODO` und Blockkommentare führen über
`npm run gate -- --spiegel` zum CI-Abbruch. Die Spiegel-Datei unter
`docs/daten/` ist die einzige Erklärstelle und selbst gedeckelt:

| Cap | Wert |
| --- | --- |
| Kommentarzeilen pro src-Modul | 1 (nur der `@doc`-Pointer) |
| Zeilen pro Spiegel-Doku | 80 — der SRP-Trigger |
| Mindestinhalt pro Spiegel-Doku | 4 gefüllte Zeilen, höchstens 100 Zeichen je Zeile |
| `## Verantwortung` | echter Inhalt — nie nur der `@doc`-Pointer |
| Code-LOC pro Modul | 300 (unverändert, siehe Tabelle oben) |

**Der Inhalts-Check:** `## Verantwortung` trägt den Kommentartext des Moduls.
Besteht der Abschnitt nur aus dem Pointer, ist die Spiegel-Datei eine
Wegweisung ohne Weg — der Modultext existiert dann nirgends mehr, nur noch in
der Git-Historie. `npm run gate -- --spiegel` weist das mit einer Zeile ab.

**Der Architektur-Trigger:** Reichen 80 Zeilen nicht, um ein Modul zu
erklären, ist nicht die Doku zu stauchen (`Anti-Squash`: das Gate misst die
längste Zeile und verlangt Mindestinhalt — komprimierter Text fällt auf).
Das Modul trägt mehr als eine Verantwortung und wird in kleinere
Sub-Module gespalten, jede mit eigener Spiegel-Doku. **Terminierung:** Der
Gate ist ein Zustandsprüfer, kein Generator — eine Spaltung erzeugt n neue
Dateien mit n Docs von je höchstens 80 Zeilen; jede weitere Spaltung
verkleinert den übertretenden Umfang strikt, also endet der Prozess.

**Migration bestehender Kommentare** ist mechanisch
(`node tools/spiegel-migrate.mjs`): Kommentare wandern wortgetreu unter
`## Verantwortung` der Spiegel-Datei, der Code behält den Pointer. Kommentare
sind zur Laufzeit inert — die Abnahme (`npm run verify`) beweist, dass kein
Verhalten kippt.

**Nach der Migration ist `docs/daten` eine Quelle, keine Ausgabe.** Der
Migrator überschreibt deshalb nie eine Spiegel-Datei, die echte Prosa trägt,
und ein zweiter Lauf liefert dieselben Bytes — er schreibt nur neu, was keine
Prose hat oder nur den Pointer. Zwei Fehler waren hier teuer und beide sind
gemessen: Ein früherer `--fresh`-Schalter löschte den ganzen Baum und erzeugte
ihn aus den bereits migrierten Quellen neu, wodurch 479 Kommentarzeilen nur
noch im Git des Vor-Migrations-Commits existierten; und `proseOf()` hielt den
Pointer für Prosa, sodass ein zweiter Lauf die Adresse als Erklärung
zurückschrieb. Wer nach der Migration die Prosa verliert, holt sie mit
`git checkout <vor-migration> -- src` und einem erneuten Lauf zurück.

**Drift-Regel:** Wird eine src-Datei im Änderungsbereich berührt, wandert
ihre Spiegel-Datei im selben Bereich mit — das Gate vergleicht die Pfade
des Diffs (`--base=<ref>`), fail-closed. Der Vergleich liest `git diff`
und sieht ungetrackte Dateien nicht: frisch erzeugte Spiegel-Dokumente
fallen lokal erst nach `git add` unter, in der CI ohnehin nie, weil dort
alles committed ist. Wer vor dem Commit `git add docs/daten src` vergisst,
sieht 160 Fehlalarme statt eines echten Befunds.

### Commit-Policy

Hart, per Gate erzwungen, geprüft von `scripts/lib/commit-rules.mjs` und
durchgesetzt von `scripts/ci-gate.mjs`. **Das ist der Wortlaut-Ort:** der
VANNON-Satz steht hier und sonst nirgends im Repository, damit ihn niemand
umbenennen kann, ohne dass eine zweite Wahrheit zurückbleibt.

- Betreff **maximal 72 Zeichen**.
- Body **100 bis 1000 Wörter**, gezählt wird die **eigene** Prosa: das
  Pflicht-Label und die maschinelle Dateiliste (`Geaendert wurden …`) zählen
  nicht mit. Sonst wäre die Obergrenze eine Funktion der Commit-Größe — eine
  Migration über 320 Dateien käme allein an ihren Pfaden über die 1000 Wörter
  und könnte gar nicht mehr erfüllt werden. Die Mindestlänge gilt neben einer
  langen Liste unverändert weiter, das prüft `verify-commit-gate.mjs`.
- **Jede geänderte Datei muss namentlich im Body vorkommen** — vollständiger
  Pfad, nicht der Ordnername. `src/x.js` zählt, `src/` nicht.
- **Kein Commit allein aus generierten Bildern.** Besteht ein Commit
  ausschließlich aus Dateien unter `Docs/shots/`, wird er abgewiesen: die Bilder
  entstehen bei jeder Abnahme und würden den Code-Commit verdecken. Ein Bild
  darf mit echten Änderungen mitgehen, allein nicht.
- Letzte nichtleere Body-Zeile, **exakt einmal**:
  `created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.`
- Verboten sind: `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`,
  `Generated with …`, Footer-Trenner (`---`) und generische `Key: value`-Trailer.
  Kein anderer Footer ersetzt das VANNON-Label. Dateien also in Prosa nennen,
  selbst wenn das den Body länger macht.
- Zeilen, die auf `codebuff`, `copilot`, `claude` oder `cursor` enden, gelten
  als Bot-Signatur.

Der Body ist das Memory. In drei Monaten erinnerst du dich nicht, warum du
diese eine Zeile in `rooting.js` geändert hast — der Body schon, und das Gate
zwingt dich, ihn zu schreiben.

**Die Signaturpflicht gilt für Hand-Commits, nicht für den Versions-Bot.**
`.github/workflows/auto-bump.yml` committet als `github-actions[bot]` und ist
deshalb unsigniert; `git log --show-signature -1` zeigt `N`. Das bleibt so: Ein
Bot, der sich als Mensch ausgibt, ist nicht prüfbar, sondern nur behauptet — und
der persönliche Signaturschlüssel gehört nicht in `GITHUB_TOKEN`. Hand-Commits
zeigen `G`. Der Bot ist deshalb auch **nicht** von der Commit-Policy
ausgenommen: Er schreibt regelkonform, Label in eigener Zeile, die Spiegel-
und Doku-Dateien namentlich, genug Wörter — und `scripts/verify/check-workflow.mjs`
prüft das bei jedem `npm run verify`. Der Grund: Bot-Commits lösen mit
`GITHUB_TOKEN` keine CI aus, ein Verstoß bliebe also unentdeckt, bis jemand die
Range über einen Bot-Commit zieht.

**Die Signaturpflicht ist geprüft, nicht behauptet.** `classifySignature` in
`scripts/lib/commit-rules.mjs` bewertet jeden Commit des geprüften Bereichs,
`scripts/ci-gate.mjs` hängt das Urteil an die Commit-Regeln, und
`npm run verify:commits` testet die Bewertung selbst. Ein Nicht-Bot-Commit ohne
Signatur ist ein Gate-Verstoß, und der Hinweis nennt die Reparatur
(`git config commit.gpgsign true`).

**Gemessen wird das Commit-Objekt, nicht das Urteil der Maschine.** `%G?`
liefert ohne Schlüsselbund `N` — auch für korrekt signierte Commits; auf diesem
Rechner ist genau das der Fall, weil eine `gpg.ssh.allowedSignersFile` fehlt.
Eine Regel, die darauf baut, würde echte Signaturen verurteilen. Geprüft wird
deshalb das Vorhandensein des `gpgsig`-Kopfes im Commit-Objekt; das gilt für
GPG und SSH und braucht weder Netz noch Schlüssel. Ob die Signatur einem
bekannten Schlüssel zugeordnet werden kann, ist eine **zweite** Frage — sie
beantwortet `git log --show-signature`, und wer `G` statt `N` sehen will,
hinterlegt seinen Schlüssel und die Signer-Datei.

### Globale Versionierung

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel und werden **nur** über
`npm run version:bump` geändert. Die `revision` steigt pro Versionserhöhung um
genau 1.

```sh
npm run version:bump -- patch     # auch minor | major
npm run version:check              # Lock vs. Spiegel
```

Parallele Branches bearbeiten denselben Lock und erzeugen bei konkurrierenden
Versionsänderungen deshalb einen Merge-Konflikt statt unbemerkter Divergenz.

Die einzige Ausnahme von der Monotonie gibt es: eine **ausdrückliche Rücknahme
einer Fehlbenennung**, als `amends` im Lock. `versionTransitionViolations`
lässt einen Rückschritt nur durch, wenn `amends` exakt der Basisstand ist.

Bleibt die Version stehen, muss auch die `revision` stehen bleiben. Regel- und
Doku-Commits brauchen deshalb keinen Bump — ihr Eintrag wandert trotzdem als
`fix` in die Checkpoints.

### Doku-Sync: nur er bewegt

Die zwei Doku-Artefakte sind [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md) (offene
Checkliste) und [`CHECKPOINTS.md`](CHECKPOINTS.md) (Historie). Jeder Eintrag
trägt einen Metadaten-Block — Status, Scope, Kategorie, Version, Datum; der
Wortlaut steht im Metadaten-Vertrag der Checkpoints. **Der Doku-Sync
(`scripts/docs-sync.mjs`) ist die einzige Stelle, die Einträge zwischen den
Dokumenten bewegt oder einen Platzhalter auf die Liefer-Version stampft.**
Ein Hand-Edit, der dieselbe Arbeit tut, kämpft mit dem Bot um dieselben Zeilen.

Der Ablauf im Versionier-Workflow: pre-flight (`--check`, fail-closed) vor
jedem Schreiben, dann Bump, dann Sync, dann Commit. Ein invalider
Metadaten-Block stoppt den Bump, statt halb synchronisierte Doku zu
committen — die Version bleibt stehen, und der Lauf sagt, welcher Eintrag
meckert.

---

## Dokumentationspflicht

### Der Satz, der alles trägt

**Wer eine Entscheidung ändert, ändert ihre Begründung im selben Commit mit.**
Kommentare sind auf fünf Zeilen pro Datei gedeckelt und tragen nur noch den
Kopf; alles, was darüber hinaus erklärt werden muss, steht hier — sonst weiß in
drei Monaten niemand mehr, warum die Dinge so liegen.

### Was wann wohin

| Wenn du … | dann schreibst du in |
| --- | --- |
| etwas **entschieden** hast (auch wenn es klein ist) | `ARCHITEKTUR.md`, mit dem Warum |
| etwas **gemessen** und es verändert hat | `ARCHITEKTUR.md` (Messung) **und** `ROADMAP_OPEN.md` (Eintrag) |
| etwas **fertig** gemacht hast | Häkchen in `ROADMAP_OPEN.md` — der Doku-Sync bewegt den Eintrag in die `CHECKPOINTS.md` |
| etwas **gebrochen** hast, das jemand anders treffen kann | `PITFALLS.md`: Symptom, Ursache, Gegenprobe |
| eine **Regel** geändert hast | dieses Dokument |
| einen **Prozess** geändert hast | `WORKFLOW.md` |
| eine **Version** ausgeliefert hast | `CHANGELOG.md` |

Ein Vorgang, der eine Vorgabe des Auftraggebers berührt und deshalb erst
entschieden werden muss, gehört **vor** dem Code in ein eigenes Plan-Dokument
unter `Docs/`. Solange die Frage offen ist, steht sie dort und nicht in einer
Konfigurationsdatei.

### Die drei Pflichten im einzeln

1. **Dokupflicht.** Jeder abgeschlossene Task berührt `ROADMAP_OPEN.md` im selben
   Commit — fertiges bekommt ein Häkchen, **der Eintrag bleibt bis zum Sync
   stehen**. Erledigtes wird nicht von Hand gelöscht: Der Doku-Sync ist der
   einzige Mover zwischen Open-Dokument und Checkpoints. Ein Eintrag ohne
   gültigen Metadaten-Block (Status, Scope, Kategorie, Version, Datum) bleibt
   liegen und fällt im Gate rot auf — `npm run docs:sync --check` ist der
   Pre-Flight vor jedem Schreiben, und der Bot lässt einen Bump mit invaliden
   Einträgen gar nicht erst zu.
2. **Vorsicht mit verschobenen Punkten.** „Muss später" ist kein Feature, das
   ist ein Schuldenposten. Verschobenes wird verschoben markiert, nicht
   umsortiert und so getan, als wäre es immer so gewesen. Ändert sich die
   Reihenfolge, wird sie kurz begründet.
3. **Sorgfaltspflicht vor dem Behaupten.** Kein Satz über dieses Projekt ohne
   Befehl dahinter. Kein „sollte funktionieren", kein „ich glaube". Der Satz
   lautet oder er fällt raus.

### Was nicht dokumentiert wird

Absichten ohne Code sind Luft. `ROADMAP_OPEN.md` ist Absicht und Pflichtdoku,
aber kein Feature-Forum und kein Wunschzettel. Wer eine Idee einbringen will,
bringt einen Task mit, der sie umsetzt, und trägt sie danach ein. Was geliefert
wurde, steht in `CHECKPOINTS.md` — die zwei Dokumente teilen sich die Arbeit,
und nur der Sync bewegt zwischen ihnen.

---

## Sorgfaltspflicht

Die Abwechslung ist Absicht: Das Gate ist billig und grob, `verify` ist
teuer und fein, und die Lücke dazwischen muss von Hand geschlossen werden.

### Messe, bevor du behauptest

Jede Zahl in diesen Dokumenten ist entweder gemessen oder entfernt. Es gibt
keine gerundeten, geschätzten oder von früheren Läufen übernommenen Werte mehr.
Wenn eine Zahl nicht mit einem Befehl reproduzierbar ist, gehört sie nicht in
die Doku, sondern in einen Kommentar im Commit-Body.

Konkret heißt das: **Die Zahl der Abnahmeprüfungen wird nirgends abgeschrieben.**
`npm run verify` schreibt sie in die letzte Zeile; wer sie zitiert, zitiert den
letzten Lauf. Ein Text, der „N Prüfungen" behauptet, ist ab dem nächsten
Commit falsch — und zwar still.

### Zieh die Literale mit

Das ist der teuerste Fehler im Repo und der, der am längsten unentdeckt bleibt:
**Abgeschriebene Zahlen in Prüfungen bleiben grün, während die Regel kippt.**
Wer `deposit-config.js` ändert, muss die Erwartung in `check-deposits.mjs`
mitziehen. Besser ist es, sie aus der Config abzuleiten — deshalb liest
`check-start.mjs` die erwartete Hive-Fläche aus `world.hiveSize`, und nicht aus
einer eigenen 4. Ein `==`-Vergleich, der auf die Konstante zurückgreift, die er
gerade prüft, prüft nichts.

### Eine Regel pro Ort, nicht eine Ausnahme und eine Ausnahme

Kein „hier einmal der Sonderfall". Der Spawn-Anker kommt aus `spawnTile()` in
`src/state/selectors.js`; Reducer *und* Work-State lesen ihn. `HINTS[state]` hat
kein `??`, weil die Tabelle total sein muss und ein fehlender Eintrag auffallen
soll, nicht still zurückfallen. Ein Zeitplan wird an **einer** Stelle entschieden,
nicht in jeder Uhr: was ein Takt tut, steht in der Domäne; Browser- und
Node-Uhr fragen nur noch.

Das gilt für den Code genauso wie für diese Dokumente: eine zweite Kopie einer
Regel ist kein Redundanz-Bonus, sie ist eine zweite Wahrheit.

### Führe die Gegenprobe

Eine Prüfung, die grün ist, beweist nichts, solange niemand gesehen hat, dass sie
rot wird. Zu jeder Behauptung gehört der Sabotage-Versuch: Regel oder Verdrahtung
entfernen, die **betroffene Prüfgruppe einzeln** laufen lassen
(`node --input-type=module -e "…"` mit `scripts/verify/check-*.mjs`, siehe
*Die Testlaufzeit* in [`WORKFLOW.md`](WORKFLOW.md)), notieren, welche Prüfungen
fallen. Fallen keine, prüft die Prüfung nichts. Der Gegenbeweis ist der
eigentliche Ergebnisbericht — „grün" allein ist eine Behauptung.

Aus demselben Grund ist ein Fehlpfad des **Builds** ernst zu nehmen: Rollup
findet einen fehlenden Export beim Auflösen und stirbt. Unter
`npm run verify` fällt so etwas nicht auf, weil der Zustand im Test gesetzt
wird. `npm run build` ist die einzige Instanz, die einen toten Import überhaupt
bemerkt.

### Der Versions-Bot wird mitgeprüft

`check-workflow.mjs` prüft bei jedem `npm run verify`, dass der Versions-Bot
seine Commit-Policy einhält. Das ist nicht Paranoia: Bot-Commits lösen keine CI
aus, also fällt ihr Verstoß erst auf, wenn jemand die Range über sie zieht.

---

## Zuständigkeit

| Wer | entscheidet |
| --- | --- |
| Der Auftraggeber | die gestalterischen Vorgaben, die nicht verhandelbar sind |
| Das Gate | Form, nicht Inhalt: Importrichtungen, Cap-Verletzungen, Versionsspringen, Commit-Verstöße |
| `npm run verify` | Verhalten der Domäne, deterministisch und ohne Browser |
| Der Autor eines Tasks | ob er fertig ist — und ob er es **belegen** kann |

Die **Importrichtung zwischen den Ebenen** ist seit dem 2026-10-06 keine
Konvention mehr, sondern ein Abbruchgrund im Gate (siehe *Importrichtungen*). Was weiterhin
Konvention ist: die Sorgfalt in einer Config-Änderung und die Frage, ob ein
Häkchen in der Roadmap zu Recht steht. Diese Lücke ist gewollt und heißt nicht,
dass sie irgendwo hingehört — sie heißt Sorgfalt.