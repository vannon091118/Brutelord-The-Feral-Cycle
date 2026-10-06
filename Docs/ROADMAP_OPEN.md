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

- [x] **Eine benutzte Aktion ist definiert, oder die Abnahme fällt.** Der
      Hive-Klick lief auf einer Konstante, die es nicht gab:
      `ACTION.HIVE_MUTATION_STARTED` fehlte in
      `src/domain/actions/action-types.js`, wurde aber als Case in
      `src/state/reducers/hive-reducer.js` und als Timer in
      `src/domain/onboarding/onboarding-schedule.js` benutzt. Ein fehlender
      Schluessel liefert `undefined` statt eines Fehlers, der Case-Wert war also
      `undefined`, und `switch (undefined)` traf ihn — der Zwischenschritt
      `HIVE_CLICKED → MUTATING` hing an zwei Fehlern, die sich aufhoben. Jede
      kuenftige namenlose Aktion waere an derselben Stelle als „Hive-Mutation
      starten" ausgefuehrt worden, und eine Umbenennung auf nur einer der beiden
      Seiten haette das Onboarding in der ersten Sekunde angehalten. Die
      Konstante steht jetzt im Register. `scripts/verify/check-action-types.mjs`
      prueft sechs Aussagen, die vorher niemand geprueft hat: jede im Quelltext
      benutzte Konstante gegen das Register, jeden Wert gegen seinen Namen,
      jeden Zeitplan-Eintrag jeder Phase gegen das Register — Suche ueber `src`,
      `scripts` und `tools`, damit auch ein kuenftiges Pruefskript keine
      namenlose Aktion abfeuern kann — und dass ein Dispatch ohne Typ den
      Zustand nicht mehr bewegt. Die Gegenprobe ist gefahren: mit
      zurueckgenommener Konstante fallen 3 der 6 neuen Pruefungen, waehrend die
      gesamte uebrige Abnahme gruen bleibt. Der Fund steht in
      [`PITFALLS.md`](PITFALLS.md), Abschnitt „Die Reducerkette".
  Status: geplant
  Scope: Domäne
  Kategorie: Bugfix
  Version: ausstehend
  Datum: ausstehend

- [x] **Der ganze Slice hat einen Zustands-Hash je Zug.** Die headless-Abnahme
      prüfte den Slice bisher in Ausschnitten: `check-build.mjs` den
      Bau-Durchlauf, `check-onboarding.mjs` die Kette, `check-rooting.mjs` die
      Verwurzelung an einem von Hand nachgetriebenen Zustand. Einen Hash je Zug
      über den *ganzen* Durchlauf gab es nicht — und drei Aktionstypen
      (`ROOTING_TICK`, `LAB_OPENED` samt Stein- und Mutationsfolge,
      `FLOOR_DESCEND`) feuerte headless überhaupt kein Check; die lebten allein im
      Browser. `determinism-run.mjs` spielt jetzt den Bau-Durchlauf aus
      `build-run.mjs` und danach die Züge, die sonst nur der Browser auslöst:
      2008 Züge je Seed, und der Durchlauf feuert **30 von 30** Aktionen der
      Kette — abgeleitet aus `ACTION`, nicht als Liste gepflegt.
      `check-determinism.mjs` vergleicht jeden Zug gegen
      `scripts/verify/determinism-golden.json` über die vier Sample-Seeds und
      nennt bei einer Abweichung die Zugnummer, die Aktion und beide Hashes.
      Die Gegenprobe ist an zwei Stellen gefahren: `miningCost` von 1 auf 2
      (ändert den Startzustand) fällt bei **Zug 1 (HIVE_CLICKED)**, und
      `claimDurationMs` von 10000 auf 9000 fällt bei **Zug 1670
      (`ROOTING_TICK`)** — genau in dem Bereich, den vorher kein Check abdeckte.
      Zwei Fallen sind dabei gemessen worden und stehen in
      [`PITFALLS.md`](PITFALLS.md): derselbe Seed hat zwei Formen (`'12345678'`
      ist hex gelesen, die Zahl `12345678` nicht), und der erste Hash-Mischer
      kippte bei einer Ein-Feld-Drift nur 9 von 32 Bits, die
      Murmur-Finalisierung 16,1. Der Golden-Wert schreibt sich nie selbst;
      `npm run golden:determinism` ist der bewusste Weg dorthin.
  Status: geplant
  Scope: CI
  Kategorie: Test
  Version: ausstehend
  Datum: ausstehend

- [x] **Der Volllauf wandert in die CI, lokal bleibt die schnelle Spur.**
      Gemessen kostete `npm run verify` **2 m 13 s** Wanduhr gegen 50 s CPU — die
      Zeit geht an Server und Chromium, nicht an die Rechnung —, während
      `npm run gate` bei 5,4 s, eine isolierte Prüfgruppe bei 1,3 bis 6,4 s und
      `npm run build` bei 10,2 s liegen. Ein Lauf über zwei Minuten gehört nicht
      in jeden Task. Die CI fährt ihn ohnehin bei jedem Push, auf Node 22 —
      derselben Major-Version, unter der die Golden-Werte entstanden sind.
      `AGENTS.md` §2 verlangt lokal jetzt die betroffene Prüfgruppe als
      Einzelaufruf plus `npm run build`; `build` bleibt lokal, weil es die
      einzige Instanz ist, die einen toten Import bemerkt. `Docs/WORKFLOW.md`
      trägt die Einteilung mit den gemessenen Zeiten unter *Die Testlaufzeit*.
      **Kein Hintergrundprozess lokal:** ein `fire-and-forget` auf derselben
      Maschine kostet dieselbe CPU und denselben Chromium und spart nur die
      Wartezeit — der asynchrone Lauf ist die CI. Der Preis steht ausdrücklich
      in beiden Dokumenten: zwischen Push und CI-Bericht kann `main` rot sein,
      der Volllauf ist die Gegenprobe **nach** dem Push. Die Gegenprobe selbst
      bleibt lokal lauffähig, weil sie als einzelne Prüfgruppe läuft;
      `Docs/GOVERNANCE.md` verlangt sie unverändert und nennt jetzt den
      Einzelaufruf statt des Volllaufs.
  Status: geplant
  Scope: CI
  Kategorie: Doku
  Version: ausstehend
  Datum: ausstehend

- [x] **Ein Herzschlag statt fünf Uhren: die Sim-Uhr misst die verstrichene
      Zeit.** Der Browser hielt fünf Uhren: drei `setInterval`-Takte der
      Kolonie, die einen festen `dtMs` von 200 ms abfeuerten, eine Wurzeluhr mit
      100 ms ganz ohne `dtMs`, und das Onboarding als Kette von `setTimeout`s.
      Ein gedrosselter Hintergrundtab dehnt diese Intervalle auf eine Sekunde
      und mehr — die Kolonie kam also 200 ms Spielzeit je ausgelöstem Takt
      voran, während die Onboarding-Kette weiter auf der Wanduhr lief. Zwei
      Zeitbasen, die auseinanderlaufen. Jetzt misst ein einziger Herzschlag
      (`src/state/game-clock.js`, `src/state/game-time.js`,
      `src/state/use-game-clock.js`) die tatsächlich verstrichene Zeit über eine
      einspeisbare monotone Uhr, und jede Uhr bekommt genau die Takte, die
      diese Zeit fällig macht — jeder mit seinem Config-Takt als `dtMs`. Der
      Onboarding-Plan läuft auf demselben Herzschlag und feuert seine Timer auf
      angesammelter Zeit statt auf einem veralteten Timeout.
      `GAME_TIME.maxStepMs` von 1000 ms deckelt den einzelnen Schritt: ein eine
      Stunde verborgener Tab ist Abwesenheit und nicht achtzehntausend Takte in
      einem Zug. `src/state/use-colony-clock.js`, `use-hive-runner.js`,
      `use-work-runner.js`, `use-rooting-runner.js` und `use-schedule-runner.js`
      sind samt ihren fünf Spiegel-Dateien entfallen;
      `src/state/reducers/rooting-reducer.js` nimmt seine Taktlänge jetzt aus
      `action.dtMs`, statt `ROOTING_CONFIG.tickMs` zu wiederholen. Die neue
      Gruppe `scripts/verify/check-game-clock.mjs` prüft das in 20 Zusicherungen
      und 1,3 s: 100 Takte à 100 ms und 10 Takte à 1000 ms ergeben denselben
      Taktstrom, ein Schritt von 60.000 ms trägt höchstens 1000 ms nach, der
      erste Onboarding-Timer kommt im Takt `ceil(Dauer/Herzschlag)`, die Kette
      bis zum Abbau läuft in 6600 auf 6600 ms geplante Wartezeit, und ein
      gedehnter Schritt im Abbau arbeitet `floor(1000/miningTickMs)`
      Fortschrittstakte nach, wobei die Summe weiter die `totalTicks` des
      Auftrags trifft. Zwei Gegenproben: mit festem Schritt statt gemessener
      Zeit fallen 6 der 20 Prüfungen — beide Drossel-Prüfungen, beide
      Deckel-Prüfungen, der Timer und der Abbau —, und ohne den Übertrag des
      Timer-Rests in die nächste Phase fällt genau die Drift-Prüfung (6700
      statt 6600 ms); der Determinismus-Golden bleibt dabei unverändert, weil
      die Abnahme die neue Uhr nicht treibt.
      Das hat die Browser-Abnahme sichtbar gemacht: sie installierte eine
      Playwright-Uhr, **angehalten** hat sie sie nie — sie lief mit der Wanduhr
      weiter, und die Spielzeit hing an der Lesegeschwindigkeit des Laufs.
      `scripts/browser/page.mjs` hält die Uhr jetzt wirklich an, die
      Fahrbefehle liegen in `scripts/browser/drive.mjs` und warten mit der Uhr
      auf ein Ziel, das sichtbar und bedienbar ist, und
      `src/ui/use-stage-scale.js` misst die Spielfläche beim Einhängen
      synchron, weil ein `ResizeObserver` ohne Bildaufbau nichts meldet.
      `miningBudget` in `scripts/browser/beats.mjs` ist aus Abbau, Zerstörung
      und Taktauflösung abgeleitet statt geraten. `npm run verify:browser`
      läuft mit **21 von 21** grün durch und misst die configurierten Zeiten auf
      die Millisekunde: 500 ms Laufweg, 4200 ms Abbau, 600 ms Bodenausbau.
  Status: geplant
  Scope: Zeit
  Kategorie: Refactor
  Version: ausstehend
  Datum: ausstehend

- [x] **Ein Golden-Wert, eine Laufzeit.** `determinism-golden.json` ist
      Beweismaterial über 2008 Züge je Seed, und es konnte bisher jeder
      schreiben — auch unter einer anderen Node-Major als der in der CI. Damit
      entstanden zwei Goldens über denselben Slice, und die Abnahme verglich
      stillschweigend gegen den, der gerade passt: der Happy Path des jüngeren,
      während der ältere nur als kryptische Abweichung wartete.
      `tools/golden-determinism.mjs` liest die gepinnte Version jetzt aus
      `.github/workflows/ci.yml` und bricht auf jeder anderen ab, **bevor** es
      rechnet — ein Erzeuger, der erst rechnet und dann verweigert, hätte den
      zweiten Wert schon gebaut. Der Wert trägt seine `nodeMajor` im Kopf, und
      `scripts/verify/check-determinism.mjs` meldet eine fremde Laufzeit als
      Befund statt als Hash-Differenz: zwei Laufzeiten sind nicht derselbe
      Zustand. Zwei Gegenproben, beide gemessen: der Erzeuger unter Node 24 gegen
      die auf 22 gepinnte CI endet mit Exit 1 und einer bytegleichen Datei; ein
      Golden mit `nodeMajor: 24` lässt die Prüfung mit „im Wert 24, gepinnt 22"
      fallen, während die übrigen elf Zusicherungen grün bleiben. Beides
      zurückgesetzt, 12 von 12 grün.
  Status: geplant
  Scope: Abnahme
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
