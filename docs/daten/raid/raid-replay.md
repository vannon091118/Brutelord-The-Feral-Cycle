# raid-replay

## raid-replay

Spiegel-Datei für `src/domain/raid/raid-replay.js`.

## Verantwortung

Der Replay-Check: das Log nachrechnen und den Endzustand vergleichen — ohne Server. Der
Client behauptet einen Endzustand; der Server hält seinen eigenen daneben.

## Schnittstellen

- `replayRaid()`
- `replayMatches()`

Aus der Migration vom 2026-10-05 hervorgegangen.
