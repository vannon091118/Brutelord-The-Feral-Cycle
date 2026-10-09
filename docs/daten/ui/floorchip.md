# FloorChip

## floorchip

Spiegel-Datei für `src/ui/FloorChip.jsx`.

## Verantwortung

Die Etagenplakette, seit dem 2026-10-06 der letzte Platz der Resource Rail: auf welcher
Tiefe steht der Hive, und geht es noch tiefer. Ohne Tiefe gibt es den Platz nicht — die
Plakette hängt an der Hinweiszeile, nicht an jeder Leiste, die schon einen Platz trägt. Ob
der Abstieg offen ist, liest sie aus `descendOpen()` im Kreislauf: erst der fertige
Leiterschacht, dann frei bis zur freien Leiter, darunter nur gegen Blutstein. Die Bauten
kommen von oben herein, damit die Plakette den Schacht kennt; sie entscheidet die Regel
nicht — sie fragt sie, und sie fragt genau einmal. Der geschlossene Titel nennt den
Grund, weil die Tür zwei hat: ohne Leiterschacht ruft er zum Bau, an der Grenze nennt er
die Tiefe.

Der Platz trägt den Sonderrang `floor`: Eine Kante in Core trennt ihn von den Vorräten,
und sein Ton wechselt mit der Antwort. Der Knopf sagt den Grund als Titel und als
`aria-label`, statt nur `↓` zu zeigen; sein Puls (`dl-rail-action--open`) läuft nur,
solange der Abstieg offen ist, und die Tiefe tickt beim Sprung neben ihm.

## Schnittstellen

- `descendTitle()`
- `FloorChip()`

Aus der Migration vom 2026-10-05 hervorgegangen; Platz in der Rail am 2026-10-06.
