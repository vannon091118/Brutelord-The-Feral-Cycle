# reveal

## reveal

Spiegel-Datei für `src/domain/world/reveal.js`.

## Verantwortung

Die Sonde des Hive: Sichtbarkeit folgt dem gewachsenen Raum. Ein Wackel-Bit aus dem
niedrigsten Hash-Bit taugt nichts: parity(x) XOR parity(y) XOR parity(seed) ist linear, also
kippt ein Seed alle Entscheidungen oder keine — zwei Muster für jede Welt. Erst zwei
Mix-Runden, dann Bits 8 bis 15. Damit trägt jedes Seed-Bit jede Feldentscheidung einzeln.

Zwei Regeln ziehen danach die Masse zusammen, beide in `revealed()` und an keinem zweiten
Ort. `attached()` wirft jede frisch geschenkte Kachel, die keinen Weg zu dem hat, was schon
sichtbar war — ein Feld in der Dunkelheit ist kein Stück der Masse, sondern ein Kiesel, und
der Wobble würde sonst zwei bis drei je Etage liefern. `closeHoles()` zieht jede Kachel nach,
die von drei Seiten schon sichtbar ist: ein Loch in der Erde, das von überall her zu sehen
ist, ist kein Unbekanntes, sondern eine Lücke im Bild. Beide ziehen nur nach, nie zurück,
also wächst die Sichtbarkeit weiterhin ausschließlich.

Gemessen über Etage 0, 4 und 8, frisch und nach durchlaufener Expansion: null Löcher, null
Kerben, genau eine zusammenhängende Masse. Die Gegenprobe in
`scripts/verify/check-reveal.mjs` lässt den Lauf rot werden, sobald eine der beiden Regeln
fehlt.

## Schnittstellen

- `wobbleAt()`
- `areaIds()`
- `closureIds()`
- `closeHoles()`
- `attached()`
- `revealed()`
- `revealWorld()`
- `revealAround()`

Aus der Migration vom 2026-10-05 hervorgegangen.
