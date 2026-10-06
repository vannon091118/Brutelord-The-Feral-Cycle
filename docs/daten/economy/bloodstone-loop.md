# bloodstone-loop

## bloodstone-loop

Spiegel-Datei für `src/domain/economy/bloodstone-loop.js`.

## Verantwortung

Der Kreislauf in reinen Funktionen: Quelle, Vorrat, Abnehmer. Die Quelle ist `raidYieldFor`
und verlangt drei Dinge zugleich — die Beute-Phase des Raids, einen feindlichen Hive und
einen gefallenen Wächter; fehlt eines davon, ist die Ausbeute null. `baseYieldFor` ist die
Gegenprobe: sie liefert die Null der Config, gleichgültig wie viele Takte vergehen, damit
sich keine heimliche Produktion in der eigenen Basis einschleicht. Der Vorrat wächst nur
über `depositBloodstone` und nur um positive Beträge; null und negative Beträge lassen das
Ledger unberührt, statt es still zu verkleinern. Der Abnehmer ist `unlockDepth`: genug
Blutstein, Tiefe unter dem Deckel, Risiko unter dem Deckel — sonst kommt ein stabiler
Fehlerschlüssel zurück und das Ledger bleibt genau wie es war. Die Kosten der nächsten
Etage wachsen mit der Tiefe, also trägt jede Freigabe zugleich ihren Preis und ihr Risiko.

## Schnittstellen

- `createBloodstoneLedger()`
- `baseYieldFor()`
- `raidYieldFor()`
- `depositBloodstone()`
- `depthCostFor()`
- `canUnlockDepth()`
- `unlockDepth()`
