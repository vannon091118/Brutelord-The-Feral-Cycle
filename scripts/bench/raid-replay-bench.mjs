/** Der Replay-Benchmark: misst die Serverrechnung und beantwortet die Frage, ob
 *  Cloudflare das Replay traegt. Zahlen und Entscheidung: Docs/BACKEND-PLAN.md. */
import { replayMatches, replayRaid } from '../../src/domain/raid/raid-replay.js';
import { createRaidWorld } from '../../src/domain/raid/raid-world.js';
import { stateHashInput } from '../../src/domain/raid/raid-state.js';
import { RAID_CONFIG, maxTeamGrit } from '../../src/domain/raid/raid-config.js';

export const BUDGET_MS = 10;

const WARMUP = 40;
const RUNS = 21;
const SEED = 4242;
const OPPOSITE = Object.freeze({ N: 'S', S: 'N', E: 'W', W: 'E' });

/** Der kuerzeste Grabweg auf der Achse: was ein Angriff wirklich kostet. */
function approach(from, hive) {
  const out = [];
  const ax = Math.sign(hive.x - from.x);
  const ay = Math.sign(hive.y - from.y);
  for (let x = from.x; x !== hive.x; x += ax) out.push({ type: `DIG_${ax > 0 ? 'E' : 'W'}` });
  for (let y = from.y; y !== hive.y; y += ay) out.push({ type: `DIG_${ay > 0 ? 'S' : 'N'}` });
  return out;
}

/** Graben, dann im Korridor pendeln: kostenlos, aber jeder Schritt landet im Log. */
function corridor(from, hive, count) {
  const out = approach(from, hive);
  const last = out[out.length - 1]?.type.slice(-1) ?? 'S';
  const back = OPPOSITE[last];
  while (out.length < count) out.push({ type: out.length % 2 === 0 ? `MOVE_${back}` : `MOVE_${last}` });
  return out;
}

function ticketAt(hive) {
  return {
    id: 'bench',
    snapshotSeed: SEED,
    entry: { x: hive.x, y: hive.y + 20 },
    heroes: [{ id: 'held-a', name: 'Held a', atk: 10, grit: maxTeamGrit(), speed: 4, dig: true }],
  };
}

function median(fn) {
  const times = [];
  for (let run = 0; run < RUNS; run += 1) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return times[Math.floor(RUNS / 2)];
}

/** Das Replay ohne Deckel — nur diese Zahl darf man mit der Grenze vergleichen. */
function rawReplay({ ticket, actions, claimed }) {
  const eigenes = replayRaid({ ticket, actions });
  return JSON.stringify(stateHashInput(eigenes)) === JSON.stringify(stateHashInput(claimed));
}

function measure(ticket, actions) {
  const claimed = replayRaid({ ticket, actions });
  for (let i = 0; i < WARMUP; i += 1) replayMatches({ ticket, actions, claimed });
  return {
    log: claimed.log.length,
    own: median(() => rawReplay({ ticket, actions, claimed })),
    withWorld: median(() => rawReplay({ ticket, actions, claimed: replayRaid({ ticket, actions }) })),
    gedeckelt: median(() => replayMatches({ ticket, actions, claimed })),
  };
}

function report(log, rows, welt) {
  log.write('Fall                          Log   ohne Deckel   mit Weltbau   mit Deckel\n');
  for (const row of rows) {
    const zellen = [row.own, row.withWorld, row.gedeckelt].map((ms) => `${ms.toFixed(3)}ms`.padStart(12));
    log.write(`${row.name.padEnd(28)} ${String(row.log).padStart(4)}  ${zellen.join(' ')}\n`);
  }
  log.write(`\ncreateRaidWorld allein: ${welt.toFixed(3)}ms fuer 4096 Felder\n`);
}

export function benchReplay({ log = process.stdout } = {}) {
  const hive = createRaidWorld({ snapshotSeed: SEED }).hiveOrigin;
  const ticket = ticketAt(hive);
  const cases = [
    ['Einmarsch (real)', approach(ticket.entry, hive)],
    [`Korridor ${RAID_CONFIG.maxActions} (Grenze)`, corridor(ticket.entry, hive, RAID_CONFIG.maxActions)],
    ['Korridor 800 (unzulässig)', corridor(ticket.entry, hive, 800)],
    ['Korridor 3000 (unzulässig)', corridor(ticket.entry, hive, 3000)],
  ];
  const rows = cases.map(([name, actions]) => ({ name, ...measure(ticket, actions) }));
  const welt = median(() => createRaidWorld({ snapshotSeed: SEED }));
  report(log, rows, welt);
  const eintritt = rows[0];
  const grenze = rows[1];
  const vorletzte = rows[rows.length - 2];
  const letzte = rows[rows.length - 1];
  log.write(`\nGrenze ${BUDGET_MS}ms (Cloudflare Free, CPU je Aufruf):\n`);
  log.write(`  Einmarsch, echter Angriff   ${eintritt.withWorld.toFixed(3)}ms — ${eintritt.withWorld < BUDGET_MS ? 'tragt' : 'traegt nicht'}\n`);
  log.write(`  längstes erlaubtes Log      ${grenze.withWorld.toFixed(3)}ms — ${grenze.withWorld < BUDGET_MS ? 'tragt' : 'traegt nicht'}\n`);
  log.write(`\n  ${grenze.log} Schritte kosten ${(grenze.withWorld / eintritt.withWorld).toFixed(1)}x so viel wie ${eintritt.log}.\n`);
  log.write(`  Ohne Deckel waeren ${letzte.log} Schritte ${letzte.withWorld.toFixed(1)}ms: die ${BUDGET_MS}ms fallen zwischen\n`);
  log.write(`  ${vorletzte.log} und ${letzte.log} Schritten. Der Deckel bei ${RAID_CONFIG.maxActions} haelt das laengste\n`);
  log.write(`  erlaubte Log bei ${grenze.withWorld.toFixed(3)}ms und laesst ${(BUDGET_MS - grenze.withWorld).toFixed(1)}ms Luft.\n`);
  return { rows, welt, eintritt, grenze, tragend: grenze.withWorld < BUDGET_MS };
}

if (import.meta.filename === process.argv[1]) {
  const { grenze, tragend } = benchReplay();
  const satz = `das laengste erlaubte Log kostet ${grenze.withWorld.toFixed(3)}ms, das Limit ist ${BUDGET_MS}ms`;
  process.stdout.write(`\n${tragend ? 'OK' : 'FAIL'}: ${satz}.\n`);
  process.exit(tragend ? 0 : 1);
}
