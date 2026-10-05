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

- [x] **Der Code zeigt auf seine Erklärung, er trägt sie nicht mehr.** Unter
      `src/` ist auf **eine** Kommentarzeile reduziert, und die ist ein
      `@doc`-Pointer. 160 Module haben jetzt je eine Spiegel-Datei unter
      `docs/daten/`; der Kommentar-Text ist dorthin gewandert, der Code
      behielt seine Zeile. Das Gate (`npm run gate -- --spiegel`, in der CI
      eingehängt) bricht bei zweiter Kommentarzeile, Pointer ohne Anker,
      totem Link, verwaister Doku, mehr als 80 Doku-Zeilen oder Drift ab —
      Quelle und Spiegel müssen im selben Änderungsbereich wandern. Die
      80-Zeilen-Grenze ist der SRP-Trigger: Reicht sie nicht, ist das Modul zu
      groß und wird gespalten, nicht die Erklärung gestaucht.
  Status: geplant
  Scope: CI
  Kategorie: Refactor
  Version: ausstehend
  Datum: ausstehend

## 0.0.24 — Bestand und Tor

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
      **Offen ist die Entscheidung**, wohin das Backend wandert (derselbe
      Node-Prozess neben dem Build, eine D1-Datenbank, oder ein Dienst) —
      `account-store.mjs` ist dafür schon plain SQL, aber die Wahl ist nicht
      getroffen. Gehört vor den Code in ein eigenes Plan-Dokument.
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
  Status: geplant
  Scope: Konto
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
