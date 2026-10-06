# LabBench

## labbench

Spiegel-Datei für `src/ui/stone/LabBench.jsx`.

## Verantwortung

Der Arbeitstisch: über dem Mutanten seine Art, darunter der Körper in der Mitte und vier
Slots drumherum. Die Slots sind **echte Knöpfe** mit `aria-label`, also mit der Tastatur
erreichbar und für die Abnahme ansprechbar; sie nehmen den ausgewählten Stein auf und
heben einen belegten Platz an, wenn keine Auswahl steht. Der Ring auf allen vier Plätzen
zeigt an, dass eine Auswahl mitkommt.

Der Koerper in der Mitte speist sich aus den **belegten** Steinen: sie gehen durch
`genomeForStones()` und werden zum Genom, das der Renderer zeichnet. Ein leerer Tisch hat
kein Genom und zeigt den Basisbau. Damit ist am Arbeitstisch vor dem Erschaffen zu sehen,
was die Belegung ergibt — derselbe Weg, den die echte Fusion nimmt.

`SpeciesTag()` liest dasselbe Genom über `speciesOf()` und nennt die **ausgedrückte Art**
samt ihren **Anlagen** — den beiden getragenen Allelen. So ist vor dem Erschaffen zu
sehen, welche Art wirklich herauskommt und welche Art als verdecktes Allel noch mitreist;
der leere Tisch sagt stattdessen, dass die Art sich erst mit einem Stein zeigt.

## Schnittstellen

- `StoneSlot()`
- `SpeciesTag()`
- `LabBench()`
- `onPlace()`

Aus der Migration vom 2026-10-05 hervorgegangen.
