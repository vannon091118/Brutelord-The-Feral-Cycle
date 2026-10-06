-- Migration 0005: die Quittung eines gebuchten Raids.
--
-- Ohne diese Zeile ist eine Buchung spurlos: die Ticketzeile wird verbraucht,
-- und danach weiss niemand mehr, ob ein Raid gebucht wurde. Genau das braucht
-- aber drei Dinge — die Antwort auf einen verlorenen Antwortweg (derselbe
-- Antrag noch einmal muss die Beute nennen und nicht 404), eine Grenze dafuer,
-- wie oft derselbe Angreifer denselben Verteidiger melken kann, und eine Liste
-- der letzten Ueberfaelle im Spiel.
--
-- Geschrieben wird sie in derselben Transaktion wie der Spielstand und die
-- Loeschung: die Quittung haengt an der Revision, die die Schreibanweisung
-- gerade gesetzt hat. Kein Raid ohne Beute, keine Quittung.
--
-- Angewendet wird sie mit:
--   wrangler d1 migrations apply brutalord-accounts --remote

CREATE TABLE raid_bookings (
  id         TEXT PRIMARY KEY,
  account    TEXT NOT NULL,
  defender   TEXT NOT NULL,
  essence    INTEGER NOT NULL,
  bloodstone INTEGER NOT NULL,
  revision   INTEGER NOT NULL,
  booked_at  INTEGER NOT NULL
);
