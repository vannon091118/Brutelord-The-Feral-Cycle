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
und sie ist prüfbar: `check-seed.mjs` verlangt für jedes Set ein existierendes Modul und
genau eine Domäne aus `SEED_DOMAIN`.

Der Hasher bleibt dabei, wo er ist. `stone-seed.mixSeed` (`2654435761`) und
`raid-spawn-seed.mixRaid` (`2246822519`) sind verschiedene Funktionen, und `AGENTS.md` nennt
die getrennten Instanzen ausdrücklich Absicht — die Schichtgrenze wiegt schwerer als
Wiederverwendung. Zentral wird die Normalisierung der Eingabe und der Namensraum, nicht der
Mixer.

## Schnittstellen

- `DERIVATION_VERSION`
- `SEED_DOMAIN`
- `DOMAIN_SALT`
- `SALT_HOME`
- `deriveSeed()` — für neue Ableitungen, nie für bestehende

Aus dem Determinismus-Audit vom 2026-10-06 hervorgegangen.
