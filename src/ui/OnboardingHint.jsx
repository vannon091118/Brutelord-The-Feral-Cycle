import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';
import { HINTS } from './hint-texts.js';
import { PhaseTrail } from './PhaseTrail.jsx';

/**
 * Die schmale Hinweiszeile unten. Sie erklärt den ersten Moment ohne Handbuch
 * und zeigt daneben den nutzbaren Raum.
 */
export function OnboardingHint({ onboarding, usableTileCount }) {
  const hint = HINTS[onboarding.state] ?? HINTS[ONBOARDING_STATE.INITIAL];

  return (
    <div className="dl-panel dl-line-in flex w-[min(94vw,430px)] items-center gap-3 rounded-full py-1.5 pl-3.5 pr-2">
      <div className="min-w-0 flex-1">
        <p key={onboarding.state} className="dl-line-in truncate text-[12px] font-medium text-bone-100">
          {hint.text}
        </p>
        <p key={`${onboarding.state}-sub`} className="truncate text-[10px] text-bone-400">
          {hint.sub}
        </p>
      </div>

      <PhaseTrail onboarding={onboarding} />

      <div className="shrink-0 rounded-full border border-bone-400/15 bg-soil-950/60 px-2.5 py-1 text-[10px] text-bone-300">
        Raum {usableTileCount}
      </div>
    </div>
  );
}
