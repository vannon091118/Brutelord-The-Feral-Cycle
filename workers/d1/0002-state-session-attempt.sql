-- Migration 0002: die Revision als Spalte, dazu Sitzung und Bremse.
--
-- Die Revision steht jetzt neben dem Spielstand: die Schreibregel prueft sie in
-- der Bedingung der `UPDATE` und schreibt in einem Schritt, damit zwei Tabs
-- nicht denselben alten Stand lesen und beide die naechste Revision buchen.
--
-- `sessions` traegt das Serverseitige der Anmeldung. Bis hierher entschied der
-- Server anhand des vom Client gelieferten Spielerseeds, wer jemand ist; jetzt
-- loest er den Traeger-Token gegen diese Tabelle auf.
--
-- `login_attempts` ist die Bremse. Im Prozessspeicher waere sie bei verteilten
-- Workern keine globale Bremse, sondern eine pro Instanz.
--
-- Angewendet wird sie mit:
--   wrangler d1 migrations apply brutalord-accounts --remote

ALTER TABLE accounts ADD COLUMN revision INTEGER;

CREATE TABLE sessions (
  token      TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at INTEGER
);

CREATE TABLE login_attempts (
  key   TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  until INTEGER NOT NULL
);
