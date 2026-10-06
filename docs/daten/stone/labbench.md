# LabBench

## labbench

Spiegel-Datei für `src/ui/stone/LabBench.jsx`.

## Verantwortung

Der Arbeitstisch: der mutierte Dungling in der Mitte, vier Slots drumherum. Die Slots sind
**echte Knöpfe** mit `aria-label`, also mit der Tastatur erreichbar und für die Abnahme
ansprechbar; sie nehmen den ausgewählten Stein auf und heben einen belegten Platz an, wenn
keine Auswahl steht. Der Ring auf allen vier Plätzen zeigt an, dass eine Auswahl mitkommt.

Der Koerper in der Mitte speist sich aus den **belegten** Steinen: sie gehen durch
`genomeForStones()` und werden zum Genom, das der Renderer zeichnet. Ein leerer Tisch hat
kein Genom und zeigt den Basisbau. Damit ist am Arbeitstisch vor dem Erschaffen zu sehen,
was die Belegung ergibt — derselbe Weg, den die echte Fusion nimmt.

## Schnittstellen

- `StoneSlot()`
- `LabBench()`
- `onPlace()`

Aus der Migration vom 2026-10-05 hervorgegangen.
