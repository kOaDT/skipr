import { useEffect, useRef, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

import { useSensorsStore } from '@/stores';

const UPDATE_INTERVAL_MS = 100; // 10 Hz
const SMOOTHING_FACTOR = 0.3;

type CompassReturn = {
  heading: number | null;
  isAvailable: boolean;
  error: string | null;
};

function smoothHeading(rawHeading: number, previousHeading: number): number {
  let delta = rawHeading - previousHeading;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;

  const smoothed = previousHeading + SMOOTHING_FACTOR * delta;
  return ((smoothed % 360) + 360) % 360;
}

export function useCompass(): CompassReturn {
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousHeadingRef = useRef(0);
  const setHeading = useSensorsStore((s) => s.setHeading);
  const setCompassActive = useSensorsStore((s) => s.setCompassActive);

  useEffect(() => {
    let subscription: ReturnType<typeof Magnetometer.addListener> | null = null;

    async function start() {
      try {
        const available = await Magnetometer.isAvailableAsync();
        setIsAvailable(available);

        if (!available) {
          return;
        }

        Magnetometer.setUpdateInterval(UPDATE_INTERVAL_MS);
        setCompassActive(true);

        subscription = Magnetometer.addListener(({ x, y }) => {
          // atan2(-x, y) gives correct compass heading: 0=north, 90=east, 180=south, 270=west
          let angle = Math.atan2(-x, y) * (180 / Math.PI);
          if (angle < 0) angle += 360;

          const smoothed = smoothHeading(angle, previousHeadingRef.current);
          previousHeadingRef.current = smoothed;
          setHeading(smoothed);
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Magnetometer error';
        setError(msg);
      }
    }

    start();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      setHeading(null);
      setCompassActive(false);
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heading = useSensorsStore((s) => s.heading);

  return { heading, isAvailable, error };
}
