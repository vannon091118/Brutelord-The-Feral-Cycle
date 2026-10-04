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
| Welche Regeln und Pflichten gelten | dieses Dokument |
| Welche Fehler bereits einmal zugeschlagen haben | [`PITFALLS.md`](PITFALLS.md) |
| Was als Nächstes gebaut wird | [`ROADMAP.md`](ROADMAP.md) |
| Was sich in einer Version geändert hat | [`CHANGELOG.md`](CHANGELOG.md) |
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

### Hard Caps

Jede Datei unter `src/` und `scripts/` — `.js`, `.jsx`, `.mjs` **und** `.css`:

| Cap | Wert |
| --- | --- |
| Codezeilen pro Datei | 300 (Kommentar- und Leerzeilen fallen heraus) |
| Importzeilen pro Datei | 7 |
| Parameter pro benannter Funktion | 3 |
| LOC pro benannter Funktion | 30 |
| Kommentarzeilen pro Datei | 5 |

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

### Commit-Policy

Hart, per Gate erzwungen, geprüft von `scripts/lib/commit-rules.mjs` und
durchgesetzt von `scripts/ci-gate.mjs`. **Das ist der Wortlaut-Ort:** der
VANNON-Satz steht hier und sonst nirgends im Repository, damit ihn niemand
umbenennen kann, ohne dass eine zweite Wahrheit zurückbleibt.

- Betreff **maximal 72 Zeichen**.
- Body **100 bis 1000 Wörter**, ohne das Label.
- **Jede geänderte Datei muss namentlich im Body vorkommen** — vollständiger
  Pfad, nicht der Ordnername. `src/x.js` zählt, `src/` nicht.
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
ausgenommen: Er schreibt regelkonform, Label in eigener Zeile, die vier
Spiegeldateien namentlich, genug Wörter — und `scripts/verify/check-workflow.mjs`
prüft das bei jedem `npm run verify`. Der Grund: Bot-Commits lösen mit
`GITHUB_TOKEN` keine CI aus, ein Verstoß bliebe also unentdeckt, bis jemand die
Range über einen Bot-Commit zieht.

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
Doku-Commits brauchen deshalb keinen Bump — ihr Roadmap-Eintrag darf trotzdem
als erledigt unter der nächsten Section stehen.

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
| etwas **gemessen** und es verändert hat | `ARCHITEKTUR.md` (Messung) **und** `ROADMAP.md` (Eintrag) |
| etwas **fertig** gemacht hast | `ROADMAP.md`: Häkchen setzen, Eintrag stehen lassen |
| etwas **gebrochen** hast, das jemand anders treffen kann | `PITFALLS.md`: Symptom, Ursache, Gegenprobe |
| eine **Regel** geändert hast | dieses Dokument |
| einen **Prozess** geändert hast | `WORKFLOW.md` |
| eine **Version** ausgeliefert hast | `CHANGELOG.md` |

Ein Vorgang, der eine Vorgabe des Auftraggebers berührt und deshalb erst
entschieden werden muss, gehört **vor** dem Code in ein eigenes Plan-Dokument
unter `Docs/`. Solange die Frage offen ist, steht sie dort und nicht in einer
Konfigurationsdatei.

### Die drei Pflichten im einzeln

1. **Dokupflicht.** Jeder abgeschlossene Task berührt `ROADMAP.md` im selben
   Commit — fertiges bekommt ein Häkchen, **der Eintrag bleibt stehen**.
   Erledigtes wird nie gelöscht; gelöschte Zeilen lesen sich nach drei Monaten
   wie eine gelogene Wunschliste. Eine geplante Version, die sich als falsch
   erwies, wird *begründet* stehen gelassen — nicht, damit die Lücke
   verschwindet, sondern damit sie jemand anderes nicht macht.
2. **Vorsicht mit verschobenen Punkten.** „Muss später" ist kein Feature, das
   ist ein Schuldenposten. Verschobenes wird verschoben markiert, nicht
   umsortiert und so getan, als wäre es immer so gewesen. Ändert sich die
   Reihenfolge, wird sie kurz begründet.
3. **Sorgfaltspflicht vor dem Behaupten.** Kein Satz über dieses Projekt ohne
   Befehl dahinter. Kein „sollte funktionieren", kein „ich glaube". Der Satz
   lautet oder er fällt raus.

### Was nicht dokumentiert wird

Absichten ohne Code sind Luft. `ROADMAP.md` ist Absicht und Pflichtdoku, aber
kein Feature-Forum und kein Wunschzettel. Wer eine Idee einbringen will,
bringt einen Task mit, der sie umsetzt, und trägt sie danach ein.

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
entfernen, `npm run verify` laufen lassen, notieren, welche Prüfungen fallen.
Fallen keine, prüft die Prüfung nichts. Der Gegenbeweis ist der eigentliche
Ergebnisbericht — „grün" allein ist eine Behauptung.

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
| Das Gate | Form, nicht Inhalt: Cap-Verletzungen, Versionsspringen, Commit-Verstöße |
| `npm run verify` | Verhalten der Domäne, deterministisch und ohne Browser |
| Der Autor eines Tasks | ob er fertig ist — und ob er es **belegen** kann |

Was das Gate nicht prüft, ist Konvention: die Importrichtung zwischen den
Ebenen, die Sorgfalt in einer Config-Änderung, die Frage, ob ein Häkchen in der
Roadmap zu Recht steht. Diese Lücke ist gewollt und heißt nicht, dass sie
irgendwo hingehört — sie heißt Sorgfalt.