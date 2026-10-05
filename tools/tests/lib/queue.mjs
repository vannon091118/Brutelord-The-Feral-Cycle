/** Die Schlange vor dem Lauf: ein Agent, ein Platz. Die Nummer entscheidet. */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { QUEUE_DIR } from './config.mjs';

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

function ticketPath(slot) {
  return join(QUEUE_DIR, `${String(slot).padStart(3, '0')}.json`);
}

/** Die erste freie Nummer; `wx` macht das Anlegen atomar. */
function reserve(pid, name) {
  mkdirSync(QUEUE_DIR, { recursive: true });
  for (let slot = 1; slot < 9999; slot += 1) {
    const file = ticketPath(slot);
    const entry = { slot, file, pid, name, at: Date.now() };
    try {
      writeFileSync(file, JSON.stringify(entry), { flag: 'wx' });
      return entry;
    } catch {
      continue;
    }
  }
  throw new Error('Keine Platznummer mehr frei');
}

function pending() {
  if (!existsSync(QUEUE_DIR)) return [];
  return readdirSync(QUEUE_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(join(QUEUE_DIR, name), 'utf8')))
    .sort((left, right) => left.slot - right.slot);
}

/** Wer abschießt, gibt den Platz nicht zurück: die Datei fliegt erst, wenn der
 *  Prozess dahinter wirklich tot ist — sonst blockiert er die Schlange. */
function dropDead(entries) {
  return entries.filter((entry) => {
    if (alive(entry.pid)) return true;
    rmSync(entry.file, { force: true });
    return false;
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Slot reservieren und warten, bis alle kleineren Nummern abgearbeitet sind. */
export async function claimSlot(name, { onWait } = {}) {
  const entry = reserve(process.pid, name);
  let announced = false;
  for (;;) {
    const ahead = dropDead(pending()).filter((other) => other.slot < entry.slot);
    if (ahead.length === 0) {
      return {
        slot: entry.slot,
        release: () => rmSync(entry.file, { force: true }),
      };
    }
    if (!announced) {
      announced = true;
      onWait?.(`Platz ${entry.slot}: ${ahead.length} laufen noch vor mir (${ahead.map((a) => a.name).join(', ')})`);
    }
    await wait(700);
  }
}

export function queueView() {
  return dropDead(pending());
}

function existsSync(path) {
  try {
    readdirSync(path);
    return true;
  } catch {
    return false;
  }
}