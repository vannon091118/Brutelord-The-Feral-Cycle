# use-game-actions

## use-game-actions

Spiegel-Datei für `src/state/use-game-actions.js`.

## Verantwortung

Die Befehle des Spielers. Die UI ruft sie auf — was daraus entsteht, entscheidet der
Reducer.

Zwei Wege führen nach unten, und sie sind **derselbe Befehl**: die Plakette neben der
Essenz (`descend`) und die Leiter bei 47,47 (`climbLadder`). Beide schicken
`ACTION.FLOOR_DESCEND`, also entscheidet eine Stelle — der Reducer der Etage —, ob der
Sprung frei ist oder Blutstein kostet, und die Leiter kann keine zweite Regel über die
Tiefe erfinden. Die Leiter ist die diegetische Tür, die Plakette der sichtbare Weg, wenn
der Schacht gerade nicht im Bild steht; einen dritten Einstieg gibt es nicht.

## Schnittstellen

- `useGameActions()`

Aus der Migration vom 2026-10-05 hervorgegangen.
