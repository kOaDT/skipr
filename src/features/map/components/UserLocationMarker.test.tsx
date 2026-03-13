import { render, screen, act } from '@testing-library/react-native';

import { useSensorsStore } from '@/stores';

import { UserLocationMarker } from './UserLocationMarker';

beforeEach(() => {
  useSensorsStore.getState().clearSensors();
});

describe('UserLocationMarker', () => {
  it('renders nothing when gpsPosition is null', () => {
    render(<UserLocationMarker />);

    expect(screen.queryByTestId('user-location-source')).toBeNull();
  });

  it('renders dot layers when gpsPosition is set', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    render(<UserLocationMarker />);

    expect(screen.getByTestId('user-dot-layer')).toBeTruthy();
    expect(screen.getByTestId('user-dot-border-layer')).toBeTruthy();
  });

  it('passes correct coordinates to ShapeSource', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    render(<UserLocationMarker />);

    const source = screen.getByTestId('user-location-source');
    expect(source.props.shape.features[0].geometry.coordinates).toEqual([2.3522, 48.8566]);
  });

  it('updates coordinates when store changes', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    const { rerender } = render(<UserLocationMarker />);

    expect(
      screen.getByTestId('user-location-source').props.shape.features[0].geometry.coordinates,
    ).toEqual([2.3522, 48.8566]);

    act(() => {
      useSensorsStore.getState().setGpsPosition({ latitude: 48.857, longitude: 2.353 }, 8);
    });

    rerender(<UserLocationMarker />);

    expect(
      screen.getByTestId('user-location-source').props.shape.features[0].geometry.coordinates,
    ).toEqual([2.353, 48.857]);
  });

  it('does not render accuracy circle when gpsAccuracy is null', () => {
    useSensorsStore.setState({
      gpsPosition: { latitude: 48.8566, longitude: 2.3522 },
      gpsAccuracy: null,
    });

    render(<UserLocationMarker />);

    expect(screen.queryByTestId('accuracy-circle-layer')).toBeNull();
  });

  it('does not render accuracy circle when gpsAccuracy <= 5m', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 5);

    render(<UserLocationMarker />);

    expect(screen.queryByTestId('accuracy-circle-layer')).toBeNull();
  });

  it('renders accuracy circle when gpsAccuracy = 25m', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 25);

    render(<UserLocationMarker />);

    expect(screen.getByTestId('accuracy-circle-layer')).toBeTruthy();
  });

  it('renders accuracy circle when gpsAccuracy > 50m', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 60);

    render(<UserLocationMarker />);

    expect(screen.getByTestId('accuracy-circle-layer')).toBeTruthy();
  });

  it('applies correct circle radius for accuracy = 25m (min(80, max(20, 37.5)) = 37.5)', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 25);

    render(<UserLocationMarker />);

    const circleLayer = screen.getByTestId('accuracy-circle-layer');
    expect(circleLayer.props.style.circleRadius).toBe(37.5);
  });

  it('caps circle radius at max 80px for very poor accuracy', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 100);

    render(<UserLocationMarker />);

    const circleLayer = screen.getByTestId('accuracy-circle-layer');
    expect(circleLayer.props.style.circleRadius).toBe(80);
  });

  it('uses minimum radius of 20px for accuracy just above threshold', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 6);

    render(<UserLocationMarker />);

    const circleLayer = screen.getByTestId('accuracy-circle-layer');
    expect(circleLayer.props.style.circleRadius).toBe(20);
  });
});
