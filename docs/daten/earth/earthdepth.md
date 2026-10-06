# EarthDepth

## earthdepth

Spiegel-Datei für `src/world/earth/EarthDepth.jsx`.

## Verantwortung

Das Gewicht der Erde: eine einzige dunkle Ebene über allen sichtbaren Erdflächen, die langsam
atmet. Die Grundtiefe kommt aus dem Seed der Kachel und liegt zwischen 5 und 23 Prozent — dadurch
ist keine Kachel so dunkel wie die Nachbarin, ohne dass jede einzeln animiert. Animiert wird nur
die Gruppe: ein Pfad je Kachel, aber eine Bewegung für den ganzen Verbund. Unter reduzierter
Bewegung fällt die Animation weg und das Dunkel bleibt stehen.

Sie liegt zwischen Erde und Boden, weil die Erdmasse über ihre Kachel hinausragt: der Boden
zeichnet danach und deckt den Überstand ab. Verwendet dieselbe Geometrie wie die Erdkachel,
also auch denselben Cache. Die Erdflächen bekommt sie bereits gefiltert von `TileLayer` — das Feld
filtert die sichtbaren Kacheln einmal und reicht dieselbe Liste an beide Durchgänge weiter.

## Schnittstellen

- `depthOf()`
- `EarthDepth()`

Aus dem Ring- und Schattenzug vom 2026-10-06 hervorgegangen.
