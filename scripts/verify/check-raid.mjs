/** Der Raid: Ausdauer aus der Config, fail-closed, Hash ohne Log, Einmarsch reproduzierbar. */
import { HIVE_ORIGIN } from '../../src/domain/world/world-config.js';
import { RAID_CONFIG, RAID_PHASE, approachSteps, maxTeamGrit, teamStamina } from '../../src/domain/raid/raid-config.js';
import { candidates, entryPointFor, entrySeed } from '../../src/domain/raid/raid-spawn-seed.js';
import { canSpend, createRaidState, record, spend, stateHashInput, teamGritOf } from '../../src/domain/raid/raid-state.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { checkRaidTerrain } from './check-raid-terrain.mjs';
import { check, section } from './expect.mjs';

const TICKETS = 600;
const KADER = 7;

function hero(id, grit, speed = KADER) {
  return { id, name: `Held ${id}`, atk: 10, grit, speed };
}

function ticketOf(heroes) {
  return { id: 'raid-ticket-1', entry: { x: HIVE_ORIGIN.x, y: HIVE_ORIGIN.y }, heroes };
}

function bareTeam() {
  return ticketOf([hero('a', 0), hero('b', 0)]);
}

function keyOf(point) {
  return `${point.x}:${point.y}`;
}

function seedOf(index, defenderSeed) {
  return entrySeed({ ticketId: index, attackerId: `a${index}`, defenderSeed });
}

function sample(world, defenderSeed) {
  const punkte = [];
  for (let index = 0; index < TICKETS; index += 1) {
    punkte.push(entryPointFor(world, { seed: seedOf(index, defenderSeed), origin: HIVE_ORIGIN }));
  }
  return punkte;
}

/** Eine Ausdauer, die nicht aus der Konfiguration stammt, ist hier eine Zahl, sonst eine Zusage. */
function checkStamina() {
  section('Raid-Ausdauer: aus der Konfiguration, nicht aus einem Literal');
  const ticket = bareTeam();
  const state = createRaidState(ticket);
  check('Die Ausdauer folgt dem grit des Kaders', state.stamina === teamStamina(teamGritOf(ticket), RAID_CONFIG));
  check('Ein nacktes Team bekommt genau die Basis-Ausdauer', state.stamina === RAID_CONFIG.baseStamina, `${state.stamina}`);
  check('Startwert und Maximum sind dasselbe', state.stamina === state.staminaMax);
  check('Der voll bestueckte Kader erreicht die Obergrenze der Config', teamStamina(maxTeamGrit(), RAID_CONFIG) === RAID_CONFIG.baseStamina + RAID_CONFIG.bonusStamina);
  const eng = { ...RAID_CONFIG, baseStamina: RAID_CONFIG.baseStamina + 1, bonusStamina: 0 };
  check('Eine andere Konfiguration aendert die Ausdauer', createRaidState(ticket, eng).stamina === eng.baseStamina);
}

/** Zu wenig Ausdauer darf den Zustand nicht anruehren — auch nicht sein Log. */
function checkFailClosed() {
  section('Raid-Ausdauer: fail closed');
  const state = { ...createRaidState(bareTeam()), stamina: 3 };
  const zuTeuer = spend(state, 4);
  check('Genau der verbleibende Betrag reicht noch', spend(state, 3).stamina === 0);
  check('Ein zu teurer Zug laesst den Zustand unveraendert', zuTeuer === state);
  check('canSpend sagt dasselbe', canSpend(state, 3) && !canSpend(state, 4));
  check('Nichts wird negativ', spend(state, 999).stamina === 3);
  check('Das Log bleibt unberuehrt', zuTeuer.log === state.log);
}

/** Der Server validiert den Endzustand; das Log ist Beweis, nicht Eingang. */
function checkHash() {
  section('Raid-Hash: Endzustand, nicht das Log');
  const state = createRaidState(bareTeam());
  const input = stateHashInput(state);
  const mitLog = stateHashInput(record(record(state, { type: 'MOVE_N' }), { type: 'DIG_E' }));
  check('Ein zusaetzliches Log aendert den Hash-Eingang nicht', JSON.stringify(input) === JSON.stringify(mitLog));
  check('Der Hash kennt genau die abgemachten Felder',
    Object.keys(input).join(',') === 'format,at,order,path,stamina,phase,heroes,dug,wardens,hive,carried,secured,lost');
  check('Am Helden hasht er nur id und ap', input.heroes.every((held) => Object.keys(held).join(',') === 'id,ap'));
  check('Die aktuellen AP stehen darin', input.heroes[0].ap === state.heroes[0].ap);
  const blind = [['stamina', { ...state, stamina: state.stamina - 1 }], ['phase', { ...state, phase: RAID_PHASE.EXTRACTING }], ['at', { ...state, at: { x: state.at.x + 1, y: state.at.y } }]]
    .filter(([feld, s]) => JSON.stringify(stateHashInput(s)) === JSON.stringify(input)).map(([feld]) => feld);
  check('Ausdauer, Phase und Standort gehen ein', blind.length === 0, blind.join(', '));
  const ohneAp = { ...state, heroes: state.heroes.map((held) => ({ ...held, ap: held.ap - 1 })) };
  check('Die AP der Helden gehen ein', JSON.stringify(stateHashInput(ohneAp)) !== JSON.stringify(input));
}

/** Der Kader wird bei Ticketausstellung fixiert, danach kann niemand mehr aufblasen. */
function checkFrozen() {
  section('Raid-Ticket: vor der Ausfuehrung eingefroren');
  const ticket = ticketOf([hero('a', maxTeamGrit(), KADER)]);
  const state = createRaidState(ticket);
  ticket.heroes[0].grit = 0;
  ticket.heroes[0].speed = 99;
  ticket.entry.x = 0;
  check('Der Kader im Zustand ist eine Kopie', state.heroes[0].grit === maxTeamGrit());
  check('Das AP-Maximum stammt aus der Ticket-Speed', state.heroes[0].apMax === KADER);
  check('Runde eins fuellt die AP auf', state.heroes[0].ap === state.heroes[0].apMax);
  check('Eintritt und Standort sind Kopien des Tickets', state.entry.x === HIVE_ORIGIN.x && state.at.x === HIVE_ORIGIN.x);
  check('Der Kader traegt Kraefte und Berechtigung, sonst nichts', Object.keys(state.heroes[0]).join(',') === 'id,name,atk,grit,dig,apMax,ap', Object.keys(state.heroes[0]).join(','));
}

function checkCandidates() {
  section('Raid-Einmarsch: der Kandidatenkreis');
  const world = createInitialGameState().world;
  const liste = candidates(world, { origin: HIVE_ORIGIN });
  check('Der Kreis um den Hive ist nicht leer', liste.length > 0, `${liste.length} Felder`);
  check('Jeder Kandidat liegt im konfigurierten Radius', liste.every((punkt) => approachSteps(HIVE_ORIGIN, punkt) <= RAID_CONFIG.entryRadius));
  check('Die Liste ist stabil', JSON.stringify(candidates(world, { origin: HIVE_ORIGIN })) === JSON.stringify(liste));
  return liste;
}

function checkEntryPoints(liste) {
  section('Raid-Einmarsch: aus dem Ticket, reproduzierbar');
  const world = createInitialGameState().world;
  const punkte = sample(world, 7);
  check('Jedes Ticket bekommt einen Punkt', punkte.every(Boolean));
  check('Der Punkt liegt auf einem Kandidaten', punkte.every((punkt) => liste.some((kandidat) => kandidat.x === punkt.x && kandidat.y === punkt.y)));
  check('Der Abstand steht am Punkt', punkte.every((punkt) => punkt.distance === approachSteps(HIVE_ORIGIN, punkt)));
  check('Derselbe Seed liefert zweimal denselben Punkt', punkte.every((punkt, index) => JSON.stringify(punkt) === JSON.stringify(entryPointFor(world, { seed: seedOf(index, 7), origin: HIVE_ORIGIN }))));
  check('Eine frisch erzeugte Welt liefert dieselben Punkte', JSON.stringify(sample(createInitialGameState().world, 7)) === JSON.stringify(punkte));
  check('Ein anderer Verteidiger verschiebt den Einmarsch', JSON.stringify(sample(world, 8)) !== JSON.stringify(punkte));
  const verschiedene = new Set(punkte.map(keyOf)).size;
  check('Die Punkte streuen ueber den Kreis', verschiedene > TICKETS / 2, `${verschiedene} verschiedene aus ${TICKETS}`);
}

export function checkRaid() {
  checkStamina();
  checkFailClosed();
  checkHash();
  checkFrozen();
  checkEntryPoints(checkCandidates());
  checkRaidTerrain();
}