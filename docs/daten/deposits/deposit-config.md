# deposit-config

## deposit-config

Spiegel-Datei für `src/domain/deposits/deposit-config.js`.

## Verantwortung

Vorräte unter der Erde: Zustände, Größen, Kapazität, Weltbudget. Der Seed verstreut die
Welt: über 300 Seeds lagen 7360 bis 10500 bei einem Mittel von 9091. Die Toleranz ist aus
der Messung abgeleitet, nicht geraten.

**Die Tiefe zahlt sich aus.** `DEPOSIT_DEPTH.gainPerFloor` hebt jede Vorratskammer je
Etage um denselben Anteil, und weil die Kammern eines Blocks dieselbe Verteilung behalten,
wächst die Essenz der ganzen Etage um genau diesen Faktor — `depthGain()` nennt ihn an
einer Stelle, `capacityAtDepth()` rechnet ihn auf eine Kammer, `essenceBudget(depth)` auf
das Band der Etage. Das ist der Anreiz, weiter zu graben, und er ist gegengerechnet: die
zweite Etage liegt in **ihrem** Band, nicht im Band der ersten. Auf Etage 0 ist der Zuwachs
exakt null, deshalb ist die Startwelt Zeichen für Zeichen dieselbe wie vor dieser Regel —
eine Prüfung vergleicht beide Welten und würde jede stille Verschiebung der Oberfläche
auffallen lassen.

## Schnittstellen

- `DEPOSIT_DEPTH`
- `depthGain()`
- `capacityAtDepth()`
- `capacityCeilingFor()`
- `essenceBudget(depth)`
- `hiveDistance()`

Aus der Migration vom 2026-10-05 hervorgegangen.
