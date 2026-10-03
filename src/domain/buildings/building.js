/**
 * Ein Bauwerk: erst ein Bauplatz, dann ein Gebäude. Auf dem Platz passiert
 * genau eine Sache — Träger bringen Essenz, bis der Preis bezahlt ist. Erst
 * dann steht das Bauwerk und tut, wofür es gebaut wurde.
 */
import { BUILDING_STATE, buildingDef } from './building-config.js';
import { getTile, isInsideGrid } from '../world/grid.js';
import { isBuildable, tileId } from '../world/tile.js';

/** Alle Felder, die schon belegt sind — kein Bau steht auf einem anderen. */
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

/** Darf hier gebaut werden? Jedes Feld der Grundfläche muss freier Boden sein. */
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
    /** Uhr des Schwarmhorts: zählt bis zum nächsten Arbeiter. */
    progressMs: 0,
  };
}

export function isDelivered(building) {
  return building.delivered >= building.required;
}

/** Eine angekommene Essenz. Mehr als der Preis wird nicht gutgeschrieben. */
export function deliverToSite(building) {
  if (isDelivered(building)) return building;
  return { ...building, delivered: building.delivered + 1 };
}

/** Ist der Preis bezahlt, wird aus dem Bauplatz ein Bauwerk. */
export function settleSite(building) {
  if (building.state !== BUILDING_STATE.SITE || !isDelivered(building)) return building;
  return { ...building, state: BUILDING_STATE.READY };
}

/** Bauplätze, die noch auf Essenz warten. */
export function openSites(buildings) {
  return buildings.filter((building) => building.state === BUILDING_STATE.SITE);
}

/** Eine Zuweisung mehr — oder null, wenn hier schon genug arbeiten. */
export function assignWorker(building, workerId) {
  const def = buildingDef(building.type);
  if (!def.maxWorkers || building.workers.includes(workerId)) return null;
  if (building.workers.length >= def.maxWorkers) return null;
  return { ...building, workers: [...building.workers, workerId] };
}

/** Der zuletzt zugewiesene Dungling geht zuerst wieder. */
export function releaseWorker(building) {
  if (building.workers.length === 0) return building;
  return { ...building, workers: building.workers.slice(0, -1) };
}
