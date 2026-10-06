-- Migration 0004: das Raid-Ticket als Zeile.
--
-- Ein Ticket ist eine Behauptung des Clients, solange der Server sie nicht
-- selbst haelt: geprueft wird nicht eine Signatur, sondern die Zeile (D25).
-- Deshalb liegt das ausgestellte Ticket hier, mit seinem Angreifer und einer
-- Frist — `readTicket` prueft die Frist in der Bedingung, ein Schreibvorgang
-- raeumt die abgelaufenen weg, dieselbe Form wie bei Sitzung und Bremse.
--
-- Der Verteidiger steht als eigene Spalte da und nicht nur im Rumpf: ein Paar
-- hat genau ein lebendes Ticket, und die neue Zeile verdraengt die alte.
--
-- Verbraucht wird die Zeile in derselben Transaktion wie die Buchung der
-- Beute: nur wer geschrieben hat, loescht sie.
--
-- Angewendet wird sie mit:
--   wrangler d1 migrations apply brutalord-accounts --remote

CREATE TABLE raid_tickets (
  id         TEXT PRIMARY KEY,
  account    TEXT NOT NULL,
  defender   TEXT NOT NULL,
  ticket     TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
