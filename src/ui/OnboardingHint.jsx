import { HINTS } from './hint-texts.js';
import { PhaseTrail } from './PhaseTrail.jsx';
import { ResourceRail } from './ResourceRail.jsx';

// @doc: docs/daten/ui/onboardinghint.md#onboardinghint
export function OnboardingHint({ onboarding, usableTileCount, essence, depth, cycle, buildings = [], onDescend }) {
  const hint = HINTS[onboarding.state];

  return (
    <div className="dl-panel dl-line-in w-[min(94vw,520px)] rounded-2xl px-3.5 pb-2.5 pt-2">
      <p
        key={onboarding.state}
        className="dl-line-in text-[12px] font-medium leading-tight text-bone-100"
      >
        {hint.text}
      </p>
      <p key={`${onboarding.state}-sub`} className="text-[11px] leading-tight text-bone-400">
        {hint.sub}
      </p>

      <div className="mt-2">
        <ResourceRail essence={essence} depth={depth} cycle={cycle} buildings={buildings} onDescend={onDescend} />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <PhaseTrail onboarding={onboarding} />
        <span className="text-[10px] leading-none text-bone-400">Raum {usableTileCount}</span>
      </div>
    </div>
  );
}
