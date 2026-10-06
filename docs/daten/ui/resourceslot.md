# ResourceSlot

## resourceslot

Spiegel-Datei für `src/ui/ResourceSlot.jsx`.

## Verantwortung

Der eine Platz der Resource Rail: der Name in der Zeile darüber, darunter die Glyphe mit
dem Wert. Rang und Zustand sind Klassen und keine Entscheidungen — der Platz kennt keine
Regel der Ökonomie, er malt, was der Aufrufer ihm als Zahl, als Wort und als Ton gibt.
Der Rang (`lead`, `deep`, `floor`) wiegt den Platz, der Zustand (`live`, `empty`,
`locked`) nimmt ihm Deckkraft. Fehlt der Wert ganz, zeigt der Platz den Gedankenstrich
statt einer erfundenen Null.

Die Glyphe bleibt beim **Wert** und wandert nicht zum Namen: `scripts/browser/read.mjs`
liest die Essenz als `◆ <Zahl>` aus der Hinweiszeile. Die Abnahme liest Text, und wer den
Text umstellt, stellt die Abnahme um — der Platz hält darum `◆ 12` als einen Lauf
zusammen.

Der Wert trägt seinen eigenen Schlüssel: ändert er sich, hängt React genau diesen Knoten
neu ein und die Tick-Animation läuft. Das ist Rückmeldung ohne Zustand, ohne Uhr und ohne
Effekt — dieselbe Technik, mit der der arbeitende Erdblock seine Feder trägt. Ein Platz
mit Kindern (die Etage trägt dort ihren Knopf) überlässt ihnen die Wertzeile.

## Schnittstellen

- `ResourceSlot()`

Neu am 2026-10-06 mit der Resource Rail.
