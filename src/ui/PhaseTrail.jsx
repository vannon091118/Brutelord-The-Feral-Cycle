import { hasReached } from '../domain/onboarding/onboarding-state.js';
import { PHASES } from './hint-texts.js';

// @doc: docs/daten/ui/phasetrail.md#phasetrail
export function PhaseTrail({ onboarding }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {PHASES.map((phase) => {
        const active = hasReached(onboarding, phase.reached);
        return (
          <span key={phase.id} className="flex items-center gap-1.5" title={phase.label}>
            <span
              className={`h-[7px] w-[7px] rounded-full transition-colors duration-300 ${
                active ? 'bg-core-400' : 'bg-bone-400/25'
              }`}
            />
            <span
              className={`hidden text-[10px] uppercase tracking-[0.1em] sm:inline ${
                active ? 'text-bone-300' : 'text-bone-400/50'
              }`}
            >
              {phase.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
