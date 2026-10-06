# LabPanel

## labpanel

Spiegel-Datei für `src/ui/stone/LabPanel.jsx`.

## Verantwortung

Das Labor des Brutlords: Inventar links, Arbeitstisch rechts, Kauf oben. Ohne Stein im Slot
und ohne freien Dungling gibt es nichts zu erschaffen.

Die Platzierung ist ein **Tippen, kein Ziehen**: ein Stein im Pool wird angewählt, ein Platz
am Arbeitstisch nimmt ihn auf; ohne Auswahl hebt ein belegter Platz den Stein wieder heraus.
Zwei Führungen nacheinander haben dieselbe Wirkung wie eine, weil die Auswahl nach dem
Ablegen wieder leer ist. Im Inventar liegen nur freie Steine — wer einen verbrauchten Stein
sieht, sieht einen, der im Gerüst steckt.

Ziehen wurde bewusst entfernt: HTML5-Drag und -Drop feuert auf Touch nicht, und die alte
Fassung übergab den Platz in vertauschter Reihenfolge, sodass `placeStone()` jeden Stein
als unbekannten Slot behandelte. Der Tippweg braucht keine DataTransfer und ist mit einem
Finger bedienbar.

## Schnittstellen

- `LabHeader()`
- `LabInventory()`
- `LabTray()`
- `MakeRow()`
- `MutantList()`
- `LabFooter()`
- `LabWorkspace()`
- `pickSlot()`
- `mutantRows()`
- `LabPanel()`

Aus der Migration vom 2026-10-05 hervorgegangen.
