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

---

## 0.0.2 — als Nächstes

Der Bau steht, der Schwarm arbeitet. Was jetzt fehlt, ist Bestand — und ein
Grund, ihn zu haben.

- [ ] **Das Raid-Feature: Entwurf steht, Bau nicht.** Angriffe zwischen zwei
      Spielern, Ausdauer als Einsatz statt Timer, Stein und Obsidian nur aus
      fremden Basen. Der Entwurf liegt vollständig in
      [`RAID-PLAN.md`](RAID-PLAN.md) — mit den Entscheidungen, die schon
      fallen, und den sieben offenen Fragen. **Zwei davon sind Bauauftrag,
      nicht Balance:** die Ökonomie hat einen Kaltstart, der sich nicht durch
      Tuning löst, und die Validierung gegen einen Client, der selbst rechnet,
      ist nicht spezifizierbar, solange die Bedrohung nicht benannt ist. Beides
      ist vor dem ersten Code zu entscheiden. Der geschlossene Pull Request
      daraus (`#2`) war an beiden Punkten falsch und ist mit Begründung
      geschlossen; §8 in `AGENTS.md` ist im selben Zug an die zwei
      Steinsorten angepasst.
- [ ] **Eine Abnahme für den Browser.** Die Onboarding-Kette ist jetzt geprüft,
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
- [ ] **Speichern.** Aktuell stirbt dein Hive beim Reload. Absicht für den
      Slice, unbrauchbar für alles darüber. Mit Essenz und Bauten im Zustand ist
      das jetzt mehr als eine Bequemlichkeit: wer zehn Minuten in einen Brutlord
      gesteckt hat, verliert ihn sonst an einen versehentlichen F5.
- [ ] **Die Leiter bei 47,47.** Steht als `LADDER_TILE` in der Config und wird
      gerendert, sobald die Wurzeln hinkommen. Sie ist Deko mit Tiefe — irgendwann
      wird sie der Eingang.
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
      versionierten Quelldateien neu gerechnet: keine Verletzung. Offen bleibt
      eine Fassade, die ich nicht angefasst habe, `builtCenterPx()` in
      `world-view.js`, weil diese Datei gerade in der Arbeitskopie eines
      anderen Vorgangs steckt.

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
