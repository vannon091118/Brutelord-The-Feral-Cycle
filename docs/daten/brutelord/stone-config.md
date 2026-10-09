# stone-config

## stone-config

Spiegel-Datei für `src/domain/brutelord/stone-config.js`.

## Verantwortung

Essenz-Steine: Seltenheit, Fähigkeiten, Traits und Slots. Die Gewichte sind absichtlich grob
— der Pity-Timer in stone-roll.js fängt die Extreme auf. Unbenutzt die Hälfte zurück, ab dem
ersten Kampf-EP achtzig Prozent.

**Der Ton der Seltenheit steht an ihrem Def**, nicht in der UI: `STONE_DEFS[rarity].tone`
trägt die zwei Palettenschritte samt Deckung — `grau` als `border-bone-400/30 text-bone-300`,
`blau` als `border-aether-400/50 text-aether-400`, `lila` als
`border-hive-400/50 text-hive-300`, `gold` als `border-core-300/70 text-core-300` — und
Kachel wie Tisch lesen ihn unverändert. Vorher stand hier nur ein Farbname (`'grau'`), den
eine zweite Tabelle in der UI auf Klassen abbildete; die Verbindung war ein stiller
Schlüssel, und ein Tippfehler darin ließ die Steine ohne Ton stehen. Wer eine Seltenheit
hinzufügt, fasst damit genau eine Zeile an; `check-architecture.mjs` verlangt, dass jeder
genannte Schritt in der Palette existiert und die vier Töne verschieden bleiben.

## Schnittstellen

- keine benannten Funktionen

Aus der Migration vom 2026-10-05 hervorgegangen.
