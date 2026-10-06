# mutant

## mutant

Spiegel-Datei für `src/domain/brutelord/mutant.js`.

## Verantwortung

Die Fusion: Steine wandern in einen Dungling, die Rueckentwicklung loest sie. Mit der
Fusion entsteht zugleich sein Genom — aus den Seeds der Steine, nicht aus einem Wurf zur
Laufzeit. Mutieren darf jeder; freie Dunglinge gehen den arbeitenden vor. `breed()` kreuzt
zwei Genome nach Mendel und laesst die Mutationsrate aus `genome-cross` darueberlaufen;
das Kind kommt ohne Steine zur Welt, denn Werkzeuge werden nicht vererbt. `isMutant()`
folgt seit der Zucht dem Genom und nicht mehr allein den Steinen: ein Wesen mit Koerper
ist ein Mutant, auch wenn es gerade nichts traegt.

Das Genom entsteht an genau einer Stelle je Herkunft: `genomeForStones()` wuerfelt es aus
den Seeds der Steine, `fuse()` ruft genau das auf, und `genomeOf()` faellt nur dann darauf
zurueck, wenn eine alte Ablage Steine traegt, aber noch kein Genom — sonst waere der
Mutant beim Laden unsichtbar.

## Schnittstellen

- `unitStones()`
- `isMutant()`
- `genomeForStones()`
- `genomeOf()`
- `fusionStones()`
- `investedIn()`
- `nextCandidate()`
- `fuse()`
- `refundFor()`
- `asBase()`
- `breedSeed()`
- `breed()`

Aus der Migration vom 2026-10-05 hervorgegangen.
