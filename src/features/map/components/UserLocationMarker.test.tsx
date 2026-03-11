import { render, screen, act } from '@testing-library/react-native';

import { useSensorsStore } from '@/stores';

import { UserLocationMarker } from './UserLocationMarker';

beforeEach(() => {
  useSensorsStore.getState().clearGps();
});

describe('UserLocationMarker', () => {
  it('renders nothing when gpsPosition is null', () => {
    render(<UserLocationMarker />);

    expect(screen.queryByTestId('user-location-marker')).toBeNull();
  });

  it('renders marker when gpsPosition is set', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    render(<UserLocationMarker />);

    expect(screen.getByTestId('user-location-marker')).toBeTruthy();
  });

  it('passes correct coordinates to MarkerView', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    render(<UserLocationMarker />);

    const markerView = screen.getByTestId('maplibre-markerview');
    expect(markerView.props.coordinate).toEqual([2.3522, 48.8566]);
  });

  it('updates marker position when store changes', () => {
    useSensorsStore.getState().setGpsPosition({ latitude: 48.8566, longitude: 2.3522 }, 10);

    const { rerender } = render(<UserLocationMarker />);

    expect(screen.getByTestId('maplibre-markerview').props.coordinate).toEqual([2.3522, 48.8566]);

    act(() => {
      useSensorsStore.getState().setGpsPosition({ latitude: 48.857, longitude: 2.353 }, 8);
    });

    rerender(<UserLocationMarker />);

    expect(screen.getByTestId('maplibre-markerview').props.coordinate).toEqual([2.353, 48.857]);
  });
});
