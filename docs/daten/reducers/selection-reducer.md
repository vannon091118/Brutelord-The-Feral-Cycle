# selection-reducer

## selection-reducer

Spiegel-Datei für `src/state/reducers/selection-reducer.js`.

## Verantwortung

Auswahl-Domäne: Erdblock wählen, Auswahl verwerfen. Die Domäne entscheidet, welche Erde
überhaupt wählbar ist. Wer Erde wählt, lässt ein ausgewähltes Bauwerk los — es gibt nur eine
Auswahl.

## Schnittstellen

- `reduceSelection()`
- `isSelectable()`
- `selectTile()`
- `clearSelection()`

Aus der Migration vom 2026-10-05 hervorgegangen.
