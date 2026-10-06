# rooting-reducer

## rooting-reducer

Spiegel-Datei für `src/state/reducers/rooting-reducer.js`.

## Verantwortung

Ausbau der Verwurzelung: ein Takt vergeht, jedes wachsende Feld kommt ein Stück weiter,
ruhende ruhen aus. Erst danach stoßen die Tentakel in alle Nachbarfelder — und legen dabei
den Boden frei, den sie erreichen. Wie lang der Takt war, sagt die Aktion (`dtMs`); ohne Angabe
bleibt es beim Wurzel-Takt aus der Config — deshalb ist der Node-Durchlauf unverändert.

## Schnittstellen

- `reduceRooting()`
- `tick()`

Aus der Migration vom 2026-10-05 hervorgegangen.
