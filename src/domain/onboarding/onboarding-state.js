/** Zustände und Übergänge des Onboardings. */
export const ONBOARDING_STATE = Object.freeze({
  INITIAL: 'INITIAL',
  HIVE_CLICKED: 'HIVE_CLICKED',
  MUTATING: 'MUTATING',
  WAITING_FOR_DUNGLING: 'WAITING_FOR_DUNGLING',
  DUNGLING_SPAWNING: 'DUNGLING_SPAWNING',
  DUNGLING_IDLE: 'DUNGLING_IDLE',
  TILE_SELECTION: 'TILE_SELECTION',
  ACTION_MENU: 'ACTION_MENU',
  MOVING_TO_TILE: 'MOVING_TO_TILE',
  MINING: 'MINING',
  TILE_DESTROYED: 'TILE_DESTROYED',
  GRID_EXPANDED: 'GRID_EXPANDED',
  BUILD_MENU_VISIBLE: 'BUILD_MENU_VISIBLE',
});

export const ONBOARDING_ORDER = Object.freeze([
  ONBOARDING_STATE.INITIAL,
  ONBOARDING_STATE.HIVE_CLICKED,
  ONBOARDING_STATE.MUTATING,
  ONBOARDING_STATE.WAITING_FOR_DUNGLING,
  ONBOARDING_STATE.DUNGLING_SPAWNING,
  ONBOARDING_STATE.DUNGLING_IDLE,
  ONBOARDING_STATE.TILE_SELECTION,
  ONBOARDING_STATE.ACTION_MENU,
  ONBOARDING_STATE.MOVING_TO_TILE,
  ONBOARDING_STATE.MINING,
  ONBOARDING_STATE.TILE_DESTROYED,
  ONBOARDING_STATE.GRID_EXPANDED,
  ONBOARDING_STATE.BUILD_MENU_VISIBLE,
]);

export function createOnboarding() {
  return {
    state: ONBOARDING_STATE.INITIAL,
    trail: [ONBOARDING_STATE.INITIAL],
  };
}

const TRAIL_LIMIT = ONBOARDING_ORDER.length * 4;

function appendTrail(trail, next) {
  return [...trail, next].slice(-TRAIL_LIMIT);
}

export function enterOnboarding(onboarding, next) {
  if (onboarding.state === next) return onboarding;
  return { state: next, trail: appendTrail(onboarding.trail, next) };
}

function stepIndex(onboarding) {
  return ONBOARDING_ORDER.indexOf(onboarding.state);
}

export function hasReached(onboarding, state) {
  return stepIndex(onboarding) >= ONBOARDING_ORDER.indexOf(state);
}
