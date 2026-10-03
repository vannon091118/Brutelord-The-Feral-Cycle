/** Gemeinsame Basis der Reducer-Prüfungen: ein Zustand, in dem ein Abbau starten darf. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../src/domain/onboarding/onboarding-state.js';
import { tileId } from '../../src/domain/world/tile.js';
import { createInitialGameState } from '../../src/state/game-state.js';

const WORKER = { id: 'dungling-1', tile: { x: 0, y: 0 }, state: 'IDLE', facing: 1, targetTileId: null, job: null };

export function firstBlockId() {
  const { x, y } = ONBOARDING_CONFIG.firstEarthBlock;
  return tileId(x, y);
}

export function miningReadyState(overrides = {}) {
  const game = createInitialGameState();
  return {
    ...game,
    dunglings: [{ ...WORKER }],
    selectedTileId: firstBlockId(),
    onboarding: enterOnboarding(game.onboarding, ONBOARDING_STATE.ACTION_MENU),
    ...overrides,
  };
}