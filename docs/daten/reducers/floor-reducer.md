# floor-reducer

## floor-reducer

Spiegel-Datei für `src/state/reducers/floor-reducer.js`.

## Verantwortung

Der Etagensprung: der Hive zieht in die naechste Tiefe, und die Welt dort ist eine Funktion
aus Seed und Tiefe. Ein Sprung ersetzt den Rasterzustand — Dunglinge, Bauten und Essenz
bleiben, das Gestein ist ein neues.

**Ohne Schacht springt er gar nicht.** Die erste Wache im Reducer ist
`ladderOpen(state.buildings)`: steht kein fertiger Leiterschacht, gibt er den
Stand unveraendert zurueck. Das ist dieselbe Regel, die `descendOpen()` der
Oberflaeche nennt — Plakette und Leiter sind in diesem Zustand schon gesperrt,
und der Reducer weist einen Aufruf ab, der trotzdem kommt.

**Der Sprung ist der Abnehmer des Blutsteins.** Solange die freie Leiter trägt
(`canDescend(state.world.depth)`), springt er wie bisher und kostet nichts: für einen Stand
mit leerem Kreislauf ist das Verhalten Zeichen für Zeichen das alte, und die Abnahme der
Vertikalität bleibt damit unverändert gültig. Erst unterhalb der freien Leiter — also dort,
wo `canDescend()` falsch ist — versucht er den Kauf über `buyFloor()`. Gelingt er, zieht der
Sprung eine Etage weiter, als die Config allein hergäbe, und die bezahlte Tiefe wandert in
denselben Zustand, den die neue Welt trägt. Gelingt er nicht, gibt der Reducer **denselben**
Stand zurück: kein halber Sprung, keine zweite Wahrheit über die Tiefe, und die Plakette an
der Grenze bleibt stehen. Dasselbe gilt, wenn `createFloorWorld()` wegen eines ungültigen
Spielerseeds `null` liefert — der Reducer gibt dann denselben Stand zurück und nie eine leere
Welt.

## Schnittstellen

- `reduceFloor()`
- `descended()` — erst der Schacht, dann frei innerhalb der Leiter, sonst gegen Blutstein
- `moved()` — die neue Welt, die Tiefe und der bezahlte Kreislauf in einem Schritt

Aus der Migration vom 2026-10-05 hervorgegangen.
