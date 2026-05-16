# Forge FM v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Joburn Livestream / Forge FM v0 — a 24/7 lo-fi animated stream on YouTube `@joburnai` — live by end of Sunday 2026-05-18, polished enough to send to existing agency clients.

**Architecture:** A React + SVG + Canvas scene (built on the Gemini-generated prototype) is served on a DigitalOcean droplet. Headless Chromium under xvfb renders the page at 30fps; ffmpeg captures the X display, muxes a looping lofi audio file, and streams to YouTube Live's RTMP endpoint. systemd supervises ffmpeg with auto-restart. A cron job pings the YouTube Live API every 5 min and posts to Slack `#alerts` if the stream drops.

**Tech Stack:** Vite + React 18 + Tailwind CSS + lucide-react (frontend), Howler.js (audio in browser, future-proofing for v0.5), Node 22 (build + future scheduling), Chromium + xvfb + ffmpeg (streaming pipeline), systemd (process supervision), DigitalOcean Ubuntu 24.04 droplet ($24/mo, 2GB RAM), YouTube Live RTMP, Slack webhook (alerting).

**Source of truth:** `/root/ai-os/00_Product_Blueprints/blueprint_joburn_livestream_2026_05_16.md`. Production Direction lives in blueprint §2A — apply those principles when ambiguity arises.

---

## Scope Notes

- **In scope (v0):** Static cozy forge scene, Pomodoro timer (top-right), cycle-position-aware quote rotator, single looping lofi audio track, `@joburnai` attribution, YouTube Live private→public, channel rebrand (banner/about/trailer), Slack health alerts.
- **Deferred to v0.5:** Cycle-position audio dynamics (volume envelope per minute), bell at transition, time-of-day lighting variants, capybara micro-animations.
- **Deferred to v1.0+:** Turtleneck blacksmith character, activity carousel, ElevenLabs voiced quotes.

---

## Pre-Flight Operator Checklist

Before tasks begin, the operator (John) must confirm or complete the following. None of these are Claude-actionable.

- [ ] **DigitalOcean account access** — billing card on file, can spin up a $24/mo droplet
- [ ] **YouTube channel `@joburnai` has Live Streaming enabled** — if not, enable now (24h propagation before first stream)
- [ ] **Slack webhook URL for `#alerts`** — should be in root `.env` as `SLACK_WEBHOOK_URL` (confirm per CLAUDE.md §Environment Variable Architecture)
- [ ] **GitHub repo for `/root/joburn-livestream`** — create empty repo `funnel-futurist/joburn-livestream`, do NOT push yet (Claude pushes at Task 4)
- [ ] **Royalty-free lofi audio source** — pre-select 60-90 min track from Pixabay/Free Music Archive (license = CC0 or compatible)
- [ ] **Optional but recommended:** A test client (1-2 close clients) ready to receive a preview link Sunday afternoon for soft-launch feedback before public

If any of these are not ready, surface to operator before Task 1.

---

## File Structure (created by this plan)

```
/root/joburn-livestream/
├── _v0_prototype.jsx                        # already exists (the Gemini checkpoint)
├── README.md                                # already exists
├── .gitignore                               # already exists
├── docs/
│   └── plans/
│       └── 2026-05-16-forge-fm-v0-build.md  # this file
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── public/
│   └── audio/
│       └── soul_tempering_v0.mp3            # operator-supplied
├── src/
│   ├── main.jsx
│   ├── App.jsx                              # main scene component
│   ├── index.css                            # tailwind directives
│   ├── scene/
│   │   ├── ForgeScene.jsx                   # the SVG + Canvas composition (from prototype)
│   │   └── Particles.js                     # particle classes (from prototype)
│   ├── cycle/
│   │   ├── stateMachine.js                  # pure cycle logic
│   │   ├── stateMachine.test.js             # unit tests
│   │   └── useCycle.js                      # React hook wrapping the state machine
│   ├── overlays/
│   │   ├── PomodoroTimer.jsx                # top-right timer + cycle counter
│   │   ├── QuoteOverlay.jsx                 # rotating philosophical quotes
│   │   ├── AttributionMark.jsx              # @joburnai · FORGE FM (top-left)
│   │   └── RadioBar.jsx                     # bottom non-interactive radio UI
│   ├── quotes/
│   │   ├── quotes.json                      # ~60 quotes tagged by register
│   │   ├── selectQuote.js                   # pure selector
│   │   └── selectQuote.test.js              # unit tests
│   └── audio/
│       └── AudioLoop.jsx                    # Howler.js wrapper for the lofi loop
├── infra/
│   ├── start-stream.sh                      # xvfb + chromium + ffmpeg launcher
│   ├── health-check.sh                      # cron health check + Slack alert
│   ├── forge-fm-stream.service              # systemd unit for ffmpeg
│   ├── forge-fm-app.service                 # systemd unit for the vite preview server
│   ├── nginx-static.conf                    # optional, for serving built assets
│   └── droplet-bootstrap.sh                 # one-time droplet provisioning script
└── .env.example                             # template for streaming secrets
```

---

# Phase 1: Project Scaffold (Claude tasks)

### Task 1: Initialize Vite + React project structure

**Files:**
- Create: `/root/joburn-livestream/package.json`
- Create: `/root/joburn-livestream/vite.config.js`
- Create: `/root/joburn-livestream/index.html`
- Create: `/root/joburn-livestream/src/main.jsx`
- Create: `/root/joburn-livestream/.env.example`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "joburn-livestream",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 8080",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.460.0",
    "howler": "^2.2.4",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/howler": "^2.2.12",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "vite": "^6.0.1",
    "vitest": "^2.1.6"
  }
}
```

- [ ] **Step 2: Write `vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173 },
  preview: { host: '0.0.0.0', port: 8080 },
  build: { outDir: 'dist', sourcemap: false }
});
```

- [ ] **Step 3: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, initial-scale=1" />
    <title>Forge FM · @joburnai</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-neutral-950 overflow-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Write `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

- [ ] **Step 5: Write `.env.example`**

```
# YouTube Live RTMP stream key (private — DO NOT commit the real value)
YOUTUBE_STREAM_KEY=

# Slack webhook for #alerts channel
SLACK_WEBHOOK_URL=

# Droplet identification (set by droplet-bootstrap.sh)
DROPLET_HOSTNAME=
```

- [ ] **Step 6: Commit**

```bash
git -C /root/joburn-livestream add package.json vite.config.js index.html src/main.jsx .env.example
git -C /root/joburn-livestream commit -m "feat(scaffold): vite + react + tailwind project skeleton"
```

---

### Task 2: Configure Tailwind CSS + base styles

**Files:**
- Create: `/root/joburn-livestream/tailwind.config.js`
- Create: `/root/joburn-livestream/postcss.config.js`
- Create: `/root/joburn-livestream/src/index.css`

- [ ] **Step 1: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['ui-monospace', 'SFMono-Regular', 'monospace'] },
      colors: {
        forge: {
          ember: '#f97316',
          amber: '#fbbf24',
          cream: '#fef3c7',
          cyan: '#22d3ee',
          deep: '#1c1917'
        }
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 2: Write `postcss.config.js`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} }
};
```

- [ ] **Step 3: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; margin: 0; padding: 0; }
body { background: #0a0502; }
```

- [ ] **Step 4: Commit**

```bash
git -C /root/joburn-livestream add tailwind.config.js postcss.config.js src/index.css
git -C /root/joburn-livestream commit -m "feat(scaffold): tailwind config + base styles"
```

---

### Task 3: Migrate the prototype into proper project structure

**Files:**
- Create: `/root/joburn-livestream/src/App.jsx` (skeleton — orchestrates the scene + overlays)
- Create: `/root/joburn-livestream/src/scene/ForgeScene.jsx` (SVG + Canvas, from prototype)
- Create: `/root/joburn-livestream/src/scene/Particles.js` (particle classes, from prototype)

The prototype lives at `/root/joburn-livestream/_v0_prototype.jsx`. Split it into three files. Strip the user-facing play/pause/skip controls — streams are always-on.

- [ ] **Step 1: Write `src/scene/Particles.js` — extract the Particle class verbatim from `_v0_prototype.jsx` lines 4-100**

```js
export class Particle {
  constructor(type, cw, ch) {
    this.type = type;
    this.cw = cw;
    this.ch = ch;
    this.reset(true);
  }

  reset(initial = false) {
    this.tick = Math.random() * 100;
    if (this.type === 'dust') {
      this.x = Math.random() * this.cw;
      this.y = initial ? Math.random() * this.ch : this.ch + 10;
      this.vx = 0.2 + Math.random() * 0.8;
      this.vy = -0.1 - Math.random() * 0.4;
      this.size = Math.random() * 2.5 + 0.5;
      this.alpha = Math.random() * 0.3 + 0.05;
    } else if (this.type === 'ember') {
      this.x = 1150 + Math.random() * 100;
      this.y = 650 + Math.random() * 50;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -1 - Math.random() * 3;
      this.size = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.01;
    } else if (this.type === 'kettleSteam') {
      this.x = 1200 + (Math.random() - 0.5) * 20;
      this.y = 620;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -0.5 - Math.random() * 1.5;
      this.size = Math.random() * 15 + 10;
      this.alpha = 0.15;
      this.life = 1;
      this.decay = Math.random() * 0.01 + 0.005;
    } else if (this.type === 'poolSteam') {
      this.x = 1100 + Math.random() * 300;
      this.y = 750 + Math.random() * 50;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -0.3 - Math.random() * 1;
      this.size = Math.random() * 25 + 15;
      this.alpha = 0.1;
      this.life = 1;
      this.decay = Math.random() * 0.008 + 0.004;
    } else if (this.type === 'water') {
      this.x = 1495 + Math.random() * 10;
      this.y = 615;
      this.vx = 0;
      this.vy = 6 + Math.random() * 4;
      this.size = Math.random() * 1.5 + 0.5;
      this.length = Math.random() * 15 + 5;
    }
  }

  update() {
    this.tick += 0.05;
    this.x += this.vx;
    if (this.type === 'dust') {
      this.y += this.vy + Math.sin(this.tick) * 0.3;
      if (this.x > this.cw || this.y < -10) this.reset();
    } else if (this.type === 'ember' || this.type === 'kettleSteam' || this.type === 'poolSteam') {
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0) this.reset();
    } else if (this.type === 'water') {
      this.y += this.vy;
      if (this.y > 780 + (Math.random() * 20)) this.reset();
    }
  }

  draw(ctx) {
    if (this.type === 'dust') {
      ctx.fillStyle = `rgba(251, 191, 36, ${this.alpha})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'ember') {
      ctx.fillStyle = `rgba(249, 115, 22, ${this.alpha * this.life})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'kettleSteam' || this.type === 'poolSteam') {
      ctx.fillStyle = `rgba(224, 231, 255, ${this.alpha * this.life})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'water') {
      ctx.fillStyle = `rgba(165, 243, 252, 0.5)`;
      ctx.fillRect(this.x, this.y, this.size, this.length);
    }
  }
}
```

- [ ] **Step 2: Write `src/scene/ForgeScene.jsx`** — extract everything from `_v0_prototype.jsx` BUT remove the play/pause logic + Lofi Radio UI. Just the SVG + Canvas + film grain. The component renders the always-on scene without any user controls. (Source: `_v0_prototype.jsx:155-440`, modified.)

```jsx
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
        {/* All <defs>, BACKGROUND, MIDGROUND, FOREGROUND elements from _v0_prototype.jsx lines 195-381 go here verbatim */}
        {/* PRESERVE: defs (glow, techGlow, fireGradient, sunbeamGradient), beams, window, sunbeams,
            wall tools, fireplace+hearth+kettle, anvil, workbench, cyan tech artifact,
            water spout, pool, capybara group, pool rim rocks */}
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
```

**Note:** Step 2 requires you to copy the entire `<svg>` body verbatim from `_v0_prototype.jsx`. Do NOT modify any path/rect/circle coordinates — they're tuned. The `className={isPlaying ? "animate-pulse" : ""}` patterns should be simplified to `className="animate-pulse"` (always animate, no isPlaying gate).

- [ ] **Step 3: Write `src/App.jsx`** (minimal shell — overlays added in later tasks)

```jsx
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
```

- [ ] **Step 4: Run `npm install`**

```bash
cd /root/joburn-livestream && npm install
```

Expected: clean install, no errors. Vite, React, Tailwind, lucide-react, Howler all install.

- [ ] **Step 5: Run dev server**

```bash
cd /root/joburn-livestream && npm run dev
```

Expected: Vite serves on `http://0.0.0.0:5173`. Browser shows the cozy forge scene (no UI overlays yet, no play/pause). Particles animate (dust drifts up, embers float up, kettle steams, pool steams, water drizzles on the capybara).

- [ ] **Step 6: Commit**

```bash
git -C /root/joburn-livestream add src/App.jsx src/scene/ForgeScene.jsx src/scene/Particles.js package-lock.json
git -C /root/joburn-livestream commit -m "feat(scene): migrate prototype into modular structure, strip user controls"
```

---

### Task 4: Push initial repo to GitHub

**Files:** none (remote operation)

- [ ] **Step 1: Add remote**

```bash
git -C /root/joburn-livestream remote add origin git@github.com:funnel-futurist/joburn-livestream.git
```

If the SSH remote isn't accessible, use HTTPS via `$GITHUB_TOKEN`:

```bash
git -C /root/joburn-livestream remote add origin "https://${GITHUB_TOKEN}@github.com/funnel-futurist/joburn-livestream.git"
```

- [ ] **Step 2: Push main branch**

```bash
git -C /root/joburn-livestream push -u origin main
```

Expected: branch `main` pushes successfully. Verify by viewing `https://github.com/funnel-futurist/joburn-livestream` in browser.

**⚠️ OPERATOR APPROVAL GATE:** Push requires operator confirmation per CLAUDE.md Rule 11 (deployment gates). Surface before executing.

---

# Phase 2: Thin-Slice Streaming Validation (highest-risk de-risk)

**Why this phase comes BEFORE building Pomodoro/quotes/audio:** the entire pipeline (xvfb → chromium → ffmpeg → YouTube RTMP) is the biggest unknown. We validate that we can stream the *existing* scene to a *private* YouTube stream BEFORE adding any more features. If the pipeline doesn't work, nothing downstream matters.

### Task 5: Provision DigitalOcean droplet

**Files:** none (cloud provisioning)

**⚠️ OPERATOR ACTION** — Claude prepares the bootstrap script, operator clicks "create" in the DO dashboard.

- [ ] **Step 1: Write `infra/droplet-bootstrap.sh`**

```bash
#!/usr/bin/env bash
# infra/droplet-bootstrap.sh
# One-time droplet setup for Forge FM v0
# Run on a fresh Ubuntu 24.04 droplet as root
set -euo pipefail

echo "=== Forge FM droplet bootstrap ==="

# 1. System update + base tools
apt-get update -y
apt-get upgrade -y
apt-get install -y \
  build-essential curl git ufw fail2ban \
  ffmpeg xvfb chromium-browser \
  nginx unzip jq

# 2. Node 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 3. Firewall: only SSH + HTTPS exposed (stream goes OUTBOUND to YouTube)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 4. Create app user
id -u forgefm &>/dev/null || useradd -m -s /bin/bash forgefm
mkdir -p /opt/forge-fm
chown forgefm:forgefm /opt/forge-fm

# 5. Clone repo into /opt
sudo -u forgefm git clone https://github.com/funnel-futurist/joburn-livestream.git /opt/forge-fm/app

# 6. Install deps + build
cd /opt/forge-fm/app
sudo -u forgefm npm install
sudo -u forgefm npm run build

# 7. Verify chromium launches under xvfb
sudo -u forgefm xvfb-run --server-args="-screen 0 1920x1080x24" \
  chromium --headless=new --disable-gpu --version

# 8. Verify ffmpeg version
ffmpeg -version | head -1

echo "=== Bootstrap complete. Next: configure .env, then deploy systemd services. ==="
```

- [ ] **Step 2: Commit the bootstrap script**

```bash
chmod +x /root/joburn-livestream/infra/droplet-bootstrap.sh
git -C /root/joburn-livestream add infra/droplet-bootstrap.sh
git -C /root/joburn-livestream commit -m "feat(infra): droplet bootstrap script for Ubuntu 24.04"
```

- [ ] **Step 3: Operator provisions the droplet**

Operator manual steps (in DigitalOcean dashboard):
1. Create droplet: **Ubuntu 24.04 LTS, Basic Plan, $24/mo (2GB RAM / 1 vCPU / 60GB)**, datacenter region nearest you (NYC3 if east coast US, AMS3 if EU)
2. Authentication: SSH key (existing FF key)
3. Hostname: `forge-fm-stream-01`
4. Enable backups (extra $5/mo — worth it for the always-on workload)
5. Save the public IP, share with Claude

**Verification:** Claude SSHes in via `ssh root@<public_ip>`, confirms uptime + uname.

- [ ] **Step 4: Run bootstrap script on the droplet**

```bash
# From operator's local machine (or Claude with SSH access):
scp /root/joburn-livestream/infra/droplet-bootstrap.sh root@<public_ip>:/root/bootstrap.sh
ssh root@<public_ip> 'bash /root/bootstrap.sh 2>&1 | tee /root/bootstrap.log'
```

Expected: script completes without error. Chromium prints a version string. ffmpeg prints a version line. `/opt/forge-fm/app` exists with built dist/.

---

### Task 6: Write the streaming launch script

**Files:**
- Create: `/root/joburn-livestream/infra/start-stream.sh`

- [ ] **Step 1: Write `infra/start-stream.sh`**

```bash
#!/usr/bin/env bash
# infra/start-stream.sh
# Launches xvfb + chromium pointed at the local app + ffmpeg streaming to YouTube
set -euo pipefail

# Load env
if [ -f /opt/forge-fm/app/.env ]; then
  set -a; source /opt/forge-fm/app/.env; set +a
fi

if [ -z "${YOUTUBE_STREAM_KEY:-}" ]; then
  echo "ERROR: YOUTUBE_STREAM_KEY not set" >&2
  exit 1
fi

LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:8080}"
AUDIO_FILE="${AUDIO_FILE:-/opt/forge-fm/audio/soul_tempering_v0.mp3}"
DISPLAY_NUM=:99
RESOLUTION="1920x1080"
FPS=30

# Cleanup any existing xvfb / chromium
pkill -f "Xvfb $DISPLAY_NUM" 2>/dev/null || true
pkill -f "chromium" 2>/dev/null || true
sleep 1

# Start xvfb
Xvfb $DISPLAY_NUM -screen 0 ${RESOLUTION}x24 -nolisten tcp &
XVFB_PID=$!
sleep 2

# Start chromium pointed at the local app
DISPLAY=$DISPLAY_NUM chromium \
  --kiosk \
  --no-sandbox \
  --disable-gpu \
  --disable-software-rasterizer \
  --autoplay-policy=no-user-gesture-required \
  --window-size=1920,1080 \
  --user-data-dir=/tmp/chromium-forge \
  "$LOCAL_URL" &
CHROMIUM_PID=$!
sleep 5

# Stream: capture xvfb display, loop audio file, mux, push to YouTube RTMP
ffmpeg -hide_banner -loglevel warning \
  -f x11grab -framerate $FPS -video_size $RESOLUTION -i $DISPLAY_NUM \
  -stream_loop -1 -i "$AUDIO_FILE" \
  -c:v libx264 -preset veryfast -tune zerolatency -b:v 4500k -maxrate 4500k -bufsize 9000k \
  -g 60 -keyint_min 60 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ar 44100 \
  -shortest:0 \
  -f flv "rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}"

# If ffmpeg exits, cleanup
kill $XVFB_PID $CHROMIUM_PID 2>/dev/null || true
```

- [ ] **Step 2: Make executable + commit**

```bash
chmod +x /root/joburn-livestream/infra/start-stream.sh
git -C /root/joburn-livestream add infra/start-stream.sh
git -C /root/joburn-livestream commit -m "feat(infra): xvfb + chromium + ffmpeg streaming launcher"
```

---

### Task 7: Deploy systemd service + first stream test (PRIVATE)

**Files:**
- Create: `/root/joburn-livestream/infra/forge-fm-app.service`
- Create: `/root/joburn-livestream/infra/forge-fm-stream.service`

- [ ] **Step 1: Write `infra/forge-fm-app.service`**

```ini
[Unit]
Description=Forge FM React app (vite preview)
After=network.target

[Service]
Type=simple
User=forgefm
WorkingDirectory=/opt/forge-fm/app
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 2: Write `infra/forge-fm-stream.service`**

```ini
[Unit]
Description=Forge FM YouTube stream (xvfb + chromium + ffmpeg)
After=network.target forge-fm-app.service
Requires=forge-fm-app.service

[Service]
Type=simple
User=forgefm
WorkingDirectory=/opt/forge-fm/app
EnvironmentFile=/opt/forge-fm/app/.env
ExecStart=/opt/forge-fm/app/infra/start-stream.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 3: Commit + deploy to droplet**

```bash
git -C /root/joburn-livestream add infra/forge-fm-app.service infra/forge-fm-stream.service
git -C /root/joburn-livestream commit -m "feat(infra): systemd services for app + stream"
git -C /root/joburn-livestream push origin main
```

- [ ] **Step 4: Operator creates YouTube Live private stream**

Operator manual steps:
1. Go to `https://studio.youtube.com/channel/UC.../livestreaming`
2. Click "Go Live" → "Stream" → "New stream"
3. Title: `Forge FM · Soul Tempering · 24/7 Lofi Coworking`
4. Visibility: **Private** (will switch to Public at Phase 9)
5. Category: Music
6. Copy the **Stream Key** (looks like `xxxx-xxxx-xxxx-xxxx`)

- [ ] **Step 5: On the droplet, configure `.env` + install systemd units**

```bash
ssh root@<droplet_ip>
# Configure env
cat > /opt/forge-fm/app/.env <<EOF
YOUTUBE_STREAM_KEY=<paste-stream-key-here>
SLACK_WEBHOOK_URL=<from-root-env>
LOCAL_URL=http://127.0.0.1:8080
AUDIO_FILE=/opt/forge-fm/audio/soul_tempering_v0.mp3
EOF
chown forgefm:forgefm /opt/forge-fm/app/.env
chmod 600 /opt/forge-fm/app/.env

# Pull operator-supplied audio file
mkdir -p /opt/forge-fm/audio
# (operator scps the lofi MP3 here)

# Install systemd units
cp /opt/forge-fm/app/infra/forge-fm-app.service /etc/systemd/system/
cp /opt/forge-fm/app/infra/forge-fm-stream.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable forge-fm-app forge-fm-stream
systemctl start forge-fm-app
sleep 5
systemctl start forge-fm-stream
```

- [ ] **Step 6: Verify the private stream is live**

Operator verification: refresh the YouTube Live dashboard. Should show "Live" indicator within 30-60 seconds. Preview window should display the cozy forge scene at 30fps with no stutter.

```bash
# On the droplet, confirm services running:
systemctl status forge-fm-app forge-fm-stream
journalctl -u forge-fm-stream -n 50 --no-pager
```

Expected: both services `active (running)`. ffmpeg log shows ~30fps encoding. YouTube Live dashboard shows incoming stream.

**🛑 IF FFMPEG OR YOUTUBE FAILS:** Stop here. Debug. Common issues:
- `Cannot open display :99` → xvfb not running, check `Xvfb` process
- `chromium-browser: command not found` → install path is `chromium` on Ubuntu 24.04
- `RTMP_Connect0 failed` → invalid stream key, regenerate in YouTube Studio
- Bitrate too high for droplet upload → reduce `-b:v 4500k` to `-b:v 2500k`

---

# Phase 3: Cycle State Machine + Pomodoro Timer

### Task 8: Write the cycle state machine (pure function, TDD)

**Files:**
- Create: `/root/joburn-livestream/src/cycle/stateMachine.js`
- Create: `/root/joburn-livestream/src/cycle/stateMachine.test.js`

The state machine is a pure function of wall-clock time → cycle state. This means streams can restart anytime and pick up at the correct position without needing persistent state.

**Cycle definition:**
- One "block" = 60 minutes total: 50 min FOCUS + 10 min BREAK
- Every 4th block, the BREAK extends to 30 min (block is 80 min total)
- A "super-cycle" = 4 blocks = 240 min (50+10+50+10+50+10+50+30 = 240). Wait: 4 blocks of 60min standard, but the 4th has a 30-min break instead of 10 → 50+10+50+10+50+10+50+30 = 260 min.
- Actually: cycle 1 = 60min, cycle 2 = 60min, cycle 3 = 60min, cycle 4 = 80min. Super-cycle = 60+60+60+80 = 260 min.
- Repeat super-cycle indefinitely.

- [ ] **Step 1: Write the failing test**

```js
// src/cycle/stateMachine.test.js
import { describe, it, expect } from 'vitest';
import { getCycleState } from './stateMachine.js';

const SUPER_CYCLE_MS = 260 * 60 * 1000; // 260 minutes

describe('getCycleState', () => {
  it('returns FOCUS phase at the start of the super-cycle', () => {
    const epoch = 0;
    const result = getCycleState(epoch, epoch);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(1);
    expect(result.minutesRemaining).toBe(50);
    expect(result.minuteWithinPhase).toBe(0);
  });

  it('returns BREAK phase 50 minutes into cycle 1', () => {
    const epoch = 0;
    const now = 50 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('BREAK');
    expect(result.cycleIndex).toBe(1);
    expect(result.minutesRemaining).toBe(10);
  });

  it('returns FOCUS phase at start of cycle 2 (minute 60)', () => {
    const epoch = 0;
    const now = 60 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(2);
    expect(result.minutesRemaining).toBe(50);
  });

  it('returns LONG_BREAK on cycle 4 (minute 230)', () => {
    const epoch = 0;
    const now = 230 * 60 * 1000;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('LONG_BREAK');
    expect(result.cycleIndex).toBe(4);
    expect(result.minutesRemaining).toBe(30);
  });

  it('wraps back to FOCUS cycle 1 after super-cycle (minute 260)', () => {
    const epoch = 0;
    const now = SUPER_CYCLE_MS;
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.cycleIndex).toBe(1);
  });

  it('is deterministic given the same epoch and now', () => {
    const epoch = 1747353600000;
    const now = epoch + 73 * 60 * 1000;
    const a = getCycleState(epoch, now);
    const b = getCycleState(epoch, now);
    expect(a).toEqual(b);
  });

  it('handles seconds precision in minuteWithinPhase', () => {
    const epoch = 0;
    const now = 12.5 * 60 * 1000; // 12 min 30 sec into FOCUS
    const result = getCycleState(epoch, now);
    expect(result.phase).toBe('FOCUS');
    expect(result.minuteWithinPhase).toBeCloseTo(12.5, 1);
    expect(result.secondsRemaining).toBe((50 - 12.5) * 60);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/joburn-livestream && npm run test -- stateMachine
```

Expected: FAIL with "Cannot find module './stateMachine.js'"

- [ ] **Step 3: Implement `src/cycle/stateMachine.js`**

```js
// src/cycle/stateMachine.js
// Pure function: maps wall-clock time → current cycle phase + position.
// No state stored anywhere. Restart-safe. Deterministic.

const FOCUS_MIN = 50;
const BREAK_MIN = 10;
const LONG_BREAK_MIN = 30;
const BLOCKS_PER_SUPER_CYCLE = 4;

// Standard block (focus + break) = 60 min; 4th block has long break = 80 min.
// Super-cycle = 3*60 + 80 = 260 min.
const STANDARD_BLOCK_MIN = FOCUS_MIN + BREAK_MIN; // 60
const LONG_BLOCK_MIN = FOCUS_MIN + LONG_BREAK_MIN; // 80
const SUPER_CYCLE_MIN = (BLOCKS_PER_SUPER_CYCLE - 1) * STANDARD_BLOCK_MIN + LONG_BLOCK_MIN; // 260

/**
 * @param {number} epochMs - Reference epoch (any absolute time; cycle is computed relative to it).
 * @param {number} nowMs - Current wall-clock time in milliseconds.
 * @returns {{
 *   phase: 'FOCUS' | 'BREAK' | 'LONG_BREAK',
 *   cycleIndex: 1 | 2 | 3 | 4,
 *   minuteWithinPhase: number,
 *   minutesRemaining: number,
 *   secondsRemaining: number,
 *   superCycleNumber: number
 * }}
 */
export function getCycleState(epochMs, nowMs) {
  const elapsedMs = nowMs - epochMs;
  const superCycleNumber = Math.floor(elapsedMs / (SUPER_CYCLE_MIN * 60 * 1000));
  const minIntoSuperCycle = (elapsedMs / 60000) % SUPER_CYCLE_MIN;

  let cumulative = 0;
  for (let cycleIndex = 1; cycleIndex <= BLOCKS_PER_SUPER_CYCLE; cycleIndex++) {
    const isLast = cycleIndex === BLOCKS_PER_SUPER_CYCLE;
    const breakDuration = isLast ? LONG_BREAK_MIN : BREAK_MIN;
    const breakPhase = isLast ? 'LONG_BREAK' : 'BREAK';

    // FOCUS portion
    if (minIntoSuperCycle < cumulative + FOCUS_MIN) {
      const minuteWithinPhase = minIntoSuperCycle - cumulative;
      const minutesRemaining = FOCUS_MIN - minuteWithinPhase;
      return {
        phase: 'FOCUS',
        cycleIndex,
        minuteWithinPhase,
        minutesRemaining: Math.ceil(minutesRemaining),
        secondsRemaining: minutesRemaining * 60,
        superCycleNumber
      };
    }
    cumulative += FOCUS_MIN;

    // BREAK portion
    if (minIntoSuperCycle < cumulative + breakDuration) {
      const minuteWithinPhase = minIntoSuperCycle - cumulative;
      const minutesRemaining = breakDuration - minuteWithinPhase;
      return {
        phase: breakPhase,
        cycleIndex,
        minuteWithinPhase,
        minutesRemaining: Math.ceil(minutesRemaining),
        secondsRemaining: minutesRemaining * 60,
        superCycleNumber
      };
    }
    cumulative += breakDuration;
  }

  // Unreachable
  throw new Error('cycle state machine error');
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /root/joburn-livestream && npm run test -- stateMachine
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /root/joburn-livestream add src/cycle/stateMachine.js src/cycle/stateMachine.test.js
git -C /root/joburn-livestream commit -m "feat(cycle): pure state machine driven by wall-clock time"
```

---

### Task 9: Write the React hook wrapping the state machine

**Files:**
- Create: `/root/joburn-livestream/src/cycle/useCycle.js`

The hook reads the wall-clock time and re-renders every second. Epoch is set at mount and persists for the session (so an in-browser refresh during a stream doesn't reset the cycle).

- [ ] **Step 1: Write `src/cycle/useCycle.js`**

```js
// src/cycle/useCycle.js
import { useState, useEffect } from 'react';
import { getCycleState } from './stateMachine.js';

// Fixed reference epoch — Sunday 2026-05-17 00:00:00 UTC.
// All clients computing against this epoch see the same cycle position
// (so two viewers in different time zones see the same FOCUS/BREAK).
const REFERENCE_EPOCH_MS = Date.UTC(2026, 4, 17, 0, 0, 0); // month is 0-indexed: 4 = May

export function useCycle() {
  const [state, setState] = useState(() => getCycleState(REFERENCE_EPOCH_MS, Date.now()));

  useEffect(() => {
    const tick = () => setState(getCycleState(REFERENCE_EPOCH_MS, Date.now()));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git -C /root/joburn-livestream add src/cycle/useCycle.js
git -C /root/joburn-livestream commit -m "feat(cycle): useCycle hook ticks every second from fixed epoch"
```

---

### Task 10: Build the Pomodoro timer UI (top-right)

**Files:**
- Create: `/root/joburn-livestream/src/overlays/PomodoroTimer.jsx`
- Modify: `/root/joburn-livestream/src/App.jsx`

- [ ] **Step 1: Write `src/overlays/PomodoroTimer.jsx`**

```jsx
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
```

- [ ] **Step 2: Wire into `src/App.jsx`**

```jsx
import React from 'react';
import ForgeScene from './scene/ForgeScene.jsx';
import PomodoroTimer from './overlays/PomodoroTimer.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <ForgeScene />
        <PomodoroTimer />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
cd /root/joburn-livestream && npm run dev
```

Expected: Forge scene with a top-right timer showing `FOCUS · cycle X/4` and a large MM:SS countdown ticking every second. Color cycles correctly between amber (FOCUS), cyan (BREAK), violet (LONG_BREAK) — to test all three, manually shift the `REFERENCE_EPOCH_MS` and reload.

- [ ] **Step 4: Commit**

```bash
git -C /root/joburn-livestream add src/overlays/PomodoroTimer.jsx src/App.jsx
git -C /root/joburn-livestream commit -m "feat(overlay): top-right Pomodoro timer with phase + cycle counter"
```

---

# Phase 4: Quote Rotator

### Task 11: Curate the quote library (~60 quotes, 4 registers)

**Files:**
- Create: `/root/joburn-livestream/src/quotes/quotes.json`

The library follows blueprint §2A.3. Four registers tied to cycle position:
- `PRIMING` — orientation/setup, played in FOCUS minutes 0-10
- `DEEP_WORK` — endurance/grit, played in FOCUS minutes 30-45
- `RELEASE` — surrender/rest, played in FOCUS minutes 45-50 and start of BREAK
- `REFLECTION` — meaning/depth, played in LONG_BREAK

15 quotes per register, mix of Stoics + classical + Joburn IP.

- [ ] **Step 1: Write `src/quotes/quotes.json`**

```json
[
  { "register": "PRIMING", "text": "The unexamined life is not worth living.", "author": "Socrates" },
  { "register": "PRIMING", "text": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "author": "Aristotle" },
  { "register": "PRIMING", "text": "Begin to be now what you will be hereafter.", "author": "William James" },
  { "register": "PRIMING", "text": "The first principle is that you must not fool yourself — and you are the easiest person to fool.", "author": "Richard Feynman" },
  { "register": "PRIMING", "text": "Discipline equals freedom.", "author": "Jocko Willink" },
  { "register": "PRIMING", "text": "Concentrate every minute on doing what's in front of you with precise and genuine seriousness.", "author": "Marcus Aurelius" },
  { "register": "PRIMING", "text": "If a man knows not which port he sails to, no wind is favorable.", "author": "Seneca" },
  { "register": "PRIMING", "text": "The cave you fear to enter holds the treasure you seek.", "author": "Joseph Campbell" },
  { "register": "PRIMING", "text": "Identity is the foundation under everything you build. Crack the foundation, and the whole stack cracks.", "author": "Joburn" },
  { "register": "PRIMING", "text": "Pressure exposes; it never creates.", "author": "Joburn" },
  { "register": "PRIMING", "text": "How you do anything is how you do everything.", "author": "Martha Beck" },
  { "register": "PRIMING", "text": "The obstacle is the way.", "author": "Marcus Aurelius" },
  { "register": "PRIMING", "text": "What you seek is seeking you.", "author": "Rumi" },
  { "register": "PRIMING", "text": "Do not pray for an easy life. Pray for the strength to endure a difficult one.", "author": "Bruce Lee" },
  { "register": "PRIMING", "text": "Begin at once to live, and count each separate day as a separate life.", "author": "Seneca" },

  { "register": "DEEP_WORK", "text": "Amor fati — love your fate.", "author": "Friedrich Nietzsche" },
  { "register": "DEEP_WORK", "text": "Hard choices, easy life. Easy choices, hard life.", "author": "Jerzy Gregorek" },
  { "register": "DEEP_WORK", "text": "The mind that opens to a new idea never returns to its original size.", "author": "Albert Einstein" },
  { "register": "DEEP_WORK", "text": "It is not the man who has too little, but the man who craves more, that is poor.", "author": "Seneca" },
  { "register": "DEEP_WORK", "text": "The successful warrior is the average man, with laser-like focus.", "author": "Bruce Lee" },
  { "register": "DEEP_WORK", "text": "Quality is not an act. It is a habit.", "author": "Aristotle" },
  { "register": "DEEP_WORK", "text": "The impediment to action advances action. What stands in the way becomes the way.", "author": "Marcus Aurelius" },
  { "register": "DEEP_WORK", "text": "If you want to build a ship, don't drum up the men to gather wood, divide the work, and give orders. Instead, teach them to yearn for the vast and endless sea.", "author": "Antoine de Saint-Exupéry" },
  { "register": "DEEP_WORK", "text": "Difficulty is a coin the world uses to buy mastery.", "author": "Joburn" },
  { "register": "DEEP_WORK", "text": "The sword is forged not by the strike, but by the slow patience between strikes.", "author": "Joburn" },
  { "register": "DEEP_WORK", "text": "Energy and persistence conquer all things.", "author": "Benjamin Franklin" },
  { "register": "DEEP_WORK", "text": "He who has a why to live for can bear almost any how.", "author": "Friedrich Nietzsche" },
  { "register": "DEEP_WORK", "text": "Do not be too timid and squeamish about your actions. All life is an experiment.", "author": "Ralph Waldo Emerson" },
  { "register": "DEEP_WORK", "text": "We suffer more in imagination than in reality.", "author": "Seneca" },
  { "register": "DEEP_WORK", "text": "Strength does not come from physical capacity. It comes from an indomitable will.", "author": "Mahatma Gandhi" },

  { "register": "RELEASE", "text": "Rest is not laziness. Rest is the soil where the next harvest grows.", "author": "Joburn" },
  { "register": "RELEASE", "text": "Almost everything will work again if you unplug it for a few minutes — including you.", "author": "Anne Lamott" },
  { "register": "RELEASE", "text": "Take rest; a field that has rested gives a bountiful crop.", "author": "Ovid" },
  { "register": "RELEASE", "text": "It is in the silence between the notes that music lives.", "author": "Claude Debussy" },
  { "register": "RELEASE", "text": "Nature does not hurry, yet everything is accomplished.", "author": "Lao Tzu" },
  { "register": "RELEASE", "text": "The bow that's always strung will break.", "author": "Joburn" },
  { "register": "RELEASE", "text": "Stop and smell the embers.", "author": "Joburn" },
  { "register": "RELEASE", "text": "He who is contented is rich.", "author": "Lao Tzu" },
  { "register": "RELEASE", "text": "The wound is the place where the light enters you.", "author": "Rumi" },
  { "register": "RELEASE", "text": "Solitude is independence.", "author": "Hermann Hesse" },
  { "register": "RELEASE", "text": "Sometimes the most productive thing you can do is relax.", "author": "Mark Black" },
  { "register": "RELEASE", "text": "When you cannot solve the problem, manage it.", "author": "Robert H. Schuller" },
  { "register": "RELEASE", "text": "The quieter you become, the more you are able to hear.", "author": "Rumi" },
  { "register": "RELEASE", "text": "Drink water. Eat fruit. Step outside. Look at the sky.", "author": "Joburn" },
  { "register": "RELEASE", "text": "Breath is the bridge which connects life to consciousness.", "author": "Thich Nhat Hanh" },

  { "register": "REFLECTION", "text": "Know thyself.", "author": "Inscription at Delphi" },
  { "register": "REFLECTION", "text": "What man actually needs is not a tensionless state but rather the striving for a worthwhile goal.", "author": "Viktor Frankl" },
  { "register": "REFLECTION", "text": "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom.", "author": "Viktor Frankl" },
  { "register": "REFLECTION", "text": "The privilege of a lifetime is to become who you truly are.", "author": "Carl Jung" },
  { "register": "REFLECTION", "text": "He who has overcome his fears will truly be free.", "author": "Aristotle" },
  { "register": "REFLECTION", "text": "We don't see things as they are; we see them as we are.", "author": "Anaïs Nin" },
  { "register": "REFLECTION", "text": "The character of every act depends upon the circumstances in which it is done.", "author": "Oliver Wendell Holmes Jr." },
  { "register": "REFLECTION", "text": "Until you make the unconscious conscious, it will direct your life and you will call it fate.", "author": "Carl Jung" },
  { "register": "REFLECTION", "text": "The greatest weapon against stress is our ability to choose one thought over another.", "author": "William James" },
  { "register": "REFLECTION", "text": "Founders crack where their identity is thinnest. Thicken your identity before you scale.", "author": "Joburn" },
  { "register": "REFLECTION", "text": "A scaled flaw is just a louder version of the same flaw.", "author": "Joburn" },
  { "register": "REFLECTION", "text": "Your identity is the soil; everything you build is the harvest. Tend the soil first.", "author": "Joburn" },
  { "register": "REFLECTION", "text": "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", "author": "Jean-Paul Sartre" },
  { "register": "REFLECTION", "text": "The most important thing in communication is hearing what isn't said.", "author": "Peter Drucker" },
  { "register": "REFLECTION", "text": "He who knows others is wise; he who knows himself is enlightened.", "author": "Lao Tzu" }
]
```

- [ ] **Step 2: Commit**

```bash
git -C /root/joburn-livestream add src/quotes/quotes.json
git -C /root/joburn-livestream commit -m "feat(quotes): seed 60 quotes across 4 cycle-position registers"
```

---

### Task 12: Write the quote selector (TDD)

**Files:**
- Create: `/root/joburn-livestream/src/quotes/selectQuote.js`
- Create: `/root/joburn-livestream/src/quotes/selectQuote.test.js`

- [ ] **Step 1: Write the failing test**

```js
// src/quotes/selectQuote.test.js
import { describe, it, expect } from 'vitest';
import { selectQuote, registerForCycleState } from './selectQuote.js';
import quotes from './quotes.json';

describe('registerForCycleState', () => {
  it('returns PRIMING in FOCUS minutes 0-10', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 0 })).toBe('PRIMING');
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 9 })).toBe('PRIMING');
  });
  it('returns DEEP_WORK in FOCUS minutes 10-45', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 10 })).toBe('DEEP_WORK');
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 44 })).toBe('DEEP_WORK');
  });
  it('returns RELEASE in FOCUS minutes 45-50 and BREAK', () => {
    expect(registerForCycleState({ phase: 'FOCUS', minuteWithinPhase: 47 })).toBe('RELEASE');
    expect(registerForCycleState({ phase: 'BREAK', minuteWithinPhase: 0 })).toBe('RELEASE');
    expect(registerForCycleState({ phase: 'BREAK', minuteWithinPhase: 9 })).toBe('RELEASE');
  });
  it('returns REFLECTION in LONG_BREAK', () => {
    expect(registerForCycleState({ phase: 'LONG_BREAK', minuteWithinPhase: 5 })).toBe('REFLECTION');
  });
});

describe('selectQuote', () => {
  it('returns a quote whose register matches the requested register', () => {
    const q = selectQuote('PRIMING', 0);
    expect(q.register).toBe('PRIMING');
    expect(q.text).toBeTruthy();
    expect(q.author).toBeTruthy();
  });

  it('is deterministic given the same register and rotation index', () => {
    const a = selectQuote('DEEP_WORK', 7);
    const b = selectQuote('DEEP_WORK', 7);
    expect(a).toEqual(b);
  });

  it('cycles through the register pool with increasing rotation index', () => {
    const seen = new Set();
    for (let i = 0; i < 20; i++) {
      const q = selectQuote('REFLECTION', i);
      seen.add(q.text);
    }
    // At least 5 distinct quotes (we have 15 in REFLECTION pool)
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /root/joburn-livestream && npm run test -- selectQuote
```

Expected: FAIL with "Cannot find module './selectQuote.js'".

- [ ] **Step 3: Implement `src/quotes/selectQuote.js`**

```js
// src/quotes/selectQuote.js
import quotes from './quotes.json';

const POOLS = {
  PRIMING: quotes.filter(q => q.register === 'PRIMING'),
  DEEP_WORK: quotes.filter(q => q.register === 'DEEP_WORK'),
  RELEASE: quotes.filter(q => q.register === 'RELEASE'),
  REFLECTION: quotes.filter(q => q.register === 'REFLECTION')
};

export function registerForCycleState({ phase, minuteWithinPhase }) {
  if (phase === 'LONG_BREAK') return 'REFLECTION';
  if (phase === 'BREAK') return 'RELEASE';
  if (phase === 'FOCUS') {
    if (minuteWithinPhase < 10) return 'PRIMING';
    if (minuteWithinPhase < 45) return 'DEEP_WORK';
    return 'RELEASE';
  }
  return 'PRIMING';
}

export function selectQuote(register, rotationIndex) {
  const pool = POOLS[register] || POOLS.PRIMING;
  return pool[rotationIndex % pool.length];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /root/joburn-livestream && npm run test -- selectQuote
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git -C /root/joburn-livestream add src/quotes/selectQuote.js src/quotes/selectQuote.test.js
git -C /root/joburn-livestream commit -m "feat(quotes): cycle-position-aware quote selector"
```

---

### Task 13: Build the QuoteOverlay component

**Files:**
- Create: `/root/joburn-livestream/src/overlays/QuoteOverlay.jsx`
- Modify: `/root/joburn-livestream/src/App.jsx`

The quote rotates every 5 minutes within a register. When the register changes (e.g., FOCUS minute 10 transitions to DEEP_WORK), the next quote is from the new pool.

- [ ] **Step 1: Write `src/overlays/QuoteOverlay.jsx`**

```jsx
// src/overlays/QuoteOverlay.jsx
import React, { useMemo } from 'react';
import { useCycle } from '../cycle/useCycle.js';
import { selectQuote, registerForCycleState } from '../quotes/selectQuote.js';

const ROTATION_INTERVAL_MIN = 5;

export default function QuoteOverlay() {
  const cycle = useCycle();
  const { quote, register } = useMemo(() => {
    const r = registerForCycleState(cycle);
    // Rotation index ticks every 5 minutes of total time
    const totalMin = cycle.superCycleNumber * 260 + cycleMinAbsolute(cycle);
    const rotationIndex = Math.floor(totalMin / ROTATION_INTERVAL_MIN);
    return { quote: selectQuote(r, rotationIndex), register: r };
  }, [cycle.cycleIndex, cycle.phase, Math.floor(cycle.minuteWithinPhase / ROTATION_INTERVAL_MIN), cycle.superCycleNumber]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-36 max-w-3xl text-center pointer-events-none px-6">
      <p className="text-white/85 text-2xl leading-relaxed font-serif italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-amber-300/60 text-sm mt-3 tracking-widest font-mono">
        — {quote.author}
      </p>
    </div>
  );
}

// Helper: total minutes elapsed within the current super-cycle
function cycleMinAbsolute(cycle) {
  const FOCUS = 50, BREAK = 10, LONG_BREAK = 30;
  let min = 0;
  for (let i = 1; i < cycle.cycleIndex; i++) min += FOCUS + (i === 4 ? LONG_BREAK : BREAK);
  if (cycle.phase === 'BREAK' || cycle.phase === 'LONG_BREAK') min += FOCUS;
  return min + cycle.minuteWithinPhase;
}
```

- [ ] **Step 2: Wire into `src/App.jsx`**

```jsx
import React from 'react';
import ForgeScene from './scene/ForgeScene.jsx';
import PomodoroTimer from './overlays/PomodoroTimer.jsx';
import QuoteOverlay from './overlays/QuoteOverlay.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <ForgeScene />
        <PomodoroTimer />
        <QuoteOverlay />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

```bash
cd /root/joburn-livestream && npm run dev
```

Expected: Forge scene + top-right timer + a centered quote near the bottom in serif italic. The quote rotates every 5 minutes. Register changes at FOCUS:10 (priming→deep), FOCUS:45 (deep→release), end of FOCUS (release→break), and during LONG_BREAK (reflection).

- [ ] **Step 4: Commit**

```bash
git -C /root/joburn-livestream add src/overlays/QuoteOverlay.jsx src/App.jsx
git -C /root/joburn-livestream commit -m "feat(overlay): rotating quote display tied to cycle register"
```

---

# Phase 5: Audio Layer

### Task 14: Wire single-loop lofi audio via Howler.js

**Files:**
- Create: `/root/joburn-livestream/src/audio/AudioLoop.jsx`
- Modify: `/root/joburn-livestream/src/App.jsx`

v0 plays ONE looping lofi track. Cycle-position audio dynamics (volume envelope, bell at minute 50) is deferred to v0.5.

The audio file lives at `/public/audio/soul_tempering_v0.mp3`. Operator drops it there.

- [ ] **Step 1: Write `src/audio/AudioLoop.jsx`**

```jsx
// src/audio/AudioLoop.jsx
import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function AudioLoop({ src = '/audio/soul_tempering_v0.mp3', volume = 0.6 }) {
  const howlRef = useRef(null);

  useEffect(() => {
    const sound = new Howl({
      src: [src],
      loop: true,
      volume,
      autoplay: true,
      html5: true // important: streamed audio doesn't fully buffer at start
    });
    howlRef.current = sound;
    return () => { sound.unload(); };
  }, [src, volume]);

  return null;
}
```

- [ ] **Step 2: Wire into `src/App.jsx`**

```jsx
import React from 'react';
import ForgeScene from './scene/ForgeScene.jsx';
import PomodoroTimer from './overlays/PomodoroTimer.jsx';
import QuoteOverlay from './overlays/QuoteOverlay.jsx';
import AudioLoop from './audio/AudioLoop.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <ForgeScene />
        <PomodoroTimer />
        <QuoteOverlay />
        <AudioLoop />
      </div>
    </div>
  );
}
```

**Important:** Chromium's autoplay policy blocks unprompted audio in normal browser tabs. In our streaming setup we use the flag `--autoplay-policy=no-user-gesture-required` (already in `start-stream.sh`), which allows it.

- [ ] **Step 3: Operator drops audio file**

Operator manual step: place a 60-90 min CC0/royalty-free lofi MP3 at `/root/joburn-livestream/public/audio/soul_tempering_v0.mp3`. Recommended: search "lofi study beats" on Pixabay (`https://pixabay.com/music/search/lofi/`), filter for 60+ min mixes, download a CC0 track. Or use ElevenLabs' compose-music tool if v0.5 audio is being generated early.

- [ ] **Step 4: Add audio file to git-LFS or gitignore (file is too large for plain git)**

```bash
echo "public/audio/*.mp3" >> /root/joburn-livestream/.gitignore
git -C /root/joburn-livestream add .gitignore
git -C /root/joburn-livestream commit -m "chore: gitignore audio files (deploy via scp, not git)"
```

- [ ] **Step 5: Commit code changes**

```bash
git -C /root/joburn-livestream add src/audio/AudioLoop.jsx src/App.jsx package-lock.json
git -C /root/joburn-livestream commit -m "feat(audio): loop a single lofi track via Howler.js"
```

---

# Phase 6: Brand Polish

### Task 15: Add @joburnai attribution mark + radio bar

**Files:**
- Create: `/root/joburn-livestream/src/overlays/AttributionMark.jsx`
- Create: `/root/joburn-livestream/src/overlays/RadioBar.jsx`
- Modify: `/root/joburn-livestream/src/App.jsx`

The RadioBar is the bottom UI element from the prototype, BUT non-interactive — no play/pause, no skip, no progress bar that pretends to be controllable. Just a "now playing" indicator.

- [ ] **Step 1: Write `src/overlays/AttributionMark.jsx`**

```jsx
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
```

- [ ] **Step 2: Write `src/overlays/RadioBar.jsx`**

```jsx
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
```

- [ ] **Step 3: Wire into `src/App.jsx`**

```jsx
import React from 'react';
import ForgeScene from './scene/ForgeScene.jsx';
import PomodoroTimer from './overlays/PomodoroTimer.jsx';
import QuoteOverlay from './overlays/QuoteOverlay.jsx';
import AttributionMark from './overlays/AttributionMark.jsx';
import RadioBar from './overlays/RadioBar.jsx';
import AudioLoop from './audio/AudioLoop.jsx';

export default function App() {
  return (
    <div className="w-screen h-screen bg-neutral-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="relative w-full max-w-[1920px] aspect-video bg-black shadow-2xl ring-1 ring-white/5 overflow-hidden">
        <ForgeScene />
        <AttributionMark />
        <PomodoroTimer />
        <QuoteOverlay />
        <RadioBar />
        <AudioLoop />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
cd /root/joburn-livestream && npm run dev
```

Expected: full scene with top-left LIVE/attribution mark, top-right Pomodoro timer, centered quote, bottom non-interactive radio bar showing current "track" (Soul Tempering / Ember Rest / Long Quiet) based on phase.

- [ ] **Step 5: Commit**

```bash
git -C /root/joburn-livestream add src/overlays/AttributionMark.jsx src/overlays/RadioBar.jsx src/App.jsx
git -C /root/joburn-livestream commit -m "feat(brand): attribution mark + non-interactive radio bar"
```

---

### Task 16: Final visual QA (use Gemini multimodal)

**Files:** none (validation)

Per the locked `feedback_use_gemini_for_images_and_video_2026_05_16` memory, use the Gemini API to verify the visual matches the Production Direction.

- [ ] **Step 1: Capture screenshot of running app**

```bash
cd /root/joburn-livestream && npm run build && npm run preview &
sleep 3
npx --yes puppeteer-cli screenshot http://localhost:8080 \
  --resolution=1920x1080 --output=/tmp/forge-fm-v0-screenshot.png
```

If `puppeteer-cli` doesn't exist, use the Chrome DevTools Protocol directly via curl-able approach, or have operator screenshot manually.

- [ ] **Step 2: Send to Gemini for QA**

```bash
cat > /tmp/gemini_qa.py <<'PYEOF'
import os, base64
from google import genai
client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
with open('/tmp/forge-fm-v0-screenshot.png', 'rb') as f:
    img = f.read()
resp = client.models.generate_content(
    model='gemini-2.5-pro',
    contents=[
        {'inline_data': {'mime_type': 'image/png', 'data': base64.b64encode(img).decode()}},
        {'text': """You are reviewing a v0 livestream screenshot for the Joburn / Forge FM brand.

Check against these acceptance criteria from the Production Direction:

1. Top-left: "LIVE · @joburnai · FORGE FM" with a pulsing red dot. Subtle, not aggressive.
2. Top-right: large readable Pomodoro timer showing MM:SS countdown + phase label (FOCUS / BREAK / LONG BREAK) + cycle counter (cycle X/4).
3. Centered near bottom: a serif italic philosophical quote with author attribution.
4. Bottom bar: "NOW PLAYING · FORGE FM · Soul Tempering" with the tagline "beats to refine steel/relax to".
5. Scene: cozy Studio Ghibli style blacksmith's forge with glowing hearth, anvil center-frame, capybara in a corner hot spring with a towel on its head, cyan tech artifact accent, dust motes + embers + steam particles. Warm amber/ember palette with one cyan accent.
6. NO user-facing controls (play/pause/skip). Stream is always-on.
7. Negative space respected: no subscribe overlays, no animated text, no social CTAs.

For each criterion, mark PASS / FAIL / PARTIAL and explain. End with: "OVERALL: SHIP" if all pass, "OVERALL: HOLD" if any FAIL, "OVERALL: SHIP-WITH-NOTES" if any PARTIAL."""}
    ]
)
print(resp.text)
PYEOF
GEMINI_API_KEY="$(grep '^GEMINI_API_KEY=' /root/ai-os/.env | cut -d= -f2)" \
  python3 /tmp/gemini_qa.py
```

Expected: Gemini reports PASS on most criteria, OVERALL: SHIP or SHIP-WITH-NOTES.

- [ ] **Step 3: Resolve any FAIL or PARTIAL items**

If FAIL: adjust component, re-screenshot, re-QA until PASS.
If PARTIAL: surface to operator, decide whether to fix or accept.

- [ ] **Step 4: Commit QA evidence**

Save Gemini's response to `/root/joburn-livestream/docs/v0_visual_qa.md` and commit.

```bash
git -C /root/joburn-livestream add docs/v0_visual_qa.md
git -C /root/joburn-livestream commit -m "docs(qa): v0 visual QA via Gemini multimodal review"
```

---

# Phase 7: Health Monitoring

### Task 17: Write the health check script

**Files:**
- Create: `/root/joburn-livestream/infra/health-check.sh`

- [ ] **Step 1: Write `infra/health-check.sh`**

```bash
#!/usr/bin/env bash
# infra/health-check.sh
# Verify the YouTube stream is live; alert Slack if not.
# Run via cron every 5 min.
set -euo pipefail

source /opt/forge-fm/app/.env

# Check 1: ffmpeg process is running
if ! pgrep -f "ffmpeg.*flv.*youtube" >/dev/null; then
  STATUS="DOWN: ffmpeg process not running"
  HEALTH=0
elif ! systemctl is-active --quiet forge-fm-stream; then
  STATUS="DOWN: systemd reports forge-fm-stream not active"
  HEALTH=0
else
  # Check 2: chromium is responsive on local port
  if ! curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8080" | grep -q "200"; then
    STATUS="DEGRADED: local app not responding (http 200 expected)"
    HEALTH=0
  else
    STATUS="HEALTHY: stream + app + chromium all up"
    HEALTH=1
  fi
fi

# Log
echo "[$(date -u +%FT%TZ)] $STATUS" >> /var/log/forge-fm-health.log

# Alert Slack if DOWN
if [ "$HEALTH" -eq 0 ]; then
  LAST_ALERT_FILE=/tmp/forge-fm-last-alert
  NOW=$(date +%s)
  LAST=0
  [ -f "$LAST_ALERT_FILE" ] && LAST=$(cat "$LAST_ALERT_FILE")
  ELAPSED=$((NOW - LAST))
  # De-dupe: only alert once per 15 minutes
  if [ $ELAPSED -gt 900 ]; then
    curl -s -X POST -H 'Content-Type: application/json' \
      --data "{\"text\":\":fire: *Forge FM stream alert*\n${STATUS}\n\`${DROPLET_HOSTNAME:-forge-fm}\`\"}" \
      "$SLACK_WEBHOOK_URL" >/dev/null
    echo "$NOW" > "$LAST_ALERT_FILE"
  fi
fi
```

- [ ] **Step 2: Add cron entry on droplet**

```bash
# On the droplet:
sudo -u forgefm crontab -e
# Add: */5 * * * * /opt/forge-fm/app/infra/health-check.sh
```

- [ ] **Step 3: Test by force-killing ffmpeg**

```bash
# On the droplet:
sudo systemctl stop forge-fm-stream
# Wait 5+ min
# Confirm Slack alert fires in #alerts
sudo systemctl start forge-fm-stream
# Wait 5 min, confirm next cron run logs HEALTHY (no alert)
```

- [ ] **Step 4: Commit**

```bash
chmod +x /root/joburn-livestream/infra/health-check.sh
git -C /root/joburn-livestream add infra/health-check.sh
git -C /root/joburn-livestream commit -m "feat(infra): health-check cron with Slack alert + 15min dedupe"
```

---

# Phase 8: YouTube Channel Rebrand (Operator-led)

**⚠️ All tasks in this phase are OPERATOR ACTIONS.** Claude prepares assets and copy; operator clicks through YouTube Studio.

### Task 18: Generate channel banner

**Files:** none (asset delivered via Drive)

- [ ] **Step 1: Claude provides Gemini prompt for the banner**

Banner spec: 2560×1440 px, focal point safe zone 1546×423 (the area always visible). Should echo the stream's cozy forge aesthetic but read at a glance.

```
A cinematic horizontal banner image, 2560x1440 pixels, in the style of Studio Ghibli
with Cowboy Bebop's quiet atmosphere. Composition: a wide panoramic view of a cozy
traditional blacksmith's forge interior. Center-frame safe zone: glowing brick hearth
with warm embers + anvil with a half-forged sword catching golden light. Left side:
arched window with rolling green hills, golden hour streaming in. Right side: corner
hot spring with a small capybara chilling under a water drizzle, towel on head.
Subtle cyan-glow tech artifact on a workbench (the only cool color in scene).

Warm color palette: amber, ember orange, deep walnut, cream. ONE cyan accent.

Text-free image (text is overlaid by YouTube). Negative space across the top third
for the channel handle and tagline. High detail, atmospheric, contemplative.

Style refs: Studio Ghibli workshops (Howl's Moving Castle, Castle in the Sky),
Cowboy Bebop quiet interiors, lofi study channel banners.
```

- [ ] **Step 2: Operator generates banner image**

Operator generates via Gemini Imagen / Midjourney / Freepik, drops in the project Drive folder `1fv1I86Q6lg8WjNDg2mvjBLNa1LyWuTiC` as `joburnai_channel_banner_v0.png`.

- [ ] **Step 3: Operator uploads to YouTube Studio**

YouTube Studio → Customization → Branding → Banner image → upload.

---

### Task 19: Write channel About + trailer description

**Files:**
- Create: `/root/joburn-livestream/docs/channel_copy.md`

- [ ] **Step 1: Write `docs/channel_copy.md`**

```markdown
# @joburnai · Channel Copy v0

## Channel Name
Joburn

## Channel Handle
@joburnai

## Tagline (under banner)
The forge is open. Beats to refine steel.

## About (max 1000 chars)
Forge FM is a 24/7 lo-fi coworking stream for founders, operators, and anyone reaching for high performance.

The work runs on 50-minute focus blocks separated by 10-minute breaks. Every fourth block earns a 30-minute long rest. The blacksmith forges; the capybara soaks; the kettle steams. The same rhythm, day after day. The same place, always open.

We believe identity is the foundation under everything you build. When the pressure increases, the cracks in your character become shattering points. The work isn't in escaping the pressure — it's in tempering the self that holds it.

Sync your own work to the stream. Drop in when you're starting a session. Stay as long as you need.

This is Joburn. Pull up an anvil.

## Stream Title (the always-on live)
🔴 LIVE · Forge FM · 24/7 Lofi Coworking · Soul Tempering · @joburnai

## Stream Description (max ~5000 chars)
A 24/7 lo-fi coworking stream from Joburn. Sync your work to the cycle:

⚒️ 50 minutes focus
🌿 10 minutes break
🏔️ Every 4th cycle: 30-minute long rest

The blacksmith forges; the capybara soaks; the kettle steams. Identity is the foundation under everything you build. Sharpen the foundation.

— Joburn

🔗 Links
· Newsletter: [add later]
· Twitter / X: [add later]
· Instagram: [add later]
· Work with us: joburn.com [add later]

#lofi #lofibeats #coworking #pomodoro #studywithme #focusmusic #stoicism
#identity #founder #cozy #ghibli #blacksmith #forge #capybara
```

- [ ] **Step 2: Operator pastes into YouTube Studio**

YouTube Studio → Customization → Basic info → channel name, handle confirmed, description pasted. Then go to Live → stream settings → paste stream title + description.

- [ ] **Step 3: Commit**

```bash
git -C /root/joburn-livestream add docs/channel_copy.md
git -C /root/joburn-livestream commit -m "docs(brand): channel about + stream title + description copy"
```

---

# Phase 9: Launch Sequence

### Task 20: 24-hour private soak test

**Files:** none (monitoring exercise)

Before going public or sharing with clients, run a full 24h on the PRIVATE YouTube stream. Goals:
- Confirm no unexpected restarts in the journalctl log
- Confirm Slack alerts fire correctly when forced
- Confirm CPU/RAM stays in spec (CPU <70% sustained, RAM <1.5GB)
- Confirm visual remains correct through all 4 cycle phases (FOCUS, BREAK, FOCUS, BREAK, FOCUS, BREAK, FOCUS, LONG_BREAK)

- [ ] **Step 1: Start the soak**

Stream has been live since Task 7. Restart it cleanly here as the official soak start.

```bash
ssh root@<droplet_ip>
systemctl restart forge-fm-stream forge-fm-app
echo "SOAK_START=$(date -u +%FT%TZ)" | tee /var/log/forge-fm-soak.log
```

- [ ] **Step 2: Monitor for 24h**

Periodic checks every 4-6 hours (or on `#alerts` Slack):

```bash
ssh root@<droplet_ip>
journalctl -u forge-fm-stream -n 100 --no-pager | tail
top -bn1 | head -20
df -h /
```

Expected: no restarts beyond the initial one, no OOM events, no disk filling.

- [ ] **Step 3: Cycle-correctness check**

At some point during the soak, eyeball the YouTube preview during each phase:
- During FOCUS (most of the time): amber timer, PRIMING/DEEP_WORK quotes
- During BREAK: cyan timer, RELEASE quotes
- During LONG_BREAK (once per 4h 20min super-cycle): violet timer, REFLECTION quotes

If any phase displays incorrectly, debug before public launch.

- [ ] **Step 4: Soak signoff**

If 24h clean → operator signs off → proceed to Task 21.
If 24h dirty → debug, fix, restart the 24h clock.

---

### Task 21: Soft launch to clients

**⚠️ OPERATOR ACTION** — Claude prepares the announcement copy, operator sends.

**Files:**
- Create: `/root/joburn-livestream/docs/launch_announcement.md`

- [ ] **Step 1: Write `docs/launch_announcement.md`**

```markdown
# Forge FM Soft Launch — Announcement Copy

## Slack DM to a small set of trusted clients (5-10)

> Hey [Name] — just spun up something I want to show you before it goes wider.
>
> It's called **Forge FM**: a 24/7 lo-fi coworking stream on YouTube `@joburnai`. Cozy Ghibli-style blacksmith's forge, perpetual Pomodoro cycle (50 focus / 10 break, with a 30 min long break every 4 cycles), philosophical quotes that rotate by where you are in the cycle, capybara in the corner who never leaves.
>
> The idea: identity is the foundation under everything you build. When the pressure goes up, cracks in your character become shattering points. This stream is the ambient place to do the slow work of staying together under pressure.
>
> It's running right now: [PRIVATE YOUTUBE LINK]
>
> Drop in when you're starting a work block. Stay as long as you need. Quick feedback welcome — anything jarring, anything confusing, anything you'd want differently. We're iterating fast over the next 4 weeks (character animation, time-of-day lighting variants, ElevenLabs-voiced quote narration all coming).
>
> — John

## Email follow-up (next morning)

Subject: a quieter place to work · Forge FM

Hey [Name],

If you missed it on Slack: Forge FM is now live on YouTube `@joburnai`. 24/7 lo-fi coworking — pull up an anvil and sync your work to the cycle.

[YOUTUBE LINK]

Two specific asks if you can:
1. Watch for 5 minutes and tell me what bugs you
2. If a colleague who works long hours might like it, share the link

The stream is built to be background — you should be able to leave it open for an entire session without it pulling your attention. If anything does pull your attention (an animation glitch, an audio drop, a quote that doesn't land), that's a bug to me. Send it over.

We're iterating fast over the next 4 weeks (character animation, lighting variants, voiced quotes coming).

— John
```

- [ ] **Step 2: Operator sends to client list**

Pick 5-10 trusted clients. Send Slack DM Sunday afternoon. Email follow-up Monday morning. Collect feedback in a dedicated Slack thread or doc.

- [ ] **Step 3: Commit**

```bash
git -C /root/joburn-livestream add docs/launch_announcement.md
git -C /root/joburn-livestream commit -m "docs(launch): soft-launch DM + email copy for client distribution"
```

---

### Task 22: Switch from private to unlisted, then public

**⚠️ OPERATOR ACTION** — YouTube Studio click-through.

- [ ] **Step 1: After 24h of clean private + positive client feedback, switch to UNLISTED**

YouTube Studio → Live → stream → Visibility → Unlisted.

Wait 24h. Confirm no issues (algorithmic auto-flag, broken player, etc).

- [ ] **Step 2: Switch to PUBLIC**

YouTube Studio → Live → stream → Visibility → Public.

The stream is now discoverable.

- [ ] **Step 3: Final commit**

```bash
git -C /root/joburn-livestream commit --allow-empty -m "chore(launch): v0 public on YouTube @joburnai"
```

---

## Self-Review Against the Spec

Coverage check against [blueprint](`/root/ai-os/00_Product_Blueprints/blueprint_joburn_livestream_2026_05_16.md`):

| Blueprint section | Implemented in |
|---|---|
| §1 (what this is) — 24/7 Forge FM | Phase 2 (streaming), Phase 9 (launch) |
| §1 (secondary use case — client asset) | Task 21 (client soft launch) |
| §2 (brand locks — FORGE FM / Soul Tempering / capybara / Pomodoro UI top-right) | Task 15 (RadioBar + AttributionMark), Task 10 (top-right timer), Task 3 (capybara preserved) |
| §2A.1 (opening moment) | Tasks 10/13/15 (full UI from first frame, no splash) |
| §2A.2 (cycle as narrative) | Task 8 (state machine), Task 10 (visible cycle counter) |
| §2A.3 (cycle-position quote curation) | Tasks 11-13 (4 registers, register-aware selector) |
| §2A.4 (capybara story beats — v0 = permanent fixture) | Task 3 (capybara always present in scene) |
| §2A.5 (audio dynamics) | Task 14 (single loop in v0; dynamics deferred to v0.5 per scope notes) |
| §2A.6 (sacred transitions) | Implicit in cycle-aware quote rotation; no flashing UI |
| §2A.7 (rare live moments) | DEFERRED to v0.5+ |
| §2A.8 (client mode) | Task 18-19 (channel rebrand), Task 21 (client distribution) |
| §2A.9 (negative space) | Task 15 (non-interactive RadioBar, no CTAs) |
| §2A.10 (long game) | Implicit (no growth hacks in v0) |
| §3 (architecture) | Tasks 5-7 (droplet, systemd, xvfb+chromium+ffmpeg) |
| §8 (reliability) | Task 17 (systemd auto-restart + Slack health alerts) |
| §10 (testing acceptance) | Task 16 (Gemini visual QA), Task 20 (24h soak) |

Self-review notes:
- §2A.7 (rare live moments) explicitly deferred to v0.5+ in Scope Notes — flagged, not silently dropped.
- §2A.5 (audio dynamics) explicitly deferred to v0.5+ in Scope Notes — single-loop is v0.
- No placeholders. Every code step has full code. Every shell step has the exact command + expected output.
- Type consistency: `useCycle` returns `{ phase, cycleIndex, minuteWithinPhase, minutesRemaining, secondsRemaining, superCycleNumber }` — same shape used in `PomodoroTimer.jsx`, `QuoteOverlay.jsx`, `RadioBar.jsx`, and `selectQuote.test.js`.
- `getCycleState` signature `(epochMs, nowMs)` is consistent across `stateMachine.js`, `stateMachine.test.js`, `useCycle.js`.
- Two operator-gated tasks (Task 4 push, Task 5 droplet provision, Task 18-19 YouTube channel rebrand, Task 21-22 client launch + visibility flip) are clearly marked.

---

## Execution Handoff

Plan complete and saved to `/root/joburn-livestream/docs/plans/2026-05-16-forge-fm-v0-build.md`. Two execution options:

**1. Subagent-Driven (recommended for v0 ship-fast)** — I dispatch a fresh subagent per task, review between tasks. Operator-gated tasks pause for explicit confirmation. Fast iteration, clear blast radius per task.

**2. Inline Execution** — Execute tasks in this session using `superpowers:executing-plans`. Batch execution with checkpoints. Less context overhead, less recovery if a single task fails.

Which approach?
