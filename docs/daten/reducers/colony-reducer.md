# colony-reducer

## colony-reducer

Spiegel-Datei für `src/state/reducers/colony-reducer.js`.

## Verantwortung

Kolonie-Domäne: Bau-Befehle des Spielers und der Arbeitstakt. `choose()`
entscheidet über `spendableEssence()`, nicht über den nackten Vorrat: was ein
offener Bauplatz versprochen hat, ist vergeben. Damit kippt jede Bau-Wahl die
anderen Türen, solange der Bau nicht bezahlt ist — dieselbe Aktion, dieselbe
Regel, nur eine ehrliche Kasse.

## Schnittstellen

- `reduceColony()`
- `choose()`
- `place()`
- `select()`
- `deselect()`
- `staff()`
- `release()`
- `isAssigned()`
- `replace()`
- `nextBuildingId()`

Aus der Migration vom 2026-10-05 hervorgegangen.
