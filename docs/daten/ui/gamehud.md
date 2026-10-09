# GameHud

## gamehud

Spiegel-Datei für `src/ui/GameHud.jsx`.

## Verantwortung

Das HUD unten: das ausgewählte Bauwerk, das Baumenü (erst nach dem ersten freien Boden) und
die Hinweiszeile. Alle drei lesen nur, was im Reducer passiert ist — keiner von ihnen
entscheidet etwas. Das Baumenü bekommt die Bauplatz-Frage über `selectPlacement()`
gereicht, damit es denselben Grund nennen kann, den die Ansicht malt. Den Kreislauf reicht
das HUD an die Hinweiszeile durch, damit die Etagenplakette den offenen Abstieg kennt.

Das HUD ist am unteren Rand verankert (`absolute inset-x-0 bottom-0`) und liegt über dem
Feld, statt es zu verkleinern — die Bühne füllt das ganze Fenster, der HUD schwebt darüber.

## Schnittstellen

- `SelectedBuilding()`
- `BuildMenuSlot()`
- `GameHud()`

Aus der Migration vom 2026-10-05 hervorgegangen.
