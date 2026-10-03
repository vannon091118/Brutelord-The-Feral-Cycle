/** Bauplatz-Logik: Grundfläche, Platzprüfung, Lieferung, Zuweisung. */
import { BUILDING_STATE, buildingDef } from './building-config.js';
import { getTile, isInsideGrid } from '../world/grid.js';
import { isBuildable, tileId } from '../world/tile.js';

export function occupiedTileIds(buildings) {
  return new Set(buildings.flatMap((building) => building.tileIds));
}

export function footprintIds(type, anchor) {
  const def = buildingDef(type);
  if (!def) return [];
  const ids = [];
  for (let dy = 0; dy < def.height; dy += 1) {
    for (let dx = 0; dx < def.width; dx += 1) {
      ids.push(tileId(anchor.x + dx, anchor.y + dy));
    }
  }
  return ids;
}

export function canPlaceBuilding({ world, buildings, type, anchor }) {
  if (!buildingDef(type) || !isInsideGrid(world, anchor.x, anchor.y)) return false;
  const occupied = occupiedTileIds(buildings);
  return footprintIds(type, anchor).every((id) => {
    const tile = getTile(world, id);
    return Boolean(tile) && isBuildable(tile) && !occupied.has(id);
  });
}

export function createBuildingSite({ id, type, anchor }) {
  const def = buildingDef(type);
  return {
    id,
    type,
    anchor: { ...anchor },
    tileIds: footprintIds(type, anchor),
    state: BUILDING_STATE.SITE,
    delivered: 0,
    required: def.cost,
    workers: [],
    progressMs: 0,
  };
}

export function isDelivered(building) {
  return building.delivered >= building.required;
}

export function deliverToSite(building) {
  if (isDelivered(building)) return building;
  return { ...building, delivered: building.delivered + 1 };
}

export function settleSite(building) {
  if (building.state !== BUILDING_STATE.SITE || !isDelivered(building)) return building;
  return { ...building, state: BUILDING_STATE.READY };
}

export function openSites(buildings) {
  return buildings.filter((building) => building.state === BUILDING_STATE.SITE);
}

export function assignWorker(building, workerId) {
  const def = buildingDef(building.type);
  if (!def.maxWorkers || building.workers.includes(workerId)) return null;
  if (building.workers.length >= def.maxWorkers) return null;
  return { ...building, workers: [...building.workers, workerId] };
}

export function releaseWorker(building) {
  if (building.workers.length === 0) return building;
  return { ...building, workers: building.workers.slice(0, -1) };
}
