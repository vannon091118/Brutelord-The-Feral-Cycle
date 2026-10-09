# ResourceRail

## resourcerail

Spiegel-Datei für `src/ui/ResourceRail.jsx`.

## Verantwortung

Die Resource Rail des HUD: fünf Plätze in der Reihenfolge der Ressourcenmatrix aus
`VISION-CORE-LOOP.md` — Essenz und Biomasse aus der Basis, Aether aus der Tiefe, Blutstein
aus dem Raid, und als letzter Platz der Abstieg. Der Rang macht die Hierarchie sichtbar
und nicht nur behauptet: Essenz ist der einzige Platz, der wächst, die beiden
Tiefenwährungen bleiben kleiner und sinken auf halbe Deckkraft, solange nichts in ihnen
liegt, und Biomasse steht gestrichelt da, weil die Domäne sie noch nicht füllt.

Gelesen wird ausschließlich `cycle.aether.stored` und `cycle.bloodstone.stored`. Fehlt ein
Ledger im geladenen Spielstand, zeigt der Platz den Gedankenstrich: die Leiste erfindet
keine Null, sie fragt. Gerechnet, entschieden und verbraucht wird hier nichts — den
Abstieg fragt die Etagenplakette, alles andere liest die Leiste nur. Die Bauten
reicht sie unveraendert an diese Plakette weiter, weil der offene Abstieg seit
dem Leiterschacht an einem fertigen Bau haengt.

## Schnittstellen

- `storedOf()`
- `deepProps()`
- `ResourceRail({ essence, depth, cycle, buildings, onDescend })`

Neu am 2026-10-06 mit der Resource Rail.
