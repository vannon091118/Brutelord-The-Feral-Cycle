# organic-field

## organic-field

Spiegel-Datei für `src/domain/brutelord/organic-field.js`.

## Verantwortung

Aus dem Skelett wird eine Masse. Jeder Knochen und jedes Gelenk legt einen
Metaball an: `blobValue` gewichtet eine Quelle mit `r^2 / d^2`, die Feldsumme
ist die Ueberlagerung aller Quellen. Auf einer Knochenstrecke wird die Quelle
stetig interpoliert (`reachOf`), sonst zerfiele der Koerper an den Gelenken.
`sampleField` ist die einzige Feldwahrheit und wird von der Abnahme als
Iso-Pruefung mitgelesen.

Die Nullinie bei `ORGANIC_CONFIG.iso` wird mit Marching Squares auf einem
Gitter (`cell`) gezogen. Die Segmenttabelle ist spiegelkonsistent: ein
gespiegeltes Zellenmuster ergibt ein gespiegeltes Segment, die Sattelfaelle 5
und 10 entscheidet der Mittelwert der vier Ecken. `stitch` naeht die Segmente zu
Ringen, `ringsOf` wirft Ringe unter `ringMinPoints` und `ringMinArea` weg und
sortiert die grossen zuerst. Danach dreht `oriented` jeden Ring auf positiven
Flaecheninhalt, also gegen den Uhrzeigersinn. Die Umlaufrichtung ist damit
Vertrag und nicht Zufall: der Renderer darf sie voraussetzen, ohne sie selbst zu
pruefen, und ein Ring mit negativer Flaeche ist ein Fehler und keine Variante.

**Die Grenze muss das Feld tragen, nicht der Pad.** Die Summe mehrerer Quellen
erreicht iso weiter draussen als der Radius einer einzelnen, deshalb waechst
`boundsOf` in Runden ueber `sealRounds`, bis auf dem ganzen Rand
`sampleField <= iso` gilt. Erst dann ist jede Kontur geschlossen; ein zu enger
Rahmen schnitt die Glieder in eigene Ringe und brach die Symmetrie. Gesampelt
wird nur die linke Haelfte und auf die rechte gespiegelt, damit die Kontur auch
in Gleitkomma exakt symmetrisch bleibt.

Das Ergebnis ist eine Liste schlichter Punkte, kein Pfad und kein Markup.

## Schnittstellen

- `sampleField()`
- `fieldOf()`

Aus der Mission vom 2026-10-06 hervorgegangen.
