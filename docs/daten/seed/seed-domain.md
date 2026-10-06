# seed-domain

## seed-domain

Spiegel-Datei für `src/domain/seed/seed-domain.js`.

## Verantwortung

Der Namensraum der Ableitungen. Vier Domänen — WORLD, ORGANISM, EVENT, PRESENTATION — teilen
sich nicht mehr stillschweigend einen Zahlenraum: Jede hat ihren eigenen `DOMAIN_SALT`, und
`deriveSeed()` mischt den kanonischen Seed damit. Damit hängt nicht mehr alles, was aus einem
Seed entsteht, an derselben Rechnung.

`DERIVATION_VERSION` steht bei **1**. Die heutigen Ableitungen sind Stufe 1 und bleiben
bitgleich; erst eine bewusst erhöhte Fassung darf ein anderes Ergebnis liefern. Eine neue
Ableitung nimmt `deriveSeed()`, eine bestehende wird nicht darauf umgestellt.

`SALT_HOME` ordnet jedes **bestehende** Salz-Set genau einer Domäne zu, ohne einen einzigen
Wert umzunummerieren. Die Tabelle ist die Antwort auf die Frage, wohin ein neues Salz gehört,
und sie ist prüfbar: `check-seed-domain.mjs` verlangt für jedes Set ein existierendes Modul
und genau eine Domäne aus `SEED_DOMAIN`, und für `deriveSeed()` eine eigene Zahl je Domäne.

Der Namensraum ist ein **Ort, keine Grenze im Lauf**: `deriveSeed()` hat bis heute keinen
Aufrufer, und jede bestehende Ableitung rechnet weiter mit ihrem eigenen Mixer. Die Aufrufer
zählt `Docs/ARCHITEKTUR.md`, *Wer den Seed liest*.

Der Hasher bleibt dabei, wo er ist. `stone-seed.mixSeed` (`2654435761`) und
`raid-spawn-seed.mixRaid` (`2246822519`) sind verschiedene Funktionen, und `AGENTS.md` nennt
die getrennten Instanzen ausdrücklich Absicht — die Schichtgrenze wiegt schwerer als
Wiederverwendung. Zentral wird die Normalisierung der Eingabe und der Namensraum, nicht der
Mixer.

**Vier Regeln für neue Ableitungen.** Die Wurzel geht durch `worldSeed32()` und sonst durch
nichts: eine Zahl gilt als ganze Zahl bis `4294967295`, eine Zeichenkette als 1 bis 16
Hex-Zeichen, alles andere ist `null` — eine unmögliche Saat wird nie still zur Welt des Seeds
`00000000`. Eine **Kennung** (Ticket, Konto, Burg) ist Text und geht durch `textSeed()` oder
`seedOf()`, bevor sie einen Mixer sieht: `mixRaid('abc', salt)` ist `mixRaid('xyz', salt)`,
weil `^` einen Text als `ToInt32(ToNumber(...))` liest, also als 0. Eine Änderung an einer
Ableitung ist ein Replay-Wechsel: die Fassung steigt, der Golden wird mit dem Werkzeug neu
geschrieben, der Grund steht im Body. Und rückwärts gilt: alle Bestandswerte sind eingefroren
— `check-seed-domain.mjs` hält `worldSeed32`, `floorSeed` auf Etage 0 bis 3, `blockHash` und
`depositSalt` als Literale fest.

## Schnittstellen

- `DERIVATION_VERSION`
- `SEED_DOMAIN`
- `DOMAIN_SALT`
- `SALT_HOME`
- `deriveSeed()` — für neue Ableitungen, nie für bestehende

Aus dem Determinismus-Audit vom 2026-10-06 hervorgegangen.
