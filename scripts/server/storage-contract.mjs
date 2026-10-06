/** Die Namen des Vertrags, getrennt vom Pruefer, damit beide Implementierungen
 *  dieselbe Liste lesen und keine ihre eigene fuehrt. Die Sitzung und die
 *  Bremse liegen neben dem Konto, weil zwei Worker keinen gemeinsamen
 *  Prozessspeicher haben — beide Speicher fuellen dieselben acht Namen. */

export const STORAGE_METHODS = Object.freeze([
  'getAccount',
  'updateAccount',
  'getState',
  'putState',
  'getSession',
  'putSession',
  'getAttempt',
  'putAttempt',
]);

export const ACCOUNT_COLUMNS = Object.freeze(['name', 'player_id', 'playerseed', 'verifier', 'salt']);
