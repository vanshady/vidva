#!/bin/sh

# Support PLEX_URL as alias for PLEX_SERVER_URL (e.g. Synology Container Manager uses PLEX_URL)
# The built app contains the placeholder "PLEX_SERVER_URL"; replace it when PLEX_URL is set.
if [ -n "$PLEX_URL" ]; then
  find /app/dist -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|PLEX_SERVER_URL|$PLEX_URL|g" '{}' +
fi

# This script replaces the environment variables in the dist folder, specifically ones starting with PLEX_ or DEFAULT_
for prefix in "PLEX_" "VIDVA_DEFAULT_"
do
    for i in $(env | grep $prefix)
    do
        key=$(echo $i | cut -d '=' -f 1)
        value=$(echo $i | cut -d '=' -f 2-)
        # echo $key=$value
        # sed All files
        # find /app/dist -type f -exec sed -i "s|${key}|${value}|g" '{}' +

        # sed JS and CSS only
        find /app/dist -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
    done
done

exec "$@"
