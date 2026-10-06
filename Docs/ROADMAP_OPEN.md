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

- [ ] **Die Leiter bei 47,47.** Steht als `LADDER_TILE` in der Config und wird
      gerendert, sobald die Wurzeln hinkommen. Sie ist Deko mit Tiefe —
      irgendwann wird sie der Eingang. **Bestätigt und als Lücke markiert:**
      was beim Erreichen passiert, ist null Zeilen Code, und die Datei sagt es
      jetzt an sich selbst (`[FUTURE]` in
      `src/world/entrance/EntranceLadder.jsx`), damit der nächste Export-
      Durchgang sie nicht als totes Material weghaut. Sie bleibt Kulisse, bis
      Vertikalität als Task mit Verifier hier steht.
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
      **Offen bleibt der Transport über HTTP** — der Rumpfdeckel der Konto-API
      liegt bei 4096 Bytes, derselbe Stand braucht also erst einen eigenen Weg
      —, und Ticket und MMR fehlen weiterhin. Die Fragen stehen als offene
      Punkte 2 und 3 in [`BACKEND-PLAN.md`](BACKEND-PLAN.md).
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
      Seiten. **Offen bleibt die Spielbarkeit:** solange die Phase hinter
      `EXTRACTING` verhindert wird, gibt es im Spiel nichts, was Blutstein
      liefern könnte. **Korrektur an der Vorlage:** die Vorlage
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
      Quelle, Verbrauch, Deckel und Determinismus. **Offen bleibt der Ort:**
      bis Vertikalität existiert, hat der Aether keinen Ort, an dem er im Spiel
      entsteht. **Korrektur an der Vorlage:**
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
