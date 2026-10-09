# order

## order

Spiegel-Datei für `src/domain/orders/order.js`.

## Verantwortung

Der Befehl als Zeile in einer Liste — und **nichts darüber hinaus**. Dieses
Modul ist ein Blatt: es kennt weder Gebäude noch Aufträge noch Dunglinge, es
weiß nur, wie eine Zeile aussieht, wie sie hinten ankommt, wie der Kopf gelesen
wird und wann die Liste voll ist. Was ein Befehl **bedeutet**, steht in
`src/domain/labour/order-job.js`; damit zeigt die Abhängigkeit in die richtige
Richtung — die Arbeit liest die Befehle, nicht die Befehle die Arbeit.

`queueMax` steht in `order-config.js`, weil die Liste in den Spielstand wandert
und der einen Byte-Deckel hat. `dropOrder` und `clearOrders` nehmen die erste
Zeile beziehungsweise alle; beide geben bei leerer Liste **dasselbe** Objekt
zurück, damit der Zustands-Hash nicht durch ein Nichts neu gerechnet wird.

## Schnittstellen

- `createOrder()`
- `pushOrder()`
- `dropOrder()`
- `clearOrders()`
- `headOrder()`
