# use-mining-crumbs

## use-mining-crumbs

Spiegel-Datei für `src/world/particles/use-mining-crumbs.js`.

## Verantwortung

Erdkrümel für den Abbau. Rein visuell: die Partikel folgen dem Abbau-Tick der Domäne, aber
es gibt keine Partikelwahrheit im Spielzustand. Alles ist deterministisch aus dem Tick
abgeleitet — kein Math.random.

## Schnittstellen

- `makeCrumbs()`
- `useMiningCrumbs()`
- `timeout()`

Aus der Migration vom 2026-10-05 hervorgegangen.
