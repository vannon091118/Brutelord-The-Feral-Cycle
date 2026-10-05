# use-game-engine

## use-game-engine

Spiegel-Datei für `src/state/use-game-engine.js`.

## Verantwortung

Der Spielmotor des Slices — reine Komposition: Reducer (Wahrheit) + Zeitpläne der Domäne
(Uhren) + Befehle (UI-Eingang). Die Uhren fragen den Zustand, sie besitzen ihn nicht.

## Schnittstellen

- `useGameEngine()`

Aus der Migration vom 2026-10-05 hervorgegangen.
