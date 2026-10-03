/**
 * Selektoren: Ableitungen aus dem Zustand, ohne ihn zu besitzen.
 * Reducer und Darstellung lesen dieselben Regeln — einmal definiert.
 */
import { MINING_PHASE, canMineTile } from '../domain/actions/mining.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE, hasReached } from '../domain/onboarding/onboarding-state.js';

/** Der Erdblock in Sichtweite des Hive, der als erstes sinnvoll ist. */
export function firstMineableTileId(world) {
  const { x, y } = ONBOARDING_CONFIG.firstEarthBlock;
  const id = `${x},${y}`;
  return canMineTile(world, id) ? id : null;
}

/** Läuft gerade ein Abbau (inklusive Laufweg)? */
export function selectMiningActive(state) {
  return Boolean(state.mining) && state.mining.phase !== MINING_PHASE.COMPLETE;
}

/** Darf der Spieler jetzt Erdblöcke wählen? */
export function selectMaySelectTiles(state) {
  return hasReached(state.onboarding, ONBOARDING_STATE.TILE_SELECTION) && !selectMiningActive(state);
}

/** Nach dem Onboarding: dezente Hinweise auf erreichbare Erde. */
export function selectSoftHintVisible(state) {
  return (
    state.onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE ||
    state.onboarding.state === ONBOARDING_STATE.GRID_EXPANDED ||
    (state.buildMenuVisible && !selectMiningActive(state))
  );
}

/** Ist das der Erdblock, den der Dungling gerade bearbeitet? */
export function selectWorkingTileId(state) {
  return state.mining?.phase === MINING_PHASE.WORKING ? state.mining.tileId : null;
}
