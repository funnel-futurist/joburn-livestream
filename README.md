# Joburn Livestream — Forge FM

24/7 lo-fi animated livestream on YouTube `@joburnai`. Cozy Ghibli-style blacksmith's workshop, perpetual 50/10 Pomodoro cycle with a 30-min walk every 4th cycle, ambient companion for identity-work.

**Status:** Production live on the DigitalOcean droplet, streaming continuously to YouTube RTMP. Visibility flip to Public is the final operator step.

## Source of Truth

The design contract lives in the Agency OS:
- Blueprint: `/root/ai-os/00_Product_Blueprints/blueprint_joburn_livestream_2026_05_16.md`
- Channel copy (About / stream title / description): `docs/channel_copy.md`

This repo is the implementation. The blueprint is the contract.

## Architecture

```
React app (this repo)
   │  Vite-served on droplet :5173
   ▼
Headless Chromium + Xvfb (kiosk mode, 1920×1080)
   │  framebuffer captured by ffmpeg
   ▼
ffmpeg  ──(video=screen-grab + audio=260min super-cycle mix)──▶  YouTube RTMP
                                                                  rtmp://a.rtmp.youtube.com/live2
                                                                  ▼
                                                            YouTube re-encodes
                                                            and broadcasts to
                                                            @joburnai viewers
```

## Cycle Structure (visual + audio kept in lockstep)

| Phase | Duration | Visual | Audio |
|---|---|---|---|
| Focus (×4 per super-cycle) | 50 min | LAPTOP — blacksmith head down, capybara present | 75 BPM lo-fi beats + alpha binaural |
| Short break (cycles 1 & 3) | 10 min | MEDITATE — cushion, breath circle | 40 BPM ambient drone + theta binaural |
| Short break (cycle 2) | 10 min | ANVIL — works on the sword (=self) | 45 BPM contemplative + theta binaural |
| Long break (after cycle 4) | 30 min | BRB — walking outside, "touching grass" | 65 BPM walking music |

Total super-cycle: 260 min. Both visual and audio loop on the same 260-min period, **wall-clock aligned via `infra/start-stream.sh`** so they stay in phase forever.

## Repo Layout

```
src/
  App.jsx                     — root composition
  cycle/                      — useCycle hook + state machine + tests
  scene/SceneBackground.jsx   — phase-aware backgrounds (LAPTOP/MEDITATE/ANVIL/BRB)
  overlays/                   — Pomodoro timer, quote plaque, radio bar, attribution
  audio/AudioLoop.jsx         — howler-based 260-min mix loop
  quotes/                     — ~62 rotating quotes across 4 cycle-position registers
docs/
  channel_copy.md             — YouTube Studio About + stream title + description
  v0_visual_qa.md             — visual QA notes from v0
  plans/                      — historical design plans
infra/
  droplet-bootstrap.sh        — one-shot provisioning of a fresh droplet
  start-stream.sh             — ffmpeg launcher with wall-clock audio alignment
  health-check.sh             — every-5-min silent check (Slack on failure)
  daily-summary.sh            — 9am EST daily HEALTHY/DEGRADED Slack post
  forge-fm-app.service        — systemd unit for the React app
  forge-fm-stream.service     — systemd unit for the ffmpeg→YouTube stream
public/audio/                  — 260-min mix + per-track mp3s (.gitignored, ~600MB)
```

## Production Host

- **Droplet:** `forge-fm-stream-01` · DigitalOcean NYC3 · 4 vCPU · `165.227.208.121`
- **App path:** `/opt/forge-fm/app` (deployed via `git pull`)
- **Audio path:** `/opt/forge-fm/app/public/audio/` (not in git)
- **User:** `forgefm` (services run as this user)

## Operating the Stream

### Check status without keeping anything open
```bash
ssh root@165.227.208.121 'systemctl is-active forge-fm-app forge-fm-stream'
```

### Slack monitoring (already wired)
- Every 5 min: silent health check — Slack `#alerts` only fires on failure
- Daily 9am EST: HEALTHY/DEGRADED summary with uptime + restart count + resources + watch link

### Deploy a change
```bash
git push origin main
ssh root@165.227.208.121 'sudo -u forgefm git -C /opt/forge-fm/app pull --ff-only && systemctl restart forge-fm-app forge-fm-stream'
```

### Restart resyncs audio automatically
Every restart of `forge-fm-stream` recomputes `(now - 2024-01-01) % 260min` and seeks audio with `-ss` to match the wall-clock visual phase. No manual sync required.

## Tool Stack

- **Frontend:** React 18 + Vite, Howler for audio, Lucide for icons, Tailwind
- **Capture:** Puppeteer / headless Chromium + Xvfb (kiosk 1920×1080)
- **Stream:** ffmpeg → YouTube RTMP (`rtmp://a.rtmp.youtube.com/live2`)
- **Host:** DigitalOcean droplet, systemd-managed services
- **Audio production:** ElevenLabs (12 tracks generated via API)
- **Monitoring:** Bash cron + Slack webhook

## Drive Folders

- Reference photos: https://drive.google.com/drive/folders/1jMU5ECgCb6HnJ_Tw0sFR8CGD_eVS2lP7
- Project tracker: https://drive.google.com/drive/folders/1fv1I86Q6lg8WjNDg2mvjBLNa1LyWuTiC
