/** Die Namen des Vertrags, getrennt vom Pruefer, damit beide Implementierungen
 *  dieselbe Liste lesen und keine ihre eigene fuehrt. Sitzung, Bremse,
 *  Raid-Ticket und Raid-Quittung liegen neben dem Konto, weil zwei Worker keinen
 *  gemeinsamen Prozessspeicher haben — beide Speicher fuellen dieselben
 *  vierzehn Namen. */

export const STORAGE_METHODS = Object.freeze([
  'getAccount',
  'updateAccount',
  'getState',
  'putState',
  'getSession',
  'putSession',
  'deleteSession',
  'getAttempt',
  'putAttempt',
  'putTicket',
  'getTicket',
  'takeTicket',
  'getBooking',
  'listBookings',
]);

export const STORAGE_DECISION = Object.freeze({ noAccount: 'kein konto', noTicket: 'kein ticket' });

export const ACCOUNT_COLUMNS = Object.freeze(['name', 'player_id', 'playerseed', 'verifier', 'salt']);
