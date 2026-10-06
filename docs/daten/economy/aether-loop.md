# aether-loop

## aether-loop

Spiegel-Datei für `src/domain/economy/aether-loop.js`.

## Verantwortung

Der vollständige Erzeugungs- und Verbrauchsloop, ohne Uhr und ohne UI: tiefes
Erdreich liefert Aether, das Ledger sammelt ihn, die Mutation verbraucht ihn und
gibt dafür Grab- und Körperfähigkeit. Der Preis der Fähigkeit ist das Risiko: Jede
Mutation hebt es, und am Deckel verweigert der Loop die nächste mit einem stabilen
Fehlerschlüssel statt mit einem stillen Zahlenüberlauf. Verweigert heißt hier
auch wirklich unverändert — das übergebene Ledger bleibt dasselbe Objekt, damit
ein abgewiesener Versuch keine zweite Wahrheit im Zustand hinterlässt.

## Schnittstellen

- `createAetherLedger()` — `{ stored, mutations, risk }`
- `aetherYieldFor()` — Ausbeute je Tiefe und Takt
- `depositAether()` — Einlage, bei `amount <= 0` unverändert
- `riskOf()` — Risiko, auf den Deckel begrenzt
- `canMutate()` — genug Aether und Risiko unter dem Deckel
- `mutate()` — `{ ok, ledger }` oder `{ ok: false, error, ledger }`
- `digAbilityOf()` — die Grab- und Körperfähigkeit aus den Mutationen

Aus der Migration vom 2026-10-05 hervorgegangen.
