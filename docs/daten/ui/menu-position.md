# menu-position

## menu-position

Spiegel-Datei für `src/ui/menu-position.js`.

## Verantwortung

Bildschirmposition eines Tiles innerhalb der Bühne, in zwei Schritten. `menuAnchorFor` rechnet
den Versatz des Kamerafensters heraus: die Welt ist skaliert und Ausschnitt, Menüs sind DOM
und bleiben in echter Größe. `menuPositionFor` klemmt den Anker dann an die Grenzen, die der
Aufrufer ihm übergibt — den **gemessenen** Kasten, nicht die skalierte Kamerabreite: im engen
Fenster drückt Flex die Bühne schmaler als `viewportPixelSize * scale`, und gegen die größere
Zahl gerechnet rutschte das Menü wieder heraus. Ohne Platz über der Kachel hängt es darunter
und meldet das mit `flipped`. `MENU_BOX` nennt Breite 158, Höhe 142 und Abstand 8, alle drei
am laufenden Menü gemessen.

## Schnittstellen

- `MENU_BOX`
- `menuAnchorFor()`
- `menuPositionFor()`

Aus der Migration vom 2026-10-05 hervorgegangen; Randklemmung am 2026-10-06.
