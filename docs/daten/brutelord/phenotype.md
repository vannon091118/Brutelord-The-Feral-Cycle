# phenotype

## phenotype

Spiegel-Datei für `src/domain/brutelord/phenotype.js`.

## Verantwortung

Vom Genom zum Koerper in Zahlen: jeder Locus liefert einen Wert, jeder Phaenotyp-Trait
zieht seine Summe aus mehreren Loci. Ein dominanter Locus gibt genau ein Allel weiter,
ein additiver den Mittelwert beider — dadurch wird aus dem diskreten Genom eine
stetige Flaeche, und zwei Geschwister mit denselben Allelen stehen trotzdem verschieden
da. Ein fairer Locus gibt den reproduzierbaren Wurf aus `fairExpressed()` weiter.
`vitals.hp` ist der einzige passive Koerper-Stat: die Vitalitaet aus `VITALITY`,
`SPINE` und `LIMB_THICK`, multipliziert mit `hpPerPoint`. Die Steine beruehrt diese
Datei nicht — Faehigkeiten bleiben Werkzeuge, der Phaenotyp traegt sie nur. Neben `skin`,
`eyes` und `horns` traegt er `species`: die ausgedrueckte Art aus dem Spezies-Locus, die
`skeletonOf()` auf eine der vier Skelett-Grammatiken abbildet. `speciesOf()` gibt zu ihr
beide getragenen Allele mit aus, damit das Labor nicht nur die ausgedrueckte Art, sondern
auch die Anlagen dahinter zeigen kann — eine Art ist keine Summe von Merkmalen, sondern
ein Bauplan.

## Schnittstellen

- `phenotypeOf()`
- `speciesOf()`

Aus der Mission vom 2026-10-06 hervorgegangen.
