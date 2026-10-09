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

Seit dem 2026-10-06 steht der Tisch auf einem **Sockel**: `dl-bench-glow` legt einen kalten
Schein hinter die Figur, `dl-bench-plinth` eine flache Scheibe unter ihre Füße. Beides sind
reine Flächen ohne Griff, und sie sind der Grund, warum dieser Ort den Hover tragen darf: der
Zeiger erreicht hier das Wesen, ohne etwas zu verdecken — auf dem Spielfeld wäre derselbe
Glanz ein geschluckter Klick auf die Kachel darunter. `LabBench` trägt deshalb die Klasse
`dl-bench`, und `creature.css` hebt beim Überfahren die Figur an, bringt ihre Aetherluft und
den Sockel zum Leuchten. Der gesperrte Platz meldet sich mit: ohne Genom trägt die Figur
`dl-creature--muted` und bleibt vom Anheben ausgenommen.

Die vier Slots haben zusätzlich einen **Druckzustand** bekommen — `active:scale-95` neben dem
Ring, der die mitgeführte Auswahl zeigt. Ein Knopf, der auf Druck nicht antwortet, wirkt tot.

Die vier Plätze und die Kachel im Inventar tragen **einen** Ton je Seltenheit: beide lesen
`RARITY_TONE` aus `rarity-tone.js`, aufgelöst über `STONE_DEFS[rarity].tone`. Vorher standen hier
vier eigene Hex-Literale (`#9aa0a6`, `#5aa9ff`, `#b06cff`, `#ffcf5a`) — Werte außerhalb der
Palette, und für denselben Stein ein anderer Ton als in der Kachel daneben. Der leere Platz liest
`SLOT_REST_TONE`: `#e0983a` und `#9c8a6e` waren die Palette-Werte `core-500` und `bone-400`, jetzt
als Rolle statt als wiederholtes Literal. Ebenso sind Kachelgrund (`soil-900` statt `#1a1008`,
Abweichung je Kanal +1/+6/+8), Hover-Rand (`core-500`), Auswahlring (`core-300`) und die beiden
Texttöne im Art-Etikett Rollen geworden. Die Schriftgrößen, die Platzbeschriftung und die
Schriftfamilie sind unberührt.

## Schnittstellen

- `StoneSlot()`
- `SpeciesTag()`
- `LabBench()`
- `onPlace()`

Aus der Migration vom 2026-10-05 hervorgegangen.
