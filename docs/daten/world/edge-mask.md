# edge-mask

## edge-mask

Spiegel-Datei für `src/domain/world/edge-mask.js`.

## Verantwortung

Nachbarschafts-Byte: Form folgt Nachbarn, nie dem Rechteck. Erde schließt an Erde an; vor
Freifläche und außerhalb bleibt sie Fläche. Wo das Land unentdeckt bleibt: die Seiten, an
denen die Kantenwand steht. Die vier Seiten als Flag-Objekt — die Formwerkzeuge lesen
Wörter, kein Byte. Eine offene Diagonale zwischen zwei geschlossenen Seiten schneidet ein.

## Schnittstellen

- `isEdgeCell()`
- `isUnseen()`
- `neighborTile()`
- `edgeMask()`
- `hiddenMask()`
- `maskHas()`
- `sideFlags()`
- `notchFlags()`

Aus der Migration vom 2026-10-05 hervorgegangen.
