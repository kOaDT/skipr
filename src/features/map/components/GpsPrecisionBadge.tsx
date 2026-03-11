import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GPS_PRECISION_THRESHOLD_M } from '@/constants/config';
import { useSensorsStore } from '@/stores';

const HYSTERESIS_MARGIN = 5;

export function GpsPrecisionBadge() {
  const gpsAccuracy = useSensorsStore((s) => s.gpsAccuracy);
  const isBadgeVisible = useRef(false);
  const opacity = useSharedValue(0);

  if (!isBadgeVisible.current && gpsAccuracy !== null && gpsAccuracy > GPS_PRECISION_THRESHOLD_M) {
    isBadgeVisible.current = true;
  }
  if (
    isBadgeVisible.current &&
    gpsAccuracy !== null &&
    gpsAccuracy < GPS_PRECISION_THRESHOLD_M - HYSTERESIS_MARGIN
  ) {
    isBadgeVisible.current = false;
  }
  if (gpsAccuracy === null) {
    isBadgeVisible.current = false;
  }

  const shouldShow = isBadgeVisible.current;

  useEffect(() => {
    opacity.value = withTiming(shouldShow ? 1 : 0, { duration: 200 });
  }, [shouldShow, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isBadgeVisible.current) {
    return null;
  }

  const displayAccuracy = gpsAccuracy !== null ? Math.round(gpsAccuracy) : 0;

  return (
    <Animated.View
      testID="gps-precision-badge"
      style={[styles.badge, animatedStyle]}
      role="status"
      accessibilityLabel={`GPS precision warning: accuracy plus or minus ${displayAccuracy} meters`}
    >
      <Text style={styles.text}>⚠ GPS ±{displayAccuracy}m</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
