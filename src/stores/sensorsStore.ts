import { create } from 'zustand';

import type { Coordinates } from '@/types/geo.types';

type SensorsState = {
  gpsPosition: Coordinates | null;
  gpsAccuracy: number | null;
  isGpsActive: boolean;
  gpsError: string | null;
  lastKnownPosition: Coordinates | null;
  setGpsPosition: (position: Coordinates, accuracy: number) => void;
  setGpsError: (error: string | null) => void;
  setGpsActive: (active: boolean) => void;
  clearGps: () => void;
};

export const useSensorsStore = create<SensorsState>()((set) => ({
  gpsPosition: null,
  gpsAccuracy: null,
  isGpsActive: false,
  gpsError: null,
  lastKnownPosition: null,
  setGpsPosition: (position, accuracy) =>
    set({
      gpsPosition: position,
      gpsAccuracy: accuracy,
      gpsError: null,
      lastKnownPosition: position,
    }),
  setGpsError: (error) => set({ gpsError: error }),
  setGpsActive: (active) => set({ isGpsActive: active }),
  clearGps: () =>
    set({
      gpsPosition: null,
      gpsAccuracy: null,
      isGpsActive: false,
      gpsError: null,
      lastKnownPosition: null,
    }),
}));
