# Dungeon Lord

[![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fvannon091118%2FDungeon-Breaker-Lord-of-the-Evil%2Fmain%2Fversion.lock.json&query=%24.version&label=Version&cacheSeconds=300)](version.lock.json)
[![Lizenz](https://img.shields.io/badge/Lizenz-MIT-c8a45b5)](LICENSE)

Eine Senke in der Mitte einer dunklen Welt. Alles um sie herum ist Finsternis,
und was du nicht gräbst, siehst du nie.

---

## Die Senke

In der Mitte der Karte sitzt der Hive — vier Felder, ein Puls, der von innen
nach außen drückt. Du klickst ihn an. Fünf Sekunden später kriecht ein Dungling
aus dem Loch, läuft los, findet einen Erdblock und gräbt ihn ab. Was übrig
bleibt, gehört dem Hive.

Und der Hive fängt sofort an, sich reinzufressen.

Er frisst den Boden, den du gegraben hast, und schickt Wurzeln in die
Nachbarfelder. Zehn Sekunden lang nimmt ein Feld die Hive-Farbe an, fünf Sekunden
ruht es, dann stoßen die Tentakel weiter. **Eingenommen wird nur abgebauter
Boden.** Unberührte Erde wird sichtbar gemacht und nie genommen — der Hive
umkreist den Raum, den du geschaffen hast, und beißt sich an jedem echten
Schritt die Zähne aus.

Vier Tausend neunhundertsechsundneunzig Felder. Du siehst dreizehn mal dreizehn
davon, ein Fenster, das dem gebauten Raum folgt und mitwandert. Der Rest ist
Dunkelheit, bis die Wurzeln hinkommen.

Weit draußen, bei 47,47, steht eine Leiter. Sie zeigt sich erst, wenn die
Wurzeln sie erreichen. Sie ist Deko mit Tiefe. Irgendwann wird sie der Eingang.

---

## Ein Fleck im Nichts

Und das ist der Punkt.

Mehr sehen kostet. Jedes Feld, das du aufdeckst, musst du vorher graben — und
Graben bindet Arbeitskräfte, Zeit und Essenz, während die Wurzeln längst weiter
kriechen. Es gibt im Spiel keine andere Fortschrittsquelle.

Am Ende steht da ein gebauter Raum von vielleicht zwanzig Feldern, in einer
Dunkelheit, die nicht aufhört. Das ist Absicht und kein Mangel.

Unter dem Boden liegen Vorräte: Cluster aus ein bis drei Feldern, jeder mit bis zu
hundert Essenz. Sie sind nicht sichtbar, solange die Wurzeln kein Nachbarfeld
einnehmen. Und ein Cluster ist **ein Schlag, kein fließender Vorrat** — der Pool
schrumpft mit deinem Grabfortschritt, und im letzten Takt trifft er exakt die
Null. Der Vorrat stirbt mit dem Schlag, den du geführt hast. Das ist das
Todessignal, und es ist nur erreichbar, wenn der Vorrat ein Schlag ist.

Du bist ein Tier, das sich durchfrisst. Das Hive presst passiv eine
Essenz alle zehn Sekunden, gedeckelt auf fünfundzwanzig für das ganze Spiel. Die
Obergrenze ist der Grund, warum es ein Puffer ist und kein Endgame.

Dein Konto ist ein Name und ein Passwort, und daraus entsteht deine Welt. Es
gibt keine Datei, in der sie liegt — gleiche Zugangsdaten ergeben gleiche Welt,
auch nach dem Neuladen, weil gar nichts gespeichert werden *muss*.

**Und deshalb gibt es noch keinen Spielstand.** Meldest du dich ab, sind Hive,
Vorräte und Bauten weg. Das ist der ehrliche Zustand eines Slices, der noch
gebaut wird.

---

## Das Labor am Ende der Senke

Der Brutlord ist die Senke des ganzen Spiels: vier Essenz gegen einen Stein,
dessen Inhalt du erst einmal nicht kennst.

Ein Stein entsteht aus einem Seed, der beim Kauf erzeugt wird — nie aus einem
Würfelwurf. Aus demselben Seed kommt immer derselbe Stein, damit Neuladen kein
Losgriff ist. Ein frischer Stein heißt `???`; erst das Einbauen in einen Körper
lüftet seinen Namen. Die Seltenheit gibt das UI trotzdem über die Farbe preis.

Und hier ist der eigentliche Reiz: **die Optik folgt der Formel Stein-Seed plus
Slot, der Effekt nicht.** Derselbe Stein in den Armen wird zur Faust, im Bein
zum Schneckenfuß. Seltenheit, Trait und Fähigkeiten bleiben bitgleich. Es gibt
keine Ausrüstung, die nur stärker ist — es gibt Experimente.

---

## Warum das kein Spieleaffe-Spiel ist

Weil die Arbeit in den Systemen liegt, nicht in der Menge. Ein Spiel, das Inhalt
nachfüllt, hat irgendwann eine Zahl. Dieses hat Begründungen.

**Nichts wird gewürfelt.** Die Spielwahrheit enthält kein `Math.random()` und
kein `Date.now()` — und das ist erzwungen, nicht behauptet. Sichtbare Geometrie
leitet sich aus Koordinaten und Seeds ab. Dieselbe Koordinate ergibt immer
dieselbe Erde, damit jede Prüfung wiederholbar ist.

**Die Abnahme spielt das Spiel, sie beschreibt es nicht.** `npm run verify` fährt
den kompletten Slice mit einer virtuellen Uhr durch und importiert die echten
Module aus `src/`. Kein Browser, kein Flackern, kein „works on my machine". Wenn
eine Zahl behauptet wird, kommt sie aus diesem Lauf — oder sie steht nicht da.

**Jede Zahl ist gemessen oder entfernt.** Wenn sich eine Zahl nicht mit einem
Befehl reproduzieren lässt, gehört sie in den Commit-Body und nicht in die
Dokumentation. Es gibt keine gerundeten, geschätzten oder von früheren Läufen
übernommenen Werte.

**Grün beweist nichts, bis man es rot gesehen hat.** Zu jeder Behauptung gehört
der Sabotage-Versuch: Regel entfernen, Abnahme laufen lassen, notieren, welche
Prüfungen fallen. Fallen keine, prüft die Prüfung nichts. Der Gegenbeweis ist der
eigentliche Ergebnisbericht.

**Kleine, ehrliche Module.** Harte Obergrenzen: 300 Codezeilen pro Datei, sieben
Importzeilen, drei Parameter, 30 Zeilen pro Funktion. Absichtlich absurd. Damit
niemand einen Spawn-Manager mit 40 Feldern und einem Interface baut, das keiner
braucht. Die Grenzen werden als Textanalyse gezählt, ganz ohne Parser — wer
clever sein will, wird erwischt.

**Die Performance ist gemessen, nicht gefühlt.** Der Start des Spiels ging von
258 ms auf 9,7 ms, der Rooting-Takt von 4,1 ms auf 0,039 ms — gemessen in `node`
gegen die echten Module und im Browser per CPU-Profil, alt gegen neu im selben
Prozess, weil absolute Zahlen unter Last nichts bedeuten. Entscheidend ist der
Gegenbeweis: 58 Zustände über den ganzen Ablauf liefern zwischen der alten und
der neuen Raster-Darstellung byteweise dieselben Felder. Die vollständige
Tabelle steht in [`ARCHITEKTUR.md`](Docs/ARCHITEKTUR.md).

**Ein Fehlpfad wird behoben, nicht umgangen.** Kein Skip, keine geschwächte
Zusage, kein verschluckter Fehler, nur damit die Prüfung grün wird.

---

## Ehrliche Einschätzung

Mehr Spiel gibt es nicht. Nicht jetzt.

Was hier zählt, ist nicht die Anzahl der Features, sondern dass der Unterbau
hält: du kannst jeden Commit nachvollziehen, die Abnahme sagt dir in Sekunden,
ob du das Spiel zerschossen hast, und kein Modul ist so groß, dass du dich
darin verlierst.

Dafür gibt es 4.096 Felder, von denen du am Ende vielleicht zwanzig siehst. Wer
mehr sehen will, muss graben.

MIT-Lizenz. Copyright 2026 Vannon.

---

## Los

```sh
npm ci
npm run dev
```

Läuft auf `127.0.0.1` — aus nem Container kommst du da nicht rein. Das ist
Absicht und kein Bug.

Und wenn du wissen willst, wie hier gearbeitet und geprüft wird: das steht in
[`Docs/`](Docs/). Der Einstieg ist [`Docs/ARCHITEKTUR.md`](Docs/ARCHITEKTUR.md)
— die Entscheidungen und ihr Warum. [`Docs/WORKFLOW.md`](Docs/WORKFLOW.md) erklärt
die Wächter, [`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md) die Regeln,
[`Docs/PITFALLS.md`](Docs/PITFALLS.md) die Fehler, die schon einmal zugeschlagen
haben, und [`Docs/ROADMAP.md`](Docs/ROADMAP.md) was als Nächstes gebaut wird.