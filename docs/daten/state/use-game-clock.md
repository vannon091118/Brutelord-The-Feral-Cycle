# use-game-clock

## use-game-clock

Spiegel-Datei für `src/state/use-game-clock.js`.

## Verantwortung

Der eine Herzschlag im Browser. Statt vier Intervallen und einem Timer-Bündel hält dieser Hook
genau einen `setInterval`; was ein Takt tut, entscheidet `game-clock.js`, und was der
Spielzustand daraus macht, entscheidet der Reducer.

Der Effekt hängt an nichts, was der Takt selbst verändert: kein Phasenwechsel baut die Uhr neu
auf, also kann eine Phasenwechsel-Pause keine Timer verlieren.

## Schnittstellen

- `useGameClock()`

Aus der Vereinheitlichung der Spielzeit vom 2026-10-06 hervorgegangen.
