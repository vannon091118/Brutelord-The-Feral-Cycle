# RaidLedger

## raidledger

Spiegel-Datei für `src/ui/RaidLedger.jsx`.

## Verantwortung

Das Raid-Buch in der Kontoecke: eine Plakette, die auf Klick einen kurzen Steckbrief des
Raids und die Quittungen der eigenen Züge zeigt. Es ist bewusst ein **Buch** und keine
Kampfanzeige, denn einen laufenden Kampf gibt es in diesem Spielstand nicht: Der Raid
steht in `src/domain/raid/` als eigene Zustandsinstanz, die der Slice nirgends hält, und
der Server bucht erst, was ein eingereichter Raid eingebracht hat. Was hier steht, ist
deshalb der einzige Teil des Raids, der wirklich existiert.

Der Steckbrief rechnet nichts selbst: Kader, Grit, Ausdauer und die Zahl der Gegner kommen
aus `cadreRule()` und `teamStamina()` — beide lesen den echten Schwarm aus
`game.dunglings`. Ein leerer Kader zeigt darum den Ablehnungsgrund der Domäne im Wortlaut
(„Der Kader ist leer.") und nicht eine erfundene Bereitschaft; dass ein Raid überhaupt
starten darf, entscheidet weiterhin der Server über das Ticket, nicht diese Ansicht.

Die Beute kommt aus `readBookings()`. Drei Zustände sind alle sichtbar: „Liest …", die
Absage der Konto-Schicht im Wortlaut oder die leere Liste mit ihrem Satz. Der Hinweis am
Fuß sagt, woher die Zahlen kommen, damit niemand sie für den eigenen Vorrat hält — der
steht in der Resource Rail. Die Liste hängt auf 34 vh und scrollt, weil der Server sie auf
zwanzig Zeilen begrenzt.

## Schnittstellen

- `cadreBrief()`
- `BriefRow()`
- `Brief()`
- `LootRow()`
- `LootBody()`
- `HeadButton()`
- `RaidPanel()`
- `RaidLedger()`

Neu am 2026-10-06 mit dem Raid-Buch.
