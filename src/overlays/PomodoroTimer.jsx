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
    <div className="absolute top-8 right-8 flex flex-col items-end gap-2 font-mono text-white/90 select-none">
      <div className={`text-xs tracking-[0.3em] ${PHASE_COLOR[phase]}`}>
        {PHASE_LABEL[phase]} · cycle {cycleIndex}/4
      </div>
      <div className="text-6xl font-light tracking-wider tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {minutes}:{seconds}
      </div>
      <div className="text-[10px] tracking-widest text-white/40">
        Soul Tempering · FORGE FM
      </div>
    </div>
  );
}
