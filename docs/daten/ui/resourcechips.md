# ResourceChips

## resourcechips

Spiegel-Datei für `src/ui/ResourceChips.jsx`.

## Verantwortung

Die Kopfzeile des Baumenüs: Essenz im Hive, der gebundene Rest und die Zahl der freien
Felder — drei kleine Plaketten. Seit dem Gestaltungsdurchgang sind sie eckig
(`--radius-dl`) statt Pillen, und ihre Werte tragen die Anzeigeschrift, weil hier Zahlen
stehen und kein Satz. Die Essenzplakette liest `--dl-live`, denselben Ton wie ihr Platz in
der Resource Rail: dieselbe Menge trägt dieselbe Farbe, egal wo sie im HUD steht. Die
Flächen bleiben Palettentöne (`core`, `hive`, `bone`) — eine Tönung ist keine Rolle.
Die zweite Plakette erscheint nur,
wenn ein offener Bauplatz Essenz versprochen hat — sie ist der sichtbare Teil der Regel,
dass eine Zusage bindet.

Seit dem 2026-10-06 trägt sie die Etage nicht mehr: Der Abstieg ist ein Platz der Resource
Rail in der Hinweiszeile, und eine zweite Etagenplakette wäre derselbe Knopf an zwei Orten.
Damit reicht sie den Kreislauf auch nicht mehr durch — sie zeigt nur noch, was das Baumenü
ohnehin in der Hand hat.

## Schnittstellen

- `ResourceChips()`

Aus der Migration vom 2026-10-05 hervorgegangen; Etage am 2026-10-06 zur Rail gewandert.
