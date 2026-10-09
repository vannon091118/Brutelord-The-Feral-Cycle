# order-job

## order-job

Spiegel-Datei für `src/domain/labour/order-job.js`.

## Verantwortung

Was ein Befehl **bedeutet** — der eine Ort, an dem „wann bekommt ein Dungling
Arbeit" entschieden wird. Vier Regeln, die zusammengehören und deshalb in einer
Datei liegen:

- **Der Kopf gilt.** `jobForOrder()` übersetzt die erste Zeile in einen Auftrag,
  und nur dann, wenn das Ziel noch die richtige Gestalt hat: `TARGET_STATE`
  fordert für `WORK` ein fertiges Gebäude und für `DELIVER` einen offenen
  Bauplatz. Ein Befehl auf ein Ziel, das nicht mehr passt, liefert `null`.
- **Nur eine leere Liste wird gefüllt.** `refill()` legt erst die Lieferung an
  den nächsten offenen Bauplatz ein, sonst die zugewiesene Station. Neben einer
  offenen Zeile entsteht keine neue — sonst wüchse die Liste mit jeder Lieferung
  und eine längst bezahlte Lieferung könnte den Kopf besetzen.
- **Eine erledigte Zeile fällt heraus.** `spendOrder()` ruft der Takt in dem
  Moment, in dem ein Auftrag endet.
- **Der Takt liest nur.** `orderStep()` ist der ganze Schritt eines Dunglings:
  erst für eine Lieferung zurücktreten, dann füllen, dann gehorchen. `work-tick`
  entscheidet nichts mehr, es fragt.

`assignOrder()` ist die Zuweisung des Spielers als Befehl, `standDown()` nimmt
einen Dungling aus Arbeit **und** Liste in einem Schritt zurück — Freigeben darf
nicht zwei Schritte brauchen, sonst bleibt er mit leerer Liste in einem Auftrag
hängen. Der Gate-Trait (`buildOrders: false`) greift hier: ein gieriger Dungling
bekommt keinen Lieferbefehl.

## Schnittstellen

- `assignOrder()`
- `standDown()`
- `orderStep()`
- `spendOrder()`
