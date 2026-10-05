# grid

## grid

Spiegel-Datei für `src/domain/world/grid.js`.

## Verantwortung

Das Raster: ein Tile pro Koordinate, Sichtbarkeit folgt der Sonde. Die eine Stelle, die aus
einer Kachel-Id einen Platz im Raster macht. Dieselbe Kachel über Koordinaten — ohne Id und
ohne Zwischendeklaration. Mehrere Kacheln in einem Zug: eine Kopie des Rasters statt einer
je Kachel.

## Schnittstellen

- `isHiveCell()`
- `tileForCell()`
- `hiveAnchorIds()`
- `fillTiles()`
- `withDeposits()`
- `cellIndex()`
- `getTile()`
- `tileAt()`
- `allTiles()`
- `isInsideGrid()`
- `replaceTile()`
- `applyTiles()`
- `neighborIds()`
- `floorTiles()`
- `countFloorTiles()`

Aus der Migration vom 2026-10-05 hervorgegangen.
