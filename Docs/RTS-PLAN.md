# Der RTS-Umbau: direkt gesteuert, später automatisiert

Dieser Entwurf liegt hier, **bevor** der Code dazu entsteht, und aus demselben
Grund wie beim Raid: das Vorhaben kippt Regeln, die heute als grün gemessen
sind — die Onboarding-Kette, den Arbeitstakt, den Golden-Wert der
Deterministizität und die Form des Spielstands. Solange das nicht entschieden
und vermerkt ist, gehört es hierhin und nicht in den Code.

Das Ziel in einem Satz: **Brutelord soll sich wie ein klassisches RTS
anfühlen.** Der Brutlord ist das Hauptgebäude, Dunglings entstehen auf Befehl
und gehorchen auf Befehl, und Automatik ist kein Startzustand, sondern das
Ergebnis einer Infrastruktur, die der Spieler selbst gebaut hat.

---

## Die Entscheidungen des Game Directors

Drei Fragen waren zu beantworten, bevor eine Zeile dieser Domäne entstehen
konnte. Die Antworten sind bindend und werden im Folgenden als **R1**, **R2**
und **R3** zitiert wie die D-Nummern des Raid-Entwurfs.

### R1 — Der Start ist frei

Das geführte Onboarding in dreizehn Phasen wird **ersetzt**, nicht ergänzt. Der
erste Dungling erscheint nicht mehr von selbst (`HIVE_TICK` → Spawn), sondern
der Spieler bestellt ihn am Hive. Es gibt keinen zweiten Modus und keine
Sandkasten-Variante: zwei Spielwahrheiten für dasselbe Spiel wären genau die
zweite Quelle, die wir überall abgeschafft haben.

**Was das kostet, ehrlich benannt:** `onboarding-state.js` trägt dreizehn
Phasen, `onboarding-schedule.js` ihren Zeitplan, `hint-texts.js` dreizehn
Hinweistexte, und `check-onboarding.mjs` prüft die Kette Phase für Phase
einschließlich der gemessenen Zeiten. Die Kette wird durch eine kurze, freie
Startsequenz ersetzt: Hive wählen, Dungling bestellen, ersten Befehl geben.
Alles, was an der Kette hing, wird im selben Zug mitgezogen oder gelöscht — es
gibt keine Übergangsfassung mit zwei Zustandsmaschinen.

### R2 — Ein Gang ist eine Straße, auf der gelaufen wird

Gänge sind **kein Bodenanstrich und kein Durchsatzkennwert**, sondern ein
begehbares Bauwerk, dessen Breite den Durchlass bestimmt. Dunglings laufen
wirklich darüber; Engpässe, Stau und Knotenpunkte entstehen daraus, wo der
Spieler sie baut, und nicht aus einer Rechnung, die er nicht sieht.

**Was das kostet, ehrlich benannt:** Heute gibt es **keine** Bewegung. `MOVING`
bedeutet, dass eine Figur interpoliert wird: `travelMs()` rechnet
Manhattan-Abstand mal Konstante, `withJob()` setzt die Kachel sofort auf das
Ziel, und `workerPositionPx()` malt die Zwischenbilder. Es gibt kein
Hindernis, keine Kollision und keinen Weg. R2 verlangt damit drei Dinge, die
es nicht gibt: eine **Kostenkarte** (welche Kachel ist wie teuer), einen
**deterministischen Weg** darauf (derselbe Befehl, derselbe Weg, ohne
`Math.random()`), und eine **Belegung** (zwei Dunglings auf einem Gang sind
langsamer als einer). Der Raid hat mit `raid-path.js` bereits eine
Wegfindung — sie ist auf den Raid zugeschnitten und wird **nicht**
zweckentfremdet; die Heimat bekommt ihre eigene, weil die Schichtgrenze
schwerer wiegt als Wiederverwendung.

### R3 — Der Hive ist das erste Lager

`state.essence` hört auf, eine globale Zahl zu sein. Der Hive wird der **erste
Knoten mit Bestand und Kapazität**, weitere Lager sind Knoten derselben Art.
Was heute aus der Zahl bezahlt wird — Bau, Bauplatz, Labor, Baumenu — liest
künftig einen **Selektor** (`hiveStock(state)`), nicht das Feld. Damit bleibt
der Umbau anschlussfähig: der Spieler merkt zuerst nichts, und jede Zahl der
Oberfläche bekommt danach nach und nach ihren echten Knoten.

**Was das kostet, ehrlich benannt:** `check-snapshot.mjs` prüft `essence >= 0`
als Teil der Formprüfung, die Snapshot-Fassung steigt von 3 auf 4, und die fünf
eingefrorenen Zustände unter `tools/tests/state/` tragen die alte Form.

---

## Die Reihenfolge

Sechs Scheiben. Jede ist einzeln abnehmbar, und **keine** Scheibe lässt das
Spiel ohne lauffähige Mitte zurück. Die Reihenfolge ist nicht Geschmack: sie
ist die Abhängigkeitskette. Wer die Automatik zuerst entfernt, hat ein Spiel,
in dem nichts mehr passiert; wer die Gänge zuerst baut, hat Straßen, auf denen
niemand laufen kann.

| # | Scheibe | Ergebnis für den Spieler |
| --- | --- | --- |
| 1 | **Auftrag und Warteschlange** | Ein Dungling hat eine Befehlsliste; Zuweisen wird zu einem Auftrag in dieser Liste |
| 2 | **Kein Automatismus im Takt** | `staffWorkers()` und der selbsttätige Spawn verschwinden; ohne Befehl bewegt sich nichts |
| 3 | **Laufen, Weg und Belegung** | Dunglings laufen Kachel für Kachel, Wege werden gerechnet, Gänge bestimmen den Durchlass |
| 4 | **Bestand und Knoten** | Der Hive ist ein Lager mit Kapazität; die globale Essenzzahl verschwindet hinter einem Selektor |
| 5 | **Produktionswarteschlange und Rally Point** | Der Hive und der Hort bestellen Dunglings in Reihenfolge, mit Sammelpunkt |
| 6 | **Automatik als Fortschritt** | Arbeitsstation, Logistikregel und Routine werden freigeschaltet, nicht vorausgesetzt |

Zwei Regeln gelten für alle sechs Scheiben und sind nicht verhandelbar:

- **Jede Scheibe hält das Gate grün.** Eine rote Scheibe wird nicht
  weitergeschoben, sondern fertig gemacht.
- **Der Golden-Wert wird nur auf der Node-Major der CI geschrieben.** Eine
  Zustandsform, die sich ändert, ändert den Hash; das ist eine
  Verhaltensänderung und gehört in den Commit-Body, nicht in eine stille
  Aktualisierung.

## Was jetzt als Erstes entsteht

Scheibe 1, weil sie die Voraussetzung für alles Weitere ist: Ohne eine
Auftragsliste gibt es keinen Ort, an dem ein Befehl liegen kann — und ohne
diesen Ort ist jede spätere Scheibe ein Umbau am offenen Herzen.

Scheibe 1 ändert **nichts** an dem, was der Spieler heute sieht: das Zuweisen
eines Dunglings an einen Extractor führt zum selben Ergebnis wie vorher. Neu
ist nur, **wie** es zustande kommt — als Auftrag in einer Warteschlange statt
als stille Mitgliedschaft. Genau deshalb kann sie vor der Automatik-Entfernung
landen, und genau deshalb ist sie die einzige Scheibe ohne sichtbaren
Rückschritt.

## Offene Fragen

- **Wie viele Aufträge darf eine Liste tragen?** Eine harte Obergrenze braucht
  es, weil die Liste in den Spielstand wandert und der eine Byte-Deckel hat.
  Der Wert gehört in die Config neben `JOB_CONFIG`, nicht in die Komponente.
- **Was passiert mit einem Auftrag, dessen Ziel verschwindet?** Ein Bauplatz,
  der fertig wird, und eine Kachel, die weggegraben wird, machen den Auftrag
  gegenstandslos. Die Antwort darf nicht „er wird still ignoriert" heißen — ein
  Dungling, der auf einen Befehl wartet, der nie kommt, ist schlimmer als eine
  Fehlermeldung. Vorschlag: der Auftrag fällt mit einem Ereignis heraus, das
  die Hinweiszeile nennen kann, und der Dungling wird `IDLE`.
- **Wie wird ausgewählt?** Ein Klick auf eine Figur, ein Rahmen über mehrere,
  oder beides. R1 macht das Onboarding frei, also muss die Auswahl den Spieler
  ohne Führung verständlich ansprechen — „alles auswählen" ist keine Antwort.
