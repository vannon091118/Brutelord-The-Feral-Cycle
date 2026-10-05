# BuildingNode

## buildingnode

Spiegel-Datei für `src/world/buildings/BuildingNode.jsx`.

## Verantwortung

Die Klickfläche liegt unsichtbar über der ganzen Grundfläche. Ein Bauwerk als Ganzes:
Zeichnung, Auswahlring und Klickfläche über der ganzen Grundfläche. Klicken wählt es aus —
der Rest passiert im Reducer.

Die Klickfläche trägt einen Namen und ist per Tastatur erreichbar. Sie ist die einzige
Fläche, über die ein Spieler ein fertiges Bauwerk wiederfindet; ohne Namen findet ihn nur,
wer die Grundfläche zufällig trifft, und ohne Tastaturbedienung gar nicht. Der Name folgt
dem Muster der Hive-Fläche: Beschriftung plus „anklicken".

Der Name hängt nicht an der Bildschirmposition. Wer ihn anklickt, trifft das Bauwerk, auch
wenn sich der Maßstab zwischen Aufstellen und Klick ändert — beim Öffnen des Panels
schrumpft das Feld, und ein gemerkter Pixelpunkt landet dann auf der Nachbarkachel.

## Schnittstellen

- `SelectionRing()`
- `HitArea()`
- `BuildingNode()`

Aus der Migration vom 2026-10-05 hervorgegangen.
