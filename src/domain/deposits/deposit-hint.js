/** Der Hinweiskanal: geclaimte Nachbarn machen verborgene Vorräte spürbar. */
import { DEPOSIT_PHASE } from './deposit-config.js';
import { depositOf, withDepositPhase } from './deposit-state.js';
import { getTile } from '../world/grid.js';
import { tileId } from '../world/tile.js';

const AROUND = [-1, 0, 1];

export function touchingTiles(world, tile) {
  const found = [];
  for (const dy of AROUND) {
    for (const dx of AROUND) {
      if (dx === 0 && dy === 0) continue;
      const neighbor = getTile(world, tileId(tile.x + dx, tile.y + dy));
      if (neighbor) found.push(neighbor);
    }
  }
  return found;
}

export function hintAround(world, tile) {
  let next = world;
  for (const neighbor of touchingTiles(next, tile)) {
    const deposit = depositOf(next, neighbor);
    if (!deposit || deposit.phase !== DEPOSIT_PHASE.BURIED) continue;
    next = withDepositPhase(next, deposit.id, DEPOSIT_PHASE.HINTED);
  }
  return next;
}
