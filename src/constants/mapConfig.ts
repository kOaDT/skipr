/** OpenFreeMap liberty style — free, no API key required (fallback) */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

/** Path to the local nautical style JSON asset */
export const NAUTICAL_STYLE_PATH = '../../assets/map-styles/nautical.json';

/** Background color shown while nautical style loads (ocean blue S-52) */
export const NAUTICAL_LOADING_BG = '#1B3A5C';

/** Default center on the Brittany coast [longitude, latitude] */
export const DEFAULT_CENTER_COORDINATE: [number, number] = [-3.5, 48.4];

/** Initial zoom level — coastal view */
export const DEFAULT_ZOOM_LEVEL = 8;

/** Minimum zoom — world view */
export const MIN_ZOOM_LEVEL = 2;

/** Maximum zoom — port/harbor view */
export const MAX_ZOOM_LEVEL = 18;
