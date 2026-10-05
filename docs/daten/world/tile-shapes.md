# tile-shapes

## tile-shapes

Spiegel-Datei für `src/world/tile-shapes.js`.

## Verantwortung

Deterministische Formgebung für die Weltgrafik. Die Masse läuft an verbundenen Seiten flach
über die Grenze, an freien Seiten wölbt sie sich organisch — die Rinne zwischen zwei
Erdblöcken stirbt. Das Band der Kantenwand: Bruchfläche zur unbekannten Seite, helle
Abrisskante am Rand — die Wand folgt der Fläche, nie dem Rechteck.

**Die Naht einer geschlossenen Seite zeigt nach aussen, nicht nach innen.** Die
Normale von `perimeterPoint` zeigt ins Feld hinein; die Naht muss dieses Vorzeichen
also umkehren, sonst zieht sie sich um `inset` zurück und jede geschlossene Kachel
wird zum isolierten Block mit einem Ring aus Dunkel darum. Gemessen an einer
geschlossenen Kachel mit 48 Pixeln: vorher reichte die Masse nur von 8,8 bis 39,2,
nachher von −5 bis 53.

**Eine Ecke aus vier geschlossenen Seiten braucht ihren eigenen Punkt.** Fehlt er,
schneidet die geglättete Kurve die Ecke ab, und an jedem Gitterpunkt, an dem vier
Erdfelder zusammenstossen, bleibt ein dunkler Stern. Eine geschlossene Ecke ist aber
nicht immer eine Kerbe: die Kerbe gilt nur, wenn die Diagonale begehbar ist, also am
Hive — dort bleibt der Biss erhalten und hat Vorrang vor dem Eckpunkt.

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
- `seamCorner()`
- `notchPoint()`
- `wallBand()`

Aus der Migration vom 2026-10-05 hervorgegangen.
