import { useHiveRunner } from './use-hive-runner.js';
import { useRootingRunner } from './use-rooting-runner.js';
import { useWorkRunner } from './use-work-runner.js';

/**
 * Die drei Daueruhren der Kolonie als eine Komposition. Jede Uhr behält ihre
 * eigene Datei und ihre eigene Bedingung — hier laufen sie nur im selben Zug.
 */
export function useColonyClock({ latest, dispatch }) {
  useRootingRunner({ latest, dispatch });
  useWorkRunner({ latest, dispatch });
  useHiveRunner({ latest, dispatch });
}