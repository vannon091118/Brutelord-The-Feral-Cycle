# raid-sim

## raid-sim

Spiegel-Datei für `src/domain/raid/raid-sim.js`.

## Verantwortung

Die deterministische Gegenseite des Replay-Checks. `raid-replay.js` rechnet ein
**eingereichtes** Log nach; diese Datei **erzeugt** eines — aus einem Seed und einer
Wortliste, ohne Zufallsquelle, ohne Zeit, ohne Server. Beide laufen über dieselbe
`applyAction()`-Kette, deshalb ist ein simulierter Lauf genau das, was ein Client auch
absetzen würde.

Das Vokabular sind elf Wörter: die vier `MOVE_*`-Schritte, ihre vier `DIG_*`-Gegenstücke,
dazu `ATTACK`, `LOOT` und `SACRIFICE`. Ein Wort, das die Phase nicht erlaubt, ist kein
Fehler, sondern ein No-Op — so sieht ein eingereichtes Log aus, das gesperrte Aktionen
mitschickt.

Das Salz wandert mit dem Schritt: `RAID_SIM.salt + index * 977`. Ohne diese Verschiebung
zöge jeder Schritt denselben Hash und damit dasselbe Wort, und die Simulation wäre ein Lauf
gegen eine Wand statt gegen ein Terrain.

## Schnittstellen

- `RAID_SIM`
- `raidScript()`
- `raidDigest()`
- `raidSeries()`

`raidSeries()` baut die Welt des Tickets einmal, spielt das Skript über `applyAction()` ab
und gibt `{ actions, digests, state }` zurück: je Schritt ein 8-stelliger Hex-Digest des
Zustands-Hash-Eingangs. Die Zahlen sind eine Einstellung, keine Messung —
`RAID_SIM.steps` steht bei 96, und `raidScript()` deckelt jede Länge an
`RAID_CONFIG.maxActions`.

Der Grund für diese Datei sind die Golden-Tests: ein fester Seed, ein festes Skript, ein
erwartetes Ergebnis — jede Abweichung fällt an der Stelle auf, an der sie entsteht.
