# Raid-Entwurf: Eco-Stakes

Der Entwurf liegt hier, **bevor** Code dazu entsteht. Grund ist nicht
Ordnungsliebe: das Vorhaben berührt Vorgaben in `AGENTS.md` §8, die
ausdrücklich vom Auftraggeber gesetzt und im selben Zug revidiert
wurden, und es berührt den Untergrund, den §8 bisher auf genau eine
Art festlegt. Solange das nicht entschieden und vermerkt ist, gehört
es hierhin und nicht in den Code.

Alles Weitere zu diesem Feature steht in
[`ROADMAP.md`](ROADMAP.md). Dieses Dokument trägt die **offenen Fragen
und die getroffenen Entscheidungen** — und benennt ehrlich, was noch
nicht weißbar ist.

---

## Was der Entwurf will

Ein Angriff zwischen zwei Spielern. Der Verteidiger verliert Material, wenn
sein Hive fällt, und bekommt Material nur, wenn er selbst raidet. Es gibt
keine Wartezeiten und keine Teilnahme-Währung: die Ausdauer des Teams
*ist* der Einsatz, und sie wird aus den Mutationen der Monster berechnet.
Wer sein Team losschickt, riskiert es — das ist der ganze Kern.

## Die vier Blöcke

**Ökonomie und Risiko.** Stein und Obsidian lassen sich nicht passiv
erzeugen, nur aus fremden Basen holen. Das zwingt zum Raiden, wenn man
sich verteidigen will. Die Ausdauer ist ein globaler Pool je Team und
ersetzt jeden Timer. Fällt der Pool, sind die Monster verloren oder schwer
verletzt. Geht die Ausdauer vor dem Hive zur Neige, gibt es Rückzug oder
das Opfer: ein Monster wird dauerhaft geopfert und gibt sofort Schub, und
fällt der Hive, besteht eine 50-Prozent-Chance, dass es aus der Biomasse
des Gegners zurückkommt.

**Angriffs-Ablauf.** Der Einstieg ist 60 Felder entfernt im unberührten
Erdreich, das Sichtfeld zeigt nur die angrenzenden Felder. Jeder Schritt
und jeder Abbau kostet Ausdauer: weiche Erde fast nichts, natürlicher Fels
mehr und mit Gestein als Ertrag, Spielerwände am meisten.

**Verteidigungs-Aufbau.** Wände sitzen auf den Kanten eines Feldes, nicht
darauf. Räume bleiben begehbar und werden nach außen gepanzert. Labyrinthe
sind damit nutzlos, weil ein Angreifer sich eigene Wege gräbt — der
Verteidiger staffelt den Hive in Schichten immer härterer Wände. Innen
stehen Wächter, die bei einem Einbruch rundenbasiert aufwachen.

**Asynchrones Echo.** Beschädigte Gebäude sind Ruinen und produzieren
nichts, bis sie repariert sind; die Reparatur kostet Basisressourcen und
geschieht sofort, damit der Spieler weiterarbeiten kann. Nur ein Hive-Verlust
nimmt harte Ressourcen aus dem Hauptspeicher. Jeder Angriff hinterlässt
einen Riss mit den exakten Koordinaten für einen Rache-Raid mit
Loot-Bonus; ein Rache-Raid erzeugt selbst keinen neuen Riss, damit kein
endloses Wechsel-Handeln entsteht.

---

## Der Konflikt mit §8

`AGENTS.md` §8 sagt wörtlich: *„Der Untergrund bleibt bei einer Art: heller
Stein. Obsidian und Sand wurden verworfen."* Der Entwurf braucht beide
Sorten, weil die harte Ausdauer-Wand sie unterscheidet und die Beute sie
trägt. **§8 ist damit überholt und wird im selben Zug angepasst**, nicht
stillschweigend umgangen.

Was aus der Erweiterung folgt, und warum es technisch teuer ist:

- **Stein und Obsidian brauchen eine eigene Art, kein Material.** Sie
  unterscheiden sich darin, ob sie eine Wand tragen und ob sie Beute
  einbringen. Ein reines Material auf vorhandenen Kacheln verliert diese
  Unterscheidung im Kachelzustand, an dem Abbau und Verteidigung hängen.
- **`isEarth()` bleibt unangetastet.** Stein und Obsidian sind abbaubares
  Terrain, aber *nicht* Erdreich im Sinne der Mining-Regel. Würde man
  `isEarth()` erweitern, akzeptiert `isMineableEarth()` in
  `src/domain/actions/mining.js` jedes harte Feld als abbaubare Erde, und
  die Abbaubarkeit verliert ihren Preisunterschied. Beide Abbauregeln
  brauchen einen gemeinsamen Ort — ein Terrain-Typ-Feld neben `TILE_KIND`,
  nicht eine Verbreiterung von `isEarth()`.
- **Kantenwände sind ein zweites Objektmodell im selben Grid.** Vier
  Wände pro Feld sind vier Sub-Entitäten pro Kachel, und das Raster kennt
  bisher ausschließlich ganze Felder. Dazu §8: *„Nichts darf als Kachel
  erkennbar sein."* Eine Wand auf der Kante muss die Fläche teilen und darf
  sie nicht als Rechteck zeichnen. Das ist eigene Geometrie in
  `src/world/`, keine Kachelvariante.
- **Der Rundenmodus ist ein zweites Zeitmodell.** Vier Uhren ticken heute
  bis zu zwanzigmal pro Sekunde. Wächter, die nach einem Einbruch
  rundenbasiert aufwachen, brauchen eine eigene Zeitbasis im selben Spiel.
  Das ist der teuerste Punkt des ganzen Vorhabens — teurer als die Wände.

---

## Die offenen Fragen

Nach Wichtigkeit geordnet, nicht nach Aufwand.

### 1. Der Kaltstart ist strukturell, nicht justierbar

Stein und Obsidian gibt es ausschließlich aus fremden Basen. Wer noch
nicht erfolgreich geraidet hat, kann keine Wände bauen, kann also nicht
verteidigen, wird leichter angegriffen und verliert Material, das er nie
hatte. Ein neuer Account ist damit dauerhaft das beste Ziel.

Das ist keine Drop-Rate, die man drehen kann — es ist ein Zustand, in dem
die Wirtschaft für eine ganze Spielerklasse nicht funktioniert. Es gibt
drei Ausgänge, und keiner davon ist gratis:

- eine Grundquelle für hartes Material, die das Monopol aufweicht,
- ein Anfangsbestand plus eine Aufgabe, den ersten Angriff zu überleben,
- oder Accounts ohne Besitz, die als Angriffsziel uninteressant sind.

**Entscheidung nötig, bevor Code entsteht.** Alles andere ist Kosmetik
daneben.

### 2. Reicht der Pool bis zum Hive?

60 Felder Weg, graben, dann die Sterne ausbluten lassen. Wenn der Rückweg
allein den halben Pool frisst, ist der Raid vorher entschieden. Das ist
eine Rechnung, keine Vermutung — sie muss **vor** dem Balancing laufen,
sonst werden Verlustquoten an Zahlen optimiert, die das Problem nicht
berühren.

### 3. Was passiert mit einem Account ohne Ressourcen?

Wer nichts zu verlieren hat, ist ein kostenloser Angriff. Damit
Zerstörung zum Vorteil wird, muss Absicht entgegenstehen. Bei diesem
Perma-Death-Modell mit 50-Prozent-Rekonstruktion tut sie das nicht
offensichtlich — ein frischer Account wäre damit ein Werkzeug.

### 4. Der Validierungsweg ist der eigentliche Bauauftrag

Der ursprüngliche Entwurf sah vor: clientseitig deterministisch rechnen,
serverseitig asynchron über maskierte Hashes validieren, und bei
Verbindungsabbruch die Runde gültig lassen.

Der Teil, der offen bleibt, ist die Validierung. Ein Client, der alles
lokal berechnet, ist per Definition nicht vertrauenswürdig, und asynchron
gegen ihn zu prüfen bedeutet: die Daten für die Prüfung müssen im Voraus
bekannt sein. Entweder

- der Server vertraut dem Ergebnis (offen, und damit keine Anti-Cheat),
- oder der Server bestimmt die Züge (und die lokale Rechnung ist nur noch
  Animation),
- oder es gibt einen dritten Weg, der nicht spezifiziert ist, solange die
  Bedrohung nicht benannt ist.

**Die Bedrohung zuerst.** Erst steht fest, welcher Angriff abgewehrt
werden soll, dann ist entscheidbar, wie viel Server nötig ist. Das ist die
Frage mit den teuersten Folgen und die einzige, die vor dem Bauen
beantwortet werden muss.

### 5. Der Sichtfeldkonflikt

§8 sieht ein 13 × 13-Fenster, das dem gebauten Raum folgt. Der Entwurf
verlangt ein Sichtfeld aus angrenzenden Feldern. Beides ist „wenige
Kacheln sichtbar", aber die Bedienung ist eine andere: der eine Auszug
folgt einem Schwerpunkt, der andere steht an der Sichtgrenze. Der
bestehende `reveal`-Pfad und sein Radius müssen entscheiden, welcher gilt.

### 6. Der Widerspruch im Zeitverhalten

Abschnitt 1 schließt Wartezeiten und Teilnahme-Währungen aus. Der
Riss-Ordner zeigt dem Verteidiger den Angriff *am nächsten Tag*. Das ist
ein Zeit-Gate. Es kann gewollt sein — ein Tag ist eine gute Runde, und
es nimmt dem Koordinatenleck etwas Wirkung —, dann gehört es ins Regelwerk
und der Widerspruch ist aufgelöst. Wenn es nicht gewollt ist, muss der
Riss sofort sichtbar sein.

### 7. Das Vendetta-Spiel steht auf

Riss mit exakten Koordinaten, Rache-Raid mit Loot-Bonus, kein neuer Riss
aus dem Rache-Raid. Das verhindert Wechsel-Handeln und erzeugt eine
Endlosschleife zwischen zwei Spielern ohne Eskalationsventil. Dazu ist die
Koordinate selbst das begehrte Gut: sie zu verbreiten ist damit ein
Griefing-Angriff, und dagegen steht im Entwurf nichts.

Ein Vorschlag, der die Schleife unterbricht: der Vorteil sinkt, wenn ein
Paar sich zu oft gegenseitig angreift. Dann lohnt Wechsel-Handeln nicht
mehr, und der Riss ist ein Hinweis statt eine Waffe.

---

## Was zuerst gebaut werden muss

Nicht die Mechanik. Diese Reihenfolge:

1. **Die Kaltstart-Frage entscheiden.** Ohne sie ist jede weitere Zahl
   Arbeit auf einem System, das trägt oder nicht.
2. **Die Bedrohung für die Validierung benennen.** Daraus folgt die
   Serverlast, und die Serverlast entscheidet, ob der Entwurf überhaupt
   in dieser Form geht.
3. **Den Stamina-Haushalt rechnen**, ausgehend vom Weg und nicht vom Hive
   aus. Ein Pool, der den Hinweg nicht überlebt, ist keine Balance-Frage.
4. **Das Terrain-Feld neben `TILE_KIND`** einführen, mit eigener Abbauregel
   und ohne `isEarth()` zu berühren.
5. **Erst dann** die Mechanik. Der Kantenwall und der Rundenmodus kommen
   zuletzt, weil beide ein neues Objekt- und Zeitmodell sind und beide
   schichtweise gebaut werden können.

## Was der Entwurf nicht löst

Der Umfang, der hier steht, ist ein Nebenpfad neben dem Slice, kein
Feature für den nächsten Release. Das Spiel ist bis heute ein Abbauspiel
ohne Gegner; das hier setzt zwei Spieler, einen persistenten Snapshot
und eine Server-Autorität voraus. Das ist ein eigener Bauabschnitt mit
eigenem Testbedarf, und der Preis dafür ist die Zeit, die nicht in die
Kachelgeometrie geht.