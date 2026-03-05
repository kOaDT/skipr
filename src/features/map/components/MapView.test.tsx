import { render, screen } from '@testing-library/react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
  NAUTICAL_LOADING_BG,
} from '@/constants';

import { MapView } from './MapView';

const mockUseMapStyle = jest.mocked(
  jest.requireMock<typeof import('../hooks/useMapStyle')>('../hooks/useMapStyle').useMapStyle,
);

const nauticalStyle = require('../../../../assets/map-styles/nautical.json');

jest.mock('../hooks/useMapStyle');

beforeEach(() => {
  mockUseMapStyle.mockReturnValue({
    mapStyle: nauticalStyle,
    isLoading: false,
    error: null,
  });
});

describe('MapView', () => {
  it('renders without crashing', () => {
    render(<MapView />);

    expect(screen.getByTestId('maplibre-mapview')).toBeTruthy();
  });

  it('renders MapLibreGL.MapView with nautical style object (not URL)', () => {
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
    expect(mapView.props.compassEnabled).toBe(true);
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

  it('shows a loading placeholder while style is loading', () => {
    mockUseMapStyle.mockReturnValue({
      mapStyle: nauticalStyle,
      isLoading: true,
      error: null,
    });

    render(<MapView />);

    const placeholder = screen.getByTestId('map-loading-placeholder');
    expect(placeholder.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: NAUTICAL_LOADING_BG })]),
    );
    expect(screen.queryByTestId('maplibre-mapview')).toBeNull();
  });
});
