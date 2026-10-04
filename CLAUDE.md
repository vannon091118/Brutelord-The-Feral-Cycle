# CLAUDE.md

Diese Datei ist **eine Einstiegsseite, kein Regelwerk.** Die Regeln stehen in
[`AGENTS.md`](AGENTS.md) und werden hier weder wiederholt noch verlinkt
zusammengefasst — eine zweite Kopie des Regelwerks läuft still auseinander, und
die CI prüft immer nur das Original.

Verbindliche Sprache: Commit-Bodies und Code-Kommentare auf Deutsch,
Code-Bezeichner englisch.

## Was du zuerst liest

| Reihenfolge | Datei | Was du danach weißt |
| --- | --- | --- |
| 1 | [`AGENTS.md`](AGENTS.md) | die Regeln, die Caps, die Commit-Policy, die Lesereihenfolge |
| 2 | [`Docs/WORKFLOW.md`](Docs/WORKFLOW.md) | wie Gate, Abnahme, Version und CI laufen; der Ablauf eines Tasks |
| 3 | [`Docs/GOVERNANCE.md`](Docs/GOVERNANCE.md) | Dokumentationspflicht und Sorgfaltspflicht im Detail |
| 4 | [`Docs/PITFALLS.md`](Docs/PITFALLS.md) | was hier schon einmal schiefging |
| 5 | [`Docs/ARCHITEKTUR.md`](Docs/ARCHITEKTUR.md) | warum die Dinge so liegen, wie sie liegen |

## Wie das Repo aussieht

```
index.html + vite.config.js   Einstieg; Vite bindet auf 127.0.0.1
src/                          das Spiel, in fünf Ebenen (Reihenfolge in AGENTS.md §6)
scripts/                      die Wächter: Gate, Abnahmesimulation, Version, Server
tools/preview/                Browser-Preview mit Element-Marker
Docs/                         WORKFLOW, GOVERNANCE, PITFALLS, ARCHITEKTUR,
                              ROADMAP (Absicht), CHANGELOG (Ereignisse)
.github/workflows/            ci.yml (Gate) und auto-bump.yml (Versionsbot)
version.lock.json             die einzige Versionsautorität
```

## Was hier zuerst auffällt

Drei Dinge, die man kennen muss, bevor man irgendetwas anfasst:

- **Es gibt kein `npm test` und keinen Linter.** Die Wächter sind `npm run gate`
  und `npm run verify`; `verify` ist die eigentliche Abnahmesimulation.
- **Kein PR-Zirkus.** Committen und auf `main` pushen, kein Branch.
- **Gate und verify lesen Pfade relativ zum CWD.** Aus dem Repo-Wurzelverzeichnis
  starten.

Alles Weitere — Ablauf, Fallstricke, Details — steht in den fünf Dateien oben.
Diese Seite wird absichtlich nicht gepflegt, sobald dort wieder Regeln stehen.