# hive-reducer

## hive-reducer

Spiegel-Datei für `src/state/reducers/hive-reducer.js`.

## Verantwortung

Hive-Domäne: Klick, Mutation, Ruhe. Ein Befehl ändert hier genau eine Sache — es gibt keine
Event-Kette, die weitere Befehle auslöst. Der Fortschritt wächst auch ohne Ertrag, sonst
käme die Uhr nie an ihre Schwelle.

## Schnittstellen

- `reduceHive()`
- `clicked()`
- `mutating()`
- `settled()`
- `pressed()`

Aus der Migration vom 2026-10-05 hervorgegangen.
