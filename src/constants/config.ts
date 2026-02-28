export const CDN_BASE_URL = process.env.EXPO_PUBLIC_CDN_BASE_URL ?? '';
export const MANIFEST_URL = `${CDN_BASE_URL}/manifest.json`;

export const GPS_PRECISION_THRESHOLD_M = 50;
export const WEATHER_STALE_HOURS = 6;
export const MAX_ZONE_SIZE_MB = 100;
