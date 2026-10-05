# reveal

## reveal

Spiegel-Datei für `src/domain/world/reveal.js`.

## Verantwortung

Die Sonde des Hive: Sichtbarkeit folgt dem gewachsenen Raum. Ein Wackel-Bit aus dem
niedrigsten Hash-Bit taugt nichts: parity(x) XOR parity(y) XOR parity(seed) ist linear, also
kippt ein Seed alle Entscheidungen oder keine — zwei Muster für jede Welt. Erst zwei
Mix-Runden, dann Bits 8 bis 15. Damit trägt jedes Seed-Bit jede Feldentscheidung einzeln.

## Schnittstellen

- `wobbleAt()`
- `areaIds()`
- `revealed()`
- `revealWorld()`
- `revealAround()`

Aus der Migration vom 2026-10-05 hervorgegangen.
