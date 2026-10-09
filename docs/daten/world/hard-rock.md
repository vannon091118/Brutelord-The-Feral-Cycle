# hard-rock

## hard-rock

Spiegel-Datei für `src/domain/world/hard-rock.js`.

## Verantwortung

Hartgestein der Heimatwelt als **ganze Blöcke** aus dem Seed, nicht als
Einzel-Stein. Ein Block ist ein zusammenhängendes Rechteck von 2 bis 4 Feldern
je Seite, trägt genau eine Sorte (Stein oder Obsidian) und wird über einen
Stride von fünf Feldern gestreut; ein Teil der Keime fällt per `skipPerMille`
aus. Damit folgt die Heimat der Entscheidung D1 aus `Docs/RAID-PLAN.md`:
Stein und Obsidian sind in jeder Welt vorhanden und im eigenen Dungeon
abbaubar, ohne Ausdauer-Kosten, aber über Zeit und Dunglinge.

Der Hive-Kern bleibt frei (`hiveExclusion`), ebenso Spawn und Leiter. Alles
leitet sich aus `rockHash` ab — dieselbe Zelle, dieselbe Sorte, derselbe Lauf.

## Schnittstellen

- `HARD_ROCK` — Stride, Größenband, Ausdünnung, Obsidian-Anteil
- `createHardRock({ width, height, hiveOrigin, seed, spawnTile })` → `{ id: Sorte }`
