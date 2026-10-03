# Architektur

Dieses Dokument trägt, was im Code keinen Platz mehr hat. Kommentare sind dort
auf **fünf Zeilen pro Datei** begrenzt und dienen nur noch der Orientierung;
die Zahlen, Regeln und Begründungen stehen hier. Wer eine Entscheidung ändert,
ändert sie hier mit — sonst weiß in drei Monaten niemand mehr, warum die Dinge
so liegen.

Die verbindlichen Regeln (Gate, Version, Commits) stehen in `AGENTS.md`, die
Absicht in `Docs/ROADMAP.md`.

---

## Domäne

`src/domain/` ist die Spielwahrheit in reinem JS: kein React, kein DOM, kein
SVG, kein `Math.random()`, kein `Date.now()`. Das prüft
`scripts/verify/check-architecture.mjs`. Alles, was zufällig aussieht, kommt aus
Koordinaten und Seeds — dieselbe Koordinate ergibt immer dieselbe Erde, und
damit ist jede Prüfung wiederholbar.

### Zahlen stehen in Configs, nicht im Code

| Config | Werte | Warum |
| --- | --- | --- |
| `JOB_CONFIG` | `tickMs 200`, `travelMsPerTile 420`, `workMs 300`, `cycleMs 15000`, `popupLifetimeMs 1600` | Ein Träger läuft 420 ms pro Feld; ein Extraktor presst für jeden zugewiesenen Dungling eine Essenz pro 15 s. Die Prüfungen rechnen gegen diese Werte, nicht gegen 15.000. |
| `ROOTING_CONFIG` | `claimDurationMs 10000`, `cooldownMs 5000`, `tickMs 100` | Ein Feld fadet 10 s lang ins Hive-Farbige, ruht 5 s, erst dann stoßen die Tentakel weiter. |
| `ONBOARDING_CONFIG` | `hiveHitDurationMs 320`, `hiveMutationDurationMs 900`, `dunglingSpawnDelayMs 5000`, `dunglingEmergeMs 600`, `dunglingSettleMs 500`, `workerMoveDurationMs 500`, `miningDurationMs 3500`, `miningTickMs 100`, `tileDestructionMs 700`, `gridExpansionMs 600` | Der Dungling erscheint exakt 5 s nach dem Hive-Klick; der Abbau ist in 35 Ticks à 100 ms zerlegt, damit die Erde sichtbar verwittert statt zu springen. |
| `BUILDING_DEFS` | Schwarmhort 6 Essenz (brütet alle 20 s), Extraktor 5 Essenz (max. drei Dunglinge), Brutlord 10 Essenz auf 2 × 2 | Jeder Bau ist erst ein Bauplatz und wird dann Stück für Stück bezahlt. Der Startvorrat `START_ESSENCE` deckt genau einen Extraktor — ohne ihn käme die Kolonie nie in Gang. |
| `MAX_DUNGLINGS 6` | Obergrenze des Schwarms | Der Schwarmhort brütet bis dahin, danach wartet er. |
| `world-config.js` | Raster 64 × 64, Hive 2 × 2 bei 31/31, Sichtfeld 13 Tiles, `REVEAL_RADIUS 2`, Leiter bei 47/47 | Sichtbar bleibt ein Fenster; der Rest ist Dunkelheit, bis die Wurzeln hinkommen. |

### Aufträge und Arbeit

Ein Dungling hat höchstens einen Auftrag. `src/domain/labour/jobs.js` beschreibt
ihn als Maschine mit fünf Phasen — `FETCH` und `ATTEND` am Ausgangspunkt,
`TRAVEL` mit Last zum Ziel, `WORK` am Ziel, `RETURN` leer zurück — und meldet an
jeder Phasengrenze ein Ereignis: Essenz aufgenommen, Essenz gepresst, Essenz
abgeladen, Auftrag beendet. `src/domain/labour/work-tick.js` wendet diese
Ereignisse an: aufgenommene Essenz verlässt den Vorrat, abgeladene füllt einen
Bauplatz oder den Hive und erzeugt das `+1`-Symbol.

Zwei Regeln machen den Ein-Arbeiter-Start spielbar. Erstens geht ein freier
Dungling zuerst zum offenen Bauplatz und erst danach an den Extraktor. Zweitens
wird ein am Extraktor wartender Dungling an der Phasengrenze abgezogen, sobald
draußen Essenz gebraucht wird — sonst käme der einzige Arbeiter nie vom
Extraktor los und kein Bau würde fertig.

Der Brutlord ist 2 × 2 Felder groß; seine vier Felder müssen freier Boden sein
und werden als belegt geführt, damit sich zwei Bauten nicht überlappen.

### Verwurzelung

`DARK → GROWING → RESTING → CLAIMED`, gerechnet pro Feld in
`src/domain/world/rooting.js`. Beansprucht wird ausschließlich abgebauter Boden
(`TILE_KIND.DUNGEON_FLOOR`): unberührte Erde wird von den Tentakeln sichtbar
gemacht, aber nie eingenommen. Die Sonde folgt dem Abbau, nicht dem Raster —
deshalb steht die Sichtbarkeitslogik in `src/domain/world/reveal.js` mit der
eigenen kleinen `wobbleAt`-Hashfunktion. Sie ist bewusst nicht `tileSeed` aus
`src/world/tile-shapes.js`, weil die Domäne nichts aus `src/world/` ziehen darf.

## Zustand

`src/state/game-reducer.js` verteilt auf eine Liste von Domänen-Reducern; der
erste, der den Zustand verändert, gewinnt. Ein Befehl ändert genau einen
Bereich. `colony-reducer.js` trägt zwei Verantwortungen — Bau-Befehle und
Arbeitstakt —, weil die Importgrenze von sieben Zeilen keine zwei Module in der
Kette zulässt. Getrennt bleiben sie in der Datei trotzdem.

Drei Uhren halten die Simulation in Bewegung, alle ohne eigenen Zustand:

- `use-schedule-runner.js` führt den Onboarding-Plan aus `onboarding-schedule.js`
  aus. Timer verfallen bei jedem Phasenwechsel — deshalb liegt der Abbau in
  einem Plan und nicht in einer Kette.
- `use-rooting-runner.js` tickt die Verwurzelung unabhängig, weil die Wurzeln
  weiterkriechen, während der Spieler nichts tut.
- `use-work-runner.js` tickt die Arbeit. Alle drei schweigen, wenn es nichts zu
  tun gibt; sie lesen den Zustand, sie besitzen ihn nicht.

Der Schwarm ist eine Liste. Der erste Dungling trägt das Onboarding, der Abbau
bedient den ersten freien Arbeiter.

## Vorräte unter der Erde

Essenz-Cluster liegen als Daten in `world.deposits`, die betroffenen Tiles
tragen nur `depositId`. Ein Datensatz je Cluster, nicht je Feld: der Pool
gehört dem ganzen Vorrat, sonst ließe sich ein Dreifeld-Cluster dreimal leer
pumpen.

Vier Zustände: `BURIED` (Daten da, der Spieler ahnt nichts und es wird nichts
gezeichnet), `HINTED` (ein geclaimtes Nachbarfeld hat den Rand spürbar gemacht),
`FOUND` (das Vorratsfeld selbst ist abgebaut), `SPENT` (Pool leer). Der
Übergang sitzt in `spreadToNeighbors` und nicht in der Reveal-Logik — der
Sichtbarkeitsradius der Sonde darf keinen verborgenen Vorrat aufdecken.

Der Abbau ist der zweite Übergang: `mineTile` in `src/domain/actions/mining.js`
legt den Boden an und setzt den Vorrat auf `FOUND`, weil erst dann die Ader
offen ist. Ein geöffneter Vorrat bekommt seinen grünen Schein in
`src/world/deposits/DepositGlow.jsx` — eine Fläche aus demselben Boden-Blob wie
Erde und Boden, eine Feldbreite in die Nachbarschaft reichend, mit radialem
Abfall von sechzehn über sechs auf null Prozent. Der Rand ist null, deshalb
sieht man keine Kachel.

Die Platzierung ist deterministisch und ohne Zufall: `deposit-hash.js` streut
über einen eigenen `Math.imul`-Hash, bewusst nicht über `tileSeed` aus
`src/world/tile-shapes.js`, weil die Domäne nichts aus `src/world/` ziehen
darf. Beim Abbau reicht `minedFloorTile` den Verweis durch, sonst bliebe der
Datensatz ohne Kachel zurück. Isolation folgt aus dem Raster statt aus einer Nachbarschaftsprüfung:
Blöcke über 4 × 4 Felder, ein Cluster bleibt im inneren 2 × 2-Fenster — zwei
Cluster liegen dadurch mindestens drei Felder auseinander.

Gemessen für die 64 × 64-Welt, nicht geschätzt: **150 Cluster auf 293 Feldern,
8860 Essenz im Pool**, Größen 54/49/47, Kapazität 40/60/80 je Feld und
höchstens 100. Gesperrt sind der Hive-Radius 6, die Burrow-Kachel und die
Leiter. Die Zahlen stehen als Konstante in `deposit-config.js`, und
`check-deposits.mjs` vergleicht die Welt damit — wer `blockStride` oder
`skipPerMille` ändert, färbt genau diese eine Prüfung rot.

Geprüft wird damit sechs Dinge: Isolation ohne Redundanz (kein Nachbarfeld
eines fremden Vorrats, keine Zelle doppelt), Determinismus (zwei `createWorld()`
liefern dasselbe), Budget (Clusterzahl im Band, Poolsumme exakt), Kapazität
(voll, in der Größenordnung, unter der Obergrenze, anfangs alles `BURIED`),
Sperrzonen und Zustandswechsel (`Claim → HINTED` genau einmal, beim zweiten
Claim folgenlos, der Abbau öffnet den Vorrat und lässt seinen Pool ganz).

Noch offen und bewusst nicht entschieden: fällt der Abbaupreis auf alle Erde
oder nur auf Vorratsfelder, und ist ein Cluster ein Schlag oder ein fließender
Vorrat. Beides gehört zur Ernte, nicht zur Platzierung. Dasselbe gilt fürs
Zeichnen: `BURIED` bleibt leer, eine Vorratsebene entsteht mit dem Renderer.

## Welt und Darstellung

`src/world/TileLayer.jsx` zeichnet in vier Durchgängen: Erde, fertiger Boden,
Verwurzelung, Bauten. Ein Bauwerk steht damit sichtbar über den Wurzeln, und
die Hive-Felder verschwinden unter dem Hive selbst.

`soilBlob()` in `tile-shapes.js` zieht mit positivem `jitter` nach innen;
Überlappung zwischen Nachbarfeldern entsteht nur über `outward`. Die vier Ecken
(`0`, `0.25`, `0.5`, `0.75`) sind feste Stützpunkte: Ohne sie schneidet die
weiche Kurve die Ecken ab, und zwischen vier Nachbarn bleibt eine Raute stehen —
das sieht nach Abstand aus, ist aber eine fehlende Ecke.

Der Untergrund bleibt bei einer Art: heller Stein (`src/world/floor/`). Nichts
darf als Kachel erkennbar sein — Erde und Boden sind zusammenhängende Massen,
Auswahl und Effekte folgen der Fläche, nie dem Rechteck.

Die Kamera (`src/world/world-view.js`) folgt dem Mittelpunkt alles Gebauten.
Die Leiter bei 47/47 wird erst gezeichnet, wenn die Kamera sie erreicht.

Die Darstellung liest den Auftrag, nicht die Uhr: `jobTrip()` liefert die
Zwischenposition zwischen zwei Feldern, damit ein Träger läuft statt zu springen.

## Prüfungen

`scripts/verify-slice.mjs` ist der Einstiegspunkt und ruft Prüfgruppen auf, die
ihre Erwartungen aus den Configs ableiten. Neue Domänenlogik ist erst geprüft,
wenn eine `check-*.mjs` sie aufruft; die echten Module aus `src/` werden
importiert, nicht nachgebaut.

- `check-colony.mjs` bündelt Bauen und Beanspruchung, weil `verify-slice.mjs` an
  der Importgrenze steht.
- `check-deposits.mjs` hängt an `checkRooting()`, weil der Einstiegspunkt mit
  sieben Importzeilen am Cap steht und der Hinweis ohnehin Verwurzelung ist.
  Beim Nachtreiben von Hand: `startRooting(world, tile)` nimmt die Welt und die
  Kachel, nicht nur die Kachel.
- `build-run.mjs` spielt den kompletten Bau-Durchlauf mit der virtuellen Uhr
  durch; die Beobachtungen sind Material, die Behauptungen stehen in
  `check-build.mjs`.
- `virtual-clock.mjs` führt denselben Zeitplan wie der Browser aus, nur ohne
  Wartezeit. Der Arbeitstakt wird als `WORK_TICK` mit festem `dtMs` getaktet —
  auch hier gibt es keine Systemzeit.
- `check-mining-progress.mjs` prüft `totalMiningTicks() === 35` als Literal,
  `check-start.mjs` „exakt vier Hive-Tiles" statt `HIVE_SIZE`. Wer
  `miningDurationMs`, `earthStateThresholds` oder `HIVE_SIZE` ändert, muss
  diese Zahlen mitziehen.
- `expect.mjs` zählt global über den ganzen Lauf und `summary()` ist nur einmal
  aufrufbar; deshalb liegt die Reihenfolge fest.

Die Hard Caps prüft `scripts/lib/source-metrics.mjs` als Textanalyse: 300
Codezeilen (Kommentar- und Leerzeilen zählen nicht), höchstens fünf
Kommentarzeilen pro Datei, 30 LOC pro benannter Funktion, drei Parameter,
sieben Importzeilen — für `.js`, `.jsx`, `.mjs` und `.css`. Dokumentation ist
ausgenommen.

## Version und Commits

`version.lock.json` ist die Autorität; `VERSION`, `package.json` und
`package-lock.json` sind Spiegel, geschrieben nur über `scripts/version.mjs`.
Die Revision steigt bei jeder Versionsänderung um eins. Ein Rückschritt ist
verboten — außer als ausdrückliche Rücknahme einer Fehlbenennung mit `amends:
"<alte Version>"` im Lock; `src/version-authority.mjs` lässt genau diesen Fall
durch und jeden anderen nicht.

Jeder Commit nennt jede geänderte Datei im Body, erklärt warum, bleibt zwischen
100 und 1.000 Wörtern und endet mit dem VANNON-Label. Die Regeln prüft
`scripts/lib/commit-rules.mjs`, durchgesetzt wird es von `scripts/ci-gate.mjs`.
