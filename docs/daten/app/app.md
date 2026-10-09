# App

## app

Spiegel-Datei für `src/app/App.jsx`.

## Verantwortung

App ist Komposition und jetzt auch das Konto-Tor: ohne Sitzung gibt es kein Spiel, mit
Sitzung startet der Seed die Welt. Sie reicht die ganze Sitzung an den Motor weiter, damit
der Traeger-Token bis zum Speicher-Takt kommt und der Stand auch zum Server geht.
Lichtstimmung der Kammer hinter der Welt.

Die Bühne und der HUD stehen untereinander in einer Spalte: die Bühne nimmt den Rest der
Höhe (`flex-1`), der HUD sitzt darunter im Fluss. Das ist bewusst kein Overlay — ein
schwebender HUD deckt bei offenem Baumenü die Bauplätze im Feld zu, und die Browser-Abnahme
fällt genau darüber (`site-placed`). Wer den HUD schwebend will, muss zuerst die Bauplätze
aus seiner Fläche holen.

Die Kontoecke wohnt seit dem 2026-10-06 in `src/ui/AccountCorner.jsx` und nicht mehr hier:
App stand mit dem Raid-Buch am Import-Deckel von sieben Zeilen, und der Ort, an dem
Abmelden und Buch untereinander stehen, ist ohnehin eine eigene Verantwortung. App reicht
der Ecke nur Sitzung und Schwarm (`game.dunglings`) durch und nimmt den Rückruf entgegen,
der die Sitzung aus dem Baum nimmt; die Reihenfolge des Abmeldens führt die Ecke selbst aus.

## Schnittstellen

- `App()`
- `Playing()`

Aus der Migration vom 2026-10-05 hervorgegangen.
