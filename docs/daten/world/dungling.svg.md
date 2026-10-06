# Dungling.svg

## dungling-svg

Spiegel-Datei für `src/world/Dungling.svg.jsx`.

## Verantwortung

Der Dungling: ein kleines Geschwur, das der Hive treibt. Weich, lappig und fleischig — es
arbeitet mit Wurzeln, nicht mit Werkzeug. Gezeichnet in einem Nominalsystem um (0,0), das
auf die Tile-Größe skaliert wird. Das Aussehen holt sich diese Datei einmal je Wesen-Id über
`lookOf()` und reicht es an Körper und Gesicht weiter; die Kachel wird hier nicht mehr
gelesen, denn ein Wesen, das beim Laufen sein Gesicht verliert, ist keins.

Diese Datei ist seit dem 2026-10-06 auch der Ort, an dem der **Stand** entsteht:
`creatureClasses()` legt den Klassenzettel der Figur um Füße, Körper und Gesicht, und die
Atmung trägt zusätzlich `dl-creature-breathe`, damit der arbeitende Dungling schneller atmet
als der ruhende. Die Füße bekommen den Look, weil ihr Bodenkontakt aus dem Materialverlauf
kommt.

**Die Zeichenebene bleibt für den Zeiger unsichtbar, und das ist eine Entscheidung.** Ein
Wesen, das Treffer annimmt, schluckt den Klick auf die Kachel darunter — und unter ihm liegt
im Zweifel der Erdblock, den der Spieler gerade abbauen will, oder der Hive, dessen Klick die
ganze Kette startet. Ein Hover-Zustand auf einem Weltwesen wäre also ein Tausch: ein Glanz
gegen einen verlorenen Klick. Deshalb trägt die Figur im Stand ihren Zustand (Ruhe, Schritt,
Arbeit) und die Berührung wohnt dort, wo der Zeiger das Wesen erreicht, ohne etwas zu
verdecken: auf dem Labortisch.

## Schnittstellen

- `DunglingSvg()`

Aus der Migration vom 2026-10-05 hervorgegangen.
