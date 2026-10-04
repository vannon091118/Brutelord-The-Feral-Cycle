/** Generierung der CPU-Gegner Raid-Map. */

import { GRID_WIDTH, GRID_HEIGHT, HIVE_ORIGIN, HIVE_SIZE } from '../world/world-config.js';
import { createEarthTile, createHiveTile, TILE_KIND, TILE_VISIBILITY, tileId } from '../world/tile.js';
import { revealWorld } from '../world/reveal.js';
import { applyTiles, isInsideGrid } from '../world/grid.js';

function generateTiles(width, height, hiveOrigin) {
  const tiles = new Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (
        x >= hiveOrigin.x && x < hiveOrigin.x + HIVE_SIZE.width &&
        y >= hiveOrigin.y && y < hiveOrigin.y + HIVE_SIZE.height
      ) {
        tiles[y * width + x] = createHiveTile(x, y);
      } else {
        const earthTile = createEarthTile(x, y);
        // Deterministische Streuung statt Math.random():
        // Da Math.random() in der Domaene durch die Architekturpruefung blockiert wird, nutzen wir
        // eine einfache Hash-Funktion ueber die Koordinaten, um Stone und Obsidian zu platzieren.
        const pseudoRandom = Math.imul(x ^ (y << 5), 2654435761) >>> 0;
        const normalized = pseudoRandom / 4294967296; // 0..1

        if (normalized < 0.1 && (Math.abs(x - hiveOrigin.x) > 5 || Math.abs(y - hiveOrigin.y) > 5)) {
          // Zweiter Wert fuer den Typ
          const pseudoRandom2 = Math.imul(y ^ (x << 5), 2654435761) >>> 0;
          earthTile.kind = (pseudoRandom2 / 4294967296) < 0.2 ? TILE_KIND.OBSIDIAN : TILE_KIND.STONE;
        }
        tiles[y * width + x] = { ...earthTile, visibility: TILE_VISIBILITY.HIDDEN };
      }
    }
  }
  return tiles;
}

function findSpawnPoint(hiveOrigin, width, height) {
  for (let i = 0; i < 100; i++) {
    // Deterministische Spawn-Platzierung fuer die CPU Map
    const pseudoRandom = Math.imul(i ^ 1337, 2654435761) >>> 0;
    const r = (pseudoRandom / 4294967296) * 20 + 10;

    const pseudoRandom2 = Math.imul(i ^ 9999, 2654435761) >>> 0;
    const theta = (pseudoRandom2 / 4294967296) * 2 * Math.PI;

    const sx = Math.floor(hiveOrigin.x + r * Math.cos(theta));
    const sy = Math.floor(hiveOrigin.y + r * Math.sin(theta));

    if (isInsideGrid({ width, height }, sx, sy)) {
      return { x: sx, y: sy };
    }
  }
  return { x: hiveOrigin.x - 10, y: hiveOrigin.y };
}

export function createRaidWorld({ width = GRID_WIDTH, height = GRID_HEIGHT, hiveOrigin = HIVE_ORIGIN } = {}) {
  const spawnTile = findSpawnPoint(hiveOrigin, width, height);

  const world = {
    width,
    height,
    hiveOrigin: { ...hiveOrigin },
    hiveSize: { ...HIVE_SIZE },
    spawnTileId: tileId(spawnTile.x, spawnTile.y),
    tiles: generateTiles(width, height, hiveOrigin),
  };

  return revealWorld(world, [spawnTile]);
}
