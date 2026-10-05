import { useHiveRunner } from './use-hive-runner.js';
import { useRootingRunner } from './use-rooting-runner.js';
import { useWorkRunner } from './use-work-runner.js';

// @doc: docs/daten/state/use-colony-clock.md#use-colony-clock
export function useColonyClock({ latest, dispatch }) {
  useRootingRunner({ latest, dispatch });
  useWorkRunner({ latest, dispatch });
  useHiveRunner({ latest, dispatch });
}