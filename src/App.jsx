import React from 'react';
import ForgeScene from './scene/ForgeScene.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <ForgeScene />
        {/* Overlays added in Phase 3+ */}
      </div>
    </div>
  );
}
