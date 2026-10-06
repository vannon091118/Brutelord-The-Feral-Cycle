# Offene Roadmap

Pflichtdoku, aber nur fürs Offene: Diese Datei ist die interaktive Checkliste
für Unabgeschlossenes. Wer hier was einträgt, verpflichtet sich, es auch zu
liefern. Fertiges wird hier nie protokolliert — der Häkchen-Wechsel ist die
letzte Handlung, danach trägt der Doku-Sync den Eintrag in die Historie:

| Frage | Datei |
| --- | --- |
| Wo steht, was geliefert wurde? | [`CHECKPOINTS.md`](CHECKPOINTS.md) |
| Was muss ich vor jedem Commit wissen? | [`AGENTS.md`](../AGENTS.md) |
| Wie läuft der Doku-Sync? | [`WORKFLOW.md`](WORKFLOW.md) |
| Welche Regeln und Pflichten gelten? | [`GOVERNANCE.md`](GOVERNANCE.md) |

**Wie hier gepflegt wird.** Neuer Punkt: unten anreihen, mit Metadaten-Block.
Fertig: Häkchen setzen — nicht löschen, nicht nach unten sortieren. Der Rest
(Bewegung, Stempel, Historie) ist Maschine und passiert im Commit vor dem
Commit: `npm run docs:sync` prüft, der Bot stampft und bewegt. Verschieben
mit Grund, nie still — „Muss später" ist ein Schuldenposten, und Schulden-
posten gehören sichtbar hier hin.

## 0.0.26 — Spiegel-Doku

Ab dieser Version trägt `src/` genau **eine** Kommentarzeile, und die ist ein
`@doc`-Pointer auf `docs/daten/<domain>/<name>.md`. Wer ein Modul anfasst,
wandert seine Spiegel-Datei im selben Änderungsbereich mit; was das Gate
`npm run gate -- --spiegel` über 80 Doku-Zeilen sagt, ist der Auftrag, das
Modul zu spalten.

## 0.0.24 — Bestand und Tor

### Nachtrag: der Replay-Deckel (gemessen, nicht vermutet)

Ein Angreifer durfte ein Aktions-Log beliebiger Länge einreichen. Gemessen mit
`npm run bench:replay` kostet ein Log mit 2998 Schritten rund 29 ms, weil
`record()` bei jedem Schritt das ganze Log kopiert — dreimal das CPU-Budget von
Cloudflare aus **einem** HTTP-Request. `RAID_CONFIG.maxActions` steht jetzt bei
512 und wird in `replayMatches()` geprüft, also in der Domäne und nicht im
Server: das längste erlaubte Log kostet dort gemessen rund 3,6 ms. `raid-cap` in
der Abnahme belegt beides, auch die Gegenprobe.

Der Schwarm arbeitet, das Bestand-Problem ist adressiert. Diese Einträge
tragen den offenen Rest des Raids und die zwei Lücken am Konto.

- [ ] **Der Rest des Raids: Angriff, Opfer, Extraktion.** Das Gerüst steht
      (`RAID_CONFIG`, Ticket, Replay, halbautomatischer Einmarsch), aber die
      Mechanik dahinter steht jetzt und läuft durch: `raid-warden.js` stellt die
      Verteidigung, `raid-verbs.js` rechnet den Schaden als Summe des `atk` der
      Teilnehmer (D28) und trifft erst die Wächter, dann den Hive,
      `raid-traverse.js` betritt den Hive über die Phasenmaschine, Opfer und
      Beute stehen als Taten bereit, und `raid-loot.js` zahlt erst nach der
      Rückkehr aus. `check-raid-siege.mjs` fährt den ganzen Weg in einer
      Prüfgruppe — `ENTER > COMBAT > WARDEN_DOWN > SACRIFICE > LOOT >
      EXTRACTING > RESOLVED`, Wächter-Koma mit Frist und erhaltenem Seed,
      Essenz in einen echten Heimatstand und der Blutstein aus
      `bloodstone-loop.js`. Das Ticket **auszustellen** kann weiterhin nur der Server — dieser Baum führt die
      Instanz aus, er vergibt sie nicht. Das ist die Grenze zwischen Client
      und Matchmaking, nicht ein Fehler im Ticket. **Die Phasen selbst stehen
      jetzt als Maschine:** `raid-phases.js` führt die sieben Phasen mit
      Kanten, Kosten, Ereignissen und erlaubten Aktionen, `applyAction()` liest
      diese Tabelle statt einer if-Kette, und `check-raid-phases.mjs` belegt die
      Kette samt Fehlpfaden und Determinismus. **Offen bleiben drei Dinge:** die
      Kantenwände des Raid-Felds sind Kulisse, der Rundenwechsel (`nextRound`)
      wird bis heute vom Aufrufer ausgelöst, weil der Raid keine Uhr hat, und
      das Ticket vergibt der Server. Die Regeln und offenen
      Fragen stehen in [`RAID-PLAN.md`](RAID-PLAN.md). Die zweite Hälfte dieses
      Rests — Biomasse und der Wächter, der sie verbraucht — ist als Entwurf
      vermessen und in [`WARDEN-PLAN.md`](WARDEN-PLAN.md) entschieden: die
      Quelle liegt danach in der eigenen Erde und braucht diesen Raid nicht,
      das Heilen schon.
  Status: geplant
  Scope: Domäne
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Der Spielstand gehört in die Kontotabelle.** Die Konto-API hält Angriffe
      aus, aber der Spielstand lebt nur im `localStorage` des Browsers. Snapshot,
      Ticket und MMR schreiben langfristig in dieselbe Tabelle wie das Konto —
      die Spalte fehlt, und bis sie steht, wechselt der Hive den Rechner und ist
      weg. Gehört in denselben Zug wie die Backend-Entscheidung darüber.
      **Der Speicher ist gebaut:** `getState`/`putState` stehen im Vertrag, die
      Spalte `state` in der Kontotabelle, und `check-storage.mjs` belegt den
      Kreislauf gegen die echte Datei. **Die Schreiblast ist gelöst:**
      `snapshot-rule.js` schreibt nur bei geänderter Nutzlast, höchstens alle
      30 s, gedeckelt bei 262.144 Bytes und mit monotoner Revision — der
      gepackte Envelope misst 829 Bytes gegen 798.115 Bytes ungepackt —,
      `state-write.mjs` wendet dieselbe Regel in beiden Speichern an, und
      `check-snapshot.mjs` fährt Sichern, Wiederherstellen und Fassungswechsel.
      **Der Transport über HTTP steht:** `POST`/`GET /api/state` tragen den
      Envelope mit eigener Rumpfschranke, der Speicher-Takt schickt ihn mit dem
      Traeger-Token, und die Revision wird in der Bedingung der `UPDATE` geprueft
      statt vorher gelesen. **Offen bleiben Ticket und MMR** — die Zeilen, die vor
      dem Ergebnis in derselben Tabelle schreiben. Die Fragen stehen in
      [`BACKEND-PLAN.md`](BACKEND-PLAN.md).
  Status: geplant
  Scope: Konto
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Der Tiefenschein ist noch nicht auf Gerät gemessen.** `EarthDepth.jsx`
      liegt als eine einzige animierte Ebene über allen sichtbaren Erdflächen —
      ein Pfad je Kachel, aber nur eine Bewegung für den ganzen Verbund, weil
      eine Animation je Kachel auf schwacher Hardware jede Kachel einzeln neu
      malt. Die Grundtiefe je Kachel kommt aus dem Seed. Was fehlt, ist die
      Messung: ob die Ebene auf einem schwachen Gerät hält, und ob das Dunkel
      in der Wiege gut aussieht, hat noch niemand auf einem Bildschirm gesehen.
  Status: geplant
  Scope: Welt
  Kategorie: Abnahme
  Version: ausstehend
  Datum: ausstehend

- [ ] **Blutstein als Tier-3-Ressource.** Der Preis für eine neue Etage und die
      einzige Ressource, die **nicht** aus dem eigenen Keller kommt: die
      Ressourcenmatrix in [`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md) legt sie
      ausschließlich aus feindlichen Hives, und daraus zieht der Entwurf seine
      Begründung, warum das Spiel den Spieler irgendwann hinauszwingt. **Der
      Kreislauf steht als Domäne:** `bloodstone-loop.js` erzeugt nur über
      `raidYieldFor()` in der Beute-Phase gegen einen feindlichen Hive bei
      gefallenem Wächter, die eigene Basis liefert nach 0, 1 und 1000 Takten
      nachweislich 0, und der Abnehmer ist `unlockDepth()` mit
      `depthCostFor(depth)` bis `maxDepth`; `check-bloodstone.mjs` führt beide
      Seiten. **Die Spielbarkeit ist gebaut:** der Raid läuft durch (die Phase
      hinter `EXTRACTING` steht seit dem Belagerungs-Commit), `applyRaidLoot()`
      zahlt den Blutstein der Beute in den Kreislauf des Heimatstandes aus
      statt ihn zu verwerfen, und der Etagensprung ist der Abnehmer: unterhalb
      der freien Leiter kauft `buyFloor()` die nächste Etage, und ohne Blutstein
      bleibt die Leiter genau da, wo sie vor diesem Kreislauf war. **Offen
      bleiben zwei Dinge:** die Ressource ist im Spiel nicht **sichtbar** (kein
      Chip neben Essenz und Raum), und der Kauf ist keine Wahl des Spielers —
      er geschieht im Sprung selbst. **Korrektur an der Vorlage:** die Vorlage
      zitiert `D13` und `D26`; `D13` ist der Preis des Lootlings und nicht die
      Herkunft der Beute, und `D26` regelt, dass `DIG` ein Verb bleibt. Wer hier
      baut, entscheidet zuerst, **wo** die Ressource entsteht — sie ist die
      einzige, die der Client nicht erzeugen darf.
  Status: geplant
  Scope: Domäne
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Aether als Tier-2-Ressource.** Die Währung der Tiefe: Mutationen,
      fortgeschrittene Anlagen und tiefere Etagen speisen sich laut
      [`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md) aus dem Inneren der eigenen
      Basis. Ihr fehlt damit nicht nur der Verbraucher, sondern der **Ort**: die
      Etagen sind im Raid-Entwurf ausdrücklich vollständig unbestimmt, und die
      Leiter bei 47,47 ist Kulisse ohne Verhalten. **Der Loop steht als
      Domäne:** `aether-loop.js` liefert unter `depthThreshold` exakt 0 und in
      der Tiefe je Takt, der Abnehmer ist die Mutation (`mutate()`,
      `digAbilityOf()`, Deckel am `riskCeiling`), und `check-aether.mjs` belegt
      Quelle, Verbrauch, Deckel und Determinismus. **Der Ort steht:** die
      Vertikalität existiert (Etagensprung, `world.depth`), und der Aether hängt
      jetzt an ihr — `digInto()` in `mining.js` bucht die Ausbeute eines
      abgeschlossenen Grabs, und die Schwelle liegt mit `DEEPEST_FLOOR + 1`
      **unter** der frei erreichbaren Tiefe. Damit entsteht Aether nur auf einer
      Etage, die Blutstein gekauft hat; die Verbindung der beiden Ressourcen ist
      keine Absicht mehr, sondern eine Eigenschaft des Codes. **Die Etage ist
      auch erreichbar geworden:** an der tiefsten freien Etage sperrte die
      Oberflaeche den Abstieg, weil sie `canDescend()` allein las — jetzt lesen
      Plakette und Leiter `descendOpen({ depth, cycle })`, das die freie Leiter
      und den bezahlten Schritt in einer Regel haelt. **Offen bleiben
      zwei Dinge:** der Hive mutiert von selbst, sobald er es sich leisten kann
      — der Verbraucher ist damit keine Wahl des Spielers, sondern eine Folge —,
      und keine Oberfläche zeigt den Vorrat. **Korrektur an der Vorlage:**
      die Vorlage zitiert `D2` und `D33`; `D2` beschreibt das Erd-Tor des Raids,
      und `D33` war doppelt vergeben — der Raid-Entwurf hat die spätere Doppelung
      aufgelöst, die zitierte Nummer zeigt jetzt auf die Ausdauer-Rechnung und
      nicht auf die Tiefe. Der belastbare Anker ist allein die Vertikalität: ein
      Modul `aether.js` vor Etage 2 hätte keinen Ort, an dem es entsteht.
  Status: geplant
  Scope: Domäne
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

---

## 0.0.45 — Erzwungene Schicht, gehaertete Uhr, Replay

Drei Auftraege, die aus demselben Grund kamen: was der Baum schon konnte, sollte
er auch **beweisen** — mit einer Regel, die abbricht, mit Tests an den Raendern
und mit einem Lauf, den ein zweiter nachspielen kann.

- [ ] **Der Share-Code braucht einen Ort in der Oberflaeche.** Er ist heute
      ueber das Dev-Tor greifbar (`window.__dl.share()`), nicht ueber einen
      Knopf. Ein Spieler, der einen Fehler meldet, hat ihn nicht in der Hand.
  Status: geplant
  Scope: Client
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Das Protokoll ist ein Praefix, kein Ring.** Nach `RUN_LOG.maxInputs`
      (4096) hoert die Aufzeichnung auf; ein Fehler nach zehn Minuten Spiel ist
      nicht darin. Die naechste Stufe waere ein Ring ueber einem
      Zustands-Snapshot — und dafuer braeuchte `src/` einen eigenen Zustands-Hash,
      den es heute bewusst nicht gibt (zwei Implementierungen derselben Rechnung
      waeren zwei Wahrheiten).
  Status: geplant
  Scope: Domaene
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

## 0.0.46 — Konto, Sitzung und Rundenwechsel

- [ ] **Der Träger-Token wandert ins HttpOnly-Cookie.** Er liegt heute in
      `localStorage` und ist damit für jedes Skript lesbar, das auf der Seite
      läuft. Der beschlossene Umbau samt CSRF-Bindung, Reihenfolge und Kosten
      steht in [`BACKEND-PLAN.md`](BACKEND-PLAN.md), *Der beschlossene Umbau: der
      Träger-Token ins Cookie* (B14). Offen sind die Migration `0004` mit
      `sessions.csrf`, ein `cookie-http.mjs`, der Token raus aus dem Rumpf und
      `credentials: 'same-origin'` im Client.
  Status: geplant
  Scope: Server
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Der Rundenwechsel kommt aus dem Log.** `nextRound()` ruft bis heute der
      Aufrufer — heute nur die Belagerungs-Fixture —, und `stateHashInput()` trägt
      `round` nicht, sodass zwei Instanzen auf verschiedenen Runden landen können,
      ohne dass `replayMatches()` es merkt. Der beschlossene Umbau steht in
      [`RAID-PLAN.md`](RAID-PLAN.md), *Der beschlossene Umbau: der Rundenwechsel
      kommt aus dem Log* (D47): die Runde wird zur Folge der verbrauchten AP im
      `applyAction`, und `round` kommt in den Hash. Der Preis ist der Golden-Wert
      — `npm run golden:raid` wird einmal neu geschrieben.
  Status: geplant
  Scope: Domäne
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [ ] **Die vierte Tür hat noch nichts zu kaufen.** Ausbau, Aufwertung und
      Mutation haben je einen Preis im Opening; die Sicherheit hat keinen. Die
      Raid-Domäne kennt Wächter, Ausdauer und Grabkosten, aber kein Gebäude und
      keinen Reducer dafür, und Biomasse ist in
      [`WARDEN-PLAN.md`](WARDEN-PLAN.md) weiterhin ein Entwurf. Bis dahin trägt
      allein die Reserve die vierte Tür: was liegen bleibt, kann graben. Ein
      kaufbares Verteidigungsstück — Kantenwand oder Wächter nach
      [`RAID-PLAN.md`](RAID-PLAN.md), *Bauen und Verteidigen* — hätte hier
      seinen Platz, braucht aber zuerst die Entscheidung aus dem Wächter-Plan.
  Status: geplant
  Scope: Domäne
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

- [x] **Der Seed-Audit findet eine zweite stille Ordnung.** Die Auslegung in
      `seed-input.js` war schon mit 17 Bestandswerten und der Gültigkeitsmatrix
      abgesichert; nachgezogen sind die zwei fehlenden Fälle `1234ABCD` und
      `1234ZZZZ`, wobei `1234ZZZZ` eigens gegen die Null geprüft wird, damit
      „ungültig" und „Seed 0" nicht mehr zusammenfallen können. Der Golden-Wert
      der Deterministizität spielt zusätzlich **einen Seed zweimal im selben
      Prozess** und verlangt dieselbe Bahn: der Datei-Vergleich beweist
      Reproduzierbarkeit über Prozessgrenzen, nicht innerhalb eines Prozesses.
      Der eigentliche Fund liegt im Raid. `frontierOf()` liest seine Kandidaten
      aus `Object.keys(state.dug)`, und `exploreGoal()` rechnet diesen Index in
      ein Erkundungsziel um; gemessen gräbt ein sortiertes `Object.keys` ein
      anderes Feld (`59,31` gegen `61,30`) bei gleicher Anzahl. Rot wurde dabei
      **kein** Golden — `raidSeries()` spielt ein festes Skript über
      `applyAction()` und ruft `tickMove()` und damit `frontierOf()` nie auf.
      `check-raid-move.mjs` friert die Grabefolge jetzt als `EXPLORE_ORDER` ein
      und fällt beim Sortieren an genau einer Prüfung um. Die Reihenfolge selbst
      bleibt **unangetastet**: sie zu ändern ist ein Replay-Formatwechsel hinter
      einem Versionssprung, kein Aufräumen. Beide Lehren stehen in
      [`PITFALLS.md`](PITFALLS.md), *Determinismus*.
  Status: geplant
  Scope: Domäne
  Kategorie: Test
  Version: ausstehend
  Datum: ausstehend

- [x] **Die Landkarte der Seeds steht, und der Audit hat eine zweite Null
      gefunden.** `Docs/ARCHITEKTUR.md`, *Wer den Seed liest*, zählt die
      **Aufrufer** statt der Exporte: `deriveSeed()` hat bis heute keinen
      einzigen, und die 13 Salz-Sets in `SALT_HOME` rechnen weiter jedes mit
      seinem eigenen Mixer. Die Trennung ist damit ein Ort für neue Salze und
      noch keine Grenze zwischen den alten. Drei Befunde stehen in der Tabelle:
      `raid-move.js` baut den Erkundungsstrom aus einer Zeichenkette, und
      `mixRaid` liest sie als `NaN` → `0` — der Strom ist damit für jedes Ticket,
      jede Runde und jede Position derselbe (gemessen `2887743147` für zwei
      beliebige Texte); `nextSeed()` im Labor hängt am Kaufzähler und nicht am
      Spielerseed, zwei Konten kaufen also dieselbe Steinfogle; und
      `tileSeed(x, y)` liest den Seed gar nicht und liegt deshalb zu Recht in
      PRESENTATION. `deriveSeed()` selbst ist sauber: vier Domänen, vier
      verschiedene Zahlen je Wurzel, `null` für eine ungültige Wurzel und `null`
      für eine unbekannte Domäne, während eine **fehlende** Wurzel die anonyme
      Welt bleibt wie an der Tür. Die neue Prüfgruppe `seed-domain`
      (`scripts/verify/check-seed-domain.mjs`) prüft `SALT_HOME` gegen die
      Dateiablage, die Trennung der vier Domänen, das Fail-closed der Wurzel und
      hält den Mixer-Fund als benannte Zusage fest, damit die Reparatur eine
      Entscheidung bleibt. Repariert wurde keiner der drei Befunde: jeder
      verschiebt Spielergebnisse und ist ein Replay-Formatwechsel hinter einem
      Versionssprung. Die Lehre steht in `Docs/PITFALLS.md`, *Determinismus*.
  Status: geplant
  Scope: Domäne
  Kategorie: Test
  Version: ausstehend
  Datum: ausstehend

- [x] **Der Seed-Audit hat einen echten Kollaps gefunden und behoben.** Die neue Prüfgruppe
      `seed-domain` (`scripts/verify/check-seed-domain.mjs`) prüft `SALT_HOME` gegen die
      Dateiablage, die Trennung der vier Domänen, 32 Wurzeln auf Kollisionsfreiheit und die
      Rückwärtskompatibilität der Golden-Seeds: `worldSeed32`, `floorSeed` auf Etage 0 bis 3,
      `blockHash` und `depositSalt` stehen als Literale fest. **Gemessen und behoben** ist der
      Fund aus `raid-move.js`: `mixRaid` bekam eine Zeichenkette und liest sie als `0`, der
      Erkundungsstrom war also für jedes Ticket, jede Runde und jede Position derselbe. Der
      Text geht jetzt durch `textSeed()`, `RAID_FORMAT_VERSION` steht auf **5**, und der
      Raid-Golden ist mit `npm run golden:raid` neu geschrieben — er hat sich dabei nur durch
      die Fassungsmarke geändert (die Grabpunkte blieben 15, 15 und 12), weil `raidSeries()`
      `tickMove()` nie aufruft. Die Erkundung hatte keinen eingefrorenen Wert; die Zusage
      steht deshalb seitdem als Prüfung da (32 Tickets sind 32 Ströme). **Nicht behoben,
      aber dokumentiert**: `entrySeed()` liefert ein Vorzeichen statt uint32 (13 von 32
      Kennungen negativ), `depositSalt()` verlässt den uint32-Raum, `nextSeed()` im Labor
      hängt am Kaufzähler statt am Spielerseed, und `ticket.snapshotSeed ?? 0` würde ohne
      Snapshot Terrain und Wächter auf die Nullwelt legen (heute unerreichbar, weil der
      Server ihn immer setzt). Die Landkarte steht in `Docs/ARCHITEKTUR.md`, *Wer den Seed
      liest*.
  Status: geplant
  Scope: Domäne
  Kategorie: Test
  Version: ausstehend
  Datum: ausstehend

---

## Was hier NICHT steht

Absichten ohne Code sind Luft. Diese Datei beschreibt, was als Nächstes
gebaut wird — sie ist kein Wunschzettel und kein Feature-Forum. Wer eine Idee
einbringen will, bringt einen Task mit, der sie umsetzt, und trägt sie danach
hier ein.

Ausnahmen gibt es genau eine: wenn eine geplante Version sich als falsch
erwies. Dann wird hier dokumentiert, *warum* — nicht, damit die Lücke
verschwindet, sondern damit sie jemand anderes nicht macht. Die Sections
benennen **geplante** Versionen, nicht den aktuellen Stand; der Stand steht in
`version.lock.json`, und `npm run verify` sagt dir, ob er stimmt.
