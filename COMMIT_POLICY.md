# Commit- und Versionsregeln

## Commit-Nachrichten

Jeder neue Commit hat einen kurzen Betreff und einen erklärenden Body mit **100 bis 1000 Wörtern**. Der Body nennt jeden geänderten Fachbereich oder jede geänderte Datei und erklärt, was sich geändert hat und warum. Die letzte nichtleere Body-Zeile muss genau einmal `created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.` lauten.

Das Gate weist generierte Signaturen wie `Generated with ...`, Co-Author-/Review-/Sign-off-Trailer, Footer-Trenner und andere `Key: value`-Trailer zurück. Kein anderer Footer oder Trailer ersetzt das Vannon-Label.

## Globale Versionierung

`version.lock.json` ist die globale Versionsautorität. Die Revision wird bei jeder Versionserhöhung genau um eins erhöht; `VERSION`, `package.json` und die Root-Metadaten in `package-lock.json` sind synchronisierte Spiegel. Parallele Branches bearbeiten deshalb denselben Lock und erzeugen bei konkurrierenden Versionsänderungen einen Merge-Konflikt statt unbemerkter Divergenz.

Versionen ausschließlich über den Versionierer ändern:

```sh
npm run version:bump -- patch
npm run version:bump -- minor
npm run version:bump -- major
npm run version:check
```

Direkte Änderungen an Lock oder Spiegeln scheitern am CI-Gate.

## Hard Caps und CI

`npm run gate` prüft höchstens 300 LOC pro Modul, 30 LOC pro benannter Funktion, drei Parameter und sieben Imports sowie die Importrichtungen zwischen den Schichten von `src/`. `npm run verify` führt den Slice-Akzeptanztest aus; `npm run verify:commits` testet die Commit-Policy. GitHub Actions führt Gate, Slice-Verifikation und Production-Build für Pull Requests aus.
