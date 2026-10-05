/** Die Verdrahtung der Etage. Gelesen wird der Quelltext, nicht der Zustand:
 *  Node und Build loesen den Sprung nicht aus — nur der Browser tut das. */
import { readFileSync } from 'node:fs';
import { DEEPEST_FLOOR } from '../../src/domain/world/floor.js';
import { FLOOR } from '../../src/domain/world/floor-config.js';
import { check, section } from './expect.mjs';

function text(pfad) {
  return readFileSync(pfad, 'utf8');
}

export function checkVerticalityWiring() {
  section('Verdrahtung: die Etage ist im Spiel erreichbar');
  const actions = text('src/state/use-game-actions.js');
  const hud = text('src/ui/GameHud.jsx');
  const chip = text('src/ui/FloorChip.jsx');

  check('Der Sprung liegt in der Reducerkette', text('src/state/reducer-chain-world.js').includes('reduceFloor'));
  check('Die UI kann den Sprung ausloesen', actions.includes('ACTION.FLOOR_DESCEND') && hud.includes('actions.descend'));
  check('Die Plakette zeigt die Tiefe an', chip.includes('Etage {depth}') && hud.includes('game.world.depth'));
  check('Die Plakette sperrt an der Grenze', chip.includes('disabled={!open}') && chip.includes('canDescend(depth)'));
  check('Ohne Ziel gibt die Aktion kein Ziel mit', !actions.includes('target:'));
  check('Der abgeleitete Cache nennt die Tiefe', text('src/state/snapshot.js').includes('${world.depth}`'), 'ohne Tiefe im Schluessel holt eine Ebene den Raster der anderen');
  check('Die Grenze kommt aus der Config', FLOOR.deepest === DEEPEST_FLOOR && FLOOR.start === 0, `start ${FLOOR.start} deepest ${FLOOR.deepest}`);
}
