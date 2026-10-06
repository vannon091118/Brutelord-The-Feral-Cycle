# aether-config

## aether-config

Spiegel-Datei für `src/domain/economy/aether-config.js`.

## Verantwortung

Aether ist die Währung der Tiefe, und seine Zahlen stehen an genau einer Stelle.
Die Schwelle trennt flaches von tiefem Erdreich: Darüber entsteht nichts, darunter
liegt die Ader. Der Faktor wächst mit der Tiefe, aber er beginnt bei der Schwelle
mit dem Boden — sonst wäre die erste tiefe Etage billiger als die Schwellentiefe.
Mutation kostet Aether und Risiko; das Risiko steigt je Mutation bis zum Deckel,
und der Deckel ist die Grenze, an der die Körperform nicht weiter getrieben wird.

**Die Schwelle liegt unter der frei erreichbaren Tiefe** — sie ist
`DEEPEST_FLOOR + 1` und nicht mehr die Zahl drei. Das ist die eine Entscheidung,
die den Kreislauf schließt: Solange Aether schon auf einer Etage entstand, die der
Spieler ohne jede Gegenleistung erreicht, war Blutstein eine zweite Währung neben
der Essenz und keine Bedingung. Jetzt beginnt die Ader genau eine Etage unter der
freien Leiter, und diese Etage kostet Blutstein — also führt der Weg zum Aether
durch den Raid. Die Schwelle wandert mit der Leiter (`floor-config.js`), damit die
Aussage „Aether liegt unter der freien Tiefe" eine Eigenschaft des Codes bleibt
und nicht zweier Zahlen, die jemand später einzeln verstellt.

## Schnittstellen

- `AETHER_CONFIG` — die eingefrorenen Zahlen der Aether-Ökonomie
- `depthFactorOf()` — der Tiefen-Faktor, 0 über flachem Erdreich

Aus der Migration vom 2026-10-05 hervorgegangen.
