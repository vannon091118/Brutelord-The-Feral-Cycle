# DunglingLook

## dungling-look

Spiegel-Datei für `src/world/dungling/dungling-look.js`.

## Verantwortung

Ein Wesen sieht aus wie es ist, nicht wie der Ort, an dem es gerade steht. Der Look entsteht
aus einem FNV-Hash der Id über den vorhandenen Zufall der Welt: elf Ringpunkte ergeben eine
weiche Schale, dazu Lappen, Adern, Krone, Poren, Naht und Glanz. Daraus folgen die zwei
Eigenschaften, die diese Datei überhaupt tragen: dasselbe Wesen sieht beim Laufen immer gleich
aus, und zwei Wesen auf derselben Kachel sehen verschieden aus. Der Maßstab schwankt zwischen
0.94 und 1.06; die Schale wackelt oben stark und unten leicht, weil unten die Beine sitzen.

## Schnittstellen

- `creatureSeed()`
- `ringPoint()`
- `shellPath()`
- `lobePlaces()`
- `veinPaths()`
- `crownPaths()`
- `porePlaces()`
- `seamPaths()`
- `shineSpot()`
- `lookOf()`

Aus der Migration vom 2026-10-05 hervorgegangen, am 2026-10-06 zur Erzeugung ausgebaut.
