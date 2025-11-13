#!/bin/bash
set -e
cd /home/ubuntu/fleet-app

echo "AfterInstall: installing node modules for production"
# ensure node is available. If using nvm or docker, adapt.
npm ci --only=production
