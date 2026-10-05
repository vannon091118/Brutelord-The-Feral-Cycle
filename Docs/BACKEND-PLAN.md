# Backend-Plan: Schiedsrichter, keine Game-Server

Der Entwurf liegt hier, **bevor** der Rest gebaut wird. Grund ist derselbe
wie beim Raid: die offene Roadmap führt zwei Punkte, deren erster ausdrücklich
sagt, die Wahl sei „nicht getroffen" — und `GOVERNANCE.md` verlangt, dass ein
Vorgang, der eine Vorgabe des Auftraggebers berührt, **vor** dem Code
entschieden wird.

Alles Weitere zum Konto steht in
[`ROADMAP_OPEN.md`](ROADMAP_OPEN.md). Dieses Dokument trägt die **Messung**,
die **Entscheidungen** und die **offenen Fragen**.

---

## Die Messung, die alles entschieden hat

Die Ausgangsfrage war: Trägt Cloudflares 10ms-CPU-Limit den Domänen-Replay,
oder braucht es als Fallback einen eigenen Node-Prozess? Gemessen mit
`npm run bench:replay`, wiederholbar, ohne Server, ohne Browser.

```sh
npm run bench:replay
```

Ein Lauf auf einem Container der Umgebung, Median aus 21 Messungen
nach 40 Aufwärmläufen. **Lauf zu Lauf schwanken die Zeiten um rund 10 %** — die
Tabelle ist ein Lauf, nicht die Wahrheit; entscheidend sind die Grössenordnungen
und die Nullen. Genau der Lauf, aus dem die Zahlen unten stammen, steht als
`docs/daten/raid/raid-replay.md` und `raid-config.md` nicht, sondern hier.

| Fall | Log | ohne Deckel | mit Weltbau | mit Deckel |
| --- | --- | --- | --- | --- |
| Einmarsch, echter Angriff | 18 | 1,036 ms | 2,129 ms | 0,981 ms |
| Längstes erlaubtes Log | 510 | 1,469 ms | 3,642 ms | 1,474 ms |
| 798 Schritte | 798 | 2,576 ms | 5,210 ms | 0,000 ms |
| 2998 Schritte | 2998 | 14,059 ms | 29,334 ms | 0,000 ms |

`createRaidWorld` allein: 0,864 ms für 4096 Felder.

**Das Ergebnis ist nicht die Frage, die gestellt war.** Ein echter Angriff
kostet rund **2 ms** — das Limit ist fünfmal so weit weg, dass es für diese
Last nie eine Rolle spielt. **Die 10 ms sind nicht die Blockade, und der
VPS-Fallback wird für das Replay nicht gebraucht.** Wäre er teurer als 10 ms
gefallen, hätte man über einen kleineren Snapshot oder einen kürzeren Log
nachgedacht, nicht über eine andere Maschine.

**Was stattdessen gemessen wurde:** die Zeit wächst schneller als die Länge
des Logs, und **nichts hat sie bisher begrenzt**. Ein Angreifer durfte ein
Log beliebiger Länge einreichen. `record()` in `raid-state.js` kopiert bei
jedem abgesetzten Schritt das ganze Log, deshalb kostet ein 2998-Schritte-Log
gemessen **rund 29 ms** — dreimal das Budget, aus einem einzigen HTTP-Request. Die
10 ms waren nie das Problem; die fehlende Obergrenze war es.

---

## Die Entscheidungen

Jede mit dem Warum.

- **B1 — Der Replay-Deckel gehört in die Domäne, nicht in den Server.**
  `RAID_CONFIG.maxActions` steht bei **512**. Er wird in `replayMatches()`
  geprüft, also dort, wo Client und Server dieselbe Funktion benutzen. Hätte
  der Server allein geprüft, gäbe es zwei Regeln für dieselbe Sache und die
  Client-Instanz dürfte weiterlaufen, was der Server ablehnt. Der Wert ist
  nicht geraten: das längste **erlaubte** Log kostet gemessen rund 3,6 ms und
  lässt gut 6 ms Luft; der längste gemessene **unerlaubte** Fall kostet rund
  29 ms. 512 liegt rund viermal über dem längsten realistischen Einmarschweg (60
  Felder) und weit unter der Grenze, an der die Rechnung kippt.

- **B2 — Der Deckel prüft die Länge, bevor er rechnet.** Ein Vergleich gegen
  `maxActions` kostet nichts und steht vor `replayRaid()`. Deshalb steht in
  der letzten Spalte der Tabelle `0,000 ms`: ein zu langes Log wird abgewiesen,
  **ohne** dass die Rechnung einmal anfängt. Das ist der Unterschied zwischen
  einer Obergrenze und einer Schadensbegrenzung.

- **B3 — `validateRaidReplay()` gehört NICHT in das Speicher-Interface.** Das
  ist der einzige Punkt, der vom Entwurf abweicht, und er ist der wichtigste.
  Die Begründung des Entwurfs war, die Geschäftslogik vor API-Spezifika zu
  schützen — richtig. Aber das Replay ist **Rechnung, kein Speicher**: es ist
  eine reine Domänenfunktion, die im Dev-Server, in der Abnahme und im Worker
  unverändert aus `src/domain/` läuft. Im Speicher-Interface hätte jeder
  Speicher das Replay **nachbauen** müssen — zwei Implementierungen, zwei
  Wahrheiten, und der Lock-in, den das Interface verhindern sollte, wäre
  eingebaut statt verhindert. `raid-validator.mjs` rechnet deshalb über
  `src/domain/raid/`, und **beide** Speicher rufen dieselbe Funktion.

- **B4 — Das Interface liegt in `scripts/server/`, nicht in `src/`.** `src/`
  ist der Client-Baum mit vier Schichten (`domain` → `state` → `ui` → `world`)
  und einer Spiegel-Pflicht: jede Datei dort trägt genau einen `@doc`-Pointer
  und eine eigene Datei unter `docs/daten/`. Ein Server-Interface hat dort
  keine Schicht, wird von Vite nicht gebündelt und würde eine Doku-Pflicht
  tragen, die nichts erklärt. Die Datei liegt neben ihren Aufrufern; `.mjs` ist
  hier richtig, weil `"type": "module"` gilt und `scripts/` konsequent `.mjs`
  führt.

- **B5 — Der Vertrag ist geprüft, nicht beschrieben.** „Muss asynchron
  implementiert werden" ist in `storage-interface.mjs` ein Aufruf:
  `storageViolations()` verlangt alle vier Methoden **und** wirft weg, was
  nicht als `async` deklariert ist. `npm run verify` führt das gegen den
  lokalen Speicher und gegen zwei absichtlich kaputte Attrappen. Sonst wäre
  der Satz in einem Doku-Absatz steengeblieben, den der nächste Umbau still
  überschreibt.

- **B6 — Die API spricht mit dem Speicher, nicht mit der Datenbank.**
  `account-api.mjs` nimmt einen Speicher aus dem Vertrag und ist deshalb
  vollständig `async`; `plugin.mjs` baut lokal `createLocalStore()` und
  `await`et die Route. Vorher griff die API direkt auf `findAccount()` und
  `insertAccount()` zu — der Adapter wäre dann eine Attrappe gewesen, die nur
  die Abnahme benutzt. **Der Vertrag ist damit auf dem Laufweg, nicht neben
  ihm.** Die Aufrufer wurden mitgezogen: `check-account.mjs` und
  `check-account-brake.mjs` reihen ihre Prüfungen deshalb als `await`, und
  darüber `checkWorldViews` → `checkColony` → `verify-slice.mjs`.

- **B7 — Die async-Huelle löst keine Nebenläufigkeit.** `node:sqlite`
  rechnet synchron; ein `async` davor macht die **Signatur** vergleichbar,
  nicht die Arbeit nebenläufig. Das ist Absicht und keine Verkleidung: der
  Vertrag wird async geführt, damit D1 hineinpasst, und die CPU-Zeit bleibt
  dieselbe. Wer aus einem `async`-Aufruf Lockerheit ableitet, misst am Ende
  die falsche Größe.

- **B8 — Der Server fasst den Spielstand nicht an.** Er speichert ihn. Kein
  Passiv-Fortschritt, kein Aufrechnen von Offline-Zeit, kein „Catch-up" aus
  der Serveruhr. Ein Zustand, den der Server nicht versteht, kann auch keinen
  falsch zusammenzählen — das ist die Hälfte des Grundes, ihn als Blob zu
  halten.

---

## Die Umsetzung, die daraus steht

| Datei | Rolle |
| --- | --- |
| `scripts/server/storage-contract.mjs` | Die vier Methodennamen und die Spalten, getrennt vom Prüfer |
| `scripts/server/storage-interface.mjs` | Der Vertrag und `storageViolations()` |
| `scripts/server/account-store-local.mjs` | `node:sqlite` in Promises — Entwicklung, Dev-Server, Abnahme |
| `scripts/server/account-api.mjs` | Zwei Befehle, async, nur noch gegen den Vertrag (B6) |
| `workers/account-store-d1.mjs` | D1-Bindung — Produktion |
| `scripts/server/raid-validator.mjs` | Die Einreichung, gerechnet in der Domäne (B3) |
| `scripts/bench/raid-replay-bench.mjs` | `npm run bench:replay`, die Messung oben |
| `scripts/verify/check-storage.mjs` | Vertrag, Spielstand, Deckel, Validator |

**Was noch nicht steht:** kein Worker-Entrypoint, kein D1-Schema, keine
Migration. D1 kennt kein `ALTER TABLE ... IF NOT EXISTS`, das Schema gehört
als Migrationsdatei daneben — ein Schema, das bei jedem Kaltstart mitläuft,
läuft im Streitfall genau einmal. Das ist der offene Punkt 1.

---

## Die offenen Fragen

Nach Wichtigkeit geordnet.

### 1. Wie kommt der Worker in den Production-Build?

Der Konto-Server hängt heute als Vite-Plugin im Dev-Server, also gibt es in
`dist/` keine `/api/login`, und das ausgelieferte Spiel scheitert am
Konto-Tor. Das ist der Bug, den der Plan lösen soll, und er ist unabhängig von
allen Fragen hier. Der Adapter ist gebaut; es fehlt der Ort, an dem er läuft.

### 2. Wie groß ist der Spielstand, und wann wird er geschrieben?

`packState()` schreibt heute in `localStorage`, alle fünf Sekunden. Dieselben
Snapshots über HTTP sind ein Vielfaches größer, und die Frage ist nicht das
Speichern, sondern die **Schreiblast**. Ein Klickstoß erzeugt Dutzende
Snapshots. Es braucht eine Zusammenfassung (letzter Stand gewinnt) und eine
Obergrenze, sonst zahlt jeder Spieler die volle Länge seines eigenen Fortschritts
bei jedem Takt.

### 3. Was passiert bei zwei Tabs?

Ohne Serialisierung schreiben zwei Tabs denselben Spielstand. Last-write-wins
ist die ehrliche Antwort und sie reicht für einen einzelnen Spieler — aber es
muss **entschieden** sein, nicht offen bleiben.

### 4. Wann wird der Replay überhaupt eingereicht?

Der Plan setzt die Validierung voraus, aber im Repo gibt es noch keine Route,
die ein Log entgegennimmt. Bis das gebaut ist, ist `raid-validator.mjs` eine
geprüfte Funktion ohne Aufrufer — das ist Absicht (sie ist abnahmefähig, bevor
sie verdrahtet ist), aber es ist auch ein Grund, sie nicht abzuheben.

### 5. Wie groß ist ein Ticket-Log in Wirklichkeit?

Der Deckel bei 512 ist gegen den **theoretischen** Einmarschweg von 60 Feldern
gewählt, nicht gegen gemessene echte Logs — es gibt noch keine. Sobald der
erste echte Angriff durchläuft, gehört `maxActions` gegen diese Verteilung
geprüft und gegebenfalls nachgezogen. Bis dahin ist der Wert gemessen
begründet (Kosten), nicht erfahrungsgemäß (Inhalt).

---

## Was dieser Entwurf nicht löst

Der Umfang ist ein Nebenpfad neben dem Slice. Er nimmt dem Spiel nichts weg —
der Client rechnet weiterhin alles lokal — aber er ist keine Grundlage für
Echtzeit, und das ist auch nicht sein Ziel. Ein Schiedsrichter, der
Replay-Vorgänge prüft und Zustände speichert, ersetzt keinen Server, der ein
Match verteilt. Der Unterschied ist der Streit danach.
