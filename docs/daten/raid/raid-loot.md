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
ausschließlich aus einem feindlichen Hive mit gefallenem Wächter kennt.

**Die Auszahlung zahlt jetzt beides aus.** Bis zuletzt setzte `applyRaidLoot()` nur die
Essenz und warf den Blutstein des Ergebnisses weg — der Raid hätte gegen die Wächter
gekämpft, die Beute nach Hause getragen, und der einzige Stoff, den die eigene Basis nicht
herstellen kann, wäre im Rückgabewert verfallen. Jetzt geht der ganze Beutesatz durch
`lootInto()` in den Kreislauf des Heimatstandes; die Kolonie selbst bleibt beim Auszahlen
stehen (Welt, Dunglinge und Bauten sind danach dieselben Objekte). Ein Heimatstand ohne
`economy`-Feld bekommt dabei einen leeren Kreislauf, statt an einem fehlenden Feld zu
scheitern — ein Stand aus der Zeit vor diesem Slice bleibt ladbar.

## Schnittstellen

- `raidLoot()`
- `applyRaidLoot()` — Essenz **und** Blutstein in den Heimatstand
