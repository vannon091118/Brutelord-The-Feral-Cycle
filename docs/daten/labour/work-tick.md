# work-tick

## work-tick

Spiegel-Datei für `src/domain/labour/work-tick.js`.

## Verantwortung

Der Arbeitstakt der Kolonie: Befehle, Essenz, Brut, Bauplätze, Popups. Der Takt
**entscheidet nicht mehr, wer arbeitet** — er liest die Befehlsliste des
Dunglings und macht aus ihrem Kopf einen Auftrag. Nur wo noch keine Zeile steht
und Arbeit offen ist, fuellt `stockedWorker()` eine nach: erst die Lieferung an
den naechsten offenen Bauplatz, sonst die zugewiesene Station. Wer weder Befehl
noch Zuweisung hat, steht — das ist die Umkehr gegenueber der alten Fassung, in
der `staffWorkers()` jedem freien Dungling selbsttaetig eine Arbeit suchte.

## Schnittstellen

- `advanceWork()`
- `isStationJob()`
- `hasWork()`
- `isBusy()`
- `advanceWorkers()`
- `fulfilled()`
- `applyEvent()`
- `addPopup()`
- `agePopups()`
- `staffWorkers()`
- `orderStep()`
- `stockedWorker()`
- `assignmentFor()`
- `deliveryOrder()`
- `stationOrder()`
- `relievedWorker()`
- `advanceBuildings()`
- `buildings()`
- `brood()`

Aus der Migration vom 2026-10-05 hervorgegangen.
