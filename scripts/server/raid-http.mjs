/** Die Einreichung: der Server schlaegt das Ticket in seiner eigenen Zeile nach
 *  (D25), laesst das Log nachrechnen und bucht die gepruefte Beute in einem
 *  Schritt in den Heimatstand, samt Quittung (B10, B19). Kein Wurf. */
import { STORAGE_DECISION } from './storage-contract.mjs';
import { NO_STATE, STALE_STATE, isEnvelope, serverRevision } from './state-http.mjs';
import { validateRaidReplay } from './raid-validator.mjs';
import { applyRaidLoot, raidLoot } from '../../src/domain/raid/raid-loot.js';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';

export const NO_TICKET = 'Kein gueltiges Ticket.';

function nextEnvelope(envelope, loot) {
  const revision = Number.isInteger(envelope.revision) ? envelope.revision + 1 : 1;
  return { ...envelope, revision, state: applyRaidLoot(envelope.state, loot) };
}

async function verdict({ store, account, entscheidung, loot }) {
  if (entscheidung === SNAPSHOT_WRITE.ok) return { status: 200, ok: true, loot };
  if (entscheidung === SNAPSHOT_WRITE.tooLarge) return { status: 413, error: 'Anfrage zu gross.' };
  if (entscheidung === STORAGE_DECISION.noAccount) return { status: 404, error: NO_STATE };
  if (entscheidung === STORAGE_DECISION.noTicket) return { status: 404, error: NO_TICKET };
  return { status: 409, error: STALE_STATE, revision: await serverRevision(store, account) };
}

async function schonGebucht(store, account, id) {
  const quittung = await store.getBooking(id);
  if (!quittung || quittung.account !== account) return { status: 404, error: NO_TICKET };
  return { status: 200, ok: true, gebucht: true, loot: { essence: quittung.essence, bloodstone: quittung.bloodstone } };
}

export async function readBookings(store, { account }) {
  return { status: 200, bookings: await store.listBookings(account) };
}

export async function validateSubmission(store, { account, body }) {
  const id = body?.ticket?.id;
  if (typeof id !== 'string' || id === '') return { status: 422, error: NO_TICKET };
  const zeile = await store.getTicket(id);
  if (!zeile || zeile.account !== account) return schonGebucht(store, account, id);
  const geprueft = validateRaidReplay({ ticket: zeile.ticket, actions: body?.actions, claimed: body?.claimed });
  if (!geprueft.ok) return { status: 422, ok: false, reason: geprueft.reason, limit: geprueft.limit };
  const heim = await store.getState(account);
  if (!isEnvelope(heim)) return { status: 404, error: NO_STATE };
  const beute = raidLoot(geprueft.state);
  const quittung = beute.ok
    ? { defender: zeile.ticket.defender ?? '', essence: beute.loot.essence, bloodstone: beute.loot.bloodstone }
    : null;
  const entscheidung = await store.takeTicket({
    accountId: account,
    id,
    packed: beute.ok ? nextEnvelope(heim, beute.loot) : null,
    booking: quittung,
  });
  return verdict({ store, account, entscheidung, loot: beute.ok ? beute.loot : null });
}
