# Dungeon Lord

Du hast eine verwurzelte Senke in der Mitte einer dunklen Welt. Klick den Hive an,
warte fünf Sekunden, dann kriecht ein Dungling raus, läuft zu einem Erdblock und
gräbt ihn ab. Was übrig bleibt, gehört deinem Hive — und der Hive fängt sofort an,
sich reinzufressen. Wurzeln stoßen in die Nachbarfelder. Und das war's fürs Erste.

Mehr Spiel gibt es nicht. Nicht jetzt.

![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fvannon091118%2FDungeon-Breaker-Lord-of-the-Evil%2Fmain%2Fversion.lock.json&query=%24.version&label=Version)
![Lizenz](https://img.shields.io/badge/Lizenz-MIT-c8a45b5)
![Node](https://img.shields.io/badge/Node-22-c8a45b5)

## Was hier wirklich drin ist

**Läuft und ist durchgespielt:**

- Hive anklicken → 5 s später kommt der erste Dungling
- Erdblock auswählen, abbauen lassen (3,5 s, sichtbar 0 → 100 %)
- Grid wächst, das Feld wird nutzbarer Boden
- Verwurzelung: 10 s Einnehmen, 5 s Ruhe, dann Tentakel in die Nachbarfelder —
  beansprucht wird dabei nur abgebauter Boden
- **Bauen:** Schwarmhort, Essenz Extractor und Brutlord werden erst als Bauplatz
  gesetzt und dann von Dunglingen mit Essenz bezahlt — Stück für Stück
- Ein **Essenz Extractor** presst für jeden zugewiesenen Dungling (maximal drei)
  eine Essenz pro Zyklus; der Träger bringt sie zum Hive, wo sie als `+1` aufblitzt
- Ein **Schwarmhort** brütet neue Arbeiter, bis der Schwarm sechs Dunglinge trägt
- Der **Brutlord** braucht 2 × 2 Felder und zehn Essenz — und wartet danach
- Unter der Erde liegen Vorräte: ein Cluster ist **ein Schlag, kein fließender
  Vorrat**. Der Abbau kostet Essenz, auf *jede* Erde, und bei null wird der
  Auftrag abgelehnt. Der Hive presst passiv, gedeckelt auf fünfundzwanzig
- 13×13-Tile-Kamera folgt dem Raum, 64×64-Welt drumherum (4.096 Felder, davon
  sind 4 Hive). Jeder Account bekommt aus Name und Passwort eine eigene Welt
- Eine Leiter steht bei 47,47 draußen im Nirgendwo und wird erst sichtbar, wenn
  die Wurzeln hinkommen

**Ist noch Attrappe — bitte nicht verwechseln:**

- Der **Brutlord** steht, kostet, brütet Mutanten — und was ein Stein im Kampf
  anrichtet, ist noch nicht entschieden.
- Der **Spielstand fehlt**. Wer sich abmeldet, verliert Hive, Vorräte und Bauten.
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

Hier wird nicht diskutiert, hier wird gemessen. `npm run gate` prüft Form,
Version und Commit-Regeln; `npm run verify` prüft, ob das Spiel noch das tut,
was es soll. Und ja, die Obergrenzen sind absurd. **Absichtlich.** Kein
Refactoring-Zyklus, kein „Spawn-Manager mit 40 Feldern und einem Interface, das
keiner braucht" — der Code wächst in kleine, ehrliche Module. `scripts/lib/source-metrics.mjs`
zählt das als Textanalyse, ohne Parser. Heißt: anonyme Callbacks zählen nicht als
Funktionen, aber zwei getrennte `import`-Statements sind zwei Imports. Wer clever
sein will, wird vom Gate erwischt.

```sh
npm run gate            # Form, Version, Commits
npm run verify          # die Abnahmesimulation: der Slice, deterministisch durchgespielt
npm run verify:commits  # Regressionstests des Commit-Gates selbst
npm run build           # der einzige, der einen fehlenden Import bemerkt
```

`npm run verify` spielt den Slice mit einer virtuellen Uhr deterministisch
durch — kein Browser, keine Flakiness, kein „works on my machine". Es prüft
Onboarding-Zeiten, Abbau-Ergebnis, Verwurzelungs-Phasen, den kompletten
Bauablauf bis zum Brutlord, die Essenz-Ökonomie, die Konto-Kette und dass die
Domäne sauber bleibt. Wie viele Prüfungen das sind, sagt dir der Lauf selbst —
die Zahl wird hier bewusst nicht abgeschrieben, denn eine Zahl im Text ist ab
dem nächsten Commit still falsch. Die Domäne unter `src/domain/` darf
kein React, kein DOM, kein SVG, kein `Math.random()` und kein `Date.now()`
anfassen — Spielwahrheit ist reines JS und bleibt es.

## Was hier nicht verhandelbar ist

**Der Hive ist die Autorität.** `version.lock.json` führt, `VERSION`,
`package.json` und `package-lock.json` sind Spiegel. Nur über
`npm run version:bump -- patch` anfassbar. Wer den Lock von Hand editiert, hat
im Gate verloren.

**Commit-Bodies sind romanlang.** Jede geänderte Datei namentlich, ein
festgeschriebener Schlusssatz, und der Body muss erklären, **warum**. Klingt
übertrieben. Ist es auch. Aber: Du wirst nicht an einem Tag arbeiten, an dem du
dich erinnerst, warum du diese eine Zeile in `rooting.js` geändert hast. Der
Body ist das Memory, und das Gate zwingt dich, es zu schreiben. Wer
`git commit -m "fix"` tippt, bekommt die volle Härte — und die ist verdient.

Der **genaue Wortlaut** aller Regeln — Commit-Policy, Versionierung, Caps,
Dokumentationspflicht, Sorgfaltspflicht — steht einmal in
[`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md) und wird hier bewusst nicht
abgeschrieben.

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
Komponenten — jede Zeit und jedes Tuning steht an genau einer Stelle, damit
die Simulation auf die Config prüfen kann statt auf gerundete Zahlen.

## Doku

Eine Aussage über dieses Projekt steht genau einmal. Diese Seite erzählt dir,
was das Spiel ist; die fünf Dateien darunter sagen, wie es gebaut wird.

| Frage | Datei |
| --- | --- |
| Was muss ich vor jedem Commit wissen? | [`AGENTS.md`](AGENTS.md) |
| Wie laufen Gate, Abnahme, Version, CI? | [`Docs/WORKFLOW.md`](Docs/WORKFLOW.md) |
| Welche Regeln und Pflichten gelten? | [`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md) |
| Welche Fehler schon einmal zugeschlagen haben? | [`Docs/PITFALLS.md`](Docs/PITFALLS.md) |
| Warum steht eine Sache so und nicht anders? | [`Docs/ARCHITEKTUR.md`](Docs/ARCHITEKTUR.md) |
| Was wird als Nächstes gebaut? | [`Docs/ROADMAP.md`](Docs/ROADMAP.md) |

## Ehrliche Einschätzung

Der Slice ist klein und das ist okay. Was hier zählt, ist nicht die Anzahl der
Features, sondern dass der Unterbau hält: du kannst jeden Commit nachvollziehen,
`npm run verify` sagt dir in Sekunden, ob du das Spiel zerschossen hast, und
kein Modul ist so groß, dass du dich darin verlierst.

Dafür gibt es 4.096 Felder, von denen du am Ende vielleicht zwanzig siehst. Das
ist Absicht — die Senke soll sich anfühlen wie ein Fleck in einer sehr großen
Dunkelheit. Wer mehr sehen will, muss graben.

MIT-Lizenz. Copyright 2026 Vannon.