#!/usr/bin/env bash
# Creates a consistent copy of the SQLite database and keeps the 14 newest backups.
# Usage: ./scripts/backup.sh [backup-directory]   (default: ./backups)
set -euo pipefail

BACKUP_DIR="${1:-./backups}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
TARGET="${BACKUP_DIR}/urls-${STAMP}.db"

mkdir -p "${BACKUP_DIR}"

# SQLite's online backup API gives a consistent copy even while the app is running.
docker exec urlmgmt-backend python -c "
import sqlite3
source = sqlite3.connect('/data/urls.db')
target = sqlite3.connect('/tmp/backup.db')
source.backup(target)
target.close()
source.close()
"
docker cp urlmgmt-backend:/tmp/backup.db "${TARGET}"
docker exec urlmgmt-backend rm -f /tmp/backup.db

# Keep only the 14 newest backups.
ls -1t "${BACKUP_DIR}"/urls-*.db 2>/dev/null | tail -n +15 | xargs -r rm --

echo "Backup written to ${TARGET}"
