// src/overlays/QuoteOverlay.jsx
import React, { useMemo } from 'react';
import { useCycle } from '../cycle/useCycle.js';
import { selectQuote, registerForCycleState } from '../quotes/selectQuote.js';

const ROTATION_INTERVAL_MIN = 5;

export default function QuoteOverlay() {
  const cycle = useCycle();
  const { quote } = useMemo(() => {
    const register = registerForCycleState(cycle);
    // Rotation index ticks every 5 minutes of total elapsed time.
    const totalMin = cycle.superCycleNumber * 260 + cycleMinAbsolute(cycle);
    const rotationIndex = Math.floor(totalMin / ROTATION_INTERVAL_MIN);
    return { quote: selectQuote(register, rotationIndex), register };
  }, [
    cycle.cycleIndex,
    cycle.phase,
    Math.floor(cycle.minuteWithinPhase / ROTATION_INTERVAL_MIN),
    cycle.superCycleNumber
  ]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-36 max-w-3xl text-center pointer-events-none px-6">
      <p className="text-white/85 text-2xl leading-relaxed font-serif italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-amber-300/60 text-sm mt-3 tracking-widest font-mono">
        — {quote.author}
      </p>
    </div>
  );
}

// Helper: total minutes elapsed within the current super-cycle
function cycleMinAbsolute(cycle) {
  const FOCUS = 50, BREAK = 10, LONG_BREAK = 30;
  let min = 0;
  for (let i = 1; i < cycle.cycleIndex; i++) min += FOCUS + (i === 4 ? LONG_BREAK : BREAK);
  if (cycle.phase === 'BREAK' || cycle.phase === 'LONG_BREAK') min += FOCUS;
  return min + cycle.minuteWithinPhase;
}
