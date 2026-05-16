import React, { useEffect, useRef } from 'react';
import { Particle } from './Particles.js';

export default function ForgeScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const width = 1600;
    const height = 900;
    const particles = [];
    for (let i = 0; i < 150; i++) particles.push(new Particle('dust', width, height));
    for (let i = 0; i < 40; i++) particles.push(new Particle('ember', width, height));
    for (let i = 0; i < 20; i++) particles.push(new Particle('kettleSteam', width, height));
    for (let i = 0; i < 30; i++) particles.push(new Particle('poolSteam', width, height));
    for (let i = 0; i < 15; i++) particles.push(new Particle('water', width, height));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#2a1708] via-[#120a05] to-[#050302] overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full mix-blend-screen pointer-events-none"
        style={{ background: 'radial-gradient(circle at 15% 30%, rgba(251, 191, 36, 0.15) 0%, transparent 60%)' }}
      />
      <svg viewBox="0 0 1600 900" className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="techGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="fireGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sunbeamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.3" />
            <stop offset="10%" stopColor="#fde68a" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#b45309" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* BACKGROUND ELEMENTS */}

        {/* Beams and Architecture Lines */}
        <path d="M 0 50 L 1600 200 L 1600 250 L 0 100 Z" fill="#1c1917" opacity="0.6"/>
        <path d="M 400 0 L 450 900 M 1000 0 L 1050 900" stroke="#1c1917" strokeWidth="40" opacity="0.8"/>

        {/* Window Frame and Glow */}
        <g transform="translate(100, 100)">
          {/* Bright golden light behind window */}
          <rect x="-50" y="-50" width="350" height="550" fill="#fcd34d" filter="url(#glow)" opacity="0.6" />
          <rect x="0" y="150" width="250" height="350" fill="#fef08a" />
          <path d="M 0 150 A 125 125 0 0 1 250 150 Z" fill="#fef08a" />
          {/* Window Mullions (Bars) */}
          <path d="M -10 150 A 135 135 0 0 1 260 150 L 260 500 L -10 500 Z" fill="none" stroke="#1c1917" strokeWidth="20" />
          <rect x="115" y="25" width="20" height="475" fill="#1c1917" />
          <rect x="0" y="200" width="250" height="15" fill="#1c1917" />
          <rect x="0" y="350" width="250" height="15" fill="#1c1917" />
        </g>

        {/* Sunbeams Array extending into room */}
        <polygon points="120 120, 320 120, 1400 900, 200 900" fill="url(#sunbeamGradient)" style={{ mixBlendMode: 'screen' }} />

        {/* Wall Tools & Shelves (Background) */}
        <rect x="600" y="250" width="300" height="15" fill="#292524" />
        <rect x="620" y="180" width="20" height="70" fill="#44403c" />
        <rect x="650" y="190" width="15" height="60" fill="#57534e" />
        <rect x="750" y="200" width="40" height="50" fill="#78350f" />
        {/* Hanging tongs/hammers */}
        <path d="M 650 300 L 650 450 M 680 320 L 680 430 M 720 280 L 720 400" stroke="#1c1917" strokeWidth="8" />
        <circle cx="650" cy="460" r="12" fill="#292524" />
        <path d="M 710 400 L 730 400 L 730 420 L 710 420 Z" fill="#292524" />


        {/* MIDGROUND ELEMENTS */}

        {/* Fireplace Hearth */}
        <path d="M 1050 900 L 1050 250 L 1350 250 L 1350 900 Z" fill="#292524" />
        <polygon points="1050 250, 1150 150, 1250 150, 1350 250" fill="#1c1917" />
        {/* Hearth Opening */}
        <path d="M 1120 700 A 80 120 0 0 1 1280 700 L 1280 900 L 1120 900 Z" fill="#0a0502" />
        {/* Fire Base Glow */}
        <path d="M 1120 700 A 80 120 0 0 1 1280 700 L 1280 900 L 1120 900 Z" fill="url(#fireGradient)" className="animate-pulse" style={{ animationDuration: '3s' }} />
        {/* Logs */}
        <rect x="1160" y="680" width="80" height="15" fill="#1c1917" transform="rotate(-10 1200 680)" />
        <rect x="1150" y="690" width="90" height="15" fill="#0c0a09" transform="rotate(5 1200 690)" />
        {/* Kettle */}
        <g transform="translate(1200, 640)">
          <ellipse cx="0" cy="0" rx="25" ry="20" fill="#1c1917" />
          <rect x="-15" y="-20" width="30" height="10" fill="#1c1917" />
          <path d="M -15 -20 Q 0 -40 15 -20" fill="none" stroke="#292524" strokeWidth="4" />
          <path d="M 25 0 Q 40 0 45 -10" fill="none" stroke="#1c1917" strokeWidth="6" /> {/* Spout */}
        </g>

        {/* Center Anvil */}
        <g transform="translate(700, 680)">
          {/* Shadow */}
          <ellipse cx="60" cy="85" rx="100" ry="15" fill="#000" opacity="0.6" />
          {/* Base */}
          <path d="M -20 80 L 140 80 L 110 50 L 10 50 Z" fill="#1c1917"/>
          {/* Waist */}
          <rect x="30" y="-20" width="60" height="70" fill="#1c1917"/>
          <path d="M 30 -20 Q 15 15 30 50" fill="none" stroke="#292524" strokeWidth="5"/>
          <path d="M 90 -20 Q 105 15 90 50" fill="none" stroke="#0c0a09" strokeWidth="5"/>
          {/* Top Body & Horn */}
          <path d="M -40 -20 Q 0 -20 20 -20 L 100 -20 L 130 -20 L 130 -40 L -40 -40 Q -30 -30 -40 -20 Z" fill="#292524"/>
          {/* Highlight Edge (Sunlight catching the anvil) */}
          <path d="M -35 -38 L 125 -38" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5" />
        </g>

        {/* Workbench (Left Foreground) */}
        <rect x="-50" y="550" width="550" height="350" fill="#292524" />
        {/* Bench Top Edge Highlight */}
        <rect x="-50" y="550" width="550" height="15" fill="#44403c" />
        <path d="M 0 550 L 500 550" fill="none" stroke="#fcd34d" strokeWidth="2" opacity="0.3" />
        {/* Workbench Clutter */}
        <rect x="50" y="535" width="80" height="15" fill="#57534e" />
        <rect x="60" y="525" width="60" height="10" fill="#78350f" />
        <rect x="180" y="515" width="30" height="35" fill="#451a03" />

        {/* Cyan Tech Artifact */}
        <g transform="translate(350, 480)">
          {/* Ambient Tech Glow */}
          <circle cx="25" cy="35" r="40" fill="#06b6d4" opacity="0.15" filter="url(#techGlow)" className="animate-pulse" />
          {/* Base Box */}
          <rect x="0" y="0" width="50" height="70" fill="#0c0a09" stroke="#06b6d4" strokeWidth="2" />
          <rect x="5" y="5" width="40" height="60" fill="none" stroke="#0891b2" strokeWidth="1" />
          {/* Core Lens */}
          <circle cx="25" cy="35" r="12" fill="#083344" stroke="#22d3ee" strokeWidth="3" />
          <circle cx="25" cy="35" r="4" fill="#a5f3fc" className="animate-ping" style={{ animationDuration: '2s' }} />
          {/* Circuit Lines */}
          <path d="M 25 15 L 25 5 M 25 55 L 25 65 M 5 35 L 10 35 M 40 35 L 45 35" stroke="#22d3ee" strokeWidth="2" />
        </g>


        {/* FOREGROUND ELEMENTS (Right side Hot Spring) */}

        {/* Water Spout (Bamboo/Wood tube) */}
        <rect x="1450" y="580" width="150" height="35" fill="#44403c" transform="rotate(-5 1450 580)" />
        <ellipse cx="1450" cy="595" rx="5" ry="17" fill="#1c1917" transform="rotate(-5 1450 580)" />

        {/* Pool Shadows & Base */}
        <ellipse cx="1280" cy="800" rx="260" ry="70" fill="#000" opacity="0.5" />
        <ellipse cx="1280" cy="780" rx="240" ry="60" fill="#064e3b" />
        {/* Water highlight */}
        <ellipse cx="1280" cy="780" rx="220" ry="50" fill="#0f766e" opacity="0.4" />

        {/* Capybara (The chillest entity) */}
        {/* Floating animation group */}
        <g className="animate-[float_6s_ease-in-out_infinite]">
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}</style>

          {/* Body */}
          <ellipse cx="1250" cy="750" rx="80" ry="50" fill="#78350f" />
          <ellipse cx="1250" cy="760" rx="75" ry="40" fill="#451a03" opacity="0.3" /> {/* Wet fur gradient */}

          {/* Head */}
          <ellipse cx="1180" cy="725" rx="45" ry="38" fill="#78350f" />
          <ellipse cx="1160" cy="735" rx="25" ry="20" fill="#78350f" /> {/* Snout */}

          {/* Details */}
          <circle cx="1145" cy="735" r="4" fill="#0c0a09" /> {/* Nose */}
          <path d="M 1165 720 Q 1175 728 1185 720" stroke="#0c0a09" strokeWidth="3" fill="none" strokeLinecap="round" /> {/* Closed eye */}
          <ellipse cx="1210" cy="695" rx="10" ry="8" fill="#451a03" /> {/* Ear */}

          {/* Hot towel on head (optional cozy detail) */}
          <rect x="1170" y="683" width="30" height="10" rx="4" fill="#f5f5f4" transform="rotate(-10 1170 683)" />

          {/* Water ripples around Capybara */}
          <ellipse cx="1250" cy="790" rx="90" ry="15" fill="none" stroke="#2dd4bf" strokeWidth="2" opacity="0.3" />
          <ellipse cx="1250" cy="795" rx="110" ry="20" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.1" />
        </g>

        {/* Pool Rock Rim */}
        <path d="M 1040 780 Q 1280 880 1520 780 L 1520 900 L 1040 900 Z" fill="#292524" />
        {/* Individual Rocks (simplified) */}
        <ellipse cx="1080" cy="810" rx="40" ry="20" fill="#44403c" />
        <ellipse cx="1150" cy="835" rx="50" ry="25" fill="#57534e" />
        <ellipse cx="1250" cy="850" rx="60" ry="25" fill="#44403c" />
        <ellipse cx="1360" cy="835" rx="55" ry="22" fill="#57534e" />
        <ellipse cx="1460" cy="800" rx="45" ry="20" fill="#44403c" />

      </svg>
      <canvas
        ref={canvasRef}
        width={1600}
        height={900}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
    </div>
  );
}
