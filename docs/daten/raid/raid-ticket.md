# raid-ticket

## raid-ticket

Spiegel-Datei für `src/domain/raid/raid-ticket.js`.

## Verantwortung

Das RaidTicket als Regel und nicht als Rumpf. Der Server stellt es aus, aber was
darin stehen **darf**, entscheidet die Domäne: `ticketFrom()` friert Identität,
Verteidiger, Verteidiger-Seed und Eintrittspunkt ein — der Punkt kommt aus
`entrySeed()` über Angreifer, Verteidiger und dessen Seed, also aus Namen und
Zahlen, die der Client nicht wählt. **Ein Paar hat genau ein lebendes Ticket:**
die Zeile hat eine eigene Spalte für den Verteidiger, und eine neue Ausstellung
verdrängt die alte, damit wiederholtes Fragen keinen günstigeren Anmarsch
einkauft (D46). Die Id bleibt trotzdem je Ausstellung eindeutig — sie ist der
Schlüssel der Quittung, an der ein zweiter Anlauf seine Beute wiedererkennt.
Ist kein freier Eintritt zu finden, gibt es kein Ticket; das ist die Absage und
kein Fehler. `cadreRule()` ist die Tür davor: Der Kader
darf höchstens so viele Dunglinge nennen, wie der Schwarm zulässt
(`MAX_DUNGLINGS`), jeder Genannte muss dem Hive gehören, sein Grit muss unter
`maxTeamGrit()` bleiben, und **derselbe Dungling darf nicht zweimal dabei sein**
— ohne diese Zeile hätte ein Kader denselben Kämpfer sechsmal nennen dürfen.

Die Träger kommen aus dem Spielstand und nicht aus dem Rumpf — sonst stellte
sich der Angreifer seine Helden selbst aus. Was der Server annimmt, ist
**gefaltet**: `statsOf()` rechnet `atk`, `speed`, `grit`, `dig` und die Traits
aus den Steinen des gespeicherten Dunglings (Summe der Stat-Beiträge, `dig` aus
der Grabfähigkeit), und `cadreRule()` gibt genau die Felder zurück, die
`createRaidState()` liest (`id`, `name`, `atk`, `speed`, `grit`, `dig`, `traits`).
Der Name kommt aus dem Stand; hat ein Dungling keinen, ist er seine Id. Damit
landet kein Fremdtext und keine erfundene Zahl in der Ticketzeile.

**Der Rumpf darf nicht behaupten, was der Hive nicht hat.** Nennt ein Kader für
`atk`, `speed`, `grit` oder `dig` einen Wert, prüft `cadreRule()` ihn gegen die
Faltung und weist den Antrag mit `GEFALSCHT` ab, wenn er abweicht. Still zu
korrigieren wäre der schlechtere Weg: der Client erführe nie, dass seine Zahlen
nicht mehr zählen, und ein Spielstand, der hinterherhängt, raidiert unbemerkt mit
dem falschen Kader. Wer nur Ids nennt — der ehrliche Weg — bekommt den Kader des
Standes, ohne etwas zu behaupten. Warum das die Lücke schließt, die der Server
vorher offen hatte, steht mit Messung in
[`Docs/ARCHITEKTUR.md`](../../../Docs/ARCHITEKTUR.md), *Der Schiedsrichter hält
die Ticketzeile*.

## Schnittstellen

- `CADRE_REASON` — `LEER`, `ZU_VIELE`, `FREMD`, `DOPPELT`, `GEFALSCHT`, `ZU_STARK`
- `cadreRule()` — Tür und Normalisierung des Kaders
- `ticketFrom()` — Zeile mit Id, Snapshot-Seed, Eintritt und Kader
