// @doc: docs/daten/economy/aether-config.md#aether-config
import { DEEPEST_FLOOR } from '../world/floor.js';

export const AETHER_CONFIG = Object.freeze({
  depthThreshold: DEEPEST_FLOOR + 1,
  yieldPerTick: 1,
  yieldFloor: 1,
  mutationCost: 12,
  abilityGain: 1,
  riskPerMutation: 0.25,
  riskCeiling: 1,
});

export function depthFactorOf(depth, config = AETHER_CONFIG) {
  if (depth < config.depthThreshold) return 0;
  return config.yieldFloor + (depth - config.depthThreshold);
}
