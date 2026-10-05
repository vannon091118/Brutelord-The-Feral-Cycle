# Vision: Core Loop, Vertikalität, Hybrid-Ökonomie

Der Nordstern. Wer an diesem Spiel baut, liest das zuerst — nicht weil es
Anleitung wäre, sondern weil eine Mechanik nur dann dazugehört, wenn sie in
eine der Regeln unten passt.

Dieses Dokument beschreibt **das Spiel**, nicht den Stand der Arbeit. Der Stand
steht im Code, und `npm run verify` sagt dir, ob er stimmt. Wer eine Aussage
über den *Bau* braucht, findet sie in [`ARCHITEKTUR.md`](ARCHITEKTUR.md);
wer eine über den *nächsten Schritt* braucht, in
[`ROADMAP_OPEN.md`](ROADMAP_OPEN.md). Zwei Klassen von Wahrheit, zwei Orte.

Die Vorlage für dieses Dokument ist der Kontext-Anker des Game Directors vom
5. Oktober 2026. Er ist hier übernommen und um die Punkte ergänzt, die sich beim
Bau als falsch oder unentscheidbar erwiesen haben — jede Ergänzung ist als
Entscheidung mit Begründung markiert und nicht als Absicht.

---

## Das Zielbild

Der Spieler gräbt nach unten, so tief es geht. Der Hive wandert mit. Jede
Etage ist eine andere Welt, und was er oben abbaut, muss unten ankommen,
sonst nutzt es nichts. Irgendwann reicht der eigene Keller nicht mehr, und er
muß in fremde Dungeons — dort entscheidet ein knappes Budget über Sieg und
Niederlage.

Drei Versprechen stecken darin, und jedes ist eine Zusage an den Spieler:

1. **Die Welt friert ein, wenn er offline geht.** Kein Passiv-Fortschritt, der
   im Hintergrund Ressourcen aufzählt.
2. **Der Preis einer Etage steigt.** Tiefe ist kein freier Raum.
3. **Niemand verliert Ressourcen an PvP.** Wer verliert, verliert Rang.

---

## Harte Regeln

Diese Regeln sind nicht Verhandlungsgegenstand. Sie stehen hier, weil sie das
Design tragen, und sie stehen nicht im Code, weil sie das Design *erklären*.

### R1 — Der Raster ist eine Funktion aus Seed und Tiefe

Eine Ebene entsteht aus dem Spielerseed und der Tiefe. Derselbe Seed auf
Tiefe 2 ergibt eine andere Welt als auf Tiefe 0; derselbe Seed auf derselben
Tiefe ergibt **immer** dieselbe. Aus dieser Regel folgt die harte Grenze: Der
Weltzustand speichert die **Tiefe**, nicht den Spielerseed als abgeleitete
Größe.

*Warum:* Ein LCG läuft nur vorwärts. Wer den Spielerseed aus dem Welt-Seed
zurückrechnen wollte, baute sich eine zweite Wahrheit neben der ersten — beide
 plausibel, keine belegbar. Gemessen: **alle** Tiefen ungleich 0 kamen falsch
zurück. Der Spielerseed bleibt deshalb eine *Eingabe* des Zustands.

*Folge fürs Speichern:* Der Spielstand schreibt Abweichungen vom Seed-Zustand.
Er braucht die Tiefe, um die Seed-Welt der richtigen Etage zu rekonstruieren —
im Cache-Schlüssel **und** in der Formprüfung, sonst lädt ein alter Stand eine
fremde Ebene.

*Entscheidung, gegen die Vorlage:* Der Anker nennt die Tiefe nicht als
Zustandsfeld. Ohne sie ist das Speichern nach einem Sprung still falsch, also
steht sie im Weltzustand.

### R2 — Nur eine Etage wird gezeichnet

Der Bildschirm zeigt 13 × 13 Felder um den gebauten Raum. Wie tief der Dungeon
reicht, ändert daran nichts.

*Warum:* Das ist die eigentliche Performance-Zusage. Ein Dungeon mit 1 oder
100 Etagen zeichnet dieselbe Zahl Felder. Die Verwurzelung, das Abrauben und
der Raid laufen in der Domäne; der Renderer kennt immer nur den Ausschnitt.

### R3 — Ein Sprung ohne Ziel bewegt nichts

Die Regel gilt für jede Aktion: Was nicht ausdrücklich erlaubt ist, wird
nicht getan. Ein Sprung ohne gültiges Ziel, eine negative Tiefe, ein Text
statt einer Zahl, ein Sprung über die Grenze hinaus — alle bleiben folgenlos.

*Warum:* Der Spielstand des Spielers ist die Wahrheit. Ein Reducer, der bei
Unsinn „irgendwas Sinnvolles" tut, ist nicht reparierbar, weil niemand mehr
sagen kann, was er getan hat.

### R4 — Was der Spieler verliert, verliert er genau einmal

Ein Sprung in die Tiefe ersetzt das Gestein. Dunglinge, Bauten, Essenz und der
Brutlord bleiben — sie sind Kolonie, nicht Geologie.

*Entscheidung:* Der Anker beschreibt den Hive als wandernd. Gebaut ist bisher
nur die *Welt*; der Hive steht in allen Tiefen an derselben Stelle. Ihn
wandern zu lassen ist eine eigene Entscheidung und steht als `[FUTURE]`.

### R5 — Die Regeln stehen an einer Stelle

Jede Zahl, jede Grenze, jede Regel hat genau einen Ort im Code. Die Abnahme
misst gegen die Config, nicht gegen eine abgeschriebene Zahl. Wer eine Config
ändert, muss nicht die Prüfungen anpassen — die Prüfungen lesen dieselbe
Config.

---

## Die Ressourcenmatrix

Drei Tiers, die unterschiedliche Systeme speisen. Das ist die Antwort auf die
Frage, warum es überhaupt PvP geben muss.

| Tier | Ressource | Wofür sie da ist | Woher |
| --- | --- | --- | --- |
| 1 — Basis | **Essenz** | Arbeiter züchten, Gänge graben, Bauten setzen | Extraktoren im eigenen Keller |
| 1 — Basis | **Biomasse** | Wächter heilen, Reparatur | Organik unter der Erde |
| 2 — Tiefe | **Aether** | Mutationen, fortgeschrittene Anlagen, tiefe Etagen | Aus der Tiefe der eigenen Basis |
| 3 — PvP | **Blutstein** | Der zwingende Preis für eine neue Etage | **Nur** aus feindlichen Hives |

Der entscheidende Punkt ist der letzte: Blutstein gibt es **ausschließlich** aus
Raid-Beute. Damit ist die hybride Wirtschaft keine Kosmetik, sondern die
Voraussetzung dafür, dass der Spieler irgendwann raus muss. Aether allein
reicht nie — sonst bleibt das Spiel ein geschlossenes Turtling ohne Verlust.

*Entscheidung, gegen die Vorlage:* Der Ananker nennt auch **Kernsplitter** als
Ressource. Zwei Namen für eine Sache an zwei Stellen sind zwei Wahrheiten, die
auseinanderlaufen. Es bleibt bei **Blutstein**; wer einen zweiten Typ braucht,
baut ihn als eigene Ressource mit eigener Währung, nicht als Synonym.

---

## Der Kernloop

```
Ader abbauen → Essenz einlagern → Arbeiter und Bauten bezahlen
      ↑                                        ↓
  tiefer graben ← neue Etage ← Blutstein (aus einem Raid) ← fremder Dungeon
```

Die Kante, die diesen Kreis schließt, ist der Raid: Er liefert Blutstein, und
Blutstein liefert Tiefe, und Tiefe liefert die Adern, aus denen die nächste
Etage lebt. Ein Spieler, der nie raidet, bleibt auf den ersten Etagen stehen —
das ist Absicht und keine Schwäche.

---

## Das Etagensystem

- **Kaufen, nicht umschalten.** Eine neue Etage ist eine Ausgabe, keine
  Einstellung.
- **Der Hive zieht um** — in die tiefste, neu gekaufte Etage. Noch `[FUTURE]`.
- **Abwurfschächte statt Treppen.** Ein Dungling auf dem Weg von Etage 5 nach
  Etage 1 läuft nicht 4 Etagen: Er geht in einen Schacht, wird aus dem
  Render-Array genommen, bekommt einen Timer und spawnt unten. Zwischen den
  Etagen kostet das **null** Pfadfindung. Noch `[FUTURE]`.
- **Mathe-Catch-up beim Umschalten.** Die Zeitdifferenz wird im Hintergrund
  durch die Domäne gejagt, ohne einen Zwischenbild. Noch `[FUTURE]`.

---

## Der Raid

Asynchron, gegen den Offline-Snapshot des Gegners.

- **Ausdauer ist das Budget.** Jeder Schlag und jeder zerschlagene Block
  kostet. Fällt sie auf null, ist der Raid vorbei — und „vorbei" heißt
  *fail closed*: kein Trostpreis, kein halber Sieg.
- **Der Chokepoint ist eine Entscheidung, keine Belohnung.** Am Schacht zur
  nächsten Etage kann der Angreifer genau einmal etwas: heilen, Ausdauer
  auffüllen oder einen Buff nehmen. Er kann nicht alles.
- **Das Ziel des Verteidigers ist ein Puzzle, kein Labyrinth.** Der Bauherr
  soll den Angreifer so bluten lassen, dass er am Schacht *muss* — und genau
  deshalb fehlt ihm die Ausdauer für die nächste Etage. Ein langer Gang hilft
  niemandem; eine teure Kante schon.
- **Phantom-Loot.** Wird ein Dungeon geknackt, bekommt der Angreifer Ressourcen,
  die der Server erzeugt. Der Verteidiger verliert nichts außer Rang.

*Stand:* Der Raid-Mechanik-Unterbau existiert als `src/domain/raid/`
(Marschbewegung, Traits, Anteil statt Roheit). Die **Ausdauer** als hartes
Budget, der **Chokepoint** als Rastplatz und das **Phantom-Loot** sind
`[FUTURE]`.

---

## Dungling und Brutlord

Zwei Phasen, und die zweite ist eine Voraussetzung der ersten.

**Phase 1 — Fleisch.** Der Schwarmhort brütet Dunglinge: einfach, dumm,
begrenzt. Sie tragen Steine und graben Gänge.

**Phase 2 — Labor.** Der Brutlord ist eine Werkstatt, kein Gacha. Was in einem
Stein steckt, ist aus dem Seed berechnet: Seltenheit, Werte, Traits, und ob er
**GRABEN** kann — die Fähigkeit, ohne die ein Mutant an Hartgestein stirbt.
Ein Pity-Timer garantiert nach 30 Fehlversuchen einen legendären Stein, ohne
dass der Spieler den Zähler je sieht.

Der Stein wandert in einen **freien** Slot eines Dunglings (Kopf, Arm, Bein) und
mutiert dort. Derselbe Stein im Arm wird eine Faust, im Bein ein Schneckenfuß.
Passt die Kombination nicht, dreht `MUTANT_REVERTED` sie zurück — Rückerstattung
ist Bio-Recycling, kein Schuldensystem.

*Der Anker nennt 4 Essenz als Steinpreis und 50 % Rückerstattung, später 80 %.
Beides ist eine Zahl, die an **einer** Stelle stehen muss. Solange der Preis
nicht entschieden ist, bleibt er `[FUTURE]` — eine geratene Zahl im Code ist
schlimmer als eine fehlende.*

---

## Was das Fundament schon trägt

Der Bau, auf dem das hier steht, ist nicht hypothetisch:

- Die **Hive-Position** steht in genau einer Config, und der Onboarding-Zeitplan
  liest dieselbe.
- Der **Mutant** wird aus Seed und Slot berechnet, nicht aus einer Tabelle mit
  Bildern.
- Die **Domäne** kennt weder React noch DOM noch SVG und keinen Zufall: kein
  `Math.random()`, kein `Date.now()`. Jede sichtbare Geometrie folgt aus
  Koordinaten und Seeds.
- Der **Zeitplan** entscheidet in der Domäne, was ein Takt tut; Browser und
  Node fragen nur noch nach der Uhr.

Der vollständige Aufbau mit der Importmatrix steht in
[`ARCHITEKTUR.md`](ARCHITEKTUR.md).

---

## Was dieses Dokument nicht ist

- **Kein Feature-Forum.** Ideen ohne Code gehören nicht hierher, sondern als
  Task in den [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md).
- **Keine Zahlenquelle.** Preise, Zeiten und Grenzen stehen in den
  `*-config.js`. Wer hier eine Zahl schreibt, baut eine zweite Wahrheit.
- **Keine Abkürzung für die Abnahme.** `npm run verify` prüft den Stand, nicht
  dieses Dokument. Ein grünes `verify` bedeutet nicht, dass das Spiel dem
  Zielbild entspricht — es bedeutet, dass der gebaute Teil stimmt.
