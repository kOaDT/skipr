import { fireEvent, render, screen } from '@testing-library/react-native';

import { useSettingsStore } from '@/stores';

import { LayerToggle } from './LayerToggle';

beforeEach(() => {
  useSettingsStore.setState({
    layerVisibility: {
      'maritime-marks': true,
      bathymetry: true,
      land: true,
    },
  });
});

describe('LayerToggle', () => {
  it('renders the layer toggle button', () => {
    render(<LayerToggle />);

    expect(screen.getByTestId('layer-toggle-button')).toBeTruthy();
  });

  it('opens the panel when button is tapped', () => {
    render(<LayerToggle />);

    expect(screen.queryByTestId('layer-toggle-panel')).toBeNull();

    fireEvent.press(screen.getByTestId('layer-toggle-button'));

    expect(screen.getByTestId('layer-toggle-panel')).toBeTruthy();
  });

  it('displays 2 layers with correct labels', () => {
    render(<LayerToggle />);
    fireEvent.press(screen.getByTestId('layer-toggle-button'));

    expect(screen.getByText('Depth zones')).toBeTruthy();
    expect(screen.getByText('Land details')).toBeTruthy();
  });

  it('calls toggleLayer when a switch is toggled', () => {
    const toggleLayer = jest.fn();
    useSettingsStore.setState({ toggleLayer });

    render(<LayerToggle />);
    fireEvent.press(screen.getByTestId('layer-toggle-button'));

    fireEvent(screen.getByTestId('layer-switch-bathymetry'), 'valueChange', false);

    expect(toggleLayer).toHaveBeenCalledWith('bathymetry');
  });

  it('closes the panel when button is tapped again', () => {
    render(<LayerToggle />);

    fireEvent.press(screen.getByTestId('layer-toggle-button'));
    expect(screen.getByTestId('layer-toggle-panel')).toBeTruthy();

    fireEvent.press(screen.getByTestId('layer-toggle-button'));
    expect(screen.queryByTestId('layer-toggle-panel')).toBeNull();
  });

  it('closes the panel when backdrop is pressed', () => {
    render(<LayerToggle />);

    fireEvent.press(screen.getByTestId('layer-toggle-button'));
    expect(screen.getByTestId('layer-toggle-panel')).toBeTruthy();

    fireEvent.press(screen.getByTestId('layer-toggle-backdrop'));
    expect(screen.queryByTestId('layer-toggle-panel')).toBeNull();
  });
});
