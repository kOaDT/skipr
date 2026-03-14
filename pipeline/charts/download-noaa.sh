#!/usr/bin/env bash
set -euo pipefail

# Download NOAA Electronic Navigational Charts (ENC) in S-57 format
# Source: https://charts.noaa.gov/ENCs/All_ENCs.zip
# License: Public domain (US Government Work)
# Update frequency: Weekly (every Thursday)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="${SCRIPT_DIR}/../tmp"
OUTPUT_DIR="${TMP_DIR}/noaa-enc"
NOAA_URL="https://charts.noaa.gov/ENCs/All_ENCs.zip"
ZIP_FILE="${TMP_DIR}/All_ENCs.zip"

log() {
  echo "[charts:download] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
}

log "Starting NOAA ENC download"
log "URL: ${NOAA_URL}"

# Create directories
mkdir -p "${TMP_DIR}"
mkdir -p "${OUTPUT_DIR}"

# Download the ENC archive
log "Downloading All_ENCs.zip (~2.5 GB compressed)..."
curl -fSL --retry 3 --retry-delay 10 -o "${ZIP_FILE}" "${NOAA_URL}"

# Verify download (file must exist and be > 0 bytes)
if [[ ! -s "${ZIP_FILE}" ]]; then
  log "ERROR: Downloaded file is empty or missing"
  exit 1
fi

FILE_SIZE=$(stat -c%s "${ZIP_FILE}" 2>/dev/null || stat -f%z "${ZIP_FILE}")
log "Download complete: $(( FILE_SIZE / 1024 / 1024 )) MB"

# Verify it's a valid zip file
if ! unzip -t "${ZIP_FILE}" > /dev/null 2>&1; then
  log "ERROR: Downloaded file is not a valid ZIP archive"
  exit 1
fi

# Extract S-57 files
log "Extracting ENC data to ${OUTPUT_DIR}..."
unzip -o -q "${ZIP_FILE}" -d "${OUTPUT_DIR}"

# Count extracted .000 files (S-57 format)
S57_COUNT=$(find "${OUTPUT_DIR}" -name "*.000" | wc -l)
log "Extracted ${S57_COUNT} S-57 chart files"

if [[ "${S57_COUNT}" -eq 0 ]]; then
  log "ERROR: No S-57 files found after extraction"
  exit 1
fi

# Capture NOAA source date from HTTP Last-Modified header for manifest accuracy
NOAA_SOURCE_DATE=$(curl -sI "${NOAA_URL}" | grep -i "last-modified" | sed 's/[Ll]ast-[Mm]odified: //' | xargs -I{} date -u -d "{}" '+%Y-%m-%d' 2>/dev/null || echo "")
if [[ -n "${NOAA_SOURCE_DATE}" ]]; then
  echo "${NOAA_SOURCE_DATE}" > "${TMP_DIR}/noaa-source-date.txt"
  log "NOAA source date: ${NOAA_SOURCE_DATE}"
fi

# Clean up zip file to save disk space
rm -f "${ZIP_FILE}"
log "Cleaned up ZIP archive"

log "NOAA ENC download complete. ${S57_COUNT} charts ready for conversion."
