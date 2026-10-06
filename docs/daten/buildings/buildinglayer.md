# BuildingLayer

## buildinglayer

Spiegel-Datei für `src/world/buildings/BuildingLayer.jsx`.

## Verantwortung

Die Bauplätze als Umriss und die stehenden Bauten. Die Fläche des Umrisses zeigt
gleich die ganze Grundfläche — beim Brutlord also 2 × 2 Felder. Welche Plätze es
gibt, entscheidet die Domäne, und `world-view.js` rechnet sie in Pixel um; diese
Ebene zählt nichts nach und kennt die Regel nicht. Ein Bauplatz lässt sich auch
mit der Tastatur wählen.

## Schnittstellen

- `onSpotKeyDown()`
- `PlacementSpot()`
- `BuildingLayer()`

Aus der Migration vom 2026-10-05 hervorgegangen.
