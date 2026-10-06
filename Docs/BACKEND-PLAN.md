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
  `check-account-brake.mjs` reihen ihre Prüfungen deshalb als `await`; jeder
  der beiden hat seine eigene Zeile in `scripts/verify/groups.mjs`.

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

- **B9 — Die Identität kommt aus einem Traeger-Token, nicht aus dem Rumpf.**
  `register` und `login` geben zusätzlich zum Seed einen Token aus, die
  Tabelle `sessions` hält ihn, und `/api/state` wie `/api/raid` lösen ihn
  serverseitig auf. Vorher entschied ein vom Client gelieferter `playerseed`,
  wer jemand ist — sobald der Server mehr als Konten hält, ist das keine
  Authentifizierung, sondern eine Behauptung. Der Seed bleibt die Eingabe der
  Welt; er ist nur kein Ausweis mehr.

- **B10 — Die Revision wird nicht gelesen, sondern geprüft.** Die Spalte
  `revision` steht neben `state`, und die Bedingung sitzt in der `UPDATE`
  selbst. Ein Lesen-dann-Schreiben ist genau die Lücke, durch die zwei Tabs
  dieselbe nächste Revision buchen. Verliert ein Schreiber, antwortet der
  Server 409 statt zu überschreiben.

- **B11 — Die Bremse liegt im Speicher des Kontos, nicht im Prozess.** Ein
  `new Map()` im Worker ist keine globale Bremse, sondern eine je Instanz;
  verteilte Worker teilen sich keinen Prozessspeicher. Die Tabelle
  `login_attempts` hält den Zähler, die Regel steht in `account-throttle.mjs`
  als reine Funktion über einem Eintrag.

- **B12 — Die PlayerID ist eine eigene Kennung, nicht der verkürzte Seed.**
  `playerseed.slice(0, 8)` sind 32 Bit; bei rund 65.000 Konten kollidiert das
  zur Hälfte. Der Seed bleibt der deterministische Welt-Seed, die ID wird beim
  Anlegen gezogen (`idBytes`). Damit sind zwei Rollen zwei Werte.

- **B13 — Fehlende Kennung ist fail closed.** Ohne echte D1-Kennung zeigt die
  Bindung auf keine Datenbank. Der Wächter (`npm run deploy:guard`) liest
  `wrangler.jsonc` und bricht vor dem Deploy ab, solange dort der Platzhalter
  steht; die CI prüft nur die Regel selbst, nicht die Deploy-Umgebung.

- **B14 — Der Träger-Token wandert in ein `HttpOnly`-Cookie, und CSRF wird an
  drei Stellen gebunden.** (entschieden, noch nicht gebaut — der Umbau steht
  unten) `localStorage` ist für **jedes** Skript lesbar, das auf der Seite läuft:
  eine eingeschleuste Zeile Fremdcode liest den Ausweis und schickt ihn
  irgendwohin. Ein `HttpOnly`-Cookie sieht kein Skript. Der Preis ist echtes
  CSRF, denn der Browser hängt ein Cookie **automatisch** an — auch von einer
  fremden Seite aus. Deshalb gehört die Abwehr in denselben Umbau: `SameSite=Lax`
  als Browser-Schranke, der bestehende `sameOrigin()`-Vergleich als zweite
  Schicht, und ein **sitzungsgebundenes** CSRF-Geheimnis als Autorität. Ein
  reines Double-Submit ohne Zeile wäre schwächer: eine XSS auf einer Subdomain
  darf Cookies setzen, aber keine Datenbankzeile schreiben. Der Token darf
  deshalb auch **nicht mehr im JSON-Rumpf** stehen — sonst läse ihn das Skript
  aus der Anmeldeantwort.

- **B15 — Die Sitzung altert, und sie lässt sich widerrufen.** (gebaut) Die
  Spalte `expires_at` gibt jeder Sitzung eine Frist, `readSession()` prüft sie
  in der Bedingung der Abfrage, ein Schreibvorgang räumt die abgelaufenen weg,
  und `POST /api/logout` löscht die Zeile. Ein Token ohne Ende ist ein
  dauerhafter Schlüssel; ein „Abmelden“, das nur den Browser leert, ist keins —
  der Token bliebe gültig, bis ihn jemand findet.

- **B16 — Das Ticket ist eine Zeile, nicht eine Signatur (D25, gebaut).** Der
  Server stellt das Raid-Ticket aus (`POST /api/raid/ticket`), legt es mit Frist
  in `raid_tickets` ab und liest bei der Einreichung **seine** Zeile:
  `body.ticket.id` ist die einzige Angabe, die aus dem eingereichten Ticket
  genommen wird. Eine Signatur wäre der falsche Mechanismus — ein manipulierter
  Client prüft nichts, was er selbst mitschickt. Der Angreifer nennt nur die Ids
  seiner Dunglinge; Kader, Eintrittspunkt und Verteidiger-Snapshot kommen aus
  Zahlen, die der Server hält (`cadreRule()`, `entrySeed()`, der gespeicherte
  Stand des Verteidigers). **Ein Paar hat genau ein lebendes Ticket:**
  `raid_tickets` trägt den Verteidiger als eigene Spalte, und eine neue
  Ausstellung löscht die alte Zeile desselben Paares. Der Eintrittspunkt hängt
  am Paar und nicht an der Ticket-Id — sonst kaufte wiederholtes Fragen einen
  kürzeren Anmarsch (gemessen: acht Ausstellungen, acht Eintritte zwischen
  (11,18) und (61,44)). Die Id bleibt je Ausstellung eindeutig, weil sie der
  Schlüssel der Quittung ist.

- **B17 — Die Beute wird gebucht, nicht vereinbart (gebaut).** Die geprüfte
  Beute geht über `applyRaidLoot()` in `envelope.state`, die Revision steigt um
  genau eins, und **eine** Transaktion schreibt den Stand und verbraucht die
  Ticketzeile. Die Löschung hängt an der Revision, die die Schreibanweisung
  gerade gesetzt hat: verliert der Schreibvorgang, bleibt die Zeile stehen und
  derselbe Antrag geht noch einmal. Ohne diese Kopplung wäre die zweite
  Einreichung desselben Logs doppelte Beute — der Revisionsvergleich allein
  fängt sie nicht, weil ein zweiter Tab die neue Revision lesen kann.

- **B18 — Den Kader hält der Stand, nicht der Rumpf (D31, gebaut).** `atk`,
  `speed`, `grit`, `dig` und die Traits des Kaders kommen aus den **Steinen** der
  gespeicherten Dunglinge (`statsOf()`, Summe der Stat-Beiträge, `dig` aus der
  Grabfähigkeit), nicht aus dem Antrag. Nennt der Antrag einen dieser vier Werte
  und weicht er von der Faltung ab, antwortet `POST /api/raid/ticket` mit 422
  `GEFALSCHT`; wer nur Ids schickt, bekommt den Kader des Standes. Anlass ist
  eine Messung: derselbe Antrag mit `atk: 999999, speed: 500, grit: 1` bekam
  vorher 201, und `createRaidState()` rechnete daraus `apMax: 500` statt der
  rund 40 eines echten Dunglings — der Client stellte sich seine Helden selbst
  aus. Still zu korrigieren wäre der schlechtere Weg: der Client erführe nicht,
  dass seine Zahlen nicht mehr zählen, und ein hinterherhängender Spielstand
  raidiert unbemerkt mit dem falschen Kader.

- **B19 — Jede Buchung hinterlässt eine Quittung (gebaut).** Eine Buchung war
  spurlos: die Ticketzeile wurde verbraucht, und danach wusste niemand mehr, ob
  der Raid gebucht wurde. `raid_bookings` hält Id, Angreifer, Verteidiger,
  Beute, Revision und Zeitpunkt — geschrieben in **derselben** Transaktion wie
  der Spielstand und die Löschung, bedingt durch dieselbe Revision. Drei Dinge
  hängen daran: ein **verloren gegangener Antwortweg** ist wiederholbar (ein
  zweiter Antrag mit demselben Ticket antwortet 200 mit der gebuchten Beute
  statt 404), die Grenze je Paar lässt sich zählen (noch nicht eingebaut), und
  eine Liste der letzten Überfälle ist lesbar (`GET /api/raid/bookings`). Kein
  Raid ohne Beute, keine Quittung.

- **B20 — Die Buchungsregel läuft gegen beide Speicher (gebaut).** `check-booking`
  fährt **dieselbe** Suite gegen den lokalen Speicher und gegen eine
  D1-Attrappe über `node:sqlite`, die die echten Migrationen aus `workers/d1/`
  als Schema nimmt. Vorher war die Regel nur als SQL-Text geprüft, und der
  Speicher, der ausgeliefert wird, lief in keiner Prüfung. Der erste Lauf fand
  sofort einen Unterschied: der D1-Speicher antwortete auf ein Ticket eines
  fremden Kontos mit `veraltet` statt `kein ticket`, weil er die Zeile mit dem
  Konto verglich, statt nur ihre Existenz zu prüfen. Grenze der Attrappe: sie
  beweist Entscheidungslogik und Verträglichkeit der Anweisungen, nicht die
  Isolation und das Nebenläufigkeitsverhalten der echten D1.

---

## Die Umsetzung, die daraus steht

| Datei | Rolle |
| --- | --- |
| `scripts/server/storage-contract.mjs` | Die vier Methodennamen und die Spalten, getrennt vom Prüfer |
| `scripts/server/storage-interface.mjs` | Der Vertrag und `storageViolations()` |
| `scripts/server/account-store-local.mjs` | `node:sqlite` in Promises — Entwicklung, Dev-Server, Abnahme |
| `scripts/server/account-api.mjs` | Zwei Befehle, async, nur noch gegen den Vertrag (B6) |
| `scripts/server/account-http.mjs` | Routen, Köpfe, Absagen und die Rumpfschranke — von beiden Transporten gelesen |
| `scripts/server/plugin.mjs` | Der Vite-Haken: `configureServer` **und** `configurePreviewServer` |
| `workers/index.mjs` | Der Worker-Entrypoint: Fetch statt `node:http`, D1 statt SQLite |
| `workers/account-store-d1.mjs` | D1-Bindung — Produktion |
| `workers/d1/0001-accounts.sql` | Das Schema als Migration, samt Spalte `state` |
| `wrangler.jsonc` | Die Bindung: `main`, `dist/` als Assets, D1 als `DB` |
| `scripts/server/raid-validator.mjs` | Die Einreichung, gerechnet in der Domäne (B3) |
| `scripts/bench/raid-replay-bench.mjs` | `npm run bench:replay`, die Messung oben |
| `scripts/verify/check-storage.mjs` | Vertrag, Spielstand, Deckel, Validator, Bindung |
| `scripts/verify/check-account-worker.mjs` | Der Worker-Transport gegen den echten lokalen Speicher |
| `scripts/server/account-session.mjs` | Der Traeger-Token: ausgeben und auflösen (B9) |
| `scripts/server/state-http.mjs` | Spielstand lesen und schreiben über HTTP |
| `scripts/server/raid-http.mjs` | Die Replay-Einreichung als erreichbarer Weg; Lookup und Buchung |
| `scripts/server/raid-ticket-http.mjs` | Das Ticket ausstellen — Kader aus dem eigenen Stand, Eintritt aus dem Seed |
| `scripts/server/state-write.mjs` | Zusaetzlich zu `stateWriteStatement()` die drei Anweisungen der Buchung (`ticketSteps()`) |
| `workers/d1/0004-raid-ticket.sql` | Die Ticketzeile mit Frist und Verteidiger fuer D1 |
| `workers/d1/0005-raid-bookings.sql` | Die Quittung eines gebuchten Raids |
| `scripts/verify/booking-suite.mjs` | Die Buchung einmal beschrieben, gegen jeden Speicher gefahren (B20) |
| `scripts/verify/fake-d1.mjs` | Die D1-Attrappe mit den echten Migrationen |
| `scripts/verify/check-booking.mjs` | Dieselbe Suite gegen den lokalen und den D1-Speicher |
| `scripts/server/binding-config.mjs` | Die Regel der Auslieferungsbindung (B13) |
| `scripts/server/binding-check.mjs` | `npm run deploy:guard`, der Fail-closed-Riegel |
| `workers/d1/0002-state-session-attempt.sql` | `revision`, `sessions`, `login_attempts` |
| `workers/d1/0003-session-ttl.sql` | `expires_at` an der Sitzung — die Frist (B15) |

**Was inzwischen steht:** der Worker-Entrypoint (`workers/index.mjs`), das
Schema als Migration (`workers/d1/0001-accounts.sql`) und die Bindung in
`wrangler.jsonc`. Die Migration trägt die Spalte `state` von Anfang an: D1
kennt kein `ALTER TABLE ... IF NOT EXISTS`, und ein Schema, das bei jedem
Kaltstart mitläuft, läuft im Streitfall genau einmal — Wrangler führt die
Datei über `d1_migrations` selbst genau einmal aus, deshalb steht dort kein
`IF NOT EXISTS`. Der zweite Fund auf diesem Weg war der D1-Speicher selbst: er
kannte nur `UPDATE`, während `register()` ein neues Konto über
`updateAccount()` anlegt — jedes neue Konto wäre in der Auslieferung auf einen
500 gelaufen. Beide Speicher ziehen die fehlende Zeile jetzt mit denselben
Helfern nach. Die Einzelheiten stehen in
[`ARCHITEKTUR.md`](ARCHITEKTUR.md), *Derselbe Server an drei Orten*.

---

## Der beschlossene Umbau: der Träger-Token ins Cookie (B14)

Entschieden, **bevor** Code dazu entsteht. Die Begründung steht als B14; hier
steht die Form, in der gebaut wird, samt Reihenfolge und dem, was offen bleibt.

**Was sich ändert.** Der Token verlässt den Rumpf und den `localStorage`. Er
steht nur noch in einem `Set-Cookie` des Servers:
`HttpOnly; SameSite=Lax; Path=/api` und `Secure` nach der Bindung. Der Client
liest ihn nie — er muss es auch nicht, der Browser hängt ihn an.

**Die Schranken gegen CSRF, in dieser Reihenfolge:**

1. `SameSite=Lax` — die einzigen schreibenden Routen sind `POST`; ein
   fremdseitiges `POST` bekommt das Cookie damit gar nicht erst.
2. `sameOrigin()` bleibt, wie es ist. Es fängt den Fall, in dem ein Browser
   `SameSite` ignoriert oder die Regel zu weit greift — eine Schranke zu viel
   kostet hier nichts.
3. Das **sitzungsgebundene Geheimnis**: die Zeile in `sessions` trägt den Wert,
   die Anmeldeantwort setzt ihn als **lesbares** Cookie, der Client schickt ihn
   als `X-CSRF-Token` mit, und der Server vergleicht ihn gegen die Zeile. Ein
   Angreifer müsste also die Zeile kennen — und die liest kein Cookie.

**Die Schritte, in dieser Reihenfolge:**

1. `sessions` bekommt `csrf` (Migration `0004`); `expires_at` steht seit `0003`.
2. Ein kleines `cookie-http.mjs` baut den `Set-Cookie`-Kopf. `Secure` kommt aus
   der Bindung und steht per Vorgabe auf **an** — fail closed; nur der lokale
   `127.0.0.1`-Lauf darf ihn ausdrücklich abwählen.
3. `startSession()` gibt `{ token, csrf }` zurück, die Antwort setzt beide
   Cookies und lässt `token` **aus dem Rumpf** heraus.
4. Beide Transporte lesen den Token aus dem `Cookie`-Kopf statt aus
   `Authorization` und vergleichen bei jeder schreibenden Methode das
   `X-CSRF-Token` gegen die Zeile.
5. `logout` löscht die Zeile **und** beide Cookies.
6. Der Client: `session.js` verliert das Feld `token`, `pushEnvelope()` und die
   Konto-Aufrufe schicken `credentials: 'same-origin'` plus den CSRF-Kopf.
7. Die Abnahme: die Cookie-Zusicherungen gehören in `check-account-http.mjs`,
   weil dort ein echter Node-Server mit echten Köpfen läuft; der Worker-Ast
   prüft dieselbe Absage über `Request`/`Response`.

**Was der Umbau kostet.** Die bestehenden Sitzungen sind einmal ungültig: eine
Zeile ohne `csrf` wird abgewiesen, und wer angemeldet war, meldet sich neu an.
Das ist dieselbe Wahl wie bei `expires_at` — fail closed statt Alt-Zustand
weiterzutragen. Wer den Umbau halb macht (Cookie ohne CSRF-Bindung), hat die
XSS-Lücke gegen eine CSRF-Lücke getauscht und nichts gewonnen.

**Was offen bleibt.** `Secure` verlangt `https`; der Dev-Server läuft auf
`http://127.0.0.1`. Die Entscheidung steht (Vorgabe an, lokal abwählbar), die
Umsetzung muss sie als Wache prüfen und nicht als Kommentar behaupten. Und
`GET /api/state` bleibt ohne CSRF-Prüfung: ein Lesevorgang ändert nichts, und
`SameSite=Lax` deckt ihn ab — ein Token darauf wäre Aufwand ohne Deckung.

---

## Die offenen Fragen

Nach Wichtigkeit geordnet.

### 1. Wie kommt der Worker in den Production-Build? — beantwortet

Der Konto-Server hing als Vite-Plugin nur im Dev-Server, also gab es in
`dist/` keine `/api/login`, und das ausgelieferte Spiel scheiterte am
Konto-Tor. Der Bug war unabhängig von allen Fragen hier, und gelöst ist er in
zwei Stufen, die beide nötig sind. **Im Vorschau-Server** registriert
`accountApi()` jetzt auch `configurePreviewServer` und hängt dieselbe
Middleware ein — damit bedient der gebaute Stand, den man lokal ausliefert, die
Endpunkte. **In der Auslieferung** lief der Adapter bis hierher ohne Ort; jetzt
läuft derselbe Befehl als Worker (`workers/index.mjs`) gegen D1, gebunden über
`wrangler.jsonc` an `dist/` als Assets und an die Datenbank, deren Schema als
Migration bereitliegt.
Angewendet wird sie mit `wrangler d1 migrations apply brutalord-accounts
--remote`, angelegt mit `wrangler d1 create brutalord-accounts` — beide
Befehle laufen nicht in diesem Baum, weil `wrangler` keine Abhängigkeit des
Repos ist. Die Begründung der Aufteilung steht als *Derselbe Server an drei
Orten* in [`ARCHITEKTUR.md`](ARCHITEKTUR.md).

### 2. Wie groß ist der Spielstand, und wann wird er geschrieben? — beantwortet

`packState()` schreibt nur bei geänderter Nutzlast und höchstens alle 30 s,
gedeckelt bei 262.144 Bytes, mit monotoner Revision. Der Transport ist gebaut:
`POST /api/state` nimmt den Envelope, `GET /api/state` gibt ihn zurück, beide
verlangen einen Traeger-Token und tragen eine eigene Rumpfschranke
(`SNAPSHOT_MAX_BYTES` statt der 4096 der Kontoanträge). Der Client schickt
denselben Envelope, den er lokal sichert, über denselben Takt — kein zweiter
Zeitplan.

### 3. Was passiert bei zwei Tabs? — beantwortet

Der Schreibvorgang ist atomar (B10). Zwei Tabs, die dieselbe Revision gelesen
haben, schreiben nicht beide die nächste: der zweite bekommt 409. Last-write-wins
ist damit keine stille Überschreibung mehr, sondern eine Absage — und `changes`
entscheidet, nicht die Reihenfolge zweier Anfragen.

### 4. Wann wird der Replay überhaupt eingereicht? — beantwortet

`POST /api/raid` nimmt `{ ticket, actions, claimed }`, verlangt einen
Traeger-Token, schlägt das Ticket in seiner eigenen Zeile nach und ruft
`validateRaidReplay()`; die geprüfte Beute wird in derselben Transaktion in den
gespeicherten Heimatstand gebucht (B16, B17). Damit haben Ausstellung, Prüfung
und Auszahlung einen Weg: Spieler → Server → Raid-Prüfer → Heimatstand. Offen
bleibt der Rest des Matchmakings: den **Riss** schreiben, den Snapshot des
Verteidigers einfrieren (heute ist es sein Welt-Seed) und das Ergebnis fürs MMR
ablegen kann nur der Server, und diese Zeilen fehlen noch.

### 6. Woher kommt die Datenbankkennung, und was, wenn sie fehlt? — beantwortet

Die Kennung kennt nur die Deploy-Umgebung; sie lässt sich hier nicht erfinden,
ohne auf eine Datenbank zu zeigen, die es nicht gibt. Deshalb bleibt der
Null-Platzhalter im `wrangler.jsonc` sichtbar **als** Platzhalter, und
`npm run deploy:guard` weist ihn vor dem Ausliefern ab — fail closed (B13). Eine
erfundene Zahl wäre schlimmer als keine, weil der Fehler erst beim ersten
Schreiben auffiele.

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
