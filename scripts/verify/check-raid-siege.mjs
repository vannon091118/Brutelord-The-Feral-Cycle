/** Ein Raid von der ersten Aktion bis zur Auszahlung: alle sieben Phasen,
 *  Wächter-Koma, Opfer, Beute, Extraktion. Die Erwartungen kommen aus den
 *  Configs und der Phasenkette — keine Zahl ist abgeschrieben. */
import { raidState, raidWorld, runTicks } from './raid-fixture.mjs';
import { fight, hit, lootDeed, marchTo, ontoHive, sacrificeDeed, stepAside } from './raid-siege-fixture.mjs';
import { RAID_CONFIG, RAID_PHASE, RAID_SIEGE, RAID_TRANSITIONS, RAID_WARDEN, maxTeamGrit, phasePath } from '../../src/domain/raid/raid-config.js';
import { applyRaidLoot, raidLoot } from '../../src/domain/raid/raid-loot.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { BLOODSTONE_CONFIG } from '../../src/domain/economy/bloodstone-config.js';
import { check, section } from './expect.mjs';

function summeHp(wardens) {
  return wardens.reduce((sum, wache) => sum + wache.hp, 0);
}

function angriffskraft(state) {
  return state.heroes.filter((hero) => hero.ap >= RAID_CONFIG.attackApCost).reduce((sum, hero) => sum + hero.atk, 0);
}

function abstand(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function verlauf(folgen) {
  const phasen = folgen.flat().map((state) => state.phase);
  return phasen.filter((phase, index) => phase !== phasen[index - 1]);
}

function checkAufstellung(world, start) {
  section('Belagerung: die Verteidigung des fremden Hives');
  check('Der Snapshot stellt die Wächter aus der Config', start.wardens.length === RAID_WARDEN.count, `${start.wardens.length}`);
  check('Jeder Wächter steht am Hive, keiner darauf', start.wardens.every((wache) => abstand(wache.at, world.hiveOrigin) === 1));
  check('Kein Wächter ist zu Beginn im Koma', start.wardens.every((wache) => wache.coma === false));
  check('Der Hive trägt die Leben der Config', start.hive.hp === RAID_SIEGE.hiveHp);
  check('Die Wächter stehen deterministisch', JSON.stringify(raidState({ grit: maxTeamGrit(), heroes: 2 }).wardens) === JSON.stringify(start.wardens));
}

function checkMarsch(world, start) {
  section('Belagerung: der Marsch zum Hive');
  const strecke = marchTo(start, world, { x: world.hiveOrigin.x, y: world.hiveOrigin.y - 1 });
  const amHive = strecke.at(-1);
  check('Das Team steht neben dem Hive', abstand(amHive.at, world.hiveOrigin) === 1, `${amHive.at.x},${amHive.at.y}`);
  check('Der Marsch kostet Ausdauer', amHive.stamina < start.stamina);
  check('Der Marsch bleibt in der ersten Phase', verlauf(strecke).join('>') === RAID_PHASE.ENTER);
  return strecke;
}

function checkKontakt(world, strecke) {
  section('Belagerung: der Kontakt wechselt die Phase');
  const davor = strecke.at(-1);
  const imKampf = ontoHive(davor, world);
  check('Der Hive-Kontakt oeffnet den Kampf', imKampf.phase === RAID_PHASE.COMBAT, imKampf.phase);
  check('Der Übergang kostet, was die Kante nennt',
    davor.stamina - imKampf.stamina === RAID_TRANSITIONS[RAID_PHASE.ENTER][0].staminaCost);
  return imKampf;
}

function checkKampf(world, kampf) {
  section('Belagerung: Schaden und Wächter-Koma');
  const schlag = hit(kampf, world);
  check('Ein Schlag kostet jedem Helden die festen AP',
    schlag.heroes.every((held) => held.ap === held.apMax - RAID_CONFIG.attackApCost));
  check('Der Schaden ist die Summe des atk der Teilnehmer', summeHp(kampf.wardens) - summeHp(schlag.wardens) === angriffskraft(kampf));
  check('Ein einzelner Schlag bringt niemanden ins Koma', schlag.wardens.every((wache) => wache.coma === false));
  const gebunden = stepAside(kampf, world);
  check('Ein wacher Wächter bindet die Gruppe im Nahkampf', gebunden === kampf);
  const gefecht = fight(kampf, world);
  check('Der Kampf endet mit der gefallenen Verteidigung', gefecht.at(-1).phase === RAID_PHASE.WARDEN_DOWN, gefecht.at(-1).phase);
  return gefecht;
}

function checkKoma(world, gefecht) {
  section('Belagerung: das Koma');
  const gefallen = gefecht.at(-1);
  check('Jeder Wächter liegt im Koma und ist nicht verschwunden',
    gefallen.wardens.length === RAID_WARDEN.count && gefallen.wardens.every((wache) => wache.coma && wache.hp === 0));
  check('Das Koma trägt die Frist zur Wiederbelebung',
    gefallen.wardens.every((wache) => wache.revivesAfterMs === RAID_CONFIG.reviveWindowMs));
  check('Der Koma-Wächter behält seinen Seed', gefallen.wardens.every((wache) => Number.isInteger(wache.seed)));
  check('Der Hive ist gefallen', gefallen.hive.hp === 0);
  check('Erst der letzte Schlag auf den Hive bringt die Verteidigung runter',
    gefecht.some((state) => state.phase === RAID_PHASE.COMBAT && state.wardens.every((wache) => wache.coma)));
  return gefallen;
}

function checkOpfer(gefallen) {
  section('Belagerung: das Opfer');
  const geopfert = sacrificeDeed(gefallen);
  check('Das Opfer wechselt in die Opferphase', geopfert.phase === RAID_PHASE.SACRIFICE, geopfert.phase);
  check('Ein Held ist aus der Gruppe genommen', geopfert.heroes.length === gefallen.heroes.length - 1);
  check('Der geopferte Held steht namentlich im Zustand', geopfert.sacrificed.length === gefallen.sacrificed.length + 1);
  check('Das Opfer bringt netto Ausdauer', geopfert.stamina > gefallen.stamina, `${gefallen.stamina} auf ${geopfert.stamina}`);
  return geopfert;
}

function checkBeute(geopfert) {
  section('Belagerung: die Beute wird getragen, nicht ausgezahlt');
  const getragen = lootDeed(geopfert);
  check('Die Beute-Phase ist erreicht', getragen.phase === RAID_PHASE.LOOT, getragen.phase);
  check('Die getragene Beute steht im Zustand', getragen.carried?.essence === RAID_SIEGE.lootEssence);
  check('Vor der Rückkehr ist nichts gesichert', raidLoot(getragen).ok === false, raidLoot(getragen).reason);
  return getragen;
}

function checkExtraktion(world, getragen) {
  section('Belagerung: Extraktion erst zu Hause');
  const rueckweg = marchTo(getragen, world, getragen.entry);
  const zurueck = rueckweg.at(-1);
  check('Der Rückweg führt die Extraktion',
    verlauf(rueckweg).join('>') === `${RAID_PHASE.LOOT}>${RAID_PHASE.EXTRACTING}>${RAID_PHASE.RESOLVED}`,
    verlauf(rueckweg).join('>'));
  check('Der Raid ist aufgelöst und die Beute gesichert', zurueck.phase === RAID_PHASE.RESOLVED && zurueck.secured === true);
  check('Ein verlorener Raid zahlt auch mit gesicherter Beute nichts', raidLoot({ ...zurueck, lost: true }).ok === false);
  check('Ohne getragene Beute gibt es nichts auszuzahlen', raidLoot({ ...zurueck, carried: null }).ok === false);
  return rueckweg;
}

function checkAuszahlung(zurueck) {
  section('Belagerung: die Auszahlung');
  const beute = raidLoot(zurueck);
  const leer = { essence: 0, bloodstone: 0 };
  check('Der aufgeloeste Raid zahlt aus', beute.ok === true);
  check('Der Blutstein kommt aus dem Blutstein-Kreislauf',
    beute.loot?.bloodstone === BLOODSTONE_CONFIG.hiveYield, `${beute.loot?.bloodstone}`);
  const heim = createInitialGameState('raid-beute');
  const bezahlt = applyRaidLoot(heim, beute.loot ?? leer);
  check('Die Essenz landet im Heimatstand', bezahlt.essence === heim.essence + (beute.loot ?? leer).essence);
  check('Der Heimatstand bleibt sonst unberuehrt', bezahlt.world === heim.world && bezahlt.hive === heim.hive);
}

function checkVerlust(world) {
  section('Belagerung: fail closed');
  const arm = { ...raidState({ grit: maxTeamGrit() }), stamina: 0 };
  const verloren = runTicks(arm, world, 1);
  check('Ohne Ausdauer ist der Raid verloren', verloren.phase === RAID_PHASE.RESOLVED && verloren.lost === true);
  check('Ein verlorener Raid liefert nichts', raidLoot(verloren).ok === false);
  check('Die verlorene Beute ist geräumt', verloren.carried === null);
}

export async function checkRaidSiege() {
  const world = raidWorld();
  const start = raidState({ grit: maxTeamGrit(), heroes: 2 });
  checkAufstellung(world, start);
  const strecke = checkMarsch(world, start);
  const kampf = checkKontakt(world, strecke);
  const gefecht = checkKampf(world, kampf);
  const gefallen = checkKoma(world, gefecht);
  const geopfert = checkOpfer(gefallen);
  const getragen = checkBeute(geopfert);
  const rueckweg = checkExtraktion(world, getragen);
  const alle = [...strecke, kampf, ...gefecht, geopfert, getragen, ...rueckweg];
  check('Der Raid durchläuft alle Phasen in der Reihenfolge der Kette',
    verlauf(alle).join('>') === phasePath().join('>'), verlauf(alle).join('>'));
  checkAuszahlung(rueckweg.at(-1));
  checkVerlust(world);
}
