/** Die Kolonie-Prüfungen: Beanspruchung und Bauablauf in einer Gruppe. */
import { checkClaim } from './check-claim.mjs';
import { checkBuild } from './check-build.mjs';

export function checkColony(slice) {
  checkClaim(slice);
  checkBuild();
}
