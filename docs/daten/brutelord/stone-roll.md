# stone-roll

## stone-roll

Spiegel-Datei für `src/domain/brutelord/stone-roll.js`.

## Verantwortung

Der Wurf: Seltenheit aus dem Seed, Pity-Timer, Fähigkeiten, Trait. Aus demselben Seed kommt
immer derselbe Stein — Neuladen ist kein Losgriff. Die Legende-Chance steigt unsichtbar mit
jedem Fehlschlag.

## Schnittstellen

- `pityMisses()`
- `pityBonus()`
- `rarityWeights()`
- `rarityFor()`
- `nextPityMisses()`
- `hasPity()`
- `slotSalt()`
- `visualFor()`
- `statsFor()`
- `traitFor()`
- `capabilityFor()`
- `carriesCapability()`
- `createStone()`
- `withSlot()`
- `traitDef()`

Aus der Migration vom 2026-10-05 hervorgegangen.
