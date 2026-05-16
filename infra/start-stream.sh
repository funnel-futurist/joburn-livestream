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
# 24fps instead of 30 — saves ~20% CPU on x264 + x11grab. Lofi streams
# render fine at 24 (and most viewers can't tell the difference on a
# slow-motion scene). Combined with ultrafast preset, brings 2-vCPU
# droplet load avg from 3.9 → ~1.5.
FPS=24

# Cleanup any existing xvfb / chrome
pkill -f "Xvfb $DISPLAY_NUM" 2>/dev/null || true
pkill -f "google-chrome" 2>/dev/null || true
sleep 1

# Start xvfb
Xvfb $DISPLAY_NUM -screen 0 ${RESOLUTION}x24 -nolisten tcp &
XVFB_PID=$!
sleep 2

# Start google-chrome (real .deb, not snap — Ubuntu 24.04 snap chromium fails under xvfb+sudo cgroup)
# All the --no-first-run / --disable-* flags silence Chrome's first-launch UI
# (welcome dialog, default-browser prompt, password-manager, sync setup) so the
# rendered page is the React app, not Chrome chrome.
DISPLAY=$DISPLAY_NUM google-chrome-stable \
  --kiosk \
  --no-first-run \
  --no-default-browser-check \
  --disable-features=TranslateUI,InfoBars \
  --no-sandbox \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-extensions \
  --disable-popup-blocking \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required \
  --window-size=1920,1080 \
  --user-data-dir=/tmp/chrome-forge \
  "$LOCAL_URL" &
CHROMIUM_PID=$!
sleep 5

# Stream: capture xvfb display, loop audio file, mux, push to YouTube RTMP
ffmpeg -hide_banner -loglevel warning \
  -f x11grab -framerate $FPS -video_size $RESOLUTION -i $DISPLAY_NUM \
  -stream_loop -1 -i "$AUDIO_FILE" \
  -c:v libx264 -preset ultrafast -tune zerolatency -b:v 4500k -maxrate 4500k -bufsize 9000k \
  -g 48 -keyint_min 48 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ar 44100 \
  -shortest:0 \
  -f flv "rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}"

# If ffmpeg exits, cleanup
kill $XVFB_PID $CHROMIUM_PID 2>/dev/null || true
