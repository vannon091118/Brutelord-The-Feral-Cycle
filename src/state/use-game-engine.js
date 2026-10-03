/**
 * Der Spielmotor des Slices — reine Komposition:
 * Reducer (Wahrheit) + Zeitplan der Domäne (Uhr) + Befehle (UI-Eingang).
 */
import { useReducer, useRef } from 'react';
import { createInitialGameState } from './game-state.js';
import { gameReducer } from './game-reducer.js';
import { useScheduleRunner } from './use-schedule-runner.js';
import { useRootingRunner } from './use-rooting-runner.js';
import { useGameActions } from './use-game-actions.js';

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  /** Die Uhr fragt den Zustand, sie besitzt ihn nicht. */
  const latest = useRef(state);
  latest.current = state;

  useScheduleRunner({ phase: state.onboarding.state, latest, dispatch });
  useRootingRunner({ latest, dispatch });

  return { state, actions: useGameActions(dispatch) };
}
