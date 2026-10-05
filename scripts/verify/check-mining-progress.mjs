/** Zeit- und Fortschrittsregeln des Abbaus. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { miningBurstEveryTicks, totalMiningTicks } from '../../src/domain/onboarding/onboarding-schedule.js';
import { EARTH_HEALTH } from '../../src/domain/world/tile.js';
import { check, section } from './expect.mjs';

export function checkMiningProgress(run) {
  const { reachedAt, earthHealth, ticks } = run;
  const { miningDurationMs, miningTickMs, earthStateThresholds } = ONBOARDING_CONFIG;
  const expectedTicks = Math.max(1, Math.round(miningDurationMs / miningTickMs));
  section('Abbauzeit und Erd-Zustände');
  check(`Abbau dauert konfigurierte ${miningDurationMs} ms`, reachedAt.get(ONBOARDING_STATE.TILE_DESTROYED) - reachedAt.get(ONBOARDING_STATE.MINING) === miningDurationMs);
  check(`Genau die konfigurierte Anzahl Fortschrittstick — ${expectedTicks}`, ticks.length === expectedTicks, `${ticks.length} statt ${expectedTicks}`);
  check('Der Zeitplan zählt dieselbe Tickzahl', totalMiningTicks() === expectedTicks, `${totalMiningTicks()} statt ${expectedTicks}`);
  check('Material-Bursts haben feste Kadenz', miningBurstEveryTicks() >= 1);

  const states = earthHealth.map((entry) => entry.health);
  const touched = earthHealth.find((entry) => entry.health === EARTH_HEALTH.TOUCHED)?.tick;
  const critical = earthHealth.find((entry) => entry.health === EARTH_HEALTH.CRITICAL)?.tick;
  check('HEALTHY → TOUCHED → CRITICAL', states.join('|') === 'HEALTHY|TOUCHED|CRITICAL');
  check(`TOUCHED am konfigurierten Schwellenwert — ${earthStateThresholds.touched}`, touched === Math.ceil(earthStateThresholds.touched * expectedTicks));
  check(`CRITICAL am konfigurierten Schwellenwert — ${earthStateThresholds.critical}`, critical === Math.ceil(earthStateThresholds.critical * expectedTicks));
}
