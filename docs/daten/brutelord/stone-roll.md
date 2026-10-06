# stone-roll

## stone-roll

Spiegel-Datei für `src/domain/brutelord/stone-roll.js`.

## Verantwortung

Der Wurf: Seltenheit aus dem Seed, Pity-Timer, Fähigkeiten, Trait. Aus demselben Seed kommt
immer derselbe Stein — Neuladen ist kein Losgriff. Die Legende-Chance steigt unsichtbar mit
jedem Fehlschlag.

Die Gegenrichtung steht daneben: `statsOf()` faltet die Steine **eines Dunglings** zu seinen
Werten. Der Beitrag je Stein ist die Summe (D31), die Traits sind `peak()` — ein Monster kann
nicht dreimal gierig sein. `dig` kommt aus der Grabfähigkeit eines getragenen Steins und nicht
aus einer Zahl im Rumpf. Wer wissen will, was ein Dungling im Raid kann, fragt diese Funktion
und nicht den Client: der Server leitet den Kader des Tickets daraus ab.

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
- `statsOf()`
- `createStone()`
- `withSlot()`
- `traitDef()`

Aus der Migration vom 2026-10-05 hervorgegangen.
