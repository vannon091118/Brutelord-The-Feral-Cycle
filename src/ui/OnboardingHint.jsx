import { useEffect, useState } from 'react';

import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { STAGE, STAGE_FLOW, hintForStage, stageIndex } from '../domain/onboarding/onboarding-state.js';

const cfg = ONBOARDING_CONFIG;

/** Display only countdown - the simulation owns the actual spawn. */
function useCountdown(active, totalMs) {
  const [seconds, setSeconds] = useState(Math.ceil(totalMs / 1000));
  useEffect(() => {
    if (!active) return undefined;
    setSeconds(Math.ceil(totalMs / 1000));
    const id = window.setInterval(() => {
      setSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [active, totalMs]);
  return seconds;
}

export default function OnboardingHint({ stage, onReset }) {
  const hint = hintForStage(stage);
  const step = stageIndex(stage) + 1;
  const waiting = stage === STAGE.WAITING_FOR_DUNGLING;
  const seconds = useCountdown(waiting, cfg.dunglingSpawnDelayMs);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div
        className="dl-reduce-motion pointer-events-auto w-full max-w-[24rem] rounded-2xl border border-[#4a361d]/60 bg-[#120d08]/92 px-3.5 py-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.55)] backdrop-blur-[2px]"
        style={{ animation: 'dl-hint-in 320ms cubic-bezier(0.2, 0.9, 0.25, 1) both' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.16em] text-[#7f6a4c] tabular-nums">
            {String(step).padStart(2, '0')}/{String(STAGE_FLOW.length).padStart(2, '0')}
          </span>
          <div className="flex flex-1 gap-1">
            {STAGE_FLOW.map((flowStage, index) => (
              <span
                key={flowStage}
                className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${
                  index < stageIndex(stage)
                    ? 'bg-[#8a5a26]'
                    : index === stageIndex(stage)
                      ? 'bg-[#e0a75a]'
                      : 'bg-[#3a2a18]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-medium tracking-wide text-[#e6d2ac]">
            {hint.title}
          </span>
          {waiting ? (
            <span className="text-[11px] tracking-wider text-[#c9a06a] tabular-nums">
              {seconds}s
            </span>
          ) : (
            <span className="text-[10px] tracking-[0.14em] text-[#6f5c42] uppercase">
              {hint.hint}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[#9a876a]">{hint.body}</p>

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-2 w-full rounded-lg border border-[#4a361d] bg-[#1a1209] py-1 text-[10px] tracking-[0.18em] text-[#b39a76] uppercase transition-colors hover:border-[#8a5a26] hover:text-[#e6d2ac]"
          >
            Nochmal spielen
          </button>
        ) : null}
      </div>
    </div>
  );
}