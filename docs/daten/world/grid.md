# grid

## grid

Spiegel-Datei für `src/domain/world/grid.js`.

## Verantwortung

Das Raster: ein Tile pro Koordinate, Sichtbarkeit folgt der Sonde. Die eine Stelle, die aus
einer Kachel-Id einen Platz im Raster macht. Dieselbe Kachel über Koordinaten — ohne Id und
ohne Zwischendeklaration. Mehrere Kacheln in einem Zug: eine Kopie des Rasters statt einer
je Kachel.

Der Start bekommt einen Gang: `isBurrowCell()` legt jede Kachel im Abstand `BURROW_RING` um
den Hive als Burrow-Boden an, bei einem 2 × 2-Hive sind das zwölf Felder. Der Gang hängt an
der Startkachel, nicht am Hive: ohne `spawnTile` gibt es keinen Ring, die Raid-Welt bleibt
unberührt. `withDeposits()` reicht die Tiefe der Welt an die Vorratsplatzierung weiter —
dieselbe Etage bekommt damit eine andere Karte (eigener Seed) und reichere Kammern, ohne
dass die Verteilung selbst umzieht.

`withHardRock()` legt vor `withDeposits()` das Hartgestein der Heimat an (Entscheidung D1,
`Docs/RAID-PLAN.md`): `createHardRock()` liefert `{ id: Sorte }` als ganze Blöcke aus dem
Seed, und jede Erd-Kachel bekommt ihre Sorte als `terrain`. Der Hive-Kern bleibt frei, damit
der Start nicht im Stein beginnt.

Der Start bekommt ausserdem eine Leiter: `LADDER_TILE` bei 47,47 steht als `world.entrance`
in jeder Etage und wird dort als begehbarer Höhlengang angelegt, und `createDeposits()`
haelt die Kachel frei. `burrowAnchorIds()` setzt dieselben Zellen als Sondenanker, damit der
Reveal eine Reihe weiter aussen garantiert sichtbar wird — sonst truege der frische Boden
eine Wand zur verborgenen Erde und `check-edge-mask.mjs` waere zu Recht rot.

`createWorld()` ist total: Ohne ausdruecklichen Seed fragt es `worldSeed32()` nach der
Spielersaat, und eine ungueltige Eingabe liefert **kein** Raster, sondern `null`. Eine Welt
mit dem falschen Seed ist schlimmer als keine Welt — sie ist von einer richtigen nicht zu
unterscheiden.

## Schnittstellen

- `isHiveCell()`
- `isBurrowCell()`
- `tileForCell()`
- `hiveAnchorIds()`
- `burrowAnchorIds()`
- `fillTiles()`
- `withDeposits()`
- `cellIndex()`
- `getTile()`
- `tileAt()`
- `allTiles()`
- `isInsideGrid()`
- `replaceTile()`
- `applyTiles()`
- `neighborIds()`
- `floorTiles()`
- `countFloorTiles()`

Aus der Migration vom 2026-10-05 hervorgegangen.
