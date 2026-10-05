# tile

## tile

Spiegel-Datei für `src/domain/world/tile.js`.

## Verantwortung

Ein Tile als ein Datenobjekt: Art, Sichtbarkeit, Nutzbarkeit, Verwurzelung. Neben TILE_KIND,
nicht darin: Hartgestein ist Terrain und kein Erdreich. Die Heimat kennt nur Erdreich; Stein
und Obsidian setzt der Raid daneben. Trägt null, weil tileAt() am Rand des Rasters leer
bleibt.

## Schnittstellen

- `tileId()`
- `parseTileId()`
- `createEarthTile()`
- `createHiveTile()`
- `createFloorTile()`
- `isEarth()`
- `terrainOf()`
- `isVisible()`
- `isUsable()`
- `isBuildable()`
- `withEarthHealth()`
- `withRooting()`

Aus der Migration vom 2026-10-05 hervorgegangen.
