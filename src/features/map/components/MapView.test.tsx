import { render, screen, fireEvent, act } from '@testing-library/react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  NAUTICAL_LOADING_BG,
} from '@/constants';
import { useSensorsStore } from '@/stores';

import { MapView } from './MapView';

const nauticalStyle = require('../../../../assets/map-styles/nautical.json');

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => Record<string, unknown>) => fn(),
    withTiming: (value: number) => value,
    Easing: {
      out: () => undefined,
      cubic: undefined,
    },
  };
});

jest.mock('../hooks/useMapLayers');

const mockUseMapLayers = jest.mocked(
  jest.requireMock<typeof import('../hooks/useMapLayers')>('../hooks/useMapLayers').useMapLayers,
);

beforeEach(() => {
  useSensorsStore.getState().clearSensors();
  mockUseMapLayers.mockReturnValue({
    filteredStyle: nauticalStyle,
    isLoading: false,
  });
});

describe('MapView', () => {
  it('renders without crashing', () => {
    render(<MapView />);

    expect(screen.getByTestId('maplibre-mapview')).toBeTruthy();
  });

  it('passes filteredStyle (not raw style) to MapLibreGL', () => {
    render(<MapView />);

    const mapView = screen.getByTestId('maplibre-mapview');

    expect(typeof mapView.props.mapStyle).toBe('object');
    expect(mapView.props.mapStyle.version).toBe(8);
    expect(mapView.props.mapStyle.name).toBe('Skipr Nautical');
  });

  it('preserves all gesture and interaction props', () => {
    render(<MapView />);

    const mapView = screen.getByTestId('maplibre-mapview');

    expect(mapView.props.zoomEnabled).toBe(true);
    expect(mapView.props.scrollEnabled).toBe(true);
    expect(mapView.props.rotateEnabled).toBe(true);
    expect(mapView.props.pitchEnabled).toBe(false);
    expect(mapView.props.compassEnabled).toBe(false);
    expect(mapView.props.attributionEnabled).toBe(true);
    expect(mapView.props.logoEnabled).toBe(false);
  });

  it('renders a Camera child with correct settings', () => {
    render(<MapView />);

    const camera = screen.getByTestId('maplibre-camera');

    expect(camera.props.minZoomLevel).toBe(MIN_ZOOM_LEVEL);
    expect(camera.props.maxZoomLevel).toBe(MAX_ZOOM_LEVEL);
    expect(camera.props.defaultSettings).toEqual({
      centerCoordinate: DEFAULT_CENTER_COORDINATE,
      zoomLevel: DEFAULT_ZOOM_LEVEL,
    });
  });

  it('renders LayerToggle', () => {
    render(<MapView />);

    expect(screen.getByTestId('layer-toggle-button')).toBeTruthy();
  });

  it('renders CompassButton', () => {
    render(<MapView />);

    expect(screen.getByTestId('compass-button')).toBeTruthy();
  });

  it('does not set camera heading when heading mode is inactive', () => {
    render(<MapView />);

    const camera = screen.getByTestId('maplibre-camera');
    expect(camera.props.heading).toBeUndefined();
  });

  it('sets camera heading when heading mode is activated', () => {
    useSensorsStore.setState({ heading: 45 });

    render(<MapView />);

    act(() => {
      fireEvent.press(screen.getByTestId('compass-button'));
    });

    const camera = screen.getByTestId('maplibre-camera');
    expect(camera.props.heading).toBe(45);
    expect(camera.props.animationMode).toBe('easeTo');
    expect(camera.props.animationDuration).toBe(300);
  });

  it('resets camera heading to 0 when heading mode is deactivated', () => {
    useSensorsStore.setState({ heading: 90 });

    render(<MapView />);

    // Activate heading mode
    act(() => {
      fireEvent.press(screen.getByTestId('compass-button'));
    });

    // Deactivate heading mode
    act(() => {
      fireEvent.press(screen.getByTestId('compass-button'));
    });

    const camera = screen.getByTestId('maplibre-camera');
    expect(camera.props.heading).toBe(0);
  });

  it('shows a loading placeholder while style is loading', () => {
    mockUseMapLayers.mockReturnValue({
      filteredStyle: nauticalStyle,
      isLoading: true,
    });

    render(<MapView />);

    const placeholder = screen.getByTestId('map-loading-placeholder');
    expect(placeholder.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: NAUTICAL_LOADING_BG })]),
    );
    expect(screen.queryByTestId('maplibre-mapview')).toBeNull();
  });
});
