# Joburn Livestream — Forge FM

24/7 lo-fi animated livestream for YouTube `@joburnai`. Cozy Ghibli-style blacksmith's workshop, perpetual Pomodoro cycle, ambient companion for identity-work.

**Status:** Gate 1 Concept Lock — 2026-05-16. v0 target: 2026-05-18.

## Source of Truth

The full design spec lives in the Agency OS:
**`/root/ai-os/00_Product_Blueprints/blueprint_joburn_livestream_2026_05_16.md`**

This repo is the implementation. The blueprint is the contract.

## Current State

- `_v0_prototype.jsx` — Gemini-generated React component, the v0 starting scene (cozy forge + capybara + lofi radio UI). Missing: Pomodoro timer, quote rotator, audio, channel attribution. Those are the next iteration.

## Tool Stack

- React + SVG + Canvas (scene)
- Remotion (programmatic animation — v0.5+)
- ffmpeg → YouTube RTMP (streaming)
- Headless Chromium + xvfb (capture)
- DigitalOcean droplet (host)
- ElevenLabs (audio production, v0.5+)

## Drive Folders

- Reference photos (John likeness, Gate 3): https://drive.google.com/drive/folders/1jMU5ECgCb6HnJ_Tw0sFR8CGD_eVS2lP7
- Project tracker (assets, samples): https://drive.google.com/drive/folders/1fv1I86Q6lg8WjNDg2mvjBLNa1LyWuTiC
