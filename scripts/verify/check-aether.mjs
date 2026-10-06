/**
 * Der Aether-Loop ohne UI: tiefes Erdreich erzeugt, die Mutation verbraucht und
 * erhoeht das Risiko. Alles gegen die Config, nicht gegen abgeschriebene Zahlen.
 */
import { AETHER_CONFIG } from '../../src/domain/economy/aether-config.js';
import {
  aetherYieldFor,
  canMutate,
  createAetherLedger,
  depositAether,
  digAbilityOf,
  mutate,
  riskOf,
} from '../../src/domain/economy/aether-loop.js';
import { check, section } from './expect.mjs';

const CEILING_STEPS = Math.ceil(AETHER_CONFIG.riskCeiling / AETHER_CONFIG.riskPerMutation);
const DEEP_DEPTH = AETHER_CONFIG.depthThreshold + 2;

function funded() {
  const perTick = aetherYieldFor({ depth: DEEP_DEPTH, ticks: 1 });
  const ticks = Math.ceil(((CEILING_STEPS + 1) * AETHER_CONFIG.mutationCost) / perTick);
  return depositAether(createAetherLedger(), aetherYieldFor({ depth: DEEP_DEPTH, ticks }));
}

function mutateTimes(ledger, times) {
  let current = ledger;
  let last = null;
  for (let index = 0; index < times; index += 1) {
    last = mutate(current);
    if (!last.ok) return last;
    current = last.ledger;
  }
  return last;
}

function checkYield() {
  const flach = aetherYieldFor({ depth: AETHER_CONFIG.depthThreshold - 1, ticks: 10 });
  check('Ueber dem flachen Erdreich entsteht kein Aether', flach === 0, `${flach} Aether`);
  check('Ohne Takt entsteht kein Aether', aetherYieldFor({ depth: DEEP_DEPTH, ticks: 0 }) === 0);
  const tief = aetherYieldFor({ depth: DEEP_DEPTH, ticks: 4 });
  const faktor = AETHER_CONFIG.yieldFloor + (DEEP_DEPTH - AETHER_CONFIG.depthThreshold);
  const erwartet = AETHER_CONFIG.yieldPerTick * 4 * faktor;
  check('Tiefes Erdreich liefert die Menge aus der Config', tief === erwartet, `${tief} statt ${erwartet}`);
}

function checkRefusal() {
  const leer = createAetherLedger();
  const arm = mutate(leer);
  check('Ohne Aether wird die Mutation verweigert', arm.ok === false && arm.error === 'AETHER_ZU_WENIG', arm.error);
  check('Eine verweigerte Mutation laesst das Ledger unberuehrt', arm.ledger === leer && leer.mutations === 0);
}

function checkMutation(voll) {
  const eine = mutate(voll);
  check('Eine Mutation kostet genau den Preis der Config', eine.ok && voll.stored - eine.ledger.stored === AETHER_CONFIG.mutationCost);
  check('Eine Mutation zaehlt genau einmal', eine.ok && eine.ledger.mutations === voll.mutations + 1);
  check('Eine Mutation erhoeht das Risiko', eine.ok && eine.ledger.risk > voll.risk);
  check('Eine Mutation erhoeht die Grab- und Koerperfaehigkeit', eine.ok && digAbilityOf(eine.ledger) > digAbilityOf(voll));
}

function checkCeiling(voll) {
  const amDeckel = mutateTimes(voll, CEILING_STEPS);
  check('Bis zum Risiko-Deckel laesst sich mutieren', amDeckel.ledger.mutations === CEILING_STEPS, `${amDeckel.ledger.mutations} Mutationen`);
  check('Der Deckel ist erreicht', riskOf(amDeckel.ledger) === AETHER_CONFIG.riskCeiling && !canMutate(amDeckel.ledger));
  const zuViel = mutate(amDeckel.ledger);
  check('Ein Ledger am Risiko-Deckel wird abgewiesen', zuViel.ok === false && zuViel.error === 'RISIKO_ZU_HOCH', zuViel.error);
  check('Die Faehigkeit bleibt am Deckel stehen', digAbilityOf(zuViel.ledger) === digAbilityOf(amDeckel.ledger));
}

export async function checkAether() {
  section('Aether-Oekonomie');
  checkYield();
  checkRefusal();
  checkMutation(funded());
  checkCeiling(funded());
  const erneut = mutate(funded());
  check('Derselbe Aufruf liefert dasselbe Ergebnis', JSON.stringify(erneut) === JSON.stringify(mutate(funded())));
}
