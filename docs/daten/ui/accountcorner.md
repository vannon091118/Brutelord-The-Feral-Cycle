# AccountCorner

## accountcorner

Spiegel-Datei für `src/ui/AccountCorner.jsx`.

## Verantwortung

Die Kontoecke rechts oben: das Abmelden und das Raid-Buch untereinander in einem Container.
Sie steht als eigene Komponente, weil `App.jsx` am Import-Deckel stand — der Platz, an dem
die beiden Knöpfe wohnen, ist eine eigene Verantwortung und nicht ein Anhängsel der
Komposition.

Das Abmelden führt seine Reihenfolge selbst aus: erst `logoutAccount()` mit dem Token, dann
`clearSession()` lokal, dann den Rückruf, der die Sitzung aus dem Baum nimmt. Die Reihenfolge
ist Absicht und nicht Zufall — der Token muss beim Aufruf noch vorliegen, sonst entwertet
der Server nichts und die Sitzung bleibt auf der anderen Seite offen.

Der Schwarm wird durchgereicht und nicht hier gelesen: den Kader prüft die Domäne
(`cadreRule()`), diese Komponente hat dafür keine eigene Meinung.

**Das Raid-Buch erscheint erst mit dem Leiterschacht.** `ladderOpen(buildings)`
aus dem Kreislauf entscheidet, ob der Knopf da ist: ohne Schacht gibt es keinen
Raid und damit auch keine Quittungen zu lesen, also bleibt die Ecke ruhig. Die
Bauten werden dafür von `App.jsx` durchgereicht — die Komponente entscheidet
nichts, sie fragt die Domäne.

## Schnittstellen

- `AccountCorner()`

Neu am 2026-10-06 mit dem Raid-Buch.
