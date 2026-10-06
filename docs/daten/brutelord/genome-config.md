# genome-config

## genome-config

Spiegel-Datei für `src/domain/brutelord/genome-config.js`.

## Verantwortung

Das Genom als Bauplan: neun Loci mit je vier Allelen. Ein Locus ist dominant oder additiv.
Ein dominanter Locus zeigt sein hoechstes Allel, ein additiver mittelt beide Allele und
traegt damit zur Polygenie bei. `PHENOTRAIT_MAP` bindet mehrere Loci an ein Merkmal, und
`VITALITY`, `SPINE` und `LIMB_THICK` speisen zusammen die passenden Koerper-HP.
Der Stein bleibt draussen: `SKIN` waehlt die Hautstruktur, `EYE_COUNT` und `HORN` sind
dominant, die Proportionen sind additiv. Diese Datei traegt nur Zahlen und Konstanten,
keinen Zufall. `ORGANIC_CONFIG` und `ORGANIC_SALT` legen daneben die Zahlen der
organischen Geometrie: Phasenzahl, Atemkurve, Kadenz (`phaseMs`), Masse und
Gitteraufloesung des Feldes. Die Kadenz steht hier und nicht im Renderer, damit der Takt
eine Zahl der Domäne bleibt.

## Schnittstellen

- `LOCUS_MODE`
- `SKIN_TEXTURE`
- `FEATURE_ANCHOR`
- `GENE_LOCI`
- `LOCUS_ORDER`
- `PHENOTRAIT_MAP`
- `GENOME_SALT`
- `GENOME_CONFIG`
- `ORGANIC_SALT`
- `ORGANIC_CONFIG`

Aus der Mission vom 2026-10-06 hervorgegangen.
