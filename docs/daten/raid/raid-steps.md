# raid-steps

## raid-steps

Spiegel-Datei für `src/domain/raid/raid-steps.js`.

## Verantwortung

Die Übergänge: gehen ist gratis, graben kostet Ausdauer, beides fail closed. Der Preis kommt
aus der Pfadfindung, damit Plan und Schritt dieselbe Zahl nennen. Welche Aktion eine Phase
zulässt, steht nicht hier, sondern in `raid-phases.js`: der Schritt liest die Tabelle und
weist eine Aktion ab, die dort nicht steht. Der Kontakt mit dem Hive ist ein Ereignis und
kein Sonderfall — er geht durch dieselbe Maschine wie jede andere Kante, statt die Phase
direkt zu setzen.

## Schnittstellen

- `isKnown()`
- `categoryOf()`
- `arrive()`
- `dig()`
- `applyAction()`

Aus der Migration vom 2026-10-05 hervorgegangen.
