import MapLibreGL from '@maplibre/maplibre-react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MAP_STYLE_URL,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
} from '@/constants';
import type { MapViewProps } from '../map.types';

// Ensure MapLibre knows it can fetch tiles over the network
MapLibreGL.setConnected(true);

export function MapView({ style, testID }: MapViewProps) {
  return (
    <MapLibreGL.MapView
      testID={testID}
      style={[{ flex: 1 }, style]}
      mapStyle={MAP_STYLE_URL}
      zoomEnabled
      scrollEnabled
      rotateEnabled
      pitchEnabled={false}
      compassEnabled
      attributionEnabled
      logoEnabled={false}
    >
      <MapLibreGL.Camera
        defaultSettings={{
          centerCoordinate: DEFAULT_CENTER_COORDINATE,
          zoomLevel: DEFAULT_ZOOM_LEVEL,
        }}
        minZoomLevel={MIN_ZOOM_LEVEL}
        maxZoomLevel={MAX_ZOOM_LEVEL}
      />
    </MapLibreGL.MapView>
  );
}
