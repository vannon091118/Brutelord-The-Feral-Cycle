# DungeonWorld

## dungeonworld

Spiegel-Datei für `src/world/DungeonWorld.jsx`.

## Verantwortung

Die Welt: 2D, direkter Vogelblick, handgemachte Flächen. Diese Komponente schichtet nur die
Ebenen — sie entscheidet nichts. Das Bild ist ein Ausschnitt. Der Ruck sitzt auf einer
Huelle: die Animation ueberschriebe sonst das inline-`transform`. Das `aria-label` des
SVG-Felds traegt den sichtbaren Produktnamen (Brutelord: The Feral Cycle) und wandert mit
dem Renaming; die Browser-Abnahme zahlt auf genau diesen Namen ab.

## Schnittstellen

- `DungeonWorld()`
- `kickKey()`
- `kickProps()`
- `worldSvgProps()`
- `tileLayerProps()`
- `hiveProps()`

Aus der Migration vom 2026-10-05 hervorgegangen.
