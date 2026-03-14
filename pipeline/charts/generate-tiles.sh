#!/usr/bin/env bash
set -euo pipefail

# Generate PMTiles from GeoJSON using Tippecanoe
# Combines all nautical layers into a single PMTiles file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="${SCRIPT_DIR}/../tmp"
GEOJSON_DIR="${TMP_DIR}/geojson"
OUTPUT_FILE="${TMP_DIR}/nautical-charts.pmtiles"

log() {
  echo "[charts:tiles] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
}

log "Starting PMTiles generation from GeoJSON layers"

# Verify input files exist
if [[ -z "$(find "${GEOJSON_DIR}" -name "*.geojson" -type f 2>/dev/null)" ]]; then
  log "ERROR: No GeoJSON files found in ${GEOJSON_DIR}"
  exit 1
fi

# Build tippecanoe arguments with named layers
TIPPECANOE_ARGS=(
  "--output=${OUTPUT_FILE}"
  "--force"
  "--minimum-zoom=2"
  "--maximum-zoom=14"
  "--drop-densest-as-needed"
  "--extend-zooms-if-still-dropping"
)

while IFS= read -r geojson_file; do
  LAYER_NAME=$(basename "${geojson_file}" .geojson)
  TIPPECANOE_ARGS+=("--named-layer=${LAYER_NAME}:${geojson_file}")
  log "  Adding layer: ${LAYER_NAME}"
done < <(find "${GEOJSON_DIR}" -name "*.geojson" -type f)

log "Running tippecanoe with zoom range 2-14..."
tippecanoe "${TIPPECANOE_ARGS[@]}"

# Verify output
if [[ ! -s "${OUTPUT_FILE}" ]]; then
  log "ERROR: PMTiles file was not generated or is empty"
  exit 1
fi

FILE_SIZE=$(stat -c%s "${OUTPUT_FILE}" 2>/dev/null || stat -f%z "${OUTPUT_FILE}")
log "PMTiles generated: $(( FILE_SIZE / 1024 / 1024 )) MB"
log "Output: ${OUTPUT_FILE}"
