/** Nachbarschafts-Byte: Form folgt Nachbarn, nie dem Rechteck. */
import { TILE_KIND, TILE_VISIBILITY } from './tile.js';

export const EDGE = Object.freeze({ N: 'N', E: 'E', S: 'S', W: 'W', NE: 'NE', SE: 'SE', SW: 'SW', NW: 'NW' });

const TERRAIN_BITS = Object.freeze({ N: 1, E: 2, S: 4, W: 8 });
const VOID_BITS = Object.freeze({ NE: 16, SE: 32, SW: 64, NW: 128 });
export const EDGE_MASK_BITS = Object.freeze({ ...TERRAIN_BITS, ...VOID_BITS });
const DIR_OF = Object.freeze({ N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0], NE: [1, -1], SE: [1, 1], SW: [-1, 1], NW: [-1, -1] });
const SIDES = Object.freeze(['N', 'E', 'S', 'W']);
const CORNERS = Object.freeze(['NE', 'SE', 'SW', 'NW']);

function isEdgeCell(tile) {
  return Boolean(tile) && (tile.kind === TILE_KIND.DUNGEON_FLOOR || tile.kind === TILE_KIND.HIVE);
}

function isUnseen(tile) {
  return Boolean(tile) && tile.visibility === TILE_VISIBILITY.HIDDEN;
}

function neighborTile(world, x, y) {
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) return null;
  return world.tiles[y * world.width + x] ?? null;
}

/** Erde schließt an Erde an; vor Freifläche und außerhalb bleibt sie Fläche. */
export function edgeMask(world, x, y) {
  const open = {};
  for (const side of SIDES) {
    const [dx, dy] = DIR_OF[side];
    const tile = neighborTile(world, x + dx, y + dy);
    open[side] = tile === null || isEdgeCell(tile);
  }
  let mask = 0;
  for (const side of SIDES) if (open[side]) mask |= EDGE_MASK_BITS[side];
  for (const corner of CORNERS) {
    if (open[corner[0]] || open[corner[1]]) continue;
    const [dx, dy] = DIR_OF[corner];
    const tile = neighborTile(world, x + dx, y + dy);
    if (tile === null || isEdgeCell(tile)) mask |= EDGE_MASK_BITS[corner];
  }
  return mask;
}

/** Wo das Land unentdeckt bleibt: die Seiten, an denen die Kantenwand steht. */
export function hiddenMask(world, x, y) {
  let mask = 0;
  for (const side of SIDES) {
    const [dx, dy] = DIR_OF[side];
    const tile = neighborTile(world, x + dx, y + dy);
    if (tile && tile.kind === TILE_KIND.EARTH && isUnseen(tile)) mask |= EDGE_MASK_BITS[side];
  }
  return mask;
}

export function maskHas(mask, side) {
  return (mask & EDGE_MASK_BITS[side]) !== 0;
}

/** Die vier Seiten als Flag-Objekt — die Formwerkzeuge lesen Wörter, kein Byte. */
export function sideFlags(mask) {
  return {
    N: maskHas(mask, 'N'),
    E: maskHas(mask, 'E'),
    S: maskHas(mask, 'S'),
    W: maskHas(mask, 'W'),
  };
}

/** Eine offene Diagonale zwischen zwei geschlossenen Seiten schneidet ein. */
export function notchFlags(mask, open) {
  const flags = {};
  for (const corner of CORNERS) {
    flags[corner] = maskHas(mask, corner) && !open[corner[0]] && !open[corner[1]];
  }
  return flags;
}
