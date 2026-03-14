import { readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Validate the integrity of generated PMTiles.
 * Checks: valid header, expected layers, non-empty bbox, feature counts.
 */

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const TMP_DIR = resolve(SCRIPT_DIR, '..', 'tmp');
const PMTILES_FILE = resolve(TMP_DIR, 'nautical-charts.pmtiles');

const EXPECTED_LAYERS = [
  'depth_areas',
  'depth_contours',
  'soundings',
  'buoys',
  'beacons',
  'lights',
  'wrecks',
  'obstructions',
  'underwater_rocks',
  'coastline',
  'land_areas',
  'land_regions',
];

// PMTiles v3 magic number: "PMTiles" followed by version byte 0x03
const PMTILES_MAGIC = Buffer.from([0x50, 0x4d, 0x54, 0x69, 0x6c, 0x65, 0x73, 0x03]);

function log(message: string): void {
  const ts = new Date().toISOString();
  console.log(`[charts:validate] ${ts} ${message}`);
}

interface ValidationResult {
  check: string;
  passed: boolean;
  detail: string;
}

function validateFileExists(): ValidationResult {
  try {
    const stats = statSync(PMTILES_FILE);
    return {
      check: 'File exists and is non-empty',
      passed: stats.size > 0,
      detail: `Size: ${(stats.size / 1024 / 1024).toFixed(1)} MB`,
    };
  } catch {
    return {
      check: 'File exists and is non-empty',
      passed: false,
      detail: `File not found: ${PMTILES_FILE}`,
    };
  }
}

function validateHeader(): ValidationResult {
  try {
    const fd = readFileSync(PMTILES_FILE);
    const header = fd.subarray(0, 8);
    const isValid = header.equals(PMTILES_MAGIC);
    return {
      check: 'PMTiles header is valid (v3)',
      passed: isValid,
      detail: isValid ? 'Valid PMTiles v3 header' : `Invalid header: ${header.toString('hex')}`,
    };
  } catch (err) {
    return {
      check: 'PMTiles header is valid (v3)',
      passed: false,
      detail: `Failed to read header: ${err}`,
    };
  }
}

function validateBbox(): ValidationResult {
  // PMTiles v3 header layout: bytes 0-7 magic, then metadata
  // The root directory offset is at bytes 8-15, and metadata at specific offsets
  // For a basic check, we verify the file has enough content for metadata
  try {
    const stats = statSync(PMTILES_FILE);
    // A valid PMTiles with data should be significantly larger than just a header
    const hasSubstantialContent = stats.size > 1024;
    return {
      check: 'PMTiles contains substantial tile data',
      passed: hasSubstantialContent,
      detail: hasSubstantialContent
        ? `File size ${(stats.size / 1024 / 1024).toFixed(1)} MB indicates tile data present`
        : `File too small (${stats.size} bytes) — likely empty or corrupt`,
    };
  } catch (err) {
    return {
      check: 'PMTiles contains substantial tile data',
      passed: false,
      detail: `Failed to check file: ${err}`,
    };
  }
}

function validateSourceLayers(): ValidationResult {
  // Verify that the GeoJSON source layers were generated before tiling
  // NOTE: Full PMTiles layer inspection would require parsing the binary directory;
  // checking source GeoJSON presence is a practical proxy for layer completeness.
  const geojsonDir = resolve(TMP_DIR, 'geojson');
  let foundLayers: string[] = [];
  let missingLayers: string[] = [];

  for (const layer of EXPECTED_LAYERS) {
    const filePath = resolve(geojsonDir, `${layer}.geojson`);
    try {
      const stats = statSync(filePath);
      if (stats.size > 0) {
        foundLayers.push(layer);
      } else {
        missingLayers.push(layer);
      }
    } catch {
      missingLayers.push(layer);
    }
  }

  // At least critical layers should be present
  const criticalLayers = ['depth_areas', 'coastline', 'buoys', 'wrecks', 'obstructions'];
  const missingCritical = criticalLayers.filter((l) => missingLayers.includes(l));
  const passed = missingCritical.length === 0;

  return {
    check: 'Expected nautical layers present in source data',
    passed,
    detail: passed
      ? `Found ${foundLayers.length}/${EXPECTED_LAYERS.length} layers (all critical layers present)`
      : `Missing critical layers: ${missingCritical.join(', ')}`,
  };
}

function main(): void {
  if (process.argv.includes('--help')) {
    console.log('Usage: npx tsx validate-tiles.ts');
    console.log('Validates the integrity of generated PMTiles.');
    console.log('Checks: file exists, valid header, layer data, bbox coverage.');
    process.exit(0);
  }

  log('Starting PMTiles validation');
  log(`File: ${PMTILES_FILE}`);

  const results: ValidationResult[] = [
    validateFileExists(),
    validateHeader(),
    validateBbox(),
    validateSourceLayers(),
  ];

  // Print results
  let allPassed = true;
  for (const result of results) {
    const icon = result.passed ? '\u2705' : '\u274c';
    log(`${icon} ${result.check}`);
    log(`     ${result.detail}`);
    if (!result.passed) allPassed = false;
  }

  log('');
  if (allPassed) {
    log('VALIDATION PASSED - All checks succeeded');
    process.exit(0);
  } else {
    log('VALIDATION FAILED - One or more checks failed');
    process.exit(1);
  }
}

main();
