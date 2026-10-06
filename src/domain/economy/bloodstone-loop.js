// @doc: docs/daten/economy/bloodstone-loop.md#bloodstone-loop
import { BLOODSTONE_CONFIG } from './bloodstone-config.js';

const NOT_ENOUGH = 'bloodstone:not-enough';
const MAX_DEPTH = 'bloodstone:max-depth';
const RISK_CAP = 'bloodstone:risk-cap';

export function createBloodstoneLedger() {
  return { stored: 0, depth: 0, risk: 0 };
}

export function baseYieldFor({ ticks = 0 } = {}) {
  const takte = Number.isFinite(ticks) ? Math.max(0, ticks) : 0;
  return takte * BLOODSTONE_CONFIG.baseYield;
}

export function raidYieldFor({ phase, hiveKind, wardenAlive } = {}) {
  const geraubt = phase === BLOODSTONE_CONFIG.minRaidPhase
    && hiveKind === BLOODSTONE_CONFIG.hostileHiveKind
    && wardenAlive !== true;
  return geraubt ? BLOODSTONE_CONFIG.hiveYield : 0;
}

export function depositBloodstone(ledger, amount) {
  const menge = Number.isFinite(amount) ? Math.floor(amount) : 0;
  return menge > 0 ? { ...ledger, stored: ledger.stored + menge } : ledger;
}

export function depthCostFor(depth) {
  const etage = Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
  return BLOODSTONE_CONFIG.depthCost * (etage + 1);
}

function unlockProblem(ledger) {
  if (ledger.depth >= BLOODSTONE_CONFIG.maxDepth) return MAX_DEPTH;
  if (ledger.risk + BLOODSTONE_CONFIG.riskPerDepth > BLOODSTONE_CONFIG.maxRisk) return RISK_CAP;
  return ledger.stored < depthCostFor(ledger.depth) ? NOT_ENOUGH : null;
}

export function canUnlockDepth(ledger) {
  return unlockProblem(ledger) === null;
}

export function unlockDepth(ledger) {
  const problem = unlockProblem(ledger);
  if (problem) return { ok: false, error: problem, ledger };
  return {
    ok: true,
    ledger: {
      ...ledger,
      stored: ledger.stored - depthCostFor(ledger.depth),
      depth: ledger.depth + 1,
      risk: ledger.risk + BLOODSTONE_CONFIG.riskPerDepth,
    },
  };
}
