#!/bin/bash
set -e
cd /home/ubuntu/fleet-app

# Stop pm2 app if exists
if pm2 id fleet-tracking > /dev/null 2>&1; then
  pm2 stop fleet-tracking || true
  pm2 delete fleet-tracking || true
fi

# Start with pm2; make sure entry file points to dist/main.js or similar
pm2 start dist/main.js --name fleet-tracking --time
pm2 save
