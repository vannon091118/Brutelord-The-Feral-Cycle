# world-config

## world-config

Spiegel-Datei für `src/domain/world/world-config.js`.

## Verantwortung

Welt-Konstanten: Raster, Hive, Sichtfeld, Skalierung. Der Kern um eine Sonde bleibt immer
frei, alles davor wackelt pro Seed. Die Welt ohne Konto: der Start, den npm run verify und
der Offline-Bau bekommen.

## Schnittstellen

- `worldPixelSize()`
- `viewportPixelSize()`
- `clamp()`
- `computeWorldScale()`

Aus der Migration vom 2026-10-05 hervorgegangen.
