# game-clock

## game-clock

Spiegel-Datei für `src/state/game-clock.js`.

## Verantwortung

Die Sim-Uhr selbst, ohne React: ein Takt misst die vergangene Zeit, und was in dieser Zeit
fällig wurde, kommt als Aktionsliste heraus. Sie besitzt keinen Spielzustand — sie liest ihn,
um zu prüfen, welche Uhr schweigt, und schreibt ihn nie.

Die Simulation bringt einen Schritt nicht als feste Länge mit: `monotonicNow()` misst ihn,
`createGameClock()` nimmt die Messung als Parameter, damit die Prüfung sie vorgeben kann.
Drei Quellen der Fälligkeit: die Timer der aktuellen Onboarding-Phase (aus `scheduleFor`), die
Dauertakte aus `TICKS` und der Abbau-Intervall. Jeder trägt einen Rest über den Takt hinaus
mit; ein langer Schritt holt die ausgefallenen Takte nach, statt sie zu verlieren.

`armPhase` erkennt den Phasenwechsel selbst, statt auf einen React-Effekt zu warten — der
Plan wechselt dort, wo der Zustand wechselt, und übernimmt dabei den Rest des gefeuerten
Timers in die neue Phase. Ohne diesen Übertrag startet jede Phase bei null und die Kette
sammelt pro Wechsel einen Takt Drift an.

## Was sie aushält

Drei Zusicherungen tragen den Betrieb, und `check-game-clock-edges.mjs` fährt sie
als eigene Gruppe ab:

- **Gedrosselt ist nicht langsam.** Ein Hintergrundtab dehnt `setInterval`; die Uhr
  misst stattdessen die Schritte und arbeitet sie nach. 100 Schritte à 100 ms und
  10 Schritte à 1000 ms ergeben denselben Taktstrom.
- **Abwesenheit ist ein Sprung.** Ein Schritt trägt höchstens `GAME_TIME.maxStepMs`
  nach; ein schlafender Rechner oder ein drei Stunden verborgener Tab holt nicht
  drei Stunden nach, sondern springt. Jeder Takt trägt seinen Rest über den Takt
  hinaus mit, deshalb fällt keiner aus und keiner doppelt.
- **Ein Rücksprung der Systemzeit zählt nicht doppelt.** `monotonicNow()` liest
  `performance.now()`, und der Zeiger auf „jetzt“ läuft nur vorwärts: geht die
  Quelle zurück, steht die Uhr still, bis sie ihn eingeholt hat.

Schweigende Uhren stauen nichts an: ein pausierter Takt setzt seinen Rest auf
null, damit nach einer Pause kein Schwall fälliger Runden entsteht.

## Schnittstellen

- `monotonicNow()`
- `createGameClock()`

Aus der Vereinheitlichung der Spielzeit vom 2026-10-06 hervorgegangen.
