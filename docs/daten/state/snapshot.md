# snapshot

## snapshot

Spiegel-Datei für `src/state/snapshot.js`.

## Verantwortung

Die Tür zum Speichern: gespeichert wird der Spielstand, nicht die Welt. Die Tiefe gehört in
den Schlüssel, sonst käme der untere Etagen-Raster oben wieder heraus. Gepackt wird gegen
die frisch abgeleitete Welt, nicht nach Sichtbarkeit: 333 Vorrats-Zellen liegen im Raster,
davon sind die meisten noch verborgen. Geschrieben wird nur, was sich geändert hat, und nur
unter der Obergrenze und mit höherer Revision: ein abgelehnter Schreibvorgang lässt den
letzten guten Stand stehen und überschreibt ihn nicht mit einem halben. Ein Stand aus einer
älteren Fassung wird beim Lesen verworfen, statt beim Zeichnen an fehlendem Allel zu
scheitern. Was Konsole und Szenarienlauf brauchen: denselben Zugang, aber nur im Dev-Bau.

## Schnittstellen

- `seedWorld()`
- `sameValue()`
- `packTiles()`
- `unpackTiles()`
- `packDeposits()`
- `unpackDeposits()`
- `isMap()`
- `isSavedShape()`
- `packState()`
- `unpackState()`
- `buildEnvelope()`
- `unpackEnvelope()`
- `storedRevision()`
- `nextRevision()`
- `readSavedState()`
- `saveSnapshot()`
- `writeIfChanged()`
- `clearSnapshot()`
- `openTestDoor()`

Aus der Migration vom 2026-10-05 hervorgegangen.
