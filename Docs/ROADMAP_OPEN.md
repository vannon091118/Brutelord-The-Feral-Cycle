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

- [x] **Die Leiter bei 47,47 ist der Eingang.** Sie stand als `LADDER_TILE`
      in der Config, wurde als Deko gerendert, und beim Erreichen geschah null
      Zeilen Code. **Jetzt führt sie hinunter:** sie steht in jeder Etage an
      denselben Koordinaten (`world.entrance`), liegt dort unter Gestein und
      wird gegraben — erst wenn ihre Kachel `isUsable()` ist, ist sie klickbar
      und schickt denselben `ACTION.FLOOR_DESCEND` wie die Plakette, also
      entscheidet weiterhin der Reducer der Etage über Preis und Grenze. Wer
      sie freilegt, steigt ab. **Der Anreiz ist gemessen:** jede Etage trägt
      über `DEPOSIT_DEPTH.gainPerFloor` ein Viertel mehr Essenz je Kammer, in
      ihrem eigenen Budgetband, und die noch freie zweite Etage liegt gemessen
      bei 12.900 gegen 9.660 Essenz der ersten. Etage 0 hat den Zuwachs exakt
      null und ist Zeichen für Zeichen dieselbe Welt wie zuvor. Belegt von
      `check-ladder.mjs` und `check-verticality-wiring.mjs`. **Offen bleibt:**
      die Leiter wird per Klick betreten, nicht durch einen laufenden Dungling,
      und der Boden um sie herum entsteht als Tunnel von Hand — es gibt keinen
      automatischen Gang zum Eingang, und den soll es nicht geben.
  Status: geplant
  Scope: Welt
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

- [x] **Die Schichtung von `src/` ist ein Abbruchgrund im Gate.** Die Tabelle
      (`scripts/lib/import-rules.mjs`) gab es, aber `npm run gate` kannte sie
      nicht — die Richtung war eine Pruefung im Verify-Lauf und laut `AGENTS.md`
      ausdruecklich „Konvention, nicht Gate". **Jetzt liest das Gate dieselbe
      Funktion** (`Importrichtungen`, einzeln `npm run gate -- --imports`), und
      zwei Tueren sind zu, die ein Muster uebersieht: ein dynamisches `import()`
      zaehlt wie ein statischer Import, und ein Verzeichnis unter `src/`, das
      keine Schicht ist, ist selbst ein Verstoss — eine neue Schicht braucht eine
      Zeile in der Tabelle, nicht nur einen Ordner. Die Gruppe `imports` faehrt
      damit 16 Zusicherungen, acht davon erfundene Kanten. **Gegenprobe gemessen:**
      eine echte Datei `src/domain/zz-verstoss.js` mit `import … '../world/grid.js'`
      bricht das Gate mit `FAIL Importrichtung … (domain darf nicht nach world)`
      ab, nach dem Rueckbau ist es wieder gruen; dasselbe mit einem dynamischen
      `import()`. Die Dokumentation nennt die Regel jetzt ueberall als erzwungen
      (`AGENTS.md`, `GOVERNANCE.md`, `ARCHITEKTUR.md`, `WORKFLOW.md`,      `COMMIT_POLICY.md`).
  Status: geplant
  Scope: Gate
  Kategorie: Abnahme
  Version: ausstehend
  Datum: ausstehend

- [x] **Die Sim-Uhr ist gegen ihre Raender geprueft.** `check-game-clock-edges.mjs`
      faehrt 32 Zusicherungen ohne Browser und ohne Warten: gedrosselter
      Hintergrundtab (100 Schritte à 100 ms gegen 10 à 1000 ms — derselbe Strom),
      Tab-Wechsel, schlafender Rechner, drei Stunden Abwesenheit, CPU-Spikes
      (zwoelf Schritte zwischen 1 und 1000 ms), drei verpasste Takte, eine
      schweigende Uhr und einen Ruecksprung der Systemzeit. **Dabei fiel ein
      echter Fehler auf:** `run.last = at` gegen eine Quelle, die zurueckspringt,
      holte Spielzeit nach, die nie vergangen ist (gemessen 45 statt 30 Takte) —
      der Zeiger ist jetzt `Math.max(run.last, at)`. Zwei Gegenproben: ohne den
      Deckel fallen 5 von 32 Pruefungen, ohne den vorwaerts laufenden Zeiger 3      von 32. Der Fund steht in `PITFALLS.md`.
  Status: geplant
  Scope: Uhr
  Kategorie: Test
  Version: ausstehend
  Datum: ausstehend

- [x] **Der Lauf ist reproduzierbar.** `src/domain/replay/run-log.js` haelt Seed
      und Eingaben (`BFC1-…`), `run-report.js` nennt die erste Abweichung mit
      Aktionsnamen, `use-game-engine.js` zeichnet jeden Befehl auf — den des
      Spielers **und** den Takt der Uhr. Die Wiedergabe faehrt denselben Reducer
      von `createInitialGameState(seed)` aus und trifft jeden Zustands-Hash:
      gemessen Seed `a1b2c3d4`, 1669 Eingaben, Digest `970a7b9b`. Dazu der Raid
      als deterministische Simulation (`raid-sim.js`, elf Woerter, Salt je
      Schritt) mit einem eigenen Golden-Wert (`npm run golden:raid`, drei
      Tickets, 96/96/32 Schritte, 37/39/20 verschiedene Zustaende). Entwurf,
      Grenzen und offene Fragen stehen in [`REPLAY-PLAN.md`](REPLAY-PLAN.md).
  Status: geplant
  Scope: Domaene
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

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

- [x] **Der Server kennt den Spieler, den Spielstand und den Raid.** Fünf Lücken,
      die zusammenhingen. **Identität:** `login`/`register` geben zusätzlich zum
      Seed einen Traeger-Token aus, `sessions` hält ihn, und `/api/state` wie
      `/api/raid` lösen ihn serverseitig auf — der Server glaubt keinem
      `playerseed` aus dem Rumpf mehr (B9). **Spielstand:** `POST`/`GET
      /api/state` tragen den Envelope über HTTP, mit der Snapshot-Obergrenze als
      eigener Rumpfschranke; der Speicher-Takt schickt denselben Envelope, den er
      lokal sichert, und schweigt ohne Token. **Atomar:** die Revision steht als
      Spalte und wird in der Bedingung der `UPDATE` geprueft — zwei Tabs buchen
      nicht mehr dieselbe naechste Revision (B10). **Bremse:** `login_attempts`
      haelt den Zaehler je Name und Herkunft statt eines `new Map()` im
      Prozessspeicher, das bei verteilten Workern nichts bremst (B11). **Raid:**
      `POST /api/raid` ruft `validateRaidReplay()` — Spieler, Server, Pruefer.
      **PlayerID:** eigene Kennung statt `seed.slice(0, 8)`, das bei rund 65.000
      Konten zur Haelfte kollidiert (B12). **Bindung:** `npm run deploy:guard`
      weist den Null-Platzhalter des `wrangler.jsonc` vor dem Ausliefern ab
      (B13). Belegt von `check-storage`, `check-account`, `check-account-brake`,
      `check-account-worker` und `check-account-http`; die Migration liegt als
      `0002` bei. **Offen bleibt:** Ticketausstellung und MMR — die Zeile, die
      vor dem Ergebnis in die Datenbank schreibt, fehlt weiterhin.
  Status: geplant
  Scope: Server
  Kategorie: Feature
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
