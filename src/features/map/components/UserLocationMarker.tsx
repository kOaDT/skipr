import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

import { useSensorsStore } from '@/stores';

const MARKER_SIZE = 14;
const BORDER_WIDTH = 2;
const ACCURACY_VISIBLE_THRESHOLD = 5;
const ACCURACY_MIN_RADIUS = 20;
const ACCURACY_MAX_RADIUS = 80;

export function UserLocationMarker() {
  const gpsPosition = useSensorsStore((s) => s.gpsPosition);
  const gpsAccuracy = useSensorsStore((s) => s.gpsAccuracy);

  const showAccuracyCircle =
    gpsPosition !== null && gpsAccuracy !== null && gpsAccuracy > ACCURACY_VISIBLE_THRESHOLD;

  const accuracyGeoJSON = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: gpsPosition
        ? [
            {
              type: 'Feature' as const,
              geometry: {
                type: 'Point' as const,
                coordinates: [gpsPosition.longitude, gpsPosition.latitude],
              },
              properties: {},
            },
          ]
        : [],
    }),
    [gpsPosition],
  );

  const circleRadius = gpsAccuracy
    ? Math.min(ACCURACY_MAX_RADIUS, Math.max(ACCURACY_MIN_RADIUS, gpsAccuracy * 1.5))
    : 0;

  if (!gpsPosition) {
    return null;
  }

  return (
    <>
      {showAccuracyCircle && (
        <MapLibreGL.ShapeSource id="accuracy-circle-source" shape={accuracyGeoJSON}>
          <MapLibreGL.CircleLayer
            id="accuracy-circle-layer"
            style={{
              circleRadius: circleRadius,
              circleColor: 'rgba(66, 133, 244, 0.15)',
              circleStrokeColor: 'rgba(66, 133, 244, 0.3)',
              circleStrokeWidth: 1,
              circleRadiusTransition: { duration: 300, delay: 0 },
            }}
          />
        </MapLibreGL.ShapeSource>
      )}
      <MapLibreGL.MarkerView
        coordinate={[gpsPosition.longitude, gpsPosition.latitude]}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View testID="user-location-marker" style={styles.outerCircle}>
          <View style={styles.innerCircle} />
        </View>
      </MapLibreGL.MarkerView>
    </>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    width: MARKER_SIZE + BORDER_WIDTH * 2,
    height: MARKER_SIZE + BORDER_WIDTH * 2,
    borderRadius: (MARKER_SIZE + BORDER_WIDTH * 2) / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  innerCircle: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: '#4285F4',
  },
});
