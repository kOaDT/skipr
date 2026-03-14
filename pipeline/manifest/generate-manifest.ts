import { createHash } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';

/**
 * Generate manifest.json describing the published chart data.
 * The manifest is the ONLY file the mobile app downloads to check for updates.
 */

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const TMP_DIR = resolve(SCRIPT_DIR, '..', 'tmp');
const PMTILES_FILE = resolve(TMP_DIR, 'nautical-charts.pmtiles');
const MANIFEST_FILE = resolve(TMP_DIR, 'manifest.json');

function log(message: string): void {
  const ts = new Date().toISOString();
  console.log(`[charts:manifest] ${ts} ${message}`);
}

function computeSha256(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
}

function main(): void {
  if (process.argv.includes('--help')) {
    console.log('Usage: npx tsx generate-manifest.ts');
    console.log('Generates manifest.json for the published chart PMTiles.');
    console.log('Environment variables:');
    console.log('  R2_PUBLIC_URL  - Public URL prefix for R2 bucket');
    process.exit(0);
  }

  log('Generating manifest.json');

  // Verify PMTiles file exists
  let stats;
  try {
    stats = statSync(PMTILES_FILE);
  } catch {
    log(`ERROR: PMTiles file not found: ${PMTILES_FILE}`);
    process.exit(1);
  }

  if (stats.size === 0) {
    log('ERROR: PMTiles file is empty');
    process.exit(1);
  }

  // Compute checksum
  log('Computing SHA-256 checksum...');
  const checksum = computeSha256(PMTILES_FILE);
  log(`Checksum: ${checksum}`);

  // Get R2 public URL from environment
  const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.example.com';

  // NOAA source date: read from download step output, env var override, or fallback to today
  const now = new Date().toISOString();
  const versionDate = now.split('T')[0];
  let sourceDate = process.env.NOAA_SOURCE_DATE || '';
  if (!sourceDate) {
    const sourceDateFile = resolve(TMP_DIR, 'noaa-source-date.txt');
    try {
      sourceDate = readFileSync(sourceDateFile, 'utf-8').trim();
    } catch {
      sourceDate = versionDate;
    }
  }

  const manifest = {
    version: '1.0.0',
    generatedAt: now,
    charts: {
      url: `${r2PublicUrl}/charts/nautical-charts-latest.pmtiles`,
      version: versionDate,
      sourceDate,
      checksum,
      sizeBytes: stats.size,
      format: 'pmtiles' as const,
      minZoom: 2,
      maxZoom: 14,
    },
  };

  // Write manifest locally
  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n');
  log(`Manifest written to ${MANIFEST_FILE}`);

  // Upload manifest to R2 if credentials are available
  const bucketName = process.env.R2_BUCKET_NAME;
  if (bucketName) {
    log('Uploading manifest.json to R2...');
    try {
      execSync(`rclone copyto "${MANIFEST_FILE}" "r2:${bucketName}/manifest.json"`, {
        stdio: 'inherit',
      });
      log('Manifest uploaded to R2');
    } catch {
      log('ERROR: Failed to upload manifest to R2');
      process.exit(1);
    }
  } else {
    log('R2_BUCKET_NAME not set — skipping upload (local mode)');
  }

  log('Manifest generation complete');
  console.log(JSON.stringify(manifest, null, 2));
}

main();
