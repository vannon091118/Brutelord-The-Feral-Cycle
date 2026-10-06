/** Der Anreiz der Tiefe, an derselben Welt gemessen: dieselbe Platzierung,
 *  dieselben Zellen, groessere Kammern. Zwei verschiedene Worlds zu vergleichen
 *  waere kein Beweis — der Seed wuerde den Unterschied liefern, nicht die Tiefe. */
import { createWorld } from '../../src/domain/world/grid.js';
import { createFloorWorld } from '../../src/domain/world/floor.js';
import { parseTileId } from '../../src/domain/world/tile.js';
import { createDeposits } from '../../src/domain/deposits/deposit-placement.js';
import { DEPOSIT_DEPTH, capacityAtDepth, capacityCeilingFor, essenceBudget } from '../../src/domain/deposits/deposit-config.js';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';

function selbeWelt(depth) {
  const start = createWorld({ playerseed: SEED });
  return createDeposits({
    width: start.width,
    height: start.height,
    hiveOrigin: start.hiveOrigin,
    spawnTile: parseTileId(start.spawnTileId),
    seed: start.seed,
    depth,
  });
}

function summe(kammern, feld) {
  return Object.values(kammern).reduce((sum, kammer) => sum + kammer[feld], 0);
}

function checkSelbeWelt() {
  section('Tiefe: dieselbe Welt eine Etage tiefer');
  const flach = selbeWelt(0);
  const tief = selbeWelt(1);
  const ids = Object.keys(flach);
  check('Die zweite Etage legt ueberhaupt Kammern an', ids.length > 0, `${ids.length} Kammern`);
  check('Dieselben Kammern bleiben an denselben Zellen',
    ids.every((id) => tief[id] && tief[id].cells.join(',') === flach[id].cells.join(',')));
  check('Die Kammerzahl bleibt dieselbe', Object.keys(tief).length === ids.length);
  check('Jede Kammer waechst um genau den Anteil der Config',
    ids.every((id) => tief[id].capacity === capacityAtDepth(flach[id].capacity, 1)), `${ids.length} Kammern`);
  check('Jede Kammer ist eine Etage tiefer groesser',
    ids.every((id) => tief[id].capacity > flach[id].capacity));
  check('Die ganze Etage traegt mehr Essenz als dieselbe Welt oben',
    summe(tief, 'pool') > summe(flach, 'pool'), `${summe(flach, 'pool')} auf ${summe(tief, 'pool')}`);
}

function checkBands() {
  section('Tiefe: die Baender wachsen mit');
  check('Der Anteil je Etage ist gesetzt und nicht null', DEPOSIT_DEPTH.gainPerFloor > 0, `${DEPOSIT_DEPTH.gainPerFloor}`);
  check('Eine Kammer waechst je Etage um den Anteil der Config',
    capacityAtDepth(40, 1) === Math.round(40 * (1 + DEPOSIT_DEPTH.gainPerFloor)), `${capacityAtDepth(40, 1)} statt 40`);
  check('Die Obergrenze waechst mit der Etage', capacityCeilingFor(1) > capacityCeilingFor(0), `${capacityCeilingFor(0)} auf ${capacityCeilingFor(1)}`);
  check('Das Weltbudget waechst mit der Etage', essenceBudget(1).ceiling > essenceBudget(0).ceiling, `${essenceBudget(0).ceiling} auf ${essenceBudget(1).ceiling}`);
  check('Die erste Etage liegt im unveraenderten Band', selbeWelt(0) !== null && inBand(selbeWelt(0), 0));
  check('Die zweite Etage liegt in ihrem eigenen Band', inBand(selbeWelt(1), 1));
  check('Jede Kammer bleibt unter ihrer Tiefen-Obergrenze',
    Object.values(selbeWelt(1)).every((kammer) => kammer.capacity <= capacityCeilingFor(1)));
}

function inBand(kammern, depth) {
  const band = essenceBudget(depth);
  const total = summe(kammern, 'pool');
  return total >= band.floor && total <= band.ceiling;
}

function checkEtage() {
  section('Tiefe: die gebaute zweite Etage traegt den Anreiz');
  const tief = createFloorWorld(SEED, 1);
  check('Die zweite Etage bleibt in ihrem Band',
    summe(tief.deposits, 'pool') >= essenceBudget(1).floor && summe(tief.deposits, 'pool') <= essenceBudget(1).ceiling,
    `${summe(tief.deposits, 'pool')}`);
  check('Keine Kammer der zweiten Etage reisst die Obergrenze',
    Object.values(tief.deposits).every((kammer) => kammer.capacity <= capacityCeilingFor(1)));
}

export function checkDepthReward() {
  checkSelbeWelt();
  checkBands();
  checkEtage();
}
