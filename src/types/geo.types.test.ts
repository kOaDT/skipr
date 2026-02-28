import type { Coordinates, BoundingBox, Zone } from './geo.types';

describe('geo.types', () => {
  it('should define Coordinates type correctly', () => {
    const coords: Coordinates = { latitude: 48.8566, longitude: 2.3522 };
    expect(coords.latitude).toBe(48.8566);
    expect(coords.longitude).toBe(2.3522);
  });

  it('should define BoundingBox type correctly', () => {
    const bbox: BoundingBox = { west: -5, south: 42, east: 10, north: 51 };
    expect(bbox.west).toBe(-5);
    expect(bbox.south).toBe(42);
    expect(bbox.east).toBe(10);
    expect(bbox.north).toBe(51);
  });

  it('should define Zone type correctly', () => {
    const zone: Zone = {
      id: 'zone-1',
      name: 'Brittany Coast',
      bounds: { west: -5, south: 47, east: -1, north: 49 },
      downloadDate: '2026-02-28T00:00:00Z',
      dataVersion: '1.0.0',
      dataSourceDate: '2026-02-28T00:00:00Z',
      sizeBytes: 50_000_000,
      updateAvailable: false,
    };
    expect(zone.id).toBe('zone-1');
    expect(zone.name).toBe('Brittany Coast');
    expect(zone.sizeBytes).toBe(50_000_000);
  });
});
