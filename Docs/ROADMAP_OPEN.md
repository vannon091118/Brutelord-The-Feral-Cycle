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

- [x] **Eine Absage 409 nennt jetzt die Revision des Servers.** Der Schreibvorgang
      des Spielstands lehnt einen zu späten Stand mit 409 ab, sagte aber nicht,
      wie weit der Server ist — der Client zählte lokal weiter und schrieb gegen
      einen Stand, den der Server längst überholt hatte. Der Verteiler reichte
      außerdem nur `{ error }` durch und warf die Revision dabei weg; er trägt die
      mitgeschickten Felder jetzt mit. `pushEnvelope()` liest die Revision aus der
      Absage und hebt die eigene Zählung darauf. Belegt von `check-account-worker`
      (die Absage nennt die Revision) und `check-snapshot` (der Client übernimmt
      sie); die Gegenprobe mit stillgelegter Absage und stillgelegtem Verteiler
      färbt beide rot.
  Status: geplant
  Scope: Server
  Kategorie: Bugfix
  Version: ausstehend
  Datum: ausstehend

- [x] **Die Sitzung altert und lässt sich widerrufen.** Der Träger-Token lebte so
      lange wie seine Zeile. `sessions` trägt jetzt `expires_at` (Migration
      `0003`, lokal als Nachzieher), `readSession()` prüft die Frist in der
      Bedingung der Abfrage, ein Schreibvorgang räumt die abgelaufenen weg —
      dieselbe Form wie bei `login_attempts` —, und `POST /api/logout` löscht die
      Zeile über den neuen Vertragsnamen `deleteSession`. Der Client ruft den
      Endpunkt beim Abmelden. Eine Zeile von vor der Migration trägt NULL und gilt
      als abgelaufen: fail closed, angemeldet bleibt niemand. Belegt von
      `check-storage` (Widerruf, Frist, Aufräumen) und `check-account-worker`
      (Abmelden entwertet den Token).
  Status: geplant
  Scope: Konto
  Kategorie: Feature
  Version: ausstehend
  Datum: ausstehend

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

- [x] **Der Bauplatz ist eine Frage der Domäne, und eine Absage nennt den Grund.**
      Mit gewähltem Brutlord bot das Spiel keinen einzigen Bauplatz an, während
      der Essenz Extractor dreizehn zeigte, und der Hinweis sagte trotzdem
      weiter „Klicke freien Boden als Bauplatz an." — eine stille Sackgasse ohne
      Fehlermeldung. Die Platzregel lag in der Ansicht und filterte dort das
      Sichtfenster, also konnte keine Stelle sagen, woran es lag. Jetzt liefert
      `placementReport()` die Anker über das ganze Raster und bei leerer Liste
      den Grund: kein freier Boden (`NO_FLOOR`) oder freier Boden ohne Fläche
      der Größe (`NO_SPACE`); `selectPlacement()` ist der einzige Weg dorthin,
      `world-view` rechnet die Anker um und behält, was der Ausschnitt zeigen
      kann, und das Baumenü nennt den Grund samt der Zahl freier Felder. Die
      neue Gruppe `placement` belegt alle drei Aussagen samt Gegenprobe: ein
      Rasterschnitt, eine stumme Absage, ein stummer Hinweis und ein gemalter
      Umriss außerhalb des Fensters färben sie rot. Das Raster selbst bleibt
      unverändert — der Startraum trägt weiterhin keinen 2 × 2, was jetzt
      jemandem gesagt wird statt verschwiegen.
  Status: geplant
  Scope: Domäne
  Kategorie: Bugfix
  Version: ausstehend
  Datum: ausstehend

- [x] **Das Opening erzwingt eine Wahl: eine Zusage bindet Essenz.** Der erste
      Bau kostete den zweiten gemessen 200 ms — die Bau-Wahl prüfte den nackten
      Vorrat, während der offene Bauplatz daneben nichts kostete, also durfte
      sich dieselbe Essenz zweimal versprechen: Extraktor und Schwarmhort liefen
      beide los, und die Reihenfolge war die einzige Entscheidung. Jetzt bindet
      ein offener Bauplatz seinen ganzen Preis (`committedEssence()`),
      `spendableEssence()` ist die einzige Kasse, aus der gewählt wird, und
      `START_ESSENCE` steht bei `COST.extractor + 3 * miningCost` statt plus
      sechs — der Vorrat liegt damit unter Extraktor plus Schwarmhort und kauft
      genau eine Tür. Die Türen stehen sichtbar im Baumenü: jede nennt, was sie
      freilässt (`bleibt N`), was fehlt (`fehlt N`) oder ob danach kein Abbau
      mehr bezahlbar ist — die Reserve ist die vierte Tür, denn ein Abbau kostet
      Essenz. Die neue Gruppe `opening` geht den ganzen Weg über die Aktionen
      des Browsers: die zweite Tür ist zu, obwohl die Essenz reicht, sie geht
      nach dem Bezahlen wieder auf (eine Verzögerung, kein Schloss), und wer
      die zweite nimmt, hat nichts mehr zum Graben. Der Determinismus-Golden-Wert
      trägt den neuen Startvorrat und wurde bewusst neu geschrieben.
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

- [x] **Der Server stellt das Raid-Ticket aus, prüft es und bucht die Beute atomar.**
      Das Ticket war bis hierher eine Behauptung des Clients: `POST /api/raid` nahm
      `{ ticket, actions, claimed }` und prüfte nur, ob das Log irgendetwas
      nachspielt — Beute buchte niemand, und ausgestellt hat das Ticket auch
      niemand. Jetzt gibt es die Zeile: `raid_tickets` hält Id, Konto, Rumpf und
      Frist (Migration `0004`, lokal als Schema), `POST /api/raid/ticket` stellt
      aus, und die Einreichung liest **ihre** Zeile — `body.ticket.id` ist die
      einzige Angabe aus dem eingereichten Ticket (D25, B16). Den Kader nennt der
      Angreifer nur mit Ids; `cadreRule()` prüft Zugehörigkeit, Doppelung, Größe
      und Grit-Deckel und gibt ihn normalisiert zurück, den Eintrittspunkt rechnet
      `entrySeed()` aus Ticket-Id, Angreifer und dem gespeicherten Welt-Seed des
      Verteidigers. Die geprüfte Beute geht über `applyRaidLoot()` in den
      Heimatstand des Envelopes, die Revision steigt um eins, und **eine**
      Transaktion schreibt den Stand und verbraucht die Zeile (B17): die Löschung
      hängt an der gerade geschriebenen Revision, damit eine abgewiesene Buchung
      das Ticket stehen lässt und doppelte Beute ausgeschlossen ist. Der Fund auf
      diesem Weg: `entrySeed()` hat zwei seiner drei Eingaben ignoriert
      (`NaN ^ salt` für jede Zeichenkette) — acht verschiedene Angreifer landeten
      auf demselben Eintrittspunkt; `textSeed()` hasht sie jetzt wirklich. Belegt
      von der neuen Gruppe `raid-ticket` (40 Prüfungen über echte Requests gegen
      den echten lokalen Speicher: Ausstellung, manipuliertes Ticket, gebuchte
      Essenz und Blutstein, 404 auf den zweiten Anlauf) und von `check-storage`
      (Vertrag mit vierzehn Namen, Frist, veraltete Buchung lässt die Zeile stehen).
      Nachgezogen: die **Zahlen** des Kaders kommen aus dem gespeicherten
      Heimatstand und nicht mehr aus dem Rumpf. `statsOf()` faltet sie aus den
      Steinen des Dunglings (Summe der Stat-Beiträge, `dig` aus der
      Grabfähigkeit), `cadreRule()` nimmt vom Antrag nur noch die Ids und weist
      einen abweichend behaupteten Wert mit `GEFALSCHT` ab (D31, B18). Der
      Anlass war gemessen: derselbe Antrag mit `atk: 999999, speed: 500, grit: 1`
      bekam vorher 201, und `createRaidState()` rechnete daraus `apMax: 500`
      statt der rund 40 eines echten Dunglings — der Client stellte sich seine
      Helden selbst aus und entschied den Ausgang. Die Gruppe `raid-ticket`
      fährt den Vorher/Nachher-Fall jetzt mit (64 Prüfungen), und der Log-Client
      der Abnahme sucht seinen Weg nach Kosten statt nach Feldern: der kürzeste
      Weg durch den Stein ist der teuerste, und wer nach Feldern marschiert,
      verliert den Raid an der Ausdauer statt an den Wächtern.
      Nachgezogen: der **Eintrittspunkt hängt am Paar** und nicht an der
      Ticket-Id, und je Paar lebt genau eine Zeile (`raid_tickets` trägt den
      Verteidiger als Spalte) — vorher kostete wiederholtes Ausstellen nichts
      und kaufte den kürzesten Anmarsch (gemessen: acht Ausstellungen, acht
      Eintritte zwischen (11,18) und (61,44) bei 64 bis 180 Ausdauer). Jede
      Buchung schreibt außerdem eine **Quittung** (`raid_bookings`, Migration
      `0005`) in derselben Transaktion wie den Spielstand: ein zweiter Antrag
      mit demselben Ticket antwortet 200 mit der gebuchten Beute statt 404,
      und `GET /api/raid/bookings` nennt die letzten Überfälle. Und die
      Buchungsregel läuft nicht mehr nur als SQL-Text: die neue Gruppe
      `booking` fährt dieselbe Suite gegen den lokalen Speicher und gegen eine
      D1-Attrappe über `node:sqlite`, die die echten Migrationen als Schema
      nimmt. Ihr erster Lauf fand einen Unterschied (D1 meldete für ein fremdes
      Ticket `veraltet` statt `kein ticket`); was die Attrappe nicht beweist,
      ist die Isolation der echten D1 — das steht im Dokument.
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
