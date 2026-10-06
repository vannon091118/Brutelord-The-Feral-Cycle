# raid-loot

## raid-loot

Spiegel-Datei für `src/domain/raid/raid-loot.js`.

## Verantwortung

Die Beute wird ausgezahlt, wenn der Raid aufgelöst ist und das Team zurück war — nicht
früher. Ein abgebrochener oder verlorener Raid liefert nichts, und ein Raid, der die Beute
trägt, aber den Rückweg nicht geschafft hat, ebenso wenig (D12, D9): die Funktion gibt dann
`{ ok: false }` statt eines halben Betrags, damit die Auszahlung nicht zur Ermessensfrage
wird. Die Essenz kommt aus dem getragenen Betrag, der **Blutstein** kommt nicht aus einer
zweiten Zahl, sondern aus `bloodstone-loop.js`: derselbe Kreislauf, der die Ressource
ausschließlich aus einem feindlichen Hive mit gefallenem Wächter kennt. Die Auszahlung in den
Heimatstand setzt bis heute nur die Essenz — der Blutstein-Anteil steht im Ergebnis und
wartet auf den Ledger im Heimat-Zustand.

## Schnittstellen

- `raidLoot()`
- `applyRaidLoot()`
