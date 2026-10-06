# floor

## floor

Spiegel-Datei für `src/domain/world/floor.js`.

## Verantwortung

Die Etage: eine Ebene ist eine Funktion aus Spielerseed und Tiefe, und Tiefe 0 ist die
Startwelt. Der LCG laeuft nur vorwaerts — der Spielerseed bleibt eine Eingabe und wird nie
aus dem Welt-Seed zurueckgerechnet. Eigene Hash-Instanz, nicht `tileSeed`: der Etagen-Seed
ist Weltwahrheit. Fail closed: eine negative Tiefe ist kein Sprung, sondern eine kaputte
Aktion. Dasselbe gilt fuer den Seed — `floorSeed()` liest ihn ueber `worldSeed32()` und gibt
bei ungueltiger Eingabe `null` weiter, statt eine Etage aus der Null zu bauen; `createFloorWorld()`
reicht die Null durch.

## Schnittstellen

- `createFloorWorld()`
- `floorSeed()`
- `canDescend()`
- `isFloorTarget()`

Aus der Migration vom 2026-10-05 hervorgegangen.
