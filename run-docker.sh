#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found"
  exit 1
fi

# Build the Docker image
docker build -t vidva .

# Remove any existing container
docker rm -f vidva 2>/dev/null || true

# Run the container
docker run -d \
  -p 5173:5173 \
  --name vidva \
  -e PLEX_SERVER_URL="${PLEX_SERVER_URL}" \
  -e PLEX_TOKEN="${PLEX_TOKEN}" \
  -e PLEX_SERVER_ID="${PLEX_SERVER_ID}" \
  vidva

# Follow the logs
docker logs -f vidva 