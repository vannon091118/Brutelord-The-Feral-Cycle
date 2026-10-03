/**
 * Kolonie-Domäne: was der Spieler baut und was die Kolonie danach tut.
 *
 * Zwei Verantwortungen in einer Datei, weil die Bau-Befehle und der
 * Arbeitstakt dieselben Dinge anfassen — Bauplätze, Dunglinge, Essenz — und
 * der Import-Deckel keine zwei Module zulässt. Getrennt bleibt es trotzdem:
 * oben die Befehle, unten der Takt, der alles Weitere ausrechnet.
 */
import { ACTION } from '../../domain/actions/action-types.js';
import { BUILDING_STATE, BUILDING_TYPE, canAfford } from '../../domain/buildings/building-config.js';
import {
  assignWorker,
  canPlaceBuilding,
  createBuildingSite,
  releaseWorker,
} from '../../domain/buildings/building.js';
import { parseTileId } from '../../domain/world/tile.js';
import { withJob } from '../../domain/entities/dungling.js';
import { advanceWork, isStationJob } from '../../domain/labour/work-tick.js';
import { workOf } from '../work-state.js';

export function reduceColony(state, action) {
  switch (action.type) {
    case ACTION.BUILD_CHOSEN:
      return choose(state, action.buildingType);
    case ACTION.BUILDING_PLACED:
      return place(state, action.tileId);
    case ACTION.BUILDING_SELECTED:
      return select(state, action.buildingId);
    case ACTION.BUILDING_DESELECTED:
      return deselect(state);
    case ACTION.WORKER_ASSIGNED:
      return staff(state, action.buildingId);
    case ACTION.WORKER_RELEASED:
      return release(state, action.buildingId);
    case ACTION.WORK_TICK:
      return { ...state, ...advanceWork(workOf(state), action.dtMs) };
    default:
      return state;
  }
}

/** Gewählt wird nur, was die Essenz im Hive auch hergibt. */
function choose(state, type) {
  if (!Object.values(BUILDING_TYPE).includes(type) || !canAfford(state.essence, type)) return state;
  return {
    ...state,
    buildChoice: state.buildChoice === type ? null : type,
    selectedBuildingId: null,
  };
}

/** Der Bauplatz ersetzt die Wahl: ab hier tragen die Dunglinge die Essenz hin. */
function place(state, tileId) {
  if (!state.buildChoice || !tileId) return state;
  const anchor = parseTileId(tileId);
  const free = { world: state.world, buildings: state.buildings, type: state.buildChoice, anchor };
  if (!canPlaceBuilding(free)) return state;
  const building = createBuildingSite({ id: nextBuildingId(state.buildings), type: state.buildChoice, anchor });
  return { ...state, buildings: [...state.buildings, building], buildChoice: null, selectedBuildingId: building.id };
}

function select(state, buildingId) {
  if (!state.buildings.some((building) => building.id === buildingId)) return state;
  return { ...state, selectedBuildingId: buildingId, selectedTileId: null, buildChoice: null };
}

function deselect(state) {
  return state.selectedBuildingId === null ? state : { ...state, selectedBuildingId: null };
}

/**
 * Ein Dungling mehr an diesem Bauwerk — bis die Plätze voll sind. Wer gerade
 * eine Lieferung trägt, darf sie zu Ende bringen und geht danach an den Platz.
 */
function staff(state, buildingId) {
  const building = state.buildings.find((entry) => entry.id === buildingId);
  if (!building || building.state !== BUILDING_STATE.READY) return state;
  const worker = state.dunglings.find((entry) => !isStationJob(entry.job) && !isAssigned(state.buildings, entry.id));
  if (!worker) return state;
  const staffed = assignWorker(building, worker.id);
  return staffed ? replace(state, buildingId, staffed) : state;
}

/** Freigeben macht den Dungling sofort wieder verfügbar — ohne Auftrag. */
function release(state, buildingId) {
  const building = state.buildings.find((entry) => entry.id === buildingId);
  if (!building || building.workers.length === 0) return state;
  const workerId = building.workers.at(-1);
  return {
    ...replace(state, buildingId, releaseWorker(building)),
    dunglings: state.dunglings.map((worker) => (worker.id === workerId ? withJob(worker, null) : worker)),
  };
}

function isAssigned(buildings, workerId) {
  return buildings.some((building) => building.workers.includes(workerId));
}

function replace(state, buildingId, building) {
  return { ...state, buildings: state.buildings.map((entry) => (entry.id === buildingId ? building : entry)) };
}

function nextBuildingId(buildings) {
  return `building-${buildings.length + 1}`;
}
