#!/bin/sh
set -eu

# PLEX_URL is accepted as an alias for PLEX_SERVER_URL (e.g. Synology Container Manager).
PLEX_SERVER_URL="${PLEX_SERVER_URL:-${PLEX_URL:-}}"
# Caddy upstreams take scheme://host:port only; drop any trailing slash.
PLEX_SERVER_URL="${PLEX_SERVER_URL%/}"

if [ -z "$PLEX_SERVER_URL" ] || [ -z "${PLEX_TOKEN:-}" ]; then
  echo "vidva: set PLEX_SERVER_URL (or PLEX_URL) and PLEX_TOKEN" >&2
  exit 1
fi

# Caddy reads these to proxy /plex/* to Plex with the token attached.
# They are never written into the bundle.
export PLEX_SERVER_URL PLEX_TOKEN

# Non-secret settings the browser needs are baked into the bundle at startup,
# replacing the placeholders from .env.production.
for key in PLEX_SERVER_ID $(env | sed -n 's/^\(VIDVA_DEFAULT_[A-Z0-9_]*\)=.*/\1/p'); do
  value=$(printenv "$key" || true)
  [ -n "$value" ] || continue
  find /app/dist -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done

exec "$@"
