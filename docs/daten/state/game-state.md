# game-state

## game-state

Spiegel-Datei für `src/state/game-state.js`.

## Verantwortung

Der Startzustand des Slices und die eine Tür, auf der ein gespeicherter Spielstand zurück in
den Reducer kommt.

Der Kreislauf ist Teil des Starts: `economy` trägt beide Ledger, und ein frischer Stand
beginnt mit leeren. Das ist die Stelle, an der die Ressourcen überhaupt erst einen Ort im
Spiel bekommen — vorher lebten sie allein in ihren Modulen und in der Abnahme, und kein
Spielstand konnte sie tragen. `initialGameState()` legt über einen geladenen Stand einen
leeren Kreislauf, wenn er keinen hat: Ein Spielstand aus der Zeit vor diesem Slice hat das
Feld wirklich nicht, und der Rückfall ist hier die richtige Antwort statt eines Fehlers.
Das ist ausdrücklich **nicht** das verbotene `??`-Muster für Tabellen, die vollständig sein
müssen — ein alter Stand *hat* den Wert nicht, und ein fehlendes Feld ist kein halber Wert.

## Schnittstellen

- `createInitialGameState()` — mit leerem `economy`
- `initialGameState()` — der gespeicherte Stand, notfalls mit leerem Kreislauf

Aus der Migration vom 2026-10-05 hervorgegangen.
