#!/usr/bin/env node
/** Schreibt den Golden-Wert der Raid-Simulation: je Ticket die Digest-Kette
 *  eines festen Skripts. Wie der Determinismus-Golden schreibt ihn nur dieses
 *  Werkzeug, und nur auf der Node-Major, die die CI pinnt. */
import { writeFileSync } from 'node:fs';
import { RAID_GOLDEN_TICKETS } from '../scripts/verify/raid-golden-fixture.mjs';
import { raidSeries } from '../src/domain/raid/raid-sim.js';
import { abweichung, ciNodeMajor, nodeMajor } from '../scripts/lib/node-laufzeit.mjs';

const DATEI = 'scripts/verify/raid-golden.json';

function tickets() {
  const werte = {};
  for (const eintrag of RAID_GOLDEN_TICKETS) {
    const lauf = raidSeries({ ticket: eintrag.ticket, seed: eintrag.seed, steps: eintrag.steps });
    const einmalig = new Set(lauf.digests).size;
    werte[eintrag.key] = { seed: eintrag.seed, steps: eintrag.steps, digests: lauf.digests };
    console.log(`${eintrag.key}: ${lauf.digests.length} Schritte, ${einmalig} verschiedene Zustaende, Phase ${lauf.state.phase}, Ausdauer ${lauf.state.stamina}, gegraben ${Object.keys(lauf.state.dug).length}`);
  }
  return werte;
}

function main() {
  const gepinnt = ciNodeMajor();
  const mangel = abweichung({ gepinnt, gelaufen: nodeMajor() });
  if (mangel) {
    console.error(`Golden-Wert nicht geschrieben: ${mangel}`);
    console.error('Ein zweiter Golden-Wert waere eine zweite Wahrheit. Auf der gepinnten Laufzeit neu erzeugen.');
    process.exitCode = 1;
    return;
  }
  const werte = tickets();
  writeFileSync(DATEI, `${JSON.stringify({ nodeMajor: gepinnt, tickets: werte }, null, 2)}\n`);
  console.log(`Geschrieben: ${DATEI} — Node ${gepinnt}, ${RAID_GOLDEN_TICKETS.length} Tickets`);
}

main();
