# BuildMenu

## buildmenu

Spiegel-Datei für `src/ui/BuildMenu.jsx`.

## Verantwortung

Das Baumenü: erscheint, sobald ein Feld nutzbarer Boden ist. Es zeigt die Essenz im Hive,
die drei Bauten und in einem Satz, was gerade zu tun ist. Was gerade zu tun ist — ein Satz,
kein Handbuch. Bezahlt wird aus `spendableEssence()`: was ein offener Bauplatz
versprochen hat, ist nicht mehr da, und die Plakette sagt daneben, wie viel gebunden ist.
So sieht der Spieler, was ihm eine Tür kostet, während er sie nimmt. Beim gewählten Bau
sagt der Satz, ob ein Platz da ist, und wenn keiner da ist, warum: kein freier Boden oder
kein Fleck in der Grundfläche des Baus, samt der Zahl der freien Felder. Die Gründe kommen
als Wert aus der Domäne, die Sätze stehen hier.

## Schnittstellen

- `BuildHeader()`
- `boundNote()`
- `placeNote()`
- `noteFor()`
- `BuildOptions()`
- `BuildMenu()`

Aus der Migration vom 2026-10-05 hervorgegangen.
