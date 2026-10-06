# TileLayer

## tilelayer

Spiegel-Datei für `src/world/TileLayer.jsx`.

## Verantwortung

Das Feld in Durchgängen: Erde, Tiefe, Boden, Wurzeln, Vorräte, Bauten. Die Reihenfolge ist
Inhalt, nicht Geschmack: die Tiefe liegt zwischen Erde und Boden, weil die Erdmasse über ihre
Kachel hinausragt und der Boden den Überstand verdecken muss; Hive, Dunglinge und Bauten
kommen eine Ebene höher. Die sichtbaren Kacheln werden einmal auf Erde gefiltert und an beide
Erd-Durchgänge weitergereicht, statt in jedem erneut.

## Schnittstellen

- `EarthCell()`
- `earthTiles()`
- `floorTiles()`
- `TileLayer()`

Aus der Migration vom 2026-10-05 hervorgegangen.
