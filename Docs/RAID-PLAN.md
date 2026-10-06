# Raid-Entwurf: Eco-Stakes

Der Entwurf liegt hier, **bevor** Code dazu entsteht. Grund ist nicht
Ordnungsliebe: das Vorhaben berührt Vorgaben in `AGENTS.md` §8, die
ausdrücklich vom Auftraggeber gesetzt und im selben Zug revidiert wurden, und
es berührt den Untergrund, den §8 bisher auf genau eine Art festlegt. Solange
das nicht entschieden und vermerkt ist, gehört es hierhin und nicht in den
Code.

Alles Weitere zu diesem Feature steht in
[`ROADMAP_OPEN.md`](ROADMAP_OPEN.md). Dieses Dokument trägt die **Regeln, die
Entscheidungen und die offenen Fragen** — und benennt ehrlich, was noch nicht
wissbar ist.

---

## Was der Entwurf will

Ein Angriff zwischen zwei Spielern. Der Verteidiger verliert Material, wenn
sein Hive fällt, und bekommt Material nur, wenn er selbst raidet. Es gibt
keine Wartezeiten und keine Teilnahme-Währung: die Ausdauer des Teams *ist*
der Einsatz, und sie wird aus den Mutationen der Monster berechnet. Wer sein
Team losschickt, riskiert es — das ist der ganze Kern.

## Das Regelwerk

### Snapshot und Server

Die Basis eines Spielers wird beim Bauen oder Ausloggen eingefroren und als
deterministischer Zustand im Backend gehalten. Der Client führt den Raid
vollständig lokal aus und sendet am Ende ein schlankes Aktions-Log
(`MOVE_N`, `DIG_E`, `SACRIFICE_01`) plus den finalen State-Hash. Der Server
macht einen deterministischen Replay-Check und schreibt dann die Datenbank.

**Der Client ist Ausführender, nicht Quelle.** Bei Ticketausstellung vergibt
der Server ein **RaidTicket**, das Kader, Start-Ausdauer, Eintrittspunkt und
den Snapshot der gegnerischen Basis einfriert. Eingereicht wird nur gegen
dieses unveränderliche Ticket akzeptiert, und nur, wenn die Replay-Validierung
exakt zum identischen Ergebnis führt.

Bei Verbindungsabbruch bleibt die Runde gültig. Erbeutetes geht in einen
`Pending`-Zustand und wird beim nächsten Server-Connect synchronisiert.

Es gibt **keine** künstlichen Wartezeiten und **keine** Teilnahme-Währung.

### Einstieg und Sichtfeld

Der Angreifer spawnt an einem unverbauten Feld im Umkreis von 60 Feldern um
den gegnerischen Hive. Zu Beginn sind ausschließlich die direkten
Nachbarfelder sichtbar; der Rest des Dungeons wird blind gegraben. Ziel ist
die Zerstörung des gegnerischen Hives.

Der Eintrittspunkt ist **kein clientseitiger Wurf**: der Server berechnet ihn
bei Ticketausstellung und legt ihn in das Ticket.

### Ausdauer und AP

Zwei Ressourcen, zwei Achsen, und sie wachsen beide nicht nach:

- **Ausdauer** ist das **Gesamtbudget** der Expedition. Sie skaliert linear
  aus der Summe des `grit`-Wertes des Teams und wird beim Graben von Feldern
  verbraucht. Sie erneuert sich während des Raids nicht.
- **Aktionpunkte** sind die **Verbrauchsgrenze pro Runde**. Ihr Maximum pro
  Runde ergibt sich aus `speed`; sie füllen sich zu Beginn jeder Kampf-Runde
  auf den Basiswert des jeweiligen Monsters auf.

**Bewegung ist gratis** — aber nur über bekanntes Gelände. Durch massiven
Boden kommt man ausschließlich durch Graben, und das kostet Ausdauer. Damit ist
das Ausdauerbudget die einzige Schranke des Einmarsches.

Ein Angriff kostet immer denselben festen AP-Betrag. **Stats skalieren den
Output, nicht die Kosten** — ein Angriff kostet nie mehr, wenn das Monster
stärker ist.

**Die Zahlen, gemessen statt gesetzt.** Der Einmarsch gräbt orthogonal, und die
ferne Ecke einer 64 × 64-Karte ist bei einem Hive auf (31,31) das Feld (63,63)
mit 64 Schritten. Das ist die Basis-Ausdauer: damit erreicht ein nacktes Team
den Hive von **allen 4096 Feldern**. Der Endwert folgt aus `MAX_DUNGLINGS` (6),
`SLOT_ORDER` (4) und der Seltenheitsstufe — 24 Steine, je Stein höchstens
`5 × 4 = 20` grit, also ein Maximum von 480.

```
teamGritShare = teamGrit / 480           // 0 bis 1
Ausdauer      = 64 + 116 * teamGritShare
```

Gemessen: nacktes Team 64, ein Team mit halbem Anteil 122, voll ausgestattet
180. Graben kostet 1 für weiche Erde, 6 für Stein und 12 für Obsidian.

### Risiko und der Monster-Zyklus

**Fail closed.** Fällt die Ausdauer auf null und der Spieler bricht ab, ist der
gesamte Einsatz verloren und es gibt keine Belohnung.

**Das Opfer.** Um ein „Fail closed" zu vermeiden, kann ein Monster aus dem Team
permanent geopfert werden und gibt sofort Ausdauer. Fällt der Hive in diesem
Raid, besteht eine Rückholchance für das geopferte Monster.

**Der Zyklus.** Ausdauer regeneriert sich nur, während das Monster zu Hause
„auf der Bank" sitzt. Stirbt ein Monster, hat der Spieler zwei Stunden, es mit
Ressourcen wiederzubeleben; danach wandert der Seed in einen öffentlichen Pool.

Die zwei Stunden sind ein **Lebenszyklus-Timer auf einem Monster**, kein Gate
für die Teilnahme am Raid. Das ist der Unterschied, der §1 und §4 sonst
widersprüchlich macht.

### Bauen und Verteidigen

**Kanten-Wände.** Wände blockieren keine ganzen Felder, sondern sitzen auf den
Kanten (Nord, Ost, Süd, West) eines Feldes. Räume bleiben begehbar und werden
nach außen gepanzert.

**Wächter-Koma.** Verteidiger-Monster sterben bei einem feindlichen Raid nicht
permanent. Sie gehen in einen Verwundet-Status, behalten ihren Seed und müssen
mit Biomasse geheilt werden. Wächter nutzen eine Zone of Control, um Angreifer
im Nahkampf zu binden — kein endloses Weglaufen.

**Persistenter Schaden.** Zerstörte Gebäude sind Ruinen und produzieren nichts,
bis der Verteidiger sie repariert.

**Heimat-Ressourcen.** Natürliche Stein- und Obsidianblöcke geben im eigenen
Dungeon keine Wandlaubnis. Ihr interner Abbau kostet keine Ausdauer, erfordert
aber Zeit und zusätzliche Dunglinge — er läuft unverändert über `work-tick.js`
und das normale Zuweisen von Arbeitern.

### Beute, Rückzug und Zielwahl

**Extraktion.** Beute ist erst gesichert, wenn das Team physisch zum
Spawn-Punkt zurückkehrt. Ein abgebrochener Raid liefert deshalb nichts — das
ist die andere Hälfte von „fail closed".

**Der Lootling.** Bei einem Rückzug muss ein Lootling entsendet werden, der
eine Essenz-Gebühr kostet (Grundkosten plus Gewicht) und zwei bis drei Raids
bis zur Zustellung braucht.

**Das Ressourcen-Monopol ist aufgehoben.** Stein und Obsidian sind in jeder
Welt vorhanden und im eigenen Dungeon abbaubar. Sie sind deshalb **begrenzt**
und ein Progressions-Gate: Der Abbau von Erde und Hartgestein hängt an der
Fähigkeit **Graben**, die aus dem Mutationssystem kommt und zufällig mit hoher
Wahrscheinlichkeit fällt. Der eigentliche Anreiz zum Raiden ist damit nicht
der Rohstoff, sondern die **Beute**.

**Keine Gegnerauswahl.** Der Spieler wählt sein Ziel nicht; ein MMR-System
wählt. Ein Angriff hinterlässt einen Riss mit den exakten Koordinaten für einen
Rache-Raid mit Loot-Bonus; ein Rache-Raid erzeugt selbst keinen neuen Riss.

---

## Die Entscheidungen

Jede mit dem Warum. Die ausführliche Begründung der Entscheidungen selbst
gehört nach [`ARCHITEKTUR.md`](ARCHITEKTUR.md), sobald Code existiert.

### Kosten und Fähigkeiten

- **D1** Das Monopol ist aufgehoben: Stein und Obsidian sind in jeder Welt
  vorhanden und im eigenen Dungeon abbaubar. Der Rohstoff ist damit begrenzt,
  aber nicht an den Raid gebunden.
- **D2** Erde und Hartgestein sind ein Progressions-Gate. Der Abbau hängt an
  der Fähigkeit **Graben**.
- **D3** Ausdauer zahlt Graben. Bewegung ist gratis, aber nur über bekanntes
  Gelände; durch massiven Boden kommt man ausschließlich durch Graben. AP
  zahlen jeden Angriff.
- **D27** Weil das Budget nicht nachwächst, ist eine Taktbeschleunigung
  wertlos: nicht das Tempo begrenzt den Raid, sondern die Summe.
- **D28** Wände tragen einen einzigen Verteidigungswert. Der aggregierte
  `atk`-Wert bestimmt, wie viel Schaden ein Schlag an Wächtern oder einer
  Obsidianwand anrichtet.
- **D29** **Aktionen haben Fixkosten, Stats skalieren den Output.** Wäre es
  umgekehrt — stärkere Monster wären pro Schlag teurer —, würde das Spiel den
  Fortschritt bestrafen und eine Meta erzeugen, in der Spieler absichtlich
  schwache Billig-Monster züchten, um die Kosten zu drücken. `atk` bestimmt
  also den Schaden pro Schlag, `speed` das AP-Maximum der Runde, und `grit`
  skaliert als Team-Summe linear in den Ausdauerpool.
- **D30** `RaidCapability` bekommt einen eigenen Kanal in `STONE_SALT`.
  `trait`, `rarity`, `stat` und `visual` sind bewusst getrennt, damit Seltenheit
  und Trait nicht zwangsläufig aneinander hängen; Graben käme sonst an der
  Seltenheit zu hängen.
- **D32** **Der Raid liest Berechtigung, nicht Charakter.** Traits sind
  entitätsgebunden: `SLIMY` ist eine Kriechspur auf dem Boden, den ein
  Dungling in der Kolonie hinterlässt, `MOTIVATOR` eine Aura auf andere
  Arbeiter, `GREEDY` eine Weigerung bei Bauaufträgen. Alle drei hängen an
  `jobTrip()` und an Arbeitstakten, die es in der Raid-Instanz nicht gibt.
  Wäre eine Raid-Semantik nötig, wäre das ein zweites Trait-System ohne
  Wirkung — D27 hat die Taktgeschwindigkeit schon als wertlos gestrichen,
  und dieselbe Begründung trifft jede Verlangsamung im Raid.
  Die Übersetzung wäre auch doppelt gezählt: die Berechtigung `GRABEN` ist
  ein eigenes Feld am Stein und kein Trait, sie antwortet auf eine andere
  Frage. Deshalb ist `capability` das vierte Stein-Feld neben Seltenheit,
  Fähigkeiten und Trait, und `raid-state.js` reist mit genau einem Feld
  daraus in die Instanz: `dig`.
- **D33** **Die Basis-Ausdauer trägt genau den Erdeweg — und genau den.**
  `entryRadius` 60 heißt: der längste Einmarschweg ist 60 Felder, nicht
  64, und zu 60 je Ausdauer bleiben vier übrig. Ein einziger Steinblock im
  Pfad kostet 59 + 6 = 65 und reißt das Budget. Das ist kein Rundungsfehler,
  sondern die Rechnung hinter D2: **ohne `GRABEN` ist der Einmarsch an
  Hartgestein zu, und mit `GRABEN` zahlt der Kader den Aufpreis.** Das
  Nackte-Team-Versprechen aus dem Regelwerk gilt damit für eine reine
  Erdreich-Karte und für nichts darüber — die Basis-Ausdauer ist eine
  Zusage über die Kartenart, nicht über die Welt.
  Ohne die Fähigkeit kostet der Weg nichts, weil er nicht geht
  (`pathCost` liefert `null`): Bezahlen kann man keinen Weg, den man nicht
  gehen darf.
- **D34** **Man betritt den Hive, man gräbt ihn nicht.** Der Hive ist kein
  Erdreich und damit kein Grabfeld; er ist aber bekannter Bau, also gilt für
  ihn die Bewegungsregel und nicht die Grabregel. Die Anordnung folgt aus
  D3: Bewegung ist gratis, aber nur über bekanntes Gelände — und ein Hive, den
  niemand betreten dürfte, wäre kein Ziel, sondern eine Wand.
  **Jede abgesetzte Aktion landet im Log, jede abgewiesene nicht.** Das ist
  der Unterschied zwischen „der Client hat es versucht" und „der Client hat es
  behauptet", und es ist der Grund, warum der Server das Log selbst
  abarbeitet, statt die Aussage des Clients zu übernehmen.

### Die Stats der Steine

- **D19** `RaidCapability` ist ein **viertes Feld am Stein**, neben Seltenheit,
  Fähigkeiten und Trait. `fuse()` in `mutant.js` reist mit dem Dungling mit.
  Traits bleiben Wirtschaft und Takt, Raid-Fähigkeiten sind Berechtigung —
  `stone-effects.js` bleibt unberührt.
- **D31** **Die Faltung der Stats ist die Summe, die der Traits ist `peak()`.**
  Der Unterschied ist nicht Geschmack: Traits fallen mit `peak()`, weil ein
  Monster nicht dreimal gierig sein kann — der zweite Stein bringt nichts. Stats
  sind dagegen je Stein ein eigener Beitrag, und ein vollständiges Set aus
  `HEAD`, `TORSO`, `ARMS` und `LEGS` ist damit die Addition seiner vier Steine.
  Das belohnt vollständige Rüstungssets und macht leere Slots im Raid zu einem
  spürbaren Nachteil, der über das reine Pathing hinausgeht.

**Eine Folge, die gemessen gehört:** `statCount` skaliert mit der Seltenheit von
`NORMAL` bis `LEGENDARY`. Mit der Summe aus D31 heißt ein voll bestücktes Set
also nicht vier Stat-Punkte, sondern bis zu sechzehn, und die Seltenheit wirkt
dadurch nicht linear. Das ist beabsichtigt — der Pity-Timer garantiert bei dreißig
Fehlschlägen die Legende, und das ist der Fortschrittshebel des Raids —, aber es
gehört als Konsequenz notiert und nicht als Überraschung bei der ersten
Bilanzierung.

### Snapshot, Server und Betrug

- **D18** Der Eintrittspunkt steht im Ticket. Der Server berechnet ihn einmal
  und legt ihn hinein; beide Seiten lesen ihn daraus.
- **D20** Der Client führt den Raid lokal aus und sendet Aktions-Log plus
  State-Hash.
- **D21** Das Format ist **asynchron** — der Verteidiger spielt nicht live mit,
  seine Basis ist ein Snapshot. Das Gameplay **in der Raid-Instanz des
  Angreifers** ist **rundenbasiert**. Zwei verschiedene Dinge, zwei Wörter.
- **D22** Das MMR wird mit **Feral Hives** gebootstrapt: serverseitig
  deterministisch erzeugte CPU-Basen auf Basis des Spieler-Levels, bis der Pool
  genug echte Snapshots enthält.
- **D24** Das RaidTicket friert Kader, Start-Ausdauer, Eintrittspunkt und
  gegnerischen Snapshot ein. Der Client wählt nichts, er führt aus.
- **D25** Die Signatur ist der falsche Mechanismus. Der Schutz ist der
  **Lookup**: bei Einreichung zählt die Ticket-ID, und der Server liest seine
  eigene Zeile. Aus dem mitgelieferten Ticket-Objekt gelesen editiert der
  Client es mit — ein manipulierter Client prüft nichts.
- **D26** Ein Verb, zwei Währungen, ein Ort: `DIG` bleibt ein Verb und eine
  Aktion, und die Währung wird nach Zustand gewählt. Der Heimatpreis von einer
  Essenz je Block bleibt unangetastet.
- **D46** **Anti-Aufkundschaffen durch Ticketbindung.** Die Vergabe des
  Tickets sperrt das Team serverseitig. Gebaut ist die Bindung an das **Paar**:
  der Eintrittspunkt hängt an Angreifer und Verteidiger und nicht an der
  Ticket-Id, und je Paar lebt genau eine Zeile — wiederholtes Ausstellen kauft
  keinen kürzeren Anmarsch mehr. *(Stand als `D28`, das schon an den
  Wänden vergeben war — siehe die Nummernhinweise in „Kosten und Fähigkeiten"
  und „Die Gruppe, die Traits und das Graben-Tor".)* Schließt der Angreifer den Tab nach
  dem blinden Aufdecken der ersten Felder, bleibt das Team in der Raid-Instanz
  gefangen; reicht kein valides Log für einen legitimen Rückzug oder Sieg ein,
  erklärt ein serverseitiger Timeout-Job den Raid zum Totalverlust. Die
  Heimatbasis des Verteidigers bleibt unberührt, der Angreifer verliert seinen
  Einsatz.

### Struktur

- **D23** Der Raid ist **streng additiv**. Graben mit Ausdauer existiert nur im
  isolierten `RaidState`; die Heimat läuft unverändert über `work-tick.js`.
  Das früheste Onboarding ist damit unangetastet.
- **D4** Die eigene Welt steht während des Raids still.
- **D7** Keine Zeit-Gates für die Teilnahme; ein Riss ist sofort sichtbar.
- **D5** Keine Gegnerauswahl durch den Spieler; ein MMR-System wählt.
- **D6** Alle vier Bedrohungen sind abzuwehren: gefälschtes Ergebnis,
  aufgeblähte eigene Werte, beschleunigter Takt, manipulierte Pending-Beute.
- **D8** Karten sind 64 × 64 **begehbare** Felder; alles darüber hinaus wird
  über Etagen gelöst.
- **D9** Fail closed bei Ausdauer null.
- **D10** Das Opfer gibt sofort Ausdauer; bei Hive-Verlust besteht eine
  Rückholchance.
- **D11** Ausdauer regeneriert nur zu Hause; zwei Stunden bis zur Wiederbelebung,
  danach wandert der Seed in einen öffentlichen Pool.
- **D12** Extraktion erst am Spawn-Punkt.
- **D13** Der Lootling kostet Essenz und braucht zwei bis drei Raids.
- **D14** Wächter werden verwundet, nicht getötet, und binden Angreifer per
  Zone of Control.
- **D15** Natürliche Blöcke im eigenen Dungeon geben keine Wandlaubnis.
- **D16** Disconnect lässt die Runde gültig; die Beute wird `Pending`.
- **D17** Je weniger gebaut, desto näher spawnen Gegner. Das schneidet bewusst
  gegen die Tendenz des MMR, schwache Konten zu schonen.

---

### Die Gruppe, die Traits und das Graben-Tor

Diese Entscheidungen kamen nach dem Gerüst aus PR #13 und ändern daran nichts,
was dort steht — sie sagen, **wie** sich die Gruppe im fremden Dungeon bewegt.

**Die Nummern dieses Abschnitts standen doppelt.** `D32`, `D33` und `D34` waren
schon einmal vergeben, und die zitierten Fassungen sind die älteren: offene
Frage 1 verweist auf das Ausdauer-`D33`, die Checkpoints auf das Ausdauer-`D33`
und das Hive-`D34`. Der ganze Abschnitt ist deshalb geschlossen auf `D39` bis
`D45` umgezogen und behält seine Reihenfolge — `D39` ist der Cursor, `D45` die
Reihenfolge von `candidates()`. Die spätere Doppelung von `D28` heißt jetzt
`D46`. Eine Nummer benennt wieder genau eine Entscheidung; keine Zitation
musste sich dafür ändern.

- **D39** **Ein Cursor ist die Position der Gruppe.** `state.at` gehört der
  Gruppe, und `state.heroes` trägt **keine** eigene Position. In der Kolonie ist
  die Position je Dungling Spielwahrheit, weil sie sich Kacheln teilen; im Raid
  entscheidet sie nichts, gegen einen eingefrorenen Snapshot gibt es keine
  Zugsorge. Zwei Helden einzeln zu setzen erzeugt eine Zugverschiebung, die
  nichts entscheidet, dafür aber Zustand, Hash und Replay-Format verdoppelt.
- **D40** **Im Idle erkundet die Gruppe von selbst und handelt nicht.** Ohne
  Befehl zieht sie in die **Frontlinie** — grabbare Felder am Rand des
  gelaufenen Bereichs, gewählt aus dem Seed im Ticket. Sie **gräbt** dabei, denn
  Graben ist Bewegung durch Erdreich, führt aber **keine** Aktion aus: kein
  Angriff, kein Zielwechsel. Der Idle-Takt kostet damit Ausdauer statt AP, und
  das ist der Preis des eigenen Explorierens.
- **D41** **Ein Befehl setzt den Pfad, nicht das Ziel.** Die Pfadfindung ist
  **Dijkstra über Ausdauer**, nicht BFS über Schritte: bekannter Boden ist
  gratis, ungegrabener kostet `digCost()`, und ein Weg, dessen Summe das Budget
  übersteigt, wird nicht ausgegeben. Die Schritte selbst bleiben die Verbote des
  Replays (`DIG_S`, `MOVE_N`), damit Replay und Erkundung dieselbe Sprache
  reden. **Wege, die frei werden, werden weiter erkundet**, und ein unerfüllbarer
  Befehl fällt auf die Erkundung zurück, statt zu blockieren.
- **D42** **Alle drei Traits sind in der Währung des Raids gerechnet**, nicht
  abgeschrieben: `lootScale = 1 + carryBonus`, `apScale = 1 + speedBonus`,
  `digScale = 1 / (1 - trailSlow)`. Im Raid gibt es keine Bauaufträge und keine
  fremden Dunglinge, also fällt `buildOrders` weg, die Aura wird bedingungslos,
  weil die Gruppe eine Einheit ist, und aus der Schleimspur wird ein **Preis für
  das Grabfeld am eigenen Tunnel**. Gefaltet wird mit `peak()`.
- **D43** **Das Graben-Tor: Erde ist immer offen, Hartgestein nur mit der
  Fähigkeit.** `canDig(terrain, heroes)` ist genau das und `raid-steps.js`
  prüft es fail closed. Die Berechtigung ist `RAID_CAPABILITY.DIG` aus dem
  Mutationssystem und gilt **in beiden Welten**: dasselbe Team, das im eigenen
  Dungeon kein Hartgestein abbaut, baut im Raid keinen Tunnel durch Stein.
  Mechanismus (ein Verb mit eigener Kostenlogik) und Berechtigung (ein Kanal in
  `STONE_SALT`) sind zwei Dinge; D2 bleibt damit unangetastet, denn Erde bleibt
  grabbar und nur das Hartgestein ist das Gate.
- **D44** `entryRadius` und `baseStamina` werden gegeneinander gerechnet:
  `worstEntryDistance()` ist `min(entryRadius, MAX_APPROACH)` — der schlimmste
  Einmarsch ist der Ring, nicht die Kartenecke.
- **D45** Die Reihenfolge von `candidates()` ist Teil des Replay-Formats, weil
  `entryPointFor()` mit `index = hash * list.length` daraus wählt. Deshalb trägt
  `RAID_FORMAT_VERSION` den Zustand mit in `stateHashInput()`, und die Abnahme
  friert Länge, ersten und letzten Punkt ein.

---

## Der beschlossene Umbau: der Rundenwechsel kommt aus dem Log

Entschieden, **bevor** Code dazu entsteht. Die offene Roadmap führt den Punkt
als „der Rundenwechsel wird bis heute vom Aufrufer ausgelöst, weil der Raid
keine Uhr hat"; dies ist die Form, in der er gebaut wird.

**Das Problem, und was bisher nicht auffiel.** `nextRound()` zählt die Runde
hoch und füllt die AP auf — gerufen wird sie vom **Aufrufer**, heute nur von
`scripts/verify/raid-siege-fixture.mjs`. Ein Replay aus dem Log kann eine Runde
damit nicht reproduzieren, denn „wann eine Runde endet" steht in keiner Zeile
des Logs. Zwei Instanzen, die dieselben Schritte abarbeiten, landen auf
verschiedenen Runden — und **niemand merkt es**, weil `stateHashInput()` das
Feld `round` gar nicht trägt. Der Vergleich in `replayMatches()` ist an genau
der Stelle blind, an der er prüfen soll.

- **D47 — Der Rundenwechsel ist eine Folge, kein Befehl.** `applyAction()` ruft
  ihn am Ende selbst: sind die AP **aller** Helden unter
  `RAID_CONFIG.attackApCost`, füllt `raid-state.js` sie auf und zählt die Runde
  hoch. Damit ist die Runde aus der Aktionsfolge ableitbar, und Replay,
  Erkundung (`tickMove`) und Live-Spiel lesen dieselbe Regel an derselben
  Stelle statt an dreien. Ein eigener Log-Schritt (`NEXT_ROUND`) fällt damit
  aus: ein Befehl, den der Client **weglassen** darf, ist eine zweite Wahrheit,
  und genau die soll der Replay-Check ausschließen.
- **D48 — `round` gehört in den Zustands-Hash.** Ohne das Feld ist der
  Unterschied unsichtbar; mit ihm deckt `replayMatches()` auch den Rundenwechsel
  ab. Der Preis steht unten und ist bezahlt, nicht verschwiegen.
- **D49 — `nextRound()` bleibt exportiert, aber ohne Aufrufer außerhalb der
  Domäne.** Die Funktion ist die Regel („AP auffüllen, Runde hoch"); wer sie
  von außen ruft, umgeht die Bedingung aus D47. Die Fixture verliert deshalb
  ihre `ohneAp()`-Hilfe und den ausdrücklichen Ruf — sie bekäme die Runde sonst
  zweimal.

**Was der Umbau kostet.** `stateHashInput()` speist `raidDigest()`, und damit
wandern die eingefrorenen Werte in `scripts/verify/raid-golden.json`. Der Umbau
**macht die Abnahme rot, und das ist der Beweis, dass er etwas ändert**: der
Golden-Wert wird mit `npm run golden:raid` neu geschrieben, **nur** auf der
Node-Major, die die CI pinnt, und mit einer Erklärung im Commit-Body. Von Hand
fasst ihn niemand an. Wer den Hash ändert, ohne den Golden-Wert zu erneuern,
lässt die Prüfung stehen und die Aussage verfallen.

**Die Schritte, in dieser Reihenfolge:**

1. `raid-state.js` bekommt `roundOver(state)` (die Bedingung) und ruft
   `nextRound()`; exportiert bleibt nur, was schon exportiert war.
2. `raid-steps.js` ruft `roundOver()` als letzte Zeile von `applyAction()`, nach
   `resolveLoss()`. Die Reihenfolge ist keine Kleinigkeit: erst prüfen, ob die
   Ausdauer den Raid beendet, dann die Runde weiterdrehen — sonst füllt ein
   verlorener Raid noch AP nach.
3. `stateHashInput()` nimmt `round` auf.
4. `raid-siege-fixture.mjs` verliert `ohneAp()` und den ausdrücklichen
   `nextRound`-Ruf; `fight()` wird eine schlichte Schleife.
5. `npm run golden:raid` neu schreiben, `check-raid-golden` liest den neuen Wert.
6. Die Abnahme: `check-raid-siege` fährt den ganzen Weg weiter **und** belegt,
   dass zwei Instanzen mit demselben Log dieselbe Runde erreichen — die
   Gegenprobe ist der alte Zustand aus Schritt 2, in dem die Runde stehen
   bleibt.

**Was offen bleibt.** Ein Angriff kostet AP, Bewegung nicht — wer sich nur
bewegt, wechselt die Runde also nie. Das ist mit D3 verträglich (Bewegung ist
gratis), aber es heißt: die Runde ist **keine** Uhr, sondern ein Zähler für
verbrauchte Angriffe. Solange der Raid keine Zeit kennt, ist das die ehrlichere
Lesart, und `round` heißt dann genau das. Eine Wächter-Regeneration „je Runde"
(D14) darf sich jedenfalls nicht auf Wanduhr-Zeit berufen.

## Die Konflikte mit den Regeln dieses Repos

Kein Punkt hier ist Kosmetik. Jeder bricht entweder ein Gate oder eine
dokumentierte Entscheidung.

- **Spawn und Zufall.** Ein clientseitig gewürfelter Eintrittspunkt fällt durch
  `check-architecture.mjs`, das `Math.random(` in **ganz** `src/` verbietet. Die
  Lösung ist D18: der Server liefert den Punkt mit dem Ticket, es braucht
  überhaupt keine Ableitungsfunktion in `src/`.
- **Reused Hashes sind eine Verschlechterung.** Der Vorschlag, den Eintritt aus
  dem `deposit-hash` des Verteidigers und dem `tileSeed` der Infiltration zu
  mischen, ist abgelehnt. `ARCHITEKTUR.md` begründet die getrennten Hash-Instanzen
  mit „die Schichtgrenze wiegt schwerer als Wiederverwendung", und
  `deposit-hash.js` nennt seinen Zweck selbst. Wer `skipPerMille` ändert,
  verschiebt damit den Raid-Eintritt — die räumliche Form von „abgeschriebene
  Zahlen bleiben grün, während die Regel kippt". Dazu weiß `blockHash(x, y, seed)`
  nichts darüber, ob ein Feld unbebaut ist; das weiß nur der Snapshot, der es
  ohnehin prüft.
- **Der Grab-Kanal ist billiger als gedacht.** `STONE_SALT` führt bereits vier
  benannte Kanäle. Graben ist ein fünfter Schlüssel, kein neuer Hash.
- **Die Abfanglogik für zwei Währungen hat keinen Ort.** `game-reducer.js`
  iteriert **eine** Kette, erster Reducer gewinnt. Ist `RaidState` isoliert, ist
  er eine **zweite** Kette — ein Reducer kann kein Verb abfangen, das an einen
  anderen Zustand dispatcht wurde. Die Dispatch-Schicht ist
  `use-game-actions.js`, und `useGameActions` steht heute bei 23 von 30
  LOC bei zwei von sieben belegten Importzeilen. Wer zwischen den Modulen
  wählt, macht den Modus-Zweig **an der Aufrufstelle**.
- **Der Ticket-Timeout muss in der Datenbank liegen.** Läuft er im Speicher,
  nimmt ein Serverneustart das Team mit: gesperrt, kein Ablauf, kein Ausweg. Der
  Ablauf gehört als Spalte an die Ticketzeile und wird über einen Scan
  aufgelöst.
- **Der Replay ist der billigste Anti-Missbrauchs-Baustein im ganzen
  Vorhaben.** Er ist eine reine Domänenfunktion und mit `npm run verify`
  **ohne** Server prüfbar. Nur der Datenbankschreibvorgang braucht den Server.
  Deshalb gehört er in die Abnahme und nicht in den Server.
- **„Streng additiv" gilt für den Spieler, nicht für die Codebasis.** Ein
  isolierter `RaidState` ist eine zweite Instanz von allem: zweiter Zustand,
  zweiter Reducer-Baum, zweites Mining mit eigener Kostenlogik, eigene
  Sichtbarkeitsregel. `canMineTile()` ist dafür unbrauchbar, weil es
  `touchesUsableSpace()` verlangt — im fremden Dungeon gibt es keinen eigenen
  nutzbaren Boden. Die **Terrain-Klassifikation** muss geteilt bleiben, die
  **Kostenlogik** darf es nicht.
- **Etagen kollidieren mit §8.** „Nichts darf als Kachel erkennbar sein" und
  das 13 × 13-Fenster sind für eine Ebene definiert.

---

## Die offenen Fragen

Nach Wichtigkeit geordnet. Die erste ist ein Bauauftrag, keine Balance.

### 1. Der Angriffspreis und die Faltung

Zwei Lücken, beide klein und beide findbar:

- ~~**Die Stats brauchen eine Faltungsregel über mehrere Steine.**~~ **Erledigt.**
  Traits faltet `stone-effects.js` mit `peak()`, die Stats faltet `statsOf()` in
  `stone-roll.js` als Summe der Stein-Beiträge (D31) und liefert dazu `dig` aus
  der Grabfähigkeit und die Traits des Trägers. Der Kader des Raid-Tickets kommt
  seit dem Server-Ausstellen genau aus dieser Funktion und nicht mehr aus dem
  Rumpf (D25, B18 in [`BACKEND-PLAN.md`](BACKEND-PLAN.md)); gemessen trug ein
  Antrag mit behauptetem `atk: 999999` vorher 201 auf die eigene Zeile.
- **Der feste AP-Preis eines Angriffs ist keine Zahl.** Ebenso der
  Verteidigungswert einer Obsidianwand.

Der feste Angriffspreis ist eine Zahl (`RAID_CONFIG.attackApCost`), und die
Faltung ist entschieden: der Schaden eines Schlags ist die Summe des `atk` der
Teilnehmer (D28/D31), nicht ein abgeschriebener Wert je Monster. Was fehlt, ist
der Verteidigungswert einer Obsidianwand — die Kantenwände sind der letzte offene
Bauteil dieses Entwurfs. Die Wächter- und Hive-Zahlen sind mit
der Mechanik gesetzt und stehen als Setzung in `raid-config.js` markiert; sie
gehören gemessen, sobald es einen Balance-Lauf gibt.

**Was inzwischen gemessen ist und hierher gehört:** die Chance auf `GRABEN`
steht als `capabilityChance` je Seltenheitsstufe in `stone-config.js` — hoch
genug, dass die Fähigkeit der Regelfall des Fortgeschrittenen ist, und an die
Seltenheit gebunden, damit das Siegel sie überhaupt tragen kann. Sie ist eine
Eigenmessung, keine Hochrechnung aus den Trait-Chancen; beide Kanäle fallen
unabhängig voneinander und beide Werte kommen in derselben Karte vor. Die
**Ausdauerfrage zu diesem Feld ist beantwortet** und steht als D33: die
Basis-Ausdauer deckt den reinen Erdeweg, ein Steinblock im Pfad reißt sie, und
damit ist `GRABEN` die Rechnung und nicht eine Nebensache.

**Die Ausdauerrechnung ist beantwortet** und steht im Regelwerk. Sie war die
letzte offene Zahl vor dem Bau und ist jetzt gemessen.

### 2. Der Zeitpunkt des Verteidigers

D24 friert den Snapshot bei Ticketausstellung ein. Was der Verteidiger danach
baut, sieht der Raid nicht — er kann Wände nachziehen, die der Angreifer nie zu
sehen bekommt, und Bauten reparieren, die der Raid für Ruinen hält. Entweder ist
Snapshot-Moment gleich Raid-Moment, oder das Ergebnis wird gegen den späteren
Stand reconciliert.

### 3. Der Rache-Raid gegen das MMR

D5 sagt: keine Gegnerauswahl. Der Riss gibt dem Verteidiger priorisierte
Koordinaten. Der Rache-Raid braucht also eine Ausnahme, oder der Riss wird zu
einem Koordinaten-Hinweis, den das MMR nach Gewichtung priorisiert.

### 4. Etagen

Vollständig unbestimmt. Der 64 × 64-Raster ist als begehbare Fläche entschieden,
alles darüber nicht.

### 5. Die Integration der Raid-Sichtbarkeit

Die Sichtbarkeit selbst ist entschieden (nur direkte Nachbarfelder zu Beginn).
Offen bleibt, wie sie in `reveal.js` und `REVEAL_RADIUS 2` aufgeht, ohne das
Basisspiel zu verändern.

### 6. Die Rückholchance beim Opfer

Der Entwurf sagt „eine Rückholchance", ohne eine Zahl.

---

## Was zuerst gebaut werden muss

Nicht die Mechanik. Diese Reihenfolge:

1. **Speichern.** Der Spielstand liegt als Envelope in `accounts`, die
   **Ticketzeile** in `raid_tickets` (Frist und Verteidiger inklusive,
   Migration `0004`), die **Quittung** eines gebuchten Raids in `raid_bookings`
   (Migration `0005`), und die Beute wird in einer Transaktion in den
   Heimatstand gebucht. Die Quittung ist der Grund, warum ein verlorener
   Antwortweg kein verlorener Raid ist; sie ist auch die Zahl, an der eine
   Grenze je Paar später hängt. Was weiterhin keine Tabelle hat: der
   eingefrorene **Snapshot** des Verteidigers (heute dient sein Welt-Seed als
   Ersatz), `raid_id`, die **MMR-Aufzeichnung**, der **Riss** und die
   `Pending`-Beute.
2. ~~**Die Ausdauer-Rechnung**, ausgehend vom Weg.~~ **Erledigt.** Sie steht im
   Regelwerk und in `raid-config.js`; die Zahlen sind gemessen, nicht gesetzt.
3. ~~**Das Terrain-Feld neben `TILE_KIND`**.~~ **Erledigt.** `TILE_TERRAIN`
   steht in `tile.js` neben `TILE_KIND` und nicht darin, `terrainOf()`
   lässt `isEarth()` unberührt, und die Heimat führt weiterhin kein
   Hartgestein (§8). Das Vorkommen erzeugt `raid-terrain.js` mit eigener
   Hash-Instanz; die Abbauregel `canDig()` und `pathCost()` stehen in
   `raid-config.js`.4. ~~**Ticket und Replay-Check.**~~ **Beides steht.**
   `replayRaid()` rechnet ein eingereichtes Log gegen das Ticket nach und
   `replayMatches()` vergleicht den eigenen Endzustand mit dem behaupteten —
   beides reine Domänenfunktion ohne Server, beides in der Abnahme. Und seit
   `POST /api/raid/ticket` stellt der **Server** das Ticket auch aus: Kader und
   Eintrittspunkt kommen aus seinem eigenen Stand, die Zeile liegt mit Frist in
   `raid_tickets`, und die Einreichung liest sie nach (D25) statt dem Rumpf zu
   glauben; die Zahlen des Kaders faltet der Server aus den Steinen des
   gespeicherten Dunglings (D31), ein abweichend behaupteter Wert ist eine
   Absage. Was fehlt, ist der Weg **vor** der Ausstellung — die Gegnerwahl
   (MMR) und der eingefrorene Snapshot des Verteidigers.
5. **Der Feral-Hive-Seed**, damit testbar ist, ohne echte Gegner zu brauchen.
6. ~~**`RaidCapability` am Stein, mit eigenem Kanal.**~~ **Erledigt.**
   `capability` ist das vierte Feld an `createStone()`, gewürfelt über den
   fünften Kanal `STONE_SALT.capability`; `GRABEN` ist eine Berechtigung
   und wird im Kader gefaltet, nicht addiert — ein Stein genügt, vier sind
   kein Vorteil.
7. **Erst dann die Mechanik.** Kantenwände, Rundenmodus und Wächter-Koma kommen
   zuletzt, weil Kantenwände ein zweites Objektmodell im selben Grid sind und
   das Rundenmodus ein zweites Zeitmodell neben dem einen Herzschlag der
   Sim-Uhr, der alles mit 10 Hz treibt.

**Was bereits steht:** `src/domain/raid/` trägt `raid-config.js` mit der
Ausdauerrechnung, den Grabkosten und der Grabregel, `raid-spawn-seed.js` mit dem
Einmarsch aus dem Ticket, `raid-state.js` mit der zweiten Zustandsinstanz,
`raid-terrain.js` mit dem Hartgestein des fremden Dungeons, `raid-actions.js` mit
den Aktionstypen, `raid-steps.js` mit den Übergängen und `raid-replay.js` mit dem
Replay-Check. Dazu kommt am Stein das vierte Feld `capability`. Das Gerüst ist
bewusst vor der Mechanik gebaut, weil die Zahlen sonst gegen eine Annahme
programmiert worden wären. **Die Abnahme steht auch:**
`check-raid.mjs`, `check-raid-terrain.mjs` und `check-raid-replay.mjs` prüfen es
gegen die echten Module. **Von der Mechanik steht:** gehen, graben, die
Ankunft am Hive, der Angriff mit Schaden, das Opfer, die Beute, die Extraktion
und das Wächter-Koma. **Gebaut und gemessen ist damit:** `raid-warden.js`
(Verteidigung, Koma, Zone of Control), `raid-verbs.js` (Schaden als Summe des
`atk` der Teilnehmer, D28), `raid-traverse.js` (Hive-Eintritt über die
Maschine), `raid-loot.js` (Auszahlung erst nach der Rückkehr) und die
Prüfgruppe `raid-siege`, die den ganzen Weg `ENTER … RESOLVED` fährt.
**Nicht gebaut** sind allein noch die **Kantenwände** — und der Rundenwechsel,
der bis heute vom Aufrufer kommt, weil der Raid keine Uhr hat.

**Die neuen Zahlen sind gesetzt, nicht gemessen.** `RAID_WARDEN` (drei Wächter,
24 Leben plus bis zu 8 aus dem Hash, `zoneRadius` 1) und `RAID_SIEGE`
(`hiveHp` 48, `lootEssence` 30, `sacrificeStamina` 30) stehen in
`raid-config.js`, weil es vor dieser Mechanik keinen Lauf gibt, aus dem sich
etwas ableiten ließe. Sie sind damit ausdrücklich **keine** Messwerte: die
Abnahme leitet ihre Erwartungen aus denselben Konstanten ab und schreibt keine
Zahl ab, und wer sie ändert, ändert nur diese eine Stelle. Der Blutstein hat
hier keine eigene Zahl — er kommt aus `bloodstone-loop.js`, damit es zwei
Quellen für dieselbe Beute nicht gibt.

**Ein Zirkel, der benannt gehört:** Das MMR-System verhindert Missbrauch,
braucht aber aufgezeichnete Raid-Ergebnisse und liegt damit **nach** dem ersten
funktionierenden Raid. Für die ersten Testangriffe tritt an seine Stelle die
Feral-Hive-Regel (D22).

## Was der Entwurf nicht löst

Der Umfang, der hier steht, ist ein Nebenpfad neben dem Slice, kein Feature für
den nächsten Release. Das Spiel ist bis heute ein Abbauspiel ohne Gegner; das
hier setzt zwei Spieler, einen persistenten Snapshot und eine Server-Autorität
voraus. Das ist ein eigener Bauabschnitt mit eigenem Testbedarf, und der Preis
dafür ist die Zeit, die nicht in die Kachelgeometrie geht.

Und der Spielstand fehlt bis heute. Das hier schreibt in eine Tabelle, die es
nicht gibt — der Roadmap-Punkt **Speichern** ist keine Nebensache mehr,
sondern die erste Zeile der Bauordnung.