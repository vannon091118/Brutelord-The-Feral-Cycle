# GameStage

## gamestage

Spiegel-Datei für `src/ui/GameStage.jsx`.

## Verantwortung

Die Bühne: Sichtfeld plus Kontextmenü. Sie misst die verfügbare Fläche, legt das Menü im DOM
über die passende Stelle der skalierten Welt und übergibt ihm nur den Anker
(`menuAnchorFor`). Wo der Anker geklemmt wird, entscheidet das Menü selbst — es kennt als
einziger Beteiligter seine eigene gerenderte Umgebung.

Die Bühne teilt die Höhe mit dem HUD (`flex-1`) und misst deshalb den Platz, der nach dem HUD
bleibt — nicht das ganze Fenster. Ein Vollflächen-Overlay hat sie schon einmal getragen; es
scheiterte daran, dass das offene Baumenü die Bauplätze im Feld überdeckte.

## Schnittstellen

- `GameStage()`

Aus der Migration vom 2026-10-05 hervorgegangen.
