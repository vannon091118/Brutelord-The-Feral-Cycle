# onboarding-schedule

## onboarding-schedule

Spiegel-Datei für `src/domain/onboarding/onboarding-schedule.js`.

## Verantwortung

Der Zeitplan des Onboardings als Tabelle. Was der Intervall-Tick tun soll: null heisst, der
Job laeuft gerade nicht.

## Schnittstellen

- `spawnRemainderMs()`
- `miningBurstEveryTicks()`
- `totalMiningTicks()`
- `intervalAction()`
- `scheduleFor()`

Aus der Migration vom 2026-10-05 hervorgegangen.
