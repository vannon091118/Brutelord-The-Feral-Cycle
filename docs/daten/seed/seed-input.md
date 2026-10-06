# seed-input

## seed-input

Spiegel-Datei für `src/domain/seed/seed-input.js`.

## Verantwortung

Die eine Auslegungsregel für Seed-Eingaben. Ein Spielerseed kommt als Hex aus dem Konto oder
als Zahl aus einem Spielstand, und beide Formen landen hier. Gelesen werden immer die ersten
`WORLD_SEED.hexLength` Zeichen — genau das tat die alte Tür auch, damit ein sechzehnstelliger
Kontoseed dieselbe Welt behält wie sein achtstelliger Ableger.

Die Regel ist total und **fail closed**. Eine Zahl gilt nur als ganze Zahl von 0 bis
4294967295, jede andere Zahl ist kein Seed. Eine Zeichenkette muss aus 1 bis
`WORLD_SEED.canonicalHex` Hex-Zeichen bestehen; alles andere liefert `null`. Eine fehlende
Eingabe bleibt die anonyme Welt — das ist eine bewusste Aussage und kein Rückfall.

Vorher fiel `parseInt` einer Zeichenkette wie `ZZZZZZZZ` auf `NaN`, und `NaN >>> 0` wurde
**0**: Ein Tippfehler war still die Welt des Seeds `00000000`, von einer gültigen Null nicht
zu unterscheiden. `12xyz` las die alten Zeichen bis zum ersten ungültigen und ergab `18`
statt einer Ablehnung, `-1` wurde zu `4294967295`, `1.5` zu `1`. Beides ist jetzt `null` —
eine abgelehnte Eingabe sieht man, eine falsche Welt nicht.

## Schnittstellen

- `worldSeed32()` — die Auslegung, Rückgabe `number` oder `null`
- `SeedError` — der laute Fehler für die werfende Tür in `world-seed.js`

Aus dem Determinismus-Audit vom 2026-10-06 hervorgegangen.
