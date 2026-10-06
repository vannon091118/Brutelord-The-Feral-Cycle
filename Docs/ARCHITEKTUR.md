# Architektur

Dieses Dokument trägt die **Entscheidungen und ihr Warum** — alles, was im Code
keinen Platz mehr hat. Kommentare sind dort auf **fünf Zeilen pro Datei**
begrenzt und dienen nur noch der Orientierung. Wer eine Entscheidung ändert,
ändert sie hier im selben Commit mit; das ist die Dokumentationspflicht aus
[`GOVERNANCE.md`](GOVERNANCE.md), und sie ist keine Formalie — sonst weiß in
drei Monaten niemand mehr, warum die Dinge so liegen.

Was hier **nicht** steht, steht anderswo und wird von hier verwiesen:

| Frage | Datei |
| --- | --- |
| Welche Regeln und Pflichten gelten? | [`GOVERNANCE.md`](GOVERNANCE.md) |
| Wie laufen Gate, Abnahme, Version, CI? | [`WORKFLOW.md`](WORKFLOW.md) |
| Welche Fehler schon einmal zugeschlagen haben? | [`PITFALLS.md`](PITFALLS.md) |
| Was muss ich vor jedem Commit wissen? | [`AGENTS.md`](../AGENTS.md) |
| Was wird als Nächstes gebaut? | [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md) |
| Wie sieht das Raid-Feature aus und was ist offen? | [`RAID-PLAN.md`](RAID-PLAN.md) |
| Was hat sich in einer Version geändert? | [`CHANGELOG.md`](CHANGELOG.md) |

**Lesereihenfolge für den Code** — jede Ebene setzt die vorige voraus und ist
ohne sie nicht sinnvoll: `src/domain/` (Spielwahrheit) → `src/state/` (Zustand)
→ `src/ui/` (liest, entscheidet nichts) → `src/world/` (Geometrie). Die
Begründung für diese Kette steht im Kapitel *Zustand*.

## Wo was steht

| Wenn du fragst … | dann lies |
| --- | --- |
| Welche Zeit, welcher Preis, welcher Vorrat? | [Domäne](#domäne), [Essenz-Ökonomie](#essenz-ökonomie) |
| Wie fließt der Zustand, wer darf ihn ändern? | [Zustand](#zustand), [Die Importmatrix](#die-importmatrix-gemessen) |
| Wie funktionieren die Vorräte unterm Boden? | [Vorräte unter der Erde](#vorräte-unter-der-erde) |
| Wie züchte ich Steine, was tun Traits? | [Der Brutlord als Labor](#der-brutlord-als-labor) |
| Wie wird gezeichnet, was kostet ein Render? | [Welt und Darstellung](#welt-und-darstellung), [Was ein Render kostet](#was-ein-render-kostet) |
| Wie entsteht der Körper eines Mutanten? | [Der organische Mutant](#der-organische-mutant) |
| Woher kommt die Welt eines Kontos? | [Konto und Spielerseed](#konto-und-spielerseed) |
| Wie hängen Ausdauer und Steinwerte zusammen? | [Der Eco-Stakes-Raid](#der-eco-stakes-raid) |
| Welche Prüfung prüft was? | [Prüfungen](#prüfungen), und die Fallen in [`PITFALLS.md`](PITFALLS.md) |
| Wie arbeite ich hier? | [`WORKFLOW.md`](WORKFLOW.md) |

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
| `BUILDING_DEFS` | Schwarmhort 6 Essenz (brütet alle 20 s), Extraktor 5 Essenz (max. drei Dunglinge), Brutlord 10 Essenz auf 2 × 2 | Jeder Bau ist erst ein Bauplatz und wird dann Stück für Stück bezahlt. Der Startvorrat `START_ESSENCE` ist `COST.extractor + 6 * miningCost` — er deckt den Startraum und danach genau einen Extraktor. |
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
Bereich. Aus Import- und LOC-Notgründen teilen sich einige Reducer die Datei:
`colony-reducer.js` trägt Bau-Befehle und Arbeitstakt, `world-reducer.js`
verdrahtet Abbau, Ausbau und Verwurzelung, `lab-reducer.js` die Brutlord-Befehle.

### Die Importmatrix, gemessen

Jede Kante zählt einen relativen Specifier über alle Dateien in `src/`:

| Von \ Nach | domain | state | ui | world |
| --- | --- | --- | --- | --- |
| `domain` | 54 | — | — | — |
| `state` | 54 | 21 | — | — |
| `ui` | 13 | — | 17 | 3 |
| `world` | 34 | 1 | — | 75 |

`domain` importiert ausschließlich sich selbst — 54 Kanten, null heraus. Das ist
die eine Eigenschaft, die das Gate nicht erzwingt und die trotzdem jeder neue
Ordner unter `src/domain/` aufreßen würde.

Zwei Kanten zeigen entgegen der Schichtkette und sind so gewollt:
`src/ui/GameStage.jsx` importiert `world` (es rendert die Szene), und
`src/world/world-view.js` importiert `state/selectors.js` (die Kamera liest den
Zustand). Es gibt keine einzige Kante `world → ui` oder `state → ui`.

React steht in 20 Dateien: sechs Hooks in `src/state/`, drei in `src/ui/` und
elf in `src/world/`. `src/domain/` und `src/app/` sind frei.

Die Kette ist **Konvention, nicht Gate**. `check-architecture.mjs` prüft genau
drei Dinge: `src/domain/` zieht weder `react` noch `document`/`window`, in ganz
`src/` gibt es kein `Math.random(` und kein `Date.now(`, und `src/domain/`
enthält kein `<svg>`-Markup. Die Importrichtung prüft er nicht — wer
`src/domain/` etwas aus `src/world/` importieren lässt, fällt durch keine dieser
drei Zeilen.

**Eine Uhr, gemessene Schritte.** Bis 0.0.32 hielten fünf Uhren die Simulation
in Bewegung: drei `setInterval` der Kolonie, die einen **festen** `dtMs` von
200 ms abfeuerten, die Wurzeluhr mit 100 ms ganz ohne `dtMs`, und der
Onboarding-Plan als Kette von `setTimeout`s. Das waren zwei Zeitbasen. Ein
gedrosselter Hintergrundtab dehnt Intervalle auf eine Sekunde und mehr: die
Kolonie kam 200 ms Spielzeit pro Schuss voran, die Onboarding-Kette lief
weiter in Wanduhrzeit — nach einer Minute im Hintergrund war der Abbau weit
hinter seinem eigenen Timer.

Jetzt gibt es einen Herzschlag. `use-game-clock.js` hält genau einen
`setInterval` über `GAME_TIME.heartbeatMs` (100 ms, abgeleitet aus dem
kleinsten Domänen-Takt, nicht gesetzt); `game-clock.js` misst die tatsächlich
vergangene Zeit und legt fest, was in dieser Zeit fällig wurde; `game-time.js`
trägt die Tabelle, welcher Takt in welchem Abstand fällt und wann er schweigt.

**Der Schritt ist die Wahrheit, nicht der Schuss.** Jeder Takt führt einen Rest
über den Takt hinaus mit und arbeitet bei einem langen Schritt die ausgefallenen
Runden nach — und jede Runde trägt ihren **eigenen Konfigurationstakt** als
`dtMs`, statt einen gestreckten Wert durchzureichen, den der Reducer an der
Phasengrenze anders klemmt. Gemessen in `check-game-clock.mjs`: 100 Schritte à
100 ms und 10 Schritte à 1000 ms ergeben denselben Taktstrom. Derselbe
Rest-Mechanismus trägt den Phasenwechsel weiter: eine Phase zählt nicht ab dem
Takt, in dem sie begann, sondern ab dem Moment, in dem ihr Vorgänger-Timer
fällig war. Ohne diesen Übertrag sammelt die
Onboarding-Kette pro Phase einen Takt Drift an — gemessen 6700 statt 6600 ms im
Testlauf, mit Übertrag getroffen auf die Millisekunde.

`GAME_TIME.maxStepMs` deckelt den einzelnen Schritt bei 1000 ms. Ohne den Deckel
wäre ein eine Stunde verborgener Tab ein Zug mit achtzehntausend Takten; mit dem
Deckel ist er Abwesenheit. Der Deckel gilt für alle Takte zusammen, weil es nur
einen Schritt gibt — vorher hatte jede Uhr ihre eigene Vorstellung von „jetzt",
und der gestreckte Ausschlag der einen interessierte die andere nicht.

`onboarding-schedule.js` bleibt der Zeitplan, `armPhase()` erkennt den
Phasenwechsel selbst, statt auf einen React-Effekt zu warten: der Plan wechselt
dort, wo der Zustand wechselt. Die Auflösung des Taktgebers ist damit auch die
Auflösung des Onboardings — ein Timer feuert am Ende des Taktes, in dem er
fällig wurde, also höchstens einen Herzschlag zu spät.

Die Bedingungen bleiben, wo sie waren: `TICKS` in `game-time.js` fragt
`rootingWorkCount()`, `workIsIdle()` und `hiveHasBudget()` — dieselben Prädikate,
die vorher die Runner gefragt haben, keine Kopie der Regel. Verwurzelung und
Arbeit schweigen, wenn es nichts zu tun gibt; die Hive-Uhr ist die Ausnahme und
läuft auch im Leerlauf weiter, weil ein Motor, der an einem Idle-Stopp hängt,
keiner wäre. Nachdem das Budget aufgebraucht ist, schweigt auch sie. Die
Wurzeluhr läuft über eine Liste aktiver Felder statt über alle 4.096 Kacheln,
weil sie `rootingWorkCount()` und nicht das Raster fragt.

Die Zeit kommt aus einer Naht: `monotonicNow()` in `game-clock.js` ist die
einzige Stelle in `src/`, die die Systemzeit liest, und `createGameClock()` nimmt
sie als Parameter. Deshalb prüft `check-game-clock.mjs` die Uhr mit vorgegebener
Zeit im Node-Prozess, ohne Browser und ohne Warten — mit einem festen Schritt
statt gemessener Zeit fallen dort 6 von 20 Prüfungen. In `src/domain/` wird
weiterhin keine Zeit gelesen: die Sperre gegen `Math.random(` und `Date.now(`
gilt unverändert, und `src/state/reducers/rooting-reducer.js` nimmt seine
Taktlänge jetzt aus `action.dtMs` statt sie aus der Config zu wiederholen.

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

Der Abbau ist der zweite Übergang, und er sitzt früher als gedacht: nicht erst
`mineTile` legt den Boden an, sondern `reached` im `mining-reducer` öffnet den
Vorrat in dem Moment, in dem der Dungling wirklich zu graben beginnt. Vorher
war der Übergang unerreichbar — eine Kachel ist `EARTH` genau solange ihr
Vorrat `BURIED` ist, und `FOUND` genau dann, wenn sie schon Boden ist. Die
beiden Zustände schlossen sich aus, `harvestTick` war toter Code.

Die Ernte folgt dem Grabfortschritt: der Pool ist `capacity × (1 − progress)`,
also trifft er im 35. Takt exakt die Null und der Cluster stirbt mit dem Schlag,
den der Dungling geführt hat. Das ist die entschiedene Antwort auf die offene
Frage, ob ein Cluster ein Schlag oder ein fließender Vorrat ist — ein Schlag.
Bei einer Essenz je Takt könnte ein Pool von 40 bis 100 nie leer werden und das
Todessignal bliebe unerreichbar. Die Weltbilanz bleibt dieselbe: jeder Cluster
liefert genau seine Kapazität, `WORLD_ESSENCE_BUDGET` gilt unverändert.

Vier Verhaltensweisen und drei Sättigungsstufen liegen in `src/world/deposits/`.
`deposit-visuals.js` rechnet sie aus dem Pool — Rauten auf den Vorratsfeldern,
deren Anzahl und Grünanteil an der Füllung hängen (`SHARD_BY_STAGE` 8/7/5/4,
Farbschlüssel je Stufe, streng fallend 75/57/40/0 Prozent), ein atmender
Schein auf aufgedeckten Nachbarfeldern, ein Schwall, der aus dem Ring um den
Vorrat auf den grabenden Dungling zufliegt, und schwarze Asche, wenn der Pool
leer ist. `DepositLayer.jsx` führt die Ebenen zusammen und hängt in
`TileLayer.jsx` **über** den Wurzeln: der `RootingVeil` malt mit 78 Prozent
deckend und würde den Hinweis sonst begraben — genau auf den Feldern, für die
er steht.

Die Fallstricke beim Zeichnen — das `transform`-Attribut, das von der
CSS-`transform`-Eigenschaft der Animation überschrieben wird, der gemeinsame
Radialverlauf, der allen Kacheln die Helligkeit der ersten aufzwingt, und die
Ebenenreihenfolge — stehen in [`PITFALLS.md`](PITFALLS.md).

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

Geprüft wird damit sieben Dinge: Isolation ohne Redundanz (kein Nachbarfeld
eines fremden Vorrats, keine Zelle doppelt), Determinismus (zwei `createWorld()`
liefern dasselbe), Budget (Clusterzahl im Band, Poolsumme exakt), Kapazität
(voll, in der Größenordnung, unter der Obergrenze, anfangs alles `BURIED`),
Sperrzonen, Zustandswechsel (`Claim → HINTED` genau einmal, beim zweiten Claim
folgenlos) und der Ernteweg. Der letzte Punkt ist der wichtigste, weil er als
einziger den **echten Reducer** fährt: `check-deposit-flow.mjs` grabt ein
Nachbarfeld, lässt die Wurzeln laufen, bis der Vorrat abbaubar ist, und
schickt dann `MINING_ORDERED`, `DUNGLING_REACHED_TILE`, 35 × `MINING_PROGRESS`
und `MINING_COMPLETED` durch `reduceMining`. Geprüft werden der sinkende Pool,
`lastHarvest` mit echtem Ziel in jedem Takt, `depleted` und der Endzustand
`SPENT`. Das ist der Test, der den toten `harvestTick` gefunden hat.

Noch offen und bewusst nicht entschieden: ob die Baurate der Extraktoren
steigt, wenn mehrere Kolonien an einem Vorrat arbeiten. Das gehört zur
Wirtschaft, nicht zur Ernte.

## Essenz-Ökonomie

Essenz hat einen Preis und eine Quelle, und beides steht in
`src/domain/economy/essence-economy.js`.

**Der Abbau kostet.** Jeder abgearbeitete Erdblock nimmt genau eine Essenz, und
der Abzug passiert bei der Auftragserteilung — nicht nach dem Grabenerfolg.
`canAffordMining()` in `src/domain/actions/mining.js` ist die einzige Stelle im
Spiel, die über Bezahlung entscheidet; bei null Vorrat wird der Auftrag
abgelehnt. Diese Regel wirkt auf **alle** Erde, nicht nur auf Vorratsfelder —
das war die offene Entscheidung, sie ist gefallen.

**Der Hive presst.** Eine Essenz alle zehn Sekunden, gedeckelt auf fünfundzwanzig
für das ganze Spiel. Die Obergrenze ist das, was ihn zum Puffer macht und zum
Endgame-Farm ausschließt. Der Hive merkt sich zwei Zahlen: `pressed` (wie oft
er schon gedrückt hat) und `progressMs` (wie weit seine Uhr steht). Beide sind
notwendig, weil der Fortschritt auch dann wachsen muss, wenn noch kein Druck
fällig ist — sonst käme die Uhr nie an ihre Schwelle und der Hive presste nie.

Der Startvorrat ist kein Literal, sondern `COST.extractor + 6 * miningCost`:
die sechs Abbaue des Startraums plus ein Extraktor. Wer die Raumgröße im
Onboarding ändert, muss diese Zahl mitziehen.

Die Simulation brauchte dafür eine Ergänzung: `virtual-clock.mjs` presst den
Hive nur, solange der Zeitplan die Uhr am Laufen hält. Ohne diese Bedingung
verbrauchte die Simulationsuhr das ganze Budget in 250 Sekunden, während das
Onboarding fünf Sekunden dauert — der Hive-Takt darf die Testuhr nicht
antreiben.

## Der Brutlord als Labor

Der Brutlord ist die Senke: vier Essenz gegen einen Stein, dessen Inhalt der
Spieler erst einmal nicht kennt.

**Determinismus ist die Regel, nicht der Zufall.** Ein Stein entsteht aus einem
beim Kauf erzeugten Seed — nie aus `Math.random()`. Aus demselben Seed kommt
immer derselbe Stein, damit Neuladen kein Losgriff ist und die Prüfung
reproduzierbar bleibt. Der Hash liegt in `src/domain/brutelord/stone-seed.js`
und ist bewusst eine dritte eigene Instanz neben `tileSeed` und `deposit-hash`:
die Schichtgrenze wiegt hier schwerer als Wiederverwendung.

Seltenheit, Fähigkeiten und Trait fallen alle aus diesem einen Seed.
`STONE_SALT` trennt die Kanäle, damit Seltenheit und Trait nicht
zwangsläufig aneinander hängen.

**Der Pity-Timer zählt Fehlschläge.** Jeder Wurf unterhalb der Legende erhöht
den Zähler, die Legende-Chance steigt um zwei Prozentpunkte je Fehlschlag und
ist bei fünfzig Prozent gedeckelt. Bei dreißig Fehlschlägen ist die Legende
garantiert, und der Zähler springt auf null zurück. Der Spieler sieht davon
nichts — genau deshalb ist es ein Timer und kein sichtbarer Zähler.

**Die Optik folgt der Formel Stein-Seed plus Slot, der Effekt nicht.**
`mutation-formula.js` leitet aus Slot und Variante eine Form ab: derselbe Stein
in den Armen wird zur Faust, im Bein zum Schneckenfuß. Seltenheit, Trait und
Fähigkeiten bleiben dabei bitgleich — das ist der ganze Reiz des Experiments.

**Der Gegenpol verhindert Pixel-Müll.** `counterScales()` vergleicht die stärkste
Stelle mit dem Rest und drückt die schwächeren zurück. Ohne das sähe ein
Monster mit vier mächtigen Steinen aus wie vier mächtige Steine nebeneinander
statt wie ein Körper. Gleiche Seltenheit bedeutet gleiche Waage — ein stärkerer
Stein braucht also tatsächlich einen schwächeren daneben, damit sichtbar wird,
dass er stärker ist.

**Die Maskierung ist der eigentliche Reiz.** Ein frischer Stein heißt `???`;
erst das Einbauen in einen Slot lüftet seinen Namen. Die Seltenheit gibt das
UI trotzdem über die Farbe preis. Ein Stein, der einmal verbaut wurde, gilt als
entdeckt — das Flag hängt am Stein, nicht am Inventarplatz.

**Die Traits wirken auf den Takt.** `stone-effects.js` faltet die verbauten
Steine zu einem Bündel — `buildOrders`, `auraRadius`, `speedBonus`, `trailSlow`,
`carryBonus` —, und `work-tick.js` fragt es pro Einheit ab. Ohne verbauten Stein
ist das Bündel neutral, der Takt läuft also unverändert; das ist der Grund, warum
es `NEUTRAL_EFFECTS` gibt und nicht eine Reihe von Sonderfällen je Trait.

Die Wirkung sitzt an genau zwei Stellen. Die Bauverweigerung greift in
`nextJobFor()`: ein gieriger Brutlord lässt `deliveryFor()` aus, der Dungling
geht stattdessen an den Extraktor. Das Tempo sitzt in `advanceWorkers()`, das
je Einheit einen eigenen Takt bekommt — `dtFor()` rechnet Aura und Spur
zusammen, damit eine Einheit nicht zweimal durch dieselbe Prüfung muss. Die
Schleimspur ist die Grundfläche des Brutlords; wer darüber läuft, verliert die
Hälfte seines Takts. Ein gieriger Stein verdoppelt die abgelieferte Essenz.

Gemessen wird das nicht an Konfigurationsliteralen, sondern am echten Reducer:
`check-traits.mjs` baut eine Kolonie mit fertigem Brutlord und offenem Bauplatz,
baut einen Stein mit bekanntem Trait ein und zählt die Takte bis zum
Essenz-Popup — einmal über den Brutlord, einmal daneben vorbei. Der
Gegenbeweis: neutralisiert man die Verdrahtung in `work-tick.js`, fallen genau
drei Prüfungen rot und der Rest bleibt grün. **Wie viele Prüfungen das sind,
steht absichtlich nirgends in diesem Dokument** — die letzte Zeile von
`npm run verify` schreibt sie, und eine abgeschriebene Zahl in einem Text wäre
ab dem nächsten Commit still falsch. Siehe *Messe, bevor du behauptest* in
`GOVERNANCE.md`.

## Der organische Mutant

Ein mutierter Dungling ist kein Dungling mit aufgeklebten Steinen mehr. Sein
Körper ist eine Kontur, die aus seinem **Genom** fällt. Die Kette ist strikt
und in einer Richtung: `phenotypeOf()` macht aus dem Genom Merkmale und Haut,
`skeletonOf()` daraus ein Knochengerüst aus einer L-System-Grammatik,
`fieldOf()` daraus ein Metaball-Feld und aus dessen Iso-Linie die Ringe, und
`anchorsOf()` setzt auf jeden markierten Gelenkpunkt einen Anker auf der
Kante. Nichts davon sieht SVG, nichts davon kennt die Steine.

Die Steine sind nur noch der **Ursprung** des Genoms: `genomeForStones()`
würfelt es aus ihren Seeds, `genomeOf()` fällt darauf zurück, wenn eine alte
Ablage Steine trägt, aber noch kein Genom. Der Renderer fragt nie nach Steinen
— `WorkerLayer.jsx` und `LabBench.jsx` reichen `genome` hinein, und im ganzen
Baum liegt genau ein Ort, der diese Regel kennt.

### Der Balken entscheidet über die Dicke, nicht das Symbol

Die Grammatik schreibt `S -> F[L]` und `L -> FL`. Innerhalb einer Klammer ist
**jedes** Segment eine Gliedmaße, auch das `F` zwischen den `L` — Dicke, Länge
und Rolle hängen an der Klammer, nicht am Buchstaben. Vorher entschied der
Walker den Sack nach der Klammer und die Dicke nach dem Symbol; das erste
Gliedmaßen-Segment trug damit Rumpffleisch und die Rumpfrolle. Gemessen über
zwölf Phänotypen reichten die Gliedmaßen so nur **1,01- bis 1,21-mal** über den
Rumpf — Stummel. Nach der Korrektur sind es **1,46- bis 3,56-mal**, und die
Gliedmaßen stehen als Arme und Beine vor der Silhouette statt in ihr.

### Die Sprosse wächst seitlich, nicht nach oben

Der Walker startet am Schwanz und geht den Rücken empor; jede Sprosse hob den
Winkel bisher um denselben `splay`, gleich an welchem Knoten. Gemessen stand
damit jedes Glied als Chevron **über** dem Rumpf, und der Mutant las sich als
Blob mit Zacken statt als Kreatur. Jetzt zählt der Walker die Rumpfknoten mit:
die oberste Sprosse wächst seitlich (`Math.PI`), jede tiefere nach unten
(`-RIGHT`). Dass daraus ein lesbares Glied wird, hängt an vier Zahlen, die
zusammen geeicht sind: `limbRoot` rückt die Wurzel um Rumpfdicken an die
Oberfläche, `limbPinch` schnürt das erste Segment ein, `bend` biegt die
folgenden nach außen beziehungsweise unten, und `limbJoint` schwillt das Gelenk
auf. Erst mit ihnen formt das Metaballfeld die Trennstelle am Schulter- und
Hüftansatz und den Knubbel an Ellbogen und Knie; vorher schluckte der Rumpf die
Gliedmaßen ganz. `bodyGirth` und `spineLength` mussten dafür fallen,
`limbLength` und `limbGirth` steigen.

### Eine Art ist ein Bauplan, kein Aufkleber

Der Mutant war eine Art: ein L-System für alle Genome, Unterschiede nur in den
Proportionen. Jetzt sitzt die Art im Genom — ein zehnter, dominanter Locus mit vier
Allelen —, und `SPECIES_GRAMMAR` hängt an jede Art eine eigene Grammatik: Zahl der
Rumpfknoten, ab welchem Knoten eine Sprosse Arm statt Bein wird, die Regeln selbst und acht
Multiplikatoren für Gliedmaßen, Gelenk, Rumpf, Kopf, Schwanz und Hörner. Der Walker kennt
keine der vier Arten: er liest `nodes`, `armFrom` und `rules` aus dem Plan und zählt nur
die Knoten und die bereits getriebenen Sprossen mit, damit die zweite Sprosse eines Knotens
(Spinne: `S -> F[L][L]`) neben der ersten landet statt auf ihr. Eine fünfte Art wäre damit
ein Eintrag in der Tabelle und keine Zeile im Walker.

Weil ein dominanter Locus das höchste der beiden Allele zeigt, ist die Verteilung schief,
und das ist Absicht: der Mensch ist die reinerbige Ausnahme, das Monströse dominiert. Eine
Auszählung über vierzig Genome ergibt Spinne 23, Insekt 11, Humanoid 4, Daemon 2 — die Art
wechselt also je Generation sichtbar, ohne dass das Spiel dafür würfeln müsste.

### Der Zeichenaufwand ist gemessen, nicht geschätzt

`npm run bench:organic` montiert zwanzig Mutanten im 928px breiten 13×13-Fenster
und misst im echten Browser dieselbe `MutantSvg`, die `WorkerLayer` montiert.
Ein Mutant trägt 38 bis 56 Elemente (Knochen, Gelenke, Ringe; Mittel 45,3). Die
Frame-Konstruktion kostet kalt 9,27ms und warm 0,11ms je Frame — der diskrete
Cache trägt sie um den Faktor achtzig. Das Neuzeichnen der zwanzig liegt im
Vite-Dev-Build bei rund 13ms je Mutant; die Zahl ist eine Obergrenze des
Dev-Builds, nicht des Production-Builds. Und die Frame-Identität hält nicht nur
im Cache, sondern im Weltbild: über alle vier Atemphasen ist das Markup jedes
Mutanten innerhalb einer Phase byte-gleich und über die Phasen verschieden.

### Der Schlüssel ist diskret, sonst ist der Cache ein Leck

`organicFrame(genome, phase)` baut eine Kontur aus Gitterproben und
Marching-Squares — teuer genug, dass ein Aufruf pro Frame nicht in Frage kommt.
Der Cache-Schlüssel ist deshalb `${genomHash}_f${phase}`: **eine ganze Zahl
zwischen 0 und 3**, das Ergebnis von `phaseOf()`. Ein Takt, eine Kommazahl oder
eine Systemzeit im Schlüssel ergäbe pro Frame einen neuen Eintrag, ein neues
Objekt und eine neue Kontur. Bei drei Genomen und vier Phasen sind es gemessen
zwölf Objekte über 2008 Frames; mit dem rohen Takt als Schlüssel wären es 2008.

Der Rahmen (`view`) hängt am Phänotyp, nicht an der Phase: er wird aus dem
Skelett der weitesten Atemphase gerechnet. Sonst würde die Atmung beim
Einpassen wieder herausgerechnet, und vier verschiedene Konturen sähen gleich
groß aus.

### Ein Takt für alle

Die Phase kommt nicht mehr als `step` aus dem Bergbau, sondern aus
`organic-phase-clock.js`: ein Zähler, `phaseOf()` darüber, und ein Intervall,
das nur läuft, solange ein Mutant zuhört. Dadurch atmen Welt und Labortisch
denselben Körper im selben Bild, und der Arbeitstakt kann den Atem nicht mehr
verzerren. Der Takt ist frei von React und frei von Systemzeit — er kommt aus
dem Zähler.

### Die Konturen stecken im Golden

Die Geometrie ist Spielwahrheit ohne Zustand: sie ändert keinen Spielstand,
als nur ein Bild. Deshalb faltet `state-digest.mjs` je Genom die Ringe aller
vier Phasen in den Zustands-Hash des Determinismus-Laufs. Eine verschobene
Zahl an `ORGANIC_CONFIG` reißt damit den **Slice-Lauf** rot, mit Zug und
Aktion im Befund — nicht nur die eigene Geometrie-Suite. Die erste Abweichung
liegt exakt auf `MUTANT_CREATED`; alles davor bleibt unverändert.

### Die Schichten und die IDs

Gezeichnet wird in einer festen 2.5D-Kette: Schatten, Unterlage (Knochen als
sichtbare Anatomie), Körper (Kachelmuster), Wäsche, Rim, Merkmale. Die
`<defs>`-IDs sind **instanz-eigen** (`data-unit` wandert in jede `id`) — zwei
Mutanten mit derselben Kennung würden sich eine Definition teilen, und der
zuletzt gezeichnete färbte den ersten. `organic-features.jsx` setzt Hörner,
Zähne und Augen auf den Ankerpunkt und entlang der Ankernormale, damit sie auf
der Kante sitzen und nicht daneben.

## Welt und Darstellung

`src/world/TileLayer.jsx` zeichnet in fünf Durchgängen: Erde, fertiger Boden,
Verwurzelung, Vorräte, Bauten. Die Vorräte stehen damit über den Wurzeln und
unter den Bauten — der `RootingVeil` malt mit 78 Prozent deckend und würde den
Hinweis sonst begraben, genau auf den Feldern, für die er steht.

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

### Was ein Render kostet

Der Herzschlag tickt zehnmal pro Sekunde, und jeder Takt ist ein vollständiger
Durchlauf durch `App` — Kolonie, Wurzeln und Hive fallen dabei in denselben Zug.
Was pro Durchlauf teuer war, stand an vier Stellen:

**Das Raster war ein Objekt mit viertausend String-Schlüsseln.** `world.tiles`
ist jetzt ein dichtes Array, Index `y * width + x`. Das ist kein Kosmetikum,
sondern der teuerste Einzelposten im ganzen Spiel: `{ ...world.tiles }` kostete
**6,7 ms**, `tiles.slice()` **24 µs** — Faktor 273. Ein Objekt mit so vielen
Schlüsseln landet in V8 im Wörterbuchmodus, und dessen Kopieren ist ein
s generischer Durchlauf. `cellIndex()` in `grid.js` ist die einzige Stelle, die
aus einer Id einen Platz macht; `tileAt(world, x, y)` liefert dieselbe Kachel
über Koordinaten, damit weder Id gebaut noch zerlegt werden muss. `isUsable()`
trägt darum `null` — am Rand des Rasters bleibt die Kachel leer. Wer das Raster
anfasst, fasst diese drei Funktionen an, nicht ihre Aufrufer.

**Der Ausschnitt wurde durchsucht, um 13 × 13 Kacheln zu finden.** `tilesInView()`
geht den Ausschnitt koordinatenweise ab und liest `tileAt()` — 169 Zugriffe statt
4.096. `builtCenterPx()` zählt in einer Schleife ohne Zwischenarray. Die Frontier
zählt nur, was im Ausschnitt liegt; sie wird ausschließlich im `TileLayer`
gelesen, also ändert das nichts am Bild. `GameStage.jsx` berechnet die Kamera
nur noch, wenn das Kontextmenü offen ist — sonst stand derselbe Kasten zweimal
pro Render im Bild, mit identischen Argumenten. Und `touchesUsableSpace()` lief
über `neighborIds()`, also über vier gebaute Id-Strings, die `getTile()`
unmittelbar wieder zerlegte; es fragt die vier Nachbarn jetzt direkt.

**Mehrere Kacheln wurden einzeln geschrieben.** `replaceTile()` streut das ganze
Raster, und `revealAround()` tat das 37-mal für einen einzigen Block — 78 ms in
einem Reducer-Schritt. `applyTiles()` in `grid.js` ist die Stelle, die mehrere
Änderungen in *eine* Kopie packt; `reveal.js`, `tickRooting` und
`spreadToNeighbors()` benutzen sie. Einzelne Kacheln bleiben bei `replaceTile()`.

**Geometrie hängt an Koordinate, Größe und Zustand.** `earthGeometry()`
cached darum nach genau diesen drei Dingen (`earth-geometry.js`) und baut die
Pfade nur beim ersten Mal. Das ist sicher, weil die Form aus `tileSeed(x, y)`
und dem Seed des Zustands kommt — nicht aus der Zeit.

Und: `depositsOf()` kopiert nur noch Kacheln, die wirklich einen Vorrat tragen.
Vorher bekam jede Kachel pro Render ein neues Objekt, damit traf `React.memo`
auf `EarthTile` nie zu und die Geometrie wurde für alle 56 sichtbaren Felder neu
gebaut, obwohl sich 55 davon nicht bewegt hatten.

Gemessen wurde das in `node` gegen die echten Module und im Browser per
CPU-Profil im Production-Build, alt gegen neu im selben Prozess, weil die
Maschine unter Last stand und absolute Zahlen sonst nichts bedeuten:

| | vorher | nachher |
| --- | --- | --- |
| `createInitialGameState` (Boot) | 258 ms | 9,7 ms |
| Ableitung pro Render | 16,2 ms | 1,06 ms |
| Rooting-Takt (10 Hz) | 4,1 ms | 0,039 ms |
| ein abgeräumter Block | 78 ms | 3 ms |
| Script-Zeit im Browser, aktiv | 0,41 s/s | 0,08 s/s |
| Long Tasks | 16, max 97 ms | 4, max 56 ms |

Bild und Bedienung sind unverändert. Das ist nicht behauptet, sondern geprüft:
58 Zustände über den ganzen Ablauf — Start, Onboarding, Abbau, Aufdecken, 240
Rooting-Ticks, Hive- und Arbeitstakte — liefern zwischen Objekt- und
Array-Raster dieselben 4.096 Kacheln, dieselbe Frontier, dieselben Vorräte,
dieselben Bauten und Dunglinge, byteweise. Dazu die unveränderte Abnahme.

Was bleibt, ist ehrlich gesagt Rest: die verbleibenden rund 1 ms pro Render
sind der Ausschnitt, die Frontier und Reacts eigene Abstimmung. Die Frontier
noch weiter zu bringen hieße, `canMineTile()` in der Ansicht zu duplizieren —
das wäre ein Regelbruch für ein halbes Prozent des Taktbudgets.

## Konto und Spielerseed

Ein Konto ist ein Name und ein Passwort. Daraus entsteht ein **Spielerseed**, und
der Seed ist die Welt. Die Kette steht bewusst in dieser Reihenfolge:

```
Name + Passwort  →  scrypt  →  32 Byte Prüfsumme + 32 Byte Seed
                                     ↓                        ↓
                              accounts.verifier        playerseed (Hex)
                                                            ↓
                                            worldSeed() → uint32 → world.seed
```

`scrypt` läuft **einmal** pro Konto und liefert beide Ausgaben aus einem Aufruf —
ein teurer Hash statt zweier. Jedes Konto hat sein eigenes Salz; gespeichert
werden nur Salz und Prüfsumme, **nie** das Passwort. Der Seed wird nicht
gespeichert, sondern bei jeder Anmeldung aus denselben Zugangsdaten neu
abgeleitet. Deshalb gilt: gleiche Zugangsdaten, gleiche Welt — auch nach einem
Reload, und ohne dass irgendwo ein Welt-Schnappschuss liegen müsste.

Der Seed ist Hex, `worldSeed()` in `src/domain/world/world-seed.js` ist die
**einzige** Tür zur Zahl. Das ist keine Formalie: `createWorld()` rechnet den
Seed in `Math.imul(seed + SALT, MIX)` ein, und ein Seed, der als Zeichenkette
ankommt, wird dabei zu `NaN` — außer er besteht nur aus Ziffern, denn
`'12345678' + 3266489917` ist eine parsebare Zahl und `'a1b2c3d4' + 3266489917`
nicht. Vor dieser einen Tür teilten sich alle Buchstaben-Seeds eine Welt.

Was der Seed verändert, ist genau zwei Dinge, und beide sind sofort sichtbar:
die **Kontur der Höhle** um den Hive und die **Vorratskarte**. Für die Kontur
gibt es `REVEAL_GUARANTEED` in `world-config.js`: der Kern um eine Sonde bleibt
immer frei, alles davor wackelt pro Seed. Das Wackeln selbst nimmt **nicht** das
niedrigste Hash-Bit — `parity(x) XOR parity(y) XOR parity(seed)` ist linear, also
kippt ein Seed damit alle Entscheidungen oder keine und die Welt bekommt genau
zwei Formen. Erst zwei Mix-Runden und dann Bits 8 bis 15 ergeben pro Feld eine
eigene Entscheidung (gemessen: 24 von 24 Mustern statt 2 von 24).

Die `PlayerID` ist keine zweite Identität, sondern der Seed, verkürzt und
markiert: `p-` plus die ersten acht Hex-Ziffern.

Das Backend hängt als Vite-Plugin im Dev-Server (`scripts/server/plugin.mjs`),
also gibt es keinen zweiten Prozess. SQLite kommt aus `node:sqlite` — keine neue
Abhängigkeit. Die Datenbank wird pro Anfrage geöffnet, nicht einmal beim Start:
sonst hält ein laufender Server eine Datei offen, die `npm run purge` gerade
gelöscht hat, und antwortet danach mit `readonly database`.

`npm run purge` löscht `.data/` samt Datenbank. `.data/` steht in `.gitignore` —
Passwörter und Seeds dürfen nicht ins Repo. `npm run verify` fasst die
Entwicklungsdatenbank nicht an: `check-account.mjs` legt sein eigenes
Temporärverzeichnis an und räumt es ab.

### Die Konto-API nimmt Angriffe an

`scripts/server/account-api.mjs` ist die einzige Tür zum Konto, und sie hat vier
Schranken bekommen, weil eine API ohne sie nur auf den Angriff wartet:

**Die Bremse.** `account-throttle.mjs` zählt Fehlversuche je Name *und* Herkunft in
einem gleitenden Fenster; ab `ACCOUNT_CONFIG.throttle.attempts` Versuchen antwortet
die Tür eine Minute lang mit 429 statt mit 401. Sie liegt im Speicher und nicht in
der Tabelle, weil ein Dev-Server ein Prozess ist und die Bremse nach dem Neustart
neu sein darf. Ein Erfolg löscht den Zähler, sonst wäre ein legitimer Tippfehler
nach dem Fenster unbezahlbar. Zwei Namen aus derselben Adresse teilen die Bremse
nicht — sonst wäre ein Angreifer mit einem Konto ein DoS für alle anderen.

**Der Attrappenpfad.** Ein unbekannter Name lief vorher direkt aus `login()`
zurück, ohne scrypt — die Antwortzeit verriet, ob es das Konto gibt. Jetzt läuft
beide Wege durch denselben teuren Hash (`decoyMatches()`), und die Antwort ist in
beiden Fällen 401 mit demselben Text.

**Die Obergrenzen.** `passwordMax` gilt beim Anmelden genauso wie beim Anlegen: ein
unbegrenztes Passwort ist ein unbegrenzter scrypt-Eingang. Und die Anfrage wird nach
**Bytes** gezählt, nicht nach Zeichen — nach Zeichen passiert eine Mehrbyte-Schrift
das Limit und der Wächter antwortet gar nicht, weil die Verbindung schon weg ist.

**Der Ursprung und die Antwort.** `sameOrigin()` lehnt eine Anfrage ab, deren
`Origin` nicht zum `Host` passt; fehlt der Kopf, kam sie nicht aus dem Browser. Jede
Antwort trägt `nosniff`, `DENY`, `no-referrer` und `no-store`, damit ein Seed im
Cache eines Zwischenwegs hängen bleibt. Und ein Fehler im Server landet als
`console.error` auf der Konsole, nicht als Meldung im Fenster des Spielers.

Was das **nicht** ist: es gibt weiterhin kein Token. Die Sitzung im Browser ist
`localStorage` und der Seed ist die Identität — dieselbe Kennung genügt also schon dem
Wissen um den Seed. Das ist für den Slice richtig (es gibt nichts zu stehlen außer
einer Welt) und wird mit dem Spielstand zu einer echten Baustelle; der Weg dorthin
steht bei *Noch nicht Teil dieser Fassung* unten.

### Der Purge schützt nicht Pfade, sondern seinen Inhalt

`purge.mjs` löscht rekursiv in `DL_DATA_DIR`, und das Verzeichnis kommt aus der
Umgebung. Die erste Schranke fragte, ob der Pfad *gleich* Wurzel, Home oder
Arbeitsordner ist — `..` ist keines davon, und der Elternordner war leer. Jetzt
gilt die andere Frage: **was liegt in diesem Pfad, das ich nicht löschen will?**
Tabu ist jeder Pfad, der den Arbeitsordner enthält, plus Wurzel und Home.

Die Gegenprobe läuft in einer Sandbox (`check-account-http.mjs`), weil ein Loch
in dieser Schranke im Repo verheerender wäre als in einer Wegwerfmappe.

**Noch nicht Teil dieser Fassung:** der Spielstand. Wer sich abmeldet, verliert
Hive, Vorräte und Bauten. Das ist der offene Roadmap-Punkt, und die Konto-Schicht
ist so gebaut, dass der Spielstand später als eine Spalte in derselben Tabelle
dazukommt, ohne das Passwortmodell anzufassen.

## Der Eco-Stakes-Raid

Der Plan steht vollständig in [`RAID-PLAN.md`](RAID-PLAN.md). Hier trägt, was
der Code beim Bauen entschieden hat und im Kommentar keinen Platz mehr findet.

### Der Anteil statt der Roheit

Der Ausdauerpool hängt an `grit`, und `grit` ist der vierte Eintrag von
`STAT_KEYS`. Das ist die Entscheidung, an der die Ökonomie hängt: **der Anteil
zählt, nicht der Rohwert.**

`grit` steht ausschließlich auf LEGENDARY-Steinen. `statsFor()` in
`stone-roll.js` vergibt `STAT_KEYS[index % 4]`, und `statCount` skaliert mit der
Seltenheit — NORMAL liefert nur `atk`, RARE `atk` und `speed`, EPIC zusätzlich
`haul`, und erst LEGENDARY kommt auf vier Schlüssel. Ein Team aus 23 Epics und
einer Legende hat deshalb `grit` 20 und nicht 480: Die Verteilung über ein Team
ist **binär**, nicht stufenlos. Wer die Roheit selbst in den Multiplikator gibt,
kodiert diesen Sprung mit in die Zahl und muss die Kurve später von Hand
glätten.

Deshalb rechnet `raid-config.js` über den Anteil:

```
teamGritShare = teamGrit / maxTeamGrit        // 0 bis 1
Ausdauer      = base + bonus * teamGritShare
```

`maxTeamGrit()` liest `MAX_DUNGLINGS` (6), `SLOT_ORDER` (4) und
`STONE_DEFS.LEGENDARY.power` (4) aus den Configs statt sie zu wiederholen:
sechs Monster, 24 Steine, je Stein höchstens `5 × 4 = 20`. Der Multiplikator
ist damit dimensionslos und muss den Wertebereich der Stats nicht mitkodieren.

**Gemessen, nicht gesetzt:** `maxTeamGrit()` liefert 480. Ein Team mit 240 grit
hat 122 Ausdauer, ein nacktes 64, ein voll ausgestattetes 180.

### Der Einmarsch misst orthogonal

Der Anmarsch ist **Manhattan**, nicht euklidisch. Graben geht in vier
Richtungen, die Zahl der Felder auf dem Weg entscheidet die Ausdauer. Und die
ferne Ecke ist nicht (0,0): `HIVE_ORIGIN` steht bei 31,31 auf einer Karte mit
Indizes 0 bis 63, also ist die ferne Ecke (63,63) mit 32 + 32 = **64** Feldern.
`baseStamina` ist deshalb aus `Math.max(origin, size - 1 - origin)` gebaut und
nicht aus `Math.abs(origin)` — die zweite Form misst die falsche Ecke und lässt
die fünf entferntesten Felder unerreichbar.

Mit 64 erreicht ein nacktes Team den Hive von **allen 4096 Feldern** der Karte.
Mit den zunächst angenommenen 62 wären es 99,9 Prozent gewesen.

**Und derselbe Satz für den Radius.** Zwei Zahlen, die sich nie begegnet sind:
`entryRadius` 60 und `baseStamina` 64. `worstEntryDistance()` rechnet den
schlimmsten Einmarsch als `min(entryRadius, MAX_APPROACH)` — der schlimmste
Einmarsch ist der fernste Punkt des **Rings**, nicht die Kartenecke, denn der
Ring bei 60 bietet auf einem 64 × 64-Raster keinen Punkt in 64 Schritten. Die
Basis-Ausdauer liegt damit mit 4 über dem Wert, den sie tragen muss. Die
Reserve ist gewollt, eine zu kleine Basis-Ausdauer wäre es nicht, und genau
darum prüft `check-raid-format.mjs` zusätzlich, dass der Wert im Ring auch
**erreichbar** ist: eine reine Obergrenze hätte einen zu kleinen Wert nicht
auffallen lassen.

**Die Kandidatenliste ist Teil des Formats.** `entryPointFor()` wählt mit
`index = hash * list.length` aus `candidates()` — wer die Liste umsortiert,
verschiebt jedes laufende Ticket und kippt dabei keine einzige Regel. Deshalb
trägt `RAID_FORMAT_VERSION` den Zustand mit in `stateHashInput()`, und die
Abnahme friert Länge, ersten und letzten Punkt der Liste als Konstante ein.
Wer die Reihenfolge ändern will, hebt die Fassung an.

### Der Einmarschspunkt zählt die Kandidaten, nicht die Ringe

`raid-spawn-seed.js` streut über einen eigenen Hash aus dem Ticket. Der erste
Wurf teilte die Ringe von innen nach außen in `8r` Felder und suchte vorwärts
nach dem ersten freien. Das ist falsch an zwei Stellen:

- Der Umkreis von 60 Feldern ist ein **121 × 121-Quadrat**, von dem nur
  64 × 64 auf der Karte liegen. 72 Prozent der Indizes zeigten auf Felder wie
  (-11, 86), der Scan lief über zweitausend Schritte ins Leere und kam bei
  288 von 400 Tickets auf demselben Feld an der Hive-Tür heraus.
- Ein Ring hat `8r` Felder, nicht `4r` — `4r` zählt die vier Seiten ohne die
  Zwischenpunkte.

`candidates()` klemmt die Schleife stattdessen ans Raster und liefert nur
unbebaute Felder, `entryPointFor()` wählt daraus per Hash. Der Umkreis ist
Manhattan, damit `entryRadius` dasselbe misst wie `baseStamina`.

**Gemessen:** 4066 Kandidaten (99,3 Prozent der Karte), Weg zwischen 1 und 60.
Über 600 Tickets sind 561 verschiedene Punkte entstanden, der häufigste genau
dreimal, und alle 600 sind reproduzierbar.

### Zwei Instanzen, ein Verb

`raid-state.js` ist eine **zweite** Zustandsinstanz, kein Reducer-Zweig.
`game-reducer.js` iteriert eine Kette, erster Reducer gewinnt — ein Reducer kann
kein Verb abfangen, das an einen anderen Zustand ging. Ein isolierter `RaidState`
ist damit eine eigene Kette mit eigenem Zustand, und der Modus-Zweig liegt an
der Aufrufstelle, nicht in der Domäne.

`use-game-actions.js` ist die Dispatch-Schicht und steht bei **23 von 30 LOC** bei
zwei von sieben belegten Importzeilen. Sechs Raid-Aktionen passen dort nicht
hinein und brauchen ein eigenes Modul.

Die Ausdauer ist ein Pool ohne Nachwachsen, AP füllen sich pro Runde auf. Ein
Taktbeschleuniger kommt deshalb nicht weiter: Nicht das Tempo begrenzt den
Raid, sondern die Summe. Bewegung über bekanntes Gelände kostet nichts —
dadurch ist das Graben die einzige Schranke des Einmarsches, und deshalb steht
die Ausdauerrechnung an erster Stelle der Bauordnung.

`spend()` lässt den Zustand unverändert, wenn die Ausdauer nicht reicht. Das ist
das Fail closed aus dem Plan: kein Phasenwechsel, keine Rettung.

### Die Gruppe hat einen Cursor

`state.at` gehört der **Gruppe**, und `state.heroes` trägt **keine** Position.
Der Grund ist nicht Bequemlichkeit: In der Kolonie ist die Position je Dungling
Spielwahrheit, weil sie sich Kacheln teilen. Im Raid entscheidet sie nichts —
gegen einen eingefrorenen Snapshot gibt es keine Zugsorge — und sie verdoppelt
Zustand, Hash und Replay-Format, ohne einen Vorteil zu erkaufen.

Die Bedienung ist dafür **halbautomatisch**, und das ist eine echte Entscheidung
mit drei Teilen:

- **Ein Befehl setzt den Pfad.** `orderFrom()` ruft `planPath()` auf und legt
  den Weg ab, nicht das Ziel. Die Pfadfindung ist **Dijkstra über Ausdauer**,
  nicht BFS über Schritte: `cellCost()` ist 0 für bekannten Boden, der
  `digCost()`-Wert für ungegrabenen und `Infinity` für Wand, und ein Weg, dessen
  Summe `state.stamina` übersteigt, wird gar nicht erst ausgegeben. Ein
  kürzester Weg durch Stein wäre der falsche.
- **Im Idle erkundet die Gruppe selbst.** `frontierOf()` sammelt die grabbaren
  Felder am Rand des gelaufenen Bereichs, der Seed daraus kommt aus dem Ticket
  mit eigener Salze. Der Idle-Takt **gräbt** — das ist Bewegung durch
  Erdreich —, führt aber keine Aktion aus: kein Angriff, kein Zielwechsel. Er
  kostet Ausdauer statt AP, und das ist der Preis des eigenen Explorierens.
- **Ein toter Befehl ist ein neuer Befehl.** Wird ein Befehl unerfüllbar, fällt
  die Gruppe auf die Erkundung zurück, statt zu blockieren. Die Frontlinie wird
  jeden Takt neu gebildet, deshalb gehört jeder selbst gegrabene Tunnel sofort
  zum Erkundungsraum.

Die Trennung in `raid-path.js` (Kosten und Weggrafik), `raid-verbs.js` (DIG,
ATTACK, die Berechtigung) und `raid-move.js` (Befehl, Takt, Ankunft) ist am Cap
erzwingen: eine Datei dafür wäre über 300 Zeilen geworden.

### Die Traits in der Währung des Raids

`raid-traits.js` faltet mit `peak()`, weil dasselbe gilt wie bei den Stats: Ein
Team ist nicht zweimal gierig. Die Werte sind dabei **aus der Kolonie-Semantik
gerechnet**, nicht daneben abgeschrieben:

```
lootScale = 1 + carryBonus            // Gierig trägt doppelt
apScale   = 1 + speedBonus            // Motivator beschleunigt
digScale  = 1 / (1 - trailSlow)       // Schleim halbiert das Tempo
```

Die Bezeichnungen sind der Punkt: Im Raid gibt es keine Bauaufträge, keine
fremden Dunglinge und keine geteilten Kacheln. `buildOrders` aus der Kolonie
fällt ersatzlos weg, `auraRadius` wird bedingungslos — die Gruppe ist eine
Einheit, die Aura umfasst sie immer —, und aus `trailSlow` wird ein **Preis**:
Ein Grabfeld, das an ein vom Team bereits gegrabenes Feld grenzt, kostet das
Doppelte. Dieselbe Aussage, andere Stelle: Man zahlt für die eigene Bequemlichkeit.

### Graben: Mechanik und Berechtigung

Das sind zwei Dinge, und der Versuch, sie in einem zu führen, hat die Fähigkeit
einmal zur Erfindung gemacht. Der **Mechanismus** ist ein Verb mit eigener
Kostenlogik (`digCost()`, Ausdauer im Raid) und braucht keine Stein-Semantik.
Die **Berechtigung** ist `STONE_CAPABILITY.GRABEN` in `stone-config.js` — sie
gehört zum Stein, weil sie **in beiden Welten** dasselbe ist, und sie reist mit
dem Kader ins Ticket, wo `canDigTeam()` sie fail closed auswertet. Die
Konstante steht bewusst beim Entity und nicht in `src/domain/raid/`: Wer sie
dort kopiert, baut zwei Fähigkeiten mit demselben Namen, und die Basis gräbt
mit der einen, der Raid mit der anderen.

## Werkzeuge

**Vorschau im echten Browser** läuft über `tools/preview/`, nicht über eine
temporäre `lab.html`. Ein Befehl bringt alles hoch und hält es am Leben:
`node tools/preview/up.mjs` ist ein Supervisor für das sichtbare Chrome, den
Inbox-Server und den Marker-Daemon. Er startet Chrome nur neu, wenn **Chrome
wirklich weg ist** — schließt man das Fenster, räumt er auf, statt es sofort
wieder aufzureißen. `node tools/preview/down.mjs` sagt ihm dasselbe von der
Konsole aus. Der Daemon hängt sich per CDP an und injiziert `marker.js` nach
jedem Reload neu.

Im Fenster markiert `m` ein Element, `p` blendet das Panel ein, `Esc` beendet
den Modus; jeder Klick vergibt eine ID `m1`, `m2`, … Das Panel listet die Marks
als Bullet-Liste mit Kommentarfeld. **Senden -> Chat** legt die Liste in die
Zwischenablage **und** in die Inbox auf `127.0.0.1:9333`;
`node tools/preview/pull.mjs` liefert sie zurück, `--clear` leert. Damit ist
„m2 ist zu blau" im Chat eine Zeile mit Selektor und Rechteck, kein Raten.

Der Supervisor ist der trickste Teil, und drei Fehler steckten darin, die alle
drei schon ein Fenster aufgerissen haben: Der Health-Check darf **kein
HTTP-`fetch`** sein (Node hält Keep-Alive-Sockets, die Chrome nach kurzer Zeit
schließt — der nächste `fetch` meldet „Chrome tot", während `curl` in 11 ms mit
200 antwortet; ein `net.connect` kann das nicht), er muss **Chrome und Port
getrennt** prüfen — gibt es den Prozess noch, aber der Port ist zu, ist das kein
Grund für ein zweites Fenster —, und er muss ein geschlossenes Fenster von einem
Absturz unterscheiden, sonst wird jedes normale Schließen zum Neustart.

Die Fallstricke dahinter — Registrierung des Markers über die CDP-Session, das
`null` im `document-start`, die Capture-Phase der Tastatur-Handler — stehen in
[`PITFALLS.md`](PITFALLS.md).

## Prüfungen

`scripts/verify-slice.mjs` ist der Einstiegspunkt und ruft Prüfgruppen auf, die
ihre Erwartungen aus den Configs ableiten. Neue Domänenlogik ist erst geprüft,
wenn eine `check-*.mjs` sie aufruft; die echten Module aus `src/` werden
importiert, nicht nachgebaut.

**`npm run verify` prüft auch, dass das Spiel startet.** Die Startprüfung ist
kein Extra und kein Opt-in: `checkStartup()` ruft dieselbe Browser-Stufe auf,
die auch allein über `npm run verify:browser` läuft, und beide hängen an
`checkBrowserStage()` in `scripts/browser/stage.mjs`. Wer nur im Node rechnet,
prüft genau die Hälfte, die keine Uhr hat — der Abbau-Takt, der Spawn und das
Onboarding leben im Browser, nicht in `verify-slice.mjs`. Deshalb steht in
`ci.yml` vor der Verifikation `npx playwright install --with-deps chromium`, und
deshalb ist `verify:browser` keine Abkürzung für den Lauf, sondern sein
eigenständiger Zugang zu derselben Stufe.

`scripts/verify/index.mjs` listet die Gruppen an **einer** Kante: der Runner
stünde sonst mit acht Importen am Cap, und eine neue Gruppe müsste in ein Modul
einhängen, das inhaltlich nichts mit ihr zu tun hat. Ein Feature-Check wie
`check-raid-group.mjs` bleibt trotzdem bei seinem Feature.

- `check-colony.mjs` bündelt Bauen und Beanspruchung, weil `verify-slice.mjs` an
  der Importgrenze steht. Dort hängen auch `check-traits.mjs` und sein Aufbau
  `lab-run.mjs`, das eine Kolonie mit verbautem Stein und offenem Bauplatz stellt.
- `check-deposits.mjs` hängt an `checkRooting()`, weil der Einstiegspunkt mit
  sieben Importzeilen am Cap steht und der Hinweis ohnehin Verwurzelung ist.
  Beim Nachtreiben von Hand: `startRooting(world, tile)` nimmt die Welt **und**
  die Kachel, nicht nur die Kachel.
- `scripts/verify/index.mjs` listet die Gruppen an **einer** Kante, weil
  `verify-slice.mjs` mit dem Raid an der Importgrenze stand. Der Runner kennt
  seitdem eine Datei statt acht, und eine neue Gruppe kommt in genau einer Zeile
  dort hin — statt in einem Modul, das inhaltlich nichts mit ihr zu tun hat.
- `check-raid.mjs` bündelt Bewegung, Traits und Format. `raid-fixture.mjs`
  stellt das eingefrorene Ticket gegen einen festen Snapshot und die zwei
  Bewegungshelfer (`runTicks`, `digTo`), weil drei Prüfgruppen denselben Aufbau
  brauchen und `digTo` **genau so viele Takte laufen lässt, wie der Pfad lang
  ist** — ein Tick mehr und die Gruppe gräbt schon wieder aus eigenem Antrieb.
- `build-run.mjs` spielt den kompletten Bau-Durchlauf mit der virtuellen Uhr
  durch; die Beobachtungen sind Material, die Behauptungen stehen in
  `check-build.mjs`.
- `virtual-clock.mjs` führt denselben Zeitplan wie der Browser aus, nur ohne
  Wartezeit. Der Arbeitstakt wird als `WORK_TICK` mit festem `dtMs` getaktet —
  auch hier gibt es keine Systemzeit.
- Die Browser-Uhr in `scripts/browser/page.mjs` ist installiert **und
  angehalten** (`install` + `pauseAt`): sonst läuft sie mit der Wanduhr
  weiter, und die Spielzeit hängt an der Lesegeschwindigkeit des Laufs.
  `scripts/browser/drive.mjs` hält die Fahrbefehle — sie warten mit der Uhr
  auf ein Ziel, das sichtbar und bedienbar ist, weil ein Klick auf eine
  angehaltene Uhr sonst auf ein Element wartet, das erst eine Phase später
  entsteht. Zwei Folgen davon standen in `src/`: der `ResizeObserver` in
  `use-stage-scale.js` lieferte ohne Bildaufbau keine Fläche (die erste Messung
  läuft deshalb synchron beim Einhängen), und der Knopf „+ Dungling" bleibt
  gesperrt, solange der letzte Dungling einen Auftrag hat.
- `check-determinism.mjs` friert den ganzen Slice als Zustands-Hash **je Zug**
  ein. `determinism-run.mjs` spielt ihn: den Bau-Durchlauf aus `build-run.mjs`
  und danach die Züge, die sonst nur der Browser auslöst — Wachstum, Labor,
  Mutation, Etagensprung. Damit feuert der Durchlauf **jede** Aktion der Kette
  (30 von 30), und die Prüfung leitet das aus `ACTION` ab, statt eine Liste zu
  pflegen. Der Golden-Wert liegt in `determinism-golden.json`: zehn Hashes je
  Zeile, acht Zeichen je Hash, rund 72 KB über die vier Sample-Seeds. Er wird
  vom Prüfer **nie** geschrieben — `npm run golden:determinism` ist der einzige
  Weg, und ein neu geschriebener Golden-Wert ist eine Verhaltensänderung, die
  in den Commit-Body gehört. Der Befund nennt bei einer Abweichung die
  Zugnummer, die Aktion und beide Hashes, also die Stelle statt einer
  Enddifferenz.
- **Der Golden-Wert trägt seine Laufzeit im Kopf.** `nodeMajor` steht über den
  Seeds, gelesen und geprüft wird gegen `node-version` aus
  `.github/workflows/ci.yml` — nicht gegen eine abgeschriebene Zahl daneben.
  Der Erzeuger bricht auf jeder anderen Node-Major ab, **bev** er rechnet, sonst
  entsteht ein zweiter Wert über denselben Slice und die Prüfung vergleicht
  fortan nur noch den, der gerade passt. Der Prüfer meldet eine fremde
  Laufzeit als Befund statt als Hash-Differenz, weil sie keine ist: zwei
  Laufzeiten sind nicht derselbe Zustand. Gemessen an der Gegenprobe: Node 24
  gegen eine auf 22 gepinnte CI — der Erzeuger endet mit Exit 1 und einer
  unveränderten Datei, der Prüfer fällt mit „im Wert 24, gepinnt 22", während
  die übrigen elf Zusicherungen grün bleiben.
- `state-digest.mjs` hasht den ganzen Zustand trotzdem in **0,14 ms je Zug**,
  weil er den Wert jedes Objekts unter seiner Identität wiederverwendet. Ein
  Zustand misst gemessen 784 KB; ohne diesen Speicher kostet ein Hash **39 ms**,
  über 2008 Züge also 65 Sekunden statt 0,3. Der Speicher setzt voraus, dass
  niemand an Ort und Stelle verändert — derselbe Vertrag, auf dem schon das
  Rendern ruht (`memo()` auf den Kacheln, `centerCache` über `world.tiles`) —,
  und er wird alle 250 Züge kalt nachgerechnet. Der Mischer ist bewusst keine
  reine FNV-Kette: die kippt bei einer Änderung an einem einzelnen Feld
  gemessen nur 9 von 32 Bits, die Murmur-Finalisierung 16,1.
- Erwartungen werden aus den Configs **abgeleitet**, nicht als Literale neben
  sie geschrieben: `check-start.mjs` liest die erwartete Hive-Fläche aus
  `world.hiveSize`. Wo ein Literal unvermeidbar ist — `check-mining-progress.mjs`
  prüft `totalMiningTicks() === 35` — muss es mitgezogen werden, wenn sich
  `miningDurationMs` oder `earthStateThresholds` ändern. Die vollständige Liste
  solcher Stellen und die Gegenprobe steht in
  [`PITFALLS.md`](PITFALLS.md).

Die Hard Caps prüft `scripts/lib/source-metrics.mjs` als Textanalyse, ohne
Parser — für `.js`, `.jsx`, `.mjs` und `.css`, Dokumentation ausgenommen. Die
Werte selbst stehen in `AGENTS.md` §3 und in `GOVERNANCE.md`; sie stehen hier
nicht, damit es nur eine Wahrheit gibt.

## Version und Commits

Die Regeln stehen in [`GOVERNANCE.md`](GOVERNANCE.md), der Ablauf in
[`WORKFLOW.md`](WORKFLOW.md). Zwei Dinge, die dort keinen Platz haben, weil sie
Entscheidungen sind: Die Monotonie ist technisch eingebaut — `revision` steigt
pro Versionsänderung um eins, und `src/version-authority.mjs` lässt nur einen
Rückschritt durch, nämlich die ausdrückliche Rücknahme einer Fehlbenennung mit
`amends: "<alte Version>"` im Lock. Und die Warum-Begründung der Commit-Policy
selbst ist die, dass ein Commit-Body das einzige Memory ist, das in drei Monaten
noch da ist: niemand erinnert sich, warum diese eine Zeile in `rooting.js`
geändert wurde.
