# organic-anchors

## organic-anchors

Spiegel-Datei für `src/domain/brutelord/organic-anchors.js`.

## Verantwortung

Die markierten Gelenke des Skeletts bekommen einen Ort auf der Kontur. Ein
Gelenk ist ein Punkt im Koerper; ein Merkmal wie Auge, Horn oder Maul sitzt
aber auf dem Rand. `anchorsOf` sucht fuer jedes Gelenk mit einer `role` aus
`FEATURE_ANCHOR` den naechsten Punkt aller Ringe und legt den Anker genau
dorthin.

Der Anker traegt alles, was ein spaeterer Renderer braucht und nichts, was er
selbst entscheiden muesste: `role`, den Ursprungsort `joint`, den Ringpunkt
`point`, Ringindex und Stelle im Ring, den Abstand `gap` und die nach aussen
zeigende Normale `normal`. Die Normale kommt aus der Tangente des Rings und
wird ueber das Koerperzentrum nach aussen gedreht, damit die Seite nicht von
der Umlaufrichtung abhaengt.

Der Ringpunkt wird kopiert, nicht geteilt: ein Anker darf die Kontur nicht
veraendern. Die Suche ist eine reine Funktion der Kontur, deshalb ist die
Ankerliste aus `(phenotype, phase)` genauso reproduzierbar wie die Kontur
selbst. Das Modul kennt keinen Zufall und kein Markup.

## Schnittstellen

- `anchorsOf()`

Aus der Mission vom 2026-10-06 hervorgegangen.
