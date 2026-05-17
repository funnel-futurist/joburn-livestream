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

  // Diegetic positioning — the wooden quote plaque in the scene art sits roughly
  // between the window and the hearth (upper-right of the room). Position the
  // text overlay to land ON THE PLAQUE so it reads as hand-painted on the wood,
  // not floating UI.
  //
  // Plaque region (% of scene canvas, calibrated to ChatGPT scene set):
  //   left:   59% → 84%   (width ~25%)
  //   top:    14% → 28%   (height ~14%)
  //
  // Styled: dark sepia ink on aged wood, serif italic, slight blur to
  // integrate with the wood texture.
  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center justify-center text-center px-4"
      style={{
        left: '59%',
        top: '14%',
        width: '25%',
        height: '14%',
      }}
    >
      <p
        className="font-serif italic leading-tight"
        style={{
          color: 'rgba(60, 35, 15, 0.88)',
          fontSize: 'clamp(0.7rem, 1.1vw, 1.05rem)',
          textShadow: '0 1px 0 rgba(255, 230, 180, 0.25)',
          filter: 'contrast(1.05)',
        }}
      >
        &ldquo;{quote.text}&rdquo;
      </p>
      <p
        className="font-serif italic mt-1"
        style={{
          color: 'rgba(80, 50, 20, 0.7)',
          fontSize: 'clamp(0.55rem, 0.75vw, 0.75rem)',
        }}
      >
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
