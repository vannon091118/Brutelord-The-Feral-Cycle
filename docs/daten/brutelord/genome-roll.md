# genome-roll

## genome-roll

Spiegel-Datei für `src/domain/brutelord/genome-roll.js`.

## Verantwortung

Das Genom eines Wesens aus einem Seed: diploid, also zwei Allele je Locus. Der Wurf nutzt
die bestehenden Seed-Funktionen aus `stone-seed.js` mit eigenem Salz — kein zweiter
Zufallsgenerator, kein `Math.random()`. `expressed()` liest das dominante Allel eines
Paares, `carried()` das verdeckte; der Rang ist der Allel-Index, der hoechste gewinnt.
`fairExpressed()` wirft stattdessen fair: zwei gleiche Allele zeigen dieses, zwei
verschiedene werfen aus `genomeHash()` einen reproduzierbaren 50/50-Entscheid. Der Wurf
haengt bewusst am ganzen Genom-Hash und nicht am Zahlenwert der beiden Allele — ein
Wurf aus der Allel-Reihenfolge allein waere je Allel-Paar festgelegt und wuerde die
hoeheren Indizes haeufen, genau wie das Maximum es tat. `genomeHash()` faltet alle Loci
zu einer uint32, die als Schluessel fuer Anzeige und Cache dient. Derselbe Seed liefert
immer dasselbe Genom, derselbe Genom immer denselben Hash — nur darauf ruht die
Reproduzierbarkeit der Zucht.

## Schnittstellen

- `createGenome()`
- `expressed()`
- `carried()`
- `fairExpressed()`
- `genomeHash()`

Aus der Mission vom 2026-10-06 hervorgegangen.
