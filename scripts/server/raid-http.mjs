/** Die Einreichung ueber HTTP: der Validator rechnet in der Domaene (B3), die
 *  Route reicht das Log nur durch — aus einer geprueften Funktion wird ein
 *  erreichbarer Weg. Kein Wurf: ein Durchfaller ist ein Ergebnis, und das
 *  Ticket liest der Server aus seiner eigenen Zeile (D25). */
import { validateRaidReplay } from './raid-validator.mjs';

export async function validateSubmission(store, { body }) {
  const geprueft = validateRaidReplay(body ?? {});
  if (!geprueft.ok) return { status: 422, ok: false, reason: geprueft.reason, limit: geprueft.limit };
  return { status: 200, ok: true };
}
