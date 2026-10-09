# order-config

## order-config

Spiegel-Datei für `src/domain/orders/order-config.js`.

## Verantwortung

Die Vokabeln der Befehlsschicht. `ORDER_KIND` nennt genau die Befehlsarten, für
die es auch einen Ausführer gibt: `WORK` bindet einen Dungling an ein fertiges
Gebäude, `DELIVER` schickt ihn mit einer Ladung zu einem offenen Bauplatz.
`MOVE` und `MINE` stehen hier bewusst noch nicht — eine Konstante ohne Leser
wäre ein Versprechen ohne Deckung. `queueMax` ist die Obergrenze der
Befehlsliste eines Dunglings. Sie ist keine Bequemlichkeit, sondern eine
Byte-Frage: die Liste wandert in den Spielstand, und der hat eine Obergrenze.
Wer sie erhöht, hebt damit auch das, was ein einzelner Dungling an offenen
Befehlen tragen kann.

## Schnittstellen

- `ORDER_KIND`
- `ORDER_CONFIG`
