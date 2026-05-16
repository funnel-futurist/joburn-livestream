// src/overlays/AttributionMark.jsx
import React from 'react';

export default function AttributionMark() {
  return (
    <div className="absolute top-8 left-8 flex items-center gap-3 text-white/70 font-mono select-none">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-xs tracking-[0.3em]">LIVE · @joburnai · FORGE FM</span>
    </div>
  );
}
