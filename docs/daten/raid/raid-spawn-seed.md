# raid-spawn-seed

## raid-spawn-seed

Spiegel-Datei für `src/domain/raid/raid-spawn-seed.js`.

## Verantwortung

Der Einmarschspunkt: eigener Hash, eigener Strom, aus dem Ticket gespeist. Nur Felder, die
wirklich auf der Karte liegen und unverbaut sind. Die Reihenfolge dieser Liste ist Teil des
Replay-Formats (D38): sie ist Rasterreihenfolge und darf ohne eine Fassungserhöhung nicht
umsortiert werden.

## Schnittstellen

- `mixRaid()`
- `unitOf()`
- `entrySeed()`
- `isFree()`
- `candidates()`
- `entryPointFor()`

Aus der Migration vom 2026-10-05 hervorgegangen.
