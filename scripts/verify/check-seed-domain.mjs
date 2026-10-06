/** Die Trennung der Seed-Domaenen: SALT_HOME hat einen Ort je Salz-Set, und
 *  deriveSeed liefert je Domaene eine eigene Zahl. Geprueft wird der Namensraum
 *  selbst — die bestehenden Ableitungen laufen bewusst nicht darueber. */
import { existsSync } from 'node:fs';
import { DERIVATION_VERSION, DOMAIN_SALT, SALT_HOME, SEED_DOMAIN, deriveSeed } from '../../src/domain/seed/seed-domain.js';
import { worldSeed32 } from '../../src/domain/seed/seed-input.js';
import { floorSeed } from '../../src/domain/world/floor.js';
import { blockHash, depositSalt } from '../../src/domain/deposits/deposit-hash.js';
import { entrySeed, mixRaid, textSeed } from '../../src/domain/raid/raid-spawn-seed.js';
import { check, section } from './expect.mjs';

const SCHLUESSEL = 'a1b2c3d4';
const DOMAENEN = Object.values(SEED_DOMAIN);
const ROOTS = Array.from({ length: 32 }, (unused, index) => (((index + 1) * 2654435761) >>> 0).toString(16));
const KENNUNGEN = Array.from({ length: 32 }, (unused, index) => `ticket-${index}`);
const UINT32 = 4294967295;

function checkSaltHome() {
  section('Seed-Domaenen: jedes Salz-Set hat einen Ort');
  const sets = Object.entries(SALT_HOME);
  const fremd = sets.filter(([, eintrag]) => !DOMAENEN.includes(eintrag.domain));
  check('Jedes Set nennt eine Domaene aus SEED_DOMAIN', fremd.length === 0, fremd.map(([name]) => name).join(', '));
  const fehlt = sets.filter(([, eintrag]) => !existsSync(eintrag.module));
  check('Jedes Set nennt ein Modul, das es gibt', fehlt.length === 0, fehlt.map(([, eintrag]) => eintrag.module).join(', '));
  const ohne = DOMAENEN.filter((domain) => !sets.some(([, eintrag]) => eintrag.domain === domain));
  check('Keine Domaene ist leer', ohne.length === 0, ohne.join(', '));
  check('Jede Domaene hat ihr eigenes Salz', new Set(Object.values(DOMAIN_SALT)).size === DOMAENEN.length);
  check('Die Ableitungsfassung steht auf 1', DERIVATION_VERSION === 1);
}

function checkSeparation() {
  section('Seed-Domaenen: derselbe Wurzelseed, vier eigene Zahlen');
  const werte = DOMAENEN.map((domain) => deriveSeed({ playerseed: SCHLUESSEL, domain }));
  check('Vier Domaenen ergeben vier verschiedene Werte', new Set(werte).size === DOMAENEN.length, werte.join(', '));
  check('Jeder Wert ist eine uint32', werte.every((value) => Number.isInteger(value) && value >= 0 && value <= UINT32));
  const zweimal = DOMAENEN.map((domain) => deriveSeed({ playerseed: SCHLUESSEL, domain }));
  check('Derselbe Aufruf ergibt dasselbe', zweimal.join(',') === werte.join(','));
  check('Ein anderer Wurzelseed ergibt andere Werte', DOMAENEN.map((domain) => deriveSeed({ playerseed: '00ff00ff', domain })).join(',') !== werte.join(','));
  check('Ein Thema aendert die Ableitung', DOMAENEN.map((domain) => deriveSeed({ playerseed: SCHLUESSEL, domain, topic: 'erde' })).join(',') !== werte.join(','));
  check('Ein Index aendert die Ableitung', DOMAENEN.map((domain) => deriveSeed({ playerseed: SCHLUESSEL, domain, index: 3 })).join(',') !== werte.join(','));
}

function checkEntropy() {
  section('Seed-Domaenen: 32 Wurzeln, vier Domaenen, keine Kollision');
  const jeDomaene = DOMAENEN.map((domain) => ROOTS.map((playerseed) => deriveSeed({ playerseed, domain })));
  const alle = jeDomaene.flat();
  check(`Alle ${alle.length} Werte aus 32 Wurzeln sind verschieden`, new Set(alle).size === alle.length, `${new Set(alle).size} verschiedene`);
  const flach = jeDomaene.map((werte) => new Set(werte).size).filter((count) => count !== ROOTS.length);
  check('Jede Domaene trennt alle 32 Wurzeln', flach.length === 0, flach.join(', '));
  const themen = DOMAENEN.flatMap((domain) => ['erde', 'stein', 'kern'].map((topic) => deriveSeed({ playerseed: SCHLUESSEL, domain, topic })));
  check('Auch Themen kollidieren nicht', new Set(themen).size === themen.length, `${new Set(themen).size} von ${themen.length}`);
  const bits = jeDomaene.map((werte) => werte.reduce((acc, value) => acc | value, 0) >>> 0);
  check('Jede Domaene deckt alle 32 Bit ab', bits.every((value) => value === UINT32), bits.map((value) => value.toString(16)).join(', '));
}

function checkRaidStreams() {
  section('Seed-Domaenen: der Raid streut nach Kennung');
  const basis = { attackerId: 'a1', defenderId: 'burg', defenderSeed: 4242 };
  const werte = [entrySeed(basis), entrySeed({ ...basis, attackerId: 'a2' }), entrySeed({ ...basis, defenderId: 'turm' }), entrySeed({ ...basis, defenderSeed: 77 })];
  check('Angreifer, Verteidiger und Snapshot trennen den Einmarsch', new Set(werte).size === werte.length, werte.join(', '));
  check('Dieselbe Kennung ergibt dieselbe Saat', entrySeed(basis) === werte[0]);
  check('32 Kennungen sind 32 Saaten', new Set(KENNUNGEN.map((attackerId) => entrySeed({ ...basis, attackerId }))).size === KENNUNGEN.length);
  const stroeme = KENNUNGEN.map((text) => mixRaid(textSeed(`${text}|1|60,28`), 1103515245));
  check('32 Tickets sind 32 Erkundungsstroeme', new Set(stroeme).size === stroeme.length);
  const runden = [1, 2, 3].map((round) => mixRaid(textSeed(`t1|${round}|60,28`), 1103515245));
  check('Die Runde aendert den Strom', new Set(runden).size === 3);
  const orte = ['60,28', '61,28', '60,27'].map((id) => mixRaid(textSeed(`t1|1|${id}`), 1103515245));
  check('Der Ort aendert den Strom', new Set(orte).size === 3);
  const vorzeichen = KENNUNGEN.filter((attackerId) => entrySeed({ ...basis, attackerId }) < 0).length;
  check('Bekannter Fund: entrySeed liefert ein Vorzeichen', vorzeichen > 0 && vorzeichen < KENNUNGEN.length, `${vorzeichen} von ${KENNUNGEN.length} negativ`);
}

function checkGoldenCompat() {
  // Die Wackelkontur braucht createWorld und steht deshalb in check-seed.mjs.
  section('Seed-Domaenen: die alten Golden-Seeds stehen unveraendert');
  const WORLD = 2712847316;
  check('worldSeed32 a1b2c3d4 ist unveraendert', worldSeed32(SCHLUESSEL) === WORLD);
  check('floorSeed Etage 0 ist der Rohseed', floorSeed(SCHLUESSEL, 0) === WORLD && WORLD === worldSeed32(SCHLUESSEL));
  const tiefen = [1, 2, 3].map((depth) => floorSeed(SCHLUESSEL, depth));
  check('floorSeed 1 bis 3 sind unveraendert', tiefen.join(',') === '1789185874,2424540310,3079933667', tiefen.join(', '));
  check('blockHash 3,7 ist unveraendert', blockHash(3, 7, WORLD) === 2126568209);
  check('depositSalt 0 und 2 ist unveraendert', depositSalt(0, WORLD) === -388517677 && depositSalt(2, WORLD) === 4920353845);
}

function checkFailClosed() {
  section('Seed-Domaenen: eine ungueltige Wurzel ergibt keine Zahl');
  const kaputt = DOMAENEN.map((domain) => deriveSeed({ playerseed: 'ZZZZZZZZ', domain }));
  check('Ungueltige Wurzel ergibt null statt einer Zahl', kaputt.every((value) => value === null), kaputt.join(', '));
  const anonym = deriveSeed({ playerseed: worldSeed32(undefined), domain: SEED_DOMAIN.WORLD });
  check('Eine fehlende Wurzel ergibt die anonyme Welt, keine Null', deriveSeed({ domain: SEED_DOMAIN.WORLD }) === anonym && anonym !== null);
  check('Eine unbekannte Domaene ergibt null', deriveSeed({ playerseed: SCHLUESSEL, domain: 'NOPE' }) === null);
  check('Die Null bleibt ein gueltiger Wurzelseed', DOMAENEN.every((domain) => deriveSeed({ playerseed: '00000000', domain }) !== null));
}

function checkMixerTrap() {
  section('Seed-Domaenen: der Mixer selbst liest einen Text als Null');
  check('Bekannter Fund: mixRaid(nicht-Zahl) ist fuer jeden Text derselbe', mixRaid('ticket-1|1|60,28', 1103515245) === mixRaid('ticket-999|7|12,44', 1103515245));
  check('textSeed ist die Tuer, die trennt', textSeed('ticket-1|1|60,28') !== textSeed('ticket-999|7|12,44'));
  check('seedOf trennt eine Zahl von ihrem Text', entrySeed({ attackerId: 42, defenderId: 'b', defenderSeed: 1 }) !== entrySeed({ attackerId: '42', defenderId: 'b', defenderSeed: 1 }));
}

export function checkSeedDomain() {
  checkSaltHome();
  checkSeparation();
  checkEntropy();
  checkRaidStreams();
  checkGoldenCompat();
  checkFailClosed();
  checkMixerTrap();
}
