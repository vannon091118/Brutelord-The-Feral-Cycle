# Changelog

Jeder Eintrag nennt, was sich geändert hat und warum. Die Versionsnummer steht in
`version.lock.json` und ist die Autorität; hier steht, was in ihr passiert ist.

Die Regeln und Pflichten stehen in [`GOVERNANCE.md`](GOVERNANCE.md), der Ablauf in
[`WORKFLOW.md`](WORKFLOW.md). Zahlen in diesem Dokument sind Vergangenheitsform
und beziehen sich auf den Stand der jeweiligen Version — wer den aktuellen Stand
sucht, führt das Kommando aus, das sie erzeugt hat.

---

## 0.0.15 — Die Konto-API hält Angriffe aus

Der Auftrag war, Schwachstellen zu finden, und die gefundene Stelle war nicht
irgendwo im Spiel, sondern in den zwei Funktionen, die ein Konto annehmen.
`register()` und `login()` waren korrekt im Sinne von *richtig*, aber sie waren
gegen niemanden geprüft: eine Bremse gab es nicht, ein unbekannter Name lief
ohne scrypt zurück, ein Passwort hatte nach unten keine Grenze, und die
Antwort trug vier Kopfzeilen nicht, die sie hätte tragen sollen.

**Was drin ist.** Eine Bremse je Name und Herkunft mit gleitendem Fenster, die
ab dem fünften Fehlversuch für eine Minute mit 429 antwortet. Ein Attrappenpfad,
sodass die Antwortzeit nicht mehr verrät, ob ein Name vergeben ist — beide Wege
kosten jetzt denselben Hash. `passwordMax` auch beim Anmelden. Ein nach **Bytes**
gezähltes Rumpf-Limit mit einer 413, die den Client auch erreicht. Eine
Herkunftsprüfung und vier Sicherheitskopfdaten auf jeder Antwort. Ein
Serverfehler, der als Meldung im Spielerfenster landete, ist einer in der
Konsolenausgabe. Eine Sitzung im `localStorage`, die den Seed gegen genau 16
Hex-Ziffern prüft und nur Identität zurückschreibt.

**Und zwei Werkzeugschranken.** `npm run purge` verweigert das rekursive Löschen
von Wurzel, Home und Projektverzeichnis — `DL_DATA_DIR` kommt aus der Umgebung,
und ein leeres Variable löschte genau das, was es nicht sollte. Der Versions-Bump
läuft nur noch auf Pushes nach `main`; auf einem Pull Request hat er denselben
`version.lock.json` zu beiden Zweigen geschrieben, und genau diesen Konflikt
beschreibt die Governance als gewollt.

**Was das nicht ist.** Es gibt weiterhin kein Token. Der Seed *ist* die
Identität, also genügt die Kennung, um in diese Welt zu gelangen — für einen
Slice ohne Spielstand richtig, mit Spielstand eine Baustelle, die dort aufträgt,
wo der Spielstand hingehört.

Geprüft in `scripts/verify/check-account-brake.mjs` und über die laufende API:
201, 200, 401, 409, 413, 403, 405, 429 und die vier Kopfdaten.

**Und eine Abnahme, die es vorher nicht gab.** `check-account-http.mjs` startet
einen echten Node-Server, fährt die Connect-Middleware des Vite-Plugins darauf
und prüft den Purse als Skript in einer Sandbox. Beide Fixes der ersten Fassung
sind genau dort entstanden, wo vorher niemand gemessen hatte — darunter ein
Schrankenfehler, der `DL_DATA_DIR=..` durchließ und den Elternordner geleert
hat. Jede der neuen Prüfungen wurde einmal kaputtgeschaltet und sieht rot aus,
bevor sie hier stand: **eine Prüfung, die beim Sabotage-Versuch grün bleibt,
prüft nichts.**

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
