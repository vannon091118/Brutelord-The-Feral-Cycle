# run-report

## run-report

Spiegel-Datei für `src/domain/replay/run-report.js`.

## Verantwortung

Der Befund zu einem aufgezeichneten Lauf: Der Bericht nennt Seed, Eingabezahl, Digest,
Share-Code und die erste Stelle, an der zwei Zustandsfolgen auseinandergehen — Zug,
Aktionstyp und beide Werte. Ein Fehlerbericht wird damit nachspielbar statt nacherzählt.

Die Datei rechnet nichts nach und kennt den Spielzustand nicht: `expected` und `actual`
sind zwei Folgen von Schritt-Digests, die der Aufrufer mitbringt — in der Abnahme
`state-digest.mjs`, im Spiel der Replay-Lauf. Deshalb gibt es hier keinen zweiten
Zustands-Hash: eine zweite Wahrheit über denselben Zustand wäre der teurere Fehler.

`firstDivergence()` ist total: gleich lange Folgen liefern den ersten abweichenden Index
oder `-1`, und ist eine Folge ein Präfix der anderen, ist der Index hinter dem kürzeren
Ende die Abweichung. Ein stiller Zweig — „kein Unterschied, weil nur bis zum Ende der
kürzeren geschaut wurde“ — wäre genau der Fehler, den diese Funktion finden soll.

Der Text ist bewusst schlicht: Zeilen mit Seed, Zählung, Kennung, Befund, optionaler
Spielernotiz und dem Befehl zum Nachspielen. Er ist zur Ablage im Fehlerbericht gedacht,
nicht zum Parsen, und trägt keinen Zustand mit, der veralten könnte.

## Schnittstellen

- `firstDivergence()`
- `bugReport()`

Die Textform eines reproduzierbaren Bug-Reports (2026-10-06).
