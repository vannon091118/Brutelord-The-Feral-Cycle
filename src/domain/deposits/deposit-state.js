/** Ein Vorrat: Lesen, Phase setzen, Pool leeren — alles über die Cluster-Id. */
import { DEPOSIT_PHASE } from './deposit-config.js';

export function depositOf(world, tile) {
  const id = tile?.depositId;
  return id ? world.deposits?.[id] ?? null : null;
}

export function hasDeposit(world, tile) {
  return Boolean(depositOf(world, tile));
}

export function withDepositPhase(world, id, phase) {
  const deposit = world.deposits?.[id];
  if (!deposit || deposit.phase === phase) return world;
  return { ...world, deposits: { ...world.deposits, [id]: { ...deposit, phase } } };
}

export function takeEssence(world, id, amount) {
  const deposit = world.deposits?.[id];
  if (!deposit || amount <= 0) return world;
  const taken = Math.min(amount, deposit.pool);
  const pool = deposit.pool - taken;
  const phase = pool === 0 ? DEPOSIT_PHASE.SPENT : deposit.phase;
  return { ...world, deposits: { ...world.deposits, [id]: { ...deposit, pool, phase, yielded: deposit.yielded + taken } } };
}
