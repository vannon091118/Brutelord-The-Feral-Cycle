# raid-bookings

## raid-bookings

Spiegel-Datei für `src/ui/raid-bookings.js`.

## Verantwortung

Die eine Leseader des Raid-Buchs: `GET /api/raid/bookings` mit dem Träger-Token der Sitzung,
und aus der Antwort genau die vier Felder, die die Oberfläche zeigt — Kennung, Verteidiger,
Essenz, Blutstein. Der Server ist die Autorität über die Quittung; diese Datei rechnet
nichts nach, sie liest und benennt. Eine fehlende Zahl wird zur Null, eine fehlende Kennung
zum Gedankenstrich, weil ein Buch mit leerem Platz besser ist als ein Buch ohne Zeile.

Vier Ausgänge, alle als Ergebnis und keiner als Wurf: keine Sitzung oder kein `fetch` (der
Production-Build hat keinen Konto-Server), ein gescheiterter Aufruf, eine Antwort, die kein
JSON ist, und eine Absage des Servers. Jeder Fall trägt seinen eigenen Satz, weil „kein
Server" und „Sitzung abgelaufen" zwei verschiedene Dinge sind und der Spieler nur das eine
davon selbst beheben kann.

## Schnittstellen

- `amountOf()`
- `readBookings()`

Neu am 2026-10-06 mit dem Raid-Buch; die gebuchte Beute hat damit eine sichtbare Kante.
