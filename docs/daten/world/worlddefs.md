# WorldDefs

## worlddefs

Spiegel-Datei für `src/world/WorldDefs.jsx`.

## Verantwortung

Verläufe, Filter und Muster der Welt. Erde trägt die Tiefe: warm nahe am Hive, kalt an den
Rändern des Ausschnitts.

Diese Datei trägt **die Welt** und seit dem 2026-10-06 nicht mehr die Wesen. `dl-bud`, der
Verlauf der Dungling-Schale, ist hier entfallen: das Wesen bringt sein Material selbst mit
(`look.ids` in `DunglingBody()`), weil es auch dort aussehen muss, wo es keine
Weltdefinitionen gibt — auf dem Labortisch. Was hier bleibt, ist genau das, was nur die Welt
kennt: Erde, Höhle, Licht, Hive und Atmosphäre.

## Schnittstellen

- `hiveCenter()`
- `SoilGradients()`
- `CaveGradients()`
- `LightGradients()`
- `CharacterGradients()`
- `AtmosphereDefs()`
- `WorldDefs()`

Aus der Migration vom 2026-10-05 hervorgegangen.
