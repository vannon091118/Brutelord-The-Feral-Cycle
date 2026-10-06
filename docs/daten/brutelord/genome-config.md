# genome-config

## genome-config

Spiegel-Datei für `src/domain/brutelord/genome-config.js`.

## Verantwortung

Das Genom als Bauplan: zehn Loci mit je vier Allelen. Ein Locus ist dominant, additiv
oder fair. Ein dominanter Locus zeigt sein hoechstes Allel, ein additiver mittelt beide
Allele und traegt damit zur Polygenie bei, ein fairer wirft reproduzierbar zwischen
seinen zwei Allelen. `PHENOTRAIT_MAP` bindet mehrere Loci an ein Merkmal, und
`VITALITY`, `SPINE` und `LIMB_THICK` speisen zusammen die passenden Koerper-HP.
Der Stein bleibt draussen: `SKIN` waehlt die Hautstruktur, `EYE_COUNT` und `HORN` sind
dominant, die Proportionen sind additiv. Diese Datei traegt nur Zahlen und Konstanten,
keinen Zufall. `ORGANIC_CONFIG` und `ORGANIC_SALT` legen daneben die Zahlen der
organischen Geometrie: Phasenzahl, Atemkurve, Kadenz (`phaseMs`), Masse und
Gitteraufloesung des Feldes. Die Kadenz steht hier und nicht im Renderer, damit der Takt
eine Zahl der Domäne bleibt. Zu den Massen gehoeren die Proportionen, die die Gliedmassen
lesbar machen statt sie zu Stummel zu druecken: `bodyGirth` fuer den schlanken Rumpf,
`spineLength` fuer seine Kuerze, `limbLength` und `limbGirth` fuer die schlanken Arme und
Beine, `limbRoot` fuer den Versatz der Wurzel an die Rumpfoberflaeche, `limbPinch` fuer die
Einschnuerung der Trennstelle und `limbJoint` fuer den Bulge am Ellbogen und Knie. Diese
Zahlen sind geeicht, nicht geraten: erst mit ihnen formt das Metaballfeld aus den Sprossen
wiedererkennbare Gliedmassen.

Der zehnte Locus ist die Art, und er traegt eine ganze Skelett-Grammatik statt eines
Farbwerts. Sein Modus ist `FAIR`, nicht `DOMINANT`: zwei gleiche Allele zeigen dieses,
zwei verschiedene werfen aus dem Genom-Hash einen reproduzierbaren fairen Wurf zwischen
ihnen. Der Grund ist die Verteilung — das Maximum zweier Allele haeuft die hoeheren
Indizes (gemessen ueber vierzig Genome Spinne 23, Insekt 11, Humanoid 4, Daemon 2),
der faire Wurf traegt die vier Arten gleich (gemessen ueber vierhundert 92, 92, 105,
111). Damit ist die Art kein Nebenprodukt der Allel-Reihenfolge, sondern ein Zuchtziel:
zwei reinerbige Eltern derselben Art zeugen dieselbe Art. `SPECIES_LABEL` gibt jeder
Art ihren deutschen Namen fuer das Labor. `SPECIES_GRAMMAR` haengt an jede Art ihren
Bauplan: `nodes` (Rumpfknoten), `armFrom` (ab welchem Knoten eine Sprosse Arm statt Bein
wird, `null` heisst keine Arme), `rules` (die L-System-Regeln) und die Multiplikatoren
`limb`, `girth`, `splay`, `spine`, `head`, `body`, `tail` und `horns` — `horns` traegt
beim Insekt das Fuehlerpaar. Die Reihenfolge der Loci ist bindend: der neue Locus steht
zuletzt, weil `LOCUS_ORDER` der Index in die Allel-Mischung ist und ein Locus vor den
alten jedem bestehenden Genom das Allel getauscht haette.

## Schnittstellen

- `LOCUS_MODE`
- `SPECIES`
- `SPECIES_LABEL`
- `SKIN_TEXTURE`
- `FEATURE_ANCHOR`
- `GENE_LOCI`
- `LOCUS_ORDER`
- `PHENOTRAIT_MAP`
- `GENOME_SALT`
- `GENOME_CONFIG`
- `SPECIES_GRAMMAR`
- `ORGANIC_SALT`
- `ORGANIC_CONFIG`

Aus der Mission vom 2026-10-06 hervorgegangen.
