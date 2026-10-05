# raid-config

## raid-config

Spiegel-Datei für `src/domain/raid/raid-config.js`.

## Verantwortung

Eco-Stakes-Raid: Regeln und Zahlen, jede aus einer Config abgeleitet. Fassung des
Replay-Formats: gehört in den State-Hash (D38). Der Einmarsch gräbt orthogonal; die ferne
Ecke ist (63,63), nicht (0,0). Erde ist offen. Hartgestein ist eine Berechtigung, keine
Aufpreisstufe. Fail closed: ohne die Berechtigung kostet der Weg nichts, weil er nicht geht
— null.

## Schnittstellen

- `maxTeamGrit()`
- `teamStamina()`
- `digCost()`
- `canDig()`
- `pathCost()`
- `worstEntryDistance()`
- `approachSteps()`

Aus der Migration vom 2026-10-05 hervorgegangen.
