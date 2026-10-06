# dungling-anim

## dungling-anim

Spiegel-Datei für `src/world/dungling/dungling-anim.js`.

## Verantwortung

Zustand → Darstellung. Der Dungling führt keine Regie über sich selbst: die Domäne sagt Idle,
Move oder Work, hier wird es nur sichtbar. `dunglingAnimation()` übersetzt den Domänenzustand
in die Animationsklasse des Körpers und in die zwei Wahrheitswerte `working` und `moving`, die
Gesicht und Werkzeug lesen.

Seit dem 2026-10-06 trägt dieselbe Funktion zusätzlich den **Stand**: `mood` faltet Spawning
und Idle zu `rest`, Move zu `move` und Work zu `active`. `creatureClasses()` macht daraus die
Klassenzettel der Figur — `dl-creature` plus genau ein Stand, dazu `dl-creature--mutant` für
ein Wesen aus dem Labor. Der Unterschied zu den Klassen der Animation ist Absicht: die
Animationsklasse beschreibt eine Bewegung, die Klasse des Standes beschreibt ein Wesen, und
`creature.css` malt daraus Ruhe, Schritt, Arbeit und den gesperrten Platz. Der Mutant trägt
dieselbe Vokabel, weil er dasselbe Wesen in einer anderen Haut ist.

## Schnittstellen

- `CREATURE_STATE`
- `dunglingAnimation()`
- `creatureClasses()`

Aus der Migration vom 2026-10-05 hervorgegangen, am 2026-10-06 um den Stand erweitert.
