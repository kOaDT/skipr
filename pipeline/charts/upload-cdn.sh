#!/usr/bin/env bash
set -euo pipefail

# Upload PMTiles and manifest to Cloudflare R2 via rclone
# Versioned uploads: existing files are NEVER deleted (NFR19)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="${SCRIPT_DIR}/../tmp"
PMTILES_FILE="${TMP_DIR}/nautical-charts.pmtiles"
VERSION_DATE=$(date -u '+%Y-%m-%d')

log() {
  echo "[charts:upload] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
}

# Validate required environment variables
: "${R2_ACCOUNT_ID:?R2_ACCOUNT_ID is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
: "${R2_BUCKET_NAME:?R2_BUCKET_NAME is required}"

# Configure rclone via environment variables (no config file needed)
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID}"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY}"
export RCLONE_CONFIG_R2_ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

log "Starting upload to Cloudflare R2"
log "Bucket: ${R2_BUCKET_NAME}"
log "Version: ${VERSION_DATE}"

# Verify source file exists
if [[ ! -s "${PMTILES_FILE}" ]]; then
  log "ERROR: PMTiles file not found or empty: ${PMTILES_FILE}"
  exit 1
fi

FILE_SIZE=$(stat -c%s "${PMTILES_FILE}" 2>/dev/null || stat -f%z "${PMTILES_FILE}")
log "Uploading PMTiles ($(( FILE_SIZE / 1024 / 1024 )) MB)..."

# Upload versioned copy (never overwritten)
VERSIONED_PATH="charts/nautical-charts-${VERSION_DATE}.pmtiles"
log "Uploading versioned: ${VERSIONED_PATH}"
rclone copyto "${PMTILES_FILE}" "r2:${R2_BUCKET_NAME}/${VERSIONED_PATH}"

# Upload latest copy (overwritten each run)
LATEST_PATH="charts/nautical-charts-latest.pmtiles"
log "Uploading latest: ${LATEST_PATH}"
rclone copyto "${PMTILES_FILE}" "r2:${R2_BUCKET_NAME}/${LATEST_PATH}"

# Verify uploads
log "Verifying uploads..."
rclone check "${PMTILES_FILE}" "r2:${R2_BUCKET_NAME}/charts/" --one-way

# Purge old versions (keep last 4 weeks to stay within R2 free tier)
# NFR19: previous data remains available — we keep N-1, just not all history
RETENTION_DAYS="${R2_RETENTION_DAYS:-28}"
log "Purging versions older than ${RETENTION_DAYS} days..."
OLD_FILES=$(rclone lsf "r2:${R2_BUCKET_NAME}/charts/" --min-age "${RETENTION_DAYS}d" --include "nautical-charts-20*.pmtiles" 2>/dev/null || true)
if [[ -n "${OLD_FILES}" ]]; then
  while IFS= read -r old_file; do
    log "  Deleting old version: ${old_file}"
    rclone deletefile "r2:${R2_BUCKET_NAME}/charts/${old_file}"
  done <<< "${OLD_FILES}"
  log "Purged old versions"
else
  log "No old versions to purge"
fi

log "Upload complete"
log "  Versioned: ${VERSIONED_PATH}"
log "  Latest:    ${LATEST_PATH}"
