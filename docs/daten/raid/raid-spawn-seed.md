# raid-spawn-seed

## raid-spawn-seed

Spiegel-Datei für `src/domain/raid/raid-spawn-seed.js`.

## Verantwortung

Der Einmarschspunkt: eigener Hash, eigener Strom, aus dem Ticket gespeist. Nur Felder, die
wirklich auf der Karte liegen und unverbaut sind. Die Reihenfolge dieser Liste ist Teil des
Replay-Formats (D38): sie ist Rasterreihenfolge und darf ohne eine Fassungserhöhung nicht
umsortiert werden.

**`entrySeed()` hat zwei Eingaben ignoriert und tut es nicht mehr.** Ein Ticket trägt eine
Id, ein Angreifer einen Namen — beides sind Zeichenketten, und `mixRaid(String(x), salt)`
rechnet `NaN ^ salt`, also für **jede** Zeichenkette denselben Wert. Gemessen: acht
verschiedene Angreifer auf denselben Verteidiger ergaben alle denselben Eintrittspunkt; die
Salze `SALT_TICKET` und `SALT_STEP` waren toter Code. Das schlug erst zu, als der Server
das Ticket wirklich ausstellte: Ein Eintritt, der nicht an der Ticketzeile hängt, ist der
Punkt, den ein Angreifer vorher kennt — genau das, wogegen D18 und D46 gedacht sind.
`textSeed()` hasht Zeichenketten jetzt wirklich (FNV über die Zeichen), `seedOf()` lässt
Zahlen unangetastet, damit die gemessenen Einmärsche aus Zahlenreihen unverändert bleiben.

**Der Eintritt hängt am Paar und nicht an der Ticket-Id (D46).** Solange die Id in den Seed
einging, und jede Ausstellung eine neue Id vergibt, konnte ein Angreifer dasselbe Ticket
beliebig oft ausstellen und sich den kürzesten Anmarsch aussuchen — gemessen acht
Ausstellungen an denselben Verteidiger, acht verschiedene Eintritte zwischen (11,18) und
(61,44). Bei 64 bis 180 Ausdauer ist das der Unterschied zwischen gewonnen und verloren,
und es ist gratis. Jetzt speisen `attackerId`, `defenderId` und der Verteidiger-Seed den
Eintritt: wer zweimal fragt, bekommt denselben Punkt. Das vielfach verwendete `SALT_STEP`
und das nun `SALT_GEGNER` heißende Salz stehen getrennt für ihre zwei Rollen.

## Schnittstellen

- `mixRaid()`
- `unitOf()`
- `textSeed()` — Zeichenkette zu Hash
- `entrySeed()` — Angreifer, Verteidiger und Verteidiger-Seed
- `isFree()`
- `candidates()`
- `entryPointFor()`

Aus der Migration vom 2026-10-05 hervorgegangen.
