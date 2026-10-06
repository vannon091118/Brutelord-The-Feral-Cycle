# run-log

## run-log

Spiegel-Datei für `src/domain/replay/run-log.js`.

## Verantwortung

Der aufgezeichnete Lauf: Seed plus Eingaben, mehr nicht. Die Datei kennt keinen
Spielzustand und rechnet nichts nach; sie hält fest, was Spieler und Uhr abgesetzt
haben, damit derselbe Lauf aus denselben zwei Angaben wieder entsteht.

Aufgezeichnet wird kanonisch: `recordInput()` legt die Nutzlastschlüssel sortiert ab,
damit zwei Aufzeichnungen desselben Laufs denselben Digest ergeben. Eine Eingabe ohne
String-Typ wird verworfen, und ist der Deckel erreicht, kommt dasselbe Objekt zurück
statt eines halben Schritts. Der Digest (`logDigest()`) ist ein eigener FNV-artiger
8-Hex-Wert über die kodierten Eingaben: keine Prüfsumme gegen Manipulation, sondern
die kurze Kennung, gegen die ein Lauf in einem Bericht verglichen wird.

Die Grenze ist eine Setzung, keine Messung: `RUN_LOG.maxInputs` (4096) begrenzt die
Aufzeichnung, und ab mehr als `RUN_LOG.shareInputs` (512) Eingaben gibt `shareCode()`
keinen Code mehr heraus, sondern `null` — ein Code, der einen Lauf nur halb enthält,
wäre eine Behauptung von Reproduzierbarkeit. Wer weiter zurückblicken will, braucht
einen Ring über einem Zustands-Snapshot; das steht in `Docs/REPLAY-PLAN.md` als
offener Punkt.

`parseShareCode()` glaubt nichts: Präfix, Zählung und Digest müssen stimmen, sonst
kommt `null` zurück. Ein verstümmelter oder gekürzter Code ist damit kein halber Lauf,
sondern kein Lauf.

## Schnittstellen

- `RUN_LOG`
- `createRunLog()`
- `recordInput()`
- `logDigest()`
- `shareCode()`
- `parseShareCode()`

Die Grundlage für Replay, Seed-Sharing und reproduzierbare Bug-Reports (2026-10-06).
