# DepositParticles

## depositparticles

Spiegel-Datei für `src/world/deposits/DepositParticles.jsx`.

## Verantwortung

Splitter und Asche: die Menge zeigt den Füllstand, die Farbe den Rest. Die Platzierung liegt
in der Gruppe: die CSS-Animation setzt transform und würde das Attribut an der Form löschen,
dann läge der Splitter im Ursprung.

## Schnittstellen

- `centerOf()`
- `Shard()`
- `ShardField()`
- `BurstShard()`
- `HarvestField()`
- `AshPiece()`
- `AshField()`
- `tileOf()`
- `DepositParticles()`

Aus der Migration vom 2026-10-05 hervorgegangen.
