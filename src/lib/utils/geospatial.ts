import { Coordinates as SearchCoordinates, Location } from "@/types/search";

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Convert between coordinate formats
 */
export function toStandardCoords(coords: SearchCoordinates): Coordinates {
  return {
    lat: coords.latitude,
    lng: coords.longitude,
  };
}

export function toSearchCoords(coords: Coordinates): SearchCoordinates {
  return {
    latitude: coords.lat,
    longitude: coords.lng,
  };
}

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Enhanced version with multiple coordinate formats support
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Overload for coordinate objects
export function calculateDistanceBetweenPoints(point1: Coordinates, point2: Coordinates): number {
  return calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert coordinates to GeoJSON format
 */
export function coordsToGeoJSON(lat: number, lng: number): GeoJSONPoint {
  return {
    type: "Point",
    coordinates: [lng, lat], // GeoJSON uses [lng, lat]
  };
}

/**
 * Convert GeoJSON to coordinates
 */
export function geoJSONToCoords(geoPoint: GeoJSONPoint): Coordinates {
  return {
    lat: geoPoint.coordinates[1],
    lng: geoPoint.coordinates[0],
  };
}

/**
 * Convert Location type to Coordinates (backward compatibility)
 */
export function locationToCoordinates(location: Location): Coordinates {
  return {
    lng: location.coordinates[0],
    lat: location.coordinates[1],
  };
}

/**
 * Legacy search coordinates support
 */
export function searchCoordsToLocation(coordinates: SearchCoordinates): Location {
  return {
    type: "Point",
    coordinates: [coordinates.longitude, coordinates.latitude],
  };
}

/**
 * Convert Coordinates to Location (GeoJSON format, backward compatibility)
 */
export function coordinatesToLocation(coordinates: Coordinates): Location {
  return {
    type: "Point",
    coordinates: [coordinates.lng, coordinates.lat],
  };
}

/**
 * Check if coordinates are within a certain radius
 */
export function isWithinRadius(center: Coordinates, point: Coordinates, radiusKm: number): boolean {
  const distance = calculateDistanceBetweenPoints(center, point);
  return distance <= radiusKm;
}

/**
 * Get user's current location using browser's Geolocation API - Enhanced version
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Error getting location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Acceso a la ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "La solicitud de ubicación expiró";
            break;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );
  });
}

/**
 * Watch user's location for changes - Enhanced version
 */
export function watchLocation(
  onLocationChange: (coordinates: Coordinates) => void,
  onError: (error: Error) => void
): number {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation is not supported by this browser"));
    return 0;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationChange({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      let errorMessage = "Error watching location";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Acceso a la ubicación denegado";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Información de ubicación no disponible";
          break;
        case error.TIMEOUT:
          errorMessage = "La solicitud de ubicación expiró";
          break;
      }

      onError(new Error(errorMessage));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Format distance for display - Enhanced version
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * Get bounds for a set of coordinates
 */
export function getBounds(coordinates: Coordinates[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  if (coordinates.length === 0) {
    throw new Error("No coordinates provided");
  }

  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

/**
 * Get bounding box around a center point with given radius (backward compatibility)
 */
export function getBoundingBox(
  center: Coordinates,
  radiusKm: number
): {
  northeast: Coordinates;
  southwest: Coordinates;
} {
  // Approximate degrees per kilometer
  const kmPerDegreeLat = 111;
  const kmPerDegreeLon = 111 * Math.cos(toRadians(center.lat));

  const latOffset = radiusKm / kmPerDegreeLat;
  const lonOffset = radiusKm / kmPerDegreeLon;

  return {
    northeast: {
      lat: center.lat + latOffset,
      lng: center.lng + lonOffset,
    },
    southwest: {
      lat: center.lat - latOffset,
      lng: center.lng - lonOffset,
    },
  };
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return "geolocation" in navigator;
}

/**
 * Get permission state for geolocation
 */
export async function getGeolocationPermission(): Promise<PermissionState> {
  if (!navigator.permissions) {
    return "granted"; // Assume granted if permissions API not available
  }

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });
    return permission.state;
  } catch (error) {
    console.warn("Error checking geolocation permission:", error);
    return "granted"; // Fallback
  }
}
