# Changelog

Jeder Eintrag nennt, was sich geändert hat und warum. Die Versionsnummer steht in
`version.lock.json` und ist die Autorität; hier steht, was in ihr passiert ist.

Die Regeln und Pflichten stehen in [`GOVERNANCE.md`](GOVERNANCE.md), der Ablauf in
[`WORKFLOW.md`](WORKFLOW.md). Zahlen in diesem Dokument sind Vergangenheitsform
und beziehen sich auf den Stand der jeweiligen Version — wer den aktuellen Stand
sucht, führt das Kommando aus, das sie erzeugt hat.

---

## 0.0.2 — Onboarding-Kette geprüft statt behauptet

Eine Strukturanalyse kam zu zwölf Beanstandungen am Onboarding. Geprüft wurden sie
durch Mutation: Datei verändern, `npm run verify` laufen lassen, notieren, ob die
Abnahme den Fehler sieht. **Fünf der zwölf hielten nicht** und sind verworfen.

Verworfen, weil die Abnahme sie bereits fängt: ein Onboarding-Schritt, der
übersprungen wird, macht `verify` rot. Die Intervall-Semantik des Abbaus steht an
einer Stelle (`MINING_INTERVAL`) und nicht doppelt, die beiden Uhren lesen
dieselbe Quelle. `PHASES` und `ONBOARDING_ORDER` sind verschiedene Granularitäten,
keine Dubletten. Der Onboarding-Schrittindex hat nur einen Aufrufer.

Umgesetzt:

- **Der Trail ist gedeckelt.** `onboarding.trail` wuchs unbegrenzt, weil das
  Schließen des Bau-Menüs legitim in die Erd-Auswahl zurückspringt. Nach tausend
  Klick-Zyklen standen dort 2007 Einträge; jetzt sind es 52.
- **Der Spawn-Anker hat eine Regel statt zwei.** Reducer und Arbeitssicht lasen ihn
  unterschiedlich — eine Seite mit Rückfallwert, die andere ohne, wodurch
  `parseTileId` auf `null` abstürzen konnte. Beide lesen jetzt `spawnTile()` aus
  `selectors.js`.
- **Die Onboarding-Uhr weiß nicht mehr, in welchem Zustand der Abbau ist.** Die
  Entscheidung „was tut der Intervall-Tick" liegt in `intervalAction()` in der
  Domäne; Browser- und Node-Uhr fragen nur noch.
- **Die Hinweiszeile fällt nicht mehr still zurück.** Ein fehlender Text fiel auf
  „Der Hive wartet." zurück. Die Abdeckung über alle Phasen wird geprüft.
- **Der Zeitplan klemmt nicht mehr stumm.** Überholen Treffer und Mutation den Spawn,
  war der Rest-Timer `0` und der Spawn kam später als vorgesehen. Die Grenze steht
  jetzt als Prüfung mit der Rechnung im Klartext da.
- **Die Fortschrittsticks prüfen sich nicht mehr selbst.** Der Vergleich zog die
  Erwartung aus derselben Funktion, gegen die geprüft wurde; die Erwartung leitet
  sich jetzt aus Dauer und Takt ab.
- **Die Darstellung hat eine Abnahme.** `check-world-views.mjs` prüft, dass
  Dungling-Animation und Hive-Warten den Zuständen entsprechen — vorher prüfte
  kein einziger Test diese Dateien.
- **Ungenutzte Prüfmodule fallen auf.** Ein `check-*.mjs`, das niemand aufruft,
  prüft nichts und fällt in einem grünen Lauf nicht auf.

`npm run verify` prüfte zu diesem Zeitpunkt 122 Zusicherungen (vorher 116). Die Zahl
ist hier bewusst Vergangenheitsform — sie ist der Stand von damals, und die
laufende Zahl schreibt `npm run verify` selbst in seine letzte Zeile.

### Offen geblieben

Vier der Änderungen sind im Laufzeitzustand und für `verify` prinzipiell nicht
prüfbar: das Trail-Limit, die Toleranz gegen einen fehlenden Spawn-Anker, der
Mining-Wächter der Browser-Uhr und die Klemmgrenze selbst. Für die Browser-Uhr
gibt es überhaupt keine Abnahme — `scripts/` führt sie nie aus. Ein Test dafür
wäre Playwright oder ein gleichwertiger Browserlauf.
