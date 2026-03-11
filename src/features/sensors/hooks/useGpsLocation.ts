import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

import { useSensorsStore } from '@/stores';

import type { GpsLocationState } from '../sensors.types';

export function useGpsLocation(): GpsLocationState & {
  startTracking: () => Promise<void>;
  stopTracking: () => void;
} {
  const [state, setState] = useState<GpsLocationState>({
    location: null,
    accuracy: null,
    isTracking: false,
    error: null,
  });

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const setGpsPosition = useSensorsStore((s) => s.setGpsPosition);
  const setGpsError = useSensorsStore((s) => s.setGpsError);
  const setGpsActive = useSensorsStore((s) => s.setGpsActive);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
    setGpsActive(false);
  }, [setGpsActive]);

  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        const errorMsg = 'Location permission denied';
        setState((prev) => ({ ...prev, error: errorMsg, isTracking: false }));
        setGpsError(errorMsg);
        return;
      }

      // Clean up any existing subscription before starting a new one
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }

      setState((prev) => ({ ...prev, isTracking: true, error: null }));
      setGpsActive(true);

      // Use last known position as immediate approximation while waiting for first fix
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          const { latitude, longitude, accuracy } = lastKnown.coords;
          const position = { latitude, longitude };
          setState((prev) => ({
            ...prev,
            location: position,
            accuracy: accuracy ?? null,
          }));
          setGpsPosition(position, accuracy ?? 0);
        }
      } catch {
        // Last known position unavailable — not critical, continue to live tracking
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          const { latitude, longitude, accuracy } = location.coords;
          const position = { latitude, longitude };
          setState((prev) => ({
            ...prev,
            location: position,
            accuracy: accuracy ?? null,
            error: null,
          }));
          setGpsPosition(position, accuracy ?? 0);
        },
      );

      subscriptionRef.current = subscription;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Failed to start GPS tracking';
      setState((prev) => ({ ...prev, error: errorMsg, isTracking: false }));
      setGpsError(errorMsg);
      setGpsActive(false);
    }
  }, [setGpsPosition, setGpsError, setGpsActive]);

  useEffect(() => {
    startTracking();
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setGpsActive(false);
    };
    // Only run on mount/unmount — startTracking and setGpsActive are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
  };
}
