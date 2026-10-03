/** Führt die fachlich getrennten Abbau-Prüfungen zusammen. */
import { checkMiningProgress } from './check-mining-progress.mjs';
import { checkMiningResult } from './check-mining-result.mjs';

export function checkMining(run) {
  checkMiningProgress(run);
  checkMiningResult(run);
}
