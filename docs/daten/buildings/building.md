# building

## building

Spiegel-Datei für `src/domain/buildings/building.js`.

## Verantwortung

Bauplatz-Logik: Grundfläche, Platzprüfung, Lieferung, Zuweisung. Ein offener
Bauplatz bindet seinen ganzen Preis: `committedEssence()` summiert, was noch
fehlt, `spendableEssence()` zieht es vom Vorrat ab. Der Bau wird weiter Stück
für Stück bezahlt — aber versprechen lässt sich dieselbe Essenz nur einmal, und
das ist die Frage, an der sich die Türen des Openings trennen. Die Platzfrage
gilt dem ganzen Raster und nicht dem, was gerade sichtbar ist — sonst hinge die
Antwort an der Kamera, und niemand könnte sagen, warum nichts erscheint.
`placementReport()` liefert beides: die Anker, auf denen dieser Bau stehen darf,
und bei leerer Liste den Grund — kein freier Boden (`NO_FLOOR`) oder freier
Boden, aber keine zusammenhängende Fläche der Größe (`NO_SPACE`). Ein einzelnes
Regelstück entscheidet: `canPlaceBuilding()` prüft eine Stelle, der Report
prüft alle, beide über `footprintFits()`.

## Schnittstellen

- `occupiedTileIds()`
- `footprintIds()`
- `footprintFits()`
- `canPlaceBuilding()`
- `reasonFor()`
- `placementReport()`
- `createBuildingSite()`
- `isDelivered()`
- `deliverToSite()`
- `settleSite()`
- `openSites()`
- `committedEssence()`
- `spendableEssence()`
- `assignWorker()`
- `releaseWorker()`

Aus der Migration vom 2026-10-05 hervorgegangen.
