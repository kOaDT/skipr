import type { Coordinates } from '@/types/geo.types';

export type GpsLocationState = {
  location: Coordinates | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
};

export type CompassState = {
  heading: number | null;
  isAvailable: boolean;
  error: string | null;
};
