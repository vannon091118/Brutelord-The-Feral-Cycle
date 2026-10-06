# raid-move

## raid-move

Spiegel-Datei für `src/domain/raid/raid-move.js`.

## Verantwortung

Die halbautomatische Gruppe: Befehl setzt den Pfad, Idle erkundet, nichts blockiert. Die
Erkundung würfelt aus demselben Ticket-Strom, nur mit eigener Salze. Der Schritt entsteht
aus dem Vokabular des Replays, nicht aus einer zweiten Regel. Angenommen wird nur, was das
Budget trägt; sonst bleibt der Zustand (D9). Ein wacher Wächter in Reichweite schaltet die
Idle-Erkundung ab: gebunden wird gekämpft, nicht gelaufen (D14). Die Ankunft eines
Angriffsbefehls geht durch den Router und nicht mehr am Phasentor vorbei — derselbe Weg wie
eine abgesetzte Aktion. Bleibt die Gruppe stehen, ist der Befehl tot und wird geräumt; das
entscheidet der Vergleich der Position, nicht die Identität des Zustands, weil eine
Verlustprüfung am Ende desselben Takts einen neuen Zustand liefert.

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
