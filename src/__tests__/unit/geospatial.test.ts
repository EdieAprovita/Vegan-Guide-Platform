import { describe, test, expect } from "@jest/globals";
import {
  calculateDistance,
  calculateDistanceBetweenPoints,
  formatDistance,
  isWithinRadius,
  coordsToGeoJSON,
  geoJSONToCoords,
  coordinatesToLocation,
  locationToCoordinates,
  getBoundingBox,
  getBounds,
  isGeolocationSupported,
  toStandardCoords,
  toSearchCoords,
} from "@/lib/utils/geospatial";
import type { Coordinates as SearchCoords } from "@/types/search";
import type { Coordinates } from "@/lib/utils/geospatial";

describe("Geospatial Utilities", () => {
  const bogotaCoords: Coordinates = { lat: 4.6097, lng: -74.0817 };
  const medellinCoords: Coordinates = { lat: 6.2442, lng: -75.5812 };
  const bogotaSearchCoords: SearchCoords = { latitude: 4.6097, longitude: -74.0817 };
  const medellinSearchCoords: SearchCoords = { latitude: 6.2442, longitude: -75.5812 };

  test("should calculate distance between two points", () => {
    // Distance from Bogotá to Medellín (approximately 240-250 km)
    const distance = calculateDistance(4.6097, -74.0817, 6.2442, -75.5812);
    expect(distance).toBeCloseTo(246, 0); // ~246 km
  });

  test("should calculate distance between coordinate objects", () => {
    const distance = calculateDistanceBetweenPoints(bogotaCoords, medellinCoords);
    expect(distance).toBeCloseTo(246, 0); // ~246 km
  });

  test("should format distance correctly", () => {
    expect(formatDistance(0.5)).toBe("500m");
    expect(formatDistance(1.2)).toBe("1.2km");
    expect(formatDistance(10.5)).toBe("10.5km");
  });

  test("should check if point is within radius", () => {
    const nearbyPoint: Coordinates = { lat: 4.61, lng: -74.08 };
    const farPoint: Coordinates = { lat: 6.24, lng: -75.58 };

    expect(isWithinRadius(bogotaCoords, nearbyPoint, 5)).toBe(true);
    expect(isWithinRadius(bogotaCoords, farPoint, 500)).toBe(true); // Far point should be within 500km
  });

  test("should convert coordinates to GeoJSON format", () => {
    const geoJSON = coordsToGeoJSON(4.6097, -74.0817);
    expect(geoJSON).toEqual({
      type: "Point",
      coordinates: [-74.0817, 4.6097], // [lng, lat]
    });
  });

  test("should convert coordinates to location format (legacy)", () => {
    const location = coordinatesToLocation(bogotaCoords);
    expect(location).toEqual({
      type: "Point",
      coordinates: [-74.0817, 4.6097], // [lng, lat]
    });
  });

  test("should convert GeoJSON to coordinates", () => {
    const geoJSON = {
      type: "Point" as const,
      coordinates: [-74.0817, 4.6097] as [number, number],
    };
    const coords = geoJSONToCoords(geoJSON);
    expect(coords).toEqual(bogotaCoords);
  });

  test("should convert GeoJSON location to coordinates (legacy)", () => {
    const location = {
      type: "Point" as const,
      coordinates: [-74.0817, 4.6097] as [number, number],
    };
    const coords = locationToCoordinates(location);
    expect(coords).toEqual(bogotaCoords);
  });

  test("should calculate bounding box correctly", () => {
    const bbox = getBoundingBox(bogotaCoords, 10); // 10km radius
    expect(bbox.northeast.lat).toBeGreaterThan(bogotaCoords.lat);
    expect(bbox.northeast.lng).toBeGreaterThan(bogotaCoords.lng);
    expect(bbox.southwest.lat).toBeLessThan(bogotaCoords.lat);
    expect(bbox.southwest.lng).toBeLessThan(bogotaCoords.lng);
  });

  test("should get bounds for coordinates array", () => {
    const coords = [bogotaCoords, medellinCoords];
    const bounds = getBounds(coords);

    expect(bounds.north).toBe(Math.max(bogotaCoords.lat, medellinCoords.lat));
    expect(bounds.south).toBe(Math.min(bogotaCoords.lat, medellinCoords.lat));
    expect(bounds.east).toBe(Math.max(bogotaCoords.lng, medellinCoords.lng));
    expect(bounds.west).toBe(Math.min(bogotaCoords.lng, medellinCoords.lng));
  });

  test("should convert between coordinate formats", () => {
    const standardCoords = toStandardCoords(bogotaSearchCoords);
    expect(standardCoords).toEqual(bogotaCoords);

    const searchCoords = toSearchCoords(bogotaCoords);
    expect(searchCoords).toEqual(bogotaSearchCoords);
  });

  test("should check geolocation support", () => {
    // In jest environment, navigator.geolocation is not available by default
    const isSupported = isGeolocationSupported();
    expect(typeof isSupported).toBe("boolean");
  });
});
