# WorkerLayer

## workerlayer

Spiegel-Datei für `src/world/WorkerLayer.jsx`.

## Verantwortung

Alles, was über der Welt lebt: der Schwarm bei der Arbeit und die Essenzsymbole, die kurz
über dem Abladeort aufsteigen. Beides hängt an Positionen aus dem Auftrag — deshalb eine
Ebene.

Die Brücke zum mutierten Dungling: `WorkerBody` fragt den Zustand nicht mehr nach den
Steinen, sondern über `genomeOf()` nach dem **Genom**. Eine alte Ablage trägt an dieser
Stelle nur Steine — `genomeOf()` rechnet daraus dasselbe Genom, das die Fusion ergeben
hätte, deshalb braucht der Bestand keine Wanderung. Das Genom hängt per `useMemo` an der
Dungling-Identität, damit dem Renderer nicht bei jedem Arbeitstakt ein neues Erbgut
gereicht wird. Den Atemtakt holt sich der Mutant selbst aus dem organischen Phasentakt —
deshalb bekommt `WorkerBody` nur noch Position, Größe und Genom, keinen `step` mehr. Ob ein
Dungling mutiert ist, wird je Durchlauf einmal gefragt, nicht zweimal.

Neu am 2026-10-06 ist eine einzige Zeile mit Folgen: der Mutant bekommt den **Domänenzustand**
seines Dunglings durchgereicht. `MutantSvg` übersetzt ihn selbst in den Stand der Figur, und
damit trägt auch der mutierte Arbeiter sichtbar, ob er ruht, läuft oder arbeitet — vorher
atmete er in jedem Zustand gleich. Diese Ebene entscheidet dabei nichts: sie liest den Zustand
nicht aus, um ihn zu deuten, sondern gibt ihn weiter, wie sie Position und Genom weitergibt.

## Schnittstellen

- `WorkerBody()`
- `WorkerLayer()`

Aus der Migration vom 2026-10-05 hervorgegangen.
