import type { MapStyleJSON } from '../map.types';

// Metro bundler resolves JSON imports at build time — synchronous, stable reference
const nauticalStyle: MapStyleJSON = require('../../../../assets/map-styles/nautical.json');

export function useMapStyle() {
  return { mapStyle: nauticalStyle, isLoading: false, error: null };
}
