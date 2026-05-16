// src/overlays/RadioBar.jsx
import React from 'react';
import { useCycle } from '../cycle/useCycle.js';

const TRACK_TITLES = {
  FOCUS: 'Soul Tempering',
  BREAK: 'Ember Rest',
  LONG_BREAK: 'Long Quiet'
};

const TRACK_SUBTITLES = {
  FOCUS: 'beats to refine steel/relax to',
  BREAK: 'between the hammer falls',
  LONG_BREAK: 'the fire is banked'
};

export default function RadioBar() {
  const { phase } = useCycle();
  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-6 px-10 font-mono tracking-wide pointer-events-none">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 text-xs tracking-widest font-bold">NOW PLAYING</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/60 text-xs">FORGE FM</span>
        </div>
        <h1 className="text-white text-xl font-semibold tracking-wider">{TRACK_TITLES[phase]}</h1>
        <p className="text-amber-200/50 text-sm">{TRACK_SUBTITLES[phase]}</p>
      </div>
    </div>
  );
}
