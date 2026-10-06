# raid-traverse

## raid-traverse

Spiegel-Datei für `src/domain/raid/raid-traverse.js`.

## Verantwortung

Bewegung und Graben im fremden Dungeon — der Teil des Schritts, der die Welt liest. Gehen ist
gratis, aber nur über bekanntes Gelände; graben kostet den Preis der Pfadfindung, damit Plan
und Schritt dieselbe Zahl nennen. Beides fail closed: reicht das Budget nicht, bleibt der
Zustand unverändert. Der Eintritt in den Hive ist kein Sonderfall und keine Zuweisung — er
geht durch die Phasenmaschine (`ENTERED_HIVE`), und trägt die Ausdauer den Übergang nicht,
wird der Schritt abgewiesen. Der Hive wird betreten, nicht gegraben (D34), deshalb gilt für
ihn die Bewegungsregel.

## Schnittstellen

- `isKnown()`
- `entersHive()`
- `arrive()`
- `dig()`
- `stepInto()`
