/** Bremse gegen Woerterbuchangriffe: pro Name und Herkunft zaehlt ein Fenster.
 *  Die Regel steht hier, der Zaehler liegt im Speicher des Kontos — im
 *  Prozessspeicher waere sie bei verteilten Workern keine globale Bremse. */
import { ACCOUNT_CONFIG } from './account-config.mjs';

export function throttleKey({ name, remote }) {
  return `${remote ?? '-'}|${String(name ?? '').toLowerCase()}`;
}

export function lockedUntil(entry, now = Date.now()) {
  if (!entry) return 0;
  if (now >= entry.until) return 0;
  return entry.count >= ACCOUNT_CONFIG.throttle.attempts ? entry.until : 0;
}

export function nextEntry(entry, now = Date.now()) {
  const count = entry && now < entry.until ? entry.count + 1 : 1;
  return { count, until: now + ACCOUNT_CONFIG.throttle.windowMs };
}
