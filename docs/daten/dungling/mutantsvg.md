# MutantSvg

## mutantsvg

Spiegel-Datei für `src/world/dungling/MutantSvg.jsx`.

## Verantwortung

Der Haupt-Renderer des organischen Mutanten, und bewusst dünn: er holt die Phase, holt den
Frame und setzt die drei Stücke zusammen. Die Phase kommt aus `useOrganicPhase()` und nicht
mehr als `step` von außen — ein Mutant atmet damit auch dann, wenn er nicht gräbt. Der Frame
kommt aus `organicFrame(genome, phase)` und trägt Ringzug, Skelett, Anker und Rahmen.

Der Schlüssel dieses Abrufs ist diskret: Genom-Hash und Phase, nie der Takt, nie eine
Kommazahl. Derselbe Körper in derselben Phase liefert deshalb dasselbe Objekt, und zwischen
zwei Bildern entsteht keine neue Geometrie — über tausende Frames hinweg wächst hier nichts.

Die Komposition ist die feste 2.5D-Kette: `<defs>` aus `SkinDefs()` mit **instanz-eigenen
IDs**, darunter die Schichten aus `OrganicBody()` — Schatten, Unterlage, Körper, Wäsche und
Rim — und darauf `Features()`. Ohne Genom steht der Basisbau, damit der leere Labortisch
nicht leer aussieht. In `Features()` reicht er die **Art** aus dem Phänotyp hinein, weil
Augen, Kiefer und Kopfform an der Art hängen und nicht an der Rolle allein.

Jede Instanz trägt ihr Genom als `data-genome`, ihre Phase als `data-phase` und ihre Kennung
als `data-unit` im SVG: daran liest die Abnahme ab, welcher Körper wirklich zu welchem Erbgut
gehört.

Seit dem 2026-10-06 bekommt der Mutant **Stand und Sperre** wie jeder andere Dungling. Zwei
neue Angaben, beide optional: `state` nimmt den Domänenzustand des Wesens und wird von
`creatureClasses()` in Ruhe, Schritt oder Arbeit übersetzt — ohne Angabe ruht die Figur, denn
der Labortisch zeigt einen Vorschlag und keinen Arbeiter —, und `muted` malt den gesperrten
Platz. Gesperrt heißt hier genau eins: der Tisch hat noch **kein Genom**, also steckt kein
Stein, also gibt es nichts zu erschaffen. Die Figur dämmert dann auf vierzig Prozent Deckkraft
und ohne Sättigung, und die Aetherluft verstummt. Vorher war der leere Tisch nur ein leerer
Körper in voller Farbe — dieselbe Unschärfe wie ein gesperrter Knopf, der aussieht wie ein
offener.

Das Etikett folgt demselben Unterschied: ohne Genom nennt das SVG sein Wesen „Dungling im
Gerüst" und nicht „Mutierter Dungling", denn gemeldet wird, was zu sehen ist.

## Schnittstellen

- `MutantSvg()`

Aus der Mission vom 2026-10-06 hervorgegangen.
