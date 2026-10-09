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

Das Menü ist ein **Band**: Rahmen, Naht und innere Oberkante kommen aus `dl-panel` und
damit aus den Rollen der Palette, seine Rundung aus `--radius-dl`, und es trägt keine
Pille mehr — A kennt keine Rundung an Flächen. Der Platz selbst bleibt, wo er ist: Das
Menü steht unter der Bühne im Fluss und deckt keinen Bauplatz zu. Eine schwebende Fassung
an der Seite wäre der Ort, an dem es der Bühne Höhe zurückgäbe; sie ist als eigener
Schritt benannt und nicht in diesem Durchgang entschieden.

## Schnittstellen

- `BuildHeader()`
- `boundNote()`
- `placeNote()`
- `noteFor()`
- `BuildOptions()`
- `BuildMenu()`

Aus der Migration vom 2026-10-05 hervorgegangen.
