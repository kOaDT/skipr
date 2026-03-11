import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { useSensorsStore } from '@/stores';

import { useGpsLocation } from './useGpsLocation';

jest.mock('expo-location');

const mockLocation = jest.mocked(Location);

const mockRemove = jest.fn();
let watchCallback: ((location: Location.LocationObject) => void) | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  useSensorsStore.getState().clearGps();
  watchCallback = null;

  mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
    status: Location.PermissionStatus.GRANTED,
    granted: true,
    canAskAgain: true,
    expires: 'never',
  });

  mockLocation.getLastKnownPositionAsync.mockResolvedValue(null);

  mockLocation.watchPositionAsync.mockImplementation(async (_options, callback) => {
    watchCallback = callback;
    return { remove: mockRemove } as unknown as Location.LocationSubscription;
  });
});

function makeLocationObject(lat: number, lng: number, accuracy: number): Location.LocationObject {
  return {
    coords: {
      latitude: lat,
      longitude: lng,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

describe('useGpsLocation', () => {
  it('requests permission and starts tracking on mount', async () => {
    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true);
    });

    expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockLocation.watchPositionAsync).toHaveBeenCalledTimes(1);
    expect(mockLocation.watchPositionAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      }),
      expect.any(Function),
    );
  });

  it('updates location when position is received', async () => {
    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(watchCallback).not.toBeNull();
    });

    act(() => {
      watchCallback!(makeLocationObject(48.8566, 2.3522, 10));
    });

    expect(result.current.location).toEqual({ latitude: 48.8566, longitude: 2.3522 });
    expect(result.current.accuracy).toBe(10);
    expect(result.current.error).toBeNull();

    // Also updates the store
    const storeState = useSensorsStore.getState();
    expect(storeState.gpsPosition).toEqual({ latitude: 48.8566, longitude: 2.3522 });
    expect(storeState.gpsAccuracy).toBe(10);
  });

  it('returns error when permission is denied', async () => {
    mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: Location.PermissionStatus.DENIED,
      granted: false,
      canAskAgain: true,
      expires: 'never',
    });

    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.error).toBe('Location permission denied');
    });

    expect(result.current.isTracking).toBe(false);
    expect(mockLocation.watchPositionAsync).not.toHaveBeenCalled();

    // Store also updated with error
    expect(useSensorsStore.getState().gpsError).toBe('Location permission denied');
  });

  it('returns null location on cold start when no last known position', async () => {
    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true);
    });

    expect(result.current.location).toBeNull();
    expect(result.current.accuracy).toBeNull();
  });

  it('uses last known position as immediate approximation before first fix', async () => {
    mockLocation.getLastKnownPositionAsync.mockResolvedValue(makeLocationObject(45.75, 4.85, 50));

    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.location).toEqual({ latitude: 45.75, longitude: 4.85 });
    });

    expect(result.current.accuracy).toBe(50);
    expect(useSensorsStore.getState().gpsPosition).toEqual({ latitude: 45.75, longitude: 4.85 });
  });

  it('preserves last known position in store across updates', async () => {
    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(watchCallback).not.toBeNull();
    });

    act(() => {
      watchCallback!(makeLocationObject(48.8566, 2.3522, 10));
    });

    expect(useSensorsStore.getState().lastKnownPosition).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });

    // Second position update
    act(() => {
      watchCallback!(makeLocationObject(48.857, 2.353, 8));
    });

    expect(result.current.location).toEqual({ latitude: 48.857, longitude: 2.353 });
    expect(useSensorsStore.getState().lastKnownPosition).toEqual({
      latitude: 48.857,
      longitude: 2.353,
    });
  });

  it('cleans up subscription and syncs store on unmount', async () => {
    const { unmount } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(watchCallback).not.toBeNull();
    });

    expect(useSensorsStore.getState().isGpsActive).toBe(true);

    unmount();

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(useSensorsStore.getState().isGpsActive).toBe(false);
  });

  it('handles watchPositionAsync failure gracefully', async () => {
    mockLocation.watchPositionAsync.mockRejectedValue(new Error('Location services disabled'));

    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.error).toBe('Location services disabled');
    });

    expect(result.current.isTracking).toBe(false);
    expect(useSensorsStore.getState().gpsError).toBe('Location services disabled');
    expect(useSensorsStore.getState().isGpsActive).toBe(false);
  });

  it('stopTracking removes subscription and updates state', async () => {
    const { result } = renderHook(() => useGpsLocation());

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true);
    });

    act(() => {
      result.current.stopTracking();
    });

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(result.current.isTracking).toBe(false);
    expect(useSensorsStore.getState().isGpsActive).toBe(false);
  });
});
