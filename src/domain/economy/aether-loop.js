// @doc: docs/daten/economy/aether-loop.md#aether-loop
import { AETHER_CONFIG, depthFactorOf } from './aether-config.js';

export function createAetherLedger() {
  return { stored: 0, mutations: 0, risk: 0 };
}

export function aetherYieldFor({ depth, ticks }, config = AETHER_CONFIG) {
  const factor = depthFactorOf(depth, config);
  if (factor === 0 || ticks <= 0) return 0;
  return config.yieldPerTick * ticks * factor;
}

export function depositAether(ledger, amount) {
  return amount > 0 ? { ...ledger, stored: ledger.stored + amount } : ledger;
}

export function riskOf(ledger, config = AETHER_CONFIG) {
  return Math.min(ledger.risk, config.riskCeiling);
}

export function canMutate(ledger, config = AETHER_CONFIG) {
  return ledger.stored >= config.mutationCost && riskOf(ledger, config) < config.riskCeiling;
}

export function mutate(ledger, config = AETHER_CONFIG) {
  if (!canMutate(ledger, config)) {
    const error = ledger.stored < config.mutationCost ? 'AETHER_ZU_WENIG' : 'RISIKO_ZU_HOCH';
    return { ok: false, error, ledger };
  }
  return {
    ok: true,
    ledger: {
      ...ledger,
      stored: ledger.stored - config.mutationCost,
      mutations: ledger.mutations + 1,
      risk: ledger.risk + config.riskPerMutation,
    },
  };
}

export function digAbilityOf(ledger, config = AETHER_CONFIG) {
  return config.abilityGain * ledger.mutations;
}
