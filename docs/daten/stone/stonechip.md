# StoneChip

## stonechip

Spiegel-Datei für `src/ui/stone/StoneChip.jsx`.

## Verantwortung

Eine Essenz-Kachel im Inventar: Die Seltenheit verrät sich, der Inhalt bleibt ???. Die Kachel
ist ein Knopf und kein Zieh-Objekt — `aria-pressed` sagt, ob sie ausgewählt ist, der Ring
macht es dem Auge sichtbar. Ein zweiter Tipp auf dieselbe Kachel nimmt die Auswahl zurück.

**Der Ton ist eine Rolle, kein Farbwert.** `TONE` bildet die vier Seltenheiten aus
`STONE_DEFS[rarity].tone` auf Palettenschritte ab: `grau` auf `bone`, `blau` auf `core-400`,
`lila` auf den Hive-Verlauf (`hive-400`/`hive-300`), `gold` auf `core-300`. Vorher standen
hier die Tailwind-Farben `violet-400/300` und `amber-300/200` — Werte, die außerhalb der
Palette lagen und damit eine zweite, stille Quelle waren. Der Auswahlring liest `core-300`
statt eines Hex-Literals; der berechnete Wert bleibt derselbe. Fläche, Rundung und Schrift
sind unberührt, die Kachel trug keine Schriftentscheidung.

## Schnittstellen

- `StoneChip()`
- `onSelect()`

Aus der Migration vom 2026-10-05 hervorgegangen.
