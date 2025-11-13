#!/bin/bash
set -e
echo "BeforeInstall: cleaning old files"
# backup or cleanup previous deploy
rm -rf /home/ubuntu/fleet-app_old || true
if [ -d /home/ubuntu/fleet-app ]; then
  mv /home/ubuntu/fleet-app /home/ubuntu/fleet-app_old || true
fi
mkdir -p /home/ubuntu/fleet-app
