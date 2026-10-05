/** Die Namen des Vertrags, getrennt vom Pruefer, damit beide Implementierungen
 *  dieselbe Liste lesen und keine ihre eigene fuehrt. */

export const STORAGE_METHODS = Object.freeze([
  'getAccount',
  'updateAccount',
  'getState',
  'putState',
]);

export const ACCOUNT_COLUMNS = Object.freeze(['name', 'player_id', 'playerseed', 'verifier', 'salt']);
