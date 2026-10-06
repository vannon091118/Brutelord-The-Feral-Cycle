# bloodstone-config

## bloodstone-config

Spiegel-Datei für `src/domain/economy/bloodstone-config.js`.

## Verantwortung

Blutstein ist die Währung, die nur ein Raubzug gegen einen feindlichen Hive hergibt. Die
eigene Basis produziert nichts, und `baseYield` steht als eingefrorene Null in der Config,
damit genau diese Aussage an einer Stelle widerlegbar bleibt. `minRaidPhase` benennt die
einzige Phase, in der Beute zählt: erst der gefallene Wächter macht einen Hive zur Quelle,
sonst wäre Blutstein ein zweites Wort für Essenz, das man im Vorbeigehen einsammelt.
`hostileHiveKind` hält den fremden Hive vom eigenen fern, und `depthCost` mit
`riskPerDepth` beschreibt den Abnehmer: jede Etage kostet Vorrat und erhöht das Risiko,
`maxDepth` und `maxRisk` ziehen die Grenze. Alles sind eingefrorene Fakten, damit die
Abnahme gegen die Config rechnen kann statt gegen abgeschriebene Zahlen.

## Schnittstellen

- `BLOODSTONE_CONFIG`
