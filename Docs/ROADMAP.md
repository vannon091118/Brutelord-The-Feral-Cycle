# Roadmap

Pflichtdoku. Versionsgebunden, wird nach **jedem** abgeschlossenen Task im
selben Commit nachgezogen — siehe die Regel in `AGENTS.md`. Wer hier was
einträgt, verpflichtet sich, es auch zu liefern.

Die Autorität für „welche Version lebe ich gerade" ist `version.lock.json`.
Dieses Dokument hält die Absicht fest, nicht den Stand — der Stand steht im
Code, und `npm run verify` sagt dir, ob er stimmt.

---

## 0.0.2 — als Nächstes

Der Bau steht, der Schwarm arbeitet. Was jetzt fehlt, ist Bestand — und ein
Grund, ihn zu haben.

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
- [x] **Die Render-Kosten.** Vier Uhren ticken bis zu 20-mal pro Sekunde, und
      jeder Takt zog vorher das ganze 4.096-Kacheln-Raster durch die
      Ableitung: `tilesInView()` filterte `Object.values(world.tiles)`, um 56
      Kacheln zu finden, `builtCenterPx()` lief zweimal pro Render, weil
      `GameStage.jsx` die Kamera für ein Menü berechnete, das meistens zu ist,
      und die Frontier zählte das gesamte Raster für eine Karte, die ohnehin
      nur im Ausschnitt gelesen wird. `revealAround()` streute das
      `tiles`-Objekt 37-mal für einen einzigen abgeräumten Block — 78 ms in
      einem Reducer-Schritt, mitten im Spiel. Und `depositsOf()` gab jeder
      Kachel pro Render ein neues Objekt, wodurch `React.memo` auf `EarthTile`
      nie traf. Jetzt: Ausschnitt koordinatenweise statt Raster filtern,
      `applyTiles()` bündelt mehrere Kacheln in ein Streuen,
      `earthGeometry()` cached nach Koordinate, Größe und Zustand, Kopie nur
      bei Kacheln mit Vorrat. Gemessen gegen die echten Module, alt gegen neu
      im selben Lauf: Ableitung pro Render 16,2 → 3,5 ms, ein abgeräumter
      Block 182 → 8 ms. Ohne Bildänderung, bewiesen über 34 Zustandsvergleiche
      mit identischer Kamera, identischer Kachelreihenfolge und identischer
      Frontier, plus unveränderten 187 Prüfungen.
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
- [x] `npm run verify`: 121 Prüfungen, deterministisch, ohne Browser
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
- [x] AGENTS.md überarbeitet (Import-Zahlen, Pitfalls, Konventionen angleichen)
