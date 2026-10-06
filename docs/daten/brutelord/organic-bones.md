# organic-bones

## organic-bones

Spiegel-Datei für `src/domain/brutelord/organic-bones.js`.

## Verantwortung

Das Knochengerüst des Brutlords als L-System. Aus dem Phaenotyp entsteht ein
Bauplan (`planOf`): Rueckenlaenge, Schwanz, Gliedmassenlaenge, Gelenkdicke,
Koerperumfang und Kopfgroesse kommen aus den Merkmalen und den Genwerten, nie
aus Zufall. Jede Streuung stammt aus `mixSeed` ueber `ORGANIC_SALT` und ist
damit aus `phenotype.hash` reproduzierbar.

Das Wort wird aus `T` (Schwanz), `S` (Rueckenknoten), `H` (Kopf) gebildet und
ueber die Regeln `S -> F[L]`, `L -> FL` so oft umgeschrieben, wie die
Gliedmassenlaenge es hergibt. Der Walker schreibt jedes `F`/`L` als Knochen und
Endgelenk in den Achs- oder den Seitensack; `[` und `]` legen eine Sprosse auf
den Stapel und wieder zurueck. Ob ein Segment zum Rumpf oder zur Gliedmasse
gehoert, entscheidet die Sprosse allein: innerhalb einer Klammer ist jedes
Segment eine Gliedmasse und traegt `limb`, auch das `F` zwischen den beiden
`L`. Sonst haette das erste Gliedmassen-Segment Rumpfdicke und Rumpfrolle, und
die Koerperformen waeren Stummel im eigenen Fleisch. Was im Seitensack landet, wird am Ende ueber
`bothSides` gespiegelt, deshalb ist das Skelett exakt symmetrisch zur Mittellinie.

`phase` ist kein Zufall, sondern der Atemtakt: `phaseOf` rechnet auf die vier
Phasen der `ORGANIC_CONFIG.breathe`-Kurve herunter. Lenden- und Gelenkmasse
skalieren mit dem Atemwert, die Phase verschiebt damit die Form und nicht die
Topologie. Vier Phasen sind vier eigene Atemwerte — Ruhe, Einatmen, Scheitel,
Ausatmen —, deshalb sind auch die vier Standbilder verschieden und keine zwei
davon gleich. Jedes Gelenk traegt eine `role` aus `FEATURE_ANCHOR` oder `null`;
`LIMB_TIP` wird erst beim Verlassen einer Sprosse gesetzt, damit die Spitze die
ganze Sprosse kennt.

Die Geometrie endet hier: das Modul gibt Punkte und Radien aus und weiss nichts
von Farbe, SVG oder Sichtbarkeit.

## Schnittstellen

- `phaseOf()`
- `skeletonOf()`

Aus der Mission vom 2026-10-06 hervorgegangen.
