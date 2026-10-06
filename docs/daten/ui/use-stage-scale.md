# use-stage-scale

## use-stage-scale

Spiegel-Datei für `src/ui/use-stage-scale.js`.

## Verantwortung

Misst die verfügbare Spielfläche und liefert Skalierung und Sichtfeld. Auf Desktop bleiben
die Tiles 64px, auf schmalen Geräten schrumpft das Sichtfeld proportional (Tiles landen bei
etwa 48–56px). Keine Scrollbar.

Die erste Messung läuft synchron beim Einhängen, der `ResizeObserver` meldet danach nur noch
Änderungen. Ein Beobachter allein reicht nicht: seine Rückmeldung kommt mit dem nächsten
Bildaufbau, und ohne Bildaufbau — angehaltene Uhr, verborgener Tab — wäre die Fläche null und
es gäbe kein sichtbares Feld.

## Schnittstellen

- `useStageScale()`
- `attach()`

Aus der Migration vom 2026-10-05 hervorgegangen.
