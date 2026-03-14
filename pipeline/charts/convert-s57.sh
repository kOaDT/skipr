#!/usr/bin/env bash
set -euo pipefail

# Convert NOAA S-57 ENC files to GeoJSON using ogr2ogr (GDAL)
# Extracts nautical layers relevant for navigation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="${SCRIPT_DIR}/../tmp"
INPUT_DIR="${TMP_DIR}/noaa-enc"
OUTPUT_DIR="${TMP_DIR}/geojson"

# S-57 layers to extract for navigation
LAYERS=(
  "DEPARE"   # Depth areas (bathymetric coloring)
  "DEPCNT"   # Depth contours
  "SOUNDG"   # Soundings (depth points)
  "BOYLAT"   # Buoys
  "BCNSPP"   # Beacons
  "LIGHTS"   # Lights
  "WRECKS"   # Wrecks (danger)
  "OBSTRN"   # Obstructions (danger)
  "UWTROC"   # Underwater rocks (danger)
  "COALNE"   # Coastline
  "LNDARE"   # Land areas
  "LNDRGN"   # Land regions
)

# Mapping S-57 layer names to PMTiles-friendly names
declare -A LAYER_NAMES=(
  ["DEPARE"]="depth_areas"
  ["DEPCNT"]="depth_contours"
  ["SOUNDG"]="soundings"
  ["BOYLAT"]="buoys"
  ["BCNSPP"]="beacons"
  ["LIGHTS"]="lights"
  ["WRECKS"]="wrecks"
  ["OBSTRN"]="obstructions"
  ["UWTROC"]="underwater_rocks"
  ["COALNE"]="coastline"
  ["LNDARE"]="land_areas"
  ["LNDRGN"]="land_regions"
)

log() {
  echo "[charts:convert] $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
}

log "Starting S-57 to GeoJSON conversion"

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Enable all S-57 attributes
export OGR_S57_OPTIONS="RETURN_PRIMITIVES=ON,RETURN_LINKAGES=ON,LNAM_REFS=ON"
export S57_PROFILE=ALL

# Find all S-57 files
S57_COUNT=$(find "${INPUT_DIR}" -name "*.000" -type f | wc -l)
log "Found ${S57_COUNT} S-57 files to process"

CURRENT=0
CONVERSION_ERRORS=0
while IFS= read -r s57_file; do
  CURRENT=$((CURRENT + 1))
  BASENAME=$(basename "${s57_file}")

  for layer in "${LAYERS[@]}"; do
    OUTPUT_NAME="${LAYER_NAMES[$layer]}"
    OUTPUT_FILE="${OUTPUT_DIR}/${OUTPUT_NAME}.geojson"

    # Check if this S-57 file contains the layer
    if ogrinfo -q "${s57_file}" "${layer}" > /dev/null 2>&1; then
      if [[ -f "${OUTPUT_FILE}" ]]; then
        # Append to existing GeoJSON
        if ! ogr2ogr -f GeoJSON -append \
          -t_srs EPSG:4326 \
          "${OUTPUT_FILE}" \
          "${s57_file}" \
          "${layer}" 2>/dev/null; then
          log "WARNING: Failed to append ${layer} from ${BASENAME}"
          CONVERSION_ERRORS=$((CONVERSION_ERRORS + 1))
        fi
      else
        # Create new GeoJSON
        if ! ogr2ogr -f GeoJSON \
          -t_srs EPSG:4326 \
          "${OUTPUT_FILE}" \
          "${s57_file}" \
          "${layer}" 2>/dev/null; then
          log "WARNING: Failed to convert ${layer} from ${BASENAME}"
          CONVERSION_ERRORS=$((CONVERSION_ERRORS + 1))
        fi
      fi
    fi
  done

  if (( CURRENT % 100 == 0 )); then
    log "Processing ${CURRENT}/${S57_COUNT}: ${BASENAME}"
  fi
done < <(find "${INPUT_DIR}" -name "*.000" -type f)

if [[ "${CONVERSION_ERRORS}" -gt 0 ]]; then
  log "WARNING: ${CONVERSION_ERRORS} conversion errors encountered (non-critical layers may be missing)"
fi

log "Conversion complete. Verifying output..."

# Report on generated GeoJSON files
TOTAL_LAYERS=0
for layer in "${LAYERS[@]}"; do
  OUTPUT_NAME="${LAYER_NAMES[$layer]}"
  OUTPUT_FILE="${OUTPUT_DIR}/${OUTPUT_NAME}.geojson"
  if [[ -f "${OUTPUT_FILE}" ]]; then
    FILE_SIZE=$(stat -c%s "${OUTPUT_FILE}" 2>/dev/null || stat -f%z "${OUTPUT_FILE}")
    log "  ${OUTPUT_NAME}.geojson: $(( FILE_SIZE / 1024 )) KB"
    TOTAL_LAYERS=$((TOTAL_LAYERS + 1))
  else
    log "  ${OUTPUT_NAME}.geojson: NOT GENERATED (layer may not exist in source data)"
  fi
done

if [[ "${TOTAL_LAYERS}" -eq 0 ]]; then
  log "ERROR: No GeoJSON layers were generated"
  exit 1
fi

log "Generated ${TOTAL_LAYERS} GeoJSON layers in ${OUTPUT_DIR}"
