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
