/** Der Kreislauf im Spiel: der Etagensprung bezahlt aus dem Blutstein, der Grab
 *  gibt Aether in den Spielstand, und ohne Blutstein bleibt die Leiter genau
 *  da, wo sie ohne diesen Kreislauf war. */
import { RAID_PHASE } from '../../src/domain/raid/raid-phases.js';
import { applyRaidLoot, raidLoot } from '../../src/domain/raid/raid-loot.js';
import { descendOpen, lowestReachable, lootInto } from '../../src/domain/economy/resource-cycle.js';
import { SCHWELLE, ausbeute, beute, ersteEtage, leeres } from './cycle-fixture.mjs';
import { TIEFSTE, abstiege, grab, start, versuch, weltInTiefe } from './cycle-state-fixture.mjs';
import { mitSchacht } from './floor-sample.js';
import { check, section } from './expect.mjs';

function checkLeiter() {
  section('Kreislauf im Spiel: die freie Leiter bleibt, wie sie war');
  const frei = abstiege(mitSchacht(start()), TIEFSTE + 3);
  check('Ohne Blutstein senkt sich der Sprung bis zur tiefsten Etage', frei.world.depth === TIEFSTE, `Tiefe ${frei.world.depth}`);
  check('Ohne Blutstein passiert an der Grenze nichts', versuch(frei) === frei);
  check('Die erreichbare Tiefe ist die der freien Leiter', lowestReachable(frei.economy) === TIEFSTE);
}

function checkBezahlt() {
  section('Kreislauf im Spiel: der Sprung bezahlt die Etage');
  const reich = { ...mitSchacht(start()), economy: lootInto(leeres(), { bloodstone: 6 }) };
  const unten = abstiege(reich, TIEFSTE + 1);
  const frei = abstiege(mitSchacht(start()), TIEFSTE);
  check('Mit Blutstein geht der Sprung eine Etage tiefer', unten.world.depth === TIEFSTE + 1, `Tiefe ${unten.world.depth}`);
  check('Die neue Etage hat ihre eigene Welt', unten.world.seed !== frei.world.seed);
  check('Die Etage wurde aus dem Kreislauf bezahlt', unten.economy.bloodstone.stored === 6 - ersteEtage());
  check('Der Sprung traegt den bezahlten Kreislauf mit', lowestReachable(unten.economy) === TIEFSTE + 1);
}

function checkBeute() {
  section('Kreislauf im Spiel: die Beute des Raids kommt an');
  const heim = start();
  const bezahlt = applyRaidLoot(heim, beute());
  check('Die Essenz der Beute landet im Heimatstand', bezahlt.essence === heim.essence + beute().essence);
  check('Der Blutstein der Beute landet im Kreislauf', bezahlt.economy.bloodstone.stored === beute().bloodstone);
  check('Die Kolonie bleibt beim Auszahlen stehen', bezahlt.world === heim.world && bezahlt.dunglings === heim.dunglings);
  check('Ein verlorener Raid gibt nichts her', raidLoot({ phase: RAID_PHASE.RESOLVED, lost: true, carried: null }).ok === false);
}

function checkGrab() {
  section('Kreislauf im Spiel: der Grab gibt Aether in den Spielstand');
  const imTiefen = grab(start(), weltInTiefe(SCHWELLE));
  const imFlachen = grab(start(), weltInTiefe(TIEFSTE));
  check('Ein Grab auf der gekauften Etage gibt Aether in den Spielstand',
    imTiefen.economy.aether.stored === ausbeute(SCHWELLE), `${imTiefen.economy.aether.stored}`);
  check('Ein Grab auf einer freien Etage gibt nichts', imFlachen.economy.aether.stored === 0);
  check('Ein flacher Grab laesst die Kolonie unmutiert', imFlachen.economy.aether.mutations === 0);
}

function checkAbstiegsTor() {
  section('Kreislauf im Spiel: das Tor zum Aether');
  const ohne = leeres();
  const reich = lootInto(leeres(), { bloodstone: ersteEtage() });
  const tor = mitSchacht(start()).buildings;
  check('Die freie Etage bleibt ohne Blutstein offen', descendOpen({ depth: 0, cycle: ohne, buildings: tor }) === true);
  check('An der tiefsten freien Etage ist ohne Blutstein kein Abstieg offen',
    descendOpen({ depth: TIEFSTE, cycle: ohne, buildings: tor }) === false);
  check('Mit genug Blutstein oeffnet sich der Abstieg eine Etage tiefer',
    descendOpen({ depth: TIEFSTE, cycle: reich, buildings: tor }) === true);
}

export function checkCycleGame() {
  section('Kreislauf im Spiel: derselbe Seed, dieselbe Welt');
  check('Zwei Spielstaende aus demselben Seed sind gleich', JSON.stringify(start()) === JSON.stringify(start()));
  check('Eine andere Tiefe gibt eine andere Welt', weltInTiefe(TIEFSTE).seed !== weltInTiefe(SCHWELLE).seed);
  checkLeiter();
  checkAbstiegsTor();
  checkBezahlt();
  checkBeute();
  checkGrab();
}
