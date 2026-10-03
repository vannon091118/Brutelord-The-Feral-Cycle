/** Ein Durchlauf des Slice mit Beobachtung. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { allTiles, getTile } from '../../src/domain/world/grid.js';
import { TILE_KIND, tileId } from '../../src/domain/world/tile.js';
import { VirtualClock } from './virtual-clock.mjs';

const TARGET_TILE = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

function countEarth(world) {
  return allTiles(world).filter((tile) => tile.kind === TILE_KIND.EARTH).length;
}

function makeObserver(records) {
  return {
    onTransition: (state, now) => {
      if (!records.reachedAt.has(state)) records.reachedAt.set(state, now);
    },
    onDispatch: (state, now) => observeDispatch(state, now, records),
  };
}

function observeDispatch(state, now, records) {
  const dunglingState = state.dunglings[0]?.state;
  if (dunglingState && records.dunglingStates.at(-1) !== dunglingState) {
    records.dunglingStates.push(dunglingState);
  }
  const tile = getTile(state.world, TARGET_TILE);
  const lastHealth = records.earthHealth.at(-1);
  if (tile.kind === TILE_KIND.EARTH && tile.earthHealth !== lastHealth?.health) {
    records.earthHealth.push({ health: tile.earthHealth, tick: state.mining?.tick ?? 0, at: now });
  }
  if (state.mining && state.mining.tick !== records.ticks.at(-1)) {
    records.ticks.push(state.mining.tick);
  }
}

export function runSlice() {
  const records = { reachedAt: new Map(), dunglingStates: [], earthHealth: [], ticks: [] };
  const clock = new VirtualClock(makeObserver(records));
  const earthBefore = countEarth(clock.state.world);

  clock.dispatch(ACTION.HIVE_CLICKED);
  const readyForPlayer = clock.runUntil(ONBOARDING_STATE.TILE_SELECTION);
  const highlightedTileId = clock.state.highlightedTileId;

  clock.dispatch(ACTION.TILE_SELECTED, { tileId: TARGET_TILE });
  clock.dispatch(ACTION.MINING_ORDERED);
  clock.run();

  return { clock, state: clock.state, targetTileId: TARGET_TILE, readyForPlayer, highlightedTileId, earthBefore, ...records };
}
