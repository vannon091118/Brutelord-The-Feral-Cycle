// @doc: docs/daten/dungling/organic-phase-clock.md#organic-phase-clock
import { useEffect, useState } from 'react';
import { ORGANIC_CONFIG } from '../../domain/brutelord/genome-config.js';
import { phaseOf } from '../../domain/brutelord/organic-bones.js';

let turns = 0;
let beat = null;
const listeners = new Set();

function stepClock() {
  turns += 1;
  const phase = phaseOf(turns);
  for (const listener of listeners) listener(phase);
}

export function organicPhase() {
  return phaseOf(turns);
}

export function subscribeOrganic(listener) {
  listeners.add(listener);
  listener(organicPhase());
  if (beat === null) beat = setInterval(stepClock, ORGANIC_CONFIG.phaseMs);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && beat !== null) {
      clearInterval(beat);
      beat = null;
    }
  };
}

export function useOrganicPhase() {
  const [phase, setPhase] = useState(organicPhase);
  useEffect(() => subscribeOrganic(setPhase), []);
  return phase;
}
