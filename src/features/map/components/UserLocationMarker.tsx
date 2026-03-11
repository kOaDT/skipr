import { StyleSheet, View } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

import { useSensorsStore } from '@/stores';

const MARKER_SIZE = 14;
const BORDER_WIDTH = 2;

export function UserLocationMarker() {
  const gpsPosition = useSensorsStore((s) => s.gpsPosition);

  if (!gpsPosition) {
    return null;
  }

  // MarkerView repositions natively on coordinate change. At 1Hz/1m GPS intervals,
  // position deltas are sub-pixel so movement appears smooth without explicit animation.
  // PointAnnotation supports `animated` but limits custom child rendering.
  return (
    <MapLibreGL.MarkerView
      coordinate={[gpsPosition.longitude, gpsPosition.latitude]}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View testID="user-location-marker" style={styles.outerCircle}>
        <View style={styles.innerCircle} />
      </View>
    </MapLibreGL.MarkerView>
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
