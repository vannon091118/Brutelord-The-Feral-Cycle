# EarthSlab

## earthslab

Spiegel-Datei für `src/world/earth/EarthSlab.jsx`.

## Verantwortung

Die Masse selbst: eine einzige Fläche, die über die Nachbarn hinausragt. Kein Sockel, keine
Kante — dadurch verschwindet das Raster. Trägt die Kachel Hartgestein (`geometry.rock`),
wählt `rockFill()` die Füllung: `dl-hardStone` für Stein, `dl-obsidian` für Obsidian, sonst
die Erdenmasse. Die Form bleibt dieselbe — nur die Sorte wechselt.

## Schnittstellen

- `EarthDetails()`
- `rockFill()`
- `EarthSlab()`

Aus der Migration vom 2026-10-05 hervorgegangen.
