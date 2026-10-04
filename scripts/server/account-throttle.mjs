/** Bremse gegen Wörterbuchangriffe: pro Name und Herkunft zählt ein Fenster,
 *  danach bleibt die Tür so lange zu. Bewusst im Speicher — der Dev-Server ist
 *  ein Prozess, und nach einem Neustart ist eine Bremse ohnehin neu. */
import { ACCOUNT_CONFIG } from './account-config.mjs';

const entries = new Map();
const SWEEP_AT = 512;

/** Herkunft und Name zusammen: zwei Namen aus einer Adresse teilen die Bremse nicht. */
export function throttleKey({ name, remote }) {
  return `${remote ?? '-'}|${String(name ?? '').toLowerCase()}`;
}

function sweep(now) {
  if (entries.size < SWEEP_AT) return;
  for (const [key, entry] of entries) if (now >= entry.until) entries.delete(key);
}

export function lockedUntil(key, now = Date.now()) {
  const entry = entries.get(key);
  if (!entry) return 0;
  if (now >= entry.until) {
    entries.delete(key);
    return 0;
  }
  return entry.count >= ACCOUNT_CONFIG.throttle.attempts ? entry.until : 0;
}

export function isLocked(key, now = Date.now()) {
  return lockedUntil(key, now) > now;
}

export function noteFailure(key, now = Date.now()) {
  const open = entries.get(key);
  const count = open && now < open.until ? open.count + 1 : 1;
  sweep(now);
  entries.set(key, { count, until: now + ACCOUNT_CONFIG.throttle.windowMs });
  return count;
}

export function noteSuccess(key) {
  entries.delete(key);
}

export function resetThrottle() {
  entries.clear();
}