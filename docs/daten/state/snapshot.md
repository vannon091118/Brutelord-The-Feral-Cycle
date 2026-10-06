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
Dort hängt die Tür seit dem Replay zusätzlich das Lauf-Protokoll heraus: `share()` gibt den
Share-Code des aufgezeichneten Laufs, `run()` den Lauf selbst — ohne Protokoll beide `null`,
damit ein Aufruf ohne Motor nicht stillschweigend etwas Falsches liefert. Der Weg zum Server
ist ein zweiter Abnehmer desselben Envelope: `latestEnvelope()` und `pushEnvelope()` schicken
ihn mit dem Traeger-Token, und ohne Token oder ohne `fetch` bleibt der Aufruf still aus — der
Browser darf ohne Server spielbar bleiben. Die Formprüfung weist alles ab, was kein Objekt
ist: ein Rumpf mit Fassung, aber ohne Stand, fällt als 400 durch statt erst beim Lesen von
`essence`. Sie vergleicht mehr als Typen: negative Essenz, eine Tiefe unter `FLOOR.start`, ein
halber Hive-Anker und eine Welt ohne Mass fallen ebenfalls durch.
Der Streit um die Fassung bleibt nicht stumm: die Absage 409 traegt die Revision des Servers,
und `pushEnvelope()` hebt die eigene Zaehlung darauf. Sonst schriebe der Client gegen einen
Stand weiter, den der Server laengst ueberholt hat, und merkte es nie.

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
- `adoptRevision()` — nimmt die Revision aus einer 409-Absage an
- `readSavedState()`
- `saveSnapshot()`
- `writeIfChanged()`
- `clearSnapshot()`
- `latestEnvelope()` — der zuletzt lokal geschriebene Envelope
- `pushEnvelope()` — derselbe Stand mit Traeger-Token an `/api/state`
- `openTestDoor()`

Aus der Migration vom 2026-10-05 hervorgegangen.
