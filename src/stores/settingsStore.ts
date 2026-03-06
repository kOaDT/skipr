import { create } from 'zustand';

import type { LayerId } from '@/features/map';

// TODO: Add persist middleware once a compatible storage backend is available.
// MMKV v4 requires Nitro Modules (incompatible with Expo SDK 55),
// MMKV v2 JSI doesn't link with RN 0.83, AsyncStorage has New Architecture issues.

type SettingsState = {
  layerVisibility: Record<LayerId, boolean>;
  toggleLayer: (layerId: LayerId) => void;
  setLayerVisibility: (layerId: LayerId, visible: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  layerVisibility: {
    'maritime-marks': true,
    bathymetry: true,
    land: true,
  },
  toggleLayer: (layerId) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: !state.layerVisibility[layerId],
      },
    })),
  setLayerVisibility: (layerId, visible) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layerId]: visible,
      },
    })),
}));
