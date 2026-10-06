# mining

## mining

Spiegel-Datei für `src/domain/actions/mining.js`.

## Verantwortung

Abbau-Logik: wer darf, wie weit, welcher Erd-Zustand. Der Abbau kostet — die einzige Stelle,
die entscheidet, ob er bezahlt ist.

Der Abschluss eines Grabs ist zugleich ein Schritt im Ressourcenkreislauf, und er steht
hier, weil der Grab ihn herausgibt und nicht ein Reducer ihn erfindet: `digInto()` bucht die
Aether-Ausbeute der Tiefe in den Kreislauf und lässt den Hive mutieren, sobald der Vorrat
den Preis der Mutation trägt. Der Verbraucher braucht dafür keine Taste — der Hive ist der
Verbraucher, und das Koma seiner Körperform ist der Deckel. Die Ausbeute je Takt wächst mit
der Zahl der Mutationen (`digAbilityOf`), also hebt die Investition die nächste Ausbeute: das
ist die Fähigkeit, die aus dem Aether entsteht. Über flachem Erdreich liefert
`aetherYieldFor()` die Null der Config, und `depositAether()` gibt dann **dasselbe** Ledger
zurück — ein flacher Grab lässt den Kreislauf damit nachweislich unberührt. Die Kosten des
Abbaus bleiben davon unberührt und kommen weiter aus `essence-economy.js`.

## Schnittstellen

- `miningTotalTicks()`
- `miningCost()`
- `earthHealthForProgress()`
- `createMiningJob()`
- `advanceMiningJob()`
- `isMiningFinished()`
- `isMineableEarth()`
- `touchesUsableSpace()`
- `canMineTile()`
- `canAffordMining()`
- `mineableFrontierIds()`
- `minedFloorTile()`
- `mineTile()`
- `digInto()` — die Ausbeute der Tiefe und die Mutation, die sie bezahlt
- `depositInfoAt()` — welche Ader an der Kachel liegt und wie riskant sie ist
- `depositRiskClassAt()` — die Risikoklasse der Ader an der Kachel

Aus der Migration vom 2026-10-05 hervorgegangen.
