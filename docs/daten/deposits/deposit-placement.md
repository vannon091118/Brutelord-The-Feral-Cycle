# deposit-placement

## deposit-placement

Spiegel-Datei für `src/domain/deposits/deposit-placement.js`.

## Verantwortung

Die Platzierung: Blöcke, Isolation, Sperrzonen, Kapazität.

Die Tiefe der Etage kommt als `context.depth` herein und geht nur in die Kapazität: Wo ein
Block liegt und wie viele Kammern er trägt, entscheidet allein der Seed, damit die Karte
einer Etage mit der Tiefe nicht umzieht. Was die Tiefe ändert, ist der Inhalt — über
`capacityAtDepth()` fasst jede Kammer je Etage ein Viertel mehr, und `pool` startet voll mit
diesem Wert. Auf Etage 0 ist der Zuwachs null; die Startwelt bleibt deshalb unberührt.

**Jede Ader trägt eine Art.** `clusterAt()` zieht über `depositSalt()` und
`pickForSalt()` eine `kind` aus `DEPOSIT_KIND_ORDER`; die Art wandert im Vorrat mit und
bestimmt später den Ertrag und das Risiko — die Platzierung bleibt dabei dieselbe.

## Schnittstellen

- `createDeposits()`
- `blockOrigins()`
- `clusterAt()`
- `sizeFor()`
- `capacityFor()`
- `cellsFor()`
- `freeCell()`
- `blockedCells()`
- `isBlocked()`
- `sameSpot()`

Aus der Migration vom 2026-10-05 hervorgegangen.
