#!/usr/bin/env bash
# infra/droplet-bootstrap.sh
# One-time droplet setup for Forge FM v0.
# Run on a fresh Ubuntu 24.04 droplet as root.
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
