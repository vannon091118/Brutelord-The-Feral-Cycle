# DunglingFace

## dunglingface

Spiegel-Datei für `src/world/dungling/DunglingFace.jsx`.

## Verantwortung

Kein Gesicht. Das Geschwur hat eine Narbe dort, wo ein Mund wäre, und ein paar Poren, die
atmen. Beim Arbeiten presst sich die Narbe zusammen. Narbe statt Mund, Poren statt Augen.
Krone, Poren und Naht kommen aus dem Look des Wesens: zwei bis drei Triebe, drei bis sechs
Poren, und eine Naht, die beim Arbeiten die flachere Hälfte nimmt.

Krone und Poren tragen seit dem 2026-10-06 eine eigene Klasse — `dl-creature-crown` und
`dl-creature-pores`. Das Gesicht bekommt damit seinen Stand von der Figur und nicht nur vom
übergebenen `working`: beim Arbeiten stehen die Triebe heller und die Poren offener, und das
ist dieselbe Klasse, an der auch das Aether des Mutanten hängt. Die Wahrheitswerte bleiben
unangetastet — diese Datei entscheidet weiter nichts, sie malt.

## Schnittstellen

- `Seam()`
- `Pores()`
- `BudCrown()`
- `DunglingFace()`

Aus der Migration vom 2026-10-05 hervorgegangen.
