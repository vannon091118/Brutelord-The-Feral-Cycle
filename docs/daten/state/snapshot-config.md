# snapshot-config

## snapshot-config

Spiegel-Datei für `src/state/snapshot-config.js`.

## Verantwortung

Der Spielstand auf der Platte: welche Fassung, welcher Schlüssel, wie oft. Fassung 2 trug
die Tiefe der Etage, Fassung 3 das Genom mit dem Spezies-Locus, Fassung 4 die
Befehlsliste des Dunglings; ein Stand aus einer aelteren Fassung wird verworfen, statt beim
Zeichnen an einem fehlenden Allel oder an einer fehlenden Liste zu scheitern — beide Male
waere der Fehler derselbe stille Absturz beim ersten Zug.
Zwei Takte statt einem: `SNAPSHOT_EVERY_MS` fragt alle fuenf Sekunden, ob sich etwas
geaendert hat, geschrieben wird aber hoechstens alle `SNAPSHOT_WRITE_EVERY_MS` — die
Schreiblast haengt damit an der Aenderung, nicht an der Uhr. `SNAPSHOT_MAX_BYTES` ist die
Obergrenze einer Schreibung, der Server liest dieselbe Zahl aus dieser Datei, damit es sie
nicht zweimal gibt. `SNAPSHOT_REVISION_KEY` traegt den Zaehler, der eine aeltere Schreibung
als veraltet ausweist.

## Schnittstellen

- keine benannten Funktionen

Aus der Migration vom 2026-10-05 hervorgegangen.
