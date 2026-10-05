# DungeonWorld

## dungeonworld

Spiegel-Datei für `src/world/DungeonWorld.jsx`.

## Verantwortung

Die Welt: 2D, direkter Vogelblick, handgemachte Flächen. Diese Komponente schichtet nur die
Ebenen — sie entscheidet nichts. Das Bild ist ein Ausschnitt. Der Ruck sitzt auf einer
Huelle: die Animation ueberschriebe sonst das inline-`transform`.

## Schnittstellen

- `DungeonWorld()`
- `kickKey()`
- `kickProps()`
- `worldSvgProps()`
- `tileLayerProps()`
- `hiveProps()`

Aus der Migration vom 2026-10-05 hervorgegangen.
