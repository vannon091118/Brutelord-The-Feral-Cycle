# session

## session

Spiegel-Datei für `src/ui/account/session.js`.

## Verantwortung

Die Sitzung: Name, PlayerID und Seed. Das ist Identität, kein Spielstand — der
Hive-Fortschritt bleibt weiter beim Reload verloren. Der Seed entscheidet die Welt, also
muss er der sein, den der Server vergeben hat — 16 Hex-Zeichen, sonst ist es fremder Zustand
im Speicher.

## Schnittstellen

- `text()`
- `isSeed()`
- `readSession()`
- `writeSession()`
- `clearSession()`

Aus der Migration vom 2026-10-05 hervorgegangen.
