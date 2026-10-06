# game-time

## game-time

Spiegel-Datei für `src/state/game-time.js`.

## Verantwortung

Der Takt der Sim-Uhr als Tabelle: welche Aktion in welchem Abstand fällig wird und wann sie
schweigt. Die Abstände und die Bedingungen stammen aus der Domäne, hier stehen sie nur
nebeneinander — eine Regel pro Ort.

`heartbeatMs` ist der kleinste Takt der Domäne und deshalb abgeleitet, nicht gesetzt: wer
`miningTickMs` oder den Wurzel-Takt senkt, senkt den Herzschlag mit. `maxStepMs` deckelt den
Schritt, den ein einziger Takt nachtragen darf; was darüber liegt, ist Abwesenheit und kein
Spielzug.

## Schnittstellen

- `GAME_TIME`
- `TICKS`

Aus der Vereinheitlichung der Spielzeit vom 2026-10-06 hervorgegangen.
