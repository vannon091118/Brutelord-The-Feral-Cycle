# world-seed

## world-seed

Spiegel-Datei für `src/domain/world/world-seed.js`.

## Verantwortung

Der Spielerseed kommt aus dem Konto als Hex, die Domäne rechnet mit einer Zahl. Diese
Funktion ist die einzige Tür: Zahl bleibt Zahl, Hex wird gelesen. Sonst entscheidet der
Zufall, ob ein Seed aus Buchstaben oder nur Ziffern besteht — 'a1b2c3d4' plus Zahl ist NaN,
'12345678' plus Zahl ist eine Riesenzahl.

## Schnittstellen

- `worldSeed()`

Aus der Migration vom 2026-10-05 hervorgegangen.
