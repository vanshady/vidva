#!/bin/bash

# Build the Docker image
docker build -t vidva .

# Remove any existing container
docker rm -f vidva 2>/dev/null || true

# Run the container
docker run -d \
  -p 3000:3000 \
  --name vidva \
  vidva

# Follow the logs
docker logs -f vidva 