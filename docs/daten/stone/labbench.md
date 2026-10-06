# LabBench

## labbench

Spiegel-Datei für `src/ui/stone/LabBench.jsx`.

## Verantwortung

Der Arbeitstisch: der mutierte Dungling in der Mitte, vier Slots drumherum. Die Slots sind
**echte Knöpfe** mit `aria-label`, also mit der Tastatur erreichbar und für die Abnahme
ansprechbar; sie nehmen den ausgewählten Stein auf und heben einen belegten Platz an, wenn
keine Auswahl steht. Der Ring auf allen vier Plätzen zeigt an, dass eine Auswahl mitkommt.

## Schnittstellen

- `StoneSlot()`
- `LabBench()`
- `onPlace()`

Aus der Migration vom 2026-10-05 hervorgegangen.
