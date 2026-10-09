# building-config

## building-config

Spiegel-Datei für `src/domain/buildings/building-config.js`.

## Verantwortung

Baubare Objekte: Typen, Grundflächen, Preise, Startvorrat. `START_ESSENCE` ist
`COST.extractor + OPENING_DIGS * miningCost` — der billigste Bau und drei
Abbaue. Die Zahl ist keine Bequemlichkeit, sondern die Regel: sie liegt unter
`COST.extractor + COST.swarmHost`, der Startvorrat kauft also nie zwei Türen
zugleich. Wer sie hebt, hebt die erste Entscheidung des Spiels auf; die Gruppe
`opening` hält das fest. `PLACEMENT_REASON` benennt die zwei Wege, auf denen ein
Bau keinen Platz findet: gar kein freier Boden oder freier Boden, aber keine
Fläche in der Grundfläche des Baus. Der Grund ist ein Wert, kein Satz — die
Sätze stehen dort, wo sie gelesen werden.

**Der Leiterschacht ist ein Bau wie jeder andere** (`LADDER_SHAFT`, Kosten 8,
ein Feld): er trägt Label, Grundfläche und Preis aus derselben Tabelle. Er ist
damit kein Sonderfall im Bauablauf — was ihn besonders macht, entscheidet nicht
seine Definition, sondern `ladderOpen()` im Kreislauf.

## Schnittstellen

- `BUILDING_DEFS` — Label, Grundfläche, Preis je Typ, auch `LADDER_SHAFT`
- `BUILDING_TYPE` — `SWARM_HOST`, `ESSENCE_EXTRACTOR`, `BRUTE_LORD`, `LADDER_SHAFT`
- `PLACEMENT_REASON` — `NO_FLOOR`, `NO_SPACE`
- `buildingDef()`
- `canAfford()`

Aus der Migration vom 2026-10-05 hervorgegangen.
