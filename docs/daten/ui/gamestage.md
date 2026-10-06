# GameStage

## gamestage

Spiegel-Datei für `src/ui/GameStage.jsx`.

## Verantwortung

Die Bühne: Sichtfeld plus Kontextmenü. Sie misst die verfügbare Fläche, legt das Menü im DOM
über die passende Stelle der skalierten Welt und übergibt ihm nur den Anker
(`menuAnchorFor`). Wo der Anker geklemmt wird, entscheidet das Menü selbst — es kennt als
einziger Beteiligter seine eigene gerenderte Umgebung.

## Schnittstellen

- `GameStage()`

Aus der Migration vom 2026-10-05 hervorgegangen.
