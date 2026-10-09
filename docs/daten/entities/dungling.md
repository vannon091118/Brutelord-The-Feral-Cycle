# dungling

## dungling

Spiegel-Datei für `src/domain/entities/dungling.js`.

## Verantwortung

Der Dungling: Zustand, Befehlsliste, Auftrag, Tile, Position, seine Fusionssteine
und sein Genom. In der Geburt ist das Genom leer; es entsteht erst mit der Fusion
oder der Zucht und wird bei der Rueckentwicklung wieder geloescht. Die Position,
die er traegt, ist die Position, die die Darstellung liest — die Arbeit selbst
rechnet mit dem Auftrag. `orders` ist die Liste der Befehle des Spielers und
`job` der Auftrag, der gerade daraus laeuft: die Liste ist die Absicht, der
Auftrag ist die Ausfuehrung. Ein Dungling ohne beides steht.

## Schnittstellen

- `createDungling()`
- `nextDunglingId()`
- `tilePositionPx()`
- `workerPositionPx()`
- `startSpawning()`
- `idle()`
- `walkTo()`
- `startWork()`
- `withJob()`

Aus der Migration vom 2026-10-05 hervorgegangen.
