# Raid-Entwurf: Eco-Stakes

Der Entwurf liegt hier, **bevor** Code dazu entsteht. Grund ist nicht
Ordnungsliebe: das Vorhaben berührt Vorgaben in `AGENTS.md` §8, die
ausdrücklich vom Auftraggeber gesetzt und im selben Zug revidiert wurden, und
es berührt den Untergrund, den §8 bisher auf genau eine Art festlegt. Solange
das nicht entschieden und vermerkt ist, gehört es hierhin und nicht in den
Code.

Alles Weitere zu diesem Feature steht in
[`ROADMAP.md`](ROADMAP.md). Dieses Dokument trägt die **Regeln, die
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
- **D28** **Anti-Aufkundschaffen durch Ticketbindung.** Die Vergabe des
  Tickets sperrt das Team serverseitig. Schließt der Angreifer den Tab nach
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

- **Die Stats brauchen eine Faltungsregel über mehrere Steine.** Traits haben
  eine — `stone-effects.js` faltet mit `peak()`. Für `atk`, `speed` und `grit`
  ist keine belegt; `mutation-formula.js` rechnet Form und Bild. D31 entscheidet
  die **Summe**, aber es fehlt die Funktion, die daraus *einen* Angriffspreis je
  Monster macht.
- **Der feste AP-Preis eines Angriffs ist keine Zahl.** Ebenso der
  Verteidigungswert einer Obsidianwand.

Die Zahlen gehören nach `stone-config.js` und erst **mit** der Abnahme. Sie
sollen den Bau nicht blockieren, sondern beschreiben, was gemessen wurde.

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

1. **Speichern.** Snapshot, Ticket, `raid_id`, MMR-Aufzeichnung, Riss und
   Pending brauchen eine Tabelle, die es nicht gibt. Aus einem unabhängigen
   Roadmap-Punkt wird damit zur Voraussetzung.
2. ~~**Die Ausdauer-Rechnung**, ausgehend vom Weg.~~ **Erledigt.** Sie steht im
   Regelwerk und in `raid-config.js`; die Zahlen sind gemessen, nicht gesetzt.
3. **Das Terrain-Feld neben `TILE_KIND`**, mit eigener Abbauregel und ohne
   `isEarth()` zu berühren.
4. **Ticket und Replay-Check.** Der Replay gehört in die Abnahme.
5. **Der Feral-Hive-Seed**, damit testbar ist, ohne echte Gegner zu brauchen.
6. **`RaidCapability` am Stein**, mit eigenem Kanal.
7. **Erst dann die Mechanik.** Kantenwände, Rundenmodus und Wächter-Koma kommen
   zuletzt, weil Kantenwände ein zweites Objektmodell im selben Grid sind und
   das Rundenmodus ein zweites Zeitmodell neben vier Uhren mit je bis zu 20 Hz.

**Was bereits steht:** `src/domain/raid/` trägt `raid-config.js` mit der
Ausdauerrechnung und den Grabkosten, `raid-spawn-seed.js` mit dem Einmarsch aus
dem Ticket und `raid-state.js` mit der zweiten Zustandsinstanz. Das Gerüst ist
bewusst vor der Mechanik gebaut, weil die Zahlen sonst gegen eine Annahme
programmiert worden wären. **Nicht gebaut** ist davon die Abnahme: es gibt noch
keinen `check-raid-*.mjs`, und ein ungeprüfter Replay ist eine Behauptung.

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