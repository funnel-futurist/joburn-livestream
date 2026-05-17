// src/scene/SceneBackground.jsx
// Picks the right background image based on cycle phase + cycleIndex.
// Replaces the SVG ForgeScene for v1.0.
//
// Scene map (locked 2026-05-17 per operator):
//   FOCUS (all 4 cycles)  → LAPTOP (this is the default work mode — founders at keyboards)
//   BREAK on odd cycle    → MEDITATING (cross-legged, capybara meditating in parallel)
//   BREAK on even cycle   → ANVIL (working on the self — the sword is the self, removing impurities)
//   LONG_BREAK            → BRB · TOUCHING GRASS (empty room, door cracked open, capybara solo)
//
// Rationale: hammer/anvil is the BRAND MOTIF (sword = self, work = identity work), but it's
// NOT what founders do all day. Founders are at laptops. The blacksmith's identity work
// happens during their breaks. This makes the scene rotation feel like a real day:
// 50 min focused work → 10 min identity work (alternating mind: meditate, body: forge) →
// repeat 4× → 30 min walk outside.
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
  if (phase === 'FOCUS') return '/scenes/scene_laptop.png';
  if (phase === 'BREAK') {
    // Odd cycles: meditate (mind). Even cycles: hammer the sword (body / self).
    return (cycleIndex % 2 === 1) ? '/scenes/scene_meditating.png' : '/scenes/scene_anvil.png';
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
