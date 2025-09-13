import { describe, test, expect } from '@jest/globals';
import {
  calculateDistance,
  formatDistance,
  isWithinRadius,
  coordinatesToLocation,
  locationToCoordinates,
  getBoundingBox,
  isGeolocationSupported
} from '@/lib/utils/geospatial';
import type { Coordinates } from '@/types/search';

describe('Geospatial Utilities', () => {
  const bogotaCoords: Coordinates = { latitude: 4.6097, longitude: -74.0817 };
  const medellinCoords: Coordinates = { latitude: 6.2442, longitude: -75.5812 };

  test('should calculate distance between two points', () => {
    // Distance from Bogotá to Medellín (approximately 240-250 km)
    const distance = calculateDistance(bogotaCoords, medellinCoords);
    expect(distance).toBeCloseTo(246, 0); // ~246 km
  });

  test('should format distance correctly', () => {
    expect(formatDistance(0.5)).toBe('500m');
    expect(formatDistance(1.2)).toBe('1.2km');
    expect(formatDistance(10.5)).toBe('11km');
  });

  test('should check if point is within radius', () => {
    const nearbyPoint: Coordinates = { latitude: 4.61, longitude: -74.08 };
    const farPoint: Coordinates = { latitude: 6.24, longitude: -75.58 };

    expect(isWithinRadius(bogotaCoords, nearbyPoint, 5)).toBe(true);
    expect(isWithinRadius(bogotaCoords, farPoint, 5)).toBe(false);
  });

  test('should convert coordinates to GeoJSON location format', () => {
    const location = coordinatesToLocation(bogotaCoords);
    expect(location).toEqual({
      type: 'Point',
      coordinates: [-74.0817, 4.6097] // [lng, lat]
    });
  });

  test('should convert GeoJSON location to coordinates', () => {
    const location = {
      type: 'Point' as const,
      coordinates: [-74.0817, 4.6097] as [number, number]
    };
    const coords = locationToCoordinates(location);
    expect(coords).toEqual(bogotaCoords);
  });

  test('should calculate bounding box correctly', () => {
    const bbox = getBoundingBox(bogotaCoords, 10); // 10km radius
    expect(bbox.northeast.latitude).toBeGreaterThan(bogotaCoords.latitude);
    expect(bbox.northeast.longitude).toBeGreaterThan(bogotaCoords.longitude);
    expect(bbox.southwest.latitude).toBeLessThan(bogotaCoords.latitude);
    expect(bbox.southwest.longitude).toBeLessThan(bogotaCoords.longitude);
  });

  test('should check geolocation support', () => {
    // In jest environment, navigator.geolocation is not available by default
    const isSupported = isGeolocationSupported();
    expect(typeof isSupported).toBe('boolean');
  });
});