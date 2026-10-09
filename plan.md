# Plan: Besonders — optisch und spielerisch

Dieses Dokument ist der Vorschlag des Lead-Architekten an den Game Director:
nach einem vollständigen Scan des Baums, was das Spiel optisch und
spielerisch besonders macht — und in welcher Reihenfolge. Stil wie die
bestehenden Plan-Dokumente: gemessen statt geraten, jede Aussage an eine
Datei gebunden, offene Fragen offen.

| Frage | Datei |
| --- | --- |
| Was ist schon gebaut? | Docs/CHECKPOINTS.md |
| Was ist der Nordstern? | Docs/VISION-CORE-LOOP.md |
| Raid-Regeln und -Entscheidungen | Docs/RAID-PLAN.md |
| Wächter und Biomasse | Docs/WARDEN-PLAN.md |
| Was wird als Nächstes gebaut? | Docs/ROADMAP_OPEN.md |

---

## 1. Der Scan: was der Baum heute kann, was unsichtbar ist

**Der größte Teil des Codes hat kein Gesicht.** Die Raid-Domäne ist mit
17 Modulen (gemessen: 929 Codezeilen in src/domain/raid/) der
umfangreichste Bereich neben dem Brutlord-Labor. **Nachgezogen am
2026-10-09, weil die Aussage veraltet war:** in `src/state/` kommt das Wort
*Raid* bis heute nullmal vor (gemessen: kein Treffer im ganzen Ordner), in
`src/ui/` dagegen nicht mehr — `RaidLedger.jsx` nennt Kader, Grit, Ausdauer
und die Zahl der Gegner aus `cadreRule()` und `teamStamina()`, 
`raid-bookings.js` liest `GET /api/raid/bookings`, und `FloorChip.jsx` und
`ResourceRail.jsx` nennen den Raid in ihren Hinweisen. Was fehlt, ist damit
nicht das Wort, sondern die Bühne: das Zeichen für Kampf, Koma und Beute.
Die Phasenmaschine
(raid-phases.js, ENTER > COMBAT > WARDEN_DOWN > SACRIFICE > LOOT >
EXTRACTING > RESOLVED), der Wächter (raid-warden.js), das Terrain
(raid-terrain.js, Stein und Obsidian — die einzige zulässige zweite
Sorten-Art nach AGENTS.md §8) und der Replay-Prüfer laufen heute nur als
deterministische Simulation und Server-Einreichung. Ingame sieht ein
Spieler davon nichts. Das ist die größte Lücke zwischen Code und Erleben,
die der Scan findet.

**Zwei von vier Ressourcen sind unsichtbar und folgenlos.** Die
Ressourcenmatrix aus Docs/VISION-CORE-LOOP.md hat vier Tiers: Essenz
(sichtbar), Biomasse (geplant, WARDEN-PLAN.md), Aether und Blutstein
(beide nur Domäne). Die Ledger sitzen zwar im Spielzustand —
game-state.js trägt economy: createCycle() mit aether und bloodstone —
aber lange füllte sie kein Reducer. **Nachgezogen am 2026-10-09:** den Aether
füllt inzwischen die Reduzerkette selbst — `mining-reducer.js` ruft `digInto()`
mit der Etagentiefe, und das bucht in `mining.js` die Ausbeute der Tiefe —,
und den Blutstein zahlt der Server aus: `scripts/server/raid-http.mjs` schreibt
die Beute über `applyRaidLoot()` in den Spielstand. Was weiterhin fehlt, ist
nicht der Fluss, sondern das Lesen — kein Chip und keine Plakette zeigt einen
der beiden Vorräte. ROADMAP_OPEN.md sagt es wörtlich:
„die Ressource ist im Spiel nicht sichtbar (kein Chip neben Essenz und
Raum)" und „keine Oberfläche zeigt den Vorrat". Folge: Die
Etagen-Leiter (FloorChip.jsx) kann descendOpen({ depth, cycle }) zwar
lesen, aber der Spieler sieht weder Kosten (depthCostFor(depth) aus
bloodstone-loop.js) noch Vorrat — die teuerste Entscheidung des
Spiels ist heute ein unsichtbarer Kauf im Sprung selbst.

**Wahl fehlt, wo das Spiel eine Zusage macht.** work-tick.js verteilt
Arbeit deterministisch (staffWorkers(): erst Bauauftrag für Bauwillige,
dann Stationen); der Spieler kann nur Arbeitern auf Gebäuden zuweisen
oder abziehen (GameHud.jsx, onAssign/onRelease). Der Kern des Spiels —
ein Tier, das sich durchfrisst — wirkt wie eine Automatik. Das README
verspricht: „Wer mehr sehen will, muss graben." Graben ist heute eine
einzige Aktion (mining.js, ein Ziel, ein Fortschritt), keine Auswahl.

**Die Optik ist einheitlich, aber stumm.** Die Welt hat einen dunklen
Radial-Hintergrund (globals.css), ein Erd-Massiv aus Seed-Geometrie
(earth-geometry.js: soilMaskBlob, wallBand, crackPath), ein lebendiges
Hive (Puls, Wurzeln, Tentakel) und Dunglinge mit organischer
Skelett-Geometrie (genome-config.js, vier Arten, vier Haut-Texturen,
Phasen-Uhr 4 × 420 ms). Aber: jede Etage sieht identisch aus —
world.depth ist Daten, nicht Licht. Die Traits (stone-config.js:
SLIMY-Kriechspur, MOTIVATOR-Aura, GREEDY-Doppeltträger) funktionieren
in work-tick.js (unitEffects()), werden aber nicht gezeichnet — im
Raid gelten nach D32 aus RAID-PLAN.md ohnehin nur die
Berechtigungen, nicht die Traits; in der Kolonie sind sie also reine
Buchhaltung ohne Bühne. Der Tod des Vorrats — „ein Schlag, kein
fließender Vorrat" (README) — stirbt exakt bei Null, aber der letzte
Schlag sieht genauso aus wie der erste (EssencePopup.jsx zeigt immer +1).
Und: es gibt keinen Ton.

---

## 2. Die Leitidee: Lebendes Dunkel

Alles Lebendige leuchtet, alles Tote wird dunkel. Das Spiel hat diese
Regel schon im Bestand — essence-dead (#15121a) steht in globals.css
neben dem pulsierenden Kern. Der Plan macht daraus die visuelle
Identität: Die Dunkelheit des 13 × 13-Fensters ist kein Hintergrund,
sie ist ein Organ. Je tiefer, desto kühler das Licht, desto lauter das
Dunkel. Der Raid ist die Pointe: eine Welt in Blutrot und Obsidian,
wo alles, was der Spieler zu Hause gebaut hat, zum ersten Mal einen
Preis bekommt.

Spielerisch heißt das: Wahl statt Folge. Die Automatik bleibt Strom;
der Spieler bekommt vier echte Entscheidungen pro Spiel: welcher
Dungling tut was (Spur), ob der Hive mutiert (Aether), ob eine Etage
erkauft wird (Blutstein), welcher Kader in den Raid geht (Ausdauer).
Jede Entscheidung wird im Replayprotokoll (run-log.js) festgehalten,
damit sie nachspielbar bleibt.

---

## 3. Track A — Optik

Jeder Punkt: Was, Wo, Warum, Abnahme. Alles bleibt deterministisch
(nur Seeds, keine Math.random), composited FX (nur transform/opacity),
unter den Hard Caps (300 Codezeilen, 7 Imports, 3 Parameter,
5 Kommentarzeilen pro Datei — gemessen in scripts/lib/source-metrics.mjs).

### A1 — Etagen-Lichttemperatur
**Was:** Jede Etage trägt eine eigene Farbtemperatur: Etage 0 warm
(Ton des Kernels, core-500), mit der Tiefe kühler Richtung Aether
(Zyan-Blau), in der Raid-Welt Blutrot (Rock-Skala plus ein neuer
blood-Akzent, kein zweiter Untergrund — §8 bleibt intakt).
**Wo:** Neue Konstante FLOOR_ATMOSPHERE (Tabelle: Tiefe → CSS-Variablen-
Satz) in src/domain/world/ (faktisch, ohne DOM — nur Zahlen und
Farbwerte), gezeichnet von einer neuen kleinen Ebene
src/world/floor/FloorAtmosphere.jsx (eine SVG-Rechtecke mit Radial-
Verlauf, opacity-Animation) neben WorldVignette. WorldDefs.jsx
registriert den Verlauf.
**Warum:** world.depth ist heute reine Buchhaltung; danach ist Tiefe
sichtbar — der Spieler weiß, wo er ist, ohne Chip. Das hält R2:
gezeichnet wird weiter nur die eine Etage, nur ihre Lichtfarbe ändert
sich.
**Abnahme:** Neue Prüfgruppe check-atmosphere.mjs: die Tabelle ist
total über FLOOR.deepest + 1 Einträge (kein ??-Fallback, wie HINTS),
jede Tiefe liefert einen anderen Satz, der Satz kommt aus der
Konstante, nicht aus abgeschriebenen Werten. VERIFY_SHOTS=1 liefert
die Bilder; die Messung auf schwachem Gerät schließt den Roadmap-
Punkt „Der Tiefenschein ist noch nicht auf Gerät gemessen" mit.

### A2 — Der letzte Schlag stirbt sichtbar
**Was:** Die Essenz eines Ader-Vorrats stirbt exakt bei Null — das
letzte Anliefern spielt den Tod: Asche statt Funke (dl-essence-ash
existiert in globals.css und wird heute nur in DepositParticles.jsx
genutzt), dazu ein kurzes dl-shiver des Bodens (existiert,
EarthTile.jsx nutzt es bei kritischem Zustand).
**Wo:** work-tick.js kennt per applyEvent() das Anliefern; die Domäne
markiert den letzten Schlag (der Vorrat ist ein Schlag, also rechnet
sich der Marker aus der restlichen Ausbeute — keine zweite Wahrheit,
keine Zähler-Spalte). EssencePopup.jsx rendert die Asche-Variante,
DepositParticles.jsx die Aschenpartikel.
**Warum:** Das README verspricht: „Der Vorrat stirbt mit dem Schlag,
den du geführt hast." Wenn der Tod aussieht wie jeder andere +1, ist
die Zusage im Code, aber nicht im Erleben.
**Abnahme:** check-deposit-harvest.mjs (besteht) um eine Zusicherung
erweitern: der letzte Takt des Pools trägt den Marker, der Marker ist
deterministisch aus dem Seed ableitbar.

### A3 — Trait-Fußabdrücke
**Was:** Die drei Traits bekommen eine Bühne in der Kolonie: SLIMY
dunkelt die Kriechspur auf dem Boden (Spur = die Job-Route, jobTrip()
liefert from/to/progress — geometrisch schon da), MOTIVATOR ein
weiches Aura-Ellipsoid um den Dungling (opacity-Puls, Radius aus
STONE_TRAIT_DEFS), GREEDY ein sichtbarer Träger-Sack am Körper
(DunglingTool.jsx und organic-features.jsx kennen den Körpermittpunkt).
Der Raid liest weiterhin nur die Berechtigung (D32) — Traits bleiben
das, was sie sind: Wirtschaft und Takt der Heimat, keine Raideigenschaft.
**Wo:** Zwei neue kleine Module in src/world/dungling/ (TraitTrace.jsx,
TraitAura.jsx, je unter 100 Zeilen), angesteckt über WorkerLayer.jsx.
Keine Domänenänderung: unitEffects() bleibt die einzige Quelle.
**Warum:** Ein Stein, der sich nicht auf der Bühne zeigt, ist
Kosmetik im Labor und Buchhaltung in der Welt. Danach ist das
Experiment sichtbar: Man sieht dem Dungling an, was drinsteckt —
lange bevor die Zahlen zeigen.
**Abnahme:** check-traits.mjs (besteht) belegt die Effekte; neue
Zusicherung: die Spur-Geometrie ist total über der Job-Route und
seed-deterministisch (zweite Fahrt, gleiche Kurve).

### A4 — Der Mutations-Moment
**Was:** Die Mutation des Hives (dl-hive-mutate, 900 ms) ist heute
eine Schuppung des Organs. Sie wird zum Szenenbruch: Kurze
Entsättigung der Ebene (filter auf dem SVG-Root, eine Composited-Regel),
Kamera-Kick (dl-camera-kick steht in DungeonWorld.jsx), danach die
Phasen-Uhr des neuen Körpers (4 × 420 ms aus organic-phase-clock.js)
als sichtbare „Neu-Anlage" des Skeletts.
**Wo:** HiveFx.jsx orchestriert, HiveCore.jsx und BruteLordArt.jsx
liefern. Keine neue Domäne: mutant.js weiß schon, wann eine Mutation
geschah.
**Warum:** Der Brutlord ist „die Senke des ganzen Spiels" (README).
Wenn die teuerste Zucht des Spielers aussieht wie ein Blinken,
verschenkt das Labor seine Pointe.
**Abnahme:** Shot (VERIFY_SHOTS=1), dazu check-brutelord.mjs: die
Phasenfolge der Uhr ist invariant gegen den Takt der Uhr
(10 × 1000 ms ≡ 100 × 100 ms, wie check-game-clock.mjs).

### A5 — Ton
**Was:** Eine dezente Klangschicht: Herzschlag des Hives (je
Pressen-Takt), Graben (Stoß), Stein-Enthüllung (Klang), Mutation
(Tiefgang), Raid (Sting). Alle Events kommen aus den Reducern —
die Domäne bleibt stumm, der Ton ist Browser-Grenzwerk.
**Wo:** Neue Schicht-Dateien in src/ui/audio/ (ein Modul für die
Synthese, eines für die Event-Karte), angeschlossen über
use-game-engine.js (dort liegt die Klammer um dispatch für das
Replay — dieselbe Stelle registriert die Audio-Events, eine Regel
pro Ort). Kein Date.now in src/: Zeiten kommen von der AudioContext-
Uhr im Browser, die Domäne fragt sie nie.
**Warum:** „Besonders" ist auch das Ohr. Das Spiel ist dunkel und
still; der Herzschlag ist die einzige Uhr, die man hört, während
die Wurzeln arbeiten.
**Abnahme:** check-architecture.mjs bleibt grün (keine Date.now in
der Domäne); der Lauf bleibt deterministisch, weil der Ton nicht in
den Zustands-Hash geht (state-digest.mjs ändert sich nicht —
Zusicherung im Golden-Lauf).

### A6 — Die Leistungsgarantie
Alle FX oben bleiben composited (transform/opacity), Partikel bleiben
gedeckelt (ONBOARDING_CONFIG.particlesPerBurst = 4), die Ebene
EarthDepth bleibt eine einzige animierte Ebene über dem ganzen
Verbund (Roadmap-Punkt: „eine Animation je Kachel auf schwacher
Hardware jede Kachel einzeln neu malt"). Die Messung auf schwachem
Gerät (Roadmap) ist die Abnahme, nicht das Gefühl.

---

## 4. Track B — Spielfluss

### B1 — Das Gesicht des Raids
**Was:** Die größte unsichtbare Maschinerie bekommt eine Bühne.
Drei Teile:
1. Die Kader-Wahl (src/ui/raid/): Bis zu MAX_DUNGLINGS (6) werden aus
   den eigenen Dunglingen gewählt; die Kader-Leiste zeigt die
   Ausdauer (teamGritShare = teamGrit / 480, Ausdauer = 64 + 116 ×
   Anteil — gemessen in RAID-PLAN.md) gegen den Ziel-Snapshot. Das
   Ticket bleibt serverseitig ausgestellt (D18/D24: der
   Eintrittspunkt steht im Ticket, der Client wählt nicht, er führt
   aus).
2. Die Szene (src/world/raid/): Die raid-world.js-Instanz wird
   gezeichnet — 64 × 64, Stein und Obsidian (die §8-Ausnahme), die
   Phasenmaschine (raid-phases.js) als sichtbare Budget-Leiste
   (Ausdauer), der Chokepoint als Bühne (raid-traverse.js), der
   Wächter mit seiner Zone of Control (raid-warden.js).
3. Der Ausgang: Sieg führt raid-loot.js Blutstein über lootInto()
   (besteht) in den Heimat-Kreislauf; Niederlage ist Fail-closed
   (keine Trostprämie), geopferte Monster mit Rückholfristen
   (WARDEN-PLAN.md).
**Wo:** Neue Reducer-Datei src/state/reducers/raid-reducer.js
verbindet die bestehende Domäne (src/domain/raid/ bleibt unangetastet —
sie ist geprüft: check-raid-Gruppe, 14 Bestandsprüfungen); das Ticket
kommt über /api/raid (besteht, check-account-http.mjs).
**Warum:** Die Vision schließt den Kernloop über den Raid:
„Blutstein liefert Tiefe, Tiefe liefert Adern." Ohne Gesicht ist
die Endstufe des Spiels ein Befehl in der Konsole. Mit Gesicht ist
der Raid das, was er in der Vorlage ist: eine Entscheidung mit
Budget, kein Knopf.
**Abnahme:** Die check-raid-Gruppe (14 Bestandsprüfungen) bleibt
unberührt; neue Prüfgruppe check-raid-surface.mjs: Kader-Wahl ist
deterministisch (gleiche sechs Dunglinge, gleicher Kader),
Ablehnung von Ticket-Manipulation (ein manipulierter Client prüft
nichts — D25: der Lookup zählt, nicht die Signatur).

### B2 — Aether wird zu einer Entscheidung
**Was:** Der Aether-Vorrat (aether-loop.js) wird füllbar und
sichtbar. Die Quelle: aetherYieldFor({ depth, ticks }) — entsteht nur
auf einer Etage, die Blutstein erkauft hat (Schwelle DEEPEST_FLOOR + 1
unter der frei erreichbaren Tiefe — steht in aether-loop.js), also in
der Tiefe, die der Raid öffnet. Der Verbraucher wird Wahl: Im Labor
(LabPanel.jsx) erscheint die Mutation als aktiver Knopf — mutate()
kostet AETHER_CONFIG.mutationCost, das Risiko wird als Zeiger
visualisiert (riskOf() gegen riskCeiling).
**Wo:** Neue Reducer-Verbindung in src/state/: Der Aether-Vorrat wird
pro Takt an die Etage gehängt (eigene aether-reducer.js, je nach
Cap-Budget); ResourceChips.jsx bekommt den T2-Chip (Zyan).
**Warum:** ROADMAP_OPEN.md: „der Hive mutiert von selbst, sobald er
es sich leisten kann — der Verbraucher ist damit keine Wahl des
Spielers, sondern eine Folge". Das ist der Fehler: Der Brutlord soll
„eine Werkstatt, kein Gacha" sein (Vision). Ein Knopf, den man
drückt, ist eine Werkstatt.
**Abnahme:** check-aether.mjs (besteht: Quelle, Verbrauch, Deckel,
Determinismus) wird um die Reducer-Kante erweitert; der
Determinismus-Golden-Wert wird neu geschrieben (npm run
golden:determinism), weil das Verhalten sich ändert — die Erklärung
gehört in den Commit-Body.

### B3 — Blutstein wird zu einem Kauf
**Was:** Die Etage wird zum Kauf: FloorChip.jsx zeigt Kosten
(depthCostFor(depth)), Vorrat (bloodstone.stored) und Reichweite
(lowestReachable()). descendOpen({ depth, cycle }) bleibt die eine
Regel, die Freiheit und Kauf in einer Hand hält (resource-cycle.js).
Der T3-Chip (Rot) steht neben T1/T2.
**Warum:** „Der Preis einer Etage steigt. Tiefe ist kein freier
Raum." (Vision, Zusage 2). Wenn der Kauf unsichtbar ist, ist die
Zusage eine Behauptung.
**Abnahme:** check-bloodstone.mjs (besteht: Quelle, Abnehmer,
unlockDepth()) wird um die Oberflächenseite ergänzt;
check-verticality.mjs und check-verticality-wiring.mjs bleiben grün
(Leiter bei 47,47 bleibt der Eingang, check-ladder.mjs).

### B4 — Wahl statt Folge: die Arbeitsspuren
**Was:** Dunglinge werden ansprechbar: Klick auf einen Dungling
führt zu einem Menü (TileActionMenu.jsx ist das Vorbild); der
Spieler legt die nächste Spur fest: grabe diese Kachel, bringe
Essenz zu diesem Extractor, begleite diesen Auftrag. Die Automatik
(staffWorkers()) bleibt der Strom — sie übernimmt, sobald der
Spieler keine Spur mehr legt. Jede angelegte Spur wird in das
Replayprotokoll (run-log.js) geschrieben, damit der Lauf
nachspielbar bleibt (REPLAY-PLAN.md: „dieselbe Seed, dieselbe Welt,
derselbe Taktstrom").
**Wo:** Neue Domänen-Datei src/domain/labour/directed.js (Stur-Kette,
unter 150 Zeilen), Reducer-Kante in dungling-reducer.js.
**Warum:** Das ist der spielerische Kern des Plans: Ein Spiel, in dem
die Arbeit „in den Systemen liegt und nicht in der Menge" (README),
braucht trotzdem einen Hebel pro Spieler. Der Hebel ist die Spur.
**Abnahme:** Die check-cycle-game.mjs-Gruppe (besteht) wird um die
Spur-Kante erweitert: Eine angelegte Spur läuft deterministisch ab
(gleiche Spur, gleiche Taktfolge), und eine Spur, die gegen die
Regeln stößt (Ziel nicht grabbar), bleibt folgenlos (R3: „Was nicht
ausdrücklich erlaubt ist, wird nicht getan").

### B5 — Die Verteidigung (nach B1)
**Was:** Der eigene Dungeon wird angreifbar und verteidigbar:
Kanten-Wände (RAID-PLAN.md: Wände sitzen auf den Kanten, nicht auf
ganzen Feldern) und der Wächter (WARDEN-PLAN.md: Koma statt Tod,
Heilung mit Biomasse) werden im eigenen Dungeon platzierbar. Der
Feral-Hive-Bootstrapp (D22: serverseitig deterministisch erzeugte
CPU-Basen) liefert die ersten Gegner, bis genug echte Snapshots im
Pool stehen.
**Warum:** „Der Spieler wird irgendwann hinauszwingen" (Vision)
hält nur, wenn das Zuhause weh tut. Die Verteidigung ist die zweite
Hälfte des Raids: Wer baut, verteidigt; wer verteidigt, lernt, wie
ein Angreifer denkt.
**Abnahme:** check-raid-terrain.mjs (besteht) plus neue Prüfgruppe
für die Verteidigungs-Platzierung; check-snapshot.mjs bleibt grün
(der Snapshot ist der eingefrorene Zustand, den der Raid angreift —
B8: der Server fasst den Spielstand nicht an).

### B6 — Der Zyklus wird sichtbar
**Was:** Ein Zyklus-Anzeiger (klein, unauffällig, HUD-Ecke) zeigt, wo
der Spieler im Feral Cycle steht: Adern führt zu Essenz, Essenz zu
Kader, Kader zu Raid, Raid zu Blutstein, Blutstein zu Etage, Etage
zu Aether, Aether zu Mutation, Mutation zu Kader.
**Warum:** Der Spiel heißt The Feral Cycle. Der Zyklus ist heute in
der Vorlage, nicht auf der Bühne. Der Anzeiger ist keine Erklärung,
er ist ein Hunger-Meter: Er zeigt, was als Nächstes zieht.

---

## 5. Nichts tun (Negativraum)

- Kein zweiter Untergrund. §8: heller Stein. Der Raid-Bereich ist
  die einzige zulässige Ausnahme (Stein und Obsidian) — und das
  Terrain bleibt Terrain, kein Erdreich (isEarth() bleibt Erdreich).
- Kein Kachel-Look. Auswahl und Effekte folgen der Fläche, nie dem
  Rechteck (soilMaskBlob ist das Vorbild).
- Kein Math.random und kein Date.now in src/ (check-architecture.mjs
  prüft das; der Ton kommt von der Browser-Grenze, nicht von der
  Domäne).
- Kein Passiv-Fortschritt, keine Hintergrund-Ressourcenzählung. Die
  Welt friert ein, wenn der Spieler offline geht (Vision, Zusage 1;
  B8: der Server speichert, er fasst nicht an).
- Kein Gacha. Das Labor ist eine Werkstatt (Vision). Der Pity-Timer
  (30) bleibt unsichtbar (stone-config.js: pityLimit) — er ist ein
  Versprechen, kein Zähler.
- Die Essenz-Obergrenze von 25 bleibt. hiveBudget: 25
  (essence-economy.js) ist der Grund, warum der Hive ein Puffer und
  kein Endgame ist (README). Der Druck kommt vom Ausgeben, nicht vom
  Aufstocken.

---

## 6. Reihenfolge und Abhängigkeiten

| Schritt | Was | Warum jetzt | Commits |
| --- | --- | --- | --- |
| 1 | B2 + B3 (Aether- und Blutstein-Kauf plus T2/T3-Chips) | Günstigste Zusage: Ledger stehen, Reducer-Kanten fehlen. Macht das Endgame sichtbar vor dem Raid-Gesicht. | 2–3 |
| 2 | A1 + A2 + A3 (Licht, Tod, Fußabdrücke) | Eine Ebene (FloorAtmosphere.jsx), ein Popup-Zweig, zwei kleine Module. Shot-Update. | 2–3 |
| 3 | B1 (Kader + Szene + Ausgang) | Der große. Die Domäne ist gebaut und geprüft; nur Oberfläche und Reducer-Kante fehlen. Wird in Teil-Commits gebaut (Kader, Szene, Budget-Leiste, Wächter-Bühne). | 4–6 |
| 4 | B4 (Arbeitsspuren) | Klein, hoher Wirkungsgrad: Der Spieler bekommt einen Hebel. | 2 |
| 5 | A4 + A5 (Mutations-Moment + Ton) | Der Moment braucht B2 (Mutation wird Wahl); der Ton braucht die Events, die B1/B4 liefern. | 2 |
| 6 | B5 (Verteidigung) | Erst nach B1: Man verteidigt nur, was angreifbar ist. | 3–4 |
| 7 | B6 (Zyklus-Anzeiger) | Schließt den Kreis, wenn alle Stufen sichtbar sind. | 1 |

**Gold-Werte:** Schritt 1 und 4 ändern das Verhalten, also npm run
golden:determinism (neuer Wert, Erklärung im Commit-Body). Schritt 3
und 6 berühren das Raid-Verhalten nicht (Domäne bleibt), also bleibt
npm run golden:raid stabil; nur der Golden-Lauf des Spielstands
ändert sich.

**Jeder Schritt** ist ein ROADMAP_OPEN-Eintrag (Metadaten-Block),
dann npm run gate mit expliziter Commit-Range, npm run check,
npm run build, Commit mit VANNON-Label (scripts/commit-draft.mjs),
Push auf main, CI-Volllauf.

---

## 7. Offene Fragen an den Game Director

1. **Ton: ja oder nein?** Und wenn ja — ist Stille im Dev-Build
   erlaubt (der Ton startet erst nach dem ersten Input, Autoplay-
   Politik des Browsers)? Ohne Ton wird A5 gestrichen, der Rest
   bleibt.
2. **Der Kader: halbautomatisch oder Schritt-für-Schritt?** Die
   Domäne kann beides (raid-sim.js erzeugt das Skript,
   raid-replay.js prüft es). Der Plan setzt auf halbautomatisch
   für bekanntes Terrain, manuell für die Entscheidungspunkte
   (Chokepoint, Wächter, Beute). Falls der Director den Raid als
   „Budget-Entscheidung, kein Taktik-Minigame" will, wird die
   manuelle Schiene ganz gestrichen.
3. **Die Arbeitsspuren (B4): pro Dungling oder pro Job-Slot?**
   Der Plan legt pro Dungling (eine Spur pro Tier, Kette). Pro
   Job-Slot wäre mächtiger, aber zwei Wahrheiten über dieselbe
   Zuteilung.
4. **Verteidigung vor oder nach dem Raid-Gesicht (B5 vs. B1)?**
   Der Plan: B1 zuerst, B5 danach. Gegenfrage: Wenn B5 zuerst
   gebaut wird, ist der Wächter im eigenen Dungeon sichtbar, bevor
   der Spieler je angegriffen wurde — das ist ein Feature
   (Anspannung) oder ein Fehler (Verwirrung)?
5. **Aether: der Knopf oder der Prozess?** Der Plan macht Mutation
   zu einem aktiven Knopf (B2). Die Roadmap lässt den Hive „von
   selbst" mutieren. Wenn der Director den Prozess will (Mutation
   als Folge der Tiefe, nicht als Entscheidung), wird Aether
   Fortschritt statt Menü — und der Labor-Knopf entfällt.

---

*Dieses Dokument ist ein Entwurf, kein Regelwerk. Regeln stehen in
AGENTS.md, die Vorlagen in VISION-CORE-LOOP.md. Was hier als Aufgabe
beschrieben wird, wird vor dem Commit in ROADMAP_OPEN.md eingetragen.*
