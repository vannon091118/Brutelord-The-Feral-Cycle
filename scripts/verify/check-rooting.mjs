/**
 * Die Verwurzelung: ein abgebautes Block gehört sofort dem Hive, braucht
 * konfigurierte Zeit zum Einnehmen, ruht danach und stößt dann erst in die
 * Nachbarfelder. Geprüft wird gegen die Config, nicht gegen feste Zahlen.
 */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ROOTING_CONFIG } from '../../src/domain/world/rooting-config.js';
import { ROOTING_PHASE } from '../../src/domain/world/rooting.js';
import { getTile, neighborIds } from '../../src/domain/world/grid.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

const TICKS_FOR = (ms) => Math.round(ms / ROOTING_CONFIG.tickMs);

function afterTicks(state, ticks) {
  let next = state;
  for (let index = 0; index < ticks; index += 1) {
    next = gameReducer(next, { type: ACTION.ROOTING_TICK });
  }
  return next;
}

export function checkRooting(slice) {
  const target = slice.targetTileId;
  const phaseOf = (state, id) => getTile(state.world, id).rooting.phase;
  /** Nur Felder, die der Hive noch nicht besitzt — der Eingang gehört ihm schon. */
  const free = neighborIds(slice.state.world, target).filter((id) => phaseOf(slice.state, id) === ROOTING_PHASE.DARK);
  section('Verwurzelung');

  check('Abgebautes Block beginnt sofort zu wachsen', phaseOf(slice.state, target) === ROOTING_PHASE.GROWING);

  const early = afterTicks(slice.state, TICKS_FOR(ROOTING_CONFIG.claimDurationMs) - 1);
  check('Vor Ablauf der Zeit noch nicht eingenommen', phaseOf(early, target) === ROOTING_PHASE.GROWING);

  const rested = afterTicks(slice.state, TICKS_FOR(ROOTING_CONFIG.claimDurationMs));
  check('Nach konfigurierter Zeit eingenommen und ruhend', phaseOf(rested, target) === ROOTING_PHASE.RESTING);
  check('Während der Ruhe wachsen die Nachbarn noch nicht', free.length > 0 && free.every((id) => phaseOf(rested, id) === ROOTING_PHASE.DARK));

  const spread = afterTicks(slice.state, TICKS_FOR(ROOTING_CONFIG.claimDurationMs + ROOTING_CONFIG.cooldownMs));
  check('Nach dem Cooldown endgültig eingenommen', phaseOf(spread, target) === ROOTING_PHASE.CLAIMED);
  check('Tentakel wachsen in alle freien Nachbarfelder', free.every((id) => phaseOf(spread, id) === ROOTING_PHASE.GROWING));
  check('Wurzelreich wird dabei sichtbar', free.every((id) => getTile(spread.world, id).visibility === 'VISIBLE'));
}