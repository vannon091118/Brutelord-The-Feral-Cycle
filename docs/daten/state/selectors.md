# selectors

## selectors

Spiegel-Datei für `src/state/selectors.js`.

## Verantwortung

Selektoren: Ableitungen aus dem Zustand. `selectPlacement()` beantwortet die
Bauplatz-Frage für den gewählten Bau — sie reicht den Zustand an die Domaene
weiter und entscheidet nichts selbst, ist also der einzige Weg, auf dem Ansicht
und Baumenü dieselbe Antwort bekommen.

## Schnittstellen

- `spawnTile()`
- `firstMineableTileId()`
- `selectMiningActive()`
- `selectMaySelectTiles()`
- `selectSoftHintVisible()`
- `selectWorkingTileId()`
- `selectPlacement()`

Aus der Migration vom 2026-10-05 hervorgegangen.
