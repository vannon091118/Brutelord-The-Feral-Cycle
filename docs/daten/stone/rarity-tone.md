# rarity-tone

## rarity-tone

Spiegel-Datei für `src/ui/stone/rarity-tone.js`.

## Verantwortung

Der Ton einer Seltenheit — an genau einer Stelle, weil zwei Orte denselben Stein zeigen: die
Kachel im Inventar (`StoneChip`) und der Platz am Tisch (`LabBench`). Vorher trug jeder Ort
seine eigene Tabelle mit eigenen Hex-Literalen; derselbe "Seltene" Stein war im Inventar amber
und am Tisch hellblau. Jetzt liest beide Seiten `RARITY_TONE` über den Schlüssel aus
`STONE_DEFS[rarity].tone`.

Die vier Rollen sind vier unterscheidbare Zweige der Palette: grau auf `bone`, blau auf
`aether` (die einzige blaue Rolle), lila auf `hive`, gold auf `core`. `blau` stand vorher auf
`core-400` und teilte sich den Amber-Zweig mit `gold` auf `core-300` — im Inventar waren
"Selten" und "Legendär" zwei Stufen derselben Farbe. Das ist die eine Rolle, die dabei
gewechselt hat.

`SLOT_REST_TONE` ist der Ton eines Platzes ohne Stein: `core-500` und `bone-400` sind die
Werte, die dort vorher als `#e0983a` und `#9c8a6e` standen — derselbe berechnete Wert, jetzt
als Rolle gelesen statt als Literal wiederholt.

## Schnittstellen

- `RARITY_TONE`
- `SLOT_REST_TONE`
