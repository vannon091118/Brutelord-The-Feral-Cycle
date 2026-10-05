# raid-replay

## raid-replay

Spiegel-Datei für `src/domain/raid/raid-replay.js`.

## Verantwortung

Der Replay-Check: das Log nachrechnen und den Endzustand vergleichen — ohne Server. Der
Client behauptet einen Endzustand; der Server hält seinen eigenen daneben.

Die Länge wird **vor** der Rechnung geprüft, nicht danach. `record()` kopiert bei jedem
abgesetzten Schritt das ganze Log, deshalb kostet ein langes Log überproportional viel, und
gemessen kostete ein Log mit 2998 Schritten rund 29 ms Rechenzeit. `replayOverflow()` ist der
Vergleich gegen `RAID_CONFIG.maxActions`; er kostet nichts und verhindert die Rechnung
ganz. Die Obergrenze steht deshalb in der Domäne und nicht im Server: beide benutzen
dieselbe Funktion, und eine zweite Regel am Server dürfte der Client umgehen.

## Schnittstellen

- `replayRaid()`
- `replayOverflow()`
- `replayMatches()`

Die Zahlen zu beiden Spalten stehen in [`Docs/BACKEND-PLAN.md`](../../../Docs/BACKEND-PLAN.md).
Aus der Migration vom 2026-10-05 hervorgegangen.
