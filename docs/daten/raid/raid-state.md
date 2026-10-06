# raid-state

## raid-state

Spiegel-Datei für `src/domain/raid/raid-state.js`.

## Verantwortung

Der Raid-Zustand: eine zweite Instanz, isoliert vom Heimat-Zustand. Helden tragen keine
Position: `at` gehört der Gruppe (D32). Fail closed: reicht die Ausdauer nicht, bleibt der
Zustand unverändert. Ein Raid beginnt in `RAID_PHASE.ENTER` — der Name kommt aus
`raid-phases.js`, damit die Kette und ihr erster Zustand dieselbe Quelle haben.

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
