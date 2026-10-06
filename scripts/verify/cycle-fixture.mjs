/** Die Zahlen und Treiber des Kreislaufs: Schwelle, Leiterpreis, die Beute des
 *  Raids und der Grab. Alles wird aus den Configs gelesen, damit die Abnahme
 *  keine Zahl abschreibt. */
import { AETHER_CONFIG } from '../../src/domain/economy/aether-config.js';
import { aetherYieldFor } from '../../src/domain/economy/aether-loop.js';
import { BLOODSTONE_CONFIG } from '../../src/domain/economy/bloodstone-config.js';
import { depthCostFor, raidYieldFor } from '../../src/domain/economy/bloodstone-loop.js';
import { createCycle } from '../../src/domain/economy/resource-cycle.js';
import { digInto } from '../../src/domain/actions/mining.js';

export const SCHWELLE = AETHER_CONFIG.depthThreshold;
export const MUTATIONEN = Math.ceil(AETHER_CONFIG.riskCeiling / AETHER_CONFIG.riskPerMutation);
export const GRAEBE = (MUTATIONEN + 1) * AETHER_CONFIG.mutationCost;

export function ausbeute(depth) {
  return aetherYieldFor({ depth, ticks: 1 });
}

export function ersteEtage() {
  return depthCostFor(0);
}

export function leiter() {
  let summe = 0;
  for (let etage = 0; etage < BLOODSTONE_CONFIG.maxDepth; etage += 1) summe += depthCostFor(etage);
  return summe;
}

export function beute(essence = 30) {
  return {
    essence,
    bloodstone: raidYieldFor({
      phase: BLOODSTONE_CONFIG.minRaidPhase,
      hiveKind: BLOODSTONE_CONFIG.hostileHiveKind,
      wardenAlive: false,
    }),
  };
}

export function einGrab(cycle, depth) {
  return digInto(cycle, depth);
}

export function grabe(cycle, depth, schritte) {
  let next = cycle;
  for (let schritt = 0; schritt < schritte; schritt += 1) next = digInto(next, depth);
  return next;
}

export function leeres() {
  return createCycle();
}
