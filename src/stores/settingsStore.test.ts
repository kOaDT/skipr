import { useSettingsStore } from './settingsStore';

beforeEach(() => {
  // Reset store state between tests
  useSettingsStore.setState({
    layerVisibility: {
      'maritime-marks': true,
      bathymetry: true,
      land: true,
    },
  });
});

describe('settingsStore', () => {
  it('has all layers visible by default', () => {
    const { layerVisibility } = useSettingsStore.getState();

    expect(layerVisibility['maritime-marks']).toBe(true);
    expect(layerVisibility['bathymetry']).toBe(true);
    expect(layerVisibility['land']).toBe(true);
  });

  it('toggles a layer off', () => {
    useSettingsStore.getState().toggleLayer('bathymetry');

    const { layerVisibility } = useSettingsStore.getState();
    expect(layerVisibility['bathymetry']).toBe(false);
    expect(layerVisibility['maritime-marks']).toBe(true);
    expect(layerVisibility['land']).toBe(true);
  });

  it('toggles a layer back on', () => {
    useSettingsStore.getState().toggleLayer('land');
    useSettingsStore.getState().toggleLayer('land');

    expect(useSettingsStore.getState().layerVisibility['land']).toBe(true);
  });

  it('sets layer visibility directly', () => {
    useSettingsStore.getState().setLayerVisibility('maritime-marks', false);

    expect(useSettingsStore.getState().layerVisibility['maritime-marks']).toBe(false);
  });
});
