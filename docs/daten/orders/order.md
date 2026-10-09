# order

## order

Spiegel-Datei für `src/domain/orders/order.js`.

## Verantwortung

Der Befehl des Spielers als Zeile in einer Liste. Ein Dungling trägt eine
Warteschlange; **nur ihr Kopf wird zu Arbeit**. `jobForOrder()` übersetzt die
Kopfzeile in einen Auftrag aus `jobs.js` — und zwar nur dann, wenn das Ziel
noch die richtige Gestalt hat: `TARGET_STATE` fordert für `WORK` ein fertiges
Gebäude und für `DELIVER` einen offenen Bauplatz. Ein Befehl auf ein Ziel, das
inzwischen fertig oder verschwunden ist, liefert deshalb `null` statt eines
Auftrags ins Leere: der Dungling bleibt stehen, statt auf etwas zu warten, das
nie kommt. Eine erledigte Zeile fällt mit `dropOrder()` heraus; das erledigt
der Takt in dem Moment, in dem der Auftrag endet. `standDown()` ist der eine
Ort, an dem ein Dungling befehlsfrei **und** arbeitetfrei wird — Freigeben darf
nicht zwei Schritte brauchen, sonst bleibt er mit leerer Liste in einem Auftrag
hängen. `queueMax` steht in `order-config.js`, weil die Liste in den Spielstand
wandert und der einen Byte-Deckel hat.

## Schnittstellen

- `createOrder()`
- `pushOrder()`
- `dropOrder()`
- `clearOrders()`
- `headOrder()`
- `assignOrder()`
- `standDown()`
- `jobForOrder()`
- `ORDER_KIND`

Weiterhin der Ort für jede spätere Befehlsart: `MOVE` und `MINE` kommen erst,
wenn der Takt sie ausführen kann — ein Befehl ohne Ausführer wäre Gerüst.
