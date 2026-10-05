# raid-move

## raid-move

Spiegel-Datei für `src/domain/raid/raid-move.js`.

## Verantwortung

Die halbautomatische Gruppe: Befehl setzt den Pfad, Idle erkundet, nichts blockiert. Die
Erkundung würfelt aus demselben Ticket-Strom, nur mit eigener Salze. Der Schritt entsteht
aus dem Vokabular des Replays, nicht aus einer zweiten Regel. Angenommen wird nur, was das
Budget trägt; sonst bleibt der Zustand (D9).

## Schnittstellen

- `exploreGoal()`
- `actionToward()`
- `approachTile()`
- `orderFrom()`
- `arrived()`
- `exploreOrder()`
- `parseGoal()`
- `tickMove()`

Aus der Migration vom 2026-10-05 hervorgegangen.
