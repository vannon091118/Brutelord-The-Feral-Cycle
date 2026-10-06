# DunglingFeet

## dunglingfeet

Spiegel-Datei für `src/world/dungling/DunglingFeet.jsx`.

## Verantwortung

Das Geschwur hat keine Füße, sondern Wurzelfasern, die sich in den Boden schieben. Position
und Länge kommen aus dem Zustand, damit die Fasern nicht in jedem Schritt gleich aussehen.

Unter den Fasern liegt seit dem 2026-10-06 der **Bodenkontakt**: eine weiche Scheibe aus dem
Verlauf `look.ids.ground`, darauf eine kleine, härtere Scheibe. Vorher war es eine einzelne
graue Ellipse; zwei Schichten trennen den Kernschatten vom Umgebungsdunst, und damit steht das
Wesen auf dem Boden statt über ihm zu schweben. Der Farbverlauf kommt aus dem Look und nicht
aus `WorldDefs`, weil das Wesen sein Material selbst mitbringt — so sieht es auch dort richtig
aus, wo es keine Weltdefinitionen gibt, also auf dem Labortisch.

`StateRing()` ist der vierte Stand in der Fläche: eine Ringlinie am Boden, die nur
`dl-creature--active` sichtbar macht. Sie ist kein Schmuck, sondern die Antwort auf die Frage,
welches der Wesen gerade arbeitet, wenn mehrere auf demselben Schirm stehen.

## Schnittstellen

- `ContactShadow()`
- `StateRing()`
- `DunglingFeet()`

Aus der Migration vom 2026-10-05 hervorgegangen, am 2026-10-06 um den Bodenkontakt erweitert.
