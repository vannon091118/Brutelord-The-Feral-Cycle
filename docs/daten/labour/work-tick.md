# work-tick

## work-tick

Spiegel-Datei für `src/domain/labour/work-tick.js`.

## Verantwortung

Der Takt der Kolonie und **nur der Takt**: Aufträge fortschreiben, Ereignisse
anwenden, Essenz, Brut, Bauplätze, Popups. Welcher Dungling welche Arbeit
bekommt, steht nicht hier — der Takt ruft je Dungling `orderStep()` aus
`order-job.js` und schreibt zurück, was er bekommt. `spendOrder()` fällt eine
erledigte Zeile heraus. Die alte Fassung suchte einem freien Dungling
selbsttätig eine Arbeit; diese Umkehr ist der Kern der Befehlsschicht.

`hasWork()` ist die Frage, ob der Takt überhaupt laufen muss: offene Popups,
ein laufender Auftrag, ein beschäftigtes Gebäude oder ein Bauplatz mit Essenz
in der Kasse. Wer sie beantwortet, muss sie so beantworten, wie `refill()` sie
sieht — sonst dreht die Uhr, ohne dass etwas passiert.

## Schnittstellen

- `advanceWork()`
- `isStationJob()`
- `hasWork()`
- `isBusy()`
- `advanceWorkers()`
- `staffWorkers()`
- `applyEvent()`
- `addPopup()`
- `agePopups()`
- `advanceBuildings()`
- `brood()`
