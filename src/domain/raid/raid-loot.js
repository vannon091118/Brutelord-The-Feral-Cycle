// @doc: docs/daten/raid/raid-loot.md#raid-loot
import { raidYieldFor } from '../economy/bloodstone-loop.js';
import { BLOODSTONE_CONFIG } from '../economy/bloodstone-config.js';
import { RAID_PHASE } from './raid-phases.js';
import { anyWardenConscious } from './raid-warden.js';
import { cycleOf, lootInto } from '../economy/resource-cycle.js';

export function raidLoot(state) {
  if (state.phase !== RAID_PHASE.RESOLVED || state.lost || !state.carried) return { ok: false, reason: 'NICHT_GESICHERT' };
  const bloodstone = raidYieldFor({
    phase: state.phase,
    hiveKind: BLOODSTONE_CONFIG.hostileHiveKind,
    wardenAlive: anyWardenConscious(state.wardens),
  });
  return { ok: true, loot: Object.freeze({ essence: state.carried.essence, bloodstone }) };
}

export function applyRaidLoot(home, loot) {
  return {
    ...home,
    essence: home.essence + (loot?.essence ?? 0),
    economy: lootInto(cycleOf(home), loot),
  };
}
