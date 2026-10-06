# Replay-Plan: der Lauf ist der Beweis

Determinismus war in diesem Baum nie eine Behauptung, sondern eine Prüfung —
aber er war eine Prüfung **für den Autor**. Wer einen Fehler fand, fand ihn in
seinem eigenen Lauf, und niemand sonst konnte ihn nachstellen. Dieses Dokument
sagt zuerst, was schon reproduzierbar war, dann, was daran fehlte, und dann, was
daraus gebaut ist. Es trägt die **Messung** und die **offenen Fragen**, wie
[`BACKEND-PLAN.md`](BACKEND-PLAN.md) und [`RAID-PLAN.md`](RAID-PLAN.md).

## Was schon reproduzierbar war

- **Der Seed.** `createWorld({ playerseed })` zweimal ergibt zweimal dieselbe
  Welt, hex gelesen wie als Zahl; `check-seed.mjs` fährt das über sechs
  Sample-Seeds und prüft, dass verschiedene Seeds verschiedene Welten sind.
- **Die Etage.** `floorSeed(playerseed, depth)` leitet jede Tiefe aus demselben
  Spielerseed ab, und Etage 0 ist Zeichen für Zeichen die Welt ohne Tiefe
  (`check-ladder.mjs`).
- **Der ganze Slice.** `determinism-golden.json` hält je Sample-Seed die
  Zustands-Hashes **jedes** Zuges eines vollständigen Durchlaufs, geschrieben nur
  von `npm run golden:determinism` und nur auf der Node-Major der CI.
- **Die Uhr.** `check-game-clock.mjs` beweist, dass 100 Schritte à 100 ms und 10
  Schritte à 1000 ms denselben Taktstrom ergeben; `check-game-clock-edges.mjs`
  nimmt 32 Ränder dazu — Hintergrundtab, schlafender Rechner, drei Stunden
  Abwesenheit, CPU-Spikes, verpasste Takte, einen Rücksprung der Systemzeit.
- **Die Verbote.** `Math.random(` und `Date.now(` sind in ganz `src/` verboten
  und werden von `check-architecture.mjs` geprüft. Die Spielfiguren-Geometrie
  kommt aus Koordinaten und Seeds, nicht aus Zufall.

Zusammen: **derselbe Seed erzeugt dieselbe Welt, dieselbe Etage und denselben
Taktstrom.**

## Was daran fehlte

Die **Eingaben** wurden nie festgehalten. Der Golden-Wert friert Hashes ein,
nicht den Weg dorthin — er sagt „bei diesem Zug stand der Zustand so", aber nicht
„weil diese Aktion kam". Reproduzierbar war ein Lauf damit nur für den, der ihn
selbst nachbaute: ein zweiter Besucher, ein Bug-Report, eine Wiedergabe im
Browser hatten keinen Gegenstand.

## Der Entwurf

**Das Protokoll.** `src/domain/replay/run-log.js` hält Seed und Eingaben in
einer Reihenfolge, in der jede Aktion genau einmal steht: `createRunLog(seed)`
beginnt sie, `recordInput(log, input)` hängt an, und die Nutzlast wird dabei
**kanonisch** sortiert, damit zwei gleiche Läufe denselben Digest ergeben.
`logDigest(log)` ist ein FNV-artiger Achter-Hex-Wert über die kodierten
Eingaben, `shareCode(log)` schreibt den ganzen Lauf in eine Zeile:

```
BFC1-<seed>-<count>-<digest>-<type>~<payload>;<type>~<payload>;…
```

Drei Zahlen in `RUN_LOG` sind **Einstellungen, keine Messungen**: `maxInputs`
(4096) begrenzt, wieviel ein Lauf aufzeichnet, `shareInputs` (512) begrenzt, was
noch in einen Code passt, und `prefix` ('BFC1') macht fremde Codes erkennbar.
`parseShareCode(text)` nimmt einen Code nur an, wenn Präfix, Anzahl und Digest
stimmen — ein Code, der nicht rechnet, ist kein Lauf.

**Die Aufzeichnung.** `use-game-engine.js` legt eine Klammer um `dispatch`:
jeder Befehl wandert zuerst in eine Ref und dann in den Reducer. Aufgezeichnet
wird damit **alles**, was den Zustand bewegt — der Klick des Spielers und der
Takt der Uhr, mit seinem `dtMs`. Das Protokoll kostet keinen Render, und
`window.__dl.share()` gibt im Dev-Bau den Code des laufenden Spiels heraus.

**Die Wiedergabe.** Sie braucht den Reducer und sonst nichts:
`createInitialGameState(seed)`, dann je Eingabe `gameReducer`, und nach jedem
Schritt `stateDigest` aus `scripts/verify/state-digest.mjs`. Der Lauf aus
`buildRun()` liefert beim Aufzeichnen genau diese Kette; die Wiedergabe muss sie
Zeichen für Zeichen treffen. Gemessen: Seed `a1b2c3d4`, **1669 Eingaben**,
Digest `970a7b9b`, jeder Zug gleich, Endzustand gleich.

**Das Debug-Replay.** `firstDivergence(expected, actual)` nennt die erste
abweichende Stelle — total, auch wenn eine Kette die kürzere ist. `bugReport()`
schreibt daraus einen Text zum Einreichen: Seed, Eingabezahl, Digest, Share-Code,
die abweichende Stelle **mit Aktionsnamen** und beiden Hashes, der Hinweis des
Spielers und der Befehl zum Nachspielen. Ein Lauf über der Share-Grenze sagt das
im Bericht selbst, statt einen Code zu liefern, der hinten abgeschnitten ist.

## Der Raid

`src/domain/raid/raid-sim.js` ist das deterministische Gegenstück zu
`raid-replay.js`: der Replay **prüft** ein eingereichtes Log, die Simulation
**erzeugt** eines. Elf Wörter stehen im Vokabular — die vier `MOVE_*`, ihre vier
`DIG_*`-Gegenstücke, `ATTACK`, `LOOT`, `SACRIFICE` —, gezogen aus
`pickFrom(seed, salt + index * 977)`, damit aufeinanderfolgende Schritte nicht
dasselbe Wort werden. Eine Aktion, die die Phase nicht erlaubt, ist ein No-op —
genau wie in einem eingereichten Log. `raidSeries()` rechnet das Skript Schritt
für Schritt gegen einen echten `stateHashInput` und gibt die Digest-Kette aus.

`scripts/verify/raid-golden.json` friert drei Tickets ein (96, 96 und 32
Schritte). Gemessen: 37, 39 und 20 verschiedene Zustände, 15, 15 und 12
gegrabene Felder. Geschrieben wird der Wert nur von `npm run golden:raid` und nur
auf der Node-Major, die die CI pinnt — dieselbe Regel wie beim
Determinismus-Golden, aus demselben Grund: zwei Golden-Werte wären zwei
Wahrheiten.

## Die Gegenproben

Eine Prüfung, die nie rot wird, prüft nichts. Gemessen:

- Ein **geänderter Seed** ergibt eine andere Kette, ein **geänderter erster Zug**
  weicht im ersten Zug ab, ein **gekürzter Lauf** weicht an seinem Ende ab —
  `check-replay.mjs` nennt Stelle, Aktion und beide Hashes.
- Ein **veränderter Share-Code** wird abgewiesen: falsches Präfix, zu große Zahl,
  ein eingefügtes Zeichen — alle drei `null`.
- Im Raid **beißt der Golden-Wert**: das Weglassen eines wirksamen Zuges weicht
  genau an dessen Stelle ab, und ein angehängter, in der Phase unerlaubter Zug
  ändert nichts (das Protokoll bleibt dasselbe).

## Offen, und zwar bewusst

- **Multiplayer-Verifikation** bleibt eine mögliche Erweiterung: das Ticket
  stellt nur der Server aus, und mit zwei Spielern verglichen sich zwei Logs
  statt eines Logs gegen eine Behauptung. Der Prüfstein dafür ist derselbe und
  steht schon: `replayMatches()`.
- **Das Protokoll ist ein Präfix, kein Ring.** Nach 4096 Eingaben hört die
  Aufzeichnung auf; wer einen Fehler nach zehn Minuten findet, hat ihn nicht im
  Code. Die nächste Stufe wäre ein Ring über einem Zustands-Snapshot.
- **Kein Ort in der Oberfläche** für den Share-Code. Er ist heute über das
  Dev-Tor greifbar (`window.__dl.share()`), nicht über einen Knopf.
- **Der Zustands-Hash liegt in `scripts/verify/`**, nicht in `src/`. Für einen
  App-eigenen Replay-Check bräuchte `src/` einen zweiten Hash — zwei
  Implementierungen derselben Rechnung wären zwei Wahrheiten. Deshalb rechnet die
  Wiedergabe dort, wo der Hash schon wohnt.
- **Ein Ticket auszustellen** kann weiterhin nur der Server. Dieser Baum führt
  Instanzen aus, er vergibt sie nicht.
