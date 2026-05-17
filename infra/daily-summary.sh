#!/usr/bin/env bash
# infra/daily-summary.sh
# Sends a daily Forge FM health + stats summary to Slack #alerts.
# Cron at 14:00 UTC (= 9am EST winter / 10am EDT summer).
set -euo pipefail

source /opt/forge-fm/app/.env

# Service status
APP_STATUS=$(systemctl is-active forge-fm-app)
STREAM_STATUS=$(systemctl is-active forge-fm-stream)

# Process check
FFMPEG_PID=$(pgrep -f "ffmpeg.*flv.*youtube" | head -1 || echo "")
CHROME_PID=$(pgrep -f "google-chrome.*kiosk" | head -1 || echo "")

# Stream uptime (since forge-fm-stream service started)
STREAM_UPTIME=$(systemctl show forge-fm-stream --property=ActiveEnterTimestamp --value)
if [ -n "$STREAM_UPTIME" ]; then
  STREAM_START_UNIX=$(date -d "$STREAM_UPTIME" +%s 2>/dev/null || echo 0)
  NOW_UNIX=$(date +%s)
  UPTIME_HOURS=$(( (NOW_UNIX - STREAM_START_UNIX) / 3600 ))
  UPTIME_DAYS=$(( UPTIME_HOURS / 24 ))
  UPTIME_REMAINDER=$(( UPTIME_HOURS % 24 ))
else
  UPTIME_DAYS=0; UPTIME_REMAINDER=0
fi

# Restart count (catches transient drops the 5-min cron may have alerted on)
RESTART_COUNT=$(journalctl -u forge-fm-stream --since "24 hours ago" 2>/dev/null | grep -c "Started forge-fm-stream" || echo 0)

# System resources
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | tr -d ' ')
MEM_USED_MB=$(free -m | awk '/^Mem:/{print $3}')
MEM_TOTAL_MB=$(free -m | awk '/^Mem:/{print $2}')
DISK_USED_PCT=$(df -h / | awk 'NR==2{print $5}')

# Verdict
if [ "$APP_STATUS" = "active" ] && [ "$STREAM_STATUS" = "active" ] && [ -n "$FFMPEG_PID" ] && [ -n "$CHROME_PID" ]; then
  EMOJI=":fire:"
  VERDICT="HEALTHY"
else
  EMOJI=":warning:"
  VERDICT="DEGRADED"
fi

# Compose message
read -r -d '' MSG <<EOF || true
${EMOJI} *Forge FM daily summary* — ${VERDICT}

*Stream uptime:* ${UPTIME_DAYS}d ${UPTIME_REMAINDER}h since last restart
*Restart count (24h):* ${RESTART_COUNT}
*Load avg (1m):* ${LOAD_AVG} (4 vCPUs available)
*Memory:* ${MEM_USED_MB} / ${MEM_TOTAL_MB} MB used
*Disk:* ${DISK_USED_PCT} of root partition

*Service status:*
• forge-fm-app: ${APP_STATUS}
• forge-fm-stream: ${STREAM_STATUS}
• ffmpeg pid: ${FFMPEG_PID:-MISSING}
• chrome pid: ${CHROME_PID:-MISSING}

Watch live: https://youtube.com/@joburnai
EOF

# Send
curl -s -X POST -H 'Content-Type: application/json' \
  --data "{\"text\": $(printf '%s' "$MSG" | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))')}" \
  "$SLACK_WEBHOOK_URL" >/dev/null

# Log locally
echo "[$(date -u +%FT%TZ)] daily summary sent: $VERDICT" >> /var/log/forge-fm-daily.log
