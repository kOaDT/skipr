import { act, renderHook } from '@testing-library/react-native';

import { useSettingsStore } from '@/stores';

import type { MapStyleJSON } from '../map.types';

import { useMapLayers } from './useMapLayers';

jest.mock('../hooks/useMapStyle');

const nauticalStyle: MapStyleJSON = require('../../../../assets/map-styles/nautical.json');

const mockUseMapStyle = jest.mocked(
  jest.requireMock<typeof import('./useMapStyle')>('./useMapStyle').useMapStyle,
);

beforeEach(() => {
  mockUseMapStyle.mockReturnValue({
    mapStyle: nauticalStyle,
    isLoading: false,
    error: null,
  });
  useSettingsStore.setState({
    layerVisibility: {
      'maritime-marks': true,
      bathymetry: true,
      land: true,
    },
  });
});

function getLayerVisibility(style: MapStyleJSON, layerId: string) {
  const layer = style.layers.find((l) => l.id === layerId);
  return layer?.layout?.visibility;
}

describe('useMapLayers', () => {
  it('returns all layers visible by default', () => {
    const { result } = renderHook(() => useMapLayers());

    expect(getLayerVisibility(result.current.filteredStyle, 'depth-shallow')).toBe('visible');
    expect(getLayerVisibility(result.current.filteredStyle, 'land')).toBe('visible');
    expect(getLayerVisibility(result.current.filteredStyle, 'water')).toBe('visible');
  });

  it('hides bathymetry layers when bathymetry is disabled', () => {
    useSettingsStore.setState({
      layerVisibility: { 'maritime-marks': true, bathymetry: false, land: true },
    });

    const { result } = renderHook(() => useMapLayers());

    expect(getLayerVisibility(result.current.filteredStyle, 'depth-shallow')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'depth-medium')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'depth-deep')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'depth-contours')).toBe('none');
  });

  it('shows bathymetry layers when re-enabled', () => {
    useSettingsStore.setState({
      layerVisibility: { 'maritime-marks': true, bathymetry: false, land: true },
    });

    const { result } = renderHook(() => useMapLayers());
    expect(getLayerVisibility(result.current.filteredStyle, 'depth-shallow')).toBe('none');

    act(() => {
      useSettingsStore.setState({
        layerVisibility: { 'maritime-marks': true, bathymetry: true, land: true },
      });
    });

    expect(getLayerVisibility(result.current.filteredStyle, 'depth-shallow')).toBe('visible');
  });

  it('hides land layers when land is disabled', () => {
    useSettingsStore.setState({
      layerVisibility: { 'maritime-marks': true, bathymetry: true, land: false },
    });

    const { result } = renderHook(() => useMapLayers());

    expect(getLayerVisibility(result.current.filteredStyle, 'land')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'landuse')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'roads')).toBe('none');
    expect(getLayerVisibility(result.current.filteredStyle, 'buildings')).toBe('none');
  });

  it('never hides non-toggleable layers (water, background, coastline, place-labels)', () => {
    useSettingsStore.setState({
      layerVisibility: { 'maritime-marks': false, bathymetry: false, land: false },
    });

    const { result } = renderHook(() => useMapLayers());

    expect(getLayerVisibility(result.current.filteredStyle, 'water')).toBe('visible');
    expect(getLayerVisibility(result.current.filteredStyle, 'background')).toBe('visible');
    expect(getLayerVisibility(result.current.filteredStyle, 'coastline')).toBe('visible');
    expect(getLayerVisibility(result.current.filteredStyle, 'place-labels')).toBe('visible');
  });

  it('returns a new style reference (no mutation)', () => {
    const { result } = renderHook(() => useMapLayers());

    expect(result.current.filteredStyle).not.toBe(nauticalStyle);
    expect(result.current.filteredStyle.layers).not.toBe(nauticalStyle.layers);
  });
});
