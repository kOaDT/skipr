import { useCallback, useEffect, useRef, useState } from 'react';
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

import { CompassButton } from './CompassButton';
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
  const [isHeadingMode, setIsHeadingMode] = useState(false);
  const [cameraHeading, setCameraHeading] = useState<number | undefined>();
  const gpsPosition = useSensorsStore((s) => s.gpsPosition);
  const heading = useSensorsStore((s) => s.heading);

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

  // Clear flyToStop after animation to prevent camera reset on re-renders
  useEffect(() => {
    if (flyToStop) {
      const timer = setTimeout(() => setFlyToStop(undefined), FLY_TO_ANIMATION_DURATION + 100);
      return () => clearTimeout(timer);
    }
  }, [flyToStop]);

  // Sync compass heading to camera, with smooth reset to north on deactivation
  useEffect(() => {
    if (isHeadingMode) {
      setCameraHeading(heading ?? 0);
    } else if (cameraHeading !== undefined) {
      // Animate back to north, then stop controlling heading
      setCameraHeading(0);
      const timer = setTimeout(() => setCameraHeading(undefined), 350);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHeadingMode, heading]);

  const handleToggleHeadingMode = useCallback(() => {
    setIsHeadingMode((prev) => !prev);
  }, []);

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
        compassEnabled={false}
        attributionEnabled
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          defaultSettings={{
            centerCoordinate: DEFAULT_CENTER_COORDINATE,
            zoomLevel: DEFAULT_ZOOM_LEVEL,
          }}
          {...flyToStop}
          {...(cameraHeading !== undefined
            ? {
                heading: cameraHeading,
                animationMode: 'easeTo' as const,
                animationDuration: 300,
              }
            : {})}
          minZoomLevel={MIN_ZOOM_LEVEL}
          maxZoomLevel={MAX_ZOOM_LEVEL}
        />
        <UserLocationMarker />
      </MapLibreGL.MapView>
      <LayerToggle />
      <GpsPrecisionBadge />
      <CompassButton
        isHeadingMode={isHeadingMode}
        heading={heading}
        onToggle={handleToggleHeadingMode}
      />
    </View>
  );
}
