// @doc: docs/daten/deposits/deposit-state.md#deposit-state
import {
  DEPOSIT_KIND,
  DEPOSIT_KIND_DEFS,
  DEPOSIT_PHASE,
  ESSENCE_STAGE,
  STAGE_MIN_SHARE,
} from './deposit-config.js';

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
  if (!deposit || deposit.phase === DEPOSIT_PHASE.SPENT) return world;
  return withDepositPhase(world, deposit.id, DEPOSIT_PHASE.FOUND);
}
export function depositKind(world, tile) {
  const deposit = depositOf(world, tile);
  return deposit ? (deposit.kind ?? DEPOSIT_KIND.REICHE_ADER) : null;
}
export function depositDef(world, tile) {
  const kind = depositKind(world, tile);
  return kind ? DEPOSIT_KIND_DEFS[kind] : null;
}
export function depositRiskClass(world, tile) {
  const def = depositDef(world, tile);
  return def ? def.riskClass : null;
}
export function depositRiskClassFor(world, tile) {
  return depositRiskClass(world, tile);
}
export function depositInfoFor(world, tile) {
  const def = depositDef(world, tile);
  const hazard = def && def.hazard ? def.hazard : null;
  return {
    kind: def ? def.label : null,
    riskClass: def ? def.riskClass : null,
    riskText: def ? def.riskText : null,
    hazard,
    unknown: def ? def.unknown : false,
  };
}
export function depositFill(deposit) {
  if (!deposit || deposit.capacity <= 0) return 0;
  return Math.min(1, Math.max(0, deposit.pool / deposit.capacity));
}
export function depositStage(deposit) {
  const fill = depositFill(deposit);
  if (fill >= STAGE_MIN_SHARE.RICH) return ESSENCE_STAGE.RICH;
  if (fill >= STAGE_MIN_SHARE.MEDIUM) return ESSENCE_STAGE.MEDIUM;
  return fill > 0 ? ESSENCE_STAGE.LEAN : ESSENCE_STAGE.DEAD;
}
export function harvestTick(world, tile, progress) {
  const deposit = depositOf(world, tile);
  if (!deposit || deposit.phase !== DEPOSIT_PHASE.FOUND) return { world, gained: 0, depleted: false };
  const share = Math.min(1, Math.max(0, progress ?? 0));
  const pool = Math.min(deposit.pool, Math.ceil(deposit.capacity * (1 - share)));
  const phase = pool === 0 ? DEPOSIT_PHASE.SPENT : deposit.phase;
  const updated = { ...world, deposits: { ...world.deposits, [deposit.id]: { ...deposit, pool, phase } } };
  return { world: updated, gained: deposit.pool - pool, depleted: pool === 0 };
}

