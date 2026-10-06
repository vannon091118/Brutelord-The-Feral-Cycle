# world-config

## world-config

Spiegel-Datei für `src/domain/world/world-config.js`.

## Verantwortung

Welt-Konstanten: Raster, Hive, Sichtfeld, Skalierung. Der Kern um eine Sonde bleibt immer
frei, alles davor wackelt pro Seed. Die Welt ohne Konto: der Start, den npm run verify und
der Offline-Bau bekommen.

`BURROW_RING` ist die Breite des freigelegten Gangs um den Hive in Kacheln. Sie gilt nur,
wenn eine Startkachel gesetzt ist — die Raid-Welt ruft `createWorld` mit `spawnTile: null`
und bekommt ihren Ring damit nicht.

`WORLD_SEED` trennt die kanonische Saat von der abgeleiteten: `canonicalHex` ist die Breite
des Kontoseeds, `hexLength` die Breite, die die Domäne liest. Der Ableger ist damit ein
Praefix der Saat und kein zweiter Wert neben ihr.

## Schnittstellen

- `worldPixelSize()`
- `viewportPixelSize()`
- `clamp()`
- `computeWorldScale()`

Aus der Migration vom 2026-10-05 hervorgegangen.
