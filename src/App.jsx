import React from 'react';
import SceneBackground from './scene/SceneBackground.jsx';
import PomodoroTimer from './overlays/PomodoroTimer.jsx';
import QuoteOverlay from './overlays/QuoteOverlay.jsx';
import AttributionMark from './overlays/AttributionMark.jsx';
import RadioBar from './overlays/RadioBar.jsx';
import AudioLoop from './audio/AudioLoop.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <SceneBackground />
        <AttributionMark />
        <PomodoroTimer />
        <QuoteOverlay />
        <RadioBar />
        <AudioLoop />
      </div>
    </div>
  );
}
