# world-view

## world-view

Spiegel-Datei für `src/world/world-view.js`.

## Verantwortung

Ableitung für die Darstellung: Ausschnitt, Schwarm, Popups, Bauten. Den Bauplatz
liefert die Domäne über `selectPlacement()`; hier wird nur behalten, was der
Ausschnitt zeigen kann — ein Umriss außerhalb wäre gemalt und trotzdem nicht
anklickbar. Ohne Array: der Bauplatz zaehlt wenige Kacheln, das Raster hat
viertausend. Der Ausschnitt wird koordinatenweise abgegangen, nicht das ganze
Raster. Nur Kacheln mit Vorrat werden kopiert — sonst bliebe die
Objektidentitaet. Die Frontier zaehlt nur, was der Ausschnitt zeigen kann.

## Schnittstellen

- `builtCenterTile()`
- `builtCenterPx()`
- `cameraBox()`
- `insideCamera()`
- `tilesInView()`
- `workerViews()`
- `workingStepOf()`
- `popupViews()`
- `depositsOf()`
- `frontierOf()`
- `buildSpotViews()`
- `worldView()`

Aus der Migration vom 2026-10-05 hervorgegangen.
