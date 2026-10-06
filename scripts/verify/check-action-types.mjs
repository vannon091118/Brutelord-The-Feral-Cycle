/** Jede benutzte Aktion muss im Register der Aktionstypen stehen, und kein
 *  Zeitplan darf einen namenlosen Typ abfeuern: ein Case-Label auf undefined
 *  faengt sonst jede Aktion ohne Namen und die Kette fuehrt sie still aus. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_ORDER, ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { scheduleFor } from '../../src/domain/onboarding/onboarding-schedule.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

const REGISTER = 'ACTION';
const USAGE_RE = new RegExp(`\\b${REGISTER}\\.([A-Za-z_$][A-Za-z0-9_$]*)`, 'g');
const EXTENSIONS = ['.js', '.jsx', '.mjs'];

/** Ein Treffer in einem Kommentar ist keine Benutzung — der Scanner liest Code. */
function codeOf(path) {
  return readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function collect(dir, found = []) {
  for (const name of readdirSync(dir)) {
    const path = `${dir}/${name}`;
    if (statSync(path).isDirectory()) collect(path, found);
    else if (EXTENSIONS.some((extension) => path.endsWith(extension))) found.push(path);
  }
  return found;
}

function usages() {
  const known = new Set(Object.keys(ACTION));
  const unknown = new Map();
  for (const path of ['src', 'scripts', 'tools'].flatMap((root) => collect(root))) {
    for (const match of codeOf(path).matchAll(USAGE_RE)) {
      if (!known.has(match[1]) && !unknown.has(match[1])) unknown.set(match[1], path);
    }
  }
  return [...unknown].map(([name, path]) => `${REGISTER}.${name} in ${path}`);
}

function blinderPlan() {
  const known = new Set(Object.values(ACTION));
  const blind = [];
  for (const phase of ONBOARDING_ORDER) {
    const plan = scheduleFor(phase);
    for (const timer of plan.timers) {
      if (!known.has(timer.type)) blind.push(`${phase} → ${timer.type}`);
    }
    const interval = plan.interval;
    if (interval && !(known.has(interval.tick) && known.has(interval.complete))) blind.push(`${phase} → Intervall`);
  }
  return blind;
}

function hinge() {
  const start = createInitialGameState('a1b2c3d4');
  const clicked = gameReducer(start, { type: ACTION.HIVE_CLICKED });
  return {
    withoutType: gameReducer(clicked, { type: undefined }) === clicked && gameReducer(start, { type: undefined }) === start,
    mutated: gameReducer(clicked, { type: ACTION.HIVE_MUTATION_STARTED }).onboarding.state === ONBOARDING_STATE.MUTATING,
  };
}

export function checkActionTypes() {
  section('Aktionen: benutzt heisst definiert');
  const benutzt = usages();
  check('Keine benutzte Aktion ist undefiniert', benutzt.length === 0, benutzt.join(', '));
  check('Jeder Wert wiederholt seinen Namen', Object.entries(ACTION).every(([name, value]) => value === name));
  check('Jede Konstante ist ein nichtleerer String', Object.values(ACTION).every((value) => typeof value === 'string' && value !== ''));
  const blind = blinderPlan();
  check('Jeder Zeitplan-Eintrag traegt eine echte Aktion', blind.length === 0, blind.join(', '));
  const lauf = hinge();
  check('Ein Dispatch ohne Typ bewegt nichts', lauf.withoutType, 'sonst faengt ein Case-Label auf undefined jede namenlose Aktion');
  check('Der Hive-Klick erreicht MUTATING', lauf.mutated);
}
