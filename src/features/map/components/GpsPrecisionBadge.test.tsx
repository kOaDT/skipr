import { render, screen, act } from '@testing-library/react-native';

import { useSensorsStore } from '@/stores';

import { GpsPrecisionBadge } from './GpsPrecisionBadge';

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (value: number) => value,
  };
});

beforeEach(() => {
  useSensorsStore.getState().clearGps();
});

describe('GpsPrecisionBadge', () => {
  it('does not render when gpsAccuracy is null', () => {
    useSensorsStore.setState({ gpsAccuracy: null });

    render(<GpsPrecisionBadge />);

    expect(screen.queryByTestId('gps-precision-badge')).toBeNull();
  });

  it('does not render when gpsAccuracy is below threshold (30m)', () => {
    useSensorsStore.setState({ gpsAccuracy: 30 });

    render(<GpsPrecisionBadge />);

    expect(screen.queryByTestId('gps-precision-badge')).toBeNull();
  });

  it('renders badge when gpsAccuracy exceeds threshold (60m)', () => {
    useSensorsStore.setState({ gpsAccuracy: 60 });

    render(<GpsPrecisionBadge />);

    const badge = screen.getByTestId('gps-precision-badge');
    expect(badge).toBeTruthy();
    expect(screen.getByText('⚠ GPS ±60m')).toBeTruthy();
  });

  it('keeps badge visible in hysteresis zone (48m after being > 50m)', () => {
    // First render with accuracy above threshold
    useSensorsStore.setState({ gpsAccuracy: 55 });
    const { rerender } = render(<GpsPrecisionBadge />);
    expect(screen.getByTestId('gps-precision-badge')).toBeTruthy();

    // Accuracy drops to 48m (above hysteresis threshold of 45m)
    act(() => {
      useSensorsStore.setState({ gpsAccuracy: 48 });
    });
    rerender(<GpsPrecisionBadge />);
    expect(screen.getByTestId('gps-precision-badge')).toBeTruthy();
  });

  it('hides badge when accuracy drops below hysteresis threshold (44m)', () => {
    // First render with accuracy above threshold
    useSensorsStore.setState({ gpsAccuracy: 55 });
    const { rerender } = render(<GpsPrecisionBadge />);
    expect(screen.getByTestId('gps-precision-badge')).toBeTruthy();

    // Accuracy drops below hysteresis threshold (45m)
    act(() => {
      useSensorsStore.setState({ gpsAccuracy: 44 });
    });
    rerender(<GpsPrecisionBadge />);
    expect(screen.queryByTestId('gps-precision-badge')).toBeNull();
  });

  it('has correct accessibility label', () => {
    useSensorsStore.setState({ gpsAccuracy: 60 });

    render(<GpsPrecisionBadge />);

    const badge = screen.getByTestId('gps-precision-badge');
    expect(badge.props.accessibilityLabel).toBe(
      'GPS precision warning: accuracy plus or minus 60 meters',
    );
  });
});
