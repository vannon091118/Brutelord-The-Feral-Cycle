# organic-skin

## organic-skin

Spiegel-Datei für `src/world/dungling/organic-skin.jsx`.

## Verantwortung

Die Haut des organischen Körpers und die Schichten, aus denen er steht. `SKIN_TONE` gibt je
`SKIN_TEXTURE` vier Werte aus — Füllung, Struktur, Randlicht und Schatten —, und `SkinDefs()`
baut daraus ein `<pattern>`: eine gefüllte Kachel plus die Marken der Hautstruktur, also
Platten für Chitin, Blasen für Schleim, Risse für Knochen und Sprenkel für Fleisch. Ein
Füllwert `url(#…)` trägt damit Farbe und Struktur in einem Zug.

**Die IDs sind instanz-eigen.** Zwei Mutanten auf demselben Schirm dürfen sich keine
Definition teilen: die Kennung kommt aus `data-unit` und wandert in jede `id`. Ohne das
färbte der zuletzt gezeichnete Körper den ersten mit.

`OrganicBody()` legt die 2.5D-Schichten in fester Reihenfolge: Schatten (versetzt, dunkel),
Unterlage (Knochen und Gelenke als sichtbare Anatomie), Körper (Kachelfüllung, leicht
durchscheinend, damit die Anatomie durchkommt), Wäsche (Radialverlauf für die Rundung) und
Rim (Randlicht als Kante). `plot()` ist der eine Projektor dieser Ebene: Feldkoordinaten nach
SVG, mit gedrehtem y, damit ein Feldkörper mit dem Kopf nach oben steht. Ohne Genom zeichnet
dieselbe Funktion den Basisbau, denn ein leerer Labortisch soll nicht leer aussehen.

## Schnittstellen

- `INK`
- `SKIN_TONE`
- `plot()`
- `skinIds()`
- `SkinDefs()`
- `OrganicBody()`

Aus der Mission vom 2026-10-06 hervorgegangen.
