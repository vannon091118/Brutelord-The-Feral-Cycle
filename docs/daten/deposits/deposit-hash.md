# deposit-hash

## deposit-hash

Spiegel-Datei für `src/domain/deposits/deposit-hash.js`.

## Verantwortung

Eigener Hash und Zufallsstrom — die Domäne zieht nichts aus src/world/. Der Spielerseed
kommt als dritter Wert dazu: ohne ihn hat jeder dieselbe Welt.

## Schnittstellen

- `blockHash()`
- `unitOf()`
- `pick()`
- `keepBlock()`

Aus der Migration vom 2026-10-05 hervorgegangen.
