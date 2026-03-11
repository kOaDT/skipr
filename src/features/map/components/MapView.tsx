import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import MapLibreGL, { type CameraStop } from '@maplibre/maplibre-react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  NAUTICAL_LOADING_BG,
} from '@/constants';
import { useSensorsStore } from '@/stores';
import { useMapLayers } from '../hooks/useMapLayers';
import type { MapViewProps } from '../map.types';

import { GpsPrecisionBadge } from './GpsPrecisionBadge';
import { LayerToggle } from './LayerToggle';
import { UserLocationMarker } from './UserLocationMarker';

const FLY_TO_FIRST_FIX_ZOOM = 14;
const FLY_TO_ANIMATION_DURATION = 1500;

// Ensure MapLibre knows it can fetch tiles over the network
MapLibreGL.setConnected(true);

export function MapView({ style, testID }: MapViewProps) {
  const { filteredStyle, isLoading } = useMapLayers();
  const hasCenteredOnUser = useRef(false);
  const [flyToStop, setFlyToStop] = useState<CameraStop | undefined>();
  const gpsPosition = useSensorsStore((s) => s.gpsPosition);

  // Fly to user position on first GPS fix only
  useEffect(() => {
    if (gpsPosition && !hasCenteredOnUser.current) {
      hasCenteredOnUser.current = true;
      setFlyToStop({
        centerCoordinate: [gpsPosition.longitude, gpsPosition.latitude],
        zoomLevel: FLY_TO_FIRST_FIX_ZOOM,
        animationMode: 'flyTo',
        animationDuration: FLY_TO_ANIMATION_DURATION,
      });
    }
  }, [gpsPosition]);

  if (isLoading) {
    return (
      <View
        testID="map-loading-placeholder"
        style={[{ flex: 1, backgroundColor: NAUTICAL_LOADING_BG }, style]}
      />
    );
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <MapLibreGL.MapView
        testID={testID}
        style={{ flex: 1 }}
        mapStyle={filteredStyle}
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
          {...flyToStop}
          minZoomLevel={MIN_ZOOM_LEVEL}
          maxZoomLevel={MAX_ZOOM_LEVEL}
        />
        <UserLocationMarker />
      </MapLibreGL.MapView>
      <LayerToggle />
      <GpsPrecisionBadge />
    </View>
  );
}
