import { useEffect, useReducer } from 'react';

import { ACTION_TYPES } from '../domain/actions/action-types.js';
import {
  advanceMining,
  beginCollapse,
  completeMining,
  startMining,
} from '../domain/actions/mining.js';
import {
  actionTileIds,
  createDungling,
  moveDunglingToTile,
  pickNextActionTileId,
} from '../domain/entities/dungling.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { STAGE } from '../domain/onboarding/onboarding-state.js';
import { createInitialGrid, getTile } from '../domain/world/grid.js';

const cfg = ONBOARDING_CONFIG;

export function createInitialGameState() {
  return {
    stage: STAGE.INITIAL,
    grid: createInitialGrid(),
    dungling: null,
    /** The single highlighted next action. */
    targetTileId: null,
    /** Every tile the player may still pick. */
    actionableTileIds: [],
    selectedTileId: null,
    miningTileId: null,
    miningElapsedMs: 0,
    destroyedTileId: null,
    buildTileId: null,
    buildMenuOpen: false,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.HIVE_CLICKED: {
      if (state.stage !== STAGE.INITIAL) return state;
      return { ...state, stage: STAGE.MUTATING };
    }

    case ACTION_TYPES.HIVE_MUTATION_DONE: {
      if (state.stage !== STAGE.MUTATING) return state;
      return { ...state, stage: STAGE.WAITING_FOR_DUNGLING };
    }

    case ACTION_TYPES.DUNGLING_SPAWNED: {
      if (state.stage !== STAGE.WAITING_FOR_DUNGLING) return state;
      return {
        ...state,
        stage: STAGE.DUNGLING_IDLE,
        dungling: createDungling(),
        actionableTileIds: actionTileIds(state.grid),
        targetTileId: pickNextActionTileId(state.grid),
      };
    }

    case ACTION_TYPES.TILE_SELECTED: {
      if (state.stage !== STAGE.DUNGLING_IDLE) return state;
      if (!state.actionableTileIds.includes(action.tileId)) return state;
      return { ...state, stage: STAGE.ACTION_MENU, selectedTileId: action.tileId };
    }

    case ACTION_TYPES.ACTION_MENU_CLOSED: {
      if (state.stage !== STAGE.ACTION_MENU) return state;
      return { ...state, stage: STAGE.DUNGLING_IDLE, selectedTileId: null };
    }

    case ACTION_TYPES.MINING_COMMAND: {
      if (state.stage !== STAGE.ACTION_MENU) return state;
      const tile = getTile(state.grid, action.tileId ?? state.selectedTileId);
      if (!tile) return state;
      return {
        ...state,
        stage: STAGE.MOVING_TO_TILE,
        selectedTileId: null,
        targetTileId: null,
        actionableTileIds: [],
        miningTileId: tile.id,
        miningElapsedMs: 0,
        grid: startMining(state.grid, tile.id),
        dungling: moveDunglingToTile(state.dungling, tile),
      };
    }

    case ACTION_TYPES.MINING_STARTED: {
      if (state.stage !== STAGE.MOVING_TO_TILE) return state;
      return {
        ...state,
        stage: STAGE.MINING,
        miningElapsedMs: 0,
        grid: startMining(state.grid, state.miningTileId),
      };
    }

    case ACTION_TYPES.MINING_TICK: {
      if (state.stage !== STAGE.MINING) return state;
      const elapsed = state.miningElapsedMs + action.deltaMs;
      if (elapsed >= cfg.miningDurationMs) {
        return {
          ...state,
          stage: STAGE.TILE_DESTROYED,
          miningElapsedMs: cfg.miningDurationMs,
          destroyedTileId: state.miningTileId,
          grid: beginCollapse(state.grid, state.miningTileId),
        };
      }
      return {
        ...state,
        miningElapsedMs: elapsed,
        grid: advanceMining(state.grid, state.miningTileId, action.deltaMs, cfg.miningDurationMs),
      };
    }

    case ACTION_TYPES.GRID_EXPANDED: {
      if (state.stage !== STAGE.TILE_DESTROYED) return state;
      return {
        ...state,
        stage: STAGE.GRID_EXPANDED,
        grid: completeMining(state.grid, state.destroyedTileId),
        buildTileId: state.destroyedTileId,
      };
    }

    case ACTION_TYPES.BUILD_MENU_SHOWN: {
      if (state.stage !== STAGE.GRID_EXPANDED) return state;
      return { ...state, stage: STAGE.BUILD_MENU_VISIBLE, buildMenuOpen: true };
    }

    case ACTION_TYPES.BUILD_MENU_CLOSED: {
      if (!state.buildMenuOpen) return state;
      return { ...state, stage: STAGE.SLICE_COMPLETE, buildMenuOpen: false };
    }

    case ACTION_TYPES.RESET:
      return createInitialGameState();

    default:
      return state;
  }
}

/**
 * The simulation decides when something happens. Components only render.
 * Every delay is read from configuration - no magic numbers in components.
 */
export function nextScheduledTransition(state) {
  switch (state.stage) {
    case STAGE.MUTATING:
      return { type: ACTION_TYPES.HIVE_MUTATION_DONE, delayMs: cfg.hiveMutationMs };
    case STAGE.WAITING_FOR_DUNGLING:
      return { type: ACTION_TYPES.DUNGLING_SPAWNED, delayMs: cfg.dunglingSpawnDelayMs };
    case STAGE.MOVING_TO_TILE:
      return { type: ACTION_TYPES.MINING_STARTED, delayMs: cfg.workerMoveDurationMs };
    case STAGE.TILE_DESTROYED:
      return { type: ACTION_TYPES.GRID_EXPANDED, delayMs: cfg.tileDestroyedPauseMs };
    case STAGE.GRID_EXPANDED:
      return { type: ACTION_TYPES.BUILD_MENU_SHOWN, delayMs: cfg.gridExpandDelayMs + cfg.buildMenuDelayMs };
    default:
      return null;
  }
}

/** Drives the simulation: one scheduled transition plus the mining stepper. */
export function useGameClock(state, dispatch) {
  useEffect(() => {
    const next = nextScheduledTransition(state);
    if (!next) return undefined;
    const id = window.setTimeout(() => dispatch({ type: next.type }), next.delayMs);
    return () => window.clearTimeout(id);
  }, [dispatch, state.stage]);

  useEffect(() => {
    if (state.stage !== STAGE.MINING) return undefined;
    const id = window.setInterval(
      () => dispatch({ type: ACTION_TYPES.MINING_TICK, deltaMs: cfg.miningTickMs }),
      cfg.miningTickMs,
    );
    return () => window.clearInterval(id);
  }, [dispatch, state.stage]);
}

export function useGame() {
  return useReducer(gameReducer, undefined, createInitialGameState);
}