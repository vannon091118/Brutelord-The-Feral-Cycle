# raid-actions

## raid-actions

Spiegel-Datei für `src/domain/raid/raid-actions.js`.

## Verantwortung

Die Verbformen des Raids: gehen und graben, je vier Richtungen, und daneben die richtungslosen
Taten — Angriff, Opfer und Beute. Die Richtungsschritte stehen gesammelt in `RAID_STEP`,
weil nur sie einen Nachbarn haben: wer `neighborOf()` auf eine Tat anwendet, bekommt keine
Richtung, sondern einen Fehler. Die Taten reisen als eigener Typ durch das Log, damit der
Server sie genauso nachspielt wie einen Schritt (D34).

## Schnittstellen

- `RAID_ACTION`
- `RAID_STEP`
- `isKnownAction()`
- `isDigAction()`
- `isStepAction()`
- `neighborOf()`

Aus der Migration vom 2026-10-05 hervorgegangen.
