/** Die vier Staende der Wesen und ihr Material: was die Module ausgeben, muss das
 *  Stylesheet kennen. Ein Stand ohne Regel, eine Wirkung ohne Keyframe oder ein
 *  Platzhalter ohne eigenes Material faellt hier auf, statt still nichts zu tun. */
import { readFileSync } from 'node:fs';
import { DUNGLING_STATE } from '../../src/domain/entities/dungling.js';
import { CREATURE_STATE, creatureClasses, dunglingAnimation } from '../../src/world/dungling/dungling-anim.js';
import { lookOf, materialIds } from '../../src/world/dungling/dungling-look.js';
import { check, section } from './expect.mjs';

const CREATURE_CSS = 'src/styles/creature.css';
const GLOBALS_CSS = 'src/styles/globals.css';
const FIGURE = 'src/world/Dungling.svg.jsx';
const BODY = 'src/world/dungling/DunglingBody.jsx';
const FEET = 'src/world/dungling/DunglingFeet.jsx';
const FACE = 'src/world/dungling/DunglingFace.jsx';
const TOOL = 'src/world/dungling/DunglingTool.jsx';
const SKIN = 'src/world/dungling/organic-skin.jsx';
const FEATURES = 'src/world/dungling/organic-features.jsx';
const MUTANT = 'src/world/dungling/MutantSvg.jsx';
const LAYER = 'src/world/WorkerLayer.jsx';
const BENCH = 'src/ui/stone/LabBench.jsx';

const MARKUP = [FIGURE, BODY, FEET, FACE, TOOL, SKIN, FEATURES];
const STAENDE = Object.values(CREATURE_STATE);
const FELDER = ['shell', 'core', 'air', 'ground'];
const WIRKUNGEN = [
  'dl-creature-air',
  'dl-creature-breathe',
  'dl-creature-crown',
  'dl-creature-glint',
  'dl-creature-ground',
  'dl-creature-mote',
  'dl-creature-pores',
  'dl-creature-ring',
  'dl-creature-strike',
];
const HAUTFELDER = ['skin:', 'wash:', 'air:', 'ground:', 'gleam:'];
const SOLL = Object.freeze({
  [DUNGLING_STATE.NONE]: CREATURE_STATE.REST,
  [DUNGLING_STATE.SPAWNING]: CREATURE_STATE.REST,
  [DUNGLING_STATE.IDLE]: CREATURE_STATE.REST,
  [DUNGLING_STATE.MOVING]: CREATURE_STATE.MOVE,
  [DUNGLING_STATE.WORKING]: CREATURE_STATE.ACTIVE,
});
const IDS = ['dungling-1', 'dungling-2', 'lab', 'mutant-base', 'dungling 7 "x'];

function source(path) {
  return readFileSync(path, 'utf8');
}

function standsIn(classes) {
  return STAENDE.filter((stand) => classes.split(' ').includes(`dl-creature--${stand}`));
}

/** Was das Markup an Wesen-Klassen nennt, wird nicht abgeschrieben, sondern gelesen. */
function emittiert() {
  const gefunden = new Set();
  for (const path of MARKUP) for (const treffer of source(path).matchAll(/dl-creature-[a-z-]+/g)) gefunden.add(treffer[0]);
  return [...gefunden].sort();
}

function animationNames(css) {
  const namen = [];
  for (const line of css.split('\n')) {
    const match = /animation:\s*([^;]+)/.exec(line);
    if (!match) continue;
    for (const teil of match[1].replace(/\([^)]*\)/g, '').split(',')) namen.push(teil.trim().split(/\s+/)[0]);
  }
  return namen.filter((name) => name !== '' && name !== 'none');
}

function checkStands() {
  section('Wesen: vier Staende, genau einer je Figur');
  check('Es gibt genau vier Staende', STAENDE.length === 4 && new Set(STAENDE).size === 4, STAENDE.join(', '));
  const ohne = STAENDE.filter((stand) => !creatureClasses({ mood: stand }).split(' ').includes(`dl-creature--${stand}`));
  check('Jeder Stand ist eine eigene Klasse', ohne.length === 0, ohne.join(', '));
  const mehrfach = STAENDE.filter((stand) => standsIn(creatureClasses({ mood: stand })).length !== 1);
  check('Eine Figur traegt genau einen Stand', mehrfach.length === 0, mehrfach.join(', '));
  check('Ohne Angabe ruht die Figur', standsIn(creatureClasses())[0] === CREATURE_STATE.REST, creatureClasses());
  check('Gesperrt schlaegt den Stand', standsIn(creatureClasses({ mood: CREATURE_STATE.ACTIVE, muted: true }))[0] === CREATURE_STATE.MUTED);
  check('Die Grundklasse steht vorn', creatureClasses({ mood: CREATURE_STATE.MOVE }).startsWith('dl-creature '), creatureClasses({ mood: CREATURE_STATE.MOVE }));
  const mutiert = creatureClasses({ mutant: true });
  check('Das Mutant-Sein ist eine zweite Achse', mutiert.includes('dl-creature--mutant') && standsIn(mutiert).length === 1, mutiert);
}

function checkDomainStates() {
  section('Wesen: jeder Domaenenzustand hat seinen Stand');
  const zustaende = Object.values(DUNGLING_STATE);
  const offen = zustaende.filter((state) => SOLL[state] === undefined);
  check('Kein Domaenenzustand bleibt ungemappt', offen.length === 0, offen.join(', ') || `${zustaende.length} Zustaende`);
  const falsch = zustaende.filter((state) => SOLL[state] !== undefined && dunglingAnimation(state).mood !== SOLL[state]);
  check('Jeder Zustand traegt seinen Stand', falsch.length === 0, falsch.join(', '));
  const auseinander = zustaende.filter((state) => {
    const view = dunglingAnimation(state);
    return view.working !== (view.mood === CREATURE_STATE.ACTIVE) || view.moving !== (view.mood === CREATURE_STATE.MOVE);
  });
  check('Stand, Arbeiten und Laufen sagen dasselbe', auseinander.length === 0, auseinander.join(', '));
  check('Arbeit ist der aktive Stand', dunglingAnimation(DUNGLING_STATE.WORKING).mood === CREATURE_STATE.ACTIVE);
  check('Ruhe ist der ruhende Stand', dunglingAnimation(DUNGLING_STATE.IDLE).mood === CREATURE_STATE.REST);
}

function checkMaterial() {
  section('Wesen: das Material gehoert der Kennung');
  const namen = IDS.map((id) => materialIds(id));
  const alle = namen.flatMap((ids) => FELDER.map((feld) => ids[feld]));
  check('Vier Namen je Wesen', namen.every((ids) => FELDER.every((feld) => typeof ids[feld] === 'string' && ids[feld] !== '')));
  check('Die vier Namen sind verschieden', namen.every((ids) => new Set(FELDER.map((feld) => ids[feld])).size === FELDER.length));
  check('Zwei Wesen teilen keinen Namen', new Set(alle).size === alle.length, `${alle.length - new Set(alle).size} Doppelungen`);
  check('Das Material hat einen eigenen Namensraum', alle.every((name) => name.startsWith('dl-cr-')), alle.find((name) => !name.startsWith('dl-cr-')) ?? '');
  check('Die Namen sind fuer SVG und CSS brauchbar', alle.every((name) => /^[A-Za-z0-9_-]+$/.test(name)), alle.filter((name) => !/^[A-Za-z0-9_-]+$/.test(name)).join(', '));
  check('Zweimal dieselbe Kennung ergibt dieselben Namen', JSON.stringify(materialIds('dungling-3')) === JSON.stringify(materialIds('dungling-3')));
  check('Der Look traegt dasselbe Material', IDS.every((id) => JSON.stringify(lookOf(id).ids) === JSON.stringify(materialIds(id))));
  const haut = source(SKIN);
  const feld = /export function skinIds\(id\) \{([\s\S]*?)\n\}/.exec(haut);
  check('Die Mutantenhaut traegt ihre eigenen fuenf Namen', Boolean(feld) && HAUTFELDER.every((key) => feld[1].includes(key)), feld ? '' : 'skinIds() nicht gefunden');
  check('Haut und Koerper koennen nicht kollidieren', Boolean(feld) && !feld[1].includes('dl-cr-'));
}

function checkStylesheet() {
  section('Wesen: das Stylesheet kennt jede Klasse, die das Markup vergibt');
  const css = source(CREATURE_CSS);
  const global = source(GLOBALS_CSS);
  check('Die Wesen-CSS wird geladen', /@import\s+["']\.\/creature\.css["']/.test(global), 'globals.css ohne Import');
  const ausMarkup = emittiert();
  check('Das Markup nennt ueberhaupt Wirkungen', ausMarkup.length >= WIRKUNGEN.length, `${ausMarkup.length} Klassen`);
  const regeln = (name) => new RegExp(`\\.${name}(?![\\w-])`).test(css);
  const ohneRegel = [...new Set(ausMarkup.filter((name) => !regeln(name)))];
  check('Jede Klasse aus dem Markup hat eine Regel', ohneRegel.length === 0, ohneRegel.join(', '));
  const verschwunden = WIRKUNGEN.filter((name) => !ausMarkup.includes(name));
  check('Alle neun Wirkungen stehen noch im Markup', verschwunden.length === 0, verschwunden.join(', '));
  const wirkungslos = WIRKUNGEN.filter((name) => !regeln(name));
  check('Jede Wirkung hat ihre Regel', wirkungslos.length === 0, wirkungslos.join(', '));
  const standOhneRegel = STAENDE.filter((stand) => !css.includes(`.dl-creature--${stand}`));
  check('Jeder Stand hat eine eigene Regel', standOhneRegel.length === 0, standOhneRegel.join(', '));
  const namen = animationNames(css);
  const ohneKeyframe = [...new Set(namen)].filter((name) => !css.includes(`@keyframes ${name}`) && !global.includes(`@keyframes ${name}`));
  check('Jede Animation hat ihre Keyframes', namen.length > 0 && ohneKeyframe.length === 0, ohneKeyframe.join(', '));
  const umgezogen = ['dl-dungle-breathe', 'dl-dungle-work', 'dl-tool-swing'];
  check('Die Wesen-Animationen wohnen in der Wesen-CSS', umgezogen.every((name) => css.includes(`@keyframes ${name}`)) && !global.includes('@keyframes dl-dungle-work'), 'globals.css traegt sie noch');
  const hover = css.split('\n').filter((line) => line.includes(':hover'));
  const ungebunden = hover.filter((line) => !line.includes('.dl-bench'));
  check('Der Hover haengt allein an der Bank', hover.length > 0 && ungebunden.length === 0, ungebunden.join(' | '));
  check('Der gesperrte Platz hebt sich nicht', css.includes(':not(.dl-creature--muted)'));
  const luft = css.split('\n').filter((line) => line.includes('dl-creature-air'));
  check('Der aktive Stand treibt die Aetherluft', luft.some((line) => line.includes('dl-creature--active')));
}

function checkWiring() {
  section('Wesen: die Verdrahtung, die den Stand erzeugt');
  const figure = source(FIGURE);
  check('Die Feldfigur traegt den Klassenzettel', /className=\{creatureClasses\(\{ mood: view\.mood \}\)\}/.test(figure));
  check('Die Fuesse bekommen den Look am Aufrufort', /<DunglingFeet[^>]*look=\{look\}/.test(figure), 'Bodenkontakt ohne Material');
  check('Die Feldfigur nimmt keinen Treffer', figure.includes("pointerEvents: 'none'"), 'ein treffbares Wesen schluckt den Klick darunter');
  const body = source(BODY);
  check('Der Koerper reicht sein eigenes Material weiter', /<Materials ids=\{ids\} \/>/.test(body) && body.includes('const { ids } = look'));
  const feet = source(FEET);
  check('Der Bodenring haengt am Stand', feet.includes('dl-creature-ring') && /<ContactShadow[^>]*ground=\{look\.ids\.ground\}/.test(feet));
  const mutant = source(MUTANT);
  check('Der Mutant nimmt Zustand und Sperre', mutant.includes('state = null') && mutant.includes('muted = false') && /creatureClasses\(\{[^}]*muted[^}]*\}\)/.test(mutant));
  check('Der Mutant liest den Stand des Wesens', /dunglingAnimation\(state\)\.mood/.test(mutant), 'Etikett und Figur ohne Zustand');
  check('Der gesperrte Platz meldet sich anders', mutant.includes('Dungling im Gerüst'), 'Etikett ohne Unterschied');
  check('Der Schwarm reicht den Domaenenzustand durch', source(LAYER).includes('state={dungling.state}'));
  const skin = source(SKIN);
  check('Die Aetherluft haengt an der Aetherfarbe', skin.includes('--color-aether-400') && skin.includes('dl-creature-air'));
  check('Luft und Boden messen am Koerper, nicht am Zoom', /<Air ids=\{ids\} extent=\{extent\} \/>/.test(skin) && /<Ground ids=\{ids\} extent=\{extent\} \/>/.test(skin));
  const bench = source(BENCH);
  check('Die Bank traegt Hover und Sperre', bench.includes('dl-bench') && bench.includes('muted={!genome}'));
}

export function checkCreatureStates() {
  checkStands();
  checkDomainStates();
  checkMaterial();
  checkStylesheet();
  checkWiring();
}
