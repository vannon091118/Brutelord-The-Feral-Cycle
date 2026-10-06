/** Der Deckel und der Validator. Beides ist eine Zusage ueber den Raid, keine ueber
 *  die Datenbank, deshalb ein eigenes Modul; die Speicher-Zusicherungen stehen in
 *  check-storage.mjs. Die Zahlen stehen in Docs/BACKEND-PLAN.md. */
import { replayMatches, replayOverflow, replayRaid } from '../../src/domain/raid/raid-replay.js';
import { RAID_CONFIG, maxTeamGrit } from '../../src/domain/raid/raid-config.js';
import { stateHashInput } from '../../src/domain/raid/raid-state.js';
import { REJECT, validateRaidReplay } from '../server/raid-validator.mjs';
import { check, section } from './expect.mjs';

function ticket() {
  return {
    id: 't',
    snapshotSeed: 4242,
    entry: { x: 8, y: 8 },
    heroes: [{ id: 'held-a', name: 'Held a', atk: 10, grit: maxTeamGrit(), speed: 4, dig: true }],
  };
}

function checkCap() {
  section('Replay-Deckel: die Tuer vor der Rechnung');
  const base = ticket();
  const erlaubt = Array.from({ length: RAID_CONFIG.maxActions }, () => ({ type: 'DIG_E' }));
  check('Ein Log an der Grenze ist nicht zu lang', !replayOverflow(erlaubt));
  check('Ein Log ueber der Grenze ist zu lang', replayOverflow([...erlaubt, { type: 'DIG_E' }]));
  check('Das echte Log an der Grenze wird noch geprueft',
    replayMatches({ ticket: base, actions: erlaubt, claimed: replayRaid({ ticket: base, actions: erlaubt }) }));
  const ueberlang = [...erlaubt, { type: 'DIG_E' }];
  check('Dasselbe Log mit einem Schritt mehr faellt durch, egal ob der Endzustand stimmt',
    !replayMatches({ ticket: base, actions: ueberlang, claimed: replayRaid({ ticket: base, actions: ueberlang }) }));
}

function checkValidator() {
  section('Einreichung: der Validator rechnet in der Domäne');
  const base = ticket();
  const ehrlich = [{ type: 'DIG_E' }];
  const end = replayRaid({ ticket: base, actions: ehrlich });
  const geprueft = validateRaidReplay({ ticket: base, actions: ehrlich, claimed: end });
  check('Eine echte Einreichung kommt durch', geprueft.ok);
  check('Und liefert den nachgespielten Zustand zurueck',
    JSON.stringify(stateHashInput(geprueft.state)) === JSON.stringify(stateHashInput(end)));
  const gefaelscht = validateRaidReplay({ ticket: base, actions: ehrlich, claimed: { ...end, stamina: end.stamina + 9 } });
  check('Eine aufgeblaehte Ausdauer nicht', gefaelscht.ok === false && gefaelscht.reason === REJECT.MISMATCH);
  const zuLang = validateRaidReplay({
    ticket: base,
    actions: Array.from({ length: RAID_CONFIG.maxActions + 1 }, () => ({ type: 'DIG_E' })),
    claimed: end,
  });
  check('Ein ueberlanges Log wird am Deckel abgewiesen, nicht gerechnet',
    zuLang.ok === false && zuLang.reason === REJECT.TOO_LONG && zuLang.limit === RAID_CONFIG.maxActions, JSON.stringify(zuLang));
  check('Eine Einreichung ohne Ticket ist kaputt, nicht falsch',
    validateRaidReplay({ actions: ehrlich, claimed: end }).reason === REJECT.BROKEN);
  check('Ein fremdes Ticket auch nicht', validateRaidReplay({ ticket: { ...base, entry: { x: 9, y: 8 } }, actions: ehrlich, claimed: end }).ok === false);
}

function versuch(log) {
  try {
    return validateRaidReplay(log).ok === false ? 'abgewiesen' : 'angenommen';
  } catch {
    return 'geworfen';
  }
}

function checkRobust() {
  const kaputt = [
    undefined,
    {},
    { ticket: {}, claimed: {}, actions: null },
    { ticket: {}, claimed: {}, actions: 5 },
    { ticket: {}, claimed: {}, actions: 'abc' },
    { ticket: {}, claimed: {}, actions: {} },
    { ticket: 'x', claimed: {}, actions: [] },
    { ticket: ticket(), claimed: {}, actions: [{ type: 'NOPE' }] },
  ];
  const urteil = kaputt.map(versuch);
  section('Einreichung: ein kaputter Rumpf wird abgewiesen, nicht geworfen');
  check('Kein kaputter Rumpf wirft, jeder wird abgewiesen',
    urteil.every((wert) => wert === 'abgewiesen'), urteil.join(','));
}

export function checkRaidCap() {
  checkCap();
  checkValidator();
  checkRobust();
}
