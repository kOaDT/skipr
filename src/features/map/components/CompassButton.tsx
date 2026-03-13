import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BUTTON_SIZE = 44;
const GPS_BLUE = '#4285F4';
const INACTIVE_COLOR = '#9E9E9E';
const ARROW_SIZE = 14;

type CompassButtonProps = {
  isHeadingMode: boolean;
  heading: number | null;
  onToggle: () => void;
};

export function CompassButton({ isHeadingMode, heading, onToggle }: CompassButtonProps) {
  const rotationDeg = useSharedValue(0);

  useEffect(() => {
    if (isHeadingMode && heading !== null) {
      const targetRotation = -heading;
      let delta = targetRotation - rotationDeg.value;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      rotationDeg.value = withTiming(rotationDeg.value + delta, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      rotationDeg.value = withTiming(0, { duration: 200 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heading, isHeadingMode]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationDeg.value}deg` }],
  }));

  const arrowColor = isHeadingMode ? GPS_BLUE : INACTIVE_COLOR;

  return (
    <View style={styles.shadowWrapper}>
      <Pressable
        testID="compass-button"
        style={[styles.button, isHeadingMode && styles.buttonActive]}
        onPress={onToggle}
        role="button"
        accessibilityLabel={
          isHeadingMode ? 'Retour nord en haut' : 'Orientation carte selon le cap'
        }
      >
        <Animated.View testID="compass-button-arrow" style={[styles.arrowContainer, animatedStyle]}>
          <Animated.View style={[styles.arrow, { borderBottomColor: arrowColor }]} />
          <Animated.View style={[styles.arrowStem, { backgroundColor: arrowColor }]} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    borderWidth: 2,
    borderColor: GPS_BLUE,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: INACTIVE_COLOR,
  },
  arrowStem: {
    width: 2,
    height: 6,
    backgroundColor: INACTIVE_COLOR,
  },
});
