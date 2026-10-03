/**
 * Maße eines Bauwerks in Pixeln — einmal gerechnet, überall gleich. Die
 * Grundfläche steht in der Domäne, hier wird sie nur in Pixel übersetzt.
 */
import { buildingDef } from '../../domain/buildings/building-config.js';

export function buildingBox(building, tileSize) {
  const def = buildingDef(building.type);
  return {
    x: building.anchor.x * tileSize,
    y: building.anchor.y * tileSize,
    width: def.width * tileSize,
    height: def.height * tileSize,
    cx: (building.anchor.x + def.width / 2) * tileSize,
    cy: (building.anchor.y + def.height / 2) * tileSize,
    size: Math.min(def.width, def.height) * tileSize,
  };
}
