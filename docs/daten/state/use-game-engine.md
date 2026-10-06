# use-game-engine

## use-game-engine

Spiegel-Datei für `src/state/use-game-engine.js`.

## Verantwortung

Der Spielmotor des Slices — reine Komposition: Reducer (Wahrheit) + eine Uhr (`useGameClock`)
+ Befehle (UI-Eingang). Die Uhr fragt den Zustand, sie besitzt ihn nicht; sie ist die einzige
der beiden Zeiten im Browser. Der Motor nimmt die **ganze Sitzung** und nicht nur den Seed:
der Seed startet die Welt, der Traeger-Token wandert weiter in den Speicher-Takt, damit
derselbe Stand, der lokal landet, auch zum Server geht.

Eine Klammer liegt um `dispatch`: jeder Befehl — der des Spielers und der der Uhr — wandert
zuerst in ein Lauf-Protokoll (`createRunLog`/`recordInput` aus `domain/replay`) und dann in den
Reducer. Das Protokoll liegt in einer Ref und nicht im Zustand, kostet also keinen Render;
auseinandergehalten wird es vom Replay nur durch den Seed, denn allein die Eingaben sind die
zweite Hälfte eines reproduzierbaren Laufs. `send` bleibt stabil, damit der Effekt der Uhr
nicht bei jedem Takt neu aufgesetzt wird.

## Schnittstellen

- `useGameEngine()`

Aus der Migration vom 2026-10-05 hervorgegangen.
