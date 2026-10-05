# tile-shapes

## tile-shapes

Spiegel-Datei für `src/world/tile-shapes.js`.

## Verantwortung

Deterministische Formgebung für die Weltgrafik. Die Masse läuft an verbundenen Seiten flach
über die Grenze, an freien Seiten wölbt sie sich organisch — die Rinne zwischen zwei
Erdblöcken stirbt. Das Band der Kantenwand: Bruchfläche zur unbekannten Seite, helle
Abrisskante am Rand — die Wand folgt der Fläche, nie dem Rechteck.

## Schnittstellen

- `tileSeed()`
- `makeRng()`
- `round()`
- `smoothClosedPath()`
- `perimeterPoint()`
- `blobPlaces()`
- `blobPoint()`
- `soilBlob()`
- `soilSpeckles()`
- `crackPath()`
- `chipBlob()`
- `scatterRocks()`
- `sideSpan()`
- `soilMaskBlob()`
- `maskPoints()`
- `seamPoint()`
- `notchPoint()`
- `wallBand()`

Aus der Migration vom 2026-10-05 hervorgegangen.
