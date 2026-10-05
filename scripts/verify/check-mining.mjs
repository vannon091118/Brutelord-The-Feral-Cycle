/** Führt die fachlich getrennten Abbau-Prüfungen zusammen. */
import { checkMiningProgress } from './check-mining-progress.mjs';
import { checkMiningResult } from './check-mining-result.mjs';
import { checkRaid } from './check-raid.mjs';
import { checkRaidReplay } from './check-raid-replay.mjs';

export function checkMining(run) {
  checkMiningProgress(run);
  checkMiningResult(run);
  checkRaid();
  checkRaidReplay();
}
