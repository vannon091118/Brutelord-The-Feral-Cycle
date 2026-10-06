-- Migration 0001: die Kontotabelle samt Spielstand.
--
-- Die Spalte `state` steht von Anfang an hier und nicht als Nachzieher wie in
-- `scripts/server/account-store.mjs`: D1 kennt kein
-- `ALTER TABLE ... IF NOT EXISTS`, und ein Schema, das bei jedem Kaltstart
-- mitlaeuft, laeuft im Streitfall genau einmal. Wrangler fuehrt diese Datei
-- ueber `d1_migrations` genau einmal aus — deshalb ohne `IF NOT EXISTS`.
--
-- Angewendet wird sie mit:
--   wrangler d1 migrations apply brutalord-accounts --remote

CREATE TABLE accounts (
  name       TEXT PRIMARY KEY,
  player_id  TEXT NOT NULL,
  playerseed TEXT NOT NULL,
  verifier   TEXT NOT NULL,
  salt       TEXT NOT NULL,
  state      TEXT
);
