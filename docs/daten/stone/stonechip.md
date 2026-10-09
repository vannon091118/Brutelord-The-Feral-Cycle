# StoneChip

## stonechip

Spiegel-Datei für `src/ui/stone/StoneChip.jsx`.

## Verantwortung

Eine Essenz-Kachel im Inventar: Die Seltenheit verrät sich, der Inhalt bleibt ???. Die Kachel
ist ein Knopf und kein Zieh-Objekt — `aria-pressed` sagt, ob sie ausgewählt ist, der Ring
macht es dem Auge sichtbar. Ein zweiter Tipp auf dieselbe Kachel nimmt die Auswahl zurück.

**Der Ton ist eine Rolle, kein Farbwert.** Die Kachel liest `STONE_DEFS[rarity].tone` und hat
keine eigene Farbtabelle mehr: der Ton wohnt bei der Seltenheit in
`src/domain/brutelord/stone-config.js`, und der Platz am Tisch liest dieselbe Zeile — derselbe
Stein trägt an beiden Orten dieselbe Farbe. Vorher standen hier die Tailwind-Farben
`violet-400/300` und `amber-300/200` — Werte außerhalb der Palette; danach lag der Ton in einer
zweiten UI-Tabelle, in der `blau` auf `core-400` denselben Amber-Zweig teilte wie `gold` auf
`core-300`, sodass „Selten“ und „Legendär“ zwei Stufen derselben Farbe waren. `blau` zeigt
jetzt blau. Der Auswahlring liest `core-300` statt eines Hex-Literals; der berechnete Wert
bleibt derselbe. Fläche, Rundung und Schrift sind unberührt, die Kachel trug keine
Schriftentscheidung.

## Schnittstellen

- `StoneChip()`
- `onSelect()`

Aus der Migration vom 2026-10-05 hervorgegangen.
