# raid-state

## raid-state

Spiegel-Datei für `src/domain/raid/raid-state.js`.

## Verantwortung

Der Raid-Zustand: eine zweite Instanz, isoliert vom Heimat-Zustand. Helden tragen keine
Position: `at` gehört der Gruppe (D32). Fail closed: reicht die Ausdauer nicht, bleibt der
Zustand unverändert.

## Schnittstellen

- `toHero()`
- `teamGritOf()`
- `createRaidState()`
- `canSpend()`
- `spend()`
- `refillAp()`
- `nextRound()`
- `record()`
- `stateHashInput()`

Aus der Migration vom 2026-10-05 hervorgegangen.
