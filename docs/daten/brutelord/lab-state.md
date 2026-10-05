# lab-state

## lab-state

Spiegel-Datei für `src/domain/brutelord/lab-state.js`.

## Verantwortung

Das Labor des Brutlords: Inventar, belegte Slots und der Pity-Zähler. Steine werden über
ihren Seed identifiziert, nicht über ihre Position. Der Kauf erzeugt den Seed und schreibt
den Stein sofort fest.

## Schnittstellen

- `createLab()`
- `stoneOf()`
- `labIsFull()`
- `canAffordStone()`
- `canOpenLab()`
- `buyStone()`
- `nextSeed()`
- `isDiscovered()`
- `stoneLabel()`
- `stoneName()`
- `placeStone()`
- `placedStones()`
- `labStoneCount()`

Aus der Migration vom 2026-10-05 hervorgegangen.
