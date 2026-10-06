/** Die festen Tickets des Raid-Golden: dieselbe Eingabe, dieselbe Erwartung.
 *  Ein Ticket traegt alles, was das Replay braucht — Seed der Verteidigerkarte,
 *  Einstieg und Team —, damit die Simulation ohne Server und ohne Browser laeuft. */
import { RAID_SIM } from '../../src/domain/raid/raid-sim.js';

function team(grit) {
  return [
    { id: 'a', name: 'Held a', atk: 10, grit, speed: 4, dig: true },
    { id: 'b', name: 'Held b', atk: 7, grit: 0, speed: 3, dig: false },
  ];
}

export const RAID_GOLDEN_TICKETS = Object.freeze([
  { key: 'standard', seed: RAID_SIM.seed, steps: RAID_SIM.steps, ticket: { id: 'g1', snapshotSeed: 4242, entry: { x: 8, y: 8 }, heroes: team(200) } },
  { key: 'scharf', seed: 0x0badcafe, steps: RAID_SIM.steps, ticket: { id: 'g2', snapshotSeed: 77, entry: { x: 12, y: 9 }, heroes: team(260) } },
  { key: 'kurz', seed: 1234, steps: 32, ticket: { id: 'g3', snapshotSeed: 4242, entry: { x: 8, y: 8 }, heroes: team(200) } },
]);
