# deposit-state

## deposit-state

Spiegel-Datei für `src/domain/deposits/deposit-state.js`.

## Verantwortung

Ein Vorrat: Lesen, Phase setzen, Ernte — alles über die Cluster-Id. Ein toter Vorrat bleibt
tot: der Abbau darf ihn nicht wieder öffnen. Der Vorrat leert sich im Takt des Grabens: was
am Ende übrig bleibt, gehört zur verbleibenden Grabzeit. So erreicht der Pool die Null mit
dem letzten Takt.

## Schnittstellen

- `depositOf()`
- `withDepositPhase()`
- `exposeDeposit()`
- `depositKind()` — welche Ader liegt
- `depositDef()` — die Definition der Ader
- `depositRiskClass()` / `depositRiskClassFor()` — die Risikoklasse
- `depositInfoFor()` — Ader, Risiko, Text und Gefahr in einem Zug
- `depositFill()`
- `depositStage()`
- `harvestTick()`

Aus der Migration vom 2026-10-05 hervorgegangen.
