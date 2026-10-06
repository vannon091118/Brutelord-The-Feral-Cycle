# lab-state

## lab-state

Spiegel-Datei für `src/domain/brutelord/lab-state.js`.

## Verantwortung

Das Labor des Brutlords: Inventar, belegte Slots und der Pity-Zähler. Steine werden über
ihren Seed identifiziert, nicht über ihre Position. Der Kauf erzeugt den Seed und schreibt
den Stein sofort fest.

`placeStone()` besetzt genau einen Platz und gibt ihn weiter: Nimmt ein Stein einen
bereits belegten Platz ein, landet der Vorgänger wieder im Pool — ein Stein ohne Platz
geht nie verloren. Derselbe Platz ein zweites Mal ändert nichts, damit der Aufruf keine
neue Welt baut, die sich nicht unterscheidet. Ein fremder Slot oder ein fremder Seed
liefert dieselbe Instanz zurück.

`slot === null` heißt zurück in den Pool: ein belegter Platz muss seinen Stein auch
wieder hergeben können, sonst ist das Gerät nach dem letzten Stein zugemauert und der
Spieler kommt ohne Reload nicht mehr daran. Der Pool ist dabei kein Platz wie jeder
andere — deshalb greift dort keine Vertreibung.

## Schnittstellen

- `createLab()`
- `stoneOf()`
- `labIsFull()`
- `canAffordStone()`
- `canOpenLab()`
- `buyStone()`
- `nextSeed()`
- `isDiscovered()`
- `stoneLabel()`
- `stoneName()`
- `placeStone()`
- `placedStones()`
- `labStoneCount()`

Aus der Migration vom 2026-10-05 hervorgegangen.
