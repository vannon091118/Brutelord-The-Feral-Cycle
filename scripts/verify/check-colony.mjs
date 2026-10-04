/** Die Kolonie-Prüfungen: Beanspruchung und Bauablauf in einer Gruppe. */
import { checkClaim } from './check-claim.mjs';
import { checkBuild } from './check-build.mjs';
import { checkWorldViews } from './check-world-views.mjs';
import { checkEconomy } from './check-economy.mjs';
import { checkBruteLord } from './check-brutelord.mjs';
import { checkTraits } from './check-traits.mjs';
import { checkMutant } from './check-mutant.mjs';

export function checkColony(slice) {
  checkClaim(slice);
  checkBuild();
  checkWorldViews();
  checkEconomy();
  checkBruteLord();
  checkTraits();
  checkMutant();
}
