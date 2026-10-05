/** Probe: zwei Prozesse wollen gleichzeitig — wer zuerst fragt, testet zuerst. */
import { claimSlot } from './queue.mjs';

const name = process.argv[2] ?? 'agent';
const stamp = () => new Date().toISOString().slice(11, 19);
const slot = await claimSlot(name, { onWait: (message) => console.log(`${stamp()} ${name}: ${message}`) });
console.log(`${stamp()} ${name}: Platz ${slot.slot} — belegt von ${stamp()} bis ${stamp()}`);
await new Promise((resolve) => setTimeout(resolve, 2000));
slot.release();
console.log(`${stamp()} ${name}: Platz ${slot.slot} frei`);