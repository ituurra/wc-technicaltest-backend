#!/bin/sh
set -e

LOCK_MARKER="/app/node_modules/.package-lock-checksum"
LOCK_SUM=$(cksum package-lock.json 2>/dev/null | awk '{print $1}')
if [ ! -d "node_modules" ] || [ ! -f "$LOCK_MARKER" ] || [ "$(cat "$LOCK_MARKER" 2>/dev/null)" != "$LOCK_SUM" ]; then
  npm ci
  mkdir -p "$(dirname "$LOCK_MARKER")"
  echo "$LOCK_SUM" > "$LOCK_MARKER"
fi

exec "$@"
