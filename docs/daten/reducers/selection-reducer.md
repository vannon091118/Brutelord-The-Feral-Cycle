# selection-reducer

## selection-reducer

Spiegel-Datei für `src/state/reducers/selection-reducer.js`.

## Verantwortung

Auswahl-Domäne: Erdblock wählen, Auswahl verwerfen. Die Domäne entscheidet, welche Erde
überhaupt wählbar ist. Wer Erde wählt, lässt ein ausgewähltes Bauwerk los — es gibt nur eine
Auswahl. Das Aktionsmenü ist zugleich ein Phasenwechsel nach `ACTION_MENU`: der Menü-Knopf ist kein
Fortschritt, sondern ein Zustand. Nach erreichtem Bau-Menü führt erneutes Wählen deshalb auf
`ACTION_MENU` und das Leeren wieder auf `BUILD_MENU_VISIBLE`; `check-selection` hält das fest.

## Schnittstellen

- `reduceSelection()`
- `isSelectable()`
- `selectTile()`
- `clearSelection()`

Aus der Migration vom 2026-10-05 hervorgegangen.
