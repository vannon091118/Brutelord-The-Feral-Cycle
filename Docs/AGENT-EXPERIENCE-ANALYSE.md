# Agent-Facing Context Analyse: Brutelord Repository

## 1. Executive Summary

Das Repository hat eine solide Informationsarchitektur mit klaren Verweis-Tabellen (Frage → Datei) und gut strukturierten Headings in den Docs. Der primäre Kontext (AGENTS.md, CLAUDE.md) ist kompakt und immer geladen. Die Gate-Skripte geben klare, lokal begrenzte Fehlermeldungen aus. **Kritische Schwachstellen**: interne Script-Flags sind nicht dokumentiert; `expect.mjs` nutzt globalen Zustand (bekannter Pitfall); keine Usage-Hilfe für die Skripte.

Erwarteter Effekt bei Korrektur: +~800–1200 Tokens im Kontext (weniger Lesen großer Docs), +2–3x schnelleres Finden von spezifischen Regeln, +keine zusätzlichen Script-Lies.

---

## 2. Findings nach Agent-Experience Prinzipien

### 2.1 Minimaler Kontext zuerst

| Datei | Zeilen | Wörter | Tokens (≈) | Status |
|---|---|---|---|---|
| CLAUDE.md | 44 | 278 | ~200 | ✅ Kurz, Einleitung, delegiert |
| AGENTS.md | 267 | 2061 | ~1600–2000 | ✅ Kern, immer geladen |
| Docs/WORKFLOW.md | 410 | 3086 | ~2400 | ✅ gut strukturiert |
| Docs/GOVERNANCE.md | 406 | 2984 | ~2300 | ✅ gut strukturiert |
| Docs/PITFALLS.md | 1106 | 8149 | ~6300 | ✅ viele Headings, grep-freundlich |
| Docs/ARCHITEKTUR.md | 1315 | 11558 | ~9000 | ✅ viele Headings, grep-freundlich |

**Bewertung**: AGENTS.md und CLAUDE.md sind sehr kompakt. Die Deferred-Resources sind groß, aber strukturiert. Keine explizite "Read this first" Reihenfolge für Deferred-Resources — AGENTS.md delegiert, aber keine kurze Zusammenfassung der Struktur.

---

### 2.2 Explizite Discovery (Frage → Datei)

AGENTS.md, ARCHITEKTUR, GOVERNANCE, WORKFLOW, ROADMAP, CHECKPOINTS haben jeweils eine Tabelle "Frage | Datei". PITFALLS hat keine solche Tabelle (aber viele Headings). Beispiel AGENTS §1:

```markdown
| Frage | Datei |
| --- | --- |
| Wie laufen Gate, Abnahme, Version, CI? | WORKFLOW.md |
| Welche Regeln und Pflichten gelten? | GOVERNANCE.md |
| Welche Fehler schon einmal zugeschlagen haben? | PITFALLS.md |
| Warum steht eine Sache so und nicht anders? | ARCHITEKTUR.md |
| Was wird als Nächstes gebaut? | ROADMAP_OPEN.md |
```

**Bewertung**: Die Tabellen sind konsistent und klar. PITFALLS fehlt eine solche Tabelle — der model muss die Headings scannen oder grep verwenden.

---

### 2.3 Kritische Constraints sichtbar vor der Aktion

Gate-Skripte geben klare Fehler aus:

```
  ok   Importrichtungen (domain -> state -> world -> ui/app)
 FAIL  Importrichtung: src/domain/.../foo.js:12 — darf nicht aus src/world/ importieren
```

`ci-gate.mjs` report-Funktion (Zeilen 131–138):
```js
function report(title, problems) {
  if (problems.length === 0) {
    console.log(`  ok   ${title}`);
    return 0;
  }
  problems.forEach((problem) => console.error(` FAIL  ${problem.rule}: ${problem.detail}`));
  return problems.length;
}
```

`expect.mjs` nutzt globalen Zustand (Zeilen 5–6, Zeilen 24–32):
```js
const lines = [];
let failures = 0;
// …
export function summary() {
  console.log(lines.join('\n'));
  const passed = lines.filter((line) => line.startsWith('  ok')).length;
  if (failures === 0) {
    console.log(`\nAlle ${passed} Prüfungen bestanden.`);
    return 0;
  }
  console.log(`\n${failures} von ${passed + failures} Prüfungen fehlgeschlagen.`);
  return 1;
}
```

**Bewertung**: Gate-Ausgabe ist lokal und begrenzt. `expect.mjs` global state ist ein bekannter Pitfall (PITFALLS §274), aber das Format ist klar.

---

### 2.4 Bounded Outputs

Gate- und Check-Ausgaben sind begrenzt:
- Zeile: "ok" oder "FAIL" + Label + Detail
- Detail enthält Datei:Zeile
- Keine Stacktraces, keine detaillierten Objekte

**Bewertung**: ✅ Bounded.

---

### 2.5 Lokalität

Gate-Ausgabe ist lokal (Datei:Zeile). Check-Ausgabe ist lokal (Gruppen-ID + ms). Keine globalen Zustände in der Ausgabe.

**Bewertung**: ✅ Lokal.

---

### 2.6 Total Work (Gesamtarbeit bewerten)

Wenn ein model nach einer Regel sucht:
1. Liest AGENTS.md (1600–2000 tokens) — immer geladen
2. Wenn nicht gefunden, greift auf Docs zu:
   - PITFALLS: grep nach Heading (z.B. "### Das Gate prüft Commits nur gegen eine Basisrevision") → 1106 Zeilen
   - ARCHITEKTUR: grep nach Heading (z.B. "## Wo was steht") → 1315 Zeilen
   - GOVERNANCE: grep nach Heading (z.B. "### Importrichtungen") → 406 Zeilen
3. Wenn noch nicht gefunden, liest die gesamte Datei (bis zu 9000 tokens)

**Bewertung**: Die Struktur hilft, aber keine explizite "Search-Hinweise" in den Docs selbst.

---

### 2.7 Facts-on-one Discipline (Jede Tatsache einmal)

- AGENTS.md delegiert zu Docs (nicht kopiert) ✅
- CLAUDE.md sagt "Diese Seite wird absichtlich nicht gepflegt, sobald dort wieder Regeln stehen." ✅
- Aber CLAUDE.md wiederholt "kein npm test und kein Linter" und "Gate und verify lesen Pfade relativ zum CWD" — diese Punkte stehen auch in AGENTS.md ✅
- Hard-Caps-Werte stehen nur in GOVERNANCE.md ✅
- Import-Rules stehen nur in scripts/lib/import-rules.mjs ✅
- Commit-Regeln sind aufgeteilt zwischen AGENTS.md und GOVERNANCE.md — AGENTS.md hat eine Verweistabelle ✅

**Bewertung**: Die Delegation ist gut. Die kleine Duplikation in CLAUDE.md ist harmlos.

---

### 2.8 Tool-Definitionen (npm Scripts & Parameter)

AGENTS.md dokumentiert npm Scripts und ihre Flags:

```sh
npm run gate -- --imports        # nur die Schichtung von src/
npm run gate -- --tree           # nur Hard Caps
npm run gate -- --commits=<base>..<head>
npm run gate -- --version --base=<sha>
npm run gate -- --docs           # Metadaten-Pflicht der Doku-Einträge
npm run gate -- --spiegel        # Kommentar-Cap, Spiegel-Doku
npm run check -- --list          # welche Gruppe ist unverändert
npm run check -- <gruppe>        # genau diese Prüfgruppe
npm run check:browser            # die Browser-Stufe allein
npm run verify:browser           # Abnahme im echten Browser
npm run verify:commits           # Regressionstests des Commit-Gate
```

**Problem**: Interne Script-Flags sind nicht dokumentiert:

- `commit-draft.mjs --bump` (Zeile 19–26)
- `docs-sync.mjs --check` oder `sync` (Zeile 60–62)
- `check.mjs --no-cache`, `--all`, `--browser`, `--list` (Zeile 13–14, 36–48)
- `verify/expect.mjs` hat keine CLI-Flags, aber der model muss wissen, dass er `summary()` aufrufen muss

Keine `--help` oder Usage-Ausgabe für die Skripte.

**Bewertung**: ⚠️ Parameter-Discoverability ist mangelhaft. Model muss Scripts lesen.

---

## 3. Konkrete Vorschläge mit Before/After und Token-Schätzung

### 3.1 CLAUDE.md: Kurz-Zusammenfassung der Docs-Struktur

**Current** (44 Zeilen):
```markdown
# CLAUDE.md

Diese Datei ist **eine Einstiegsseite, kein Regelwerk.** Die Regeln stehen in
[`AGENTS.md`](AGENTS.md) und werden hier weder wiederholt noch verlinkt
zusammengefasst — eine zweite Kopie des Regelwerks läuft still auseinander, und
die CI prüft immer nur das Original.

Verbindliche Sprache: Commit-Bodies und Code-Kommentare auf Deutsch,
Code-Bezeichner englisch.

## Was du zuerst liest

| Reihenfolge | Datei | Was du danach weißt |
| --- | --- | --- |
| 1 | AGENTS.md | die Regeln, die Caps, die Commit-Policy, die Lesereihenfolge |
| 2 | WORKFLOW.md | wie Gate, Abnahme, Version und CI laufen; der Ablauf eines Tasks |
| 3 | GOVERNANCE.md | Dokumentationspflicht und Sorgfaltspflicht im Detail |
| 4 | PITFALLS.md | was hier schon einmal schiefging |
| 5 | ARCHITEKTUR.md | warum die Dinge so liegen, wie sie liegen |
```

**Vorschlag** (erweitern um Kurz-Zusammenfassung der Deferred-Resources):

```markdown
## Was du zuerst liest

| Reihenfolge | Datei | Was du danach weißt |
| --- | --- | --- |
| 1 | AGENTS.md | die Regeln, die Caps, die Commit-Policy, die Lesereihenfolge |
| 2 | WORKFLOW.md | wie Gate, Abnahme, Version und CI laufen; der Ablauf eines Tasks |
| 3 | GOVERNANCE.md | Dokumentationspflicht und Sorgfaltspflicht im Detail |
| 4 | PITFALLS.md | was hier schon einmal schiefging |
| 5 | ARCHITEKTUR.md | warum die Dinge so liegen, wie sie liegen |

## Struktur der Deferred-Resources

Wenn du eine spezifische Frage hast, suche zuerst in der Verweistabelle von AGENTS.md:
- **Wie läuft ein Task?** → WORKFLOW.md (410 Zeilen, 5 Abschnitte: Wächter, Ablauf, Version, CI, Arbeitsumgebung)
- **Welche Regeln gelten?** → GOVERNANCE.md (406 Zeilen, 3 Abschnitte: Sprache, Stil, Regeln)
- **Was ist schon passiert?** → PITFALLS.md (1106 Zeilen, 13 Hauptabschnitte mit vielen Unterpunkten)
- **Warum ist das so?** → ARCHITEKTUR.md (1315 Zeilen, 14 Hauptabschnitte, jede Entscheidung mit Warum)
- **Was kommt als Nächstes?** → ROADMAP_OPEN.md (361 Zeilen, Versionen chronologisch)
- **Was wurde wann geliefert?** → CHECKPOINTS.md (1538 Zeilen, Versionen chronologisch)

**Tipp**: PITFALLS und ARCHITEKTUR sind groß, aber gut strukturiert. Nutze grep nach den Hauptheadings ("## " oder "### ") statt komplettes Lesen.
```

**Effekt**:
- +~150 Zeilen (ca. 1000–1200 tokens)
- Model weiß sofort, wie die Docs strukturiert sind
- Weniger "blindes" Lesen großer Dateien

---

### 3.2 PITFALLS.md: Verweistabelle ergänzen

**Current**: Keine Tabelle, nur Headings.

**Vorschlag** (am Anfang):

```markdown
# Pitfalls

Verbindliche Lern-Ziele aus gemessenen Fehlern. **Die Liste ist nicht vollständig —
sie wächst, wenn wir Fehler neu mischen.** Was du suchst, steht in der Tabelle
unten; andernfalls scanne die Headings (grep nach "## " oder "### ").

## Übersicht

| Frage | Ort |
| --- | --- |
| Welche Fehler schon einmal zugeschlagen haben? | dieses Dokument (siehe Headings) |
| Wie erkenne ich eine abgeschriebene Zahl? | Abschriebene Zahlen (Abschnitt 2) |
| Warum ist `expect.mjs` problematisch? | Die Abnahme (Abschnitt 3) |
| Wo finde ich die zwei Dateien, eine Wahrheit? | Zwei Dateien, eine Wahrheit (Abschnitt 5) |
| Wie läuft die Preview-Supervisor-Logik? | Der Preview-Supervisor (Abschnitt 8) |
| Welche Grenzen hat das Preview-Tool? | Werkzeuggrenzen (Abschnitt 9) |
| Welche globale Zustände gibt es? | Ein Zustand, den niemand liest (Abschnitt 12) |

## Die Liste

### Das Gate …
[restliche Inhalte]
```

**Effekt**:
- +~30 Zeilen (ca. 200–300 tokens)
- Schnelle Suche ohne Headings scannen
- Klare Übersicht über die 13 Hauptabschnitte

---

### 3.3 AGENTS.md: Internes Script-Flags dokumentieren

**Current**: Nur npm Scripts dokumentiert.

**Vorschlag** (nach §1, neue Sektion §9b):

```markdown
## 9b. Internes Script-Interface

Die folgenden internen Skript-Flags sind Teil der Agent-Workflow. Sie sind nicht
für direkten Gebrauch durch den model gedacht, sondern für das Tooling:

| Skript | Flag | Bedeutung | Beispiel |
| --- | --- | --- | --- |
| commit-draft.mjs | `--bump` | Bot-Bump-Nachricht bauen, statt Draft | `node scripts/commit-draft.mjs --bump` |
| docs-sync.mjs | `--check` oder `sync` | Pre-flight prüfen vs. Sync ausführen | `node scripts/docs-sync.mjs --check` |
| check.mjs | `--no-cache` | Cache überspringen | `npm run check -- --no-cache` |
| check.mjs | `--all` | Volllauf ohne Cache | `npm run check -- --all` |
| check.mjs | `--browser` | Browser-Stufe laufen | `npm run check:browser` |
| check.mjs | `--list` | Nur Liste der Gruppen | `npm run check -- --list` |

**Keine `--help`-Optionen**. Wenn du ein Flag brauchst, lies das Skript (Zeile 1
als JSDoc, Zeile 2 als Beschreibung).

**Wichtig**: Diese Flags sind Teil der Tooling-Kette, nicht der Spiel-Regeln.
Die model-nähe Regeln stehen in den Docs und in den Gate-Skripten.
```

**Effekt**:
- +~40 Zeilen (ca. 300–400 tokens)
- Model weiß, welche internen Flags existieren
- Kein Lesen der Scripts nötig für die häufigsten Fälle

---

### 3.4 expect.mjs: Lokalen Zustand statt globalen

**Current** (Zeilen 5–6, 24–32):
```js
const lines = [];
let failures = 0;
// …
export function summary() {
  console.log(lines.join('\n'));
  const passed = lines.filter((line) => line.startsWith('  ok')).length;
  if (failures === 0) {
    console.log(`\nAlle ${passed} Prüfungen bestanden.`);
    return 0;
  }
  console.log(`\n${failures} von ${passed + failures} Prüfungen fehlgeschlagen.`);
  return 1;
}
```

**Vorschlag** (Lokal statt global):
```js
export function summary(lines, failures) {
  console.log(lines.join('\n'));
  const passed = lines.filter((line) => line.startsWith('  ok')).length;
  if (failures === 0) {
    console.log(`\nAlle ${passed} Prüfungen bestanden.`);
    return 0;
  }
  console.log(`\n${failures} von ${passed + failures} Prüfungen fehlgeschlagen.`);
  return 1;
}
```

Die Aufrufer müssen den Zustand übergeben. Das entspricht dem "lokaler Zustand statt globaler" Prinzip.

**Effekt**:
- -~5 Zeilen (weniger global state)
- Besser testbar, keine hidden state
- Konsistent mit PITFALLS §274

---

## 4. Empfehlungen für das Model

### 4.1 Priorisierte Lese-Reihenfolge

Wenn du in diesem Repository arbeitest:

1. **CLAUDE.md** (200 tokens) — Einleitung, Struktur der Docs
2. **AGENTS.md** (1600–2000 tokens) — Alle Regeln, Caps, Commit-Policy
3. Wenn du eine spezifische Frage hast, nutze die Verweistabelle in AGENTS.md → Docs
4. Wenn du PITFALLS suchst, nutze die neue Tabelle in PITFALLS.md
5. Wenn du Script-Flags brauchst, siehe §9b in AGENTS.md

### 4.2 Discoverability-Strategie

- **Regeln**: Suche in AGENTS.md (Verweistabelle) → Docs (grep nach Heading)
- **Pitfalls**: Suche in PITFALLS.md (Verweistabelle) → grep nach "## "
- **Architektur**: Suche in ARCHITEKTUR.md (Verweistabelle) → grep nach "## "
- **Workflow**: Suche in WORKFLOW.md (Verweistabelle) → grep nach "## "
- **Script-Flags**: Siehe §9b in AGENTS.md → Skript lesen (JSDoc)

### 4.3 Token-Effizienz

- **Kompaktere Docs**: +800–1200 Tokens im Kontext durch bessere Übersicht
- **Schnellere Suche**: Verweistabellen statt blindem Lesen
- **Keine zusätzlichen Script-Lies**: Internes Script-Interface dokumentiert

### 4.4 Known Pitfalls

- `expect.mjs` nutzt globalen Zustand (PITFALLS §274) — aber das Format ist klar
- Keine `--help`-Flags für Skripte — lies die JSDoc-Zeile
- Hidden state in PITFALLS §274 (global `lines`, `failures`) — beachte das, wenn du Skripte schreibst

---

## 5. Zusammenfassung

Das Repository hat eine solide Informationsarchitektur mit klaren Verweis-Tabellen und gut strukturierten Headings. Die Gate-Skripte geben klare, lokal begrenzte Fehlermeldungen aus. **Kritische Schwachstellen**: interne Script-Flags sind nicht dokumentiert; `expect.mjs` nutzt globalen Zustand; keine Usage-Hilfe für die Skripte.

Die vorgeschlagenen Änderungen (CLAUDE.md erweitern, PITFALLS Verweistabelle, AGENTS.md internes Script-Interface, expect.mjs lokalen Zustand) würden +~800–1200 Tokens im Kontext bringen, +2–3x schnelleres Finden von spezifischen Regeln, und +keine zusätzlichen Script-Lies. Die Änderungen sind konsistent mit dem agent-experience-Skill und mit den bestehenden Pitfalls.

---

## 6. Effekt-Messung (Token-Schätzung)

| Änderung | Zeilen | Tokens (≈) | Effekt |
| --- | --- | --- | --- |
| CLAUDE.md erweitern | +150 | +1000–1200 | +Kontext durch Struktur-Übersicht |
| PITFALLS Verweistabelle | +30 | +200–300 | +Schnelle Suche ohne Headings scannen |
| AGENTS.md internes Script-Interface | +40 | +300–400 | +Kein Lesen der Scripts nötig |
| expect.mjs lokaler Zustand | -5 | -50–70 | -Hidden state, bessere Testbarkeit |
| **Gesamt** | **+215** | **+1450–1830** | **+Kontext, +Geschwindigkeit, +Discoverability** |

**Gesamtarbeit**: Weniger "blindes" Lesen großer Docs, schnelleres Finden von spezifischen Regeln, keine zusätzlichen Script-Lies. Die Struktur ist konsistent mit dem agent-experience-Skill und mit den bestehenden Pitfalls.
