# PhaseTrail

## phasetrail

Spiegel-Datei für `src/ui/PhaseTrail.jsx`.

## Verantwortung

Die vier Phasen des Slice als kleine Marken: Hive, Dungling, Erde, Bauen. Sie zeigen, wo im
ersten Moment man gerade steht.

Die Marke liest die Rollen statt eigener Töne: erreicht heißt `--dl-live`, noch nicht
erreicht heißt `--dl-locked`, und die Beschriftung daneben ist eine Versalie und trägt
deshalb die Anzeigeschrift (`font-display`). Der Zustand kommt allein aus
`hasReached()`; die Spur fügt ihm keine eigene Bedingung hinzu.

## Schnittstellen

- `PhaseTrail()`

Aus der Migration vom 2026-10-05 hervorgegangen.
