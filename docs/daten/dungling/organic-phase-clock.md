# organic-phase-clock

## organic-phase-clock

Spiegel-Datei für `src/world/dungling/organic-phase-clock.js`.

## Verantwortung

Der eine Takt für alle organischen Körper. Ein Zähler im Modul wandert je Schlag um eins,
`phaseOf()` schneidet ihn auf die vier Atemphasen herunter — mehr gibt der Takt nicht heraus,
und nichts in der Zeichnung rechnet sich seine Phase selbst aus. Dadurch atmen Welt und
Labortisch denselben Körper im selben Bild, statt dass jeder Mutant einen eigenen Takt
mitbringt.

Der Takt läuft nur, solange jemand zuhört: `subscribeOrganic()` startet das Intervall beim
ersten Zuhörer und stoppt es nach dem letzten. Ohne das liefe ein Timer weiter, während kein
Mutant auf dem Schirm ist. Die Kadenz steht als `ORGANIC_CONFIG.phaseMs` in der Domäne und
nicht als Zahl im Renderer.

`useOrganicPhase()` ist die React-Bindung: sie meldet an, gibt die aktuelle Phase zurück und
meldet beim Abbau wieder ab. Der Takt selbst ist frei von React und ohne Systemzeit — die
Phase kommt aus dem Zähler, nie aus `Date.now()`. Ein Mutant, der gräbt, taktet damit nicht
mehr schneller als einer, der steht; der Bergbau-Tick und der Atem sind entkoppelt.

## Schnittstellen

- `organicPhase()`
- `subscribeOrganic()`
- `useOrganicPhase()`

Aus der Mission vom 2026-10-06 hervorgegangen.
