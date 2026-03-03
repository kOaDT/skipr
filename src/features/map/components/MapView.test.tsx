import { render, screen } from '@testing-library/react-native';

import {
  DEFAULT_CENTER_COORDINATE,
  DEFAULT_ZOOM_LEVEL,
  MAP_STYLE_URL,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
} from '@/constants';

import { MapView } from './MapView';

describe('MapView', () => {
  it('renders without crashing', () => {
    render(<MapView />);

    expect(screen.getByTestId('maplibre-mapview')).toBeTruthy();
  });

  it('renders MapLibreGL.MapView with correct props', () => {
    render(<MapView />);

    const mapView = screen.getByTestId('maplibre-mapview');

    expect(mapView.props.mapStyle).toBe(MAP_STYLE_URL);
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
});
