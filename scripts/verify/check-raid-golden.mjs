/** Die Raid-Simulation gegen einen eingefrorenen Wert: fester Seed, festes
 *  Skript, erwartete Digest-Kette. Weicht ein Schritt ab, nennt der Befund die
 *  Nummer und beide Werte — und ein veraendertes Skript faellt an seiner Stelle. */
import { readFileSync } from 'node:fs';
import { RAID_ACTION, isKnownAction } from '../../src/domain/raid/raid-actions.js';
import { raidDigest, raidScript, raidSeries } from '../../src/domain/raid/raid-sim.js';
import { replayMatches, replayRaid } from '../../src/domain/raid/raid-replay.js';
import { RAID_GOLDEN_TICKETS } from './raid-golden-fixture.mjs';
import { abweichung, ciNodeMajor, nodeMajor } from '../lib/node-laufzeit.mjs';
import { check, section } from './expect.mjs';

const GOLDEN = 'scripts/verify/raid-golden.json';
const HEX = /^[0-9a-f]{8}$/;

function ersteAbweichung(soll, ist) {
  const laenge = Math.min(soll.length, ist.length);
  for (let index = 0; index < laenge; index += 1) {
    if (soll[index] !== ist[index]) return index;
  }
  return soll.length === ist.length ? -1 : laenge;
}

function befund({ eintrag, soll, ist, ab }) {
  if (ab === -1) return `${ist.length} Schritte`;
  return `Schritt ${ab + 1} von ${soll.length} — erwartet ${soll[ab] ?? '—'}, gelesen ${ist[ab] ?? '—'} (${eintrag.key})`;
}

function checkForm(golden) {
  section('Raid-Golden: die Form');
  const gepinnt = ciNodeMajor();
  check('Der Golden-Wert nennt die Node-Major der CI', golden.nodeMajor === gepinnt, `im Wert ${golden.nodeMajor}, gepinnt ${gepinnt}`);
  const mangel = abweichung({ gepinnt, gelaufen: nodeMajor() });
  check('Diese Laufzeit ist die gepinnte', mangel === null, mangel ?? `Node ${nodeMajor()}`);
  const werte = golden.tickets ?? {};
  const fehlend = RAID_GOLDEN_TICKETS.filter((eintrag) => !werte[eintrag.key]).map((eintrag) => eintrag.key);
  const fremd = Object.keys(werte).filter((key) => !RAID_GOLDEN_TICKETS.some((eintrag) => eintrag.key === key));
  check('Der Golden-Wert kennt genau die Tickets der Vorlage', fehlend.length === 0 && fremd.length === 0, [...fehlend, ...fremd].join(', '));
  const krumm = RAID_GOLDEN_TICKETS.filter((eintrag) => werte[eintrag.key]
    && (werte[eintrag.key].digests.length !== eintrag.steps
      || werte[eintrag.key].seed !== eintrag.seed
      || !werte[eintrag.key].digests.every((digest) => HEX.test(digest))));
  check('Jede Kette hat ihre Schritte und acht Hex-Zeichen je Hash', krumm.length === 0, krumm.map((eintrag) => eintrag.key).join(', '));
}

function checkSimulation() {
  section('Raid-Simulation: derselbe Seed, dasselbe Skript, dasselbe Ergebnis');
  const eintrag = RAID_GOLDEN_TICKETS[0];
  const einmal = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed, steps: eintrag.steps });
  const nochmal = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed, steps: eintrag.steps });
  check('Zweimal derselbe Seed ergibt dieselbe Kette', einmal.digests.join('') === nochmal.digests.join(''));
  const anders = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed + 1, steps: eintrag.steps });
  check('Ein anderer Seed ist ein anderer Lauf', anders.digests.join('') !== einmal.digests.join(''));
  check('Das Skript ist aus dem Vokabular', einmal.actions.every((action) => isKnownAction(action)));
  check('Es kennt mehr als nur einen Schritt', new Set(einmal.actions.map((action) => action.type)).size > 3, `${new Set(einmal.actions.map((action) => action.type)).size} Arten`);
  check('Der Lauf veraendert den Zustand wirklich', new Set(einmal.digests).size > 10 && Object.keys(einmal.state.dug).length > 0, `${new Set(einmal.digests).size} verschiedene Zustaende, ${Object.keys(einmal.state.dug).length} Felder gegraben`);
  const kurz = raidScript({ seed: eintrag.seed, steps: 9999 });
  check('Das Skript bleibt unter dem Replay-Deckel', kurz.length === 512, `${kurz.length} Schritte`);
}

function checkGolden(golden) {
  section('Raid-Golden: die Kette gegen den eingefrorenen Wert');
  for (const eintrag of RAID_GOLDEN_TICKETS) {
    const lauf = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed, steps: eintrag.steps });
    const soll = golden.tickets?.[eintrag.key]?.digests ?? [];
    const ab = ersteAbweichung(soll, lauf.digests);
    check(`Ticket ${eintrag.key} trifft den Golden-Wert`, ab === -1 && soll.length === lauf.digests.length, befund({ eintrag, soll, ist: lauf.digests, ab }));
  }
}

/** Der erste Zug, dessen Wegnahme die Kette genau an seiner eigenen Stelle
 *  veraendert — ein Zug, der wirklich etwas getan hat. */
function wirksameStelle(eintrag, lauf) {
  for (let index = 0; index < Math.min(40, lauf.actions.length); index += 1) {
    const ohne = raidSeries({ ticket: eintrag.ticket, actions: lauf.actions.filter((action, stelle) => stelle !== index) });
    if (ersteAbweichung(lauf.digests, ohne.digests) === index) return index;
  }
  return -1;
}

function checkBites(golden) {
  section('Raid-Golden: der Wert beisst, wenn das Skript sich aendert');
  const eintrag = RAID_GOLDEN_TICKETS[0];
  const lauf = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed, steps: eintrag.steps });
  const soll = golden.tickets?.[eintrag.key]?.digests ?? [];
  const stelle = wirksameStelle(eintrag, lauf);
  check('Das Skript hat einen wirksamen Zug', stelle >= 0, `Stelle ${stelle} von ${lauf.actions.length}`);
  const ohne = raidSeries({ ticket: eintrag.ticket, actions: lauf.actions.filter((action, index) => index !== stelle) });
  check('Sein Weglassen weicht genau an seiner Stelle ab', ersteAbweichung(lauf.digests, ohne.digests) === stelle && ohne.digests.length === lauf.actions.length - 1, `Stelle ${stelle}`);
  const angehaengt = raidSeries({ ticket: eintrag.ticket, actions: [...lauf.actions, { type: RAID_ACTION.LOOT }] });
  check('Ein angehaengter, im Schritt unerlaubter Zug aendert nichts',
    angehaengt.digests.length === lauf.digests.length + 1 && ersteAbweichung(lauf.digests, angehaengt.digests) === lauf.digests.length
      && angehaengt.digests.at(-1) === lauf.digests.at(-1),
    `${angehaengt.digests.at(-1)} gegen ${lauf.digests.at(-1)}`);
  const gekuerzt = raidSeries({ ticket: eintrag.ticket, actions: lauf.actions.slice(0, -1) });
  check('Der Golden-Wert faellt gegen ein gekuerztes Skript', ersteAbweichung(soll, gekuerzt.digests) === gekuerzt.digests.length);
  check('Der ehrliche Endzustand besteht den Replay-Check', replayMatches({ ticket: eintrag.ticket, actions: lauf.actions, claimed: replayRaid({ ticket: eintrag.ticket, actions: lauf.actions }) }));
  check('Ein gefaelschter Endzustand faellt durch', !replayMatches({ ticket: eintrag.ticket, actions: lauf.actions, claimed: { ...lauf.state, stamina: lauf.state.stamina + 9 } }));
  check('Der Digest des Endzustands ist der letzte der Kette', raidDigest(lauf.state) === lauf.digests.at(-1));
}

export function checkRaidGolden() {
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8'));
  checkForm(golden);
  checkSimulation();
  checkGolden(golden);
  checkBites(golden);
}
