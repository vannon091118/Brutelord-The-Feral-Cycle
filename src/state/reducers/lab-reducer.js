/** Labor-Domäne: Stein kaufen, Stein verbauen, Labor öffnen und schließen. */
import { ACTION } from '../../domain/actions/action-types.js';
import { STONE_CONFIG } from '../../domain/brutelord/stone-config.js';
import { buyStone, canAffordStone, canOpenLab, nextSeed, placeStone } from '../../domain/brutelord/lab-state.js';

export function reduceLab(state, action) {
  switch (action.type) {
    case ACTION.LAB_OPENED:
      return opened(state);
    case ACTION.LAB_CLOSED:
      return { ...state, lab: { ...state.lab, open: false } };
    case ACTION.STONE_BOUGHT:
      return bought(state);
    case ACTION.STONE_PLACED:
      return placed(state, action.seed, action.slot);
    default:
      return state;
  }
}

function opened(state) {
  if (!canOpenLab(state.buildings, state.selectedBuildingId)) return state;
  return { ...state, lab: { ...state.lab, open: true } };
}

function bought(state) {
  if (!state.lab.open || !canAffordStone(state.essence)) return state;
  const lab = buyStone(state.lab, nextSeed(state.lab));
  if (lab === state.lab) return state;
  return { ...state, lab, essence: state.essence - STONE_CONFIG.cost };
}

function placed(state, seed, slot) {
  if (!state.lab.open) return state;
  const lab = placeStone(state.lab, seed, slot);
  return lab === state.lab ? state : { ...state, lab };
}