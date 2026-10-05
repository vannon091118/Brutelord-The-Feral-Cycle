// @doc: docs/daten/reducers/mutant-reducer.md#mutant-reducer
import { ACTION } from '../../domain/actions/action-types.js';
import { fusionStones, fuse, isMutant, nextCandidate, refundFor, asBase } from '../../domain/brutelord/mutant.js';

export function reduceMutant(state, action) {
  if (action.type === ACTION.MUTANT_CREATED) return created(state);
  if (action.type === ACTION.MUTANT_REVERTED) return reverted(state, action.workerId);
  return state;
}

function created(state) {
  if (!state.lab.open) return state;
  const stones = fusionStones(state.lab);
  const worker = nextCandidate(state.dunglings);
  if (stones.length === 0 || !worker) return state;
  const mutant = fuse(worker, stones);
  if (!mutant) return state;
  return {
    ...state,
    dunglings: state.dunglings.map((entry) => (entry.id === worker.id ? mutant : entry)),
    lab: { ...state.lab, stones: state.lab.stones.filter((stone) => stone.slot === null) },
  };
}

function reverted(state, workerId) {
  const worker = state.dunglings.find((entry) => entry.id === workerId);
  if (!worker || !isMutant(worker)) return state;
  return {
    ...state,
    essence: state.essence + refundFor(worker),
    dunglings: state.dunglings.map((entry) => (entry.id === workerId ? asBase(entry) : entry)),
  };
}