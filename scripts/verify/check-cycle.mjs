/** Der Kreislauf in der Domaene: die Ader liegt unter der freien Leiter, der
 *  Blutstein kauft die Etage, der Aether mutiert den Hive — und jede
 *  Investition zieht einen Deckel hinter sich her. */
import { AETHER_CONFIG } from '../../src/domain/economy/aether-config.js';
import { digAbilityOf, riskOf } from '../../src/domain/economy/aether-loop.js';
import { BLOODSTONE_CONFIG } from '../../src/domain/economy/bloodstone-config.js';
import { buyFloor, cycleOf, lowestReachable, lootInto } from '../../src/domain/economy/resource-cycle.js';
import { GRAEBE, MUTATIONEN, SCHWELLE, ausbeute, beute, einGrab, ersteEtage, grabe, leeres, leiter } from './cycle-fixture.mjs';
import { check, section } from './expect.mjs';

function checkQuelle() {
  section('Kreislauf: die Ader liegt unter der freien Leiter');
  check('Die Schwelle liegt genau eine Etage unter der frei erreichbaren', SCHWELLE === lowestReachable(leeres()) + 1, `Schwelle ${SCHWELLE}`);
  check('Ueber der Schwelle gibt es keinen Aether', ausbeute(SCHWELLE - 1) === 0 && ausbeute(SCHWELLE) > 0);
  const flach = einGrab(leeres(), SCHWELLE - 1);
  check('Ein flacher Grab laesst den Kreislauf unberuehrt', flach.aether.stored === 0 && flach.aether.mutations === 0);
  check('Ein Grab auf der Schwelle gibt genau die Ausbeute der Config', einGrab(leeres(), SCHWELLE).aether.stored === ausbeute(SCHWELLE));
  check('Der Blutstein kommt nur aus dem Raid gegen den feindlichen Hive', beute().bloodstone === BLOODSTONE_CONFIG.hiveYield);
}

function checkVorrat() {
  section('Kreislauf: die Beute landet im Vorrat, sonst nirgends');
  const leer = leeres();
  check('Ohne Beute bleibt der Vorrat unberuehrt', lootInto(leer, {}) === leer && lootInto(leer, null) === leer);
  check('Die Beute des Raids landet in genau dieser Hoehe', lootInto(leer, beute()).bloodstone.stored === beute().bloodstone);
  check('Ein Stand ohne Kreislauf bekommt einen leeren', cycleOf({}).aether.stored === 0 && cycleOf({}).bloodstone.depth === 0);
  check('Ein vorhandener Kreislauf bleibt derselbe', cycleOf({ economy: leer }) === leer);
}

function checkKauf() {
  section('Kreislauf: Blutstein kauft die Etage und oeffnet die Ader');
  const leer = leeres();
  check('Ohne Blutstein gibt es keine Etage', buyFloor(leer).ok === false && buyFloor(leer).cycle === leer);

  const reich = lootInto(leeres(), { bloodstone: leiter() });
  const erste = buyFloor(reich);
  check('Mit genug Blutstein gibt es die naechste Etage', erste.ok === true);
  check('Die Etage kostet genau den Preis der Config', reich.bloodstone.stored - erste.cycle.bloodstone.stored === ersteEtage());
  check('Die neue Etage hebt die erreichbare Tiefe um eins', lowestReachable(erste.cycle) === lowestReachable(leer) + 1);
  check('Die Etage erhoeht das Risiko um seinen Satz', erste.cycle.bloodstone.risk === BLOODSTONE_CONFIG.riskPerDepth);

  let oben = reich;
  for (let schritt = 0; schritt < BLOODSTONE_CONFIG.maxDepth; schritt += 1) oben = buyFloor(oben).cycle;
  check('Die Leiter endet an ihrer hoechsten Etage', oben.bloodstone.depth === BLOODSTONE_CONFIG.maxDepth);
  const drueber = buyFloor(oben);
  check('Ueber die hoechste Etage hinaus wird verweigert', drueber.ok === false && drueber.cycle === oben);
  check('Das Risiko der Leiter steht an seinem Deckel', oben.bloodstone.risk === BLOODSTONE_CONFIG.maxRisk);
  check('Die tiefste Etage ist die Summe aus Leiter und Config',
    lowestReachable(oben) === lowestReachable(leer) + BLOODSTONE_CONFIG.maxDepth);
}

function checkFaehigkeit() {
  section('Kreislauf: die Investition schaltet eine Faehigkeit frei');
  const gewachsen = grabe(leeres(), SCHWELLE, AETHER_CONFIG.mutationCost);
  check('Mit genug Aether mutiert der Hive von selbst', gewachsen.aether.mutations === 1, `${gewachsen.aether.mutations} Mutationen`);
  check('Die Mutation kostet genau den Preis der Config', gewachsen.aether.stored === 0, `${gewachsen.aether.stored}`);
  check('Die Mutation gibt genau die Faehigkeit der Config', digAbilityOf(gewachsen.aether) === AETHER_CONFIG.abilityGain);
  check('Die Faehigkeit hebt die Ausbeute des naechsten Grabs',
    einGrab(gewachsen, SCHWELLE).aether.stored === ausbeute(SCHWELLE) + AETHER_CONFIG.abilityGain);
  check('Ohne Aether mutiert nichts', grabe(leeres(), SCHWELLE - 1, GRAEBE).aether.mutations === 0);
}

function checkRisiko() {
  section('Kreislauf: die Investition zieht ein Risiko nach sich');
  const amDeckel = grabe(leeres(), SCHWELLE, GRAEBE);
  check('Der Deckel begrenzt die Mutationen', amDeckel.aether.mutations === MUTATIONEN, `${amDeckel.aether.mutations} von ${MUTATIONEN}`);
  check('Das Risiko steht an seinem Deckel', riskOf(amDeckel.aether) === AETHER_CONFIG.riskCeiling);
  const danach = einGrab(amDeckel, SCHWELLE);
  check('Am Deckel waechst die Faehigkeit nicht weiter', danach.aether.mutations === amDeckel.aether.mutations);
  check('Am Deckel sammelt sich der Aether nur noch', danach.aether.stored > amDeckel.aether.stored);
}

export function checkCycle() {
  checkQuelle();
  checkVorrat();
  checkKauf();
  checkFaehigkeit();
  checkRisiko();
}
