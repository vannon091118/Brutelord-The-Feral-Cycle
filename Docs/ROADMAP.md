# Roadmap

Pflichtdoku. Versionsgebunden, wird nach **jedem** abgeschlossenen Task im
selben Commit nachgezogen — siehe die Regel in `AGENTS.md`. Wer hier was
einträgt, verpflichtet sich, es auch zu liefern.

Die Autorität für „welche Version lebe ich gerade" ist `version.lock.json`.
Dieses Dokument hält die Absicht fest, nicht den Stand — der Stand steht im
Code, und `npm run verify` sagt dir, ob er stimmt.

---

## 0.2.0 — als Nächstes

Der Slice steht. Was fehlt, ist Substanz statt Effekt.

- [ ] **Bauen.** Wand, Tür und Fackel sind gerendert, aber es gibt keinen
      `BUILD`-Befehl im Reducer. Drei hübsche Buttons, die nichts tun. Höchste
      Priorität, weil das Baumenü derzeit das prominenteste Versprechen der UI
      ist, das nicht eingelöst wird — und das ist genau die Sorte Liücke, die
      jemand in drei Monaten als „kaputt" meldet.
- [ ] **Mehr als ein Dungling.** `createDungling` vergibt fest `dungling-1`.
      Der Hive zählt `spawned`, aber es gibt keinen zweiten.
- [ ] **Speichern.** Aktuell stirbt dein Hive beim Reload. Absicht für den
      Slice, unbrauchbar für alles darüber.
- [ ] **Die Leiter bei 47,47.** Steht als `LADDER_TILE` in der Config und wird
      gerendert, sobald die Wurzeln hinkommen. Sie ist Deko mit Tiefe — irgendwann
      wird sie der Eingang.

## 0.1.0 — steht

- [x] Hive anklicken → 5 s → Dungling kriecht raus
- [x] Erdblock wählen, 3,5 s Abbau (0 → 100 %), Grid wächst, Feld wird Boden
- [x] Verwurzelung: 10 s Einnehmen, 5 s Ruhe, dann Tentakel in die Nachbarfelder
- [x] Welt 64 × 64 (4.096 Felder, davon 4 Hive), Kamera 13 × 13 folgt dem Raum
- [x] Gate: Hard Caps (300/30/3/7), Version, Commits — läuft in CI
- [x] `npm run verify`: 50 Prüfungen, deterministisch, ohne Browser
- [x] Domäne frei von React, DOM, SVG, `Math.random()`, `Date.now()`

## 0.0.1 — Historie

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
