# world-seed

## world-seed

Spiegel-Datei für `src/domain/world/world-seed.js`.

## Verantwortung

Der Spielerseed kommt aus dem Konto als Hex, die Domäne rechnet mit einer Zahl. Diese Funktion
ist die einzige Tür: Zahl bleibt Zahl, Hex wird gelesen. Sonst entscheidet der Zufall, ob ein
Seed aus Buchstaben oder nur Ziffern besteht — `a1b2c3d4` plus Zahl ist `NaN`, `12345678`
plus Zahl ist eine Riesenzahl.

Die **Auslegung** steht seit dem Determinismus-Audit in `seed-input.js`; hier steht nur noch
ihre werfende Projektion. Gültig heißt eine Zahl, fehlend heißt die anonyme Welt, und alles
andere ist ein `SeedError`. Damit gibt es genau eine Regel an einem Ort statt eines
Rückfalls hier und eines zweiten dort, und eine unmögliche Eingabe fällt auf, statt still die
Welt des Seeds `00000000` zu bauen.

Wer **fragen** statt werfen will, nimmt `worldSeed32()` und bekommt `null` statt eines Wurfs.
Beide Namen und `SeedError` werden von hier nach aussen gereicht, obwohl die Regel in
`src/domain/seed/seed-input.js` steht: Der Aufrufer soll eine Zeile importieren, nicht zwei.

## Schnittstellen

- `worldSeed()` — die werfende Projektion von `worldSeed32()`
- `worldSeed32()` — die Auslegung selbst, `number` oder `null`
- `SeedError` — der Wurf der werfenden Tür

Aus der Migration vom 2026-10-05 hervorgegangen, im Determinismus-Audit vom 2026-10-06 um die
Auslegung nach `src/domain/seed/seed-input.js` entlastet.
