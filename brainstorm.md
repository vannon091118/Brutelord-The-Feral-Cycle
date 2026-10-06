# Brainstorm: Gebäude, Ressourcenketten, Einfluss, Routinen

Arbeitsstand des Lead-Architekten für den Game Director, vom 6. Oktober 2026.
Dieses Dokument ist **kein** Plan und keine Entscheidung — es ist das
Gefäß, in dem der Auftrag "Gebäude und Ressourcenketten, mehr Einfluss,
Routinen aufbauen" gemessen wird und die Optionen liegen. Alles steht an
einer Datei fest; wo es eine Offene Frage gibt, steht sie offen. Der
Entscheidungsprotokoll ist in `Docs/` (ROADMAP_OPEN.md, VISION-CORE-LOOP.md),
diese Notiz nur das, was noch fließt.

---

## 1. Gemessen: was heute da ist

### 1.1 Gebäude — drei statische Typen, keine Netzwerke

`BUILDING_DEFS` (src/domain/buildings/building-config.js, 61 Zeilen) trägt
genau drei Typen: Schwarmhort (1x1, 6e, brütet alle 20s), Essenz Extractor 
(1x1, 5e, maxWorkers 3), Brutlord (2x2, 10e, Labor). Keine Stufen, kein Upgrade,
keine Wartung, keine Nachbarschaftsregeln.

**Gesamtbild:** Der Extractor ist das einzige Produktions-Gebäude. Der Schwarmhort
ist ein Populations-Dreher. Der Brutlord ist einmal bezahlt und dann stumm.
Zwischen Gebäuden fließt nichts.

### 1.2 Ressourcen — vier Ledger, eine Kette

- **Essenz (T1)** — Ledger: `state.essence` — **ungedeckelt**. Quellen: Hive-Pressung,
  Graben, Extractor. Senken: Graben, Bauten, Steine.
- **Aether (T2)** — Ledger existiert (resource-cycle.js). Quelle `aetherYieldFor()`
  zahlt nur auf erkaufter Tiefe. Senke `mutate()`. Kein Reducer füllt die Quelle,
  kein Chip, Mutation ist keine Wahl.
- **Blutstein (T3)** — Quelle nur aus dem Raid. Senke `unlockDepth()`. Keine Sichtbarkeit,
  kein Kauf durch den Spieler.
- **Biomasse (T1b)** — nur in WARDEN-PLAN.md, nicht in der Domäne.

**Gesamtbild:** Eine Kette (Essenz), zwei Stubs (Aether, Blutstein), eine Absicht (Biomasse).

### 1.3 Einfluss — siebzehn Aktionen, kein System

`use-game-actions.js` listet: clickHive, orderMining, chooseBuild/placeBuild, 
selectBuilding, assign/releaseWorker, Labor-Actionen, descend/climbLadder.

**Gesamtbild:** Einfluss ist heute *Befehl*. Der Spieler startet eine Kolonie,
und danach läuft sie auf ihren eigenen Bahnen.

### 1.4 Routinen — null in der Kolonie

Keine Spieler-Policy existiert. `workOf()` (work-state.js) trägt keine Regel,
die der Spieler geschrieben hat.

---

## 2. Ideen (Entwürfe, noch nicht entschieden)

### 2.1 Gebäude: von drei Knöpfen zu einem Netz

**G1 — Knoten-Typen:** Lager/Silo (Essenz->Vorratsdeckel), Aether-Destiller 
(Essenz+Tiefe->Aether), Wächter-Nest (Biomasse->Verteidigung).

**G2 — Stufen:** Jeder Typ 1-3. Offen: linear oder Zweig?

**G3 — Nachbarschaft:** Extractor neben Ader = schneller. Deterministisch.

### 2.2 Ressourcenketten

**R1 — Jobs mit Input/Output:** Jobs tragen zwischen Gebäuden, nicht nur zum Hive.
**R2 — Aether als Gebäude-Output:** Destiller + Labor-Knopf.
**R3 — Biomasse-Kette:** Graben -> Nest -> Heilung.

### 2.3 Einfluss: vier + zwei neue

Aus plan.md: E1 (Einheiten-Weisung), E2 (Mutations-Knopf), E3 (Etagen-Kauf), E4 (Kader).
Neu: **E5 — Bau-Queue**, **E6 — Policy-Wahl**.

**Empfehlung:** E5+E6 vor E1.

### 2.4 Routinen: Kolonie-Gesetze als Daten

- P1: Minen-Policy (NEAREST/RICHEST/DESIGNATED/AUTO)
- P2: Besetzungs-Policy (FILL_EMPTY/ROUND_ROBIN/MANUAL)
- P3: Bau-Queue
- P4: Einheiten-Weisung
- P5: Routine als replaybares Objekt

**Kernpunkt:** Routine = Zustand, kein Code. Keine Scripting!

---

## 3. Offene Fragen an den Director

1. Bau-Reihenfolge: Routinen zuerst oder Gebäude zuerst?
2. Tiefe der Kette: R1 (eine Zwischenstufe) oder R1+R3 (Pipeline)?
3. Biomasse: Jetzt oder später?
4. Stufen: Linear oder Zweig?
5. Essenz-Deckel: Ja oder nein?
6. Erster Hebel: Queue (E5), Policy (E6) oder Weisung (E1)?


---

## 4. Neue Perspektiven (Brainstorming)

### 4.1 Spiele-Designer-Perspektive: Kern-Loop

**Aktueller Loop:** Graben -> Essenz sammeln -> Gebäude bauen -> Automatik läuft.
**Problem:** Der Spieler hat nach der Setup-Phase wenig zu tun. Der Loop ist linear.

**Idee SP1 — Skill Tree statt Gebäude-Upgrades:**
Statt Gebäude zu leveln, gibt es einen "Kolonie-Baum": Der Spieler verdient Essenz-Punkte durch Effizienz, kauft passive Boni (z.B. "Extractor presst 20% schneller"). Das gibt Mikrofortschritt ohne Makro-Entscheidungen.

**Idee SP2 — Dynamic Events:**
Nicht nur deterministisch, sondern "ereignisgesteuert": Alle 60 Sekunden prüft der Runner zufällige Events (abhängig von Seed + Tiefe): "Ader kollabiert", "Essenz-Flut", "Räuber überfallen Lager". Der Spieler muss reagieren (umleiten, verteidigen, evakuieren).

**Idee SP3 — Endgame-Ziele:**
Der Spieler hat kein "Ziel" nach der Tiefe. Ideen:
- Rekorde: Schnellste Tiefe X erreichen
- Build-Challenges: "Baue eine Kolonie mit nur 2 Extractoren"
- Raid-Rankings: Wer besiegt den Wächter am schnellsten?

**Offen:** Endgame-Priorität vs. Core-Loop-Stabilität?

### 4.2 Wirtschafts-Perspektive: Supply & Demand

**Aktuell:** Essenz ist "unendlich" (ungerade Ledger). Kein Knappheits-Prinzip.

**Idee W1 — Essenz-Nachfrage:**
Gebäude verbrauchen Essenz nicht nur beim Bau, sondern auch im Betrieb ("Wartungskosten"). Ein Extractor kostet z.B. 0.5 Essenz/Takt. Das schafft einen fortlaufenden Druck, nicht nur einmalige Kosten.

**Idee W2 — Preismechanik:**
Ressourcenpreise variieren basierend auf Angebot/Nachfrage in der Kolonie. Wenn viele Extractoren gebaut wurden, sinkt der Essenz-Preis (weniger wertvoll). Wenn kaum Extractoren, steigt er. Das fördert Diversifikation.

**Idee W3 — Handel mit anderen Spielern?**
Nein — PvP ausgeschlossen (VISION-CORE-LOOP.md R5). Aber: "Asynchroner Handel" zwischen Kolonien desselben Spielers auf verschiedenen Tiefen. Tiefe A produziert Essenz, exportiert nach Tiefe B, die dort Blutstein produziert.

**Warnung:** Preis-Dynamik = Risiko von unbeabsichtigten Ökosystemen. Golden-Run-Tests nötig.

### 4.3 UX-Perspektive: Sichtbarkeit &discoverability

**Aktuell:** 17 Actions, aber keine "Policy-Oberfläche". Spieler muss verstehen: "Was kann ich steuern?"

**Idee UX1 — Policy-Dashboard:**
Ein separates Panel, das alle Policies anzeigt (Minen-Policy: RICHEST, Besetzung: FILL_EMPTY). Klickbar, um zu wechseln. Statt versteckter Enum-Felder.

**Idee UX2 — Bau-Queue-Vorschau:**
Wenn der Spieler eine Kachel anklickt, sieht er: "Das ist die 3. Baustelle in der Queue. Vorschau: in 45s fertig." Transparenz schafft Kontrolle.

**Idee UX3 — Flow-Indikatoren:**
Visuelle Pfeile zeigen Ressource-Flüsse (Essenz vom Extractor zum Lager, von dort zum Hive). Der Spieler sieht auf einen Blick: Wo ist der Engpass?

**Offen:** UX vs. Hard Caps (300 Zeilen pro Datei)?

### 4.4 Tech-Architektur-Perspektive: Skalierbarkeit

**Aktuell:** work-tick.js verarbeitet alle Dunglinge und Gebäude. Bei 100 Gebäuden und 500 Dunglingen könnte das langsam werden.

**Idee TA1 — Chunked Processing:**
Nicht alle Jobs gleichzeitig, sondern in "Chunks": 10 Dunglinge pro Takt verarbeiten. Rest bleibt für nächsten Tick. Erzeugt "simulierte Parallelität" ohne echte Nebenläufigkeit.

**Idee TA2 — Event-Queue statt Polling:**
Statt alle Ticks alle Dunglinge zu checken, nutzen wir ein Event-System: "Job abgeschlossen bei Zeit T". Der Runner liest nur Events, nicht den kompletten State.

**Idee TA3 — Modularität:**
Zukünftige Features (z.B. neue Ressource "Schwefel") sollen ohne Änderungen an core/work-tick.js hinzugefügt werden können. Entweder:
- Plugin-Schema (jede Ressource registriert sich selbst)
- Oder: Konfig-Driven (Config-Dateien definieren neue Ressourcen, Runner liest sie)

**Offen:** Refactor vor neuen Features, oder "Quick and Dirty" mit klarer Dokumentation?

### 4.5 Narrative-Perspektive: Welt-Erkundung

**Aktuell:** Die Welt ist "ein Dungeon nach unten". Keine Story, keine NPCs (außer Wächter im Raid).

**Idee N1 — Entdeckte Ruinen:**
Auf bestimmten Tiefen gibt es "fundstellen" — alte Brutlord-Siedlungen mit Artefakten. Der Spieler findet sie durch Graben, nicht durch Zufall. Jedes Artefakt gibt einen permanenten Bonus (z.B. "Extractoren +1 carryBonus").

**Idea N2 — Höhlenbewohner:**
Nicht-Dungling-Wesen: "Fundwesen" oder "Schattenläufer". Sie sind neutral, aber interaktiv. Der Spieler kann ihnen Essenz anbieten (Handel) oder sie vertreiben (Kampf).

**Idea N3 — Geschichte durch Umgebungsdetails:**
Jede Tiefe hat "Flüstern": Textfragmente, die von früheren Kolonien erzählen. Nicht als Quest, sondern als Lore. Bindet Spieler emotional ein.

**Offen:** Narrative vs. Gameplay-Balance? Wird Story den Loop ablenken?

---

## 5. Synthese & Empfehlungen

### Kurzfristig (nächste 2 Sprints):
1. **E5 (Bau-Queue)** — kleinster Aufwand, größter direkter Mehrwert
2. **G1a (Lager-Silo)** — Essenz-Deckel gibt dem Ledger Bedeutung
3. **P1 (Minen-Policy)** — erste Policy, einfach zu implementieren

### Mittelfristig (nächste 1-2 Wochen):
4. **E6 (Policy-Wahl)** — Dashboard für alle Policies
5. **R1 (Jobs zwischen Gebäuden)** — Basis für Ketten
6. **SP2 (Dynamic Events)** — mehr Aktivität im Core-Loop

### Langfristig (nach MVP):
7. **G2 (Stufen)** — Gebäude-Upgrades
8. **W1 (Wartungskosten)** — Wirtschaftsdynamik
9. **TA2 (Event-Queue)** — Performance-Optimierung

### Zu verwerfen (vorerst):
- Voller Handel zwischen Spielern (gegen R5)
- Offene Scripting-Sprache für Routinen (bricht Determinismus)
- Preismechanik ohne extensive Testing (zu riskant)

---

*Ende des Brainstorms vom 6. Oktober 2026. Nächster Schritt: Director-Konferenz zur Priorisierung.*


---

## 4. Zusätzliche Perspektiven

### 4.1 Spieldesign: Core-Loop-Vertiefung

**Problem:** Der aktuelle Loop (graben -> bauen -> Automatik) lässt nach Setup kaum noch Interaktion.

**Idee D1 — Mikro-Entscheidungen statt Makro-Management:**
Der Spieler soll alle 30-60 Sekunden eine sinnvolle Entscheidung treffen können:
- "Diese Ader ist bald leer -> wo graben?"
- "Extractor fast voll -> Essenz zu Lager oder Hive?"
- "Bau-Queue voll -> welches Gebäude zuerst?"

**Idee D2 — Risikogambling:**
Der Spieler kann auf "reiche Ader tippen": Eine Chance, bonus Essenz zu bekommen, aber Risiko, dass die Ader kollabiert (vorzeitiger Leerlauf). Gibt Spannung statt nur Optimierung.

**Idee D3 — Progression-Beyond-Depth:**
Nicht nur tiefer graben als Ziel. Alternativen:
- "Baue X Gebäude vom Typ Y"
- "Halte Z Essenz-Vorrat"
- "Schalte alle 3 Mutanten-Arten frei"
- "Erreiche X Dunglinge gleichzeitig"

### 4.2 Wirtschaft: Knappheit & Balance

**Problem:** Essenz ist unge deckelt -> kein Knappheitsgefühl.

**Idee E1 — Betriebliche Wartungskosten:**
Gebäude verbrauchen ongoing Essenz (z.B. 0.5/Tick pro Extractor). Das Creates einen fortlaufenden Druck, nicht nur Bau-Kosten.

**Idea E2 — Ressourcen-Spezifische Limits:**
Jede Ressource hat ein Cap (z.B. Essenz max 100). Wenn voll, wird kein mehr produziert -> Spieler muss umleiten.

**Idea E3 — Opportunitätskosten visualisieren:**
"Nimmst du diesen Extractor, kannst du später kein Lager bauen." — Zeige verpasste Optionen an.

### 4.3 UX: Sichtbarkeit des Unsichtbaren

**Problem:** Policies und Ressourcenflüsse sind invisible.

**Idea U1 — Policy-Dashboard:**
Ein Panel, das alle aktiven Policies anzeigt. Klickbar zum Ändern. Statt versteckter Enum-Felder.

**Idea U2 — Fluss-Visualisierung:**
Pfeile/Ströme zeigen, wo Essenz hingebt (Hive vs. Lager vs. Extractor). Spieler sieht Engpässe auf einen Blick.

**Idea U3 — Bau-Queue-Vorschau:**
"Das ist Position 3 in der Queue. Fertig in 45s." — Transparenz schafft Kontrolle.

### 4.4 Tech: Skalierbarkeit & Performance

**Problem:** Bei 100 Gebäuden + 500 Dunglingen könnte work-tick.js langsam werden.

**Idea T1 — Chunked Processing:**
Nicht alle Jobs gleichzeitig, sondern in Batches (10 Dunglinge/Tick). Rest für nächsten Tick.

**Idea T2 — Event-Queue:**
Statt Polling: "Job abgeschlossen bei Zeit T". Runner liest Events, nicht kompletten State.

**Idea T3 — Modularität:**
Neue Ressourcen sollen ohne core-Änderungen hinzufügbar sein (Plugin-Schema).

### 4.5 Narrative: Welt-Erkundung

**Idea N1 — Fundstellen:**
Auf bestimmten Tiefen gibt es "Ruinen" mit Artefakten (perfmanente Boni). Findet man durch Graben.

**Idea N2 — Höhlenbewohner:**
Neutrale Wesen (Handel möglich), die Ressourcen tauschen.

**Idea N3 — Umgebungsgeschichten:**
Textfragmente auf jedem Tiefe-Level enthüllen Lore über frühere Kolonien.

---

## 5. Synthese & Priorisierung

### MVP-Prioritäten (nächste 2 Sprints):
1. **E5 (Bau-Queue)** — kleinster Aufwand, größter direkter Mehrwert
2. **G1a (Lager-Silo)** — Essenz-Deckel gibt dem Ledger Bedeutung
3. **P1 (Minen-Policy)** — erste Policy, einfach zu implementieren

###中期 (nächste 1-2 Wochen):
4. **E6 (Policy-Wahl)** — Dashboard für alle Policies
5. **R1 (Jobs zwischen Gebäuden)** — Basis für Ketten
6. **D2 (Risikogambling)** — mehr Spannung im Loop

### Langfristig:
7. **G2 (Stufen)** — Gebäude-Upgrades
8. **E1 (Wartungskosten)** — Wirtschaftsdynamik
9. **T2 (Event-Queue)** — Performance-Optimierung

### Zu verwerfen (vorerst):
- Voller Handel zwischen Spielern (gegen VISION R5)
- Offene Scripting-Sprache (bricht Determinismus)
- Preismechanik ohne extensive Testing

---

*Brainstorm erweitert am 6. Oktober 2026. Nächster Schritt: Director-Entscheidungen.*


---

## 6. Zielgruppen, Motivation & Branchen-Analogien (neue Perspektive)

### 6.1 Zielgruppen-Analyse: Wen sprechen wir an?
- **Automation-/Factory-Spieler** (Factorio, Satisfactory, Shapez): Diese lieben
  Pipeline-Optimierung. "Routinen aufbauen" ist für sie kein Feature, sondern
  DAS Kern-Spielgefühl. Genau diese Zielgruppe ist der Hauptnutzer der P1-P5.
- **Colony-Sim-Spieler** (Rimworld, Prison Architect): Story-getrieben, leben
  mit zufälligen Ereignissen und Skandalen. Für sie zählt weniger die Routine,
  mehr der Narrativ-Drall (Events). Passt zu SP2 (Dynamic Events).
- **Idle-/Incremental-Spieler** (Cookie Clicker, AdFactory): Kurze Sessions,
  Fortschritt im Hintergrund. ABER: VISION-CORE-LOOP R1 verbietet passiven
  Fortschritt (Spieler friert ein). Das ist die bewusste Grenze.

### 6.2 Motivation: Warum Routinen beim Spieler haften
Selbstbestimmungstheorie (SDT) sagt: Intrinsische Motivation braucht drei Nährstoffe:
- **Autonomie**: "Ich entscheide, wie meine Kolonie funktioniert." ->
  Routinen/Policies sind Autonomie. Wer die Policy wählt, besitzt das System.
- **Kompetenzerleben**: "Mein System wird besser, weil ich es optimiere." ->
  Replaybare Routinen (P5) machen Fortschritt messbar ("vorher +40 %/h, jetzt +55 %/h").
- **Verbundenheit**: Im Solo-Spiel = Bindung an die eigene Kolonie.
  "Mein" Raster, "meine" Gewohnheiten.

**Konsequenz:** Routinen sind kein UI-Feature, sondern der Motivationskern.
Das verankert den Auftrag "Routinen aufbauen" im Spielgefühl, nicht nur im Code.

### 6.3 Branchen-Analogien: Was andere gemacht haben
- **Factorio**: Pipeline-Optimierung ist das Ziel. Der Spieler baut keine
  einzelnen Gebäude, sondern eine Fertigungskette mit Bottleneck. Genau das
  fehlt hier: R1 (Jobs zwischen Gebäuden) macht aus einem Extractor einen
  Knoten in einer Kette.
- **Rimworld**: Zufallsereignisse treiben Story. Analog: SP2 (Dynamic Events).
  VORSICHT: bricht R1 (LCG nur vorwärts) nicht — Events müssen Seed-bedingt
  sein, sonst zweiter Wahrheitsgrund.
- **Idle-Games**: Fortschritt im Hintergrund. Hier verboten (R1). Unterschied:
  Idle zählt einfach weiter; wir frieren ein. Das ist die Identität.
- **SimCity/Anno**: Zonenplanung, Stadt wächst. Analog: Das Raster ist die
  "Stadt", Routinen sind das "Stadtrecht".

### 6.4 Unerwartete Chancen & Schwächen im Ansatz
- **Schwäche im Ansatz "mehr Einfluss":** Mehr Knöpfe heißt nicht mehr Macht.
  Eher: weniger Knöpfe, mehr System. Die eigentliche Macht ist, ein System zu
  bauen, das nach den eigenen Regeln läuft. Das ist mächtiger als jeder Klick.
- **Unerwartete Chance:** Routinen als Social-Feature (auch im Singleplayer) —
  man teilt/vergleicht "Rezepte". Passt zu P5 (replaybares Objekt). Aber: kein
  PvP (R5). Nur kollektive Kultur, nicht Wettbewerb.
- **Völlig neue Richtung:** "Routinen-Museum" — die Kolonie hinterlässt Spuren,
  die man selbst sieht: wie man gespielt hat. Replay als Artefakt, nicht als
  Test. Das ist neu und emotional aufgeladen.

### 6.5 Was wir NICHT tun (Abgrenzung)
- Kein Multiplayer (R5).
- Keine offene Scripting-Sprache für Routinen (bricht Determinismus).
- Kein passiver Offline-Fortschritt (R1).
- Kein zufälliger Inhalt ohne Seed (R1).
