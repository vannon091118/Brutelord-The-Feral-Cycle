# organic-cache

## organic-cache

Spiegel-Datei für `src/domain/brutelord/organic-cache.js`.

## Verantwortung

Die eine Adresse, an der der Bildschirm eine fertige Kontur abholt. Ein Aufruf
`organicFrame(genome, tick)` liefert Ringzug, Skelett, Anker und Rahmen zusammen.

Der Cache-Schlüssel ist der Kern: `frameKey` setzt den Phaenotyp-Hash mit `_f` und
dem ganzzahligen `phaseOf(tick)` zusammen, also ausserhalb der vier Phasen gar nichts.
Wer den rohen Takt in den Schlüssel schreibt, bekommt pro Frame ein neues Objekt und
einen unbegrenzten Map; deshalb rechnet der Schlüssel auf die Phase herunter, bevor er
etwas ablegt. Derselbe Frame liefert ueber tausende Aufrufe dieselbe Objektidentitaet,
und der Map waechst auch dann nicht, wenn die Schleife Jahre laeuft.

Der Rahmen (`view`) haengt am Phaenotyp, nicht an der Phase: er wird aus dem Skelett
der weitesten Atemphase gerechnet. Deshalb bleibt die Atmung auf dem Schirm sichtbar,
ohne je aus dem Bild zu wachsen. Der Cache deckt bei 128 Eintraegen ab und wirft dann
alles weg — ein Mutant pro Weltenbewohner ist weit darunter.

Das Modul kennt keine Farbe und kein SVG: es gibt Zahlen und Punkte aus.

## Schnittstellen

- `frameKey()`
- `organicFrame()`
- `frameCount()`
- `cacheKeys()`
- `clearFrames()`

Aus der Mission vom 2026-10-06 hervorgegangen.
