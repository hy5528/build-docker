#!/bin/sh
set -e

# Create directories inside the volume if they don't exist.
mkdir -p /data/logs
mkdir -p /data/uploads

# Copy default config and db from the staging area if they don't exist in the volume.
# The `-n` flag (no-clobber) ensures we don't overwrite existing files.
cp -n /defaults/config.yaml /data/config.yaml || true
cp -n /defaults/music.db /data/music.db || true

# Execute the main command (supervisord)
exec "$@"