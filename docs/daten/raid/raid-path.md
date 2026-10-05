# raid-path

## raid-path

Spiegel-Datei für `src/domain/raid/raid-path.js`.

## Verantwortung

Die Pfadfindung: der günstigste Weg im Ausdauerbudget, nicht der kürzeste. Gegrabener Boden
ist gratis, ungegrabener kostet — am eigenen Tunnel das Doppelte. Dijkstra über Ausdauer:
ein Weg, der das Budget überschreitet, wird nicht ausgegeben. Die Frontlinie: grabbare
Felder am Rand des bereits gelaufenen Bereichs.

## Schnittstellen

- `touchesTrail()`
- `cellCost()`
- `tracePath()`
- `planPath()`
- `frontierOf()`

Aus der Migration vom 2026-10-05 hervorgegangen.
