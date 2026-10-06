# action-types

## action-types

Spiegel-Datei für `src/domain/actions/action-types.js`.

## Verantwortung

Die Aktionen, die der zentrale Reducer versteht. Das Objekt ist das einzige
Register: `ACTION.X` ist nur dann eine Aktion, wenn `X` hier steht, und jeder
Wert wiederholt seinen Namen. Fehlt ein Eintrag, liest der Aufrufer `undefined`
— und weil ein Case-Label auf `undefined` in einem `switch` jede Aktion ohne
Namen trifft, fuehrt die Reducerkette sie still aus, statt sie zu verwerfen.
Die Kette ist ein Siegerrennen: der erste Reducer, der den Zustand veraendert,
beendet den Durchlauf, und alle spaeteren sehen die Aktion nie. Wer eine Aktion
umbenennt, benennt deshalb hier um und laesst beide Seiten gleichzeitig
definiert; keine Seite darf auf `undefined` stehenbleiben.
`npm run verify` prueft das mit `check-action-types.mjs`: benutzte gegen
definierte Konstanten und jeden Zeitplan-Eintrag gegen das Register.

## Schnittstellen

- keine benannten Funktionen

Aus der Migration vom 2026-10-05 hervorgegangen.
