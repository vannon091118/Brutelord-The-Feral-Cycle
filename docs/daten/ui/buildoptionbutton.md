# BuildOptionButton

## buildoptionbutton

Spiegel-Datei für `src/ui/BuildOptionButton.jsx`.

## Verantwortung

Eine Bauoption: Form, Name, Hinweis, Preis und die Zeile darunter, die sagt, was
diese Tür den anderen nimmt. `remainderFor()` nennt die drei Fälle: frei bleibt
so viel, es fehlt so viel, oder es bleibt keine Essenz mehr zum Graben — die
letzte Zeile ist die Reserve, die vierte Tür des Openings. Fehlt die Essenz,
bleibt der Knopf stehen, aber kraftlos. Gewählt trägt er einen Kernrand; ein
zweiter Klick nimmt die Wahl zurück.

Seit dem Gestaltungsdurchgang trägt die Karte **Rollen statt Farbwerte**, und der
Zustand entscheidet, welche: gewählt liest die Kante `--dl-live`, bezahlbar die Teilung
`--dl-divider`, nicht bezahlbar `--dl-locked` — und dieselbe gesperrte Rolle trägt die
Restzeile mit ihrem `fehlt`. Die **Flächen** bleiben Palettentöne (`soil`, `core`); nur
Werte und Struktur lesen Rollen, weil eine Fläche keine Rolle ist, sondern eine Tönung.
Der Radius kommt aus `--radius-dl`, die innere Oberkante aus `dl-inset`, und Preis wie
Restzeile tragen die Anzeigeschrift: Es sind die Zahlen, die der Spieler vergleicht. Der
Hinweis `kein Abbau mehr` bleibt im Ton des Hive — dafür gibt es keine Rolle, und eine zu
erfinden wäre eine Behauptung.

## Schnittstellen

- `BuildOptionButton()`

Aus der Migration vom 2026-10-05 hervorgegangen.
