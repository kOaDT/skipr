import { View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  NAUTICAL_LOADING_BG,
} from '@/constants';
import { useMapStyle } from '../hooks/useMapStyle';
import type { MapViewProps } from '../map.types';

// Ensure MapLibre knows it can fetch tiles over the network
MapLibreGL.setConnected(true);

export function MapView({ style, testID }: MapViewProps) {
  const { mapStyle, isLoading } = useMapStyle();

  if (isLoading) {
    return (
      <View
        testID="map-loading-placeholder"
        style={[{ flex: 1, backgroundColor: NAUTICAL_LOADING_BG }, style]}
      />
    );
  }

  return (
    <MapLibreGL.MapView
      testID={testID}
      style={[{ flex: 1 }, style]}
      mapStyle={mapStyle}
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
