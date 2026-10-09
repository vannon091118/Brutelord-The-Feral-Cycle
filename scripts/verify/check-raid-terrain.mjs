/** Hartgestein und Graben: das Terrainfeld, die Berechtigung, die Rechnung dahinter. */
import { TILE_KIND, TILE_TERRAIN, terrainOf } from '../../src/domain/world/tile.js';
import { RAID_CONFIG, RAID_TERRAIN, canDig, digCost, maxTeamGrit, pathCost, teamStamina } from '../../src/domain/raid/raid-config.js';
import { terrainAt } from '../../src/domain/raid/raid-terrain.js';
import { RAID_CAPABILITY, STONE_TRAIT } from '../../src/domain/brutelord/stone-config.js';
import { carriesCapability, createStone } from '../../src/domain/brutelord/stone-roll.js';
import { allTiles, createWorld } from '../../src/domain/world/grid.js';
import { check, section } from './expect.mjs';

const STEINE = 400;

function held() {
  return Array.from({ length: STEINE }, (unused, index) => createStone({ seed: index * 104729 }));
}

function zellen(world) {
  const liste = [];
  for (let y = 0; y < world.height; y += 1) {
    for (let x = 0; x < world.width; x += 1) liste.push({ x, y, terrain: terrainAt({ seed: world.seed, x, y }) });
  }
  return liste;
}

function kachel(world, kind) {
  return allTiles(world).find((tile) => tile.kind === kind);
}

function istHart(tile) {
  return terrainOf(tile) !== null && terrainOf(tile) !== TILE_TERRAIN.EARTH;
}

function hatHartenNachbarn(world, tile) {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dx, dy]) => allTiles(world).find((t) => t.x === tile.x + dx && t.y === tile.y + dy))
    .some((t) => t && istHart(t));
}

function checkTerrainField() {
  section('Raid-Terrain: das Feld neben TILE_KIND');
  const world = createWorld();
  const erde = kachel(world, TILE_KIND.EARTH);
  const hive = kachel(world, TILE_KIND.HIVE);
  check('Erde bleibt Erdreich', terrainOf(erde) === TILE_TERRAIN.EARTH);
  check('Der Hive ist kein Terrain, sondern ein Feld', terrainOf(hive) === null);
  const hart = allTiles(world).filter(istHart);
  check('Die Heimat fuehrt Hartgestein in ganzen Bloecken', hart.length > 0, `${hart.length} von ${allTiles(world).length}`);
  check('Kein Hartgestein ohne Nachbarn — ganze Bloecke, kein Einzel-Stein',
    hart.every((tile) => hatHartenNachbarn(world, tile)),
    `${hart.filter((tile) => !hatHartenNachbarn(world, tile)).length} Einzel-Steine`);
  const liste = zellen(world);
  check('Der fremde Dungeon kennt beide harten Sorten', liste.some((z) => z.terrain === TILE_TERRAIN.STONE) && liste.some((z) => z.terrain === TILE_TERRAIN.OBSIDIAN));
  check('Das Terrain haengt am Seed', JSON.stringify(zellen({ ...world, seed: world.seed + 1 })) !== JSON.stringify(liste));
  check('Und ist reproduzierbar', JSON.stringify(zellen(createWorld())) === JSON.stringify(liste));
  const anteil = liste.filter((z) => z.terrain === TILE_TERRAIN.STONE).length / liste.length;
  check('Der Steinanteil trifft die Konfiguration', Math.abs(anteil - RAID_TERRAIN.stoneChance) < 0.03, `${(anteil * 100).toFixed(1)} statt ${RAID_TERRAIN.stoneChance * 100} Prozent`);
  const obsidian = liste.filter((z) => z.terrain === TILE_TERRAIN.OBSIDIAN);
  const nah = obsidian.every((z) => Math.abs(z.x - world.hiveOrigin.x) + Math.abs(z.y - world.hiveOrigin.y) <= RAID_TERRAIN.coreRadius);
  check('Obsidian liegt nur dicht am Hive', obsidian.length > 0 && nah, `${obsidian.length} Bloecke`);
}

/** Traits sind Charakter am Objekt; der Raid liest Berechtigung. */
function checkCapability() {
  section('Stein: das vierte Feld');
  const steine = held();
  const graber = steine.filter((stone) => stone.capability === RAID_CAPABILITY.DIG);
  check('Graben faellt regelmaessig', graber.length > STEINE / 10, `${graber.length} aus ${STEINE}`);
  check('Jeder Stein traegt genau null oder eine Faehigkeit', steine.every((stone) => stone.capability === null || stone.capability === RAID_CAPABILITY.DIG));
  const mitTrait = steine.filter((stone) => stone.trait === STONE_TRAIT.GREEDY);
  check('Trait und Faehigkeit sind unabhaengig', mitTrait.some((stone) => stone.capability === RAID_CAPABILITY.DIG) && steine.some((stone) => !stone.trait && stone.capability === RAID_CAPABILITY.DIG));
  check('Ein Trait gibt keine Berechtigung', mitTrait.some((stone) => !stone.capability) && !carriesCapability(mitTrait.filter((stone) => !stone.capability)));
  check('und verweigert sie auch nicht', carriesCapability(mitTrait.filter((stone) => stone.capability === RAID_CAPABILITY.DIG)));
  check('carriesCapability liest nur die Faehigkeit', carriesCapability(graber) && !carriesCapability(steine.filter((stone) => !stone.capability)));
}

/** Die Basis-Ausdauer traegt den reinen Erdeweg — und genau den. */
function checkDigRule() {
  section('Raid-Graben: Berechtigung statt Aufpreis');
  const nackt = [{ id: 'a', dig: false }];
  const graber = [{ id: 'a', dig: true }];
  check('Erde ist immer offen', canDig(TILE_TERRAIN.EARTH, nackt));
  check('Hartgestein bleibt zu, wer nicht graben darf', !canDig(TILE_TERRAIN.STONE, nackt) && !canDig(TILE_TERRAIN.OBSIDIAN, nackt));
  check('Mit Graben ist es offen', canDig(TILE_TERRAIN.STONE, graber));
  const kosten = [TILE_TERRAIN.EARTH, TILE_TERRAIN.STONE, TILE_TERRAIN.OBSIDIAN].map((terrain) => digCost(terrain));
  check('Die drei Stufen stehen in der Config', kosten.join() === [RAID_CONFIG.earthCost, RAID_CONFIG.stoneCost, RAID_CONFIG.obsidianCost].join(), kosten.join('/'));
  const erde = Array.from({ length: RAID_CONFIG.entryRadius }, () => TILE_TERRAIN.EARTH);
  const stein = [...erde.slice(0, -1), TILE_TERRAIN.STONE];
  const obsidian = [...erde.slice(0, -1), TILE_TERRAIN.OBSIDIAN];
  check('Der laengste Erdeweg passt in die Basis-Ausdauer', pathCost({ terrains: erde, heroes: graber }) <= RAID_CONFIG.baseStamina, `${pathCost({ terrains: erde, heroes: graber })} von ${RAID_CONFIG.baseStamina}`);
  check('Ein Steinblock darin reisst genau das Budget', pathCost({ terrains: stein, heroes: graber }) > RAID_CONFIG.baseStamina, `${pathCost({ terrains: stein, heroes: graber })} von ${RAID_CONFIG.baseStamina}`);
  check('Obsidian reisst es noch mehr', pathCost({ terrains: obsidian, heroes: graber }) > pathCost({ terrains: stein, heroes: graber }));
  check('Ohne die Faehigkeit ist derselbe Weg zu', pathCost({ terrains: stein, heroes: nackt }) === null);
  check('Das voll bestueckte Team traegt beide Wege', [stein, obsidian].every((weg) => pathCost({ terrains: weg, heroes: graber }) <= teamStamina(maxTeamGrit())));
}

export function checkRaidTerrain() {
  checkTerrainField();
  checkCapability();
  checkDigRule();
}