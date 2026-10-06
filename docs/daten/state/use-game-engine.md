# use-game-engine

## use-game-engine

Spiegel-Datei für `src/state/use-game-engine.js`.

## Verantwortung

Der Spielmotor des Slices — reine Komposition: Reducer (Wahrheit) + eine Uhr (`useGameClock`)
+ Befehle (UI-Eingang). Die Uhr fragt den Zustand, sie besitzt ihn nicht; sie ist die einzige
der beiden Zeiten im Browser.

## Schnittstellen

- `useGameEngine()`

Aus der Migration vom 2026-10-05 hervorgegangen.
