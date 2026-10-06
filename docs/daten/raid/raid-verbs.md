# raid-verbs

## raid-verbs

Spiegel-Datei für `src/domain/raid/raid-verbs.js`.

## Verantwortung

Die Taten des Raids, alle drei an einem Ort: Angriff, Opfer und Beute. Der Angriff ist kein
Schritt — er hat kein Ziel-Feld, sondern eine Richtungslosigkeit. Jeder Held mit AP zahlt
mit; ohne AP gibt es keinen Schlag (fail closed). Der Schaden ist die Summe des `atk` der
Teilnehmer (D28): Stats skalieren den Output, nie die Kosten. Er trifft den nächsten wachen
Wächter in Reichweite, sonst den Hive, sonst niemanden — ein Schlag ins Leere steht trotzdem
im Log, denn das Log hält die abgesetzte Aktion fest und nicht ihren Erfolg (D34). Das Opfer
nimmt den letzten Helden aus der Gruppe und füllt die Ausdauer um`RAID_SIEGE.sacrificeStamina`
(D10); es kostet mehr als es bringt erst dann nicht mehr, wenn der Übergang dazugerechnet
wird, und genau das ist sein Zweck. Die Beute wird getragen, nicht ausgezahlt.

## Schnittstellen

- `RAID_VERB`
- `attackStep()`
- `sacrificeStep()`
- `lootStep()`

Aus der Migration vom 2026-10-05 hervorgegangen.
