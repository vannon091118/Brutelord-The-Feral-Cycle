# Wächter-Entwurf: Biomasse und der Fehlzustand

Der Entwurf liegt hier, **bevor** Code dazu entsteht. Der Anlass ist eine
Gegenprobe: der Vorschlag, einen Bedarf direkt aus der Anlage eines Dunglings zu
lesen, ist gegen den echten Code gemessen worden und fällt an drei Stellen
durch. Was daran richtig war, steht unten als Entscheidung — nicht als Patch.

Alles Weitere zum Vorhaben steht in [`ROADMAP_OPEN.md`](ROADMAP_OPEN.md); die
Ressourcenmatrix, aus der Biomasse stammt, in
[`VISION-CORE-LOOP.md`](VISION-CORE-LOOP.md). Dieses Dokument trägt die
**Messung**, die **Entscheidungen** und die **offenen Fragen**.

Der Name im Code lautet `WARDEN` und nicht `WÄCHTER`: „der Wächter" heißt in
diesem Repo schon das Gate (`Docs/WORKFLOW.md`). Zwei Bedeutungen für ein Wort
sind zwei Wahrheiten, die auseinanderlaufen.

---

## Die Messung

Nicht geschätzt, sondern gegen die echten Module gerechnet: `traitsOf` über
20 000 Genome aus `createGenome(seed)`.

| Frage | Ergebnis |
| --- | --- |
| Kleinstes `traits.vitality` | **1,0175** |
| Größtes `traits.vitality` | **1,7050** |
| Anteil unter 1,0 | **0,00 %** |
| Anteil unter 0,8 | **0,00 %** |

**Die Anlage trägt keinen Mangel.** `vitality` ist die Summe dreier additiver
Loci — `VITALITY` mit Gewicht 1, `SPINE` mit 0,15, `LIMB_THICK` mit 0,1 —, und
der schlechteste Allelwert von `SPINE` ist selbst 0,85. Ein Schwellwert „unter
0,8 presst weniger" greift also nicht selten, sondern **nie**.

**Die Neulinge sind Zwillinge.** `genomeOf(worker)` fällt auf
`genomeForStones(unitStones(worker))` zurück, und ohne Steine ist das immer
`createGenome(0x5eed)`, gemessen `vitality 1,46125`. Jeder Dungling, den der
Hive zu Beginn ausbrütet, trägt denselben Wert. Ein Hebel über die Anlage
differenziert genau in der Phase nicht, in der der Spieler ihn spüren soll.

**Es gibt keinen Fail-State.** Weder Tod noch Verbrauch noch Vorrat kommen in
`src/` vor, und Biomasse kommt dort überhaupt nicht vor. Kein Dungling kann
sterben, kein Speicher kann leer laufen, nichts kann verloren gehen. Ein Bedarf
ohne verlierbaren Zustand ist eine Anzeige, die wackelt.

**Und der naheliegende Umbau vergiftet die Essenz.** `counterScales(stones)`
faltet `balance = slotPower/peak` **innerhalb eines Trägers**; es ist eine
Optik-Rechnung und weiß nichts von Bedarf. Für einen Dungling ohne Steine ist
die gefaltete Map leer, `balance[LEGS]` damit `undefined`, und `undefined / 0,8`
ist `NaN`. In `applyEvent` würde `essence + NaN` die ganze Essenzzahl vergiften:
`canPayForMining(NaN)` ist falsch, der Bau steht für immer und ohne
Fehlermeldung. Der erste abgelegte Block eines frisch gebrüteten Dunglings
genügt dafür.

---

## Die Entscheidungen

- **W1 — Der Fehlzustand ist ein Vorrat, keine Anlage.** Nicht das Genom
  entscheidet, ob etwas fehlt, sondern der Speicherstand der Kolonie. Begründung
  ist die Messung: kein Genom kann unter 1,0 fallen, ein Schwellwert auf der
  Anlage wäre eine Prüfung, die niemand verletzen kann.
- **W2 — Die Anlage bepreist den Körper.** Hohe `vitality` kostet mehr Betrieb,
  statt mehr Betrieb zu liefern. Damit bekommt ein Merkmal, das heute gratis
  Größe und HP schenkt, einen Preis — und dieselbe Zahl, die den Mutanten groß
  zeichnet, macht ihn teuer. Ausgelesen wird sie über `phenotypeOf(genomeOf(…))`.
- **W3 — Genom wird über `genomeOf` gelesen, nie über `worker.genome`.**
  `worker.genome` ist `null` bei jedem Dungling ohne Steine, und `GENE_LOCI` ist
  gar kein Feld am Genom. Wer direkt liest, bekommt `undefined` und mit einem
  `?? 1` stillschweigend den Nulldurchgang: das Spiel läuft weiter und der Hebel
  ist aus. `genomeOf` ist total und liefert auch für den Neuling ein Genom.
- **W4 — Biomasse entsteht in der eigenen Erde, nicht im Raid.** Die Matrix
  nennt als Herkunft „Organik unter der Erde" — der Erzeuger liegt damit in
  derselben Handlung, die schon existiert, und der Kreis schließt sich ohne
  zweiten Spieler. Nur das **Heilen** hängt am Raid, nicht das Entstehen.
- **W5 — Der Wächter kommt mit dem Koma, nicht davor.** Ein Bau, dessen einzige
  Aufgabe es ist, etwas zu heilen, das noch nicht verwundet werden kann, hat
  keinen Abnehmer. Die Verbraucherseite wird deshalb nicht vor `D14` gebaut.
- **W6 — Der Fehlzustand ist umkehrbar und laut, nicht tödlich.** Bei leerem
  Speicher hört die Arbeit auf: der Dungling lässt den Auftrag fallen und steht
  sichtbar im `IDLE`. Er stirbt nicht. Ein stiller Tod am Bildschirmrand wäre
  keine Konsequenz, sondern ein Datenverlust, und dieser Baum hat heute keine
  einzige Oberfläche, die einen Verlust erklären könnte.
- **W7 — Ein Topf am Hive, an der Stelle, wo der Deckel schon liegt.**
  `hive.pressed` liegt am Hive und ist im HUD ablesbar; der neue Vorrat liegt
  daneben, nicht im Weltzustand. Zwei Speicherorte wären zwei Wahrheiten über
  denselben Bestand.
- **W8 — Der Takt wird zur Bilanz, nicht zum zweiten Takt.** `HIVE_TICK` läuft
  schon und pausiert von selbst, sobald `pressed` sein Budget erreicht hat; der
  Verbrauch gehört in dieselbe Rechnung. Ein eigener Zähler daneben wäre die
  dritte Uhr im selben Spiel.

---

## Die offenen Fragen

1. **Woher genau, und ist sie endlich?** Ein Erdblock kann Biomasse
   deterministisch aus demselben Seed tragen, aus dem seine Erzadern kommen —
   das braucht keinen neuen Bautyp. Erdreich wächst in dieser Welt aber nicht
   nach: wäre Biomasse damit ein zweites, endliches Budget wie Essenz, oder soll
   sie sich erneuern? Ohne diese Antwort ist keine Verbrennungsrate zu wählen.
2. **Pro Takt oder pro abgelegtem Block?** Der Takt trifft auch Dunglinge, die
   nichts tun; der abgelegte Block bestraft den Fleißigen. Beide Fassungen sind
   eine Zeile, beide haben eine andere Wirkung. Die Zahl muss gegen
   `hiveBudget` 25 und `hiveEveryMs` 10 000 gerechnet werden, sonst entsteht ein
   Deckel, den niemand mehr erreichen kann.
3. **Wen heilt die Biomasse zuerst?** Der Koma-Wächter ist Raid-Gut und damit
   `[FUTURE]`; ob zusätzlich ein Dungling in der Kolonie geheilt werden kann,
   entscheidet, ob Biomasse auch ohne Raid einen zweiten Abnehmer hat.
4. **Wo liegt der Vorrat, wenn gespeichert wird?** Das Regelwerk R1 sagt für
   den Weltzustand „die Tiefe, nicht der Seed". Ein Vorrat, der dort landet,
   braucht eine eigene Begründung, sonst trägt der Spielstand zwei Regeln.

---

## Was zuerst gebaut werden muss

1. **Der Vorrat am Hive samt Verbrauch im vorhandenen Takt.** Das ist die
   Gegenprobe auf W8: erst wenn die Bilanz läuft, ist W1 mehr als eine Absicht.
2. **Die Quelle aus der Erde**, deterministisch aus dem vorhandenen Seed.
3. **Die Anzeige und der Fail-State.** Ein leerer Speicher ohne sichtbare Folge
   ist das Problem, das dieser Entwurf lösen soll — nicht seine Nebenwirkung.
4. **Erst dann der Wächter**, mit dem Koma aus `D14`.
