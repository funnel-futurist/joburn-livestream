// src/scene/SceneBackground.jsx
// Picks the right background image based on cycle phase + cycleIndex.
// Replaces the SVG ForgeScene for v1.0.
//
// Scene map:
//   FOCUS cycle 1 + 3 → ANVIL (hammering mode)
//   FOCUS cycle 2 + 4 → LAPTOP (founder mode)
//   BREAK any         → MEDITATING (cross-legged, capybara meditating in parallel)
//   LONG_BREAK        → BRB · TOUCHING GRASS (empty room, capybara solo, door cracked)
//
// All images share the same room layout (ChatGPT "Edit this image" workflow
// preserved pixel positions across all 4 character variants + the empty base).
// The blank wooden quote plaque is a known-pixel canvas — QuoteOverlay renders
// text on top of it. The wall clock is decorative; the Pomodoro timer is a
// separate overlay.

import React from 'react';
import { useCycle } from '../cycle/useCycle.js';

function pickScene({ phase, cycleIndex }) {
  if (phase === 'LONG_BREAK') return '/scenes/scene_brb.png';
  if (phase === 'BREAK') return '/scenes/scene_meditating.png';
  // FOCUS: alternate anvil ↔ laptop on odd/even cycle to break repetition
  if (phase === 'FOCUS') {
    return (cycleIndex % 2 === 1) ? '/scenes/scene_anvil.png' : '/scenes/scene_laptop.png';
  }
  return '/scenes/scene_base.png';
}

export default function SceneBackground() {
  const cycle = useCycle();
  const src = pickScene(cycle);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      {/* Cinematic film grain on top for cohesion with the brand */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
