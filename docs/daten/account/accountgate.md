# AccountGate

## accountgate

Spiegel-Datei für `src/ui/account/AccountGate.jsx`.

## Verantwortung

Das Tor: ohne Konto kein Spiel. Wer sich anmeldet, bekommt Seed und PlayerID zurück und
landet damit in seiner eigenen Welt. Ein Fehlschlag merkt sich den Modus, in dem er
passiert ist, und wird nur dort gezeigt: Wer nach „Dieser Name ist schon vergeben.“ auf
Anmelden umschaltet, liest keinen Satz mehr, der für das Anlegen galt. Der Modus selbst
bleibt eine Zeile — die Gültigkeit hängt am Fehler, nicht am Umschalter.

## Schnittstellen

- `send()`
- `AccountGate()`
- `change()`
- `submit()`

Aus der Migration vom 2026-10-05 hervorgegangen.
