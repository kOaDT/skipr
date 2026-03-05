import { renderHook } from '@testing-library/react-native';

import { useMapStyle } from './useMapStyle';

describe('useMapStyle', () => {
  it('returns a valid style JSON with version 8', () => {
    const { result } = renderHook(() => useMapStyle());
    expect(result.current.mapStyle).toBeDefined();
    expect(result.current.mapStyle.version).toBe(8);
  });

  it('style contains required layers (water, land, coastline, depth-contours)', () => {
    const { result } = renderHook(() => useMapStyle());
    const layerIds = result.current.mapStyle.layers.map((l) => l.id);
    expect(layerIds).toContain('water');
    expect(layerIds).toContain('land');
    expect(layerIds).toContain('coastline');
    expect(layerIds).toContain('depth-contours');
  });

  it('is not loading and has no error', () => {
    const { result } = renderHook(() => useMapStyle());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('style has sources defined', () => {
    const { result } = renderHook(() => useMapStyle());
    expect(result.current.mapStyle.sources).toBeDefined();
    expect(result.current.mapStyle.sources.openmaptiles).toBeDefined();
  });

  it('layers are in correct order (background first, labels last)', () => {
    const { result } = renderHook(() => useMapStyle());
    const layerIds = result.current.mapStyle.layers.map((l) => l.id);
    expect(layerIds[0]).toBe('background');
    expect(layerIds[layerIds.length - 1]).toBe('place-labels');
  });
});
