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

## Schnittstellen

- `AETHER_CONFIG` — die eingefrorenen Zahlen der Aether-Ökonomie
- `depthFactorOf()` — der Tiefen-Faktor, 0 über flachem Erdreich

Aus der Migration vom 2026-10-05 hervorgegangen.
