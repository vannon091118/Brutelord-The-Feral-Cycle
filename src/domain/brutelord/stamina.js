/** Logik fuer das Ausdauer-System des Raid-Teams. */

import { isMutant, unitStones } from './mutant.js';

export function calculateStamina(raidTeamIds, dunglings) {
  let totalStamina = 0;

  for (const workerId of raidTeamIds) {
    const worker = dunglings.find(w => w.id === workerId);
    if (!worker || !isMutant(worker)) continue;

    for (const stone of unitStones(worker)) {
      const gritStat = stone.stats?.find(s => s.key === 'grit');
      if (gritStat) {
        totalStamina += gritStat.value;
      }
    }
  }

  // Jeder Raidteilnehmer bringt einen Basis-Grit von 10 mit, zusaetzlich zu den Steinen.
  totalStamina += raidTeamIds.length * 10;

  return totalStamina;
}
