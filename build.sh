#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  exit 1
fi

# Read .env file and convert it to --dart-define arguments
ARGS=""
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Ignore empty lines and comments
  if [[ -n "$key" && ! "$key" =~ ^# ]]; then
    ARGS+=" --dart-define=${key}=\"${value}\""
  fi
done < .env

# Build Flutter web
eval flutter build web "$ARGS"

# If --preview flag is provided, run a local preview server
if [ "$1" == "--preview" ]; then
  echo "Starting preview server at http://localhost:3000..."
  cd build/web || exit 1
  python3 -m http.server 3000
fi
