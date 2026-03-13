import { useMemo } from 'react';
import MapLibreGL from '@maplibre/maplibre-react-native';

import { useSensorsStore } from '@/stores';

const MARKER_SIZE = 14;
const BORDER_WIDTH = 2;
const DOT_SIZE = MARKER_SIZE + BORDER_WIDTH * 2; // 18
const ACCURACY_VISIBLE_THRESHOLD = 5;
const ACCURACY_MIN_RADIUS = 20;
const ACCURACY_MAX_RADIUS = 80;

export function UserLocationMarker() {
  const gpsPosition = useSensorsStore((s) => s.gpsPosition);
  const gpsAccuracy = useSensorsStore((s) => s.gpsAccuracy);

  const showAccuracyCircle =
    gpsPosition !== null && gpsAccuracy !== null && gpsAccuracy > ACCURACY_VISIBLE_THRESHOLD;

  const geoJSON = useMemo(
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
      <MapLibreGL.ShapeSource id="user-location-source" shape={geoJSON}>
        {showAccuracyCircle && (
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
        )}
        <MapLibreGL.CircleLayer
          id="user-dot-border-layer"
          aboveLayerID="accuracy-circle-layer"
          style={{
            circleRadius: DOT_SIZE / 2,
            circleColor: '#FFFFFF',
          }}
        />
        <MapLibreGL.CircleLayer
          id="user-dot-layer"
          aboveLayerID="user-dot-border-layer"
          style={{
            circleRadius: MARKER_SIZE / 2,
            circleColor: '#4285F4',
          }}
        />
      </MapLibreGL.ShapeSource>
    </>
  );
}
