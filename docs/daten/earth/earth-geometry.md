# earth-geometry

## earth-geometry

Spiegel-Datei für `src/world/earth/earth-geometry.js`.

## Verantwortung

Geometrie eines Erdblocks: Umriss, Körner, Risse — die Form folgt Nachbarn. Geometrie haengt
an Koordinate, Groesse, Zustand, Nachbarschaft und Sorte: `rock` (Stein oder Obsidian) geht
in den Cache-Schlüssel ein, weil dieselbe Zelle als Erde und als Stein zwei Flächen hat.

## Schnittstellen

- `handLines()`
- `damageOf()`
- `earthGeometry()`
- `buildGeometry()`

Aus der Migration vom 2026-10-05 hervorgegangen.
