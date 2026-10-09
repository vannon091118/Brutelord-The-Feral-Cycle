# TileActionMenu

## tileactionmenu

Spiegel-Datei für `src/ui/TileActionMenu.jsx`.

## Verantwortung

Kontextmenü an genau einem Erdblock. Die Welt bleibt darunter vollständig sichtbar. Das Menü
enthält genau eine Aktion: Abbau. Es misst in `useLayoutEffect` den Kasten, in dem es hängt,
und klemmt sich noch vor dem ersten Anstrich hinein — deshalb bleibt es beim ersten Aufbau
unsichtbar, bis die Position steht. `flipped` dreht die Einflugrichtung. Drei Wege schließen
es: der ✕-Knopf im Kopf, Escape und ein Rechtsklick (`useCloseGestures`).

## Schnittstellen

- `TileMenuTitle()`
- `TileMenuHint()`
- `useCloseGestures()`
- `TileActionMenu()`

Aus der Migration vom 2026-10-05 hervorgegangen.
