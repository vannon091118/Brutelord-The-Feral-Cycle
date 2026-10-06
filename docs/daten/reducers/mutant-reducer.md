# mutant-reducer

## mutant-reducer

Spiegel-Datei für `src/state/reducers/mutant-reducer.js`.

## Verantwortung

Mutation: Steine in einen Dungling verbauen, ihn zurueckentwickeln und zwei Mutanten
kreuzen. Erschaffen braucht das offene Labor, einen Kandidaten und einen Stein im Slot.
Zurueckentwickeln geht jederzeit, auch mitten im Auftrag — er laeuft weiter. `MUTANT_BRED`
verlangt zwei Genome, verbraucht beide Elternteile und stellt das Kind mit dem gekreuzten
Genom an ihre Stelle; ohne Genome oder mit zweimal demselben Elternteil bleibt der Zustand
unveraendert. Die Essenz ruehrt die Zucht nicht an: sie zahlt sich in Koerpern aus, nicht
in Vorrat.

## Schnittstellen

- `reduceMutant()`
- `created()`
- `reverted()`
- `bred()`

Aus der Migration vom 2026-10-05 hervorgegangen.
