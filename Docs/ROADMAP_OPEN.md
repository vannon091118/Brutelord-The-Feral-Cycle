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
      Phasen hinter dem Einmarsch sind verhindert, nicht erreicht: Ein Angriff
      an Wächtern rechnet keinen Schaden, Opfer und Extraktion fehlen ganz,
      Wächter-Koma gibt es nicht, und die Kantenwände des Raid-Felds sind
      Kulisse. `EXTRACTING` und `RESOLVED` bleiben dadurch unerreichbar, und
      das Ticket **auszustellen** kann nur der Server — dieser Baum führt die
      Instanz aus, er vergibt sie nicht. Das ist die Grenze zwischen Client
      und Matchmaking, nicht ein Fehler im Ticket. Die Regeln und offenen
      Fragen stehen in [`RAID-PLAN.md`](RAID-PLAN.md).
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

- [ ] **Der Konto-Server fehlt im Production-Build.** Das Backend hängt als
      Vite-Plugin im Dev-Server, also gibt es in `dist/` keine `/api/login` —
      das ausgelieferte Spiel scheitert am Konto-Tor. `accountApi()` registriert
      nur `configureServer` — es gibt keinen `configurePreviewServer`-Haken,
      also fehlt die Route auch im Vorschau-Server und auf jedem statischen
      Hosting; der Client bekommt dort HTML statt JSON und meldet es jetzt mit
      einem verständlichen Satz statt mit einem stillen `Failed to fetch`.
      **Die Wahl ist getroffen** und steht mit dem Warum in
      [`BACKEND-PLAN.md`](BACKEND-PLAN.md): Adapter statt Vendor, lokal
      `node:sqlite`, am Rand D1, und ein Replay, das gemessen rund 2 ms kostet
      und die 10 ms von Cloudflare nicht annähernd erreicht. Offen bleibt nur noch
      der Ort, an dem der Worker in den Build kommt — kein Worker-Entrypoint,
      kein D1-Schema.
  Status: geplant
  Scope: Konto
  Kategorie: Bugfix
  Version: ausstehend
  Datum: ausstehend

- [ ] **Der Spielstand gehört in die Kontotabelle.** Die Konto-API hält Angriffe
      aus, aber der Spielstand lebt nur im `localStorage` des Browsers. Snapshot,
      Ticket und MMR schreiben langfristig in dieselbe Tabelle wie das Konto —
      die Spalte fehlt, und bis sie steht, wechselt der Hive den Rechner und ist
      weg. Gehört in denselben Zug wie die Backend-Entscheidung darüber.
      **Der Speicher ist gebaut:** `getState`/`putState` stehen im Vertrag, die
      Spalte `state` in der Kontotabelle, und `check-storage.mjs` belegt den
      Kreislauf gegen die echte Datei. **Offen bleibt die Schreiblast** — der
      Client speichert alle fünf Sekunden und über HTTP ist dasselbe Snapshot
      ein Vielfaches größer; es braucht eine Zusammenfassung und eine Obergrenze.
      Die Fragen stehen als offene Punkte 2 und 3 in
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

- [x] **Das Artensystem: ein Spezies-Locus schaltet vier Skelett-Grammatiken.**
      Der Mutant war bisher eine Art: derselbe L-System-Bauplan fuer jedes Genom, nur die
      Proportionen schwankten. Jetzt traegt das Genom einen zehnten, dominanten Locus — die
      Art —, und `SPECIES_GRAMMAR` haengt an jede der vier Arten ihren eigenen Bauplan.
      Humanoid baut zwei Rumpfknoten mit Armen ab dem zweiten, Daemon drei mit Armen ganz
      oben und groesserem Kopf, Insekt drei ohne Arme mit duennen langen Beinen, Spinne
      zwei Knoten mit je zwei Sprossen (`S -> F[L][L]`) und damit acht Beinen. Knotenzahl,
      Armgrenze und Regeln kommen aus der Tabelle, nicht aus dem Walker; der zaehlt nur
      Knoten und Sprossen mit, damit die zweite Sprosse eines Knotens nicht auf der ersten
      liegt. Weil ein dominanter Locus das hoechste Allel zeigt, ist die Verteilung schief —
      gemessen ueber vierzig Genome Spinne 23, Insekt 11, Humanoid 4, Daemon 2 —, und das
      liest sich richtig: der Mensch ist die reinerbige Ausnahme, das Monstroese dominiert.
      Die Artprobe in `scripts/verify/check-organic.mjs` belegt vier verschiedene Konturen
      sowie Knotenzahl und Sprossen je Seite je Art. Eine Pruefung des Iso-Pegels am Anker
      wurde dabei an die Gitterweite `ORG.cell` gebunden, weil die alte Toleranz kleiner war
      als die Zelle, mit der Marching-Squares die Kontur ueberhaupt findet; eine Gegenprobe
      mit einem verschobenen Punkt belegt, dass sie weiter beisst.
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
