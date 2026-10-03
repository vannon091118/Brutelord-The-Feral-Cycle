import { HINTS } from './hint-texts.js';
import { PhaseTrail } from './PhaseTrail.jsx';
import { ResourceChips } from './ResourceChips.jsx';

/**
 * Die schmale Hinweiszeile unten. Sie erklärt den ersten Moment ohne Handbuch
 * und zeigt daneben, wie viel Essenz im Hive liegt und wie groß der Raum ist.
 */
export function OnboardingHint({ onboarding, usableTileCount, essence }) {
  const hint = HINTS[onboarding.state];

  return (
    <div className="dl-panel dl-line-in flex w-[min(94vw,520px)] items-center gap-2.5 rounded-full py-1.5 pl-3.5 pr-2">
      <div className="min-w-0 flex-1">
        <p
          key={onboarding.state}
          className="dl-line-in truncate text-[12px] font-medium leading-tight text-bone-100"
        >
          {hint.text}
        </p>
        <p key={`${onboarding.state}-sub`} className="truncate text-[11px] leading-tight text-bone-400">
          {hint.sub}
        </p>
      </div>

      <PhaseTrail onboarding={onboarding} />

      <ResourceChips essence={essence} count={usableTileCount} countLabel="Raum" />
    </div>
  );
}
