# mining

## mining

Spiegel-Datei für `src/domain/actions/mining.js`.

## Verantwortung

Abbau-Logik: wer darf, wie weit, welcher Erd-Zustand. Der Abbau kostet — die einzige Stelle,
die entscheidet, ob er bezahlt ist.

## Schnittstellen

- `miningTotalTicks()`
- `miningCost()`
- `earthHealthForProgress()`
- `createMiningJob()`
- `advanceMiningJob()`
- `isMiningFinished()`
- `isMineableEarth()`
- `touchesUsableSpace()`
- `canMineTile()`
- `canAffordMining()`
- `mineableFrontierIds()`
- `minedFloorTile()`
- `mineTile()`

Aus der Migration vom 2026-10-05 hervorgegangen.
