#!/bin/bash

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  migrate-neon-to-supabase.sh --source <NEON_DATABASE_URL> --target <SUPABASE_DATABASE_URL> [--dry-run]

Options:
  --source   Source PostgreSQL URL (Neon)
  --target   Target PostgreSQL URL (Supabase)
  --dry-run  Print planned actions without executing migration
USAGE
}

SOURCE_URL=""
TARGET_URL=""
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE_URL="$2"
      shift 2
      ;;
    --target)
      TARGET_URL="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$SOURCE_URL" || -z "$TARGET_URL" ]]; then
  echo "Both --source and --target are required." >&2
  usage
  exit 1
fi

for cmd in pg_dump psql; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command not found: $cmd" >&2
    exit 1
  fi
done

TMP_DUMP="$(mktemp /tmp/neon-data-XXXXXX.sql)"

cleanup() {
  rm -f "$TMP_DUMP"
}
trap cleanup EXIT

echo "Preparing Neon -> Supabase migration"
echo "Source: $SOURCE_URL"
echo "Target: $TARGET_URL"
echo "Dry run: $DRY_RUN"

if [[ "$DRY_RUN" == "true" ]]; then
  cat <<EOF
Planned steps:
1. Export data from source:
   pg_dump --data-only --no-owner --no-privileges "$SOURCE_URL" > $TMP_DUMP
2. Import data into target:
   psql "$TARGET_URL" < $TMP_DUMP
3. Reset serial sequences for known tables (media, donations)
4. Compare row counts (media, donations)
EOF
  exit 0
fi

echo "Reading source row counts..."
SOURCE_MEDIA_COUNT="$(psql "$SOURCE_URL" -Atc "SELECT COUNT(*) FROM media;")"
SOURCE_DONATIONS_COUNT="$(psql "$SOURCE_URL" -Atc "SELECT COUNT(*) FROM donations;")"

echo "Exporting source data..."
pg_dump --data-only --no-owner --no-privileges "$SOURCE_URL" > "$TMP_DUMP"

echo "Importing data into target..."
psql "$TARGET_URL" < "$TMP_DUMP"

echo "Resetting sequences on target..."
psql "$TARGET_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT setval(pg_get_serial_sequence('media', 'id'), COALESCE((SELECT MAX(id) FROM media), 1), true);
SELECT setval(pg_get_serial_sequence('donations', 'id'), COALESCE((SELECT MAX(id) FROM donations), 1), true);
SQL

echo "Reading target row counts..."
TARGET_MEDIA_COUNT="$(psql "$TARGET_URL" -Atc "SELECT COUNT(*) FROM media;")"
TARGET_DONATIONS_COUNT="$(psql "$TARGET_URL" -Atc "SELECT COUNT(*) FROM donations;")"

echo ""
echo "Row count summary"
echo "media: source=$SOURCE_MEDIA_COUNT target=$TARGET_MEDIA_COUNT"
echo "donations: source=$SOURCE_DONATIONS_COUNT target=$TARGET_DONATIONS_COUNT"

if [[ "$SOURCE_MEDIA_COUNT" != "$TARGET_MEDIA_COUNT" || "$SOURCE_DONATIONS_COUNT" != "$TARGET_DONATIONS_COUNT" ]]; then
  echo "WARNING: row counts differ. Investigate before cutting over." >&2
  exit 1
fi

echo "Migration complete with matching row counts."
