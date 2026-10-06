# session

## session

Spiegel-Datei für `src/ui/account/session.js`.

## Verantwortung

Die Sitzung: Name, PlayerID, Seed und der Traeger-Token. Das ist Identität, kein
Spielstand — der Fortschritt liegt im Snapshot daneben. Der Seed entscheidet die Welt, also
muss er der sein, den der Server vergeben hat — 16 Hex-Zeichen, sonst ist es fremder Zustand
im Speicher. Der Token ist die Serverseite derselben Identität: der Server loest ihn gegen
seine Sitzungstabelle auf und glaubt keinem Feld aus dem Speicher. Fehlt er, laeuft das Spiel
weiter, aber der Stand bleibt im Browser.

## Schnittstellen

- `text()`
- `isSeed()`
- `readSession()`
- `writeSession()`
- `clearSession()`

Aus der Migration vom 2026-10-05 hervorgegangen.
