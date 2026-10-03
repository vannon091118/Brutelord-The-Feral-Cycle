# Dungeon Lord

Du hast eine verwurzelte Senke in der Mitte einer dunklen Welt. Klick den Hive an,
warte fünf Sekunden, dann kriecht ein Dungling raus, läuft zu einem Erdblock und
gräbt ihn ab. Was übrig bleibt, gehört deinem Hive — und der Hive fängt sofort an,
sich reinzufressen. Wurzeln stoßen in die Nachbarfelder. Und das war's fürs Erste.

Mehr Spiel gibt es nicht. Nicht jetzt.

![Status](https://img.shields.io/badge/Version-0.1.0-c8a45b5) ![Lizenz](https://img.shields.io/badge/Lizenz-MIT-c8a45b5) ![Node](https://img.shields.io/badge/Node-22-c8a45b5)

## Was hier wirklich drin ist

**Läuft und ist durchgespielt:**

- Hive anklicken → 5 s später kommt der erste Dungling
- Erdblock auswählen, abbauen lassen (3,5 s, sichtbar 0 → 100 %)
- Grid wächst, das Feld wird nutzbarer Boden
- Verwurzelung: 10 s Einnehmen, 5 s Ruhe, dann Tentakel in alle Nachbarfelder
- 13×13-Tile-Kamera folgt dem Raum, 64×64-Welt drumherum (4.096 Felder, davon sind 4 Hive)
- Eine Leiter steht bei 47,47 draußen im Nirgendwo und wird erst sichtbar, wenn die Wurzeln hinkommen

**Ist noch Attrappe — bitte nicht verwechseln:**

- Das **Baumenü** (Wand, Tür, Fackel). Drei hübsche Buttons mit Inline-SVG-Glyphen.
  Klicken macht nichts, weil es im Reducer schlicht keinen `BUILD`-Befehl gibt.
  Das Menü ist der nächste Schritt, nicht der jetzige.
- Es gibt **kein `npm test`**. Null. Null Zeilen. Was hier prüft, ist `npm run verify`.
- Kein Linter, kein Formatter. Wer sich im Repo einbaut, hält sich an den
  bestehenden Stil oder wird vom Review zerschossen.

## Los

```sh
npm ci
npm run dev
```

Läuft auf `127.0.0.1` — aus nem Container oder von unterwegs kommst du da nicht
rein, das ist Absicht und keine Bug.

## Das Gate ist der eigentliche Projektleiter

Hier wird nicht diskutiert, hier wird gemessen. `npm run gate` ist der Boss:

| Cap | Wert |
| --- | --- |
| LOC pro Modul | 300 |
| LOC pro benannter Funktion | 30 |
| Parameter pro Funktion | 3 |
| Imports pro Datei | 7 |

Und ja, das ist absurd. **Absichtlich.** Kein Refactoring-Zyklus, kein
"Spawn-Manager mit 40 Feldern und einem Interface, das keiner braucht" — der
Code wächst in kleine, ehrliche Module. Jede neue Datei, die du anfasst, muss
unter 300 Zeilen bleiben, und `scripts/lib/source-metrics.mjs` zählt das als
Textanalyse auf, ohne Parser. Heißt: anonyme Callbacks zählen nicht als
Funktionen, aber zwei getrennte `import`-Statements sind zwei Imports. Wer clever
sein will, wird vom Gate erwischt.

```sh
npm run gate            # alles: Hard Caps, Version, Commits
npm run verify          # die Abnahmesimulation, 50 Prüfungen
npm run verify:commits  # Regressionstests des Commit-Gates selbst
```

`npm run verify` spielt den Slice mit einer virtuellen Uhr deterministisch
durch — kein Browser, keine Flakiness, kein "works on my machine". Es prüft
Onboarding-Zeiten, Abbau-Ergebnis, Verwurzelungs-Phasen und dass die Domäne
sauber bleibt. **50 Prüfungen, alle grün.** Die Domäne unter `src/domain/` darf
kein React, kein DOM, kein SVG, kein `Math.random()` und kein `Date.now()`
anfassen — Spielwahrheit ist reines JS und bleibt es.

## Was hier nicht verhandelbar ist

**Der Hive ist die Autorität.** `version.lock.json` führt, `VERSION`,
`package.json` und `package-lock.json` sind Spiegel. Nur über
`npm run version:bump -- patch` anfassbar. Wer den Lock von Hand editiert, hat
im Gate verloren.

**Commit-Bodies sind romanlang.** 100 bis 1.000 Wörter. Jede geänderte Datei
muss namentlich im Body stehen. Letzte Zeile exakt einmal
`Vannon-(vannon091118)`. Verboten: `Co-Authored-By`, `Signed-off-by`,
`Reviewed-by`, `Generated with …`, Footer-Trenner und jedes `Key: value` als
Trailer.

Klingt übertrieben. Ist es auch. Aber: Du wirst nicht an einem Tag arbeiten, an
dem du dich erinnerst, warum du diese eine Zeile in `rooting.js` geändert hast.
Der Body ist das Memory, und das Gate zwingt dich, es zu schreiben. Wer
`git commit -m "fix"` tippt, bekommt die volle Härte — und die ist verdient.

**Sprache:** Commit-Nachrichten und Code-Kommentare auf Deutsch, Bezeichner
englisch. Klingt widersprüchlich, funktioniert aber: Der Kommentar erklärt das
*Warum* für Menschen, die Bezeichner sind Maschinensprache.

## Aufbau

```
src/domain/   Spielwahrheit. Kein React, kein DOM, kein SVG.
src/state/    Reducer, Aktionen, Selektoren. Ein Reducer pro Verantwortung.
src/ui/       HUD, Menüs.
src/world/    SVG-Ebenen.
```

Pfeile zeigen nach oben: `domain` ist die Basis und importiert nach außen
nichts — das ist die einzige Grenze, die wirklich erzwungen wird (von
`check-architecture.mjs`). `ui` darf `world` kennen, `world` darf `state/`
Selektoren kennen. Wer hier die Richtung auf den Kopf stellt, baut umsonst.

Fakten liegen als eingefrorene Konstanten (`TILE_KIND`, `DUNGLING_STATE`,
`HARD_CAPS`) in `*-config.js`. Keine Magic Strings, keine Zahlen in
Komponenten — jede Zeit und jedes Tuning steht an genau einer Stelle, damit die
Simulation auf die Config prüfen kann statt auf gerundete Zahlen.

## Stand der Dinge

- [x] Hive → Dungling → Abbau → Boden
- [x] Verwurzelung mit vier Phasen (DARK → GROWING → RESTING → CLAIMED)
- [x] Gate für Hard Caps, Version, Commits — läuft in CI auf jedem PR
- [x] Deterministische Slice-Simulation ohne Browser

## Roadmap

Steht in [`Docs/ROADMAP.md`](Docs/ROADMAP.md) — versionsgebunden, wird nach
jedem Task im selben Commit nachgezogen. Kurzfassung: **Bauen** ist als Nächstes
dran (die drei Buttons tun noch nichts), danach mehr als ein Dungling, dann
Speichern.

## Ehrliche Einschätzung

Der Slice ist klein und das ist okay. Was hier zählt, ist nicht die Anzahl der
Features, sondern dass der Unterbau hält: du kannst jeden Commit nachvollziehen,
`npm run verify` sagt dir in Sekunden, ob du das Spiel zerschossen hast, und
kein Modul ist so groß, dass du dich darin verlierst.

Dafür gibt es 4.096 Felder, von denen du am Ende vielleicht zwanzig siehst. Das
ist Absicht — die Senke soll sich anfühlen wie ein Fleck in einer sehr großen
Dunkelheit. Wer mehr sehen will, muss graben.

MIT-Lizenz. Copyright 2026 Vannon.
