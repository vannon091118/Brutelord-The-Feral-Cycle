# account-api

## account-api

Spiegel-Datei für `src/ui/account/account-api.js`.

## Verantwortung

Drei Aufrufe, ein Ort: das Backend antwortet mit Status und Objekt. Das Abmelden ist der
einzige, der nichts zurueckgibt, was das Spiel braucht — er entwertet den Traeger-Token
serverseitig, damit ein abgemeldeter Token keinen Namen mehr traegt.

## Schnittstellen

- `post()`
- `registerAccount()`
- `loginAccount()`
- `logoutAccount()` — entwertet den Traeger-Token auf dem Server

Aus der Migration vom 2026-10-05 hervorgegangen.
