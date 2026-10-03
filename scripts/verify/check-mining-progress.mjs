/** Zeit- und Fortschrittsregeln des Abbaus. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { miningBurstEveryTicks, totalMiningTicks } from '../../src/domain/onboarding/onboarding-schedule.js';
import { EARTH_HEALTH } from '../../src/domain/world/tile.js';
import { check, section } from './expect.mjs';

export function checkMiningProgress(run) {
  const { reachedAt, earthHealth, ticks } = run;
  section('Abbauzeit und Erd-Zustände');
  check('Abbau dauert konfigurierte 3500 ms', reachedAt.get(ONBOARDING_STATE.TILE_DESTROYED) - reachedAt.get(ONBOARDING_STATE.MINING) === ONBOARDING_CONFIG.miningDurationMs);
  check('Genau 35 definierte Fortschrittsticks', totalMiningTicks() === 35 && ticks.length === 35);
  check('Material-Bursts haben feste Kadenz', miningBurstEveryTicks() >= 1);

  const states = earthHealth.map((entry) => entry.health);
  const touched = earthHealth.find((entry) => entry.health === EARTH_HEALTH.TOUCHED)?.tick;
  const critical = earthHealth.find((entry) => entry.health === EARTH_HEALTH.CRITICAL)?.tick;
  check('HEALTHY → TOUCHED → CRITICAL', states.join('|') === 'HEALTHY|TOUCHED|CRITICAL');
  check('TOUCHED ab 45 Prozent', touched === Math.ceil(ONBOARDING_CONFIG.earthStateThresholds.touched * totalMiningTicks()));
  check('CRITICAL ab 80 Prozent', critical === Math.ceil(ONBOARDING_CONFIG.earthStateThresholds.critical * totalMiningTicks()));
}
