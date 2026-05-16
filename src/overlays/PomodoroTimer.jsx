// src/overlays/PomodoroTimer.jsx
import React from 'react';
import { useCycle } from '../cycle/useCycle.js';

const PHASE_LABEL = {
  FOCUS: 'FOCUS',
  BREAK: 'BREAK',
  LONG_BREAK: 'LONG BREAK'
};

const PHASE_COLOR = {
  FOCUS: 'text-amber-300',
  BREAK: 'text-cyan-300',
  LONG_BREAK: 'text-violet-300'
};

function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

export default function PomodoroTimer() {
  const { phase, cycleIndex, secondsRemaining } = useCycle();
  const minutes = pad(secondsRemaining / 60);
  const seconds = pad(secondsRemaining % 60);

  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 font-mono text-white/90 select-none pointer-events-none">
      <div className={`text-xs tracking-[0.4em] ${PHASE_COLOR[phase]} drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}>
        {PHASE_LABEL[phase]} · cycle {cycleIndex}/4
      </div>
      <div className="text-8xl font-extralight tracking-[0.12em] tabular-nums drop-shadow-[0_6px_18px_rgba(0,0,0,1)]">
        {minutes}:{seconds}
      </div>
    </div>
  );
}
