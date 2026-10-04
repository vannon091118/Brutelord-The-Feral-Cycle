/** Der Replay-Check: gleiche Eingabe, gleicher Endzustand — und Fälschungen fallen durch. */
import { replayMatches, replayRaid } from '../../src/domain/raid/raid-replay.js';
import { createRaidState, stateHashInput } from '../../src/domain/raid/raid-state.js';
import { createRaidWorld } from '../../src/domain/raid/raid-world.js';
import { RAID_CONFIG, RAID_PHASE, canDig, digCost, maxTeamGrit } from '../../src/domain/raid/raid-config.js';
import { TILE_KIND, TILE_TERRAIN, parseTileId, terrainOf, tileId } from '../../src/domain/world/tile.js';
import { allTiles } from '../../src/domain/world/grid.js';
import { check, section } from './expect.mjs';

function held({ dig = false, grit = 0 } = {}) {
  return [{ id: 'a', name: 'Held a', atk: 10, grit, speed: 4, dig }];
}

function ticket({ heroes = held({ dig: true, grit: maxTeamGrit() }), entry = { x: 8, y: 8 } } = {}) {
  return { id: 't1', snapshotSeed: 4242, entry, heroes };
}

function hashOf(state) {
  return JSON.stringify(stateHashInput(state));
}

/** Der kürzeste Grabweg: erst auf der Achse, dann auf der anderen, der Hive wird betreten. */
function digPath(from, hive) {
  const actions = [];
  const ax = Math.sign(hive.x - from.x);
  const ay = Math.sign(hive.y - from.y);
  for (let x = from.x; x !== hive.x; x += ax) actions.push({ type: `DIG_${ax > 0 ? 'E' : 'W'}` });
  for (let y = from.y; y + ay !== hive.y; y += ay) actions.push({ type: `DIG_${ay > 0 ? 'S' : 'N'}` });
  actions.push({ type: `MOVE_${ay > 0 ? 'S' : 'N'}` });
  return actions;
}

function checkSnapshot() {
  section('Raid-Welt: der Snapshot des Verteidigers');
  const world = createRaidWorld({ snapshotSeed: 4242 });
  const stein = allTilesOf(world).filter((tile) => tile.terrain === TILE_TERRAIN.STONE);
  const obsidian = allTilesOf(world).filter((tile) => tile.terrain === TILE_TERRAIN.OBSIDIAN);
  check('Der fremde Dungeon traegt Hartgestein', stein.length > 0 && obsidian.length > 0, `${stein.length} Stein, ${obsidian.length} Obsidian`);
  check('Derselbe Snapshot ist derselbe Dungeon', JSON.stringify(allTilesOf(createRaidWorld({ snapshotSeed: 4242 }))) === JSON.stringify(allTilesOf(world)));
  check('Ein anderer Verteidiger ist eine andere Karte', JSON.stringify(allTilesOf(createRaidWorld({ snapshotSeed: 77 }))) !== JSON.stringify(allTilesOf(world)));
  check('Der Hive steht unveraendert', allTilesOf(world).filter((tile) => tile.kind === TILE_KIND.HIVE).length === 4);
}

function allTilesOf(world) {
  return allTiles(world);
}

function tileOf(world, x, y) {
  return allTiles(world).find((tile) => tile.x === x && tile.y === y);
}

function digInto(world, from, terrain) {
  const stein = allTiles(world).find((tile) => tile.terrain === terrain);
  return { west: { x: stein.x - 1, y: stein.y }, stein };
}

function checkDigAndMove(world) {
  section('Raid: Graben und Gehen');
  const start = { x: 8, y: 8 };
  const ohne = createRaidState(ticket({ entry: start, heroes: held() }));
  const mit = createRaidState(ticket({ entry: start }));
  const gegraben = replayRaid({ ticket: ticket({ entry: start }), actions: [{ type: 'DIG_E' }] });
  check('Graben senkt die Ausdauer um den Terrainpreis', gegraben.stamina === mit.stamina - digCost(terrainOf(tileOf(world, start.x + 1, start.y))), `${gegraben.stamina} von ${mit.stamina}`);
  check('Graben bewegt das Team mit und markiert das Feld', gegraben.at.x === start.x + 1 && gegraben.dug[tileId(start.x + 1, start.y)] === true);
  const { west } = digInto(world, start, TILE_TERRAIN.STONE);
  const anStein = createRaidState(ticket({ entry: west, heroes: held() }));
  const gesperrt = replayRaid({ ticket: ticket({ entry: west, heroes: held() }), actions: [{ type: 'DIG_E' }] });
  check('Harter Stein ist ohne die Faehigkeit zu', !canDig(TILE_TERRAIN.STONE, anStein.heroes) && hashOf(gesperrt) === hashOf(anStein));
  check('Mit der Faehigkeit ist derselbe Stein offen', replayRaid({ ticket: ticket({ entry: west }), actions: [{ type: 'DIG_E' }] }).stamina === mit.stamina - RAID_CONFIG.stoneCost);
  check('Gehen durch blinde Erde wird abgewiesen', replayRaid({ ticket: ticket({ entry: start }), actions: [{ type: 'MOVE_E' }] }).at.x === start.x);
  const hin = replayRaid({ ticket: ticket({ entry: start }), actions: [{ type: 'DIG_E' }] });
  const zurueck = replayRaid({ ticket: ticket({ entry: start }), actions: [{ type: 'DIG_E' }, { type: 'DIG_W' }] });
  check('Zurueck graben kostet denselben Preis', zurueck.stamina === hin.stamina - digCost(terrainOf(tileOf(world, start.x, start.y))) && zurueck.at.x === start.x);
  check('Eine unbekannte Aktion bewegt nichts', hashOf(replayRaid({ ticket: ticket({ entry: start }), actions: [{ type: 'FLIEG_NACH_OST' }] })) === hashOf(mit));
}

function checkReplay(world) {
  section('Raid-Replay: das Log ist die Quelle');
  const hive = world.hiveOrigin;
  const ticketArg = ticket();
  const actions = digPath(ticketArg.entry, hive);
  const end = replayRaid({ ticket: ticketArg, actions });
  check('Der Einmarsch erreicht den Hive', end.at.x === hive.x && end.at.y === hive.y, `${end.at.x},${end.at.y}`);
  check('Ein nacktes Team schafft denselben Weg nicht', replayRaid({ ticket: { ...ticketArg, heroes: held() }, actions }).phase !== RAID_PHASE.AT_HIVE);
  check('Die Phase wechselt am Hive', end.phase === RAID_PHASE.AT_HIVE, end.phase);
  check('Zweimal dieselbe Eingabe, zweimal derselbe Zustand', hashOf(replayRaid({ ticket: ticketArg, actions })) === hashOf(end));
  check('Das Log ist die abgesetzten Aktionen', JSON.stringify(end.log) === JSON.stringify(actions), `${end.log.length} von ${actions.length}`);
  const ausgegeben = Object.keys(end.dug).reduce((sum, id) => {
    const { x, y } = parseTileId(id);
    return sum + digCost(terrainOf(tileOf(world, x, y)));
  }, 0);
  check('Die Ausdauer ist die Summe der Grabpreise', end.stamina === end.staminaMax - ausgegeben, `${end.stamina} von ${end.staminaMax}, ausgegeben ${ausgegeben}`);
  check('Der Server erkennt die echte Einreichung', replayMatches({ ticket: ticketArg, actions, claimed: end }));
  const gefaelscht = [
    ['aufgeblaehte Ausdauer', { ...end, stamina: end.stamina + 20 }],
    ['versetztes Team', { ...end, at: { x: 0, y: 0 } }],
    ['behaupteter Sieg', { ...end, phase: RAID_PHASE.RESOLVED }],
    ['geleerte AP', { ...end, heroes: end.heroes.map((heldEntry) => ({ ...heldEntry, ap: 0 })) }],
  ].filter(([grund, claimed]) => replayMatches({ ticket: ticketArg, actions, claimed })).map(([grund]) => grund);
  check('Keine gefaelschte Einreichung kommt durch', gefaelscht.length === 0, gefaelscht.join(', '));
  check('Ein gekuerztes Log auch nicht', !replayMatches({ ticket: ticketArg, actions: actions.slice(0, -1), claimed: end }));
  check('Ein fremdes Ticket auch nicht', !replayMatches({ ticket: { ...ticketArg, entry: { x: 9, y: 8 } }, actions, claimed: end }));
}

export function checkRaidReplay() {
  const world = createRaidWorld({ snapshotSeed: 4242 });
  checkSnapshot();
  checkDigAndMove(world);
  checkReplay(world);
}