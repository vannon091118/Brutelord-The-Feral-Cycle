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
nicht leer aussieht.

Jede Instanz trägt ihr Genom als `data-genome`, ihre Phase als `data-phase` und ihre Kennung
als `data-unit` im SVG: daran liest die Abnahme ab, welcher Körper wirklich zu welchem Erbgut
gehört.

## Schnittstellen

- `MutantSvg()`

Aus der Mission vom 2026-10-06 hervorgegangen.
