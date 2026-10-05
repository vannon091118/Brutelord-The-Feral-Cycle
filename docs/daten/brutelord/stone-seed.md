# stone-seed

## stone-seed

Spiegel-Datei für `src/domain/brutelord/stone-seed.js`.

## Verantwortung

Deterministische Streuung für den Brutlord. Eigener Hash, eigene Konstanten — ein Stein muss
aus seinem Seed exakt denselben Stein wiedergeben. Zieht einen Wert aus [0, max) aus einem
Seed mit Salz.

## Schnittstellen

- `mixSeed()`
- `unitOf()`
- `pickFrom()`
- `weightedFrom()`

Aus der Migration vom 2026-10-05 hervorgegangen.
