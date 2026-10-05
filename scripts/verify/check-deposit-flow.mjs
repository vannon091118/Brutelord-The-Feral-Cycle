/** Der ganze Weg über den echten Reducer: Ansprechen, Graben, Ernten, Sterben. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../src/domain/onboarding/onboarding-state.js';
import { DEPOSIT_PHASE } from '../../src/domain/deposits/deposit-config.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { allTiles } from '../../src/domain/world/grid.js';
import { reduceMining } from '../../src/state/reducers/mining-reducer.js';
import { check, section } from './expect.mjs';

const WORKER = { id: 'dungling-1', tile: { x: 0, y: 0 }, state: 'IDLE', facing: 1, targetTileId: null, job: null };

function tileWith(state, tileId) {
  return allTiles(state.world).find((entry) => entry.id === tileId);
}

function digOrdered(world, tileId) {
  const game = createInitialGameState();
  const ready = {
    ...game,
    world,
    dunglings: [{ ...WORKER }],
    selectedTileId: tileId,
    onboarding: enterOnboarding(game.onboarding, ONBOARDING_STATE.ACTION_MENU),
  };
  const ordered = reduceMining(ready, { type: ACTION.MINING_ORDERED });
  return reduceMining(ordered, { type: ACTION.DUNGLING_REACHED_TILE });
}

function digEveryTick(state, depositId, ticks) {
  const pools = [];
  const aims = [];
  const seqs = [];
  let next = state;
  for (let tick = 0; tick < ticks; tick += 1) {
    next = reduceMining(next, { type: ACTION.MINING_PROGRESS });
    pools.push(next.world.deposits[depositId].pool);
    aims.push(next.lastHarvest ? `${next.lastHarvest.to.x},${next.lastHarvest.to.y}` : null);
    seqs.push(next.lastHarvest ? next.lastHarvest.seq : null);
  }
  return { state: next, pools, aims, seqs };
}

function falling(pools) {
  return pools.length > 1 && pools.every((pool, index) => index === 0 || pool < pools[index - 1]);
}

export function checkDepositFlow({ rooted, targetId, ticks }) {
  const digging = digOrdered(rooted, targetId);
  const depositId = tileWith(digging, targetId).depositId;
  const opened = digging.world.deposits[depositId];
  const run = digEveryTick(digging, depositId, digging.mining.totalTicks);
  const done = reduceMining(run.state, { type: ACTION.MINING_COMPLETED });
  const end = done.world.deposits[depositId];
  const worker = tileWith(digging, targetId);
  section('Ernte: der Weg durch den echten Reducer');
  check('Der Auftrag läuft an und der Dungling erreicht die Kachel', Boolean(digging.mining));
  check('Der Vorrat öffnet sich beim Graben, nicht erst danach', opened.phase === DEPOSIT_PHASE.FOUND, opened.phase);
  check('Er öffnet sich mit vollem Pool', opened.pool === opened.capacity);
  check(`Der Pool sinkt über alle ${ticks} Takte hinweg`, falling(run.pools), `${run.pools[0]} bis ${run.pools.at(-1)}`);
  check('Jeder Takt meldet die Ernte mit wachsender Nummer', run.seqs.every((seq, i) => seq === i + 1));
  check('Jeder Takt nennt den grabenden Dungling als Ziel', run.aims.every((aim) => aim === `${worker.x},${worker.y}`));
  check('Der Pool endet bei null', end.pool === 0, `Pool ${end.pool}`);
  check('Der Vorrat stirbt als SPENT und bleibt tot', end.phase === DEPOSIT_PHASE.SPENT);
  check('Der Abbau meldet den Tod des Clusters', run.state.lastHarvest.depleted === true);
  check('Die Essenz ist angekommen', done.essence > digging.essence, `${digging.essence} zu ${done.essence}`);
}