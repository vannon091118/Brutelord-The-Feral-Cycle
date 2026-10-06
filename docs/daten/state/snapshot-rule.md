# snapshot-rule

## snapshot-rule

Spiegel-Datei für `src/state/snapshot-rule.js`.

## Verantwortung

Die Entscheidung, ob ein Spielstand geschrieben werden darf, an genau einer Stelle und ohne
Zugriff auf Fenster oder Datenbank. Zwei Gründe lehnen ab: eine Nutzlast über der Obergrenze
und eine Revision, die nicht höher ist als die bereits gesicherte. Damit ist "veraltet"
keine Folge des Zufalls, wann zwei Schreibvorgänge einander treffen, sondern eine Regel, die
dieselbe Antwort auf dem Client und auf jedem Server gibt — ein zweiter Stand kann den ersten
nicht mehr überschreiben, weil er zu spät kommt. Die Obergrenze selbst steht in
`snapshot-config.js` und wird hier nur angewendet, nicht wiederholt.

## Schnittstellen

- `SNAPSHOT_WRITE` — die drei Urteile `ok`, `tooLarge`, `stale`
- `envelopeBytes()` — die gemessene Größe eines Envelopes
- `writeDecision()` — das Urteil zu Größe und Revision
