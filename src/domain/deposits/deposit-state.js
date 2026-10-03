/** Ein Vorrat: Lesen und Phase setzen — alles über die Cluster-Id. */
import { DEPOSIT_PHASE } from './deposit-config.js';

export function depositOf(world, tile) {
  const id = tile?.depositId;
  return id ? world.deposits?.[id] ?? null : null;
}

export function withDepositPhase(world, id, phase) {
  const deposit = world.deposits?.[id];
  if (!deposit || deposit.phase === phase) return world;
  return { ...world, deposits: { ...world.deposits, [id]: { ...deposit, phase } } };
}

export function exposeDeposit(world, tile) {
  const deposit = depositOf(world, tile);
  return deposit ? withDepositPhase(world, deposit.id, DEPOSIT_PHASE.FOUND) : world;
}
