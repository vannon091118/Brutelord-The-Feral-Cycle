// @doc: docs/daten/buildings/building.md#building
import { BUILDING_STATE, PLACEMENT_REASON, buildingDef } from './building-config.js';
import { allTiles, getTile, isInsideGrid } from '../world/grid.js';
import { isBuildable, tileId } from '../world/tile.js';

function occupiedTileIds(buildings) {
  return new Set(buildings.flatMap((building) => building.tileIds));
}

function footprintIds(type, anchor) {
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

function footprintFits({ world, occupied, type, anchor }) {
  if (!buildingDef(type) || !isInsideGrid(world, anchor.x, anchor.y)) return false;
  return footprintIds(type, anchor).every((id) => {
    const tile = getTile(world, id);
    return Boolean(tile) && isBuildable(tile) && !occupied.has(id);
  });
}

export function canPlaceBuilding({ world, buildings, type, anchor }) {
  return footprintFits({ world, occupied: occupiedTileIds(buildings), type, anchor });
}

function reasonFor(spots, free) {
  if (spots.length > 0) return null;
  return free > 0 ? PLACEMENT_REASON.NO_SPACE : PLACEMENT_REASON.NO_FLOOR;
}

export function placementReport({ world, buildings, type }) {
  const occupied = occupiedTileIds(buildings);
  const spots = [];
  let free = 0;
  for (const tile of allTiles(world)) {
    if (!isBuildable(tile) || occupied.has(tile.id)) continue;
    free += 1;
    if (footprintFits({ world, occupied, type, anchor: tile })) spots.push(tile);
  }
  return { type, def: buildingDef(type), spots, free, reason: reasonFor(spots, free) };
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

function isDelivered(building) {
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

function openDebt(building) {
  return Math.max(0, building.required - building.delivered);
}

export function committedEssence(buildings) {
  return openSites(buildings).reduce((sum, building) => sum + openDebt(building), 0);
}

export function spendableEssence(essence, buildings) {
  return Math.max(0, essence - committedEssence(buildings));
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
