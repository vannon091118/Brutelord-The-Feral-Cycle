# colony-reducer

## colony-reducer

Spiegel-Datei für `src/state/reducers/colony-reducer.js`.

## Verantwortung

Kolonie-Domäne: Bau-Befehle des Spielers und der Arbeitstakt. `choose()`
entscheidet über `spendableEssence()`, nicht über den nackten Vorrat: was ein
offener Bauplatz versprochen hat, ist vergeben. Damit kippt jede Bau-Wahl die
anderen Türen, solange der Bau nicht bezahlt ist — dieselbe Aktion, dieselbe
Regel, nur eine ehrliche Kasse.
`staff()` weist nicht mehr still einen Arbeiter zu, sondern legt einen `WORK`-
Befehl in dessen Liste: die Zuweisung ist ab jetzt ein Eintrag, den der Takt
ausführt, und der Dungling bleibt benannt. `release()` nimmt ihn über
`standDown()` aus Arbeit und Liste zurueck — sonst bliebe er mit leerer Liste in
einem Auftrag stehen. Beide Griffe kommen aus `domain/labour/order-job.js`, weil
das Schreiben eines Befehls die Bedeutung des Befehls braucht und die liegt
dort, nicht in der Liste.

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
