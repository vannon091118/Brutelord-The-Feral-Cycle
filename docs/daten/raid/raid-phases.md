# raid-phases

## raid-phases

Spiegel-Datei für `src/domain/raid/raid-phases.js`.

## Verantwortung

Der Ablauf eines Raids ist eine Kette von sieben Phasen, nicht eine Reihe von if/else-Zweigen:
Einmarsch, Kampf, gefallener Wächter, Opfer, Beute, Rückzug, aufgelöst. Die Tabelle
`RAID_TRANSITIONS` ist die einzige Wahrheit darüber, welche Kante es gibt, was sie kostet und
welche Aktionen die Zielphase erlaubt. Wer den Ablauf ändern will, ändert eine Zeile der
Tabelle; die Prüfgruppe liest dieselbe Zeile und schreibt keine Zahl ab. Die Maschine ist rein:
kein Zustand im Modul, keine Zeit, kein Zufall — dieselbe Frage liefert dieselbe Antwort.
Ein unerlaubter Übergang wirft nicht, sondern kommt als Fehlschlag mit stabilem Schlüssel
zurück, damit der Aufrufer ihn behandeln muss und der Replay-Hash reproduzierbar bleibt.

## Schnittstellen

- `RAID_PHASE` — die sieben Phasen, eingefroren
- `RAID_EVENT` — die sechs auslösenden Ereignisse
- `RAID_PHASE_ACTIONS` — erlaubte Aktionen je Phase
- `RAID_TRANSITIONS` — Kanten mit Ereignis, Ziel, Ausdauerkosten, Aktionen
- `actionsAllowedIn(phase)` — Aktionen der Phase, unbekannt ergibt eine leere Liste
- `isTerminal(phase)` — wahr nur für `RESOLVED`
- `advance(phase, event)` — erlaubter Übergang oder Fehlschlag mit Schlüssel
- `phasePath()` — die Hauptkette `ENTER … RESOLVED`
