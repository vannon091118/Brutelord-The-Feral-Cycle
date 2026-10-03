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
      Screenshots. Was fehlt, ist die eigentliche Abnahme — eine Liste von
      Erwartungen, die der Durchlauf einhält oder nicht.
- [ ] **Speichern.** Aktuell stirbt dein Hive beim Reload. Absicht für den
      Slice, unbrauchbar für alles darüber. Mit Essenz und Bauten im Zustand ist
      das jetzt mehr als eine Bequemlichkeit: wer zehn Minuten in einen Brutlord
      gesteckt hat, verliert ihn sonst an einen versehentlichen F5.
- [ ] **Die Leiter bei 47,47.** Steht als `LADDER_TILE` in der Config und wird
      gerendert, sobald die Wurzeln hinkommen. Sie ist Deko mit Tiefe — irgendwann
      wird sie der Eingang.
- [ ] **Verborgene Essenz-Vorräte und eine Hive-Ökonomie.** Unter der Erde
      liegen Cluster aus ein bis drei Feldern mit je höchstens hundert Essenz,
      stets isoliert; spürbar wird ein Vorrat nur, wenn die Wurzeln ein
      Nachbarfeld einnehmen, offen erst, wenn der Abbau sein eigenes Feld
      erreicht. **Cluster sind ein Schlag, kein fließender Vorrat:** der Pool
      folgt dem Grabfortschritt und ist im letzten Takt leer, damit das
      Todessignal überhaupt erreichbar ist. Die vier Verhaltensweisen und drei
      Sättigungsstufen sind gezeichnet, `lastHarvest` wird vom echten Reducer
      gesetzt und über `check-deposit-flow.mjs` geprüft. Offen bleibt die
      zweite Entscheidung, fällt der Abbaupreis auf alle Erde oder nur auf
      Vorratsfelder, und der Hive produziert als Motor noch nicht weiter.
      Beim Speichern gehört `deposit` nur auf die Felder, die wirklich eins
      haben.
- [ ] **Der Brutlord tut etwas.** Er wird gebaut, er kostet, er wartet — und er
      ist die Senke für einen Vorrat, den erst das System darüber erzeugt. Was
      er ausbrütet, ist noch nicht entschieden; ohne Cluster ist er ein teurer
      Platzhalter mit Panzer.
- [x] **Die Regeln nachgeschärft.** Hard Caps messen jetzt nur Code — Leer- und
      Kommentarzeilen fallen aus dem LOC-Cap heraus —, und Kommentare selbst
      sind auf fünf Zeilen pro Datei gedeckelt: global für alles unter `src/`
      und `scripts/`, CSS eingeschlossen, Dokumentation bleibt frei. Das
      Commit-Label ist der VANNON-Satz statt der alten `vannon091118`-Kennung.
      Was an Erklärungen aus dem Code weichen musste, steht geschlossen in
      `Docs/ARCHITEKTUR.md` — der Code trägt nur noch den Kopf.

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
