-- Migration 0003: die Sitzung altert.
--
-- Ohne Ablaufdatum lebte ein Traeger-Token so lange wie seine Zeile. `expires_at`
-- gibt jeder Sitzung eine Frist; `readSession` prueft sie in der Bedingung, und
-- der naechste Schreibvorgang raeumt die abgelaufenen weg — dieselbe Form wie
-- bei `login_attempts`.
--
-- Die Zeilen von vor dieser Migration tragen NULL und gelten damit als
-- abgelaufen: fail closed. Wer angemeldet war, meldet sich einmal neu an.
--
-- Angewendet wird sie mit:
--   wrangler d1 migrations apply brutalord-accounts --remote

ALTER TABLE sessions ADD COLUMN expires_at INTEGER;
