# genome-cross

## genome-cross

Spiegel-Datei für `src/domain/brutelord/genome-cross.js`.

## Verantwortung

Die Mendelsche Kreuzung: je Locus zieht das Kind ein Allel von der Mutter und eines vom
Vater, welches entscheidet der Seed. `crossGenome()` bleibt dabei rein — kein Zufall
ausserhalb der uebergebenen Zahl, damit die Spaltung exakt pruefbar bleibt. Die Mutation
sitzt daneben in `mutateGenome()` und springt mit der Rate aus `GENOME_CONFIG`: ein
Allelkopf wird dann durch ein seed-gewaehltes Allel desselben Locus ersetzt. Getrennt,
damit eine Kreuzung ohne Drift und eine Drift ohne Kreuzung messbar sind. Die Komposition
beider Schritte macht `breed()` in `mutant.js`.

## Schnittstellen

- `crossGenome()`
- `mutateGenome()`

Aus der Mission vom 2026-10-06 hervorgegangen.
