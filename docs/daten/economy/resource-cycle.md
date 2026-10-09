# resource-cycle

## resource-cycle

Spiegel-Datei für `src/domain/economy/resource-cycle.js`.

## Verantwortung

Der Ort, an dem Aether, Blutstein und die Etagen sich treffen — die beiden Ledger
bleiben getrennt, der Kreislauf verbindet sie. Er hält die zwei Quellen und die
zwei Abnehmer, die den einzelnen Kreisläufen fehlten, und er hält sie zusammen,
damit die Reihenfolge nicht in zwei Reducern auseinanderläuft.

**Blutstein kauft die Tiefe.** `lowestReachable()` nennt die tiefste erreichbare
Etage als Summe aus der freien Leiter (`DEEPEST_FLOOR`) und der im Ledger
gekauften Tiefe; ein leeres Ledger liefert genau die freie Leiter, weshalb die
Welt ohne Blutstein so tief bleibt, wie sie vor diesem Kreislauf war.
`buyFloor()` ist der Abnehmer: verweigert ohne Vorrat, verweigert über
`maxDepth` oder am `maxRisk` mit einem stabilen Schlüssel und **demselben
Ledger-Objekt** — eine Verweigerung hinterlässt keine zweite Wahrheit.
`descendOpen()` ist die Tür für die Oberfläche: sie nennt frei (`canDescend`) **oder**
gekauft (`canUnlockDepth`) als ein Ja, damit Plakette und Leiter den bezahlten Abstieg unter
der freien Tiefe nicht sperren.

**Der Leiterschacht ist das Tor.** `ladderOpen()` liefert genau dann wahr, wenn
ein fertiger Bau vom Typ `LADDER_SHAFT` im Stand steht — ein Bauplatz nicht, ein
fehlender nicht. `descendOpen()` liest ihn als erste Bedingung: ohne Schacht
ist jede Tür zu, auch die kostenlose erste Etage; mit Schacht trägt die freie
Leiter wie bisher, und darunter kauft `buyFloor()`. Damit hängen Raid und
zweite Etage an einer sichtbaren Handlung des Spielers statt an einem Sprung
ins Leere.

**Der Raid liefert, was die eigene Basis nicht hat.** `lootInto()` bucht den
Blutstein der Beute in den Vorrat; Beträge, die keine positiven Zahlen sind,
lassen das Ledger unberührt. Die Ader des Aethers liegt unter der freien Leiter:
seine Schwelle steht in `aether-config.js` als `DEEPEST_FLOOR + 1`, also
produziert nur eine **gekaufte** Etage überhaupt Aether. Dass der Aether dort
entsteht, steht in `digInto()` bei `mining.js`, weil der Grab ihn herausgibt.

**`cycleOf()` ist die Tür für alte Spielstände.** Ein Stand aus der Zeit vor
diesem Slice hat kein `economy`-Feld; die Funktion legt dann einen leeren
Kreislauf an, statt am fehlenden Feld zu scheitern. Das ist keine
Stilentscheidung, sondern der Unterschied zwischen einem ladbaren und einem
kaputten Spielstand — und weil der Zustand sonst nur wächst, bleibt der alte
Stand bis auf dieses Feld unberührt.

## Schnittstellen

- `createCycle()` — beide Ledger, leer, als eingefrorener Behälter
- `cycleOf(state)` — der Kreislauf des Standes, notfalls ein leerer
- `ladderOpen(buildings)` — steht ein fertiger Leiterschacht
- `lowestReachable(cycle)` — freie Leiter plus gekaufte Tiefe
- `descendOpen({ depth, cycle, buildings })` — erst der Schacht, dann frei oder Blutstein
- `buyFloor(cycle)` — `{ ok, cycle }`; die Verweigerung gibt dasselbe Objekt zurück
- `lootInto(cycle, loot)` — die Beute des Raids in den Vorrat
