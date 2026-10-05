# Roadmap

Pflichtdoku. Versionsgebunden, wird nach **jedem** abgeschlossenen Task im
selben Commit nachgezogen — siehe die Regel in `AGENTS.md`. Wer hier was
einträgt, verpflichtet sich, es auch zu liefern.

Die Autorität für „welche Version lebe ich gerade" ist `version.lock.json`.
Dieses Dokument hält die Absicht fest, nicht den Stand — der Stand steht im
Code, und `npm run verify` sagt dir, ob er stimmt. Die Sections hier benennen
**geplante** Versionen, nicht den aktuellen Stand; zwischen zwei geplanten
Sections können beliebig viele Patch-Bumps liegen.

Hier wird eingetragen und nichts nachgeschrieben. Wer pflegt, braucht die
anderen Dateien — aber nicht, weil hier etwas fehlte, sondern weil eine Aussage
genau einmal stehen soll:

| Frage | Datei |
| --- | --- |
| Was muss ich vor jedem Commit wissen? | [`AGENTS.md`](../AGENTS.md) |
| Wie laufen Gate, Abnahme, Version, CI? | [`WORKFLOW.md`](WORKFLOW.md) |
| Welche Regeln und Pflichten gelten? | [`GOVERNANCE.md`](GOVERNANCE.md) |
| Welche Fehler schon einmal zugeschlagen haben? | [`PITFALLS.md`](PITFALLS.md) |
| Warum steht eine Sache so und nicht anders? | [`ARCHITEKTUR.md`](ARCHITEKTUR.md) |
| Wohin baut das Spiel überhaupt? | [`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md) |

---

## 0.0.23 — Vertikalität

Der erste Baustein aus dem Nordstern
([`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md)): der Dungeon hat Etagen, und
eine Etage ist eine Funktion aus Spielerseed und Tiefe.

- [x] **Die Tiefe gehört in den Weltzustand, nicht in den Spielerseed.** Erster
      Entwurf rechnete den Spielerseed aus dem Welt-Seed zurück. Gemessen: **alle**
      Tiefen ungleich 0 kamen falsch zurück — ein LCG laeuft nur vorwaerts und hat
      keine Inverse. Der Spielerseed bleibt eine Eingabe, `createInitialGameState()`
      legt ihn ab jetzt in den Zustand, und die Tiefe wandert in `world`.
- [x] **Tiefe 0 ist die Startwelt.** Der zweite Entwurf salzte den Seed auch auf
      Tiefe 0, wodurch `FLOOR.start` eine Welt benannt haette, die der Spieler nie
      sieht: `floorSeed(p, 0)` ergab 2712521215, `createWorld()` 2712847316. Der
      Sprung ist jetzt `depth <= FLOOR.start → base`.
- [x] **Fail closed auch fuer negative Tiefen.** `canDescend()` war `depth <
      DEEPEST_FLOOR` und gab fuer `-1` `true` zurueck — eine negative Etage durfte
      "absteigen". Jetzt gilt `depth >= FLOOR.start`.
- [x] **Der Speichern-Vertrag kennt die Tiefe.** `seedWorld()` hat den Cache-Schluessel
      um die Tiefe erweitert und `isSavedShape()` verlangt sie jetzt. `SNAPSHOT_VERSION`
      steht auf 2: ein Stand aus Fassung 1 traegt keine Tiefe und wird verworfen,
      statt still eine Ebene ohne Sprungpfad zu laden.
- [x] **Die Etage ist im Spiel erreichbar.** `ACTION.FLOOR_DESCEND`, der Reducer in
      der Kette, `actions.descend` und eine `FloorChip` in der Hinweiszeile. Die
      Plakette sperrt an der Grenze, statt einen Sprung anzubieten, der nichts tut.
- [x] **Abnahme mit vier Sabotagen.** `check-verticality.mjs` (Messung) und
      `check-verticality-wiring.mjs` (Quelltext, weil Node den Sprung nicht ausfuehrt).
      Sabotiert und jeweils rot geprueft: Startwelt gebrochen, Cache-Schluessel ohne
      Tiefe, Formpruefung ohne Tiefe, `isFloorTarget` ohne Fail-closed.

## 0.0.2 — als Nächstes

Der Bau steht, der Schwarm arbeitet. Was jetzt fehlt, ist Bestand — und ein
Grund, ihn zu haben.

- [x] **Das README ist Bühne, nicht Werkzeugkasten.** Die Anleitung früher im
      README war eine Anleitung: Wie man Befehle laufen lässt, wie ein Gate
      aussieht, welche Datei was prüft. Wer das liest, liest Werkzeug. Jetzt steht
      dort, **was das Ding ist** — ein Hive, ein Geschwur, eine Kolonie — und was
      daran ernst gemeint ist. Die Anleitung bleibt, wo sie hingehört: in
      [`AGENTS.md`](../AGENTS.md) und [`Docs/`](ARCHITEKTUR.md).

- [x] **Der Wächter prüft seine Basis nicht.** `hasRef()` sollte sagen, ob eine
      Referenz existiert, und tat es nicht: `git rev-parse --verify` gibt einen
      vierzigstelligen Hex-String unaufgelöst zurück und endet mit 0. Nach dem
      Force-Push, der die History der Branches aufräumen sollte, zeigte
      `github.event.before` auf einen Commit, den es nicht mehr gab — der
      Commit-Gate brach mit `fatal: Invalid revision range` ab und meldete einen
      Absturz statt eines Befunds. Jetzt erzwingt `^{commit}` die Auflösung,
      `runCommitCheck()` überspringt eine verschwundene Basis, statt zu sterben,
      und drei Zeilen in `verify-commit-gate.mjs` sichern das ab. Eine davon
      benutzt `deadbeef`. Befund und Gegenprobe stehen in
      [`PITFALLS.md`](PITFALLS.md).

- [x] **Das Raster verschwindet: das Nachbarschafts-Byte und die Kantenwand.**
      Erdblöcke wussten nichts voneinander: Jede Silhouette wölbte sich an jeder
      Kachelgrenze nach außen, die dunkle Kulisse schien in den Rinnen durch, und
      die Welt las sich als Kachelmuster statt als Masse. Jetzt leitet eine reine
      Domänen-Lesefunktion (`edgeMask`, `hiddenMask`, `notchFlags` in
      `src/domain/world/edge-mask.js`) je Kachel ein Byte: Erde schließt an Erde,
      Freifläche öffnet die Silhouette, zur verborgenen Erde steht eine Wand. Die
      Erdform (`soilMaskBlob` in `src/world/tile-shapes.js`) läuft an verbundenen
      Seiten flach und mit Zufallsbetrag über die Grenze, sodaß sich die Naht
      unter gleichen Farben verliert; Schachbrett-Ecken schneiden eine Einwärts-
      Kerbe, damit die Kulisse dort nicht durchscheint. Die Kantenwand
      (`wallBand`, gezeichnet in `src/world/earth/EarthWall.jsx`) steht als
      Bruchfläche mit heller Abrisskante nur zur verborgenen Erde und niemals zur
      fehlenden Zelle am Weltrand — dort ist die Vignette zuständig. Der Geometrie-
      Cache (`src/world/earth/earth-geometry.js`) trägt beide Bytes im Schlüssel,
      die bestehende Begrenzung bleibt unangetastet; die Prüfung fährt dieselbe
      Form blind und mit Welt und verlangt zwei verschiedene Pfade. Verdrahtet
      sind `src/world/EarthTile.jsx`, `src/world/TileLayer.jsx`,
      `src/world/rooting/RootingVeil.jsx` (derselbe Maskenpfad für den Wurzelschleier)
      und das neue Wand-Muster `dl-wallFace` in `src/world/WorldDefs.jsx` samt
      Stufe `--color-rock-200` in `src/styles/globals.css`. Die Abnahme hängt als
      `scripts/verify/check-edge-mask.mjs` hinter `checkRooting` in
      `scripts/verify-slice.mjs` und `scripts/verify/index.mjs`: Miniwelt-Regeln
      (Seiten, Kerben, Weltrand), Wand-Invarianten über die echte Welt,
      Geometrie-Verdrahtung. Mit derselben Hand fährt die Parallel-Session ihre
      Bühne mit: szenarienfeste Zustände unter `tools/tests/state/`, Bühnen- und
      Metrik-Arbeiten in `scripts/ci-gate.mjs`, `scripts/lib/source-metrics.mjs`,
      `tools/tests/lib/config.mjs`, `tools/tests/lib/fixture.mjs`, den Spielstand
      in `src/state/snapshot.js` und den Beispielumgebungsvertrag
      `.env.example`. **Phase 2 ist gebaut**, siehe unten.

- [ ] **Das Raid-Feature: Entwurf steht, Bau nicht.** Angriffe zwischen zwei
      Spielern, Ausdauer als Einsatz statt Timer, ein rundenbasiertes
      Gameplay gegen den gefrorenen Snapshot des Gegners. Der Entwurf liegt
      vollständig in [`RAID-PLAN.md`](RAID-PLAN.md) — mit den Entscheidungen,
      die gefallen sind, und den offenen Fragen. **Die beiden Bauaufträge von
      damals sind entschieden.** Das Bedrohungsmodell ist benannt: gefälschtes
      Ergebnis, aufgeblähte eigene Werte, beschleunigter Takt, manipulierte
      Pending-Beute — gegen alle vier wird ein **RaidTicket** verwendet, das
      Kader, Start-Ausdauer, Eintrittspunkt und gegnerischen Snapshot
      einfriert und die Einreichung nur gegenReplay akzeptiert. Und das
      Kaltstartproblem ist weg, weil das **Ressourcen-Monopol aufgehoben** ist:
      Stein und Obsidian sind in jeder Welt vorhanden, aber begrenzt und an
      ein Progressions-Gate gebunden — die Fähigkeit **Graben** aus dem
      Mutationssystem. **Neu und dringlicher:** die Ausdauer ist jetzt die
      *einzige* Schranke des Einmarsches, und ihre Rechnung steht noch aus.
      Dazu kommt, dass **Speichern** zur Voraussetzung geworden ist: Snapshot,
      Ticket und MMR schreiben in eine Tabelle, die es nicht gibt. Der
      geschlossene Pull Request daraus (`#2`) war an beiden Punkten falsch und
      ist mit Begründung geschlossen; §8 in `AGENTS.md` ist im selben Zug an
      die zwei Steinsorten angepasst.
      — [x] **Das Gerüst steht, die Rechnung ist gemessen.**
      `src/domain/raid/` trägt `raid-config.js` mit Ausdauerpool und Grabkosten,
      `raid-spawn-seed.js` mit dem Einmarsch aus dem Ticket und `raid-state.js`
      mit der zweiten Zustandsinstanz. Zwei Annahmen haben nicht gehalten und
      sind gegen die Config gerechnet worden: Der Einmarsch gräbt orthogonal,
      also sind es **64** Felder von der fernen Ecke bis zum Hive und nicht 44 —
      und `grit` steht ausschließlich auf Legenden-Steinen, weshalb der Pool
      über den **Anteil** rechnet und nicht über die Roheit, sonst wäre die
      Verteilung über ein Team binär statt stufenlos. Der Einmarschspunkt war
      zweimal falsch gerechnet, bis die Kandidatenliste am Raster geklemmt war;
      über 600 Tickets sind es jetzt 561 verschiedene Punkte, alle reproduzierbar.
      Messungen und Begründung stehen in [`ARCHITEKTUR.md`](ARCHITEKTUR.md),
      Kapitel *Der Eco-Stakes-Raid*.
      — [x] **Und damit die Abnahme.** `scripts/verify/check-raid.mjs` prüft
      das Gerüst gegen die echten Module statt gegen sich selbst: die Ausdauer
      folgt dem `grit` des Kaders und der `RAID_CONFIG` — 64 für ein nacktes
      Team, 180 am Ende der Skala —; `spend()` ist fail-closed und lässt den
      Zustand samt Log unangetastet; `stateHashInput()` hasht genau `at`,
      `stamina`, `phase` und `heroes[id+ap]`, nicht das Log, und der Gegenbeweis
      läuft mit: Ausdauer, Phase, Standort und AP müssen es hineinverändern;
      und über 600 Ticket-Seeds ist der Einmarschspunkt zweimal gleich, über
      eine frisch erzeugte Welt genauso, während ein anderer Verteidiger ihn
      verschiebt. **Die Abnahme hat beim ersten Lauf einen echten Fehler
      gefunden:** `createRaidState()` nahm einen `config`-Parameter an und gab
      ihn nicht an `teamStamina()` weiter — eine andere Konfiguration änderte an
      der Ausdauer nichts, der Parameter war eine Fassade. Der Übergabeweg ist
      verdrahtet, und die Prüfung, die das verhindert, heißt so. Gegenprobe zum
      neuen Modul: `spend()` ohne Fail-closed und ein Hash mit Log lassen genau
      vier Prüfungen um. **Verdrahtet** ist sie an `checkMining()`, weil
      `verify-slice.mjs` mit sieben von sieben erlaubten Imports an der
      Importgrenze steht und der Raid genau dort forkt: die
      Terrain-Klassifikation ist geteilt, die Kostenlogik nicht.
      — [x] **Die Browser-Abnahme läuft, auch gegen einen verwalteten Server.**
      `npm run verify:browser` startete bisher aus dem Grund nicht, den niemand
      nachgesehen hat: Chromium war installiert, aber 24 Systembibliotheben
      fehlten. Mit `npx playwright install-deps chromium` läuft sie und meldet
      **20 von 20**. Für Umgebungen mit verwaltetem Dev-Server nimmt
      `DL_BROWSER_URL` den eigenen Server aus dem Spiel; ohne die Variable bleibt
      der eigene Pfad der Default. Befund und Gegenprobe stehen in
      [`PITFALLS.md`](PITFALLS.md). — [x] **Und sie ist jetzt Standard.**
      `npm run verify` prüft zum Schluss **selbst**, dass das Spiel startet:
      dieselbe Browser-Stufe, über `checkStartup()`, im selben Lauf und mit
      einem gemeinsamen Report statt eines zweiten. Das ist die Lücke, die
      dieser Punkt ursprünglich meinte — ein Drittel des Ablaufs war ungetestet,
      weil der Test im Node lief und der Ablauf im Browser. `ci.yml` installiert
      den Browser vorher, damit der Lauf dort nicht stillschweigend ausfällt.
      — [x] **Die Gruppe hat einen Cursor, alle drei Traits sind übersetzt.**
      Der Einmarsch wird **halbautomatisch**: `at` gehört der Gruppe, Helden
      tragen keine Position, ein Befehl setzt einen Pfad (Dijkstra über
      Ausdauer, nicht über Schritte) und im Idle erkundet die Gruppe die
      Frontlinie von selbst, ohne eine Aktion auszuführen; ein unerfüllbarer
      Befehl fällt auf die Erkundung zurück, und die Schritte bleiben die
      Verbote des Replays, damit beide dieselbe Sprache reden. **Alle drei
      Traits** sind in der Währung des Raids gerechnet: Gierig verdoppelt die
      Beute, der Motivator gibt dem ganzen Team ein Viertel mehr AP, und der
      Schleimige zahlt das Doppelte für jedes Grabfeld an seinem eigenen Tunnel —
      dieser Preis kommt jetzt aus **derselben** Funktion wie die Pfadplanung,
      damit Plan und Schritt nicht zwei Preise nennen. **Das Graben-Tor bleibt,
      wie D2 es sagt:** Erde ist immer offen, Hartgestein nur mit der Fähigkeit
      aus den Mutationen, und die gilt in Basis und Raid gleich. Zwei Zahlen
      sind gegeneinander gerechnet (`entryRadius` gegen `baseStamina`), und die
      Kandidatenliste trägt eine Fassungsmarke, weil ihre Reihenfolge Teil des
      Replay-Formats ist. **Noch nicht gebaut** ist der Schaden eines Angriffs
      an Wächtern.
      — [x] **Das Terrainfeld und die Berechtigung.** `TILE_TERRAIN` steht in
      `tile.js` **neben** `TILE_KIND` und nicht darin, `terrainOf()` lässt
      `isEarth()` unberührt, und §8 hält: über alle 4.096 Kacheln der Heimat
      führt kein einziges Hartgestein. Das Vorkommen erzeugt `raid-terrain.js`
      mit eigener Hash-Instanz — Stein überall, Obsidian nur im Umkreis von
      sechs Feldern um den Hive, weil er dessen Schale ist. Und am Stein steht
      jetzt das vierte Feld: `capability`, gewürfelt über den fünften Kanal
      `STONE_SALT.capability`, damit die Fähigkeit nicht am Trait hängt.
      **Die Traits blieben unangetastet, und das ist die Entscheidung, nicht der
      Zufall:** `SLIMY`, `MOTIVATOR` und `GREEDY` hängen an `jobTrip()` und an
      Arbeitstakten, die es in der Raid-Instanz nicht gibt; sie sind
      entitätsgebundener Charakter, und der Raid führt eine Zahleninstanz, kein
      Objekt. Der Kader reist deshalb mit genau einem Feld daraus — `dig` — und
      die Abnahme prüft, dass der Raid-Held kein weiteres bekommt.
      **Und die offene Rechnung ist geschlossen:** der längste Einmarschweg ist
      60 Felder, nicht 64, also bleiben bei reiner Erde vier Ausdauer übrig —
      ein Steinblock im Pfad kostet 59 + 6 = **65** und reißt das Budget.
      `canDig()` und `pathCost()` machen daraus die Regel: ohne `GRABEN` ist
      Hartgestein zu, mit `GRABEN` zahlt der Kader 6 oder 12. Das
      Nackte-Team-Versprechen gilt damit für eine reine Erdreich-Karte, und die
      Basis-Ausdauer ist als das ausgewiesen, was sie ist: eine Zusage über die
      Kartenart, nicht über die Welt. Gemessen: 18,8 Prozent Stein gegen 18
      konfiguriert, 113 von 400 Steinen mit `GRABEN`, 23 davon **mit** Trait —
      die beiden Kanäle sind unabhängig, wie D30 verlangt.
      Gegenprobe: `canDig()` ohne die Berechtigung und ein `terrainAt()`, das
      immer Erde liefert, lassen fünf Prüfungen um. Dabei fiel eine eigene
      Fehlzusage auf: „Obsidian liegt nur am Hive" war bei null Blöcken
      vakuum-wahr und damit ein grünes Nichts — jetzt verlangt sie, dass
      welche da sind.
      — [x] **Der Replay-Check, und die Mechanik, die er prüft.** Der Plan
      stellt den Replay ausdrücklich vor die Mechanik, weil ein Replay ohne
      Mechanik nichts nachrechnet — also standen `raid-actions.js`,
      `raid-steps.js` und `raid-replay.js` am Ende doch vor der Tür.
      Gehen ist gratis und nur über bekanntes Gelände, Graben kostet den
      Terrainpreis und braucht für Hartgestein die Berechtigung, und alles
      andere bleibt wirkungslos. `replayMatches()` rechnet das eingereichte
      Log gegen das Ticket nach und vergleicht den eigenen Endzustand mit dem
      behaupteten: aufgeblähte Ausdauer, versetztes Team, behaupteter Sieg und
      geleerte AP kommen alle durch dasselbe Loch wieder heraus, ebenso ein
      gekürztes Log und ein fremdes Ticket. **Zwei Fehler hat der Bau selbst
      gefunden, beide in der Mechanik und nicht im Test:** Der Hive war
      **unerreichbar** — graben ging nicht, weil er kein Erdreich ist, gehen
      ging nicht, weil er kein bekanntes Gelände ist; er wird betreten, nicht
      ausgegraben (D34). Und **Bewegungen landeten nicht im Log** — der
      Client konnte behaupten, gelaufen zu sein, ohne dass es aufschrieb.
      Beides fiel nur auf, weil die Abnahme den echten Einmarsch bis zum Hive
      fährt statt eine Zustandskopie zu vergleichen. Ein dritter Fehlschlag
      war der Plan selbst in der Abnahme: ein nacktes Team kommt über diese
      Karte nicht durch, weil ein Steinblock das Budget reißt. Genau D33,
      und es gehört in den Test statt in eine Fußnote.
      Gegenprobe: eine `replayMatches()`, die nur die Position vergleicht, und
      ein `dig()` ohne Berechtigungsprüfung lassen genau zwei Prüfungen um.
      **Weiterhin nicht gebaut:** Angriff, Opfer, Extraktion, Wächter-Koma und
      Kantenwände. `EXTRACTING` und `RESOLVED` werden heute verhindert, nicht
      erreicht — und das Ticket **auszustellen** kann nur der Server, dieser
      Baum führt die Instanz aus, er vergibt sie nicht.
- [x] **Eine Abnahme für den Browser.** Die Onboarding-Kette ist jetzt geprüft,
      die Darstellung halb, die Browser-Uhr gar nicht: `scripts/` führt
      `use-schedule-runner.js` nie aus, weil dort kein Browser läuft. Damit ist
      ein Drittel des Ablaufs ungetestet — der Abbau-Takt im echten Browser ist
      derselbe Code wie im Test, aber nur der Test wird geprüft. Ein Browserlauf
      wäre Playwright oder etwas Gleichwertiges; Playwright ist installiert.
      — [x] halb: sichtbares Chrome-Fenster mit Element-Marker unter
      `tools/preview/` steht. Es ist noch kein Urteil, nur ein Werkzeug: es
      startet den Dev-Server-Tab, hält den Marker über Reloads am Leben,
      liefert Selector und Rechteck für markierte Elemente und schreibt
      Screenshots. Es gibt inzwischen eine Mark-Liste mit Kommentarfeld
      und einen Senden-Knopf, der die Auswahl in die Zwischenablage und in
      eine Inbox legt, und der Supervisor haelt das Fenster offen, ohne es
      nach jedem Schliessen sofort neu aufzureissen. Was fehlt, ist die
      eigentliche Abnahme — eine Liste von
      Erwartungen, die der Durchlauf einhält oder nicht.
      — [x] fertig: `npm run verify:browser` startet den echten Dev-Server als
      Kindprozess, pinnt eine Sitzung und einen Seed und fährt die Kette unter
      `page.clock` ab — also mit angehaltener Uhr, nicht mit Warten. Zwei Akte:
      das Konto-Tor ohne Sitzung, dann das Onboarding in elf Schritten mit
      Soll-Zustand, Zeitbudget und Bild pro Station. Abnahme ist hier ein
      Urteil, kein Werkzeug: `scripts/browser/judge.mjs` meldet jeder
      Abweichung Zeit und gelesenen Wert, und eine Station, die sich nicht
      ausführen lässt, ist ein Fehlschlag, kein stiller Sprung. Zwanzig
      Prüfungen, grün gegen Chromium 1.63; die Bilder liegen in `Docs/shots/`.
      Der Lauf ist nicht im Gate — er braucht einen Browser und einen Port —
      deshalb `npm run verify` für CI und `verify:browser` für Hand und Auge.
- [x] **Der szenariale Browserlauf mit einfrierbaren Zuständen.** Acht Fälle
      unter `tools/tests/`, die das Spiel mit der **echten Uhr** und der echten
      Konto-API fahren: `npm run verify:tests`. Das Fenster ist **sichtbar**,
      `DL_HEADLESS=1` schaltet es ab, und ein roter Lauf **hält das Fenster
      offen, bis Enter gedrückt wird** — ein Urteil, das man nicht sehen kann,
      ist kein Urteil. Jeder Fall kann stattdessen aus einem **eingefrorenen
      Zustand** unter `tools/tests/state/` starten (`DL_FROM=fixtures`):
      `restoreState()` legt ihn in genau die Form, die `saveSnapshot()`
      schreibt, und lädt neu — also durch **dieselbe Tür, die auch ein Spieler
      nach einer Pause benutzt**. Kein Testzweig im Reducer, keine Testaktion im
      Spiel. Der Live-Lauf erzeugt die Zustände, aus denen die Fixtures bestehen;
      fehlt einer, bricht der Lauf ab, statt still zu überspringen.
      Der Lauf hat beim ersten Mal zwei echte Fehler im Spiel gefunden, die kein
      Node-Test sehen konnte: der **Dungling schluckte den Klick auf den
      Bauplatz**, den er gerade bewacht, und die **Bremse des Kontos** hing am
      festen Namen, sodass der zweite Lauf anders ausging als der erste.
      — [x] **Eine Schlange, ein Browser.** Zwei Agenten, die gleichzeitig
      `npm run verify:tests` starten, bekommen je eine **Platznummer**
      (`tools/tests/lib/queue.mjs`); wer die niedrigere Nummer trägt, testet
      zuerst, der andere wartet und sieht, wer vor ihm ist. Ein toter Prozess
      gibt seinen Platz automatisch frei, sonst blockiert er die Schlange für
      immer. Beides — sichtbar wie unsichtbar — läuft über **denselben
      Browserprozess**: `tools/tests/browser-host.mjs` startet einmal einen
      Browser**server** und gibt seine Adresse weiter, jeder Lauf hängt sich per
      Websocket an. Kein Lauf startet einen zweiten Chrome. Braucht ein Lauf den
      anderen Modus, bittet er den Wirt um Wechsel; die Schlange garantiert
      dabei, dass gerade niemand testet. Stirbt dem Wirt der Browser-Driver,
      behauptet er nicht weiter, er laufe, sondern geht mit.
      — [x] **Die Caps gelten jetzt auch für `tools/`.** `TREE_ROOTS` im Gate
      ist um `tools` gewachsen. Dafür musste der Scanner lernen, dass ein
      **verdeckter Ordner kein Quelltext ist**: `.preview-profile/` enthielt
      70 Verstöße aus einer installierten Chrome-Erweiterung, `.venv/` wäre
      derselbe Fall wie in [`PITFALLS.md`](PITFALLS.md). Und `marker.js` unter
      `tools/preview/` musste in der Tat zerlegt werden — 353 Zeilen, zwei
      Funktionen mit je 41.
- [x] **Speichern.** Der Hive überlebt das Reload. Der Zustand geht alle fünf
      Sekunden in den `localStorage` und beim Verlassen der Seite noch einmal;
      `initialGameState()` holt ihn zurück, bevor der Reducer den ersten Zug
      sieht. **Der Spielstand schreibt nicht die Welt, sondern ihre Änderungen:**
      das Raster ist eine Funktion des Seeds, also wandern nur die Kacheln mit,
      die vom frisch abgeleiteten Zustand abweichen, plus `world.deposits`.
      Gemessen an einem frischen Zustand: **783,6 KB → 18,1 KB**, Roundtrip
      byte-identisch. Gepackt wird gegen den Seed-Zustand und **nicht** nach
      Sichtbarkeit gefiltert — 333 Vorrats-Zellen liegen im Raster, davon sind
      die meisten noch verborgen und ein Sichtbarkeitsfilter löscht sie. Die
      Paketform kommt in [`PITFALLS.md`](PITFALLS.md). Vor dem Speichern kommen
      jetzt **12 ms** statt 74 ms: die abgeleitete Welt wird gehalten statt je
      Packvorgang neu gebaut, und der Vergleich läuft feldweise statt über
      `JSON.stringify`.
- [ ] **Die Leiter bei 47,47.** Steht als `LADDER_TILE` in der Config und wird
      gerendert, sobald die Wurzeln hinkommen. Sie ist Deko mit Tiefe — irgendwann
      wird sie der Eingang. **Bestätigt und als Lücke markiert:** was beim
      Erreichen passiert, ist null Zeilen Code, und die Datei sagt es jetzt an
      sich selbst (`[FUTURE]` in `src/world/entrance/EntranceLadder.jsx`), damit
      der nächste Export-Durchgang sie nicht als totes Material weghaut. Sie
      bleibt Kulisse, bis Vertikalität als Task mit Verifier hier steht.
- [x] **Phase 2 der Kantenwand: der Treffer fühlt sich an.** Drei Bewegungen,
      alle am **Abbau-Tick** und nicht an der Uhr: der bearbeitete Erdblock
      federt zurück (`dl-hit-punch` auf der Masse in `EarthTile.jsx`, über einen
      `key` je Schritt, damit die Animation wirklich neu startet und nicht
      einmal läuft), die Kamera zuckt (`dl-camera-kick`), und die Erdkrümel
      fliegen weiter aus `MiningParticles.jsx` — die waren schon am Tick
      verdrahtet, es fehlte nur der Rest. **Die Kamera-Hülle ist eine eigene
      Ebene über dem `svg`, nicht der `viewBox`:** die Animation überschreibt
      sonst das Inline-`transform` des Maßstabs, und am `viewBox` wanderte das
      Kontextmenü mit. Zwei Fehler hat der Bau selbst gefunden, beide im Bild
      und nicht im Zustand: die Hülle trug zuerst `pointer-events: none` und
      schluckte damit den Klick auf den Bauplatz — derselbe Fehler wie bei den
      Augen des Dunglings —, und `key` im Props-Spread erzeugte eine
      React-Warnung. **Die Abnahme ist `scripts/verify/check-hit-juice.mjs`:**
      der Ruck hängt am Tick, wandert mit, verstummt nach dem Abbau und
      verschiebt den Ausschnitt nicht; und weil ein Node-Test keine Animation
      sieht, liest sie zusätzlich den Quelltext und verlangt Klasse, Schritt-Key
      und beide `@keyframes`. Gegenproben gelaufen: `working`-Zweig entfernt
      und `key` auf konstant gesetzt — beide fallen um, während `npm run build`
      in beiden Fällen grün bleibt.
- [x] **Die abgeschriebene `35` war nicht die Krankheit.** `PITFALLS.md` führt
      sie als Literal in `check-mining-progress.mjs` — gemessen stand dort keine,
      sondern eine Ableitung aus der Config. Der echte Fehler war der andere
      Eintrag derselben Datei: die Erwartung kam aus derselben Funktion, gegen
      die geprüft wurde. Jetzt steht beides: die Ableitung als Erwartung **und**
      eine Messung, dass `totalMiningTicks()` denselben Wert liefert.
- [x] **Die Traits wirken auf den Arbeitstakt.** Gierig verweigert Bauaufträge
      und verdoppelt die getragene Essenz, Motivator beschleunigt alles in
      dreifeldrigem Umkreis, Schleimig verlangsamt jeden auf seiner Grundfläche.
      `stone-effects.js` faltet die verbauten Steine zu einem Bündel,
      `work-tick.js` fragt es je Einheit ab. `check-traits.mjs` misst die
      Takte bis zum Essenz-Popup mit dem echten Reducer — nicht an einem
      Konfigurationsliteral, das sich selbst vergleicht.
- [x] **Die Hive-Fläche aus der Config ableiten.** `check-start.mjs` prüfte
      „exakt vier Hive-Tiles" als Literal `4`. Die Erwartung kommt jetzt aus
      `world.hiveSize`; wer `HIVE_SIZE` in `world-config.js` vergrößert, muss
      die Prüfung nicht mehr mitziehen, sonst prüft sie nichts mehr. Gegenprobe
      gelaufen: mit hartkodiertem Raster im `grid.js` und `HIVE_SIZE` auf 3 × 2
      fällt genau diese eine Prüfung rot.
- [x] **Verborgene Essenz-Vorräte und eine Hive-Ökonomie.** Unter der Erde
      liegen Cluster aus ein bis drei Feldern mit je höchstens hundert Essenz,
      stets isoliert; spürbar wird ein Vorrat nur, wenn die Wurzeln ein
      Nachbarfeld einnehmen, offen erst, wenn der Abbau sein eigenes Feld
      erreicht. **Cluster sind ein Schlag, kein fließender Vorrat:** der Pool
      folgt dem Grabfortschritt und ist im letzten Takt leer, damit das
      Todessignal überhaupt erreichbar ist. Die vier Verhaltensweisen und drei
      Sättigungsstufen sind gezeichnet, `lastHarvest` wird vom echten Reducer
      gesetzt und über `check-deposit-flow.mjs` geprüft. **Die zweite
      Entscheidung ist gefallen: der Preis fällt auf alle Erde, nicht nur auf
      Vorratsfelder.** Jeder abgearbeitete Erdblock kostet genau eine Essenz,
      und bei null Essenz wird der Auftrag abgelehnt — `canAffordMining()` in
      `src/domain/actions/mining.js` ist die einzige Stelle, die das entscheidet.
      Der Hive presst passiv eine Essenz je zehn Sekunden, gedeckelt auf
      fünfundzwanzig für das ganze Spiel; diese Obergrenze macht ihn zum Puffer
      und zum Endgame ausgeschlossen. Der Startvorrat ist entsprechend
      `COST.extractor + 6 * miningCost`, damit der Startraum bezahlbar bleibt und
      danach genau ein Extraktor übrig ist. Beides prüft
      `check-economy.mjs` gegen den echten Reducer. Beim Speichern gehört
      `deposit` nur auf die Felder, die wirklich eins haben.
- [x] **Der Brutlord tut etwas.** Er wird gebaut, er kostet, er wartet — und er ist
      die Senke für einen Vorrat, den erst das System darüber erzeugt.
      **Ein Stein kostet vier Essenz und wird aus einem beim Kauf erzeugten
      Seed gewürfelt — kein `Math.random()`, damit Neuladen kein Losgriff ist
      und die Prüfung reproduzierbar bleibt.** Der Hash dafür lebt in
      `src/domain/brutelord/stone-seed.js` und ist absichtlich eine eigene
      Instanz neben `tileSeed`: die Schichtgrenze wiegt hier schwerer als
      Wiederverwendung. Seltenheit, Fähigkeiten und Trait fallen alle aus diesem
      Seed; der Pity-Timer zählt Fehlschläge, hebt die Legende-Chance unsichtbar
      an und garantiert sie nach dreißig. **Die Optik folgt der Formel
      Stein-Seed plus Slot:** derselbe Stein in den Armen wird zur Faust, im
      Bein zum Schneckenfuß, bei identischem Effekt und identischen Werten. Der
      Gegenpol drückt die schwächeren Stellen zurück, damit das Monster lesbar
      bleibt. Das Labor öffnet sich am fertigen Brutlord, das Inventar maskiert
      jeden unverbauten Stein als `???` und gibt die Seltenheit nur über die
      Farbe preis. **Erschaffen und Zurückentwickeln sind verdrahtet:**
      `MUTANT_CREATED` schmilzt die Steine des Labors in den nächsten freien
      Dungling, `MUTANT_REVERTED` löst sie wieder und zahlt die Hälfte der
      Investition zurück, nach dem ersten Kampf-EP achtzig Prozent.
      `check-mutant.mjs` fährt das über den echten Reducer, `check-traits.mjs`
      misst die Wirkung im Takt statt an der Konfiguration. Beim Zeichnen ist
      eine Lücke geblieben und wieder gefüllt: die Beinform `snailfoot`, die die
      Formel als erstes liefert, hatte keine Zeichnung — ein Stein im Bein war
      unsichtbar. Jetzt hat jede der zwanzig Formen genau eine.
- [x] **Konto und Spielerseed.** Registrierung mit Name und Passwort, daraus
      entsteht ein Seed, aus dem Seed die Welt — jeder bekommt eine eigene.
      **Passwörter werden nie gespeichert**, sondern mit scrypt und eigenem Salz
      pro Konto gestreut; ein einziger Aufruf liefert Prüfsumme und Seed. Der
      Seed wird bei jeder Anmeldung neu abgeleitet, also gilt: gleiche
      Zugangsdaten, gleiche Welt, auch nach dem Reload. Der Seed verändert die
      Kontur der Höhle (39 bis 52 sichtbare Felder statt immer 56) und die
      ganze Vorratskarte. `worldSeed()` ist die einzige Tür vom Hex zur Zahl,
      und das ist keine Formalie: als Zeichenkette eingereicht wird ein Seed aus
      Buchstaben zu NaN und damit zu null, während ein Seed aus reinen Ziffern
      zu einer Riesenzahl wird — vor dieser Tür teilten sich alle Buchstaben-
      Seeds eine Welt. Aus demselben Grund nimmt das Wackeln nicht das niedrigste
      Hash-Bit; das ist linear im Seed und liefert zwei Formen statt 24.
      Das Backend ist ein Vite-Plugin mit `node:sqlite` — kein zweiter Prozess,
      keine neue Abhängigkeit. `npm run purge` löscht `.data/`, und `verify`
      arbeitet in einem eigenen Temporärverzeichnis, fasst die
      Entwicklungsdatenbank also nicht an. Sichtbar geprüft: fünf Konten über das
      Formular angelegt, fünf Seeds, fünf verschiedene Startbilder (45 bis 52
      Erdfelder), Abmelden und Anmelden liefert denselben Seed zurück.
      **Offen bleibt der Spielstand** — der gehört als Spalte in dieselbe
      Tabelle, sobald er drankommt.
- [x] **Die Konto-API hält Angriffe aus.** Sie war gewachsen, ohne je einen
      Angreifer gesehen zu haben. **Bremse:** Fehlversuche je Name und Herkunft
      zählen in einem gleitenden Fenster, ab fünf Versuchen ist die Tür eine
      Minute zu (429 statt 401) — vorher hat *ein* Fehlklick das Konto gesperrt,
      weil der Zähler lief, die Schranke aber schon beim ersten Eintrag zuschnappte.
      **Keine Namensaufklärung:** ein unbekannter Name lief ohne scrypt zurück und
      verriet über die Antwortzeit, ob es das Konto gibt; jetzt laufen beide Wege
      durch denselben Hash und geben denselben Text. **Obergrenzen:**
      `passwordMax` gilt auch beim Anmelden, und der Rumpf wird nach Bytes
      gezählt — nach Zeichen passiert eine Mehrbyte-Schrift das Limit, und die
      Antwort 413 kam gar nicht erst heraus, weil `request.destroy()` die
      Verbindung vor dem Flush schloss. **Herkunft und Antwort:** `Origin` muss
      zum `Host` passen, jede Antwort trägt `nosniff`, `DENY`, `no-referrer` und
      `no-store`, und ein Serverfehler landet als `console.error` auf der Konsole
      statt als Meldung im Spielerfenster. **Sitzung:** `localStorage` prüft den
      Seed jetzt gegen genau 16 Hex-Ziffern und schreibt nur Identität, nicht
      Fremdfelder — ein eingeschleuster Eintrag mit einem beliebigen Objekt als
      Seed kam vorher bis in die Weltberechnung. **Und zwei Werkzeugschranken:**
      `npm run purge` verweigert das rekursive Löschen von Wurzel, Home und
      Projektverzeichnis, und der Versions-Bump läuft nur noch auf Pushes nach
      `main` — auf einem Pull Request hat er denselben `version.lock.json`
      konkurrierend zu beiden Zweigen geschrieben.      Messbar in `check-account-brake.mjs` und `check-account-http.mjs`;
      Begründung in [`ARCHITEKTUR.md`](ARCHITEKTUR.md), die Fehlerbilder in
      [`PITFALLS.md`](PITFALLS.md).
- [ ] **Der Konto-Server fehlt im Production-Build.** Das Backend hängt als
      Vite-Plugin im Dev-Server, also gibt es in `dist/` keine `/api/login` —
      das ausgelieferte Spiel scheitert am Konto-Tor. `accountApi()` registriert
      nur `configureServer` — es gibt keinen `configurePreviewServer`-Haken, also
      fehlt die Route auch im Vorschau-Server und auf jedem statischen Hosting;
      der Client bekommt dort HTML statt JSON und meldet es jetzt mit einem
      verständlichen Satz statt mit einem stillen `Failed to fetch`. **Offen ist
      die Entscheidung**, wohin das Backend wandert (derselbe Node-Prozess neben
      dem Build, eine D1-Datenbank, oder ein Dienst) — `account-store.mjs` ist
      dafür schon plain SQL, aber die Wahl ist nicht getroffen. Gehört vor den
      Code in ein eigenes Plan-Dokument.
- [x] **Die Render-Kosten.** Vier Uhren ticken bis zu 20-mal pro Sekunde, und
      jeder Takt zog vorher das ganze 4.096-Kacheln-Raster durch die
      Ableitung. **Der eigentliche Brocken: `world.tiles` war ein Objekt mit
      4.096 String-Schlüsseln.** `{ ...world.tiles }` kostete 6,7 ms, weil V8
      so viele Schlüssel in den Wörterbuchmodus schickt und dessen Kopieren ein
      generischer Durchlauf ist; `tiles.slice()` kostet 24 µs, Faktor 273. Das
      Raster ist jetzt ein dichtes Array mit Index `y * width + x`, `cellIndex()`
      ist die einzige Stelle, die aus einer Id einen Platz macht, und `tileAt()`
      liefert dieselbe Kachel über Koordinaten, damit `touchesUsableSpace()`
      nicht vier Id-Strings baut, die `getTile()` sofort wieder zerlegt.
      Dazu: Ausschnitt koordinatenweise statt Raster filtern, `applyTiles()`
      bündelt mehrere Kacheln in ein Streuen, `earthGeometry()` cached nach
      Koordinate, Größe und Zustand, Kopie nur bei Kacheln mit Vorrat. Boot
      258 → 9,7 ms, Rooting-Takt 4,1 ms → 0,039 ms, Ableitung pro Render
      16,2 → 1,06 ms, Long Tasks 16 mit maximal 97 ms → 4 mit maximal 56 ms.
      Ohne Bildänderung: 58 Zustände über den ganzen Ablauf liefern zwischen
      Objekt- und Array-Raster byteweise dieselben 4.096 Kacheln, Frontier,
      Vorräte, Bauten und Dunglinge, dazu die unveränderte Abnahme. Die
      Einzelheiten und die Messmethode stehen in `ARCHITEKTUR.md`, Kapitel
      *Was ein Render kostet*.
- [x] **Der Versions-Bot hält sich an die Commit-Policy.** Sein Body war eine
      einzige Zeile, in der das VANNON-Label mitten im Text stand — das Gate
      zählte deshalb null Wörter und meldete das fehlende Label am Ende.
      Dazu nannte er die Code-Dateien, die den Bump ausgelöst hatten, statt der
      vier Spiegeldateien, die er selbst ändert. Beide Fehler fielen nie auf,
      weil Bot-Commits mit `GITHUB_TOKEN` keine CI auslösen. Jetzt steht das
      Label allein in einer Zeile, `MIRRORS` nennt die vier Dateien, und
      `scripts/verify/check-workflow.mjs` prüft bei jedem Lauf, dass das so
      bleibt. Gegenprobe: der neue Check gegen die alte Workflow-Datei lässt
      alle drei Prüfungen rot werden. Der Bot committet weiterhin ohne
      Signatur — eine behauptete Identität bleibt nicht prüfbar.
- [x] **Vier ungenutzte Exporte fallen weg.** `footprintIds()` und
      `isDelivered()` in `building.js`, `smoothClosedPath()` in
      `tile-shapes.js` und `isDiscovered()` in `lab-state.js` trugen alle das
      Schluesselwort `export` und wurden trotzdem nur in ihrer eigenen Datei
      benutzt. Bei den ersten drei habe ich das nachgemessen, es sind jeweils
      zwei bis drei interne Aufrufe und null externe. **Bei der vierten war
      der Pull Request kaputt**, und zwar an der Hälfte, die man beim Lesen
      übersieht: `isDiscovered()` wurde privat gemacht, gleichzeitig importierte
      die Prüfung `stoneOf` — und `stoneOf` ist gar nicht exportiert, es ist eine
      private Funktion auf Zeile 13. Der Build wäre mit `MISSING_EXPORT`
      gestorben. Ich habe es so gelöst, dass die Prüfung den Feldwert selbst
      liest statt einer Funktion: der Zustand `discovered` ist das, was
      geprüft werden soll, und das ist ohnehin die aussagestärkere Fassung.
      Gegenprobe an beiden Enden: lässt `isDiscovered()` das Flag konstant
      `false`, fällt „Ein verbauter Stein gilt als entdeckt" um, und setzt
      `withSlot()` beim Einbauen auf `false`, fällt dieselbe Prüfung um. Beim
      ersten Versuch hatte ich in `lab-state.js` sabotiert statt in
      `stone-roll.js`, wo `withSlot()` tatsächlich steht — die Prüfung blieb
      grün, weil ich die falsche Datei getroffen hatte, nicht weil sie nichts
      fand. Genau die Sorte Test, die sich grün meldet und nichts beweist.

- [x] **Der große Durchgang: 190 Dateien, jede Zeile.** Der Auftrag war, nicht
      nur einzelne Funde zu beheben, sondern zu fragen, was ein Export
      überhaupt noch trägt. Drei Maschinen haben geantwortet: ein
      Import-Graph ab `src/main.jsx`, ein Export-Zähler über alle 458 Exporte
      und ein Enum-Leser, der prüft, ob ein Zustand noch gelesen und nicht nur
      noch geschrieben wird. **Ergebnis vorab: es gab kein totes Modul.** Alle
      138 Dateien unter `src/` sind vom Einstiegspunkt aus erreichbar, und alle
      33 CSS-Klassen werden benutzt. Toter Code existiert hier nur auf
      Zeichenebene, nicht auf Modulebene — und genau dort ist er am gefährlichsten,
      weil ein Modul mit toten Zeilen immer noch „läuft".
      **53 Exporte hatten null externe Verwendungen.** Die zerfallen in vier
      Gruppen, und nur eine davon ist echter Dead Code:
      * **Wirklich tot, sieben Funktionen.** `mineableFrontierIds()` in
        `mining.js` ist der interessanteste Fund: sie wurde von
        `world-view.js` benutzt, bis der Performance-Commit `89d3010` die
        Frontier auf den Ausschnitt umstellte und ein lokales `frontierOf`
        danebenstellte. Der Commit hat sie nicht gelöscht, weil er sie nicht
        kannte — sie fiel stillschweigend weg, und niemand fiel es auf, weil
        `world-view.js` weiterhin eine Frontier liefert. Genau die Frage „wann
        fällt es auf?" hat hier die Antwort: erst beim Zählen, nie beim Lesen.
      * `withRooting()` in `tile.js` trägt das Schlüsselwort seit dem Commit
        `32e43ed`, hat aber nie einen Aufrufer gesehen. `isSettled()` in
        `hive.js` wurde im Rebuild `a7d20ff` geboren und war ab dem ersten
        Tag tot — `git log -S"isSettled("` kennt genau einen Commit, den der
        sie eingeführt hat. `dunglingPositionPx()` und `isInsideView()` waren
        Einzeiler ohne Abnehmer, `stepTile()` in `rooting-world.js` wurde
        von demselben Performance-Commit überholt wie `mineableFrontierIds()`,
        und `traitDef()` löste nur `STONE_TRAIT_DEFS[trait]` auf, was drei
        Stellen direkt tun.
      * **Geborener Duplikat.** `FIELD_CLASS` in `AccountForm.jsx` war eine
        Zeichenkette, die wortgleich schon in `AccountField.jsx` an der
        `<input>`-Zeile stand. Sie war nie benutzt und nie exportiert
        gerufen — der Versuch, die Formatierung zu teilen, ist nie zu Ende
        gebaut worden. Weg damit nimmt beide Kopien mit.
      * **Eine Tabelle mit toten Zeilen.** `STAGE_MIN_SHARE` führt `LEAN` und
        `DEAD`, gelesen werden aber nur `RICH` und `MEDIUM`; `deposit-state.js`
        entscheidet die beiden anderen Fälle über `fill > 0`. Die Werte sind
        redundant, nicht falsch, und die Tabelle bleibt total — deshalb
        bleiben sie stehen.
      * **Nur ein `export` zu viel, der Rest.** 22 Funktionen und Konstanten
        waren `export`, obwohl sie nur in ihrer eigenen Datei lebten. Das ist
        kein Dead Code, aber dieselbe Krankheit: eine Fassade, die so aussieht
        als wäre sie ein Vertrag. `VIEW_TILES` und `WORLD_BLEED_TILES` waren
        dabei besonders irreführend, weil sie in `world-config.js` neben
        `HIVE_SIZE` stehen, das jeder liest.
      * **Sechs Imports ohne Verwendungsstelle.** `neighborIds` in `mining.js`,
        `ACTION` in `rooting-world.js`, `worldSeed` in `game-state.js`,
        `canMineTile` in `mining-reducer.js`, `useState` in `LabBench.jsx` und
        `STONE_TRAIT_DEFS` in `stone-roll.js` — letzter erst durch das Löschen
        von `traitDef()` verwaist. Ein toter Import ist free: er zählt im
        Import-Cap mit und sagt nichts.
      **Ein Zustand wird nur noch geschrieben, niemals gelesen.** `settleHive()`
      setzt `HIVE_PHASE.SETTLED`, und der einzige Leser war `isSettled()` —
      der tote Ausgang dieser ganzen Geschichte. Der Hive erreicht `SETTLED`
      und niemand verzweigt daran; sichtbar wird nur `MUTATING` über
      `hive-state.js`, und `DORMANT` liest `canMutate()`. `SETTLED` bleibt
      trotzdem: es ist der Endzustand, den „Speichern" und die Leiter brauchen
      werden. Ein Schreibzustand ohne Leser ist kein Fehler, sondern eine
      Lücke, die noch niemand geschlossen hat — und genau so gehört sie ins
      Protokoll, statt in einen Patch.
      **Bewusst nicht angefasst.** In `scripts/lib/` bleiben die Exporte
      stehen: `AGENTS.md` nennt `commitViolations()` und `messageParts()` als
      die dokumentierte Vorprüfung für einen Commit, und das ist eine
      Schnittstelle, keine Gewohnheit. `accountApi()` sah in der Zählung wie
      tot aus und ist es nicht — `vite.config.js` liegt außerhalb von `src/`
      und `scripts/` und stand in keinem der drei Abfragen.
      **Gegenprobe.** `npm run verify` bleibt grün, und
      `npm run build` löst alle Importe auf — der Build ist hier die einzige
      Instanz, die einen fehlenden Export überhaupt bemerkt, weil Rollup ihn
      beim Auflösen findet und stirbt. Die Hart-Caps habe ich über alle 181
      versionierten Quelldateien neu gerechnet: keine Verletzung. **Die offene
      Fassade ist keine mehr** — nachgemessen: `builtCenterPx()` in
      `world-view.js` trägt gar kein `export`, hat genau einen Verwendungsort
      (`cameraBox()`) und ist damit eine ganz normale private Funktion. Die
      damalige Notiz galt einer Arbeitskopie, in der der Zustand anders war;
      im Baum ist er es nicht.

- [x] **Die Regeln nachgeschärft.** Hard Caps messen jetzt nur Code — Leer- und
      Kommentarzeilen fallen aus dem LOC-Cap heraus —, und Kommentare selbst
      sind auf fünf Zeilen pro Datei gedeckelt: global für alles unter `src/`
      und `scripts/`, CSS eingeschlossen, Dokumentation bleibt frei. Das
      Commit-Label ist der VANNON-Satz statt der alten `vannon091118`-Kennung.
      Was an Erklärungen aus dem Code weichen musste, steht geschlossen in
      `Docs/ARCHITEKTUR.md` — der Code trägt nur noch den Kopf.

- [x] **Der Untergrund hat Tiefe.** Fünf rein visuelle Hebel, ohne eine einzige
      Spielregel zu berühren. Die Erdmasse trägt jetzt einen Verlauf, der am
      Hive warm beginnt und zum Rand des Ausschnitts hin kühlt; die Vignette
      sitzt asymmetrisch und bekommt eine Decke aus Fels oben; die Auswahl
      leuchtet als Fläche statt als gestrichelter Kontur; die drei HUD-Panels
      teilen Radius, Innenabstaende und dieselben beiden Werteplaketten; die
      Hinweiszeile staffelt 12 zu 11 zu 10 Pixeln statt 12 zu 10 zu 9. Gemessen
      bei 1280 mal 840: der Textkasten der Hinweiszeile wächst von 73 auf 164
      Pixel, die Leiste von 430 auf 520. Bewusst nicht angefasst: die längsten
      Sätze der Hinweiszeile werden weiterhin abgeschnitten, und die
      Bühne springt beim Oeffnen eines Panels weiterhin — beides gehört zur
      parallelen Arbeit an Anweisungen und Layout.

- [x] **Das Gate schließt wieder.** Die letzte Änderung an der Erdform brach das
      eigene CI vor dem Push, weil zwei Hard-Caps-Verletzungen ins Haupt drungen
      sind: maskPoints() in src/world/tile-shapes.js trug 36 Zeilen gegen die
      30-zeilige Cap, und src/domain/world/edge-mask.js trug 6 Kommentarzeilen
      gegen die 5-zeilige Cap. Der Versions-Bot hat den Push geliefert, Bot-
      Commits lösen keine CI aus, also stand das Gate erst einmal senkrecht, als
      der erste Hand-Check kam. Die Korrektur ist auf die Verstoß-Dateien
      beschränkt: maskPoints() wird auf 28 Zeilen zusammengezogen, indem die
      Hilfsfunktionen seamPoint und notchPoint aus der Funktion genommen und als
      geschlossene Pfeilfunktionen im Inneren von maskPoints wieder eingebaut
      werden — sie lesen damit border, tuning, rng und overlap aus dem äußeren
      Scope, brauchen also weniger Parameter (2 und 1 statt 9 und 5), was sie
      gegen die 3-Parameter-Cap schützt. Die eine Kommentarzeile in
      edge-mask.js geht, weil die Funktion isEdgeCell bereits durch ihren Namen
      erklärt ist. Gegenprobe: npm run gate -- --tree grün, npm run verify grün
      (421 Prüfungen), npm run build grün. Kein neuer Check, nur die Behebung
      einer bestehenden Verletzung — die Cap-Prüfungen laufen vor.

Reihenfolge geändert, mit Grund. Der Brutlord stand hier ursprünglich als
letzter Punkt dieser Section. Ein Verbraucher, der einen Vorrat von hundert
Essenz schluckt, ist ohne Ökonomie wertlos — das Ressourcen-System kommt
deshalb zwingend vorher, und der Brutlord wartet, bis es steht.

## 0.0.1 — steht

Die Linie, mit der die globale Versionierung begann. Die Sections hießen
zwischendurch `0.1.0` und `0.2.0` — das war eine Fehlbenennung, keine Absicht.
`version.lock.json` führt die Rücknahme als `amends: 0.1.0`, und die
Versionsregel kennt für genau diesen Fall einen ausdrücklichen Korrekturpfad.

- [x] Hive anklicken → 5 s → Dungling kriecht raus
- [x] Erdblock wählen, 3,5 s Abbau (0 → 100 %), Grid wächst, Feld wird Boden
- [x] Verwurzelung: 10 s Einnehmen, 5 s Ruhe, dann Tentakel in die Nachbarfelder
- [x] Welt 64 × 64 (4.096 Felder, davon 4 Hive), Kamera 13 × 13 folgt dem Raum
- [x] Gate: Hard Caps (300/30/3/7), Version, Commits — läuft in CI
- [x] `npm run verify`: deterministische Abnahme des Slice, ohne Browser
- [x] Domäne frei von React, DOM, SVG, `Math.random()`, `Date.now()`
- [x] **Bauen.** Schwarmhort, Essenz Extractor und Brutlord: Bau wählen, Bauplatz
      setzen, Dunglinge tragen Essenz hin, erst dann steht das Bauwerk. Kein Bau
      wird bezahlt, kein Bau steht sofort — der Weg ist bei jedem der gleiche.
- [x] **Mehr als ein Dungling.** Der Schwarmhort brütet neue Arbeiter; der
      Schwarm ist eine Liste statt eines einzelnen Dunglings, und ein Extraktor
      beschäftigt bis zu drei davon.
- [x] **Nur abgebauter Boden wird beansprucht.** Die Tentakel machen den Raum
      ringsum sichtbar, eingenommen wird ausschließlich abgebauter Boden.

## 0.0.0 — Historie

- [x] Erstes spielbarer Slice
- [x] Rebuild unter den Hard Caps, Gate-Skripte dazugekommen
- [x] AGENTS.md überarbeitet (Import-Zahlen, Pitfalls, Konventionen angleichen)
- [x] **Die Doku gespalten und konsolidiert.** Aus dem überall wiederholten
      Regelwerk sind vier Dateien mit je einer Aufgabe geworden:
      [`WORKFLOW.md`](WORKFLOW.md) (Gate, Abnahme, Version, CI, Ablauf),
      [`GOVERNANCE.md`](GOVERNANCE.md) (Regeln, Doku- und Sorgfaltspflicht),
      [`PITFALLS.md`](PITFALLS.md) (die gemessenen Fallen) und
      [`AGENTS.md`](../AGENTS.md) (Regelwerk plus Lesereihenfolge).
      `COMMIT_POLICY.md` ist in `GOVERNANCE.md` aufgegangen, `CLAUDE.md` ist
      nur noch eine Einstiegsseite. Fünf verschiedene Abschätzungen derselben
      Prüfungszahl (121/122/165/187/216) standen in fünf Dateien neben der
      laufenden Ausgabe von `npm run verify` — jetzt steht die Zahl nur noch
      dort, wo sie gemessen wird.

---

## Wie hier gepflegt wird

- **Neue Version geplant?** Section anlegen, Einträge mit Zielversion markieren.
  Version hochziehen nur über `npm run version:bump -- minor|major`.
- **Task fertig?** Häkchen setzen, Eintrag stehen lassen. Erledigte Zeilen
  werden nicht gelöscht — sonst liest sich das hier nach drei Monaten wie eine
  gelogene Wunschliste.
- **Verschoben?** Eine Zeile, kein neuer Eintrag. „Muss später" ist kein
  Feature, das ist ein Schuldenposten, und Schuldenposten gehören sichtbar hier
  hin.
- **Reihenfolge ändert sich?** Kurz begründen, warum. Nicht einfach die Liste
  umsortieren und so tun, als wäre es immer so gewesen.

## Was hier NICHT steht

Absichten ohne Code sind Luft. Diese Datei beschreibt, was als Nächstes
gebaut wird — sie ist kein Wunschzettel und kein Feature-Forum. Wer eine Idee
einbringen will, bringt einen Task mit, der sie umsetzt, und trägt sie danach
hier ein.

Ausnahmen gibt es genau eine: wenn eine geplante Version sich als falsch
erwies. Dann wird hier dokumentiert, *warum* — nicht, damit die Lücke
verschwindet, sondern damit sie jemand anderes nicht macht.

Die Sections hier benennen **geplante** Versionen, nicht den aktuellen Stand;
der Stand steht in `version.lock.json`. Zwischen zwei geplanten Sections können
deshalb beliebig viele Patch-Bumps liegen.
