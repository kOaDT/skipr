import { useMemo } from 'react';

import { useSettingsStore } from '@/stores';

import type { LayerId, MapStyleJSON } from '../map.types';

import { useMapStyle } from './useMapStyle';

const LAYER_GROUPS: Record<LayerId, string[]> = {
  'maritime-marks': [],
  bathymetry: ['depth-shallow', 'depth-medium', 'depth-deep', 'depth-contours'],
  land: ['land', 'landuse', 'roads', 'buildings'],
};

export function useMapLayers() {
  const { mapStyle, isLoading } = useMapStyle();
  const layerVisibility = useSettingsStore((s) => s.layerVisibility);

  const filteredStyle = useMemo((): MapStyleJSON => {
    const hiddenLayerIds = new Set<string>();
    for (const [groupId, layerIds] of Object.entries(LAYER_GROUPS)) {
      if (!layerVisibility[groupId as LayerId]) {
        layerIds.forEach((id) => hiddenLayerIds.add(id));
      }
    }

    return {
      ...mapStyle,
      layers: mapStyle.layers.map((layer) => ({
        ...layer,
        layout: {
          ...layer.layout,
          visibility: hiddenLayerIds.has(layer.id) ? 'none' : 'visible',
        },
      })),
    };
  }, [mapStyle, layerVisibility]);

  return { filteredStyle, isLoading };
}
