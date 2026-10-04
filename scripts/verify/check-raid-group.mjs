/** Die Gruppe der Gruppen-Prüfungen: Bewegung, Traits und Format des Raids. */
import { checkRaidMove } from './check-raid-move.mjs';
import { checkRaidTraits } from './check-raid-traits.mjs';
import { checkRaidFormat } from './check-raid-format.mjs';

export function checkRaidGroup() {
  checkRaidMove();
  checkRaidTraits();
  checkRaidFormat();
}