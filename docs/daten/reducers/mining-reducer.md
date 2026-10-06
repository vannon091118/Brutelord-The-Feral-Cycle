# mining-reducer

## mining-reducer

Spiegel-Datei für `src/state/reducers/mining-reducer.js`.

## Verantwortung

Abbau-Domäne: Befehl, Laufweg, Takt, Ernte, Abschluss.

Der Abschluss bucht den Kreislaufschritt mit: `completed()` ruft `digInto()` mit dem
Kreislauf des Standes und der Tiefe der Etage, auf der gegraben wurde, und legt das Ergebnis
in `economy` ab. Damit hängt die Aether-Ausbeute an dem einen Ereignis, das sie erklären
kann — dem Grab — und nicht an einer Uhr, die auch ohne Arbeit Aether ausschüttet. Der
Reducer gibt über einem Stand ohne `economy`-Feld nicht etwa `economy: undefined` heraus,
sondern lässt den Schlüssel weg: ein Feld mit dem Wert `undefined` wäre ein anderer Zustand
als ein Zustand ohne dieses Feld, und der Digest misst jeden Schlüssel mit.

## Schnittstellen

- `reduceMining()`
- `withWorker()`
- `freeWorker()`
- `order()`
- `reached()`
- `progress()`
- `workerSpot()`
- `completed()` — der Grab, seine Ausbeute und die Mutation, die sie bezahlt

Aus der Migration vom 2026-10-05 hervorgegangen.
