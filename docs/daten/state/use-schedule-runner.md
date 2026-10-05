# use-schedule-runner

## use-schedule-runner

Spiegel-Datei für `src/state/use-schedule-runner.js`.

## Verantwortung

Die Sim-Uhr. Sie kennt keine Zeiten und keine Regeln: sie holt den Plan aus der Domäne
(`scheduleFor`) und führt ihn aus. Der Spielzustand entsteht ausschließlich im Reducer.

## Schnittstellen

- `startInterval()`
- `useScheduleRunner()`

Aus der Migration vom 2026-10-05 hervorgegangen.
