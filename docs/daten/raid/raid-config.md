# raid-config

## raid-config

Spiegel-Datei für `src/domain/raid/raid-config.js`.

## Verantwortung

Eco-Stakes-Raid: Regeln und Zahlen, jede aus einer Config abgeleitet. Fassung des
Replay-Formats: gehört in den State-Hash (D38); Fassung 3 führt die siebenstufige
Phasenkette, die `raid-phases.js` hält — `RAID_PHASE` wird von dort weitergereicht, damit
es die Werte nur einmal gibt. Der Einmarsch gräbt orthogonal; die ferne Ecke ist (63,63),
nicht (0,0). Erde ist offen. Hartgestein ist eine Berechtigung, keine Aufpreisstufe. Fail
closed: ohne die Berechtigung kostet der Weg nichts, weil er nicht geht — null.

`maxActions` ist die Obergrenze eines eingereichten Logs und steht hier, weil sie eine Zahl
über den Raid ist und nicht über den Server. Ihr Wert ist **gemessen**, nicht gesetzt: bei
512 kostet das längste erlaubte Log rund 3,6 ms inklusive Weltbau, bei 2998
Schritten sind es rund 29 ms — dreimal das Budget. Die Begründung und der
Messlauf stehen in [`Docs/BACKEND-PLAN.md`](../../../Docs/BACKEND-PLAN.md),
das Gate ist `npm run bench:replay`.

## Schnittstellen

- `RAID_FORMAT_VERSION`
- `RAID_PHASE`
- `maxTeamGrit()`
- `teamStamina()`
- `digCost()`
- `canDig()`
- `pathCost()`
- `worstEntryDistance()`
- `approachSteps()`

Aus der Migration vom 2026-10-05 hervorgegangen.
