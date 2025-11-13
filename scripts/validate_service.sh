#!/bin/bash
set -e
# simple healthcheck: waiting for port 3000 to respond
HOST="127.0.0.1"
PORT=3000
MAX_RETRIES=10
COUNT=0
until nc -z $HOST $PORT || [ $COUNT -ge $MAX_RETRIES ]; do
  echo "Waiting for service on $HOST:$PORT..."
  COUNT=$((COUNT+1))
  sleep 3
done

if nc -z $HOST $PORT; then
  echo "Service is up"
  exit 0
else
  echo "Service failed to start"
  exit 1
fi
