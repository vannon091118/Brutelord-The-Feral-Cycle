# use-stage-scale

## use-stage-scale

Spiegel-Datei für `src/ui/use-stage-scale.js`.

## Verantwortung

Misst die verfügbare Spielfläche und liefert Skalierung und Sichtfeld. Auf Desktop bleiben
die Tiles 64px, auf schmalen Geräten schrumpft das Sichtfeld proportional (Tiles landen bei
etwa 48–56px). Keine Scrollbar.

## Schnittstellen

- `useStageScale()`
- `attach()`

Aus der Migration vom 2026-10-05 hervorgegangen.
